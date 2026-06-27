import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, BarChart2, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TabAnalyticsProps {
  token: string;
}

export function TabAnalytics({ token }: TabAnalyticsProps) {
  const [days, setDays] = useState(30);
  const authHeader = { "x-admin-token": token };

  const { data: growth, isLoading, refetch } = useQuery({
    queryKey: ["analytics-growth", token, days],
    queryFn: async () => {
      const r = await fetch(`/api/admin/analytics/growth?days=${days}`, { headers: authHeader });
      const d = await r.json();
      return (d.growth ?? []).map((row: any) => ({
        day: new Date(row.day).toLocaleDateString("es", { month: "short", day: "numeric" }),
        total: Number(row.total),
        usadas: Number(row.used),
        activas: Number(row.active),
        revocadas: Number(row.revoked),
      }));
    },
  });

  const { data: dlGrowth } = useQuery({
    queryKey: ["analytics-dl-growth", token],
    queryFn: async () => {
      const r = await fetch(`/api/admin/analytics/downloads-growth`, { headers: authHeader });
      const d = await r.json();
      return (d.growth ?? []).map((row: any) => ({
        day: new Date(row.day).toLocaleDateString("es", { month: "short", day: "numeric" }),
        descargas: Number(row.total),
      }));
    },
  });

  const totalCreadas = growth?.reduce((s: number, r: any) => s + r.total, 0) ?? 0;
  const totalUsadas = growth?.reduce((s: number, r: any) => s + r.usadas, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" /> Analíticas
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Crecimiento y estadísticas de los últimos {days} días</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30, 60, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${days === d ? "bg-primary text-white" : "bg-primary/10 text-zinc-400 hover:bg-primary/20 hover:text-white"}`}
            >
              {d}d
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-primary/30 h-8">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Licencias Creadas", value: totalCreadas, color: "text-primary" },
          { label: "Licencias Usadas", value: totalUsadas, color: "text-green-400" },
          { label: "Tasa de Activación", value: totalCreadas > 0 ? `${Math.round((totalUsadas / totalCreadas) * 100)}%` : "0%", color: "text-yellow-400" },
          { label: "Días Analizados", value: `${days}d`, color: "text-blue-400" },
        ].map(c => (
          <Card key={c.label} className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{c.label}</p>
              <p className={`text-2xl font-display font-black mt-1 ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* License growth chart */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Crecimiento de Licencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !growth?.length ? (
            <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
              Sin datos para este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Creadas" />
                <Line type="monotone" dataKey="usadas" stroke="#22c55e" strokeWidth={2} dot={false} name="Usadas" />
                <Line type="monotone" dataKey="activas" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Activas" />
                <Line type="monotone" dataKey="revocadas" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Revocadas" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Downloads growth chart */}
      <Card className="bg-[rgba(255,255,255,0.02)] border border-primary/20">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wider text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Contenido Publicado (últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dlGrowth?.length ? (
            <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
              Sin datos de publicaciones
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dlGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="descargas" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Publicados" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
