import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAMES = [
  "Alex", "Brayan", "Carlos", "Diego", "Emilio", "Felipe", "Gonzalo", "Héctor",
  "Iván", "Jesús", "Kevin", "Luis", "Miguel", "Nicolás", "Omar", "Pablo",
  "Rodrigo", "Samuel", "Tomás", "Ulises", "Víctor", "Walter", "Adrián",
  "Benjamín", "César", "Daniel", "Eduardo", "Fernando", "Gabriel", "Hugo",
  "Javier", "Leonardo", "Marcos", "Noel", "Pedro", "Rafael", "Sebastián",
  "Armando", "Bruno", "Camilo", "Dario", "Ernesto", "Fabricio", "Gerardo",
  "Humberto", "Joaquín", "Lorenzo", "Mauricio", "Ramiro", "Salvador",
  "shadow_ff", "beast_gamer", "pro_free", "ff_king", "headshot99", "sniper_x",
  "darklord_ff", "vip_hunter", "ghost_sensi", "laser_aim", "pro_rush",
  "ultra_sensi", "god_aim", "beast_rush", "dark_sniper", "pro_sensi",
  "ff_master", "top_player", "rush_king", "aim_god", "free_fire_pro",
  "ShadowX09", "DarkNight_FF", "ProGamer22", "KingFF", "HeadShot_K", "ViperFF",
  "AlphaWolf", "SilentKill", "NightOwl_", "StrikerFF", "LegendX", "PhantomFF",
  "EliteGunner", "SwiftAim", "IronSight", "BladeRunner", "CrimsonFF", "NeonRush",
  "VoidWalker", "StormBreaker", "AceHunter", "SilverBullet", "GhostRecon_",
  "ThunderBolt", "RocketFF", "FireStorm", "MidnightFF", "XxProKillerxX",
  "MLG_Sensi", "FF_Leyenda", "NoScope_King", "BeastMode_FF", "Rush_Elite",
];

const SUFFIXES = [
  "_FF", "_Pro", "_YT", "_GG", "_MX", "_123", "_X", "_elite", "_god",
  "2025", "HD", "_oficial", "7", "_gaming", "_vip", "_rush",
];

function randomName() {
  const base = NAMES[Math.floor(Math.random() * NAMES.length)];
  if (Math.random() < 0.4) {
    return base + SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  }
  return base;
}

const MESSAGES = [
  (name: string) => `${name} se convirtió en VIP`,
  (name: string) => `${name} acaba de activar VIP`,
  (name: string) => `${name} se unió a VIP Beast Sensi`,
  (name: string) => `${name} compró acceso VIP`,
  (name: string) => `${name} activó su clave VIP`,
  (name: string) => `${name} se hizo VIP ahora mismo`,
  (name: string) => `${name} ya es miembro VIP`,
  (name: string) => `${name} se unió a los mejores — VIP`,
  (name: string) => `${name} desbloqueó el acceso VIP`,
  (name: string) => `${name} entró al equipo VIP`,
];

interface Notif {
  id: number;
  text: string;
}

function randomInterval() {
  return 60_000 + Math.random() * 120_000;
}

export function VipNotifications() {
  const [notif, setNotif] = useState<Notif | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const show = () => {
      const name = randomName();
      const msgFn = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      const id = Date.now();
      setNotif({ id, text: msgFn(name) });

      setTimeout(() => {
        setNotif(prev => (prev?.id === id ? null : prev));
      }, 5000);

      timeoutId = setTimeout(show, randomInterval());
    };

    const initialDelay = 8000 + Math.random() * 7000;
    timeoutId = setTimeout(show, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="fixed top-4 right-3 z-50 pointer-events-none">
      <AnimatePresence>
        {notif && (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -30, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{
              background: "linear-gradient(135deg, #1a1000 0%, #2d1f00 50%, #1a1000 100%)",
              border: "1px solid #b8860b",
              boxShadow: "0 0 0 1px rgba(255,200,50,0.15), 0 6px 32px rgba(180,130,0,0.45), 0 0 16px rgba(255,180,0,0.2)",
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl max-w-[280px]"
          >
            {/* Icono dorado */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base"
              style={{
                background: "linear-gradient(135deg, #f5a623 0%, #f7c948 50%, #c8860a 100%)",
                boxShadow: "0 0 10px rgba(245,166,35,0.6)",
              }}
            >
              👑
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "#f7c948", letterSpacing: "0.12em" }}
              >
                Nuevo VIP
              </span>
              <span className="text-[11px] font-semibold text-white leading-tight truncate">
                {notif.text}
              </span>
            </div>

            {/* Brillo lateral */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 60%, rgba(255,200,50,0.06) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
