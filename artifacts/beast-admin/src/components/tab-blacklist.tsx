import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Plus, RefreshCw, Loader2 } from "lucide-react";

interface TabBlacklistProps { token: string }

export function TabBlacklist({ token }: TabBlacklistProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const auth = { "x-admin-token": token };

  const [deviceId, setDeviceId] = useState("");
  const [reason, setReason] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["device-blacklist", token],
    queryFn: async () => {
      const r = await fetch("/api/admin/device-blacklist", { headers: auth });
      return r.json() as Promise<{ list: { id: number; deviceId: string; reason: string | null; createdAt: string }[] }>;
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/device-blacklist", {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, reason }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Dispositivo bloqueado", description: deviceId });
      setDeviceId(""); setReason("");
      qc.invalidateQueries({ queryKey: ["device-blacklist"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/admin/device-blacklist/${id}`, { method: "DELETE", headers: auth });
      if (!r.ok) throw new Error("Error al eliminar");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Dispositivo desbloqueado" });
      qc.invalidateQueries({ queryKey: ["device-blacklist"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="text-red-400 w-5 h-5" /> Blacklist de Dispositivos
        </h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/30 h-8">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Add form */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">Bloquear Dispositivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="Device ID (ej: DEV-3C7F6485)"
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              className="bg-black/40 border-primary/20 font-mono text-sm"
            />
            <Input
              placeholder="Razón (opcional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="bg-black/40 border-primary/20 text-sm"
            />
          </div>
          <Button
            onClick={() => addMut.mutate()}
            disabled={!deviceId.trim() || addMut.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {addMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Bloquear
          </Button>
        </CardContent>
      </Card>

      {/* Blacklist table */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">
            Dispositivos Bloqueados — {data?.list.length ?? 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !data?.list.length ? (
            <p className="text-center text-zinc-500 text-sm py-8">Sin dispositivos bloqueados</p>
          ) : (
            <div className="space-y-2">
              {data.list.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-red-500/20">
                  <Shield className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-red-300 truncate">{item.deviceId}</p>
                    {item.reason && <p className="text-xs text-zinc-500">{item.reason}</p>}
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => deleteMut.mutate(item.id)}
                    disabled={deleteMut.isPending}
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
