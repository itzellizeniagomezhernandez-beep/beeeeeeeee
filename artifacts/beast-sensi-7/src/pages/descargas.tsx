import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import imgPacksFamosos  from "@assets/B904F514-8B52-4DE3-A1A0-C4D95A29658C_1782378165734.png";
import imgXitAndroid    from "@assets/AD2E4752-911B-46EA-91ED-3C2A1D6E1060_1782113892813.png";
import imgXitIphone     from "@assets/82DE07C7-5D51-4EF6-92E2-B8CABDE3F0A7_1782114063629.png";
import imgProxy         from "@assets/275C19BF-150A-4284-A57A-CC3BB7FFDAE2_1782114196971.png";
import imgOptimizacion  from "@assets/5240705F-8DCC-43AB-95BC-7738266BEB49_1782115776696.png";
import imgProyectos     from "@assets/13485FB2-BB07-47A6-9D8C-0FE0EAA95DA4_1782175055753.png";
import imgHudFamosos    from "@assets/7C310EFA-E93F-47E1-BD8F-A8AEB5142137_1782362930624.png";

const STATIC_BANNERS: Record<string, string> = {
  "packs-famosos":   imgPacksFamosos,
  "xit-android":     imgXitAndroid,
  "xit-iphone":      imgXitIphone,
  "proxy":           imgProxy,
  "optimizacion":    imgOptimizacion,
  "hud-famosos":     imgHudFamosos,
  "proyectos-beast": imgProyectos,
};

const CATALOG_SLUGS: { slug: string; label: string; sub: string }[] = [
  { slug: "packs-famosos",   label: "Packs de Famosos",      sub: "Sensibilidades de grandes jugadores"         },
  { slug: "xit-android",     label: "Xit Android",           sub: "Aimbot · Aimlock · Auto HS · Anti Ban"       },
  { slug: "xit-iphone",      label: "Xit iPhone",            sub: "Aimbot · No Recoil · iOS Optimized"          },
  { slug: "proxy",           label: "Proxy Android & iOS",   sub: "+FPS · -PING · Conexión estable"             },
  { slug: "optimizacion",    label: "Optimización",          sub: "Android & iOS · Máximo desempeño · -LAG"     },
  { slug: "hud-famosos",     label: "HUD de Famosos",        sub: "HUDs exclusivos de los mejores jugadores"    },
  { slug: "proyectos-beast", label: "Proyectos Beast",       sub: "Exclusivo · Secreto · Solo para miembros"    },
];

async function loadDynamicBanners(): Promise<Record<string, string>> {
  const keys = CATALOG_SLUGS.map(c => c.slug.replace(/-/g, "_"));
  const results = await Promise.all(
    keys.map(k => fetch(`/api/settings/catalog_img_${k}`).then(r => r.json()).catch(() => null))
  );
  const map: Record<string, string> = {};
  keys.forEach((k, i) => {
    if (results[i]?.value) map[k.replace(/_/g, "-")] = results[i].value;
  });
  return map;
}

export function Descargas() {
  const [dynBanners, setDynBanners] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDynamicBanners().then(setDynBanners);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[calc(100vh-12rem)]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          DESCARGAS
        </div>
        <h1
          className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider mb-4"
          style={{ textShadow: "0 0 30px rgba(139,92,246,0.5)" }}
        >
          Packs &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Configs</span>
        </h1>
        <p className="text-zinc-500 font-mono text-sm">
          Selecciona una categoría para ver el contenido disponible.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {CATALOG_SLUGS.map(({ slug, label, sub }, index) => {
          const img = dynBanners[slug] || STATIC_BANNERS[slug];
          return (
          <Link
            key={slug}
            href={`/descargas/${slug}`}
            className="group relative overflow-hidden rounded-2xl border border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer block"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(139,92,246,0.35), 0 4px 30px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
            }}
          >
            {img ? (
              <motion.div
                animate={{ y: [0, -6, 0], scale: [1, 1.015, 1] }}
                transition={{ duration: 4 + index * 0.7, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                className="w-full"
              >
                <img
                  src={img}
                  alt={label}
                  className="w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  style={{ display: "block", maxHeight: "380px" }}
                />
              </motion.div>
            ) : (
              <div
                className="w-full flex items-center justify-center"
                style={{
                  minHeight: 180,
                  background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(88,28,220,0.28) 60%, rgba(10,5,30,0.95) 100%)",
                }}
              >
                <Monitor className="w-16 h-16 text-primary/40" />
              </div>
            )}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 py-5"
              style={{
                background: "linear-gradient(to top, rgba(5,3,15,0.95) 0%, rgba(5,3,15,0.6) 60%, transparent 100%)",
              }}
            >
              <div>
                <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-primary mb-0.5 opacity-80">
                  // BEAST SENSI
                </p>
                <h3
                  className="font-display font-black uppercase text-white leading-tight"
                  style={{ fontSize: "clamp(1.1rem, 4vw, 1.6rem)", textShadow: "0 0 20px rgba(139,92,246,0.6)" }}
                >
                  {label}
                </h3>
                <p className="text-[11px] text-zinc-400 tracking-wide mt-0.5 hidden sm:block">{sub}</p>
              </div>
              <div
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-widest uppercase text-white transition-all duration-300 group-hover:gap-3 ml-4"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  boxShadow: "0 0 20px rgba(139,92,246,0.6)",
                }}
              >
                ENTRAR <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ); })}
      </div>
    </div>
  );
}
