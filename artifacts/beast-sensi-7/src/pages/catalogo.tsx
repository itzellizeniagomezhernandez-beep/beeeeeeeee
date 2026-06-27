import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Lock, Download, ExternalLink, Crown, ArrowLeft, FileBox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { VipModal } from "@/components/vip-modal";

const CATALOG_META: Record<string, { label: string; desc: string }> = {
  packs_famosos: {
    label: "Packs de Famosos",
    desc: "Sensibilidades exactas de los mejores jugadores.",
  },
  xit_android: {
    label: "Xit Android",
    desc: "Configuraciones Xit optimizadas para Android.",
  },
  xit_iphone: {
    label: "Xit iPhone",
    desc: "Configuraciones Xit optimizadas para iPhone.",
  },
  proxy: {
    label: "Proxy",
    desc: "Configuraciones de proxy para reducir el ping.",
  },
  optimizacion: {
    label: "Optimización",
    desc: "Archivos de optimización para Android e iOS — menos lag, más FPS.",
  },
  proyectos_beast: {
    label: "Proyectos Beast",
    desc: "Proyectos exclusivos y secretos — solo para miembros oficiales.",
  },
  hud_famosos: {
    label: "HUD de Famosos",
    desc: "HUDs exclusivos usados por los mejores jugadores — importa y domina.",
  },
};

const SLUG_TO_CATALOG: Record<string, string> = {
  "packs-famosos": "packs_famosos",
  "xit-android": "xit_android",
  "xit-iphone": "xit_iphone",
  proxy: "proxy",
  optimizacion: "optimizacion",
  "proyectos-beast": "proyectos_beast",
  "hud-famosos": "hud_famosos",
};

type DownloadItem = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  fileUrl2: string | null;
  tier: string;
  downloadCount: number;
  catalog: string;
};

