import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Trash2, RefreshCw, Loader2, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface TabTicketsProps { token: string }

export function TabTickets({ token }: TabTicketsProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const auth = { "x-admin-token": token };

  const [expanded, setExpanded] = useState<number | null>(null);
  const [reply, setReply] = useState<Record<number, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["support-tickets", token],
    queryFn: async () => {
      const r = await fetch("/api/admin/support-tickets", { headers: auth });
      return r.json() as Promise<{ tickets: any[] }>;
    },
    refetchInterval: 60000,
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, status, adminReply }: { id: number; status?: string; adminReply?: string }) => {
      const r = await fetch(`/api/admin/support-tickets/${id}`, {
        method: "PATCH",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminReply }),
      });
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket actualizado" });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/support-tickets/${id}`, { method: "DELETE", headers: auth });
    },
    onSuccess: () => {
      toast({ title: "Ticket eliminado" });
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });

  const statusColor: Record<string, string> = {
    open: "border-yellow-500/40 text-yellow-400",
    "in-progress": "border-blue-500/40 text-blue-400",
    resolved: "border-green-500/40 text-green-400",
  };

  const filtered = (data?.tickets ?? []).filter(
    (t: any) => filterStatus === "all" || t.status === filterStatus
  );

  const open = (data?.tickets ?? []).filter((t: any) => t.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="text-primary w-5 h-5" /> Tickets de Soporte
          </h2>
          {open > 0 && (
            <p className="text-xs text-yellow-400 mt-0.5">⚠️ {open} ticket{open > 1 ? "s" : ""} abierto{open > 1 ? "s" : ""}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {["all", "open", "in-progress", "resolved"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === s ? "bg-primary text-white" : "bg-primary/10 text-zinc-400 hover:bg-primary/20"}`}
            >
              {s === "all" ? "Todos" : s === "open" ? "Abiertos" : s === "in-progress" ? "En Proceso" : "Resueltos"}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/30 h-8">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !filtered.length ? (
            <p className="text-center text-zinc-500 text-sm py-8">Sin tickets</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((ticket: any) => (
                <div key={ticket.id} className="rounded-xl bg-black/40 border border-primary/10 overflow-hidden">
                  {/* Header */}
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-primary/5 transition-colors"
                    onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{ticket.subject}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusColor[ticket.status] ?? "text-zinc-400"}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {ticket.username && <span className="mr-2">@{ticket.username}</span>}
                        {ticket.licenseKey && <span className="font-mono text-zinc-600 mr-2">{ticket.licenseKey}</span>}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {expanded === ticket.id ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                  </button>

                  {/* Expanded */}
                  {expanded === ticket.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-primary/10 pt-3">
                      <p className="text-sm text-zinc-300 leading-relaxed">{ticket.message}</p>

                      {ticket.adminReply && (
                        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                          <p className="text-xs text-primary font-bold mb-1">Tu respuesta:</p>
                          <p className="text-sm text-zinc-300">{ticket.adminReply}</p>
                        </div>
                      )}

                      <textarea
                        placeholder="Escribir respuesta..."
                        value={reply[ticket.id] ?? ""}
                        onChange={e => setReply(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="w-full bg-black/60 border border-primary/20 rounded-lg p-3 text-sm text-white resize-none h-20 placeholder:text-zinc-600 focus:outline-none focus:border-primary/50"
                      />

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => updateMut.mutate({ id: ticket.id, adminReply: reply[ticket.id] ?? "", status: "in-progress" })}
                          disabled={updateMut.isPending}
                          className="h-8 text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" /> Responder
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          onClick={() => updateMut.mutate({ id: ticket.id, status: "resolved", adminReply: reply[ticket.id] })}
                          disabled={updateMut.isPending}
                          className="h-8 text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Marcar Resuelto
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => deleteMut.mutate(ticket.id)}
                          disabled={deleteMut.isPending}
                          className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
