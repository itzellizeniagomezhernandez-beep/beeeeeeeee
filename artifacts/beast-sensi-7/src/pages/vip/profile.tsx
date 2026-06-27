import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { detectDevice } from "@/lib/device";
import { LogOut, Crown, Key, MonitorSmartphone, Clock } from "lucide-react";

export function VipProfile() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [deviceInfo, setDeviceInfo] = useState({ brand: "Detectando...", tier: "mid-range" });
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("beast-username");
    setUsername(user || "Beast Player");

    const ua = navigator.userAgent;
    setDeviceInfo(detectDevice(ua));

    const exp = localStorage.getItem("beast-key-expiry");
    if (exp) {
      const expDate = new Date(exp);
      setExpiryDate(expDate.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }));
      const diff = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, diff));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("beast-access");
    localStorage.removeItem("beast-username");
    localStorage.removeItem("beast-key-expiry");
    setLocation("/redeem");
  };

  const initial = username.charAt(0).toUpperCase() || "B";

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          Tu Perfil
        </h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6">

        {/* User Card */}
        <Card className="md:col-span-3 bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(0,0,0,0.5)] border-primary/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-black border-2 border-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center justify-center flex-shrink-0">
              <span className="text-5xl font-display font-black text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]">
                {initial}
              </span>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/20 border border-primary/50 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                <Crown className="w-3 h-3" /> MIEMBRO VIP
              </div>
              <h2 className="text-3xl font-display font-black tracking-widest uppercase mb-1">
                {username}
              </h2>

              {daysLeft !== null ? (
                <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${
                  daysLeft <= 3
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : daysLeft <= 7
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-green-500/10 border-green-500/30 text-green-400"
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {daysLeft === 0 ? "Expira hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg border bg-primary/10 border-primary/30 text-primary text-sm font-mono font-bold">
                  <Crown className="w-3.5 h-3.5" />
                  Acceso Permanente
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full md:w-auto px-6 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-display font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </CardContent>
        </Card>

        {/* Device Card */}
        <Card className="md:col-span-1 bg-[rgba(255,255,255,0.02)] border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <MonitorSmartphone className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-sm mb-4 text-zinc-400">Mi Dispositivo</h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Marca</p>
                <p className="font-mono text-lg font-bold text-white">{deviceInfo.brand}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Categoría</p>
                <div className="inline-flex px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-blue-400">
                  {deviceInfo.tier === 'flagship' ? 'Gama Alta' : deviceInfo.tier === 'mid-range' ? 'Gama Media' : 'Gama Baja'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Card */}
        <Card className="md:col-span-2 bg-[rgba(255,255,255,0.02)] border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
              <Key className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-display font-bold uppercase tracking-wider text-sm mb-4 text-zinc-400">Mi Licencia</h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                  <p className="font-mono text-sm font-bold text-green-400 uppercase">Activo</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Tipo</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/30 text-xs font-black uppercase tracking-wider text-primary">
                  <Crown className="w-3 h-3" /> VIP
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Expiración</p>
                {expiryDate ? (
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-zinc-300">{expiryDate}</p>
                    {daysLeft !== null && (
                      <p className={`text-xs font-mono font-bold ${daysLeft <= 3 ? "text-red-400" : daysLeft <= 7 ? "text-yellow-400" : "text-green-400"}`}>
                        {daysLeft === 0 ? "⚠ Expira hoy" : `${daysLeft} día${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-primary font-bold">♾ Permanente</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
