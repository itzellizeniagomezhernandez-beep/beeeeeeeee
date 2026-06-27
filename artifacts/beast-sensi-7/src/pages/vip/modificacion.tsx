import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Zap, ChevronRight, Lock, Battery, Smartphone, ChevronLeft, AlertTriangle, Sliders, Crosshair } from "lucide-react";
import { Link } from "wouter";
import imgGenerador from "@assets/75C78791-1193-444A-AF05-91B9C11A0CC8_1782349329958.png";
import imgJugadorBueno from "@assets/019B7DFD-26C1-468C-A0BD-3899BC7E1A7C_1782419969095.png";

export const ALL_IPHONE_MODELS = [
  "iPhone 6", "iPhone 6 Plus",
  "iPhone 6s", "iPhone 6s Plus",
  "iPhone 7", "iPhone 7 Plus",
  "iPhone 8", "iPhone 8 Plus",
  "iPhone X",
  "iPhone XS", "iPhone XS Max", "iPhone XR",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Plus", "iPhone 17 Pro", "iPhone 17 Pro Max",
];

const BATTERY_OPTIONS = [
  { label: "Excelente", range: "80 – 100%", color: "green", icon: "🟢" },
  { label: "Buena",     range: "60 – 79%",  color: "blue",  icon: "🔵" },
  { label: "Regular",   range: "40 – 59%",  color: "yellow",icon: "🟡" },
  { label: "Baja",      range: "< 40%",     color: "red",   icon: "🔴" },
];

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const w = window.screen.width;
  const h = window.screen.height;
  const ratio = window.devicePixelRatio || 1;
  const mem = (navigator as any).deviceMemory ?? "—";
  const cores = navigator.hardwareConcurrency ?? "—";
  const conn = (navigator as any).connection?.effectiveType ?? "—";
  const lang = navigator.language ?? "—";

  let platform = "Desconocido";
  if (/iPhone/.test(ua)) platform = "iPhone";
  else if (/iPad/.test(ua)) platform = "iPad";
  else if (/Android/.test(ua)) platform = "Android";
  else platform = "Desktop";

  const modelId = `DEV-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

  return { platform, modelId, screen: `${w}×${h}`, dpi: `${Math.round(ratio * 96)} ppi`, ram: typeof mem === "number" ? `${mem} GB` : "—", cores: String(cores), network: conn, lang };
}

export function Modificacion() {
  const [phase, setPhase] = useState<"seleccion" | "scan" | "countdown" | "result">("seleccion");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<string | null>(null);
  const [deviceInfo] = useState(getDeviceInfo);
  const [countdown, setCountdown] = useState(60);
  const [scanPct, setScanPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: settingData } = useQuery({
    queryKey: ["settings", "modificacion_photos"],
    queryFn: async () => {
      const res = await fetch("/api/settings/modificacion_photos");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 60_000,
  });

  const { data: videosData } = useQuery({
    queryKey: ["settings", "modificacion_videos"],
    queryFn: async () => {
      const res = await fetch("/api/settings/modificacion_videos");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 60_000,
  });

  const { data: tutorialVideoData } = useQuery({
    queryKey: ["settings", "modificacion_tutorial_video"],
    queryFn: async () => {
      const res = await fetch("/api/settings/modificacion_tutorial_video");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 60_000,
  });

  const photosMap: Record<string, string[]> = (() => {
    try {
      return settingData?.value ? JSON.parse(settingData.value) : {};
    } catch {
      return {};
    }
  })();

  const videosMap: Record<string, string[]> = (() => {
    try {
      return videosData?.value ? JSON.parse(videosData.value) : {};
    } catch {
      return {};
    }
  })();

  const modelPhotos: string[] = selectedModel ? (photosMap[selectedModel] ?? []).filter(Boolean) : [];
  const modelVideos: string[] = selectedModel ? (videosMap[selectedModel] ?? []).filter(Boolean) : [];
  const tutorialVideoUrl: string = tutorialVideoData?.value ?? "";

  useEffect(() => {
    if (phase === "scan") {
      let p = 0;
      const t = setInterval(() => {
        p += 1.5;
        setScanPct(Math.min(p, 100));
      }, 30);
      return () => clearInterval(t);
    }
  }, [phase]);

  const startCreation = () => {
    setPhase("countdown");
    setCountdown(60);
    fetch("/api/stats/modif-track", { method: "POST" }).catch(() => {});
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setPhase("result"); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const resetAll = () => {
    setPhase("seleccion");
    setSelectedModel(null);
    setSelectedBattery(null);
    setScanPct(0);
    setCountdown(60);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="inline-flex items-center px-3 py-1 mb-3 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10">
          EXCLUSIVO VIP
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary">
          Crear tu Modificación Interna
        </h1>
        <p className="text-muted-foreground mt-2 font-mono text-sm max-w-2xl">
          Selecciona tu iPhone, indicá la condición de batería y te generamos tu modificación interna personalizada.
        </p>
      </header>

      <AnimatePresence mode="wait">

        {/* FASE 1 — Selección de modelo y batería */}
        {phase === "seleccion" && (
          <motion.div key="seleccion" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-8">

            {/* Banner imagen Generar Modificación */}
            <div className="rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <img src={imgGenerador} alt="Generar Modificación" className="w-full object-cover" style={{ maxHeight: 280 }} />
            </div>

            {/* Selección de modelo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">¿Cuál es tu iPhone?</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {ALL_IPHONE_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-left ${
                      selectedModel === model
                        ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                        : "border-white/10 text-zinc-400 hover:border-primary/40 hover:text-zinc-200"
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de batería */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">¿Cuál es tu condición de batería?</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BATTERY_OPTIONS.map(({ label, range, icon }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedBattery(label)}
                    className={`py-4 px-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedBattery === label
                        ? "border-primary bg-primary/20 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                        : "border-white/10 hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{range}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón continuar */}
            <AnimatePresence>
              {selectedModel && selectedBattery && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4 text-center">
                    <p className="text-sm text-primary font-mono font-bold">
                      {selectedModel} · Batería: {selectedBattery}
                    </p>
                  </div>
                  <button
                    onClick={() => { setScanPct(0); setPhase("scan"); }}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-display font-black uppercase tracking-widest text-white text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)]"
                    style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                  >
                    <Zap className="w-5 h-5" />
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* FASE 2 — Escaneo */}
        {phase === "scan" && (
          <motion.div key="scan" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            <div className="relative bg-[rgba(255,255,255,0.02)] border border-primary/20 rounded-2xl p-6 overflow-hidden">
              <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-primary to-purple-400 transition-all duration-75" style={{ width: `${scanPct}%` }} />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold text-white uppercase tracking-wider text-sm">Escaneando Dispositivo</p>
                  <p className="text-xs font-mono text-zinc-500">{scanPct < 100 ? "Analizando componentes..." : "Análisis completo ✓"}</p>
                </div>
                {scanPct < 100 && <div className="ml-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "Modelo",      value: selectedModel ?? deviceInfo.platform },
                  { label: "ID Dispositivo", value: deviceInfo.modelId },
                  { label: "Batería",     value: selectedBattery ?? "—" },
                  { label: "Resolución",  value: deviceInfo.screen },
                  { label: "Densidad",    value: deviceInfo.dpi },
                  { label: "RAM",         value: deviceInfo.ram },
                  { label: "Núcleos",     value: deviceInfo.cores },
                  { label: "Red",         value: deviceInfo.network },
                ].map(({ label, value }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: scanPct > i * 12 ? 1 : 0.15 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border border-white/5"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
                    <span className="text-xs font-mono font-bold text-primary">{value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {scanPct >= 100 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                    <p className="text-sm text-green-400 font-mono">✓ Dispositivo analizado · {selectedModel} · Batería {selectedBattery}</p>
                    <p className="text-xs text-zinc-500 mt-1">Listo para iniciar la creación de tu modificación interna personalizada</p>
                  </div>
                  <button
                    onClick={startCreation}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-display font-black uppercase tracking-widest text-white text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)]"
                    style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
                  >
                    <Zap className="w-5 h-5" />
                    Empezar la Creación
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* FASE 3 — Cuenta regresiva */}
        {phase === "countdown" && (
          <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-col items-center justify-center py-8 space-y-6 overflow-hidden">

            {/* Glow de fondo */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.25) 0%, transparent 70%)" }}
            />

            {/* Imagen "Jugador Bueno" con animaciones */}
            <div className="relative flex justify-center">
              {/* Anillos de energía */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border border-primary/30"
                  style={{ width: 240 + ring * 60, height: 240 + ring * 60, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: ring * 0.4, ease: "easeInOut" }}
                />
              ))}

              {/* Imagen principal */}
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ boxShadow: ["0 0 30px rgba(139,92,246,0.4)", "0 0 70px rgba(139,92,246,0.8)", "0 0 30px rgba(139,92,246,0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <img
                    src={imgJugadorBueno}
                    alt="Beast Sensi"
                    className="rounded-2xl object-cover"
                    style={{ width: 280, maxWidth: "90vw" }}
                  />
                  {/* Overlay con countdown encima de la imagen */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 rounded-2xl" style={{ background: "linear-gradient(to top, rgba(5,3,15,0.85) 0%, transparent 50%)" }}>
                    <motion.div
                      className="flex flex-col items-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="text-6xl font-display font-black text-white drop-shadow-[0_0_20px_rgba(139,92,246,1)]">{countdown}</span>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">segundos</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Partículas flotantes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
                  animate={{ y: [-8, 8, -8], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                />
              ))}
            </div>

            {/* Título */}
            <div className="text-center space-y-1 z-10">
              <motion.p
                className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-purple-300 uppercase tracking-widest text-xl"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Creando tu Modificación
              </motion.p>
              <p className="text-xs text-zinc-500 font-mono">{selectedModel} · Batería {selectedBattery}</p>
            </div>

            {/* Barra de progreso circular + pasos */}
            <div className="w-full max-w-sm space-y-2 z-10">
              {/* Mini progress bar */}
              <div className="h-1 rounded-full bg-primary/10 overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400"
                  animate={{ width: `${((60 - countdown) / 60) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {["Optimizando parámetros táctiles", "Calibrando ciclos de respuesta", "Ajustando latencia interna", "Generando modificación final"].map((step, i) => {
                const done = countdown < 60 - i * 14;
                const active = !done && countdown < 60 - (i - 1) * 14;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-xs font-mono transition-all ${
                      done ? "border-green-500/30 bg-green-500/5 text-green-400" :
                      active ? "border-primary/40 bg-primary/10 text-primary" :
                      "border-white/5 bg-white/2 text-zinc-600"
                    }`}
                  >
                    <motion.div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? "bg-green-400" : active ? "bg-primary" : "bg-zinc-700"}`}
                      animate={active ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    {step} {done ? "✓" : active ? "..." : ""}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* FASE 4 — Resultado: fotos del modelo seleccionado */}
        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center p-6 rounded-2xl border border-green-500/30 bg-green-500/5">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-display font-bold text-white uppercase tracking-widest text-xl">¡Modificación Completada!</p>
              <p className="text-sm text-zinc-400 mt-2 font-mono">
                Modificación generada para <span className="text-primary font-bold">{selectedModel}</span> · Batería <span className="text-primary font-bold">{selectedBattery}</span>
              </p>
            </div>

            {/* Video tutorial + aviso ANTES de aplicar */}
            {tutorialVideoUrl && (() => {
              const isYT = tutorialVideoUrl.includes("youtube.com") || tutorialVideoUrl.includes("youtu.be");
              const ytId = isYT ? (tutorialVideoUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null) : null;
              return (
                <div className="space-y-4">
                  {/* Aviso de reinicio */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 p-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-300 uppercase tracking-wide">Antes de aplicar la modificación</p>
                      <p className="text-xs text-yellow-200/80 mt-1 leading-relaxed">
                        Te recomendamos <span className="font-bold text-yellow-300">reiniciar tu configuración por completo</span> para tener un mejor desempeño. Mira el tutorial antes de continuar.
                      </p>
                    </div>
                  </motion.div>

                  {/* Video tutorial */}
                  <div className="rounded-xl overflow-hidden border border-primary/30 bg-black/40">
                    <div className="px-4 py-2.5 border-b border-primary/10 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Tutorial — Ver antes de aplicar</span>
                    </div>
                    {ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title="Tutorial de modificación"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full"
                        style={{ height: 240, border: "none" }}
                      />
                    ) : (
                      <video src={tutorialVideoUrl} controls className="w-full" style={{ maxHeight: 280 }} />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Videos del modelo */}
            {modelVideos.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center">
                  Videos de tu modificación para {selectedModel}
                </p>
                <div className="space-y-4">
                  {modelVideos.map((url, i) => {
                    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
                    const ytId = isYouTube
                      ? (url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? null)
                      : null;
                    return (
                      <div key={i} className="rounded-xl overflow-hidden border border-primary/20 bg-black/40">
                        <div className="px-4 py-2 border-b border-primary/10 flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Video {i + 1}</span>
                        </div>
                        {ytId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={`Video ${i + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full"
                            style={{ height: 220, border: "none" }}
                          />
                        ) : (
                          <video
                            src={url}
                            controls
                            className="w-full"
                            style={{ maxHeight: 300 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {modelPhotos.length === 0 ? (
              <div className="text-center py-12 border border-primary/20 rounded-2xl">
                <Lock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 font-mono text-sm">Las fotos de tu modificación serán agregadas pronto por el administrador.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest text-center">
                  {modelPhotos.length} foto{modelPhotos.length !== 1 ? "s" : ""} de modificación para {selectedModel}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modelPhotos.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-[rgba(255,255,255,0.03)] border border-primary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
                    >
                      <div className="px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Foto {i + 1}</span>
                        <span className="text-[10px] font-mono text-zinc-600">{selectedModel}</span>
                      </div>
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full object-contain bg-black/60" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA: Mejora aún más */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-purple-900/10 p-6 text-center space-y-4"
            >
              <div className="space-y-1">
                <p className="font-display font-black text-white uppercase tracking-widest text-base">
                  ¿Quieres mejorar aún más?
                </p>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  Si quieres mejorar aún más tu desempeño, te recomendamos usar el <span className="text-primary font-bold">generador de sensibilidad</span> y el <span className="text-primary font-bold">botón perfecto</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/sensitivity">
                  <button className="w-full flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 transition-all group">
                    <Crosshair className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-white leading-tight">
                      Generar<br />Sensibilidad
                    </span>
                  </button>
                </Link>
                <Link href="/boton">
                  <button className="w-full flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400/70 transition-all group">
                    <Sliders className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-white leading-tight">
                      Botón<br />Perfecto
                    </span>
                  </button>
                </Link>
              </div>
            </motion.div>

            <button
              onClick={resetAll}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 text-zinc-400 font-display font-bold uppercase tracking-widest text-sm hover:border-primary/60 hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver a Empezar
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
