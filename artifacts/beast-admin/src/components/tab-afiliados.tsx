import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users2, Trash2, Plus, RefreshCw, Loader2, Copy, ExternalLink } from "lucide-react";

interface TabAfiliadosProps { token: string }

export function TabAfiliados({ token }: TabAfiliadosProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const auth = { "x-admin-token": token };

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["affiliates", token],
    queryFn: async () => {
      const r = await fetch("/api/admin/affiliates", { headers: auth });
      return r.json() as Promise<{ affiliates: { id: number; name: string; code: string; uses: number; createdAt: string }[] }>;
    },
  });

  const createMut = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: code || undefined }),
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "Afiliado creado" });
      setName(""); setCode("");
      qc.invalidateQueries({ queryKey: ["affiliates"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/affiliates/${id}`, { method: "DELETE", headers: auth });
    },
    onSuccess: () => {
      toast({ title: "Afiliado eliminado" });
      qc.invalidateQueries({ queryKey: ["affiliates"] });
    },
  });

  const copyLink = (affCode: string) => {
    const link = `${window.location.origin}/?ref=${affCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado", description: link });
  };

  const totalUses = data?.affiliates.reduce((s, a) => s + a.uses, 0) ?? 0;
  const sorted = [...(data?.affiliates ?? [])].sort((a, b) => b.uses - a.uses);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <Users2 className="text-primary w-5 h-5" /> Panel de Afiliados
          </h2>
          <p className="text-xs text-zinc-500 mt-1">{data?.affiliates.length ?? 0} afiliados · {totalUses} referidos totales</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/30 h-8">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Top affiliates */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {sorted.slice(0, 3).map((a, i) => (
            <Card key={a.id} className={`border ${i === 0 ? "border-yellow-500/30 bg-yellow-500/5" : "border-primary/20 bg-primary/5"}`}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-display font-black text-white">{a.uses}</p>
                <p className="text-xs text-zinc-400 mt-0.5 truncate">{a.name}</p>
                <p className="text-[10px] font-mono text-primary mt-1">{a.code}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create form */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">Nuevo Afiliado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nombre del afiliado"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-black/40 border-primary/20 text-sm"
            />
            <Input
              placeholder="Código personalizado (opcional)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="bg-black/40 border-primary/20 font-mono text-sm uppercase"
            />
          </div>
          <Button onClick={() => createMut.mutate()} disabled={!name.trim() || createMut.isPending}>
            {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Crear Afiliado
          </Button>
        </CardContent>
      </Card>

      {/* Affiliates list */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm">
            Lista de Afiliados — {data?.affiliates.length ?? 0}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !sorted.length ? (
            <p className="text-center text-zinc-500 text-sm py-8">Sin afiliados registrados</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((aff, i) => (
                <div key={aff.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-primary/10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-yellow-500 text-black" : "bg-primary/20 text-primary"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{aff.name}</p>
                    <p className="text-xs font-mono text-primary">{aff.code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-display font-black text-white">{aff.uses}</p>
                    <p className="text-[10px] text-zinc-500">referidos</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => copyLink(aff.code)} className="h-7 w-7 p-0 text-zinc-500 hover:text-primary" title="Copiar link">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(aff.code); toast({ title: "Código copiado" }); }} className="h-7 w-7 p-0 text-zinc-500 hover:text-primary" title="Copiar código">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate(aff.id)} className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400">
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
