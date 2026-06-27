import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useRedeemLicense, useCheckLicenseStatus } from "@workspace/api-client-react";
import { detectDevice } from "@/lib/device";
import gifSeparador from "@assets/standard_2_1782354625171.gif";
import { Loader2, Crown, Globe, ShieldCheck } from "lucide-react";

function DeviceId(userAgent: string): string {
  const hash = Array.from(userAgent)
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffffffff, 0);
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `DEV-${hex.slice(0, 8)}`;
}

function useCountdown() {
  const DURATION = 6 * 60 * 60 * 1000; // 6 horas en ms
  const KEY = "beast-offer-deadline";

  const getDeadline = () => {
    const stored = localStorage.getItem(KEY);
    if (stored) return Number(stored);
    const deadline = Date.now() + DURATION;
    localStorage.setItem(KEY, String(deadline));
    return deadline;
  };

  const calc = (deadline: number) => {
    const diff = Math.max(0, deadline - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, done: diff === 0 };
  };

  const [time, setTime] = useState(() => calc(getDeadline()));

  useEffect(() => {
    const deadline = getDeadline();
    const id = setInterval(() => {
      const t = calc(deadline);
      setTime(t);
      if (t.done) {
        localStorage.removeItem(KEY);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export function Redeem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const countdown = useCountdown();
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [deviceId, setDeviceId] = useState("Detectando...");
  const [statusResult, setStatusResult] = useState<any>(null);
  const [kickReason, setKickReason] = useState<"expired" | "revoked" | null>(null);

  const redeemMutation = useRedeemLicense();
  const checkMutation = useCheckLicenseStatus();

  useEffect(() => {
    const ua = navigator.userAgent;
    setDeviceInfo(ua);
    setDeviceId(DeviceId(ua));

    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "1") setKickReason("expired");
    else if (params.get("revoked") === "1") setKickReason("revoked");
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    redeemMutation.mutate(
      { data: { key: key.toUpperCase().trim(), deviceInfo, username: username.trim() || undefined } },
      {
        onSuccess: (data) => {
          localStorage.setItem("beast-access", "vip");
          localStorage.setItem("beast-key", key.toUpperCase().trim());
          if (username.trim()) localStorage.setItem("beast-username", username.trim());
          if ((data as any)?.expiresAt) localStorage.setItem("beast-key-expiry", (data as any).expiresAt);
          setStatusResult(data);
          toast({ title: "VIP Activado", description: "Licencia canjeada con éxito." });
          setTimeout(() => setLocation("/vip"), 1200);
        },
        onError: (err: any) => {
          const msg = err?.data?.error ?? "Key inválida o ya utilizada.";
          if (msg.includes("ya fue utilizada") || msg.includes("expirado")) {
            checkMutation.mutate(
              { data: { key: key.toUpperCase().trim() } },
              {
                onSuccess: (data) => setStatusResult(data),
                onError: () => {},
              }
            );
          }
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const isPending = redeemMutation.isPending || checkMutation.isPending;

  const durationLabel: Record<string, string> = {
    "1day": "1 Día",
    "7days": "7 Días",
    "30days": "30 Días",
    permanent: "Permanente",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-10">

      <div className="w-full max-w-sm flex flex-col items-center gap-1 mb-6">
        <img
          src="/beast-logo.png"
          alt="Beast Sensi 7"
          className="w-40 h-40 object-contain drop-shadow-[0_0_24px_rgba(139,92,246,0.45)] mb-1 select-none"
          draggable={false}
        />
        <p className="text-xs tracking-[0.3em] text-zinc-400 uppercase">
          LEGIT &nbsp;·&nbsp; SEGURO &nbsp;·&nbsp; 100% HS
        </p>
      </div>

      {kickReason && (
        <div className={`w-full max-w-sm mb-6 rounded-xl border px-5 py-4 text-center ${
          kickReason === "expired"
            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <p className="font-display font-bold uppercase tracking-widest text-sm mb-1">
            {kickReason === "expired" ? "⏰ Licencia Expirada" : "🚫 Acceso Revocado"}
          </p>
          <p className="text-xs opacity-80">
            {kickReason === "expired"
              ? "Tu licencia VIP ha vencido. Consigue una nueva key para continuar."
              : "Tu acceso VIP fue revocado. Contacta soporte si crees que es un error."}
          </p>
        </div>
      )}

      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <p
          className="text-center text-xs uppercase tracking-[0.25em] text-zinc-500 mb-1 font-bold"
          style={{ letterSpacing: "0.22em" }}
        >
          INICIAR SESIÓN
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              USUARIO
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
              className="w-full h-12 rounded-lg px-4 text-sm bg-zinc-900 border border-zinc-700/60 text-white placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              LICENSE KEY
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full h-12 rounded-lg px-4 text-sm bg-zinc-900 border border-zinc-700/60 text-white placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono tracking-widest text-center"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
              DISPOSITIVO DETECTADO
            </label>
            <div className="h-12 rounded-lg px-4 flex items-center gap-2 bg-zinc-900 border border-zinc-700/60">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)] flex-shrink-0" />
              <span className="font-mono text-sm text-zinc-300 tracking-wider">{deviceId}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!key.trim() || isPending}
            className="w-full h-12 rounded-lg font-display font-bold text-sm tracking-widest uppercase mt-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: isPending || !key.trim()
                ? "rgba(139,92,246,0.4)"
                : "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              boxShadow: key.trim() && !isPending
                ? "0 0 18px rgba(139,92,246,0.4)"
                : "none",
            }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            VERIFICAR ACCESO
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 py-1">
          <span className="text-primary text-xs">⬡</span>
          <p className="text-[10px] text-zinc-500 text-center tracking-wide">
            Sistema seguro verificado por Beast Sensi
          </p>
          <span className="text-primary text-xs">⬡</span>
        </div>

        {!countdown.done && (
          <div className="w-full rounded-xl overflow-hidden" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div className="px-4 py-2 flex flex-col items-center gap-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary/80 font-mono">⚡ Oferta termina en</p>
              <div className="flex items-center gap-2">
                {[{ v: countdown.h, label: "HRS" }, { v: countdown.m, label: "MIN" }, { v: countdown.s, label: "SEG" }].map(({ v, label }, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="font-mono font-black text-2xl text-white tabular-nums" style={{ textShadow: "0 0 12px rgba(139,92,246,0.9)" }}>
                        {String(v).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">{label}</span>
                    </div>
                    {i < 2 && <span className="text-primary font-black text-xl mb-3">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <a
          href="https://wa.me/526462676766?text=Hola%2C%20quiero%20comprar%20una%20Key%20VIP%20de%20Beast%20Sensi%207"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            boxShadow: "0 0 14px rgba(22,163,74,0.3)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          COMPRAR KEY VIP
        </a>

        <div className="w-full flex justify-center">
          <img
            src={gifSeparador}
            alt=""
            className="w-full max-w-xs rounded-xl"
            style={{ maxHeight: "180px", objectFit: "cover" }}
          />
        </div>

        <button
          onClick={() => {
            localStorage.setItem("beast-access", "free");
            setLocation("/");
          }}
          className="w-full h-12 rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 border border-primary/40 bg-[rgba(255,255,255,0.02)] text-zinc-300 hover:border-primary hover:text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        >
          <Globe className="w-4 h-4 text-zinc-400" />
          VERSIÓN GRATIS
        </button>
      </div>

      {statusResult && (
        <div
          className="w-full max-w-sm mt-4 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${statusResult.isVip ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
            boxShadow: statusResult.isVip
              ? "0 0 24px rgba(139,92,246,0.3)"
              : "none",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Crown className={`w-5 h-5 ${statusResult.isVip ? "text-primary" : "text-zinc-600"}`} />
            <span className="font-display font-bold text-sm tracking-widest uppercase text-zinc-200">
              ESTADO DE LICENCIA
            </span>
          </div>

          {[
            { label: "Estado", value: statusResult.status?.toUpperCase(), highlight: statusResult.status === "used" },
            { label: "VIP Activo", value: statusResult.isVip ? "SÍ" : "NO", highlight: statusResult.isVip },
            { label: "Duración", value: durationLabel[statusResult.duration] ?? statusResult.duration },
            statusResult.expiresAt
              ? { label: "Expira", value: new Date(statusResult.expiresAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) }
              : statusResult.duration === "permanent"
              ? { label: "Expira", value: "Nunca (Permanente)" }
              : null,
          ]
            .filter(Boolean)
            .map((row: any) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0"
              >
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{row.label}</span>
                <span
                  className={`text-sm font-mono font-bold ${
                    row.highlight ? "text-primary drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]" : "text-zinc-200"
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}

          {statusResult.isVip && (
            <button
              onClick={() => setLocation("/sensitivity")}
              className="w-full h-11 rounded-lg font-display font-bold text-sm tracking-widest uppercase mt-1 flex items-center justify-center gap-2 transition-all"
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                boxShadow: "0 0 16px rgba(139,92,246,0.4)",
              }}
            >
              <Crown className="w-4 h-4" />
              VER SENSIBILIDAD VIP
            </button>
          )}
        </div>
      )}
    </div>
  );
}
