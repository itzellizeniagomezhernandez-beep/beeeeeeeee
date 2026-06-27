import { Router } from "express";
import { db, licensesTable, suspiciousAttemptsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  RedeemLicenseBody,
  CheckLicenseStatusBody,
} from "@workspace/api-zod";

const router = Router();

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

function computeExpiry(duration: string, from: Date): Date | null {
  if (duration === "permanent") return null;
  const d = new Date(from);
  if (duration === "1day") d.setDate(d.getDate() + 1);
  if (duration === "7days") d.setDate(d.getDate() + 7);
  if (duration === "30days") d.setDate(d.getDate() + 30);
  return d;
}

function isExpired(license: { expiresAt: Date | null; status: string }): boolean {
  if (license.status !== "used") return false;
  if (!license.expiresAt) return false;
  return new Date() > license.expiresAt;
}

router.post("/licenses/redeem", async (req, res) => {
  const parsed = RedeemLicenseBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const { key, deviceInfo, username } = parsed.data as any;

  const [license] = await db
    .select()
    .from(licensesTable)
    .where(eq(licensesTable.key, key.toUpperCase().trim()));

  if (!license) {
    return res.status(400).json({ error: "Key no encontrada" });
  }

  if (license.status === "revoked") {
    return res.status(400).json({ error: "Esta licencia ha sido revocada" });
  }

  if (license.status === "used") {
    const expired = isExpired(license);
    if (expired) {
      return res.status(400).json({ error: "Esta licencia ha expirado" });
    }
    // Log suspicious attempt if device is different
    if (deviceInfo && deviceInfo !== license.deviceInfo) {
      try {
        await db.insert(suspiciousAttemptsTable).values({
          key: license.key,
          originalDevice: license.deviceInfo ?? null,
          originalUsername: license.username ?? null,
          attemptDevice: deviceInfo,
          attemptUsername: username || null,
        });
      } catch {}
    }
    return res.status(400).json({ error: "Esta key ya fue utilizada en otro dispositivo. Cada key es de uso único y no puede transferirse." });
  }

  if (license.status !== "active") {
    return res.status(400).json({ error: "Licencia inválida" });
  }

  const now = new Date();
  const expiresAt = computeExpiry(license.duration, now);

  const [updated] = await db
    .update(licensesTable)
    .set({
      status: "used",
      username: username || null,
      deviceInfo,
      activatedAt: now,
      expiresAt,
    })
    .where(eq(licensesTable.id, license.id))
    .returning();

  return res.json({
    key: updated.key,
    status: updated.status,
    duration: updated.duration,
    deviceInfo: updated.deviceInfo,
    activatedAt: updated.activatedAt?.toISOString() ?? null,
    expiresAt: updated.expiresAt?.toISOString() ?? null,
    isVip: true,
  });
});

router.post("/licenses/status", async (req, res) => {
  const parsed = CheckLicenseStatusBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const { key } = parsed.data;

  const [license] = await db
    .select()
    .from(licensesTable)
    .where(eq(licensesTable.key, key.toUpperCase().trim()));

  if (!license) {
    return res.status(404).json({ error: "Key no encontrada" });
  }

  const expired = isExpired(license);
  const effectiveStatus = expired ? "expired" : license.status;

  try {
    await db.execute(
      `INSERT INTO access_logs (license_key, device_id, action) VALUES ($1, $2, $3)`,
      [license.key, parsed.data.key, effectiveStatus === "used" ? "access" : "denied"]
    );
  } catch {}

  return res.json({
    key: license.key,
    status: effectiveStatus,
    duration: license.duration,
    deviceInfo: license.deviceInfo ?? null,
    activatedAt: license.activatedAt?.toISOString() ?? null,
    expiresAt: license.expiresAt?.toISOString() ?? null,
    isVip: effectiveStatus === "used" && !expired,
  });
});

export default router;
