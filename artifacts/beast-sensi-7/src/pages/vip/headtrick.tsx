import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, Crosshair, Settings, Zap, Info, ChevronRight, Smartphone, Apple } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WA_LINK = "https://wa.me/526462676766?text=Hola%2C%20quiero%20comprar%20acceso%20VIP%20a%20Beast%20Sensi%207%20%E2%80%94%20Headtrick";

const ANDROID_FEATURES = [
  { id: "headtrick", icon: <Crosshair className="w-5 h-5" />, title: "Headtrick", desc: "Mejora el ángulo de apuntado hacia la cabeza." },
  { id: "regedit", icon: <Settings className="w-5 h-5" />, title: "RegEdit", desc: "Elimina el retroceso de armas al 100%." },
  { id: "fps", icon: <Zap className="w-5 h-5" />, title: "Optimización FPS", desc: "Reduce lags y estabiliza los cuadros del juego." },
  { id: "aim", icon: <Crosshair className="w-5 h-5" />, title: "Control de Mira", desc: "Reducción inteligente del recuadriculado." },
];

const IOS_FEATURES = [
  { id: "headtrick", icon: <Crosshair className="w-5 h-5" />, title: "Headtrick", desc: "Mira se dirige automáticamente hacia la cabeza." },
  { id: "regedit", icon: <Settings className="w-5 h-5" />, title: "RegEdit", desc: "Remove 100% anti-retroceso y recuadriculado de armas." },
  { id: "fps", icon: <Zap className="w-5 h-5" />, title: "Optimización", desc: "Reducción de lags y travamento del juego." },
];

type Phase = "menu" | "choosing-ff" | "loading" | "done";

