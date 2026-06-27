import { Router } from "express";
import { db, settingsTable, ratingsTable, sessionsTable } from "@workspace/db";
import { eq, avg, count, sql, gt } from "drizzle-orm";

const router = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "beast-admin-secret-token-2025";
function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "No autorizado" });
  next();
}

const SENSI_KEY = "sensi_total_generated";
const MODIF_KEY = "modif_total_generated";

router.post("/stats/sensi-track", async (_req, res) => {
  await db
    .insert(settingsTable)
    .values({ key: SENSI_KEY, value: "1" })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: sql`(CAST(${settingsTable.value} AS INTEGER) + 1)::TEXT` },
    });
  return res.json({ ok: true });
});

router.get("/stats/sensi-count", async (_req, res) => {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, SENSI_KEY));
  return res.json({ count: parseInt(row?.value ?? "0") });
});

router.post("/stats/modif-track", async (_req, res) => {
  await db
    .insert(settingsTable)
    .values({ key: MODIF_KEY, value: "1" })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: sql`(CAST(${settingsTable.value} AS INTEGER) + 1)::TEXT` },
    });
  return res.json({ ok: true });
});

router.get("/stats/modif-count", async (_req, res) => {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, MODIF_KEY));
  return res.json({ count: parseInt(row?.value ?? "0") });
});

router.post("/stats/ping", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId requerido" });
  }
  await db
    .insert(sessionsTable)
    .values({ sessionId, lastSeen: new Date() })
    .onConflictDoUpdate({
      target: sessionsTable.sessionId,
      set: { lastSeen: new Date() },
    });
  return res.json({ ok: true });
});

router.get("/stats/online-count", async (_req, res) => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const result = await db
    .select({ count: count() })
    .from(sessionsTable)
    .where(gt(sessionsTable.lastSeen, twoMinutesAgo));
  return res.json({ count: result[0]?.count ?? 0 });
});

router.post("/ratings", async (req, res) => {
  const { stars, comment, page } = req.body;
  if (!stars || stars < 1 || stars > 5) return res.status(400).json({ error: "Estrellas inválidas (1-5)" });
  const [row] = await db
    .insert(ratingsTable)
    .values({ stars: Number(stars), comment: comment ?? null, page: page ?? "general" })
    .returning();
  return res.status(201).json(row);
});

router.get("/admin/ratings-summary", requireAdmin, async (_req, res) => {
  const all = await db.select().from(ratingsTable);
  if (!all.length) return res.json({ total: 0, average: 0, distribution: {} });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of all) {
    distribution[r.stars] = (distribution[r.stars] ?? 0) + 1;
    sum += r.stars;
  }
  const average = Math.round((sum / all.length) * 10) / 10;

  const recent = all
    .filter(r => r.comment)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return res.json({ total: all.length, average, distribution, recent });
});

export default router;
