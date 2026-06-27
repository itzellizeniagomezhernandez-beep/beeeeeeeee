import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle, Loader2, Search, Clock, AlertCircle } from "lucide-react";

const COMMON_ISSUES = [
  { q: "Mi clave no funciona", hint: "Clave expirada o dispositivo diferente" },
  { q: "No puedo acceder al VIP", hint: "Problema de autenticación" },
  { q: "Los archivos no descargan", hint: "Error en link o descarga" },
  { q: "Error al escanear mi dispositivo", hint: "Detección de hardware" },
  { q: "Otro problema", hint: "" },
];

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:         { label: "Abierto",     color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5",  icon: <Clock className="w-4 h-4" /> },
  "in-progress":{ label: "En proceso",  color: "text-blue-400 border-blue-500/30 bg-blue-500/5",         icon: <Loader2 className="w-4 h-4" /> },
  resolved:     { label: "Resuelto",    color: "text-green-400 border-green-500/30 bg-green-500/5",      icon: <CheckCircle className="w-4 h-4" /> },
};

/* ── Lookup section ─────────────────────────────────────────────────────── */
function TicketLookup() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"id" | "licencia">("id");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setErr(null);
    try {
      const param = mode === "id" ? `id=${encodeURIComponent(query.trim())}` : `licenseKey=${encodeURIComponent(query.trim().toUpperCase())}`;
      const r = await fetch(`/api/support-tickets/lookup?${param}`);
      const d = await r.json();
      if (r.ok) {
        setResult(d.tickets);
      } else {
        setErr(d.error ?? "No encontrado");
      }
    } catch {
      setErr("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-6">
      <h2 className="font-display font-black text-lg uppercase tracking-wider text-white mb-1 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" /> Consultar mi ticket
      </h2>
      <p className="text-zinc-500 text-xs mb-5">
        Busca por número de ticket o por tu licencia para ver la respuesta del admin.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(["id", "licencia"] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setQuery(""); setResult(null); setErr(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === m ? "bg-primary text-white" : "bg-primary/10 text-zinc-400 hover:bg-primary/20"}`}
          >
            {m === "id" ? "N° de ticket" : "Mi licencia"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={mode === "id" ? "Ej: 12" : "XXXX-XXXX-XXXX-XXXX"}
          className="flex-1 bg-black/40 border border-primary/20 rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl font-display font-black uppercase tracking-wider text-white text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all"
          style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </form>

      <AnimatePresence>
        {err && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> {err}
          </motion.div>
        )}

        {result && result.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            {result.map((t: any) => {
              const st = STATUS_LABELS[t.status] ?? { label: t.status, color: "text-zinc-400 border-zinc-500/30 bg-zinc-500/5", icon: null };
              return (
                <div key={t.id} className="rounded-xl border border-primary/15 bg-black/40 overflow-hidden">
                  {/* Header */}
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

                  {/* Admin reply or waiting */}
                  <div className="px-4 py-3">
                    {t.adminReply ? (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Respuesta del equipo</p>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{t.adminReply}</p>
                        {t.resolvedAt && (
                          <p className="text-[11px] text-zinc-600 mt-2">
                            Resuelto el {new Date(t.resolvedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500/60 shrink-0" />
                        Tu ticket está en espera de respuesta. Te contactaremos a la brevedad.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export function Soporte() {
  const [form, setForm] = useState({ username: "", licenseKey: "", subject: "", message: "" });
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
    if (!form.subject.trim() || !form.message.trim()) {
      setError("El asunto y el mensaje son obligatorios."); return;
    }
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        setSent({ id: d.id });
      } else {
        setError(d.error ?? "Error al enviar. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-white mb-2">Soporte</h1>
        <p className="text-zinc-400 text-sm">¿Tuviste un problema? Cuéntanos y te respondemos a la brevedad.</p>
      </motion.div>

      {/* ── Send ticket ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {sent ? (
          <div className="text-center py-12 px-8 rounded-2xl border border-green-500/30 bg-green-500/5">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-1">Ticket Enviado</h2>
            <p className="text-zinc-500 text-sm mb-1">
              Número de ticket: <span className="font-mono text-primary font-bold">#{sent.id}</span>
            </p>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6">
              Guarda ese número para consultar la respuesta aquí abajo. Te respondemos a la brevedad.
            </p>
            <button
              onClick={() => { setSent(null); setForm({ username: "", licenseKey: "", subject: "", message: "" }); setSelectedIssue(null); }}
              className="px-6 py-2 rounded-xl border border-primary/30 text-primary text-sm font-display uppercase tracking-wider hover:bg-primary/10 transition-colors"
            >
              Enviar otro ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-primary/20 bg-[rgba(255,255,255,0.02)] p-6">
            <h2 className="font-display font-black text-lg uppercase tracking-wider text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Abrir ticket
            </h2>

            {/* Quick selector */}
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

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
                Describe tu problema <span className="text-primary">*</span>
              </label>
              <textarea placeholder="Explica con detalle qué pasó, desde cuándo ocurre, qué intentaste hacer..." value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={5}
                className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={loading || !selectedIssue}
              className="w-full py-3.5 rounded-xl font-display font-black uppercase tracking-widest text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? "Enviando..." : "Enviar Ticket"}
            </button>

            <p className="text-center text-xs text-zinc-600">
              También puedes contactarnos por{" "}
              <a href="https://wa.me/526462676766" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">WhatsApp</a>
              {" "}para respuesta inmediata.
            </p>
          </form>
        )}
      </motion.div>

      {/* ── Consultar ticket ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TicketLookup />
      </motion.div>
    </div>
  );
}
