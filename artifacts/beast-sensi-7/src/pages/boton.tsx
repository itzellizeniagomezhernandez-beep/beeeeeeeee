import { useState, useEffect } from "react";
import { Sliders, Crosshair, Smartphone, Apple, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";

type Platform = 'android' | 'ios';

function calcBoton(sensi: number, dpi: number, cycles: number, isIos: boolean): number {
  const base = 49;
  const dpiMod    = Math.max(-8, Math.min(8,  (500 - dpi)   / 50));
  const sensiMod  = Math.max(-5, Math.min(5,  (80  - sensi) / 15));
  const cyclesMod = isIos ? Math.max(-4, Math.min(6, (6 - cycles) * 1.2)) : 0;
  return Math.max(20, Math.min(60, Math.round(base + dpiMod + sensiMod + cyclesMod)));
}

export function Boton() {
  const [, navigate] = useLocation();
  const [platform, setPlatform]   = useState<Platform>('android');
  const [sensi, setSensi]         = useState("");
  const [dpi, setDpi]             = useState("");
  const [cycles, setCycles]       = useState("");
  const [result, setResult]       = useState<number | null>(null);
  const [isVip, setIsVip]         = useState(false);

  useEffect(() => {
    setIsVip(localStorage.getItem("beast-access") === "vip");
  }, []);

  const isIos   = platform === 'ios';
  const canCalc = isIos
    ? sensi !== "" && dpi !== "" && cycles !== "" && Number(cycles) >= 1 && Number(cycles) <= 10
    : sensi !== "" && dpi !== "";

  const handleCalc = () => {
    const r = calcBoton(Number(sensi), Number(dpi), isIos ? Number(cycles) : 5, isIos);
    setResult(r);
    fetch("/api/stats/sensi-track", { method: "POST" }).catch(() => {});
  };

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    setCycles("");
    setResult(null);
  };

  const resultLabel = result === null ? "" : result <= 35
    ? "Botón Compacto — Máxima Precisión"
    : result <= 48
    ? "Botón Balanceado — Perfecto"
    : "Botón Cómodo — Control Total";

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-12rem)] space-y-8">

      <div className="text-center">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          CALCULADORA GRATIS
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider mb-4 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          Botón <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Perfecto</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Ingresa tu sensibilidad y DPI actuales para calcular el tamaño de botón ideal.
        </p>
      </div>

      <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold uppercase tracking-widest text-lg">Tus Datos</h2>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-primary/20 bg-black/30 w-fit">
            <button
              onClick={() => handlePlatformChange('android')}
              className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${platform === 'android' ? 'bg-primary/20 text-primary border-r border-primary/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android
            </button>
            <button
              onClick={() => handlePlatformChange('ios')}
              className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${platform === 'ios' ? 'bg-primary/20 text-primary' : 'text-zinc-500 hover:text-white'}`}
            >
              <Apple className="w-3.5 h-3.5" /> iPhone
            </button>
          </div>

          <div className={`grid gap-4 ${isIos ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Sensibilidad en juego
              </label>
              <input
                type="number" min={0} max={200}
                value={sensi}
                onChange={e => { setSensi(e.target.value); setResult(null); }}
                placeholder="Ej: 80"
                className="w-full h-12 bg-black/50 border border-white/10 rounded-md px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {isIos ? 'DPI (1–120)' : 'DPI del teléfono'}
              </label>
              <input
                type="number" min={1} max={isIos ? 120 : 1200}
                value={dpi}
                onChange={e => { setDpi(e.target.value); setResult(null); }}
                placeholder={isIos ? 'Ej: 75' : 'Ej: 400'}
                className="w-full h-12 bg-black/50 border border-white/10 rounded-md px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
            {isIos && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Ciclos (1–10)
                </label>
                <input
                  type="number" min={1} max={10}
                  value={cycles}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "" || (Number(v) >= 1 && Number(v) <= 10)) { setCycles(v); setResult(null); }
                  }}
                  placeholder="Ej: 5"
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-md px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
            )}
          </div>

          <div className="bg-white/3 border border-white/5 rounded-xl p-4">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              <span className="text-zinc-400 font-semibold">¿Cómo encontrar tus datos?</span>{" "}
              Sensibilidad → Free Fire → Configuración → Personaje.{" "}
              DPI → Ajustes del teléfono → Pantalla.
              {isIos && " Ciclos (1–10) → Beast te los da al comprar tu configuración."}
            </p>
          </div>

          <button
            onClick={handleCalc}
            disabled={!canCalc}
            className="w-full h-14 rounded-xl font-display font-black uppercase tracking-widest text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            style={{
              background: !canCalc ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              boxShadow: !canCalc ? "none" : "0 0 20px rgba(139,92,246,0.5)",
            }}
          >
            <Sliders className="w-5 h-5" /> CALCULAR BOTÓN PERFECTO
          </button>
        </CardContent>
      </Card>

      {result !== null && (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
              <div className="relative w-52 h-52 rounded-full border-2 border-primary/60 bg-gradient-to-br from-primary/20 to-purple-900/30 shadow-[0_0_60px_rgba(139,92,246,0.5)] flex flex-col items-center justify-center">
                <span className="text-7xl font-display font-black text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.9)] leading-none">{result}</span>
                <span className="text-[11px] font-mono text-primary/80 uppercase tracking-[0.25em] mt-2">tamaño</span>
              </div>
            </div>
            <p className="text-white font-display font-bold text-xl text-center">{resultLabel}</p>
            <div className="bg-white/5 border border-primary/20 rounded-xl px-6 py-4 max-w-sm text-center">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Free Fire → Config → HUD → Ajuste de botones → Disparo → Tamaño:{" "}
                <span className="text-primary font-mono font-bold text-lg">{result}</span>
              </p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm font-bold uppercase tracking-wider hover:border-white/30 hover:text-white transition-all"
            >
              Recalcular
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link href="/sensitivity">
          <button className="w-full py-4 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/60 transition-all flex items-center justify-center gap-3 group">
            <Crosshair className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold uppercase tracking-widest text-white text-sm">Generar tu Sensibilidad</span>
          </button>
        </Link>

        {isVip ? (
          <Link href="/vip/modificacion">
            <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 group transition-all font-display font-bold uppercase tracking-widest text-sm"
              style={{
                background: "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
                boxShadow: "0 0 24px rgba(255,215,0,0.45)",
                color: "#1a1200",
              }}
            >
              <Wrench className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Generar Modificación
            </button>
          </Link>
        ) : (
          <Link href="/redeem">
            <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 group transition-all font-display font-bold uppercase tracking-widest text-sm relative overflow-hidden border border-yellow-500/40"
              style={{ background: "rgba(184,134,11,0.15)", color: "#ffd700" }}
            >
              <Wrench className="w-5 h-5" />
              Generar Modificación
              <span className="ml-2 text-[10px] bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono tracking-widest">SOLO VIP</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
