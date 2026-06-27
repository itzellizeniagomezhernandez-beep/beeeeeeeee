import { Router } from "express";
import { db, licensesTable, suspiciousAttemptsTable } from "@workspace/db";
import { eq, count, and, desc } from "drizzle-orm";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";

const uploadsDir = path.resolve(process.cwd(), "uploads");
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"));
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Solo se permiten archivos de video"));
  },
});
import {
  AdminLoginBody,
  AdminGenerateLicenseBody,
  AdminRevokeLicenseParams,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "BeastAdmin2025!";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "beast-admin-secret-token-2025";

function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [4, 4, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars[crypto.randomInt(0, chars.length)]
      ).join("")
    )
    .join("-");
}

function formatLicense(l: any) {
  return {
    id: l.id,
    key: l.key,
    duration: l.duration,
    status: l.status,
    username: l.username ?? null,
    deviceInfo: l.deviceInfo ?? null,
    notes: l.notes ?? null,
    createdAt: l.createdAt?.toISOString() ?? null,
    activatedAt: l.activatedAt?.toISOString() ?? null,
    expiresAt: l.expiresAt?.toISOString() ?? null,
  };
}

router.post("/admin/login", (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return res.json({ token: ADMIN_TOKEN, expiresAt });
});

router.get("/admin/licenses", requireAdmin, async (req, res) => {
  const status = req.query.status as string | undefined;
  let licenses;
  if (status) {
    licenses = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.status, status));
  } else {
    licenses = await db.select().from(licensesTable);
  }
  return res.json(licenses.map(formatLicense));
});

router.post("/admin/licenses/generate", requireAdmin, async (req, res) => {
  const parsed = AdminGenerateLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const { duration, quantity } = parsed.data;

  const inserted = [];
  for (let i = 0; i < quantity; i++) {
    let key = generateKey();
    let attempts = 0;
    while (attempts < 5) {
      try {
        const [row] = await db
          .insert(licensesTable)
          .values({ key, duration, status: "active" })
          .returning();
        inserted.push(formatLicense(row));
        break;
      } catch {
        key = generateKey();
        attempts++;
      }
    }
  }

  return res.status(201).json(inserted);
});

router.post("/admin/licenses/:id/revoke", requireAdmin, async (req, res) => {
  const parsed = AdminRevokeLicenseParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "ID inválido" });
  }
  const { id } = parsed.data;

  const [license] = await db
    .select()
    .from(licensesTable)
    .where(eq(licensesTable.id, id));

  if (!license) {
    return res.status(404).json({ error: "Licencia no encontrada" });
  }

  const [updated] = await db
    .update(licensesTable)
    .set({ status: "revoked" })
    .where(eq(licensesTable.id, id))
    .returning();

  return res.json(formatLicense(updated));
});

router.post("/admin/licenses/:id/reset", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [updated] = await db
    .update(licensesTable)
    .set({ status: "active", username: null, deviceInfo: null, activatedAt: null, expiresAt: null })
    .where(eq(licensesTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Licencia no encontrada" });
  return res.json(formatLicense(updated));
});

router.patch("/admin/licenses/:id/notes", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const { notes } = req.body;
  const [updated] = await db
    .update(licensesTable)
    .set({ notes: notes ?? null })
    .where(eq(licensesTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ error: "Licencia no encontrada" });
  return res.json(formatLicense(updated));
});

router.get("/admin/suspicious-attempts", requireAdmin, async (req, res) => {
  const attempts = await db
    .select()
    .from(suspiciousAttemptsTable)
    .orderBy(desc(suspiciousAttemptsTable.createdAt))
    .limit(100);
  return res.json({ attempts });
});

router.delete("/admin/licenses/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const [deleted] = await db.delete(licensesTable).where(eq(licensesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "Licencia no encontrada" });
  return res.json({ ok: true });
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const all = await db.select().from(licensesTable);

  const total = all.length;
  const active = all.filter((l) => l.status === "active").length;
  const used = all.filter((l) => l.status === "used").length;
  const expired = all.filter((l) => {
    if (l.status !== "used" || !l.expiresAt) return false;
    return new Date() > l.expiresAt;
  }).length;
  const revoked = all.filter((l) => l.status === "revoked").length;

  const byDuration = {
    "1day": all.filter((l) => l.duration === "1day").length,
    "7days": all.filter((l) => l.duration === "7days").length,
    "30days": all.filter((l) => l.duration === "30days").length,
    permanent: all.filter((l) => l.duration === "permanent").length,
  };

  return res.json({ total, active, used, expired, revoked, byDuration });
});

router.get("/admin/access-logs", requireAdmin, async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT id, license_key, device_id, action, created_at FROM access_logs ORDER BY created_at DESC LIMIT 200`
    );
    return res.json({ logs: result.rows });
  } catch {
    return res.json({ logs: [] });
  }
});

router.post("/admin/upload", requireAdmin, (req: any, res: any) => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? "Error al subir imagen" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }
    const url = `/api/uploads/${req.file.filename}`;
    return res.json({ url });
  });
});

router.post("/admin/upload-video", requireAdmin, (req: any, res: any) => {
  uploadVideo.single("video")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message ?? "Error al subir video" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo de video" });
    }
    const url = `/api/uploads/${req.file.filename}`;
    return res.json({ url });
  });
});

export default router;
