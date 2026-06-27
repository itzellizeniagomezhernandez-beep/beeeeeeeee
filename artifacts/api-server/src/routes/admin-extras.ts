import { Router } from "express";
import { db } from "@workspace/db";
import {
  licensesTable,
  deviceBlacklistTable,
  discountCodesTable,
  supportTicketsTable,
  auditLogTable,
  affiliatesTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "beast-admin-secret-token-2025";

function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "No autorizado" });
  next();
}

async function logAudit(action: string, target?: string, detail?: string) {
  try {
    await db.insert(auditLogTable).values({ action, target: target ?? null, detail: detail ?? null });
  } catch {}
}

const router = Router();

// ─── ANALYTICS: license growth by day ───────────────────────────────────────
router.get("/admin/analytics/growth", requireAdmin, async (req, res) => {
  const days = Math.min(parseInt(req.query.days as string) || 30, 90);
  const result = await db.execute(
    sql`SELECT DATE(created_at) as day, COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'used') as used,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'revoked') as revoked
        FROM licenses
        WHERE created_at >= NOW() - INTERVAL '${sql.raw(String(days))} days'
        GROUP BY DATE(created_at)
        ORDER BY day ASC`
  );
  return res.json({ growth: result.rows });
});

router.get("/admin/analytics/downloads-growth", requireAdmin, async (_req, res) => {
  const result = await db.execute(
    sql`SELECT DATE(created_at) as day, COUNT(*) as total
        FROM downloads
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY day ASC`
  );
  return res.json({ growth: result.rows });
});

// ─── BULK LICENSE ACTIONS ────────────────────────────────────────────────────
router.post("/admin/licenses/bulk-action", requireAdmin, async (req, res) => {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "IDs requeridos" });
  if (!["revoke", "delete", "reset"].includes(action)) return res.status(400).json({ error: "Acción inválida" });

  let count = 0;
  for (const id of ids) {
    const numId = Number(id);
    if (isNaN(numId)) continue;
    try {
      if (action === "revoke") {
        await db.update(licensesTable).set({ status: "revoked" }).where(eq(licensesTable.id, numId));
      } else if (action === "delete") {
        await db.delete(licensesTable).where(eq(licensesTable.id, numId));
      } else if (action === "reset") {
        await db.update(licensesTable).set({ status: "active", username: null, deviceInfo: null, activatedAt: null, expiresAt: null }).where(eq(licensesTable.id, numId));
      }
      count++;
    } catch {}
  }
  await logAudit(`bulk_${action}`, "licenses", `${count} licencias`);
  return res.json({ ok: true, count });
});

