import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Crosshair, User, ShieldCheck, Gamepad2, ArrowRight, Clock, ChevronRight, Wrench, Sliders, Monitor, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import imgPacksFamosos  from "@assets/B904F514-8B52-4DE3-A1A0-C4D95A29658C_1782378165734.png";
import imgXitAndroid    from "@assets/AD2E4752-911B-46EA-91ED-3C2A1D6E1060_1782113892813.png";
import imgXitIphone     from "@assets/82DE07C7-5D51-4EF6-92E2-B8CABDE3F0A7_1782114063629.png";
import imgProxy         from "@assets/275C19BF-150A-4284-A57A-CC3BB7FFDAE2_1782114196971.png";
import imgOptimizacion  from "@assets/5240705F-8DCC-43AB-95BC-7738266BEB49_1782115776696.png";
import imgProyectos     from "@assets/13485FB2-BB07-47A6-9D8C-0FE0EAA95DA4_1782175055753.png";
import imgHudFamosos    from "@assets/7C310EFA-E93F-47E1-BD8F-A8AEB5142137_1782373347934.png";

const CATALOGS = [
  { slug: "packs-famosos",   label: "Packs de Famosos",    sub: "Sensibilidades de grandes jugadores",      img: imgPacksFamosos  },
  { slug: "xit-android",     label: "Xit Android",         sub: "Aimbot · Aimlock · Auto HS · Anti Ban",    img: imgXitAndroid    },
  { slug: "xit-iphone",      label: "Xit iPhone",          sub: "Aimbot · No Recoil · iOS Optimized",       img: imgXitIphone     },
  { slug: "proxy",           label: "Proxy Android & iOS", sub: "+FPS · -PING · Conexión estable",          img: imgProxy         },
  { slug: "optimizacion",    label: "Optimización",        sub: "Android & iOS · Máximo desempeño",         img: imgOptimizacion  },
  { slug: "hud-famosos",     label: "HUD de Famosos",      sub: "HUDs exclusivos de los mejores jugadores", img: imgHudFamosos    },
  { slug: "proyectos-beast", label: "Proyectos Beast",     sub: "Exclusivo · Secreto · Solo miembros",      img: imgProyectos     },
];

