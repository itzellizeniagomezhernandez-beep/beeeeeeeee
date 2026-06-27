import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tag, Trash2, Plus, RefreshCw, Loader2, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TabDescuentosProps { token: string }

export function TabDescuentos({ token }: TabDescuentosProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const auth = { "x-admin-token": token };

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [durationGift, setDurationGift] = useState("7days");
  const [maxUses, setMaxUses] = useState("1");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["discount-codes", token],
    queryFn: async () => {
      const r = await fetch("/api/admin/discount-codes", { headers: auth });
      return r.json() as Promise<{ codes: any[] }>;
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ code: code || undefined, description, durationGift, maxUses: Number(maxUses) }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Código creado" });
      setCode(""); setDescription("");
      qc.invalidateQueries({ queryKey: ["discount-codes"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/admin/discount-codes/${id}/toggle`, { method: "PATCH", headers: auth });
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discount-codes"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/discount-codes/${id}`, { method: "DELETE", headers: auth });
    },
    onSuccess: () => {
      toast({ title: "Código eliminado" });
      qc.invalidateQueries({ queryKey: ["discount-codes"] });
    },
  });

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    toast({ title: "Código copiado", description: c });
  };

  const durationLabels: Record<string, string> = {
    "1day": "1 Día", "7days": "7 Días", "30days": "30 Días", "permanent": "Permanente"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
          <Tag className="text-primary w-5 h-5" /> Códigos de Descuento
        </h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/30 h-8">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Create form */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">Crear Código</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="Código (dejar vacío para generar automático)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="bg-black/40 border-primary/20 font-mono text-sm uppercase"
            />
            <Input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-black/40 border-primary/20 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Select value={durationGift} onValueChange={setDurationGift}>
              <SelectTrigger className="bg-black/40 border-primary/20">
                <SelectValue placeholder="Regalo de duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">Regalar 1 Día</SelectItem>
                <SelectItem value="7days">Regalar 7 Días</SelectItem>
                <SelectItem value="30days">Regalar 30 Días</SelectItem>
                <SelectItem value="permanent">Regalar Permanente</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Usos máximos"
              value={maxUses}
              min={1}
              onChange={e => setMaxUses(e.target.value)}
              className="bg-black/40 border-primary/20 text-sm"
            />
          </div>
          <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Crear Código
          </Button>
        </CardContent>
      </Card>

      {/* Codes list */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">
            Códigos Activos — {data?.codes.length ?? 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !data?.codes.length ? (
            <p className="text-center text-zinc-500 text-sm py-8">Sin códigos creados</p>
          ) : (
            <div className="space-y-2">
              {data.codes.map((item: any) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.active ? "bg-black/40 border-primary/20" : "bg-black/20 border-zinc-700/20 opacity-60"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary text-sm">{item.code}</span>
                      <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">
                        {durationLabels[item.durationGift] ?? item.durationGift}
                      </Badge>
                      {!item.active && <Badge variant="outline" className="text-[10px] border-zinc-600 text-zinc-500">Inactivo</Badge>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.description && <span className="mr-2">{item.description}</span>}
                      <span className="font-mono text-zinc-400">{item.usedCount}/{item.maxUses} usos</span>
                      {item.expiresAt && <span className="ml-2">· vence {new Date(item.expiresAt).toLocaleDateString()}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => copyCode(item.code)} className="h-7 w-7 p-0 text-zinc-500 hover:text-primary">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMut.mutate(item.id)} className="h-7 w-7 p-0 text-zinc-500 hover:text-yellow-400">
                      {item.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate(item.id)} className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
