import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "¿Qué es Beast Sensi 7?",
    a: "Beast Sensi 7 es la plataforma número 1 para configuración de sensibilidades, huds, packs y herramientas avanzadas para Free Fire. Contiene generador de sensi, packs de famosos, optimizaciones, y mucho más para Android e iPhone.",
  },
  {
    q: "¿Cómo obtengo mi acceso VIP?",
    a: "Contáctanos por WhatsApp o Instagram para adquirir tu clave VIP. Una vez que tengas tu licencia, ve a la sección 'ACCESO VIP', ingresa tu usuario y tu clave, y el sistema te dará acceso inmediato.",
  },
  {
    q: "¿Cuánto tiempo dura el acceso VIP?",
    a: "El acceso VIP está disponible en diferentes duraciones: 1 día, 7 días, 30 días o permanente. El tiempo depende del plan que adquieras. Puedes revisar tu expiración en tu perfil VIP.",
  },
  {
    q: "¿Las configuraciones son seguras y no banean?",
    a: "Sí. Todas nuestras configuraciones son 100% legales dentro de Free Fire. Usamos únicamente ajustes permitidos por el juego (sensibilidad, tamaño de botón, HUD). No usamos hacks ni modificaciones del APK.",
  },
  {
    q: "¿Funciona para Android e iPhone?",
    a: "Sí. Tenemos configuraciones específicas y optimizadas para Android (todas las marcas) y para iPhone (todos los modelos desde iPhone 6 hasta 17 Pro Max). El generador de sensibilidad detecta automáticamente tu dispositivo.",
  },
  {
    q: "¿Cómo uso el Generador de Sensibilidad?",
    a: "Ve a la sección SENSI en el menú, selecciona tu sistema operativo (Android o iPhone), ingresa tus datos (marca, DPI, sensibilidad actual, ciclos en iPhone) y te dará tu configuración ideal personalizada.",
  },
  {
    q: "¿Qué incluye el apartado VIP?",
    a: "El panel VIP incluye: sensibilidades exclusivas personalizadas, descargas premium (packs, regedits, configs), headtrick avanzado, optimización exclusiva, HUD de famosos, y herramientas de modificación interna.",
  },
  {
    q: "¿Qué es el Botón Perfecto?",
    a: "Es nuestra calculadora avanzada que determina el tamaño exacto del botón de disparo según tu dispositivo, DPI, sensibilidad y ciclos. Un botón bien calibrado mejora significativamente la precisión de headshots.",
  },
  {
    q: "¿Los archivos de descarga tienen virus?",
    a: "No. Todos nuestros archivos son probados y verificados antes de publicarse. Son configuraciones (.txt, .cfg) y regedits que únicamente modifican parámetros permitidos del juego. Nada ejecutable o malicioso.",
  },
  {
    q: "¿Mi clave VIP sirve en varios dispositivos?",
    a: "Las claves VIP están asociadas a tu dispositivo al activarlas. Si necesitas cambiar de dispositivo, contáctanos directamente por WhatsApp para gestionar el cambio.",
  },
  {
    q: "¿Con qué frecuencia se actualizan los packs?",
    a: "Los packs se actualizan constantemente. Los miembros VIP reciben acceso inmediato a todas las actualizaciones sin costo adicional durante la vigencia de su licencia.",
  },
  {
    q: "¿Cómo contacto soporte?",
    a: "Puedes contactarnos directamente por WhatsApp o Instagram. Respondemos en menos de 24 horas. También puedes unirte a nuestro Discord para soporte comunitario.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-primary/20 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)] hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <h3 className="font-display font-bold text-sm md:text-base uppercase tracking-wide text-white leading-snug">
          {q}
        </h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed border-t border-primary/10">
              <p className="pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <div className="container mx-auto px-4 py-14 max-w-3xl min-h-[calc(100vh-8rem)]">
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-primary border border-primary/30 rounded-full bg-primary/10">
          FAQ
        </div>
        <h1
          className="text-4xl md:text-6xl font-display font-black uppercase tracking-wider text-white"
          style={{ textShadow: "0 0 40px rgba(139,92,246,0.5)" }}
        >
          Preguntas{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Frecuentes
          </span>
        </h1>
        <p className="text-zinc-500 mt-4 font-mono text-sm">
          Todo lo que necesitas saber sobre Beast Sensi 7
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} />
        ))}
      </div>

      <div className="mt-12 text-center p-8 rounded-2xl border border-primary/20 bg-primary/5">
        <p className="text-zinc-400 text-sm mb-4">
          ¿No encontraste tu respuesta? Contáctanos directamente.
        </p>
        <a
          href="https://wa.me/526462676766?text=Hola,%20tengo%20una%20duda%20sobre%20Beast%20Sensi%207"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary font-display font-bold uppercase tracking-widest text-white text-sm hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
