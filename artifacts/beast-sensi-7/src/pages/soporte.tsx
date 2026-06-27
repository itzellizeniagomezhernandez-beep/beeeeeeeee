import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, CheckCircle, Loader2, Clock, RefreshCw } from "lucide-react";

const COMMON_ISSUES = [
  { q: "Mi clave no funciona", hint: "Clave expirada o dispositivo diferente" },
  { q: "No puedo acceder al VIP", hint: "Problema de autenticación" },
  { q: "Los archivos no descargan", hint: "Error en link o descarga" },
  { q: "Error al escanear mi dispositivo", hint: "Detección de hardware" },
  { q: "Otro problema", hint: "" },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:          { label: "Abierto",    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",  icon: <Clock className="w-3 h-3" /> },
  "in-progress": { label: "En proceso", color: "text-blue-400 border-blue-500/30 bg-blue-500/5",        icon: <Loader2 className="w-3 h-3" /> },
  resolved:      { label: "Resuelto",   color: "text-green-400 border-green-500/30 bg-green-500/5",     icon: <CheckCircle className="w-3 h-3" /> },
};

const STORAGE_KEY = "beast-my-tickets";

function loadSavedIds(): number[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveId(id: number) {
  const ids = loadSavedIds();
  if (!ids.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]));
}

async function fetchTickets(ids: number[]): Promise<any[]> {
  const results = await Promise.all(
    ids.map(id => fetch(`/api/support-tickets/lookup?id=${id}`).then(r => r.ok ? r.json() : null))
  );
  return results.flatMap(r => r?.tickets ?? []);
}

/* ── My Tickets (auto-loaded) ──────────────────────────────────────────── */
function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const ids = loadSavedIds();
    if (!ids.length) return;
    setLoading(true);
    const t = await fetchTickets(ids);
    setTickets(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (!loadSavedIds().length) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Mis tickets
        </h2>
        <button onClick={load} className="text-zinc-500 hover:text-primary transition-colors" title="Actualizar">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {loading && !tickets.length ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => {
            const st = STATUS_LABELS[t.status] ?? { label: t.status, color: "text-zinc-400 border-zinc-500/30 bg-zinc-500/5", icon: null };
            return (
              <div key={t.id} className="rounded-xl border border-primary/15 bg-black/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
                  <div>
                    <p className="font-bold text-sm text-white">{t.subject}</p>
                    <p className="text-[11px] text-zinc-600 font-mono mt-0.5">
                      Ticket #{t.id} · {new Date(t.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${st.color}`}>
                    {st.icon} {st.label}
                  </span>
                </div>
                <div className="px-4 py-3">
                  {t.adminReply ? (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Respuesta del equipo</p>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{t.adminReply}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-yellow-500/60 shrink-0" />
                      En espera de respuesta. Te contestamos a la brevedad.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ── Main page ──────────────────────────────────────────────────────────── */
export function SoporteForm({ source = "public", prefillUsername = "", prefillLicenseKey = "" }: {
  source?: "public" | "vip";
  prefillUsername?: string;
  prefillLicenseKey?: string;
}) {
  const [form, setForm] = useState({ username: prefillUsername, licenseKey: prefillLicenseKey, subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const handleSelect = (q: string) => {
    setSelectedIssue(q);
    setForm(f => ({ ...f, subject: q === "Otro problema" ? "" : q }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) { setError("El asunto y el mensaje son obligatorios."); return; }
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        saveId(d.id);
        setSent({ id: d.id });
      } else {
        setError(d.error ?? "Error al enviar. Intenta de nuevo.");
      }
    } catch { setError("Error de conexión. Intenta de nuevo."); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <div className="text-center py-10 px-8 rounded-2xl border border-green-500/30 bg-green-500/5">
      <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-3" />
      <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-1">Ticket Enviado</h2>
      <p className="text-zinc-500 text-sm mb-1">Número: <span className="font-mono text-primary font-bold">#{sent.id}</span></p>
      <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-5">Cuando respondamos, la respuesta aparecerá aquí arriba automáticamente.</p>
      <button onClick={() => { setSent(null); setForm({ username: prefillUsername, licenseKey: prefillLicenseKey, subject: "", message: "" }); setSelectedIssue(null); }}
        className="px-6 py-2 rounded-xl border border-primary/30 text-primary text-sm font-display uppercase tracking-wider hover:bg-primary/10 transition-colors"
      >
        Nuevo ticket
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block">¿Cuál es tu problema?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMMON_ISSUES.map(({ q, hint }) => (
            <button key={q} type="button" onClick={() => handleSelect(q)}
              className={`text-left p-3 rounded-xl border transition-all ${selectedIssue === q ? "border-primary bg-primary/10 text-white" : "border-primary/20 bg-black/30 text-zinc-400 hover:border-primary/40 hover:text-white"}`}
            >
              <p className="text-sm font-bold">{q}</p>
              {hint && <p className="text-[11px] text-zinc-600 mt-0.5">{hint}</p>}
            </button>
          ))}
        </div>
      </div>

      {selectedIssue === "Otro problema" && (
        <div>
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Asunto</label>
          <input type="text" placeholder="Describe brevemente el problema" value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      )}

      {source === "public" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Tu usuario (opcional)</label>
            <input type="text" placeholder="ej: BeastPlayer123" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Tu licencia (opcional)</label>
            <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX" value={form.licenseKey}
              onChange={e => setForm(f => ({ ...f, licenseKey: e.target.value.toUpperCase() }))}
              className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
          Describe tu problema <span className="text-primary">*</span>
        </label>
        <textarea placeholder="Explica con detalle qué pasó, desde cuándo ocurre, qué intentaste hacer..." value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          rows={4}
          className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

      <button type="submit" disabled={loading || !selectedIssue}
        className="w-full py-3.5 rounded-xl font-display font-black uppercase tracking-widest text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? "Enviando..." : "Enviar Ticket"}
      </button>

      {source === "public" && (
        <p className="text-center text-xs text-zinc-600">
          También por{" "}
          <a href="https://wa.me/526462676766" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">WhatsApp</a>
          {" "}para respuesta inmediata.
        </p>
      )}
    </form>
  );
}

export function Soporte() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-white mb-2">Soporte</h1>
        <p className="text-zinc-400 text-sm">¿Tuviste un problema? Cuéntanos y te respondemos a la brevedad.</p>
      </motion.div>

      {/* Auto-show my tickets */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <MyTickets />
      </motion.div>

      {/* Send form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-6"
      >
        <h2 className="font-display font-black text-lg uppercase tracking-wider text-white flex items-center gap-2 mb-5">
          <Send className="w-5 h-5 text-primary" /> Abrir ticket
        </h2>
        <SoporteForm source="public" />
      </motion.div>

      {/* Hint */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-center text-xs text-zinc-600"
      >
        ¿No ves la respuesta? El equipo aún no ha respondido — te contestamos lo más pronto posible 🙌
      </motion.p>
    </div>
  );
}
