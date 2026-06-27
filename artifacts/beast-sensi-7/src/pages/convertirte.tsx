import { motion } from "framer-motion";
import imgBeastSensiCta from "@assets/9B370403-6EEB-4891-82F8-5BC80D915514_1782455684634.png";
import { SiWhatsapp, SiInstagram } from "react-icons/si";

const WA_LINK = `https://wa.me/526462676766?text=${encodeURIComponent("quiero convertirme en beast sensi")}`;
const IG_LINK = "https://www.instagram.com/victor_lopez1091?igsh=bmcxNm9uOHJjcWI1&utm_source=qr";

const DOTS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${5 + Math.floor((i * 41 + 7) % 90)}%`,
  size: 3 + (i % 4),
  duration: 3.5 + (i % 5) * 0.7,
  delay: (i * 0.28) % 3.5,
}));

const BENEFITS = [
  "Sensibilidades personalizadas para tu dispositivo",
  "Packs de famosos exclusivos",
  "HUDs y regedits premium",
  "Headtrick y optimización avanzada",
  "Soporte directo del equipo Beast",
  "Actualizaciones constantes sin costo extra",
];

export function Convertirte() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo rojo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[150px]" style={{ background: "rgba(220,38,38,0.12)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[120px]" style={{ background: "rgba(239,68,68,0.08)" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-lg">

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-4xl block mb-3">👑</span>
          <h1
            className="font-display font-black uppercase leading-none tracking-wide mb-1"
            style={{ fontSize: "clamp(1.6rem, 8vw, 2.6rem)", color: "#ef4444", textShadow: "0 0 30px rgba(239,68,68,0.6)" }}
          >
            Conviértete en
          </h1>
          <h1
            className="font-display font-black uppercase leading-none tracking-wide"
            style={{ fontSize: "clamp(2rem, 10vw, 3.4rem)", color: "#ffffff", textShadow: "0 0 30px rgba(239,68,68,0.4)" }}
          >
            Beast Sensi
          </h1>
        </motion.div>

        {/* Imagen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xs mx-auto mb-10"
        >
          {/* Partículas */}
          {DOTS.map(dot => (
            <motion.div
              key={dot.id}
              className="absolute rounded-full pointer-events-none"
              style={{ left: dot.left, bottom: 0, width: dot.size, height: dot.size, background: "#ef4444", boxShadow: `0 0 ${dot.size * 2}px #ef4444` }}
              animate={{ y: [0, -300], opacity: [0, 0.9, 0.5, 0], scale: [0.5, 1, 0.6, 0.2] }}
              transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}

          <img
            src={imgBeastSensiCta}
            alt="Conviértete en Beast Sensi"
            className="w-full rounded-2xl relative z-10"
            style={{ boxShadow: "0 0 50px rgba(239,68,68,0.3), 0 0 100px rgba(0,0,0,0.6)" }}
          />

          {/* Brillo rojo inferior */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-xl z-0"
            style={{ background: "rgba(239,68,68,0.35)" }} />
        </motion.div>

        {/* Benefits */}
        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-8"
        >
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="text-red-500 font-black shrink-0">✦</span>
              {b}
            </li>
          ))}
        </motion.ul>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-display font-black uppercase tracking-widest text-white transition-all hover:scale-[1.03] active:scale-95"
            style={{
              background: "linear-gradient(135deg, #dc2626, #ef4444, #b91c1c)",
              boxShadow: "0 0 30px rgba(239,68,68,0.5), 0 4px 20px rgba(0,0,0,0.4)",
              fontSize: "clamp(0.7rem, 3.5vw, 0.9rem)",
            }}
          >
            <SiWhatsapp className="w-5 h-5 shrink-0" />
            QUIERO SER BEAST SENSI
          </a>

          <a
            href={IG_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-display font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 border border-pink-500/30"
            style={{
              background: "linear-gradient(135deg, rgba(131,58,180,0.3), rgba(253,29,29,0.2))",
              fontSize: "clamp(0.65rem, 3vw, 0.8rem)",
            }}
          >
            <SiInstagram className="w-4 h-4 shrink-0" />
            Contactar por Instagram
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-xs text-zinc-600 mt-6"
        >
          Respondemos en menos de 24 horas 🔥
        </motion.p>
      </div>
    </div>
  );
}
