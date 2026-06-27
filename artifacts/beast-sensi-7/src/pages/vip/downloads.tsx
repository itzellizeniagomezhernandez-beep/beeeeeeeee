import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileBox, ShieldCheck, Zap } from "lucide-react";
import { useListDownloads, getListDownloadsQueryKey } from "@workspace/api-client-react";

export function VipDownloads() {
  const [filter, setFilter] = useState<string>("all");
  const { data: downloads, isLoading } = useListDownloads({ tier: "vip" });

  const filters = [
    { id: "all", label: "Todo" },
    { id: "pack", label: "Packs" },
    { id: "config", label: "Configs" },
    { id: "macro", label: "Macros / Archivos" },
  ];

  const filteredDownloads = downloads?.filter(d => filter === "all" || d.category === filter) || [];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'pack': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'config': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'macro': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          Centro de Descargas
        </h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider max-w-2xl">
          Archivos premium, regedits y macros exclusivos. 100% seguros y probados.
        </p>
      </header>

      {/* Filter */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-display font-bold text-xs tracking-widest uppercase transition-all border ${
              filter === f.id
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                : "bg-[rgba(255,255,255,0.03)] border-transparent text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : filteredDownloads.length === 0 ? (
        <Card className="bg-[rgba(255,255,255,0.02)] border-dashed border-primary/30 p-12 text-center">
          <FileBox className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl uppercase tracking-widest text-zinc-400">
            No hay archivos
          </h3>
          <p className="text-sm text-zinc-500 mt-2">Próximamente agregaremos más contenido a esta categoría.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDownloads.map((item, idx) => (
            <Card key={item.id} className="bg-[rgba(255,255,255,0.03)] border-white/10 hover:border-primary/50 transition-all flex flex-col animate-in fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </div>
                  <div className="flex gap-1 text-[10px] text-zinc-500 font-mono items-center">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    SEGURO
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 flex-1 line-clamp-3">
                  {item.description || "Archivo premium optimizado para mejorar tu experiencia y rendimiento."}
                </p>

                <div className="flex flex-col gap-2">
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white hover:from-purple-500 hover:to-primary hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all font-display font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                      <Download className="w-4 h-4" />
                      Descargar — Botón 1
                    </a>
                  )}
                  {(item as any).fileUrl2 && (
                    <a
                      href={(item as any).fileUrl2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-600 hover:bg-zinc-700 hover:border-zinc-400 hover:text-white transition-all font-display font-bold uppercase tracking-widest text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Descargar — Botón 2
                    </a>
                  )}
                  {!item.fileUrl && !(item as any).fileUrl2 && (
                    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900/60 text-zinc-600 border border-zinc-800 font-display font-bold uppercase tracking-widest text-sm cursor-not-allowed">
                      Próximamente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
