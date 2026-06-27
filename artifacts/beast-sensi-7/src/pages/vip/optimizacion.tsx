import { useState } from "react";
import { Shield, Zap } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import imgOpt from "@assets/5240705F-8DCC-43AB-95BC-7738266BEB49_1782114712432.png";

const WA_LINK = "https://wa.me/526462676766?text=Hola%2C%20quiero%20comprar%20acceso%20VIP%20a%20Beast%20Sensi%207%20%E2%80%94%20Optimizaci%C3%B3n";

type Opt = { id: string; icon: string; title: string; desc: string };

const OPTIONS: Opt[] = [
  { id: "fps120",      icon: "🎮", title: "120 FPS",          desc: "Desbloquear 120FPS estable" },
  { id: "cache",       icon: "🧹", title: "LIBERAR CACHÉ",    desc: "Limpia todo el caché del sistema" },
  { id: "gpu",         icon: "🖥️", title: "GPU TURBO",        desc: "Acelera el rendimiento gráfico" },
  { id: "ram",         icon: "💾", title: "OPTIMIZAR RAM",    desc: "Libera memoria RAM al instante" },
  { id: "rendimiento", icon: "🚀", title: "MODO RENDIMIENTO", desc: "CPU Boost + máximo desempeño" },
  { id: "ping",        icon: "📶", title: "PING BOOST",       desc: "Reduce tu ping en línea" },
  { id: "antilag",     icon: "🛡️", title: "ANTI LAG",         desc: "Elimina caídas de FPS" },
  { id: "booster",     icon: "🎯", title: "GAME BOOSTER",     desc: "Optimiza tu dispositivo completo" },
];

type Phase = "menu" | "loading" | "done";

