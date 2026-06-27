import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { detectDevice, getSensitivities, getSensitivitiesIphone, clampSensi, clampAndroid, clampIphoneDpi, clampCycles } from "@/lib/device";
import { Target, ScanLine, Eye, Crosshair, Zap, Sliders, Smartphone, Apple, Star, Wrench } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

type Platform = 'android' | 'ios';

export function Sensitivity() {
  const [deviceInfo, setDeviceInfo] = useState({ brand: 'Detectando...', tier: 'mid-range' as const, isIphone: false, isMobile: false });
  const [platform, setPlatform] = useState<Platform>('android');
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [ram, setRam] = useState<string>("");
  const [fps, setFps] = useState<string>("");
  const [dpiInput, setDpiInput] = useState<string>("");
  const [sensi, setSensi] = useState<any>(null);
  const [ratingGiven, setRatingGiven] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const info = detectDevice(ua);
    setDeviceInfo(info);
    if (info.isIphone) setPlatform('ios');
    setBrand(info.brand !== 'Desconocido' ? info.brand : "");
    setIsVip(localStorage.getItem("beast-access") === "vip");
  }, []);

  const handleGenerate = () => {
    let tier: 'budget' | 'mid-range' | 'flagship' = 'mid-range';
    const ramNum = parseInt(ram);
    if (ramNum <= 3) tier = 'budget';
    else if (ramNum >= 8) tier = 'flagship';

    const fpsMod = fps === "30" ? 8 : fps === "90" ? -5 : fps === "120" ? -10 : 0;
    const dpiNum = parseInt(dpiInput) || 0;

    if (platform === 'android') {
      const base = getSensitivities(tier);
      let dpiMod = 0;
      if (dpiNum > 600) dpiMod = -8;
      else if (dpiNum < 300 && dpiNum > 0) dpiMod = 8;

      setSensi({
        type: 'android',
        dpi: dpiNum || 400,
        general: clampAndroid(base.general + fpsMod + dpiMod),
        redDot: clampAndroid(base.redDot + fpsMod + dpiMod),
        scope2x: clampAndroid(base.scope2x + fpsMod + dpiMod),
        scope4x: clampAndroid(base.scope4x + fpsMod + dpiMod),
        awm: clampAndroid(base.awm + fpsMod + dpiMod),
        freeLook: clampAndroid(base.freeLook + fpsMod + dpiMod),
      });
    } else {
      const base = getSensitivitiesIphone(tier);
      let dpiMod = 0;
      if (dpiNum > 90) dpiMod = -6;
      else if (dpiNum < 40 && dpiNum > 0) dpiMod = 6;

      setSensi({
        type: 'ios',
        cycles: clampCycles(base.cycles + (fps === "30" ? 1 : fps === "120" ? -1 : 0)),
        dpi: clampIphoneDpi(base.dpi + (dpiNum > 0 ? Math.round((dpiNum - base.dpi) * 0.3) : 0)),
        general: clampSensi(base.general + fpsMod + dpiMod),
        redDot: clampSensi(base.redDot + fpsMod + dpiMod),
        scope2x: clampSensi(base.scope2x + fpsMod + dpiMod),
        scope4x: clampSensi(base.scope4x + fpsMod + dpiMod),
        awm: clampSensi(base.awm + fpsMod + dpiMod),
        freeLook: clampSensi(base.freeLook + fpsMod + dpiMod),
      });
    }

    setRatingGiven(0);
    setRatingSubmitted(false);
    fetch("/api/stats/sensi-track", { method: "POST" }).catch(() => {});
  };

  const handleRating = async (stars: number) => {
    setRatingGiven(stars);
    setRatingSubmitted(true);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, page: "sensitivity" }),
    }).catch(() => {});
  };

  const canGenerate = brand && ram && fps;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[calc(100vh-12rem)] space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          GENERADOR GRATIS
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider mb-4 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
          Generador <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Avanzado</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Ingresa los datos exactos de tu dispositivo para calcular la sensibilidad perfecta. Rangos 1–200.
        </p>
      </div>

      <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative z-10">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold uppercase tracking-widest text-lg">Parámetros del Dispositivo</h2>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-primary/20 bg-black/30 w-fit">
            <button
              onClick={() => { setPlatform('android'); setSensi(null); }}
              className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${platform === 'android' ? 'bg-primary/20 text-primary border-r border-primary/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Android
            </button>
            <button
              onClick={() => { setPlatform('ios'); setSensi(null); }}
              className={`px-5 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all ${platform === 'ios' ? 'bg-primary/20 text-primary' : 'text-zinc-500 hover:text-white'}`}
            >
              <Apple className="w-3.5 h-3.5" /> iPhone
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Marca</label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white h-12">
                  <SelectValue placeholder="Selecciona la marca" />
                </SelectTrigger>
                <SelectContent>
                  {platform === 'ios'
                    ? <SelectItem value="Apple">Apple / iPhone</SelectItem>
                    : <>
                        <SelectItem value="Samsung">Samsung</SelectItem>
                        <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                        <SelectItem value="Redmi">Redmi</SelectItem>
                        <SelectItem value="POCO">POCO</SelectItem>
                        <SelectItem value="Motorola">Motorola</SelectItem>
                        <SelectItem value="Huawei">Huawei</SelectItem>
                        <SelectItem value="Oppo">Oppo</SelectItem>
                        <SelectItem value="Vivo">Vivo</SelectItem>
                        <SelectItem value="Realme">Realme</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </>
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Modelo</label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder={platform === 'ios' ? 'Ej: iPhone 13' : 'Ej: Galaxy A54'}
                className="w-full h-12 bg-black/50 border border-white/10 rounded-md px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Memoria RAM</label>
              <Select value={ram} onValueChange={setRam}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white h-12">
                  <SelectValue placeholder="Selecciona la RAM" />
                </SelectTrigger>
                <SelectContent>
                  {platform === 'ios'
                    ? <>
                        <SelectItem value="4">4 GB (iPhone básico)</SelectItem>
                        <SelectItem value="6">6 GB (iPhone medio)</SelectItem>
                        <SelectItem value="8">8 GB+ (iPhone Pro)</SelectItem>
                      </>
                    : <>
                        <SelectItem value="2">2 GB</SelectItem>
                        <SelectItem value="3">3 GB</SelectItem>
                        <SelectItem value="4">4 GB</SelectItem>
                        <SelectItem value="6">6 GB</SelectItem>
                        <SelectItem value="8">8 GB</SelectItem>
                        <SelectItem value="12">12 GB o más</SelectItem>
                      </>
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">FPS en juego</label>
              <Select value={fps} onValueChange={setFps}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white h-12">
                  <SelectValue placeholder="FPS promedio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                  <SelectItem value="90">90 FPS</SelectItem>
                  <SelectItem value="120">120 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`space-y-2 ${platform === 'ios' ? '' : 'md:col-span-2'}`}>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                DPI Actual {platform === 'ios' ? '(1–120)' : '(Opcional)'}
              </label>
              <input
                type="number"
                value={dpiInput}
                onChange={e => setDpiInput(e.target.value)}
                placeholder={platform === 'ios' ? 'Ej: 75 (máx 120)' : 'Ej: 400'}
                min={1}
                max={platform === 'ios' ? 120 : undefined}
                className="w-full h-12 bg-black/50 border border-white/10 rounded-md px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
              {platform === 'ios' && <p className="text-[10px] text-zinc-600">iPhone: DPI entre 1 y 120</p>}
            </div>

            {platform === 'ios' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Nota de Ciclos</label>
                <div className="h-12 bg-black/30 border border-white/5 rounded-md px-4 flex items-center text-zinc-500 text-sm font-mono">
                  Ciclos se calculan automáticamente (1–10)
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full mt-4 h-14 rounded-xl font-display font-black uppercase tracking-widest text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-[1.02]"
            style={{
              background: !canGenerate ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              boxShadow: !canGenerate ? "none" : "0 0 20px rgba(139,92,246,0.5)",
            }}
          >
            <Zap className="w-5 h-5" /> GENERAR SENSIBILIDAD
          </button>

          <div className="flex items-center justify-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-black/50 border border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                Detectado: <span className="text-white">{deviceInfo.brand}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <Link href="/boton">
          <button className="w-full py-4 rounded-2xl border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/60 transition-all flex items-center justify-center gap-3 group">
            <Sliders className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-display font-bold uppercase tracking-widest text-white text-sm">Generar tu Botón Perfecto</span>
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
            <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 group transition-all font-display font-bold uppercase tracking-widest text-sm border border-yellow-500/40"
              style={{ background: "rgba(184,134,11,0.15)", color: "#ffd700" }}
            >
              <Wrench className="w-5 h-5" />
              Generar Modificación
              <span className="ml-2 text-[10px] bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono tracking-widest">SOLO VIP</span>
            </button>
          </Link>
        )}
      </div>

      {sensi && (
        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-6">
          <h2 className="text-center font-display font-black text-2xl uppercase tracking-widest mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Tus Resultados
          </h2>

          {sensi.type === 'android' && (
            <div className="grid grid-cols-1 gap-3 mb-2">
              <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">DPI Recomendado</span>
                <span className="text-2xl font-display font-black text-blue-300">{sensi.dpi}</span>
              </div>
            </div>
          )}

          {sensi.type === 'ios' && (
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Ciclos</span>
                <span className="text-2xl font-display font-black text-white">{sensi.cycles}<span className="text-sm text-zinc-500">/10</span></span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">DPI</span>
                <span className="text-2xl font-display font-black text-blue-300">{sensi.dpi}<span className="text-sm text-zinc-500">/120</span></span>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            <SensiCard title="General" value={sensi.general} max={200} icon={<Crosshair />} delay="0ms" />
            <SensiCard title="Punto Rojo" value={sensi.redDot} max={200} icon={<Target />} delay="100ms" />
            <SensiCard title="Mira 2X" value={sensi.scope2x} max={200} icon={<ScanLine />} delay="200ms" />
            <SensiCard title="Mira 4X" value={sensi.scope4x} max={200} icon={<ScanLine />} delay="300ms" />
            <SensiCard title="Mira AWM" value={sensi.awm} max={200} icon={<Crosshair />} delay="400ms" />
            <SensiCard title="Cámara Libre" value={sensi.freeLook} max={200} icon={<Eye />} delay="500ms" />
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-4 pt-4 pb-2">
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">
              {ratingSubmitted ? "¡Gracias por tu valoración! 🎯" : "¿Qué tan útil fue la sensibilidad?"}
            </p>
            {!ratingSubmitted ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    onClick={() => handleRating(star)}
                    className="transition-transform hover:scale-125 active:scale-110"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (ratingHover || ratingGiven)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-zinc-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-9 h-9 ${star <= ratingGiven ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"}`}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function SensiCard({ title, value, max, icon, delay }: { title: string; value: number; max: number; icon: React.ReactNode; delay: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <Card
      className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-primary/20 hover:border-primary/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:-translate-y-1 overflow-hidden group"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 flex flex-col relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-primary/20 group-hover:border-primary/50">
            {icon}
          </div>
          <h4 className="font-display font-bold uppercase tracking-wider text-sm text-white">{title}</h4>
        </div>
        <div className="text-4xl font-display font-black text-white group-hover:text-primary transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          {value}
        </div>
        <Progress value={pct} className="h-2 bg-black" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
      </CardContent>
    </Card>
  );
}
