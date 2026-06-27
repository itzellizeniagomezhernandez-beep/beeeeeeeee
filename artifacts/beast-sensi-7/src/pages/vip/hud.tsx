import { useState, useEffect } from "react";
import { Monitor, Lock, Download, ExternalLink, FileBox } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

type HudItem = {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileUrl2: string | null;
  tier: string;
  downloadCount: number;
  catalog: string;
};

export function VipHud() {
  const [items, setItems] = useState<HudItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog/hud_famosos/view", { method: "POST" }).catch(() => {});
    fetch("/api/downloads?catalog=hud_famosos")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = async (item: HudItem, url: string) => {
    await fetch(`/api/downloads/${item.id}/track`, { method: "POST" }).catch(() => {});
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="inline-flex items-center px-3 py-1 mb-4 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10">
          VIP EXCLUSIVO
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-wider text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center gap-4">
          <Monitor className="w-10 h-10 text-primary" />
          HUD de Famosos
        </h1>
        <p className="text-zinc-500 mt-3 font-mono text-sm max-w-xl">
          HUDs exclusivos de los mejores jugadores del mundo. Importa su configuración exacta y domina cada partida.
        </p>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3"
      >
        <Monitor className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-white uppercase tracking-wide">¿Qué es el HUD?</p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            El HUD (Heads-Up Display) controla cómo se ven tus botones, mapa y elementos en pantalla durante la partida.
            Importar el HUD de un jugador profesional puede darte una ventaja visual significativa.
          </p>
        </div>
      </motion.div>

      {/* Items */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-20"
        >
          <FileBox className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl uppercase tracking-widest text-zinc-500">
            HUDs próximamente
          </h3>
          <p className="text-sm text-zinc-600 mt-2 max-w-sm mx-auto">
            El administrador está preparando los HUDs de famosos. Vuelve pronto.
          </p>
          <Link href="/vip">
            <button className="mt-6 px-6 py-2.5 rounded-xl border border-primary/40 text-primary font-display font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all">
              Volver al Dashboard
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Card className="bg-[rgba(255,255,255,0.03)] border border-primary/20 hover:border-primary/50 transition-all duration-300 h-full">
                <CardContent className="p-5 flex flex-col h-full gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                      VIP
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

                  <div className="flex flex-col gap-2">
                    {item.fileUrl && (
                      <button
                        onClick={() => handleDownload(item, item.fileUrl!)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white hover:from-purple-500 hover:to-primary hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all font-display font-bold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar HUD
                      </button>
                    )}
                    {item.fileUrl2 && (
                      <button
                        onClick={() => handleDownload(item, item.fileUrl2!)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-400 hover:text-white transition-all font-display font-bold uppercase tracking-widest text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Alternativo
                      </button>
                    )}
                    {!item.fileUrl && !item.fileUrl2 && (
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900/60 text-zinc-600 border border-zinc-800 font-display font-bold uppercase tracking-widest text-xs cursor-not-allowed">
                        Próximamente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
