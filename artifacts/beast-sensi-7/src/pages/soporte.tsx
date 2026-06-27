import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, CheckCircle, Loader2, ChevronDown } from "lucide-react";

const COMMON_ISSUES = [
  { q: "Mi clave no funciona", hint: "Clave expirada o dispositivo diferente" },
  { q: "No puedo acceder al VIP", hint: "Problema de autenticación" },
  { q: "Los archivos no descargan", hint: "Error en link o descarga" },
  { q: "Error al escanear mi dispositivo", hint: "Detección de hardware" },
  { q: "Otro problema", hint: "" },
];

export function Soporte() {
  const [form, setForm] = useState({
    username: "",
    licenseKey: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const handleSelect = (q: string) => {
    setSelectedIssue(q);
    setForm(f => ({ ...f, subject: q === "Otro problema" ? "" : q }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError("El asunto y el mensaje son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (r.ok && d.ok) {
        setSent(true);
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-white mb-2">
          Soporte
        </h1>
        <p className="text-zinc-400 text-sm">
          ¿Tuviste un problema? Cuéntanos y te respondemos a la brevedad.
        </p>
      </motion.div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-8 rounded-2xl border border-green-500/30 bg-green-500/5"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-2">
            Ticket Enviado
          </h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Recibimos tu mensaje. Te responderemos lo antes posible. Puedes contactarnos también por WhatsApp si es urgente.
          </p>
          <button
            onClick={() => { setSent(false); setForm({ username: "", licenseKey: "", subject: "", message: "" }); setSelectedIssue(null); }}
            className="mt-6 px-6 py-2 rounded-xl border border-primary/30 text-primary text-sm font-display uppercase tracking-wider hover:bg-primary/10 transition-colors"
          >
            Enviar otro ticket
          </button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Quick issue selector */}
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3 block">
              ¿Cuál es tu problema?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_ISSUES.map(({ q, hint }) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelect(q)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedIssue === q
                      ? "border-primary bg-primary/10 text-white"
                      : "border-primary/20 bg-black/30 text-zinc-400 hover:border-primary/40 hover:text-white"
                  }`}
                >
                  <p className="text-sm font-bold">{q}</p>
                  {hint && <p className="text-[11px] text-zinc-600 mt-0.5">{hint}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Subject (custom if "Otro") */}
          {selectedIssue === "Otro problema" && (
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
                Asunto
              </label>
              <input
                type="text"
                placeholder="Describe brevemente el problema"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          {/* Username + key */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
                Tu usuario (opcional)
              </label>
              <input
                type="text"
                placeholder="ej: BeastPlayer123"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
                Tu licencia (opcional)
              </label>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={form.licenseKey}
                onChange={e => setForm(f => ({ ...f, licenseKey: e.target.value.toUpperCase() }))}
                className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 block">
              Describe tu problema <span className="text-primary">*</span>
            </label>
            <textarea
              placeholder="Explica con detalle qué pasó, desde cuándo ocurre, qué intentaste hacer..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={5}
              className="w-full bg-black/40 border border-primary/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !selectedIssue}
            className="w-full py-3.5 rounded-xl font-display font-black uppercase tracking-widest text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Enviando..." : "Enviar Ticket"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            También puedes contactarnos directo por{" "}
            <a href="https://wa.me/526462676766" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
              WhatsApp
            </a>
            {" "}para respuesta inmediata.
          </p>
        </motion.form>
      )}
    </div>
  );
}