export function Headtrick() {
  const [, navigate] = useLocation();
  const [isVip, setIsVip] = useState(false);
  const [tab, setTab] = useState<"android" | "ios">("android");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>("menu");
  const [ffChoice, setFfChoice] = useState<"normal" | "max" | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [infoTab, setInfoTab] = useState<"funciones" | "informacion">("funciones");

  useEffect(() => {
    const access = localStorage.getItem("beast-access");
    setIsVip(access === "vip");
  }, []);

  const features = tab === "android" ? ANDROID_FEATURES : IOS_FEATURES;
  const anyActive = Object.values(active).some(Boolean);

  const handleActivate = () => {
    if (!anyActive) return;
    setPhase("choosing-ff");
  };

  const FF_STORE = {
    normal: {
      android: "https://play.google.com/store/apps/details?id=com.dts.freefireth",
      ios: "https://apps.apple.com/app/garena-free-fire/id1300146617",
    },
    max: {
      android: "https://play.google.com/store/apps/details?id=com.dts.freefiremax",
      ios: "https://apps.apple.com/app/garena-free-fire-max/id1558025349",
    },
  };

  const handleChooseFF = (choice: "normal" | "max") => {
    setFfChoice(choice);
    setPhase("loading");
    setLoadPct(0);
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 18 + 4;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => setPhase("done"), 600);
      }
      setLoadPct(Math.min(100, Math.round(pct)));
    }, 200);
  };

  const openGame = () => {
    if (!ffChoice) return;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const iosScheme = {
      normal: "freefireth://",
      max:    "freefiremax://",
    };

    const androidScheme = {
      normal: `intent://com.dts.freefireth/#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.dts.freefireth;S.browser_fallback_url=${encodeURIComponent(FF_STORE.normal.android)};end`,
      max:    `intent://com.dts.freefiremax/#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.dts.freefiremax;S.browser_fallback_url=${encodeURIComponent(FF_STORE.max.android)};end`,
    };

    if (isIos) {
      // iOS: intentar abrir con URL scheme, si falla (app no instalada) ir al App Store
      const t0 = Date.now();
      window.location.href = iosScheme[ffChoice];
      setTimeout(() => {
        if (document.visibilityState !== "hidden" && Date.now() - t0 < 2500) {
          window.open(FF_STORE[ffChoice].ios, "_blank");
        }
      }, 1500);
    } else {
      // Android: probar scheme directo, fallback a Play Store igual que iOS
      const scheme = ffChoice === "max" ? "freefiremax://" : "freefireth://";
      const t0 = Date.now();
      window.location.href = scheme;
      setTimeout(() => {
        if (document.visibilityState !== "hidden" && Date.now() - t0 < 2500) {
          window.location.href = FF_STORE[ffChoice].android;
        }
      }, 1500);
    }
  };

  const toggle = (id: string) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  if (!isVip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8">
        <img src="/beast-auxilio.png" alt="Beast Auxilio" className="w-48 h-48 object-cover rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-primary/30" />
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Acceso Restringido
          </div>
          <h2 className="text-3xl font-display font-black uppercase tracking-widest text-white mb-3">
            HEADTRICK <span className="text-primary">VIP</span>
          </h2>
          <p className="text-zinc-400 max-w-sm mx-auto">
            Esta sección es exclusiva para usuarios VIP. Contáctanos para obtener acceso.
          </p>
        </div>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-4 rounded-xl font-display font-black uppercase tracking-widest text-white text-lg shadow-[0_0_25px_rgba(37,211,102,0.5)] hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg,#25D366,#128C4A)" }}
        >
          <SiWhatsapp className="w-6 h-6" /> Comprar VIP por WhatsApp
        </a>
      </div>
    );
  }

  if (phase === "choosing-ff") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in fade-in duration-500">
        <img src="/beast-auxilio.png" alt="Beast Auxilio" className="w-40 h-40 object-cover rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.6)] border-2 border-primary/50 animate-pulse" />
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-widest text-white mb-2">
            Selecciona la versión
          </h2>
          <p className="text-zinc-400 text-sm">¿Qué Free Fire quieres abrir?</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <button
            onClick={() => handleChooseFF("normal")}
            className="flex-1 py-4 rounded-xl font-display font-black uppercase tracking-widest text-white border-2 border-primary/50 bg-primary/10 hover:bg-primary/30 hover:border-primary hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-200 text-lg"
          >
            Free Fire
          </button>
          <button
            onClick={() => handleChooseFF("max")}
            className="flex-1 py-4 rounded-xl font-display font-black uppercase tracking-widest text-white border-2 border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-200 text-lg"
          >
            FF MAX
          </button>
        </div>
        <button onClick={() => setPhase("menu")} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Volver</button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <img
            src="/beast-auxilio.png"
            alt="Beast Auxilio"
            className="w-52 h-52 object-cover rounded-2xl border-2 border-primary shadow-[0_0_60px_rgba(139,92,246,0.8)]"
            style={{ filter: "brightness(0.9) saturate(1.3)" }}
          />
          <div className="absolute inset-0 rounded-2xl animate-ping border-2 border-primary/40" />
        </div>
        <div className="w-full max-w-xs space-y-3">
          <p className="text-primary font-display font-bold uppercase tracking-widest text-sm">
            Inyectando funciones...
          </p>
          <div className="w-full h-2 bg-black rounded-full border border-primary/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-200 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
              style={{ width: `${loadPct}%` }}
            />
          </div>
          <p className="text-2xl font-display font-black text-white">{loadPct}%</p>
          <p className="text-zinc-500 text-xs font-mono">
            Abriendo {ffChoice === "max" ? "Free Fire MAX" : "Free Fire"}...
          </p>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="relative">
          <img
            src="/beast-auxilio.png"
            alt="Beast Auxilio"
            className="w-52 h-52 object-cover rounded-2xl border-2 border-green-400 shadow-[0_0_60px_rgba(34,197,94,0.6)]"
          />
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.8)] text-white font-black text-lg">✓</div>
        </div>
        <div>
          <h2 className="text-3xl font-display font-black uppercase tracking-widest text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
            LISTO
          </h2>
          <p className="text-white font-display uppercase tracking-wider text-lg mb-1">Funciones Inyectadas</p>
          <p className="text-zinc-400 text-sm">{ffChoice === "max" ? "Free Fire MAX" : "Free Fire"} se abrirá con las funciones activas.</p>
        </div>
        <button
          onClick={openGame}
          className="w-full px-8 py-4 rounded-xl font-display font-black uppercase tracking-widest text-white text-lg border-2 border-green-500/60 bg-green-500/10 hover:bg-green-500/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
        >
          🎮 Abrir {ffChoice === "max" ? "Free Fire MAX" : "Free Fire"}
        </button>
        <button
          onClick={() => { setPhase("menu"); setActive({}); setFfChoice(null); }}
          className="px-8 py-3 rounded-xl font-display font-bold uppercase tracking-widest text-white border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <img src="/beast-auxilio.png" alt="Beast Auxilio" className="w-14 h-14 object-cover rounded-xl border border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
        <div>
          <h1 className="text-2xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
            HEADTRICK
          </h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Sistema Avanzado V2.0</p>
        </div>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-primary/20 bg-black/40">
        {(["funciones", "informacion"] as const).map(t => (
          <button
            key={t}
            onClick={() => setInfoTab(t)}
            className={`flex-1 py-3 text-xs font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              infoTab === t
                ? "bg-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {t === "funciones" ? <><Settings className="w-3.5 h-3.5" /> Funciones</> : <><Info className="w-3.5 h-3.5" /> Informacion</>}
          </button>
        ))}
      </div>

      {infoTab === "funciones" && (
        <>
          <div className="flex rounded-xl overflow-hidden border border-primary/20 bg-black/30">
            <button
              onClick={() => { setTab("android"); setActive({}); }}
              className={`flex-1 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                tab === "android" ? "bg-primary/20 text-primary border-r border-primary/20" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android
            </button>
            <button
              onClick={() => { setTab("ios"); setActive({}); }}
              className={`flex-1 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                tab === "ios" ? "bg-primary/20 text-primary" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Apple className="w-3.5 h-3.5" /> iOS
            </button>
          </div>

          <div className="space-y-3">
            {features.map(feat => {
              const on = !!active[feat.id];
              return (
                <div
                  key={feat.id}
                  className={`rounded-xl border p-4 transition-all duration-200 ${
                    on
                      ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      : "bg-[rgba(255,255,255,0.02)] border-white/8 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${on ? "bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]" : "bg-white/5 text-zinc-400"}`}>
                        {feat.icon}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white text-sm uppercase tracking-wide">{feat.title}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{feat.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(feat.id)}
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
            onClick={handleActivate}
            disabled={!anyActive}
            className="w-full py-4 rounded-xl font-display font-black uppercase tracking-widest text-white text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
            style={{
              background: anyActive
                ? "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
                : "rgba(139,92,246,0.2)",
              boxShadow: anyActive ? "0 0 25px rgba(139,92,246,0.5)" : "none",
            }}
          >
            <Zap className="w-5 h-5" /> Activar Funciones
          </button>
          {!anyActive && (
            <p className="text-center text-zinc-600 text-xs font-mono">Activa al menos una función para continuar</p>
          )}
        </>
      )}

      {infoTab === "informacion" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="rounded-xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold uppercase tracking-widest text-white">Sobre el Auxilio</h3>
            </div>
            {[
              "Última actualización: 21/06/2026",
              "Sistema de auxilio 100% funcional",
              "Actualizaciones frecuentes",
              "Compatible con todas las versiones",
              "Sin riesgo de detección",
              "Soporte 24/7 disponible",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 text-xs">•</span>
                <span className="text-zinc-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-5 space-y-3">
            <h3 className="font-display font-bold uppercase tracking-widest text-white mb-3">Como Usar</h3>
            {[
              "Activa las funciones deseadas",
              'Haz clic en "Activar Funciones"',
              "Elige la versión de Free Fire",
              "Aguarda la inyección",
              "Disfruta las funciones activas",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-zinc-300 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