export function VipDashboard() {
  const [username, setUsername] = useState("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [expiryStr, setExpiryStr] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("beast-username");
    setUsername(user ? user.toUpperCase() : "VIP");
    const exp = localStorage.getItem("beast-key-expiry");
    if (exp) {
      const d = new Date(exp);
      setExpiryStr(d.toLocaleDateString("es-ES"));
      setDaysLeft(Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))));
    }
  }, []);

  const { data: tipData } = useQuery({
    queryKey: ["settings", "tip_of_day"],
    queryFn: async () => {
      const res = await fetch("/api/settings/tip_of_day");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 5 * 60_000,
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          BIENVENIDO, {username}
        </h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider">
          Panel de Control Exclusivo
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-[rgba(255,255,255,0.03)] border-primary/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <ShieldCheck className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
              <h2 className="font-display font-bold tracking-widest uppercase text-xl">
                ACCESO VIP ACTIVO
              </h2>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Tu cuenta tiene acceso completo a todas las sensibilidades premium, macros, archivos y configuraciones exclusivas.
            </p>
            <div className="flex flex-wrap gap-3">
              {expiryStr && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm font-mono text-primary">
                  Válido hasta: {expiryStr}
                </div>
              )}
              {daysLeft !== null && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-mono font-bold ${
                  daysLeft <= 3 ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : daysLeft <= 7 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-green-500/10 border-green-500/30 text-green-400"
                }`}>
                  <Clock className="w-4 h-4" />
                  {daysLeft === 0 ? "Expira hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                </div>
              )}
              {!expiryStr && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm font-mono text-primary">
                  ♾ Acceso Permanente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(255,255,255,0.02)] border-white/5 backdrop-blur-md">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Gamepad2 className="w-5 h-5" />
              <h3 className="font-display font-bold tracking-widest uppercase text-sm">Tip del Día</h3>
            </div>
            <p className="text-sm text-zinc-300 italic flex-1 border-l-2 border-primary/50 pl-4 py-2">
              {tipData?.value
                ? `"${tipData.value}"`
                : '"Para dominar la escopeta, ajusta la Cámara Libre a un valor bajo. Te dará el milisegundo extra necesario para el flick shot perfecto."'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Sensibilidades" value="6+" suffix="Tiers" />
        <StatCard title="Packs VIP" value="12+" suffix="Archivos" />
        <StatCard title="Configs" value="5" suffix="Exclusivas" />
        <StatCard title="Updates" value="Semanal" suffix="Garantizado" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
        <QuickLinkCard 
          href="/vip/sensitivities" 
          icon={Crosshair} 
          title="Sensibilidades VIP" 
          desc="Configs perfectas por gama de dispositivo."
        />
        <QuickLinkCard 
          href="/vip/modificacion" 
          icon={Wrench} 
          title="Generar Modificación" 
          desc="Modificación interna personalizada."
        />
        <QuickLinkCard 
          href="/boton" 
          icon={Sliders} 
          title="Botón Perfecto" 
          desc="Crea tu configuración de botones ideal."
        />
        <QuickLinkCard 
          href="/vip/headtrick" 
          icon={Target} 
          title="Headtrick" 
          desc="Configuraciones headtrick VIP exclusivas."
        />
        <QuickLinkCard 
          href="/vip/hud" 
          icon={Monitor} 
          title="HUD de Famosos" 
          desc="HUDs exclusivos de los mejores jugadores."
        />
        <QuickLinkCard 
          href="/vip/profile" 
          icon={User} 
          title="Tu Perfil" 
          desc="Gestiona tu dispositivo y licencia."
        />
      </div>

      {/* Catálogos de descarga */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center px-3 py-1 mb-2 text-[10px] font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10">
              DESCARGAS
            </div>
            <h2 className="text-2xl font-display font-black uppercase tracking-wider text-white">
              Packs &amp; <span className="text-primary">Configs</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {CATALOGS.map(({ slug, label, sub, img }, index) => (
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
              <motion.div
                animate={{ y: [0, -5, 0], scale: [1, 1.012, 1] }}
                transition={{ duration: 4 + index * 0.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                className="w-full"
              >
                <img
                  src={img}
                  alt={label}
                  className="w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  style={{ display: "block", minHeight: "220px", maxHeight: "500px" }}
                />
              </motion.div>
              <div
                className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 py-5"
                style={{ background: "linear-gradient(to top, rgba(5,3,15,0.95) 0%, rgba(5,3,15,0.6) 60%, transparent 100%)" }}
              >
                <div>
                  <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                    {label}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">{sub}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/80 hover:bg-primary text-white text-xs font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                  Ver <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix }: { title: string; value: string; suffix: string }) {
  return (
    <Card className="bg-[rgba(255,255,255,0.02)] border-white/10 backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-colors">
      <CardContent className="p-5 flex flex-col items-center text-center">
        <div className="text-3xl font-display font-black text-white group-hover:text-primary transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-1">
          {value}
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className="text-[10px] text-zinc-600 uppercase font-mono">{suffix}</p>
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({ href, icon: Icon, title, desc }: { href: string; icon: any; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="bg-[rgba(255,255,255,0.03)] border-primary/20 backdrop-blur-sm h-full group hover:bg-[rgba(139,92,246,0.05)] hover:border-primary/50 transition-all cursor-pointer shadow-[0_0_0_rgba(139,92,246,0)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold uppercase tracking-wider text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{desc}</p>
          <div className="flex items-center text-xs font-bold text-primary uppercase tracking-widest mt-auto">
            Acceder <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
