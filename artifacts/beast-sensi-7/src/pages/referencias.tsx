import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Star, CheckCircle2, ZoomIn, X } from "lucide-react";
import imgReferencias from "@assets/6688E0E4-ECA9-4206-A13F-DDEC17492483_1782435852818.png";

interface Testimonio {
  avatar: string;
  name: string;
  stars: number;
  text: string;
  verified: boolean;
}

const DEFAULT_TESTIMONIOS: Testimonio[] = [];

export function Referencias() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const { data: settingData } = useQuery({
    queryKey: ["settings", "referencias_testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/settings/referencias_testimonials");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 60_000,
  });

  const testimonios: Testimonio[] = (() => {
    try {
      const parsed = settingData?.value ? JSON.parse(settingData.value) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TESTIMONIOS;
    } catch {
      return DEFAULT_TESTIMONIOS;
    }
  })();

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxSrc(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/60 rounded-full p-2 transition-colors"
              onClick={() => setLightboxSrc(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={lightboxSrc}
              alt="Referencia completa"
              className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden">
        <img
          src={imgReferencias}
          alt="Referencias Beast Sensi"
          className="w-full object-cover object-top"
          style={{ maxHeight: 520 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(5,3,15,0) 40%, rgba(5,3,15,1) 100%)" }}
        />
      </div>

      <div className="container mx-auto px-4 pb-14 max-w-4xl -mt-8 relative z-10">
        {testimonios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 font-mono text-sm">
              Próximamente se agregarán testimonios reales de nuestra comunidad.
            </p>
          </div>
        ) : (
          <div className="space-y-5 mt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-primary/20" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary px-3">
                LO QUE DICE LA GENTE
              </span>
              <div className="h-px flex-1 bg-primary/20" />
            </div>

            <div className="flex flex-col gap-0">
              {testimonios.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {/* Separador morado entre cards (excepto antes del primero) */}
                  {i > 0 && (
                    <div className="w-full my-4" style={{ height: "3px", background: "linear-gradient(to right, transparent, #7c3aed 20%, #c084fc 50%, #7c3aed 80%, transparent)", boxShadow: "0 0 10px 2px #a855f7" }} />
                  )}

                  <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl overflow-hidden hover:bg-[rgba(255,255,255,0.05)] transition-all">
                    {/* Foto clickeable más pequeña */}
                    {t.avatar && (
                      <div
                        className="w-full overflow-hidden bg-black/40 relative group cursor-zoom-in"
                        onClick={() => setLightboxSrc(t.avatar)}
                      >
                        <img
                          src={t.avatar}
                          alt={`Referencia de ${t.name}`}
                          className="w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          style={{ maxHeight: "180px" }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none";
                          }}
                        />
                        {/* Overlay zoom */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 rounded-full p-2">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        {/* Línea morada inferior de la foto */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                      </div>
                    )}

                  {/* Info del usuario */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src="/beast-logo.png"
                        alt="Beast"
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/40 flex-shrink-0 bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">
                            {t.name}
                          </h3>
                          {t.verified && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" />
                              VERIFICADO
                            </div>
                          )}
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= t.stars ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {t.text && (
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {t.text}
                      </p>
                    )}
                  </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center">
          <p className="text-xs font-mono text-zinc-500 tracking-wider">
            BEAST SENSI 7 · Todas las configuraciones son originales y resultado de investigación propia.
            <br />
            Los testimonios son de usuarios reales de nuestra comunidad.
          </p>
        </div>
      </div>
    </div>
  );
}