export function Catalogo() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const catalogKey = SLUG_TO_CATALOG[slug];
  const meta = catalogKey ? CATALOG_META[catalogKey] : null;

  const isVip = typeof window !== "undefined" && localStorage.getItem("beast-access") === "vip";
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [vipModal, setVipModal] = useState<{ open: boolean; title?: string }>({ open: false });

  useEffect(() => {
    if (!catalogKey) return;
    setLoading(true);

    // Track page view
    fetch(`/api/catalog/${catalogKey}/view`, { method: "POST" }).catch(() => {});

    fetch(`/api/downloads?catalog=${catalogKey}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [catalogKey]);

  const handleDownload = async (item: DownloadItem, url: string) => {
    if (item.tier === "vip" && !isVip) return;
    await fetch(`/api/downloads/${item.id}/track`, { method: "POST" }).catch(() => {});
    window.open(url, "_blank");
  };

  if (!meta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-zinc-400 font-mono">Catálogo no encontrado.</p>
          <Link href="/descargas" className="text-primary hover:underline mt-4 inline-block">
            ← Volver a Descargas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl min-h-[calc(100vh-12rem)]">
      {/* Back */}
      <Link
        href="/descargas"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary transition-colors mb-8 font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Descargas
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10">
          CATÁLOGO
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          {meta.label}
        </h1>
        <p className="text-zinc-500 mt-2 font-mono text-sm">{meta.desc}</p>
      </div>

      {/* VIP banner */}
      {!isVip && (
        <div className="mb-8 flex items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-zinc-400 font-mono">
              Los items marcados como <span className="text-primary font-bold">SOLO VIP</span> requieren acceso VIP para descargar.
            </p>
          </div>
          <Link
            href="/redeem"
            className="shrink-0 px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary text-xs font-display font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
          >
            Hacerme VIP
          </Link>
        </div>
      )}

      {/* Items */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <FileBox className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl uppercase tracking-widest text-zinc-500">
            Sin contenido aún
          </h3>
          <p className="text-sm text-zinc-600 mt-2">
            El admin aún no ha agregado items a este catálogo.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => {
            const locked = item.tier === "vip" && !isVip;
            const bubbles = item.tier === "vip"
              ? Array.from({ length: 7 }, (_, i) => ({
                  left: `${10 + i * 13}%`,
                  size: 3 + (i % 3),
                  dur: `${2.5 + (i * 0.4)}s`,
                  delay: `${i * 0.45}s`,
                }))
              : [];

            return (
              <div key={item.id} className={item.tier === "vip" ? "relative vip-card-border rounded-xl" : ""}>
              <Card
                className={`bg-[rgba(255,255,255,0.03)] transition-all duration-300 group animate-in fade-in ${item.tier === "vip" ? "border border-yellow-500/30" : "border border-primary/20 hover:border-primary/50"}`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="relative w-full overflow-hidden rounded-t-xl">
                      {/* Aura VIP dorada */}
                      {item.tier === "vip" && (
                        <>
                          <motion.div
                            className="absolute inset-0 z-10 pointer-events-none rounded-t-xl"
                            animate={{ x: ["-70%", "70%", "-70%"] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                            style={{
                              background: "radial-gradient(ellipse 65% 85% at 50% 50%, rgba(251,191,36,0.55) 0%, transparent 70%)",
                              filter: "blur(6px)",
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 z-10 pointer-events-none rounded-t-xl"
                            animate={{ x: ["70%", "-70%", "70%"] }}
                            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                            style={{
                              background: "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(245,158,11,0.45) 0%, transparent 65%)",
                              filter: "blur(8px)",
                            }}
                          />
                          {/* Borde dorado pulsante */}
                          <motion.div
                            className="absolute inset-0 z-10 pointer-events-none rounded-t-xl"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              boxShadow: "inset 0 0 20px rgba(251,191,36,0.55)",
                            }}
                          />
                          {/* Bolitas doradas subiendo */}
                          {bubbles.map((b, i) => (
                            <div
                              key={i}
                              className="absolute bottom-0 rounded-full pointer-events-none z-20"
                              style={{
                                left: b.left,
                                width: b.size,
                                height: b.size,
                                background: "radial-gradient(circle, #fde68a 0%, #f59e0b 70%, transparent 100%)",
                                boxShadow: "0 0 5px 2px rgba(251,191,36,0.65)",
                                animation: `gold-rise ${b.dur} ${b.delay} infinite linear`,
                              }}
                            />
                          ))}
                          {/* Etiqueta 👑 VIP */}
                          <motion.div
                            className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
                            animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)",
                              backgroundSize: "200% 100%",
                              animation: "goldShift 2s linear infinite",
                              boxShadow: "0 0 10px rgba(251,191,36,0.7)",
                            }}
                          >
                            👑 VIP
                          </motion.div>
                        </>
                      )}
                      <motion.div
                        animate={{ y: [0, -5, 0], scale: [1, 1.012, 1] }}
                        transition={{ duration: 4 + idx * 0.6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.4 }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full object-cover object-center"
                          style={{ maxHeight: "180px" }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      </motion.div>
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1 gap-4">
                  {/* Tier badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        locked
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : item.tier === "vip"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          : "bg-green-500/10 text-green-400 border-green-500/30"
                      }`}
                    >
                      {locked ? "Solo VIP" : item.tier === "vip" ? "VIP" : "Gratis"}
                    </span>
                    {item.downloadCount > 0 && (
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {item.downloadCount} descargas
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display font-bold text-base uppercase tracking-wider text-white mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {locked ? (
                    <button
                      onClick={() => setVipModal({ open: true, title: item.title })}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-bold uppercase tracking-widest text-xs text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                      style={{
                        background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)",
                        backgroundSize: "200% 100%",
                        animation: "goldShift 2.5s linear infinite",
                      }}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      👑 Ver con VIP
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {item.fileUrl && (
                        <div className="relative rounded-xl overflow-hidden">
                          {item.tier === "vip" && (
                            <motion.div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              animate={{ x: ["-60%", "60%", "-60%"] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                              style={{
                                background: "radial-gradient(ellipse 55% 80% at 50% 50%, rgba(251,191,36,0.45) 0%, transparent 70%)",
                                filter: "blur(4px)",
                              }}
                            />
                          )}
                          <button
                            onClick={() => handleDownload(item, item.fileUrl!)}
                            className={`relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-black uppercase tracking-widest text-xs ${
                              item.tier === "vip"
                                ? "text-black shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                                : "text-white bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-colors"
                            }`}
                            style={item.tier === "vip" ? { background: "linear-gradient(90deg, #f59e0b, #fde68a, #d97706, #fde68a, #f59e0b)", backgroundSize: "200% 100%", animation: "goldShift 3s linear infinite" } : undefined}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {item.tier === "vip" ? "⭐ Descargar — Opción 1" : "Descargar — Opción 1"}
                          </button>
                        </div>
                      )}
                      {item.fileUrl2 && (
                        <div className="relative rounded-xl overflow-hidden">
                          {item.tier === "vip" && (
                            <motion.div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              animate={{ x: ["60%", "-60%", "60%"] }}
                              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                              style={{
                                background: "radial-gradient(ellipse 55% 80% at 50% 50%, rgba(251,191,36,0.35) 0%, transparent 70%)",
                                filter: "blur(4px)",
                              }}
                            />
                          )}
                          <button
                            onClick={() => handleDownload(item, item.fileUrl2!)}
                            className={`relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-black uppercase tracking-widest text-xs ${
                              item.tier === "vip"
                                ? "text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                                : "text-white bg-primary/70 hover:bg-primary/60 shadow-[0_0_10px_rgba(139,92,246,0.3)] border border-primary/40 transition-colors"
                            }`}
                            style={item.tier === "vip" ? { background: "linear-gradient(90deg, #d97706, #fbbf24, #f59e0b, #fbbf24, #d97706)", backgroundSize: "200% 100%", animation: "goldShift 3.5s linear infinite reverse" } : undefined}
                          >
                            <Download className="w-3.5 h-3.5" />
                            {item.tier === "vip" ? "⭐ Descargar — Opción 2" : "Descargar — Opción 2"}
                          </button>
                        </div>
                      )}
                      {!item.fileUrl && !item.fileUrl2 && (
                        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900/60 text-zinc-600 border border-zinc-800 font-display font-bold uppercase tracking-widest text-xs cursor-not-allowed">
                          Próximamente
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
              </div>
            );
          })}
        </div>
      )}
    <VipModal
      open={vipModal.open}
      onClose={() => setVipModal({ open: false })}
      itemTitle={vipModal.title}
    />
    </div>
  );
}
