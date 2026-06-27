import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Readable } from "stream";

const router = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "beast-admin-secret-token-2025";

function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "No autorizado" });
  next();
}

router.get("/settings/:key", async (req, res) => {
  const { key } = req.params;
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  if (!row) return res.json({ key, value: null });
  return res.json(row);
});

router.post("/admin/settings", requireAdmin, async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: "key y value son requeridos" });
  await db
    .insert(settingsTable)
    .values({ key, value: String(value) })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value: String(value) } });
  return res.json({ key, value });
});

function toDirectAudioUrl(url: string): string {
  // Google Drive: /file/d/ID or ?id=ID
  const gdFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const gdIdMatch = url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = (gdFileMatch?.[1] ?? gdIdMatch?.[1]);
  if (fileId) {
    // Use drive.usercontent.google.com which returns the file directly
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t&authuser=0`;
  }
  return url;
}

// Server-side music proxy — avoids CORS issues with Google Drive
router.get("/music/stream", async (req, res) => {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "music_url"));
  if (!row?.value) return res.status(404).end();

  const url = toDirectAudioUrl(row.value);

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "audio/*,*/*;q=0.9",
        "Accept-Encoding": "identity",
        ...(req.headers["range"] ? { Range: req.headers["range"] as string } : {}),
      },
      redirect: "follow",
    });

    // If upstream returns HTML (Google confirmation page), reject it
    const ct = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).end();
    }
    if (ct.includes("text/html")) {
      return res.status(502).json({ error: "El link de Google Drive no es público o requiere confirmar descarga. Asegúrate de que el archivo esté compartido como 'Cualquiera con el enlace'." });
    }

    res.setHeader("Content-Type", ct || "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (upstream.headers.get("content-length")) {
      res.setHeader("Content-Length", upstream.headers.get("content-length")!);
    }
    if (upstream.headers.get("content-range")) {
      res.setHeader("Content-Range", upstream.headers.get("content-range")!);
      res.status(206);
    } else {
      res.status(200);
    }

    if (!upstream.body) return res.end();
    Readable.fromWeb(upstream.body as any).pipe(res);
  } catch (err) {
    res.status(500).end();
  }
});

export default router;
