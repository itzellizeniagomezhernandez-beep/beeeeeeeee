import { Router } from "express";
import { db, downloadsTable, catalogViewsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "beast-admin-secret-token-2025";

function requireAdmin(req: any, res: any, next: any) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

function formatDownload(d: any) {
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? null,
    imageUrl: d.imageUrl ?? null,
    fileUrl: d.fileUrl,
    fileUrl2: d.fileUrl2 ?? null,
    category: d.category,
    catalog: d.catalog,
    tier: d.tier,
    downloadCount: d.downloadCount ?? 0,
    active: d.active,
    createdAt: d.createdAt?.toISOString() ?? null,
  };
}

// Public: list downloads with optional ?tier= and/or ?catalog= filters
router.get("/downloads", async (req, res) => {
  const tier = req.query.tier as string | undefined;
  const catalog = req.query.catalog as string | undefined;

  const conditions = [eq(downloadsTable.active, true)];
  if (tier) conditions.push(eq(downloadsTable.tier, tier));
  if (catalog) conditions.push(eq(downloadsTable.catalog, catalog));

  const rows = await db
    .select()
    .from(downloadsTable)
    .where(and(...conditions));

  return res.json(rows.map(formatDownload));
});

// Public: track a download click
router.post("/downloads/:id/track", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  await db
    .update(downloadsTable)
    .set({ downloadCount: sql`${downloadsTable.downloadCount} + 1` })
    .where(eq(downloadsTable.id, id));
  return res.json({ ok: true });
});

// Public: track catalog page view
router.post("/catalog/:catalog/view", async (req, res) => {
  const { catalog } = req.params;
  const valid = ["packs_famosos", "xit_android", "xit_iphone", "proxy", "optimizacion", "proyectos_beast"];
  if (!valid.includes(catalog)) return res.status(400).json({ error: "Catálogo inválido" });

  await db
    .insert(catalogViewsTable)
    .values({ catalog, viewCount: 1 })
    .onConflictDoUpdate({
      target: catalogViewsTable.catalog,
      set: { viewCount: sql`${catalogViewsTable.viewCount} + 1` },
    });
  return res.json({ ok: true });
});

// Admin: get catalog views stats
router.get("/admin/catalog-stats", requireAdmin, async (req, res) => {
  const views = await db.select().from(catalogViewsTable);
  const downloads = await db
    .select()
    .from(downloadsTable)
    .where(eq(downloadsTable.active, true));

  const statsByCatalog = ["packs_famosos", "xit_android", "xit_iphone", "proxy", "optimizacion"].map((cat) => {
    const items = downloads.filter((d) => d.catalog === cat);
    const totalDownloads = items.reduce((acc, d) => acc + (d.downloadCount ?? 0), 0);
    const viewRow = views.find((v) => v.catalog === cat);
    return {
      catalog: cat,
      viewCount: viewRow?.viewCount ?? 0,
      itemCount: items.length,
      totalDownloads,
    };
  });

  const topItems = downloads
    .filter((d) => d.catalog !== "vip")
    .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    .slice(0, 10)
    .map(formatDownload);

  return res.json({ statsByCatalog, topItems });
});

// Admin: create download
router.post("/admin/downloads", requireAdmin, async (req, res) => {
  const { title, description, imageUrl, fileUrl, fileUrl2, category, catalog, tier } = req.body;
  if (!title) {
    return res.status(400).json({ error: "El título es requerido" });
  }
  const [row] = await db
    .insert(downloadsTable)
    .values({
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      fileUrl: fileUrl || null,
      fileUrl2: fileUrl2 || null,
      category: category ?? "pack",
      catalog: catalog ?? "vip",
      tier: tier ?? "all",
    })
    .returning();
  return res.status(201).json(formatDownload(row));
});

// Admin: delete download
router.delete("/admin/downloads/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db
    .select()
    .from(downloadsTable)
    .where(eq(downloadsTable.id, id));
  if (!row) return res.status(404).json({ error: "No encontrado" });
  await db.update(downloadsTable).set({ active: false }).where(eq(downloadsTable.id, id));
  return res.json({ ok: true });
});

export default router;
