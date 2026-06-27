import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X } from "lucide-react";

export function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("install-dismissed")) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("install-dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-sm"
      >
        <div className="relative rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
          {/* Fondo animado */}
          <div className="absolute inset-0 bg-[#0d0d0d]" />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: ["-60%", "60%", "-60%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(139,92,246,0.25) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex items-center gap-3 px-4 py-3">
            <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-primary/30">
              <img src="/admin-icon.png" alt="Beast Sensi" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-display font-bold text-sm uppercase tracking-wider leading-tight">
                Añadir a inicio
              </p>
              <p className="text-zinc-400 text-[11px] leading-tight mt-0.5">
                Accede rápido desde tu pantalla
              </p>
            </div>

            <button
              onClick={handleInstall}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase tracking-widest text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]"
              style={{
                background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)",
                backgroundSize: "200% 100%",
                animation: "goldShift 2.5s linear infinite",
              }}
            >
              Instalar
            </button>

            <button
              onClick={handleDismiss}
              className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