// ─── CSV EXPORT ──────────────────────────────────────────────────────────────
router.get("/admin/licenses/export-csv", requireAdmin, async (_req, res) => {
  const licenses = await db.select().from(licensesTable).orderBy(desc(licensesTable.createdAt));
  const header = "ID,Key,Duration,Status,Username,Device,Created,Activated,Expires,Notes\n";
  const rows = licenses.map(l => [
    l.id,
    l.key,
    l.duration,
    l.status,
    l.username ?? "",
    l.deviceInfo ?? "",
    l.createdAt?.toISOString() ?? "",
    l.activatedAt?.toISOString() ?? "",
    l.expiresAt?.toISOString() ?? "",
    `"${(l.notes ?? "").replace(/"/g, '""')}"`,
  ].join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="licenses-${Date.now()}.csv"`);
  return res.send(header + rows);
});

// ─── DEVICE BLACKLIST ────────────────────────────────────────────────────────
router.get("/admin/device-blacklist", requireAdmin, async (_req, res) => {
  const list = await db.select().from(deviceBlacklistTable).orderBy(desc(deviceBlacklistTable.createdAt));
  return res.json({ list });
});

router.post("/admin/device-blacklist", requireAdmin, async (req, res) => {
  const { deviceId, reason } = req.body;
  if (!deviceId || typeof deviceId !== "string") return res.status(400).json({ error: "deviceId requerido" });
  try {
    const [row] = await db.insert(deviceBlacklistTable).values({ deviceId: deviceId.trim(), reason: reason ?? null }).returning();
    await logAudit("blacklist_add", deviceId, reason);
    return res.status(201).json(row);
  } catch {
    return res.status(409).json({ error: "Dispositivo ya está bloqueado" });
  }
});

router.delete("/admin/device-blacklist/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [deleted] = await db.delete(deviceBlacklistTable).where(eq(deviceBlacklistTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  await logAudit("blacklist_remove", deleted.deviceId);
  return res.json({ ok: true });
});

// ─── DISCOUNT CODES ──────────────────────────────────────────────────────────
router.get("/admin/discount-codes", requireAdmin, async (_req, res) => {
  const codes = await db.select().from(discountCodesTable).orderBy(desc(discountCodesTable.createdAt));
  return res.json({ codes });
});

router.post("/admin/discount-codes", requireAdmin, async (req, res) => {
  const { code, description, durationGift, maxUses, expiresAt } = req.body;
  const finalCode = (code || crypto.randomBytes(4).toString("hex").toUpperCase()).trim();
  try {
    const [row] = await db.insert(discountCodesTable).values({
      code: finalCode,
      description: description ?? null,
      durationGift: durationGift ?? "7days",
      maxUses: Number(maxUses) || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();
    await logAudit("discount_create", finalCode, durationGift);
    return res.status(201).json(row);
  } catch {
    return res.status(409).json({ error: "Código ya existe" });
  }
});

router.patch("/admin/discount-codes/:id/toggle", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [current] = await db.select().from(discountCodesTable).where(eq(discountCodesTable.id, id));
  if (!current) return res.status(404).json({ error: "No encontrado" });
  const [updated] = await db.update(discountCodesTable).set({ active: !current.active }).where(eq(discountCodesTable.id, id)).returning();
  return res.json(updated);
});

router.delete("/admin/discount-codes/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [deleted] = await db.delete(discountCodesTable).where(eq(discountCodesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  await logAudit("discount_delete", deleted.code);
  return res.json({ ok: true });
});

// ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────
router.get("/admin/support-tickets", requireAdmin, async (_req, res) => {
  const tickets = await db.select().from(supportTicketsTable).orderBy(desc(supportTicketsTable.createdAt));
  return res.json({ tickets });
});

router.patch("/admin/support-tickets/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const { status, adminReply } = req.body;
  const updates: Record<string, any> = {};
  if (status) updates.status = status;
  if (adminReply !== undefined) updates.adminReply = adminReply;
  if (status === "resolved") updates.resolvedAt = new Date();
  const [updated] = await db.update(supportTicketsTable).set(updates).where(eq(supportTicketsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "No encontrado" });
  await logAudit("ticket_update", String(id), status);
  return res.json(updated);
});

router.delete("/admin/support-tickets/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [deleted] = await db.delete(supportTicketsTable).where(eq(supportTicketsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  return res.json({ ok: true });
});

// Public: crear ticket de soporte
router.post("/support-tickets", async (req, res) => {
  const { username, licenseKey, subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ error: "Asunto y mensaje requeridos" });
  const [row] = await db.insert(supportTicketsTable).values({
    username: username ?? null,
    licenseKey: licenseKey ?? null,
    subject: subject.trim(),
    message: message.trim(),
  }).returning();
  return res.status(201).json({ ok: true, id: row.id });
});

// Public: consultar estado de un ticket por ID o licencia
router.get("/support-tickets/lookup", async (req, res) => {
  const { id, licenseKey } = req.query as { id?: string; licenseKey?: string };
  if (!id && !licenseKey) return res.status(400).json({ error: "Proporciona id o licenseKey" });

  let tickets: any[] = [];
  if (id && !isNaN(Number(id))) {
    tickets = await db.select({
      id: supportTicketsTable.id,
      subject: supportTicketsTable.subject,
      status: supportTicketsTable.status,
      adminReply: supportTicketsTable.adminReply,
      createdAt: supportTicketsTable.createdAt,
      resolvedAt: supportTicketsTable.resolvedAt,
    }).from(supportTicketsTable).where(eq(supportTicketsTable.id, Number(id)));
  } else if (licenseKey) {
    tickets = await db.select({
      id: supportTicketsTable.id,
      subject: supportTicketsTable.subject,
      status: supportTicketsTable.status,
      adminReply: supportTicketsTable.adminReply,
      createdAt: supportTicketsTable.createdAt,
      resolvedAt: supportTicketsTable.resolvedAt,
    }).from(supportTicketsTable).where(eq(supportTicketsTable.licenseKey, String(licenseKey).toUpperCase()));
  }

  if (!tickets.length) return res.status(404).json({ error: "No se encontró ningún ticket con esos datos" });
  return res.json({ tickets });
});

// ─── AUDIT LOG ───────────────────────────────────────────────────────────────
router.get("/admin/audit-log", requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const logs = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(limit);
  return res.json({ logs });
});

// ─── AFFILIATES ───────────────────────────────────────────────────────────────
router.get("/admin/affiliates", requireAdmin, async (_req, res) => {
  const list = await db.select().from(affiliatesTable).orderBy(desc(affiliatesTable.createdAt));
  return res.json({ affiliates: list });
});

router.post("/admin/affiliates", requireAdmin, async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  const finalCode = (code || name.toUpperCase().replace(/\s+/g, "") + crypto.randomBytes(2).toString("hex").toUpperCase()).trim();
  try {
    const [row] = await db.insert(affiliatesTable).values({ name: name.trim(), code: finalCode }).returning();
    await logAudit("affiliate_create", finalCode, name);
    return res.status(201).json(row);
  } catch {
    return res.status(409).json({ error: "Código de afiliado ya existe" });
  }
});

router.delete("/admin/affiliates/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [deleted] = await db.delete(affiliatesTable).where(eq(affiliatesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "No encontrado" });
  await logAudit("affiliate_delete", deleted.code);
  return res.json({ ok: true });
});

// Public: registrar uso de afiliado
router.post("/affiliates/:code/track", async (req, res) => {
  const { code } = req.params;
  try {
    await db.update(affiliatesTable)
      .set({ uses: sql`${affiliatesTable.uses} + 1` })
      .where(eq(affiliatesTable.code, code));
    return res.json({ ok: true });
  } catch {
    return res.json({ ok: false });
  }
});

export default router;
