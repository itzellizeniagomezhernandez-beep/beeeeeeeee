import { Link, useLocation } from "wouter";
import { ChevronRight, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import imgBeastSensiCta from "@assets/9B370403-6EEB-4891-82F8-5BC80D915514_1782455684634.png";
import imgPacksFamosos  from "@assets/B904F514-8B52-4DE3-A1A0-C4D95A29658C_1782378165734.png";
import imgXitAndroid    from "@assets/AD2E4752-911B-46EA-91ED-3C2A1D6E1060_1782113892813.png";
import imgXitIphone     from "@assets/82DE07C7-5D51-4EF6-92E2-B8CABDE3F0A7_1782114063629.png";
import imgProxy         from "@assets/275C19BF-150A-4284-A57A-CC3BB7FFDAE2_1782114196971.png";
import imgOptimizacion  from "@assets/5240705F-8DCC-43AB-95BC-7738266BEB49_1782115776696.png";
import imgProyectos     from "@assets/13485FB2-BB07-47A6-9D8C-0FE0EAA95DA4_1782175055753.png";
import imgHudFamosos    from "@assets/7C310EFA-E93F-47E1-BD8F-A8AEB5142137_1782373347934.png";
import imgBotonPerfecto from "@assets/C89109EE-F177-4B56-AE4F-1BC323DF77D8_1782175297276.png";
import gifSensi   from "@assets/standard_1782354822700.gif";
import gifProjects from "@assets/standard_3_1782354822700.gif";

const FREE_CATALOGS = [
  { slug: "packs-famosos",    label: "Packs de Famosos",      sub: "Sensibilidades de grandes jugadores",      img: imgPacksFamosos  },
  { slug: "xit-android",      label: "Xit Android",           sub: "Aimbot · Aimlock · Auto HS · Anti Ban",    img: imgXitAndroid    },
  { slug: "xit-iphone",       label: "Xit iPhone",            sub: "Aimbot · No Recoil · iOS Optimized",       img: imgXitIphone     },
  { slug: "proxy",            label: "Proxy Android & iOS",   sub: "+FPS · -PING · Conexión estable",          img: imgProxy         },
  { slug: "optimizacion",     label: "Optimización",          sub: "Android & iOS · Máximo desempeño · -LAG",  img: imgOptimizacion  },
  { slug: "hud-famosos",      label: "HUD de Famosos",        sub: "HUDs exclusivos de los mejores jugadores",  img: imgHudFamosos    },
  { slug: "proyectos-beast",  label: "Proyectos Beast",       sub: "Exclusivo · Secreto · Solo para miembros", img: imgProyectos     },
];

const PRO_TIPS = [
  { tag: "Mira", tip: "Ajusta tu sensibilidad de Cámara Libre entre 60 y 80 — te da más control sin perder velocidad de giro." },
  { tag: "Botón", tip: "El tamaño del botón de disparo lo es todo. Demasiado grande y tardas en reaccionar; demasiado pequeño y fallas el toque." },
  { tag: "DPI", tip: "El DPI de tu pantalla afecta directamente tus headshots. Calibra bien tu configuración según tu dispositivo." },
  { tag: "Headshot", tip: "Para mejorar la mira al apuntar, baja la sensibilidad de Cámara al apuntar (Scope) al 40-60 % de tu sensi base." },
  { tag: "Conexión", tip: "Un ping alto no es solo de internet. Un proxy bien configurado puede bajarte 30-50 ms de latencia en segundos." },
  { tag: "HUD", tip: "El HUD personalizado cambia la partida. Posiciona el botón de disparo donde tu pulgar caiga de forma natural." },
  { tag: "Práctica", tip: "5 minutos en la sala de entrenamiento antes de cada sesión te calienta la muñeca y activa el músculo de memoria." },
  { tag: "Equipos", tip: "Usa auriculares. El sonido de los pasos te da ventaja enorme — muchos pros dicen que el audio vale más que la mira." },
  { tag: "Optimización", tip: "Cierra todas las apps en segundo plano antes de jugar. Más RAM libre = menos lag = más booyahs." },
  { tag: "Ciclos", tip: "En iPhone, los ciclos controlan la velocidad de detección táctil. Ajústalos según tu modelo para un toque más preciso." },
];

function TipsPro() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 4000;
  const INTERVAL = 50;

  useEffect(() => {
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += INTERVAL;
      setProgress((elapsed / DURATION) * 100);
      if (elapsed >= DURATION) {
        elapsed = 0;
        setCurrent(c => (c + 1) % PRO_TIPS.length);
      }
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const tip = PRO_TIPS[current];

  return (
    <section className="py-16 px-4 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(139,92,246,0.03)] to-transparent pointer-events-none" />
      <div className="container mx-auto max-w-3xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-1.5 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            TIPS PRO
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-wider mt-4"
            style={{ textShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
            Secretos de los <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Pros</span>
          </h2>
        </div>

        <div className="relative bg-[rgba(255,255,255,0.02)] border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.08)]">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-primary to-purple-400 transition-all duration-50"
            style={{ width: `${progress}%` }} />

          <div className="p-8 md:p-12 min-h-[180px] flex flex-col justify-center">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary mb-5">
                {tip.tag}
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-white leading-relaxed"
                style={{ textShadow: "0 0 20px rgba(255,255,255,0.05)" }}>
                "{tip.tip}"
              </p>
            </motion.div>
          </div>

          {/* Dot nav */}
          <div className="flex items-center justify-center gap-2 pb-5">
            {PRO_TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setProgress(0); }}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs font-mono text-zinc-600 mt-4 tracking-wider">
          Cambia automáticamente · Toca para navegar
        </p>
      </div>
    </section>
  );
}


export function Home() {
  const [, navigate] = useLocation();
  const [accessLevel, setAccessLevel] = useState<"vip" | "free" | null>(null);

  useEffect(() => {
    const access = localStorage.getItem("beast-access");
    if (access === "vip") setAccessLevel("vip");
    else if (access === "free") setAccessLevel("free");
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

  const { data: hudSetting } = useQuery({
    queryKey: ["settings", "hud_famosos"],
    queryFn: async () => {
      const res = await fetch("/api/settings/hud_famosos");
      if (!res.ok) return null;
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    staleTime: 5 * 60_000,
  });

  const hudItems: { nombre: string; imageUrl: string; hudCode: string; qrUrl?: string }[] = (() => {
    try { return hudSetting?.value ? JSON.parse(hudSetting.value) : []; } catch { return []; }
  })();

  const tip = tipData?.value || "Para dominar la escopeta, ajusta la Cámara Libre a un valor bajo. Te dará el milisegundo extra para el flick shot perfecto.";

  return (
    <>
      {/* Hero */}
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-hero.jpeg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(30,10,60,0.72) 50%, rgba(5,5,5,0.85) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-4 font-medium"
            style={{ color: "rgba(168,85,247,0.9)" }}
          >
            // BEAST SENSI CONFIG ELITE
          </p>

          <h1
            className="font-display font-black uppercase leading-none mb-2"
            style={{
              fontSize: "clamp(3.5rem, 18vw, 7rem)",
              color: "#ffffff",
              textShadow: "0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(139,92,246,0.3)",
              letterSpacing: "0.04em",
            }}
          >
            BEAST
          </h1>
          <h1
            className="font-display font-black uppercase leading-none mb-8"
            style={{
              fontSize: "clamp(3.5rem, 18vw, 7rem)",
              background: "linear-gradient(135deg, #a855f7 0%, #8b5cf6 60%, #c4b5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(139,92,246,0.7))",
              letterSpacing: "0.04em",
            }}
          >
            SENSI
          </h1>

          <p
            className="text-xs md:text-sm tracking-[0.18em] uppercase mb-10 max-w-xs leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            GENERADOR DE SENSIBILIDAD — ANDROID &amp; IOS — 100% LEGAL
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm">
            <Link
              href="/sensitivity"
              className="flex-1 flex items-center justify-center rounded-lg font-display font-bold text-sm tracking-widest uppercase text-white transition-all"
              style={{
                height: "52px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                boxShadow: "0 0 20px rgba(139,92,246,0.5), 0 4px 15px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(139,92,246,0.8), 0 4px 20px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(139,92,246,0.5), 0 4px 15px rgba(0,0,0,0.3)";
              }}
            >
              GENERAR SENSI
            </Link>

            <Link
              href={accessLevel === "vip" ? "/vip" : accessLevel === "free" ? "/vip" : "/redeem"}
              className="flex-1 flex items-center justify-center rounded-lg font-display font-bold text-sm tracking-widest uppercase transition-all"
              style={{
                height: "52px",
                background: accessLevel === "vip"
                  ? "rgba(139,92,246,0.25)"
                  : "rgba(255,255,255,0.05)",
                border: accessLevel === "vip"
                  ? "1px solid rgba(139,92,246,0.8)"
                  : "1px solid rgba(139,92,246,0.5)",
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.25)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.9)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = accessLevel === "vip" ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = accessLevel === "vip" ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.5)";
              }}
            >
              {accessLevel === "vip" ? "MI PANEL VIP" : "ACCESO VIP"}
            </Link>
          </div>

          {/* GIF Sensi */}
          <div className="w-full max-w-sm mx-auto mt-4">
            <img src={gifSensi} alt="" className="w-full rounded-2xl" style={{ maxHeight: "200px", objectFit: "cover" }} />
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-500">ver más</span>
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(5,5,5,0.9))" }}
        />
      </div>

      {/* Tip del Día */}
      <div className="relative z-10 px-4 pt-10 pb-2">
        <div className="container mx-auto max-w-3xl">
          <div
            className="flex items-start gap-4 px-6 py-5 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-sm"
            style={{ boxShadow: "0 0 30px rgba(139,92,246,0.1)" }}
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mt-0.5">
              <Gamepad2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary mb-1 opacity-80">// TIP DEL DÍA</p>
              <p className="text-sm text-zinc-300 italic leading-relaxed">"{tip}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              DESCARGAS
            </div>
            <h2
              className="text-3xl md:text-5xl font-display font-black uppercase tracking-wider"
              style={{ textShadow: "0 0 30px rgba(139,92,246,0.4)" }}
            >
              Packs &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Configs</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {FREE_CATALOGS.map(({ slug, label, sub, img }, index) => (
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
                {/* Floating image */}
                <motion.div
                  animate={{ y: [0, -6, 0], scale: [1, 1.015, 1] }}
                  transition={{
                    duration: 4 + index * 0.7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5,
                  }}
                  className="w-full"
                >
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                    style={{ display: "block" }}
                  />
                </motion.div>

                {/* Bottom gradient overlay with label + button */}
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
            ))}
          </div>
        </div>
      </section>

      {/* GIF separator — Projects */}
      <div className="w-full overflow-hidden">
        <img src={gifProjects} alt="" className="w-full h-auto object-cover" />
      </div>

      {/* Tips Pro — Rotating */}
      <TipsPro />

      {/* Botón Perfecto — Intro */}
      <section className="py-12 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center px-4 py-1.5 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            CONFIGURACIÓN AVANZADA
          </div>
          <h2
            className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider leading-tight"
            style={{ textShadow: "0 0 40px rgba(139,92,246,0.5)" }}
          >
            El botón lo es{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              todo
            </span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-left mt-4">
            {[
              { icon: "🎯", title: "Precisión al 100%", desc: "Un botón mal calibrado te hace perder headshots que deberías tener asegurados." },
              { icon: "⚡", title: "Reacción más rápida", desc: "El tamaño correcto reduce el tiempo entre ver al enemigo y disparar." },
              { icon: "🏆", title: "La diferencia entre ganar y perder", desc: "Los pros ajustan cada milímetro. Tú también deberías." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[rgba(255,255,255,0.02)] border border-primary/15 rounded-xl p-4">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Botón Perfecto — Card */}
      <section className="pb-20 px-4 relative z-10">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/boton"
            className="group relative overflow-hidden rounded-2xl border border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer block"
            style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.5)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 60px rgba(139,92,246,0.4), 0 4px 40px rgba(0,0,0,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 40px rgba(0,0,0,0.5)"; }}
          >
            <motion.div
              animate={{ y: [0, -8, 0], scale: [1, 1.018, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-full"
            >
              <img
                src={imgBotonPerfecto}
                alt="Botón Perfecto"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                style={{ display: "block" }}
              />
            </motion.div>
            <div
              className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 py-6 sm:py-8"
              style={{ background: "linear-gradient(to top, rgba(5,3,15,0.97) 0%, rgba(5,3,15,0.7) 55%, transparent 100%)" }}
            >
              <div>
                <h3 className="font-display font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                  style={{ fontSize: "clamp(1.3rem, 5vw, 2.2rem)", textShadow: "0 0 30px rgba(139,92,246,0.5)" }}
                >
                  Crea tu botón perfecto
                </h3>
                <p className="text-sm font-mono text-zinc-400 mt-1.5">Calculadora personalizada · Android &amp; iPhone</p>
              </div>
              <div
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase text-white transition-all shadow-[0_0_25px_rgba(139,92,246,0.7)]"
                style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}
              >
                CALCULAR <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* HUD de Famosos */}
      {hudItems.length > 0 && (
        <section className="py-16 px-4 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                HUD DE FAMOSOS
              </div>
              <h2
                className="text-3xl md:text-5xl font-display font-black uppercase tracking-wider"
                style={{ textShadow: "0 0 30px rgba(139,92,246,0.4)" }}
              >
                HUDs de los{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                  Mejores
                </span>
              </h2>
              <p className="text-zinc-500 mt-3 font-mono text-sm">Importa el HUD exacto de tus jugadores favoritos</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hudItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[rgba(255,255,255,0.02)] border border-primary/20 rounded-2xl overflow-hidden hover:border-primary/50 transition-all group"
                  style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
                >
                  {item.imageUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.nombre}
                        className="w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        style={{ maxHeight: "200px" }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,3,15,0.9) 0%, transparent 60%)" }} />
                      <div className="absolute bottom-3 left-4">
                        <p className="font-display font-black uppercase text-white text-sm tracking-widest">{item.nombre}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    {!item.imageUrl && (
                      <p className="font-display font-black uppercase text-white text-sm tracking-widest">{item.nombre}</p>
                    )}
                    <div className="bg-black/60 rounded-xl p-3 border border-primary/15">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1.5 opacity-70">// CÓDIGO HUD</p>
                      <p className="font-mono text-xs text-zinc-300 break-all leading-relaxed">{item.hudCode}</p>
                    </div>
                    {item.qrUrl && (
                      <div className="flex justify-center">
                        <img src={item.qrUrl} alt={`QR ${item.nombre}`} className="w-28 h-28 rounded-xl border border-primary/20 bg-white p-1" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.hudCode).catch(() => {});
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary/15 border border-primary/40 text-primary font-display font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      Copiar Código
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Carrusel de Referencias ── */}
      <ReferencesMarquee />

    </>
  );
}

function ReferencesMarquee() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showCta, setShowCta] = useState(false);

  const { data } = useQuery({
    queryKey: ["settings", "referencias_testimonials"],
    queryFn: async () => {
      const r = await fetch("/api/settings/referencias_testimonials");
      if (!r.ok) return null;
      return r.json() as Promise<{ value: string | null }>;
    },
    staleTime: 60_000,
  });

  const fotos: string[] = (() => {
    try {
      const parsed = data?.value ? JSON.parse(data.value) : [];
      return (Array.isArray(parsed) ? parsed : [])
        .map((t: any) => t.avatar as string)
        .filter(Boolean);
    } catch { return []; }
  })();

  if (fotos.length === 0) return null;

  const doubled = [...fotos, ...fotos];

  return (
    <section className="py-10 overflow-hidden">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/60 rounded-full p-2"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <img
            src={lightbox}
            alt="Referencia"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      <div className="flex items-center gap-3 mb-5 px-4 max-w-4xl mx-auto">
        <div className="h-px flex-1 bg-primary/20" />
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary px-3 whitespace-nowrap">
          LO QUE DICE LA COMUNIDAD
        </span>
        <div className="h-px flex-1 bg-primary/20" />
      </div>

      {/* Tiras infinitas — dos filas en sentidos opuestos */}
      <div
        className="relative w-full overflow-hidden flex flex-col gap-3"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        {/* Fila 1 → izquierda */}
        <div className="flex gap-3 marquee-track" style={{ width: "max-content" }}>
          {doubled.map((src, i) => (
            <div
              key={`a${i}`}
              className="shrink-0 rounded-2xl overflow-hidden border border-primary/25 cursor-zoom-in hover:border-primary/70 transition-colors"
              style={{ width: 155, height: 190 }}
              onClick={() => setLightbox(src)}
            >
              <img src={src} alt="referencia" className="w-full h-full object-cover object-top" draggable={false} />
            </div>
          ))}
        </div>

        {/* Fila 2 → derecha (orden invertido para variedad) */}
        <div className="flex gap-3 marquee-track-reverse" style={{ width: "max-content" }}>
          {[...doubled].reverse().map((src, i) => (
            <div
              key={`b${i}`}
              className="shrink-0 rounded-2xl overflow-hidden border border-primary/20 cursor-zoom-in hover:border-primary/60 transition-colors"
              style={{ width: 155, height: 190 }}
              onClick={() => setLightbox(src)}
            >
              <img src={src} alt="referencia" className="w-full h-full object-cover object-top" draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {/* Tagline + botón comunidad + botón CTA */}
      <div className="flex flex-col items-center gap-4 mt-8 px-4">
        <p className="text-zinc-400 font-mono text-xs uppercase tracking-[0.25em] text-center">
          de los mejores para los mejores
        </p>
        <a
          href="https://chat.whatsapp.com/KS0Wu6RRyaz8V28rSwPiT6?s=cl&p=i&mlu=4"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-display font-bold uppercase tracking-widest text-sm text-white transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)", boxShadow: "0 0 20px rgba(34,197,94,0.35)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Únete al Grupo
        </a>

        <Link href="/convertirte">
          <button
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-display font-black uppercase tracking-widest text-sm text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #dc2626, #ef4444, #b91c1c)",
              boxShadow: "0 0 25px rgba(239,68,68,0.5), 0 4px 15px rgba(0,0,0,0.4)",
            }}
          >
            <span>👑</span>
            CONVIÉRTETE EN BEAST SENSI
          </button>
        </Link>
      </div>
    </section>
  );
}