/* ── Hero banner (shown always, even sin VIP) ───────────────── */
function OptHero() {
  return (
    <div className="relative w-full overflow-hidden" style={{ maxHeight: "480px" }}>
      <img
        src={imgOpt}
        alt="Optimización Android & iOS"
        className="w-full object-cover object-top"
        style={{ display: "block", maxHeight: "480px" }}
      />
      {/* gradient overlay bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,3,15,0.15) 0%, rgba(5,3,15,0.4) 60%, rgba(5,3,15,0.97) 100%)",
        }}
      />
      {/* badge top-left */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
          <Zap className="w-3 h-3" /> Beast FPS Boost
        </span>
      </div>
    </div>
  );
}

export function Optimizacion() {
  const isVip = typeof window !== "undefined" && localStorage.getItem("beast-access") === "vip";

  const [active, setActive] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>("menu");
  const [loadPct, setLoadPct] = useState(0);
  const [loadMsg, setLoadMsg] = useState("");

  const MSGS = [
    "Liberando memoria RAM...",
    "GPU Turbo activado...",
    "Limpiando caché del sistema...",
    "Aplicando 120 FPS...",
    "Reduciendo ping...",
    "Activando Anti Lag...",
    "Boost activado ✓",
  ];

  const anyActive = Object.values(active).some(Boolean);
  const toggle = (id: string) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  const handleBoost = () => {
    if (!anyActive) return;
    setPhase("loading");
    setLoadPct(0);
    setLoadMsg(MSGS[0]);
    let pct = 0;
    let msgIdx = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 14 + 3;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => setPhase("done"), 500);
      }
      const newIdx = Math.min(Math.floor((pct / 100) * MSGS.length), MSGS.length - 1);
      if (newIdx !== msgIdx) { msgIdx = newIdx; setLoadMsg(MSGS[newIdx]); }
      setLoadPct(Math.min(100, Math.round(pct)));
    }, 220);
  };

  /* ── No VIP ── */
  if (!isVip) {
    return (
      <div className="flex flex-col animate-in fade-in duration-500">
        <OptHero />
        <div className="flex flex-col items-center px-6 py-10 text-center space-y-7 max-w-md mx-auto w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
              <Shield className="w-4 h-4" /> Acceso Restringido
            </div>
            <h2 className="text-3xl font-display font-black uppercase tracking-widest text-white mb-3">
              OPTIMIZACIÓN <span className="text-primary">VIP</span>
            </h2>
            <p className="text-zinc-400">
              Esta sección es exclusiva para usuarios VIP. Mejora tus FPS, reduce el lag y optimiza tu dispositivo.
            </p>
          </div>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-xl font-display font-black uppercase tracking-widest text-white text-lg shadow-[0_0_25px_rgba(37,211,102,0.5)] hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg,#25D366,#128C4A)" }}
          >
            <SiWhatsapp className="w-6 h-6" /> Comprar VIP
          </a>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <img
            src={imgOpt}
            alt="Optimizando"
            className="w-52 h-52 object-cover rounded-2xl border-2 border-primary shadow-[0_0_60px_rgba(139,92,246,0.8)]"
            style={{ filter: "brightness(0.85) saturate(1.4)" }}
          />
          <div className="absolute inset-0 rounded-2xl animate-ping border-2 border-primary/40" />
        </div>
        <div className="w-full max-w-xs space-y-3">
          <p className="text-primary font-display font-bold uppercase tracking-widest text-sm">{loadMsg}</p>
          <div className="w-full h-2 bg-black rounded-full border border-primary/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
              style={{ width: `${loadPct}%`, background: "linear-gradient(90deg,#8B5CF6,#22c55e)" }}
            />
          </div>
          <p className="text-2xl font-display font-black text-white">{loadPct}%</p>
          <p className="text-zinc-500 text-xs font-mono">Optimizando tu dispositivo...</p>
        </div>
      </div>
    );
  }

  /* ── Done ── */
  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <img
            src={imgOpt}
            alt="Optimizado"
            className="w-52 h-52 object-cover rounded-2xl border-2 border-green-400 shadow-[0_0_60px_rgba(34,197,94,0.6)]"
          />
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.8)] text-white font-black text-lg">✓</div>
        </div>
        <div>
          <h2 className="text-3xl font-display font-black uppercase tracking-widest text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
            BOOST ACTIVADO
          </h2>
          <p className="text-white font-display uppercase tracking-wider text-lg mb-1">¡Dispositivo Optimizado!</p>
          <p className="text-zinc-400 text-sm">Tu dispositivo está listo para máximo rendimiento.</p>
        </div>
        <button
          onClick={() => { setPhase("menu"); setActive({}); }}
          className="px-8 py-3 rounded-xl font-display font-bold uppercase tracking-widest text-white border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  /* ── Main menu ── */
  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Big hero image */}
      <OptHero />

      {/* Panel */}
      <div className="p-5 md:p-8 max-w-xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl border border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center bg-primary/10 text-2xl">
            ⚡
          </div>
          <div>
            <h1 className="text-2xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
              OPTIMIZACIÓN
            </h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Beast FPS Boost V2.0</p>
          </div>
        </div>

        <div className="space-y-3">
          {OPTIONS.map(opt => {
            const on = !!active[opt.id];
            return (
              <div
                key={opt.id}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  on
                    ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : "bg-[rgba(255,255,255,0.02)] border-white/8 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl transition-colors ${on ? "bg-primary shadow-[0_0_12px_rgba(139,92,246,0.6)]" : "bg-white/5"}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-sm uppercase tracking-wide">{opt.title}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(opt.id)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${on ? "bg-primary shadow-[0_0_10px_rgba(139,92,246,0.7)]" : "bg-zinc-700"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${on ? "left-7" : "left-1"}`} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-primary shadow-[0_0_6px_rgba(139,92,246,0.8)]" : "bg-zinc-600"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${on ? "text-primary" : "text-zinc-600"}`}>
                    {on ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleBoost}
          disabled={!anyActive}
          className="w-full py-4 rounded-xl font-display font-black uppercase tracking-widest text-white text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
          style={{
            background: anyActive
              ? "linear-gradient(135deg,#8B5CF6 0%,#22c55e 100%)"
              : "rgba(139,92,246,0.2)",
            boxShadow: anyActive ? "0 0 25px rgba(139,92,246,0.5)" : "none",
          }}
        >
          <Zap className="w-5 h-5" /> Aplicar Boost
        </button>
        {!anyActive && (
          <p className="text-center text-zinc-600 text-xs font-mono">Activa al menos una opción para continuar</p>
        )}
      </div>
    </div>
  );
}
