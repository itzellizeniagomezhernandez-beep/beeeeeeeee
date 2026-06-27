import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ScanLine, Eye, Crosshair, Smartphone, Apple } from "lucide-react";
import { getSensitivities, getSensitivitiesIphone, clampSensi } from "@/lib/device";

type AndroidTier = 'budget' | 'mid-range' | 'flagship' | 'tablet';
type IphoneTier = 'budget' | 'mid-range' | 'flagship';
type Platform = 'android' | 'ios';

export function VipSensitivities() {
  const [platform, setPlatform] = useState<Platform>('android');
  const [androidTier, setAndroidTier] = useState<AndroidTier>('mid-range');
  const [iphoneTier, setIphoneTier] = useState<IphoneTier>('mid-range');

  const androidTiers: { id: AndroidTier; label: string }[] = [
    { id: 'budget', label: 'Gama Baja' },
    { id: 'mid-range', label: 'Gama Media' },
    { id: 'flagship', label: 'Gama Alta' },
    { id: 'tablet', label: 'Tablet' },
  ];

  const iphoneTiers: { id: IphoneTier; label: string }[] = [
    { id: 'budget', label: 'iPhone Básico' },
    { id: 'mid-range', label: 'iPhone Medio' },
    { id: 'flagship', label: 'iPhone Pro' },
  ];

  const androidData = useMemo(() => {
    if (androidTier === 'tablet') {
      const base = getSensitivities('mid-range');
      return {
        general: clampSensi(base.general + 15),
        redDot: clampSensi(base.redDot + 12),
        scope2x: clampSensi(base.scope2x + 18),
        scope4x: clampSensi(base.scope4x + 20),
        awm: clampSensi(base.awm + 25),
        freeLook: clampSensi(base.freeLook + 30),
        dpi: 400,
      };
    }
    const base = getSensitivities(androidTier);
    const dpiMap = { budget: 500, 'mid-range': 400, flagship: 350 };
    return { ...base, dpi: dpiMap[androidTier] };
  }, [androidTier]);

  const iphoneData = useMemo(() => {
    return getSensitivitiesIphone(iphoneTier);
  }, [iphoneTier]);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
          Sensibilidades VIP
        </h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider">
          Valores calibrados para cada dispositivo — rangos 1–200.
        </p>
      </header>

      {/* Platform Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-primary/20 bg-black/30 w-fit">
        <button
          onClick={() => setPlatform('android')}
          className={`px-6 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${platform === 'android' ? 'bg-primary/20 text-primary border-r border-primary/20' : 'text-zinc-500 hover:text-white'}`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Android
        </button>
        <button
          onClick={() => setPlatform('ios')}
          className={`px-6 py-2.5 text-xs font-display font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${platform === 'ios' ? 'bg-primary/20 text-primary' : 'text-zinc-500 hover:text-white'}`}
        >
          <Apple className="w-3.5 h-3.5" /> iPhone
        </button>
      </div>

      {platform === 'android' && (
        <>
          <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide">
            {androidTiers.map(t => (
              <button
                key={t.id}
                onClick={() => setAndroidTier(t.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-display font-bold text-xs tracking-widest uppercase transition-all border ${
                  androidTier === t.id
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-transparent text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <InfoCard label="DPI Recomendado" value={String(androidData.dpi)} unit="" accent="blue" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            <SensiCard title="General" value={androidData.general} icon={<Crosshair />} delay="0ms" />
            <SensiCard title="Punto Rojo" value={androidData.redDot} icon={<Target />} delay="60ms" />
            <SensiCard title="Mira 2X" value={androidData.scope2x} icon={<ScanLine />} delay="120ms" />
            <SensiCard title="Mira 4X" value={androidData.scope4x} icon={<ScanLine />} delay="180ms" />
            <SensiCard title="Mira AWM" value={androidData.awm} icon={<Crosshair />} delay="240ms" />
            <SensiCard title="Cámara Libre" value={androidData.freeLook} icon={<Eye />} delay="300ms" />
          </div>
        </>
      )}

      {platform === 'ios' && (
        <>
          <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-hide">
            {iphoneTiers.map(t => (
              <button
                key={t.id}
                onClick={() => setIphoneTier(t.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-display font-bold text-xs tracking-widest uppercase transition-all border ${
                  iphoneTier === t.id
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-transparent text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <InfoCard label="Ciclos" value={String(iphoneData.cycles)} unit="/10" accent="purple" />
            <InfoCard label="DPI" value={String(iphoneData.dpi)} unit="/120" accent="blue" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            <SensiCard title="General" value={iphoneData.general} icon={<Crosshair />} delay="0ms" />
            <SensiCard title="Punto Rojo" value={iphoneData.redDot} icon={<Target />} delay="60ms" />
            <SensiCard title="Mira 2X" value={iphoneData.scope2x} icon={<ScanLine />} delay="120ms" />
            <SensiCard title="Mira 4X" value={iphoneData.scope4x} icon={<ScanLine />} delay="180ms" />
            <SensiCard title="Mira AWM" value={iphoneData.awm} icon={<Crosshair />} delay="240ms" />
            <SensiCard title="Cámara Libre" value={iphoneData.freeLook} icon={<Eye />} delay="300ms" />
          </div>

          <Card className="bg-primary/5 border-primary/20 mt-4">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                <span className="text-primary font-bold">Ciclos:</span> rango 1–10 para iPhone. 
                <span className="text-primary font-bold ml-3">DPI:</span> rango 1–120 exclusivo para iOS.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent: 'purple' | 'blue' }) {
  const color = accent === 'purple' ? 'text-primary border-primary/30 bg-primary/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-3xl font-display font-black">{value}<span className="text-base font-normal opacity-60">{unit}</span></p>
      </div>
    </div>
  );
}

function SensiCard({ title, value, icon, delay }: { title: string; value: number; icon: React.ReactNode; delay: string }) {
  const pct = Math.round((value / 200) * 100);
  return (
    <Card
      className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-primary/30 hover:border-primary transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.05)] hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-hidden group animate-in zoom-in-95"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
      <CardContent className="p-5 flex flex-col relative z-10 gap-3">
        <div className="absolute top-3 right-3 bg-primary/20 text-primary border border-primary/40 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">VIP</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors border border-white/10 group-hover:border-primary/50">
            {icon}
          </div>
          <h4 className="font-display font-bold uppercase tracking-wider text-sm text-zinc-100">{title}</h4>
        </div>
        <div className="text-5xl font-display font-black text-white group-hover:text-primary transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          {value}
        </div>
        <Progress value={pct} className="h-2 bg-black/50 border border-white/5" indicatorClassName="bg-gradient-to-r from-purple-500 to-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
      </CardContent>
    </Card>
  );
}
