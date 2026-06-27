import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Crosshair, User, Zap, LogOut, Menu, X, Target, Cpu, Wrench, Monitor, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

function clearVipSession() {
  localStorage.removeItem("beast-access");
  localStorage.removeItem("beast-key");
  localStorage.removeItem("beast-key-expiry");
  localStorage.removeItem("beast-username");
}

async function validateKeyWithServer(key: string): Promise<boolean> {
  try {
    const res = await fetch("/api/licenses/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.isVip === true;
  } catch {
    return true;
  }
}

export function VipLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expiry, setExpiry] = useState<string | null>(null);

  const kickOut = useCallback((reason?: string) => {
    clearVipSession();
    setLocation(reason === "expired" ? "/redeem?expired=1" : "/redeem?revoked=1");
  }, [setLocation]);

  const runValidation = useCallback(async () => {
    const access = localStorage.getItem("beast-access");
    if (access !== "vip") { setLocation("/redeem"); return; }

    // Fast client-side expiry check
    const expRaw = localStorage.getItem("beast-key-expiry");
    if (expRaw) {
      const expDate = new Date(expRaw);
      if (Date.now() > expDate.getTime()) {
        kickOut("expired");
        return;
      }
      setExpiry(expDate.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }));
    }

    // Server-side validation (revocation + real expiry)
    const key = localStorage.getItem("beast-key");
    if (key) {
      const valid = await validateKeyWithServer(key);
      if (!valid) {
        kickOut("revoked");
      }
    }
  }, [kickOut, setLocation]);

  useEffect(() => {
    runValidation();
    // Re-validate every 5 minutes while on VIP pages
    const interval = setInterval(runValidation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [runValidation]);

  const handleLogout = () => {
    clearVipSession();
    setLocation("/redeem");
  };

  const navItems = [
    { href: "/vip", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/vip/sensitivities", icon: Crosshair, label: "Sensibilidades" },
    { href: "/vip/headtrick", icon: Target, label: "Headtrick" },
    { href: "/vip/hud", icon: Monitor, label: "HUD Famosos" },
    { href: "/vip/optimizacion", icon: Cpu, label: "Optimización" },
    { href: "/vip/modificacion", icon: Wrench, label: "Modificación" },
    { href: "/vip/soporte", icon: MessageSquare, label: "Soporte" },
    { href: "/vip/profile", icon: User, label: "Perfil" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-center border-b border-primary/20">
        <Link href="/" className="cursor-pointer">
          <img src="/beast-logo.png" alt="Beast Sensi 7" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display uppercase tracking-widest text-sm
                ${isActive 
                  ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                  : "text-muted-foreground hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
                }
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-6 border-t border-primary/20" />

        <Link
          href="/sensitivity"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display uppercase tracking-widest text-sm text-muted-foreground hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
        >
          <Zap className="w-5 h-5 text-primary" />
          Generador
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-display uppercase tracking-widest text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut className="w-5 h-5" />
          Salir VIP
        </button>
      </div>

      <div className="p-4 border-t border-primary/20">
        <div className="bg-[rgba(139,92,246,0.1)] border border-primary/30 rounded-xl p-4 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <h4 className="font-display font-bold text-primary tracking-widest text-sm mb-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
              ACCESO VIP
            </h4>
            {expiry && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Expira: {expiry}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-primary/20 bg-[rgba(10,10,20,0.95)] backdrop-blur-xl z-20 shadow-[4px_0_30px_rgba(139,92,246,0.05)]">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[rgba(10,10,20,0.95)] backdrop-blur-xl border-b border-primary/20 z-30 flex items-center justify-between px-4 shadow-[0_4px_30px_rgba(139,92,246,0.1)]">
        <img src="/beast-logo.png" alt="Beast Sensi" className="h-8" />
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-[260px] bg-[rgba(10,10,20,0.95)] border-r border-primary/30 h-full flex flex-col animate-in slide-in-from-left">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0 pb-20 md:pb-0 scroll-smooth">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[rgba(10,10,20,0.97)] backdrop-blur-xl border-t border-primary/20 z-30 flex items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors min-w-0
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-[7px] uppercase font-display tracking-wide font-bold leading-tight text-center truncate w-full px-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
