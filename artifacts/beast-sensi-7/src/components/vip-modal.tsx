import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Star } from "lucide-react";
import { Link } from "wouter";

interface VipModalProps {
  open: boolean;
  onClose: () => void;
  itemTitle?: string;
}

export function VipModal({ open, onClose, itemTitle }: VipModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-sm pointer-events-auto rounded-2xl overflow-hidden">

              {/* Marco dorado animado */}
              <div className="absolute inset-0 rounded-2xl vip-card-border" />

              {/* Fondo */}
              <div className="relative bg-[#0a0a0a] rounded-2xl p-6 border border-yellow-500/30">

                {/* Aura de fondo */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251,191,36,0.18) 0%, transparent 70%)",
                  }}
                />

                {/* Bolitas subiendo */}
                {[10, 25, 42, 58, 73, 88].map((left, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 rounded-full pointer-events-none"
                    style={{
                      left: `${left}%`,
                      width: 3 + (i % 2),
                      height: 3 + (i % 2),
                      background: "radial-gradient(circle, #fde68a 0%, #f59e0b 70%, transparent 100%)",
                      boxShadow: "0 0 5px 2px rgba(251,191,36,0.6)",
                      animation: `gold-rise ${2.5 + i * 0.35}s ${i * 0.4}s infinite linear`,
                    }}
                  />
                ))}

                {/* Cerrar */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Ícono corona */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [-4, 4, -4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#fde68a,#d97706)",
                    }}
                  >
                    👑
                  </motion.div>
                </div>

                {/* Texto */}
                <div className="text-center mb-5 relative z-10">
                  <h2 className="font-display font-black text-xl uppercase tracking-widest text-white mb-1">
                    Contenido <span style={{ color: "#f59e0b" }}>VIP</span>
                  </h2>
                  {itemTitle && (
                    <p className="text-zinc-400 text-xs mb-2">
                      "<span className="text-zinc-300">{itemTitle}</span>" es exclusivo para miembros VIP
                    </p>
                  )}
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Activa tu licencia VIP para desbloquear todos los packs, sensibilidades y contenido premium.
                  </p>
                </div>

                {/* Beneficios */}
                <div className="flex flex-col gap-2 mb-5 relative z-10">
                  {[
                    { icon: <Crown className="w-3.5 h-3.5" />, text: "Acceso a todos los packs VIP" },
                    { icon: <Zap className="w-3.5 h-3.5" />, text: "Sensibilidades exclusivas" },
                    { icon: <Star className="w-3.5 h-3.5" />, text: "Descargas sin límite" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="text-yellow-400">{b.icon}</span>
                      {b.text}
                    </div>
                  ))}
                </div>

                {/* Botón */}
                <Link
                  href="/redeem"
                  onClick={onClose}
                  className="relative block w-full text-center py-3 rounded-xl font-display font-black uppercase tracking-widest text-sm text-black shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                  style={{
                    background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)",
                    backgroundSize: "200% 100%",
                    animation: "goldShift 2.5s linear infinite",
                  }}
                >
                  ⭐ Activar VIP ahora
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
