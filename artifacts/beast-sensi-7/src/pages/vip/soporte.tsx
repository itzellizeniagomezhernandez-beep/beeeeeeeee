import { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, Loader2, Clock, CheckCircle, Send } from "lucide-react";
import { SoporteForm } from "@/pages/soporte";
import { motion } from "framer-motion";

const STORAGE_KEY = "beast-my-tickets";

function loadSavedIds(): number[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:          { label: "Abierto",    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",  icon: <Clock className="w-3 h-3" /> },
  "in-progress": { label: "En proceso", color: "text-blue-400 border-blue-500/30 bg-blue-500/5",        icon: <Loader2 className="w-3 h-3" /> },
  resolved:      { label: "Resuelto",   color: "text-green-400 border-green-500/30 bg-green-500/5",     icon: <CheckCircle className="w-3 h-3" /> },
};

export function VipSoporte() {
  const username = typeof window !== "undefined" ? localStorage.getItem("beast-username") ?? "" : "";
  const licenseKey = typeof window !== "undefined" ? localStorage.getItem("beast-key") ?? "" : "";

  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [view, setView] = useState<"tickets" | "nuevo">("tickets");

  const loadTickets = async () => {
    const ids = loadSavedIds();
    if (!ids.length) { setTickets([]); return; }
    setTicketLoading(true);
    try {
      // Also load by license key if available
      const byLicense = licenseKey
        ? fetch(`/api/support-tickets/lookup?licenseKey=${encodeURIComponent(licenseKey)}`).then(r => r.ok ? r.json() : null)
        : Promise.resolve(null);
      const byIds = Promise.all(ids.map(id => fetch(`/api/support-tickets/lookup?id=${id}`).then(r => r.ok ? r.json() : null)));
      const [licRes, idsRes] = await Promise.all([byLicense, byIds]);
      const all: any[] = [];
      const seen = new Set<number>();
      const add = (t: any) => { if (!seen.has(t.id)) { seen.add(t.id); all.push(t); } };
      (licRes?.tickets ?? []).forEach(add);
      idsRes.flatMap((r: any) => r?.tickets ?? []).forEach(add);
      all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTickets(all);
    } finally {
      setTicketLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black text-xl uppercase tracking-wider text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Soporte VIP
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setView("tickets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${view === "tickets" ? "bg-primary text-white" : "bg-primary/10 text-zinc-400 hover:bg-primary/20"}`}
          >
            Mis tickets
          </button>
          <button onClick={() => setView("nuevo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${view === "nuevo" ? "bg-primary text-white" : "bg-primary/10 text-zinc-400 hover:bg-primary/20"}`}
          >
            <Send className="w-3 h-3 inline mr-1" /> Nuevo
          </button>
        </div>
      </div>

      {view === "nuevo" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-5"
        >
          <SoporteForm
            source="vip"
            prefillUsername={username}
            prefillLicenseKey={licenseKey}
          />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
            <button onClick={loadTickets} className="text-zinc-500 hover:text-primary transition-colors" title="Actualizar">
              {ticketLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          </div>

          {ticketLoading && !tickets.length ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !tickets.length ? (
            <div className="text-center py-12 rounded-2xl border border-primary/10 bg-black/20">
              <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No tienes tickets aún.</p>
              <button onClick={() => setView("nuevo")}
                className="mt-4 px-5 py-2 rounded-xl font-display font-bold uppercase tracking-wider text-white text-xs"
                style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
              >
                Abrir primer ticket
              </button>
            </div>
          ) : (
            tickets.map((t: any) => {
              const hasReply = !!t.adminReply;
              const st = STATUS_LABELS[t.status] ?? { label: t.status, color: "text-zinc-400 border-zinc-500/30 bg-zinc-500/5", icon: null };
              return (
                <div key={t.id} className={`rounded-xl border overflow-hidden transition-all ${hasReply ? "border-primary/30" : "border-primary/10"} bg-black/40`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
                    <div>
                      <p className="font-bold text-sm text-white">{t.subject}</p>
                      <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
                        #{t.id} · {new Date(t.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    {hasReply ? (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Respuesta del equipo</p>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{t.adminReply}</p>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-yellow-500/60 shrink-0" />
                        En espera de respuesta.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
}
