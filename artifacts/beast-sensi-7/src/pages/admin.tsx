import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { 
  useAdminLogin, 
  useAdminListLicenses, 
  getAdminListLicensesQueryKey,
  useAdminGenerateLicenses,
  useAdminRevokeLicense,
  useAdminDeleteLicense,
  useAdminCreateDownload,
  useAdminDeleteDownload,
  useAdminGetStats,
  getAdminGetStatsQueryKey,
  useAdminSetSetting
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminToken, setAdminToken, clearAdminToken } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, Download as DownloadIcon, Activity, Settings, Plus, Trash2, Ban } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Admin() {
  const { toast } = useToast();
  const [token, setToken] = useState(getAdminToken());
  const [password, setPassword] = useState("");
  
  const loginMutation = useAdminLogin();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (data) => {
        setToken(data.token);
        setAdminToken(data.token);
        toast({ title: "Acceso concedido" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Contraseña incorrecta" });
      }
    });
  };

  const handleLogout = () => {
    clearAdminToken();
    setToken(null);
  };

  if (!token) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="font-display text-3xl tracking-wider text-primary">ADMIN PANEL</CardTitle>
              <CardDescription>Acceso restringido solo para administradores</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" className="w-full font-display tracking-widest bg-primary text-primary-foreground hover:bg-primary/80">
                  INGRESAR
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display text-primary tracking-widest">PANEL DE CONTROL</h1>
            <p className="text-muted-foreground">Gestiona licencias, descargas y configuración.</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-destructive/50 text-destructive hover:bg-destructive/10">
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto h-auto p-1 flex-wrap">
            <TabsTrigger value="stats" className="font-display tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Activity className="w-4 h-4 mr-2" /> ESTADÍSTICAS</TabsTrigger>
            <TabsTrigger value="licenses" className="font-display tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Key className="w-4 h-4 mr-2" /> LICENCIAS</TabsTrigger>
            <TabsTrigger value="downloads" className="font-display tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><DownloadIcon className="w-4 h-4 mr-2" /> DESCARGAS</TabsTrigger>
            <TabsTrigger value="settings" className="font-display tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Settings className="w-4 h-4 mr-2" /> AJUSTES</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="stats"><StatsTab /></TabsContent>
            <TabsContent value="licenses"><LicensesTab /></TabsContent>
            <TabsContent value="downloads"><DownloadsTab /></TabsContent>
            <TabsContent value="settings"><SettingsTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}

function StatsTab() {
  const { data: stats } = useAdminGetStats({ query: { queryKey: getAdminGetStatsQueryKey() }});
  
  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Licencias</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-display text-foreground">{stats.total}</p></CardContent>
      </Card>
      <Card className="bg-card/50 border-primary/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-primary">Activas</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-display text-primary">{stats.active}</p></CardContent>
      </Card>
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Usadas</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-display text-foreground">{stats.used}</p></CardContent>
      </Card>
      <Card className="bg-card/50 border-destructive/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Expiradas/Revocadas</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-display text-destructive">{stats.expired + stats.revoked}</p></CardContent>
      </Card>
    </div>
  );
}

function LicensesTab() {
  const { toast } = useToast();
  const { data: licenses, refetch } = useAdminListLicenses({}, { query: { queryKey: getAdminListLicensesQueryKey({}) }});
  const generateMutation = useAdminGenerateLicenses();
  const revokeMutation = useAdminRevokeLicense();
  const deleteMutation = useAdminDeleteLicense();
  
  const [duration, setDuration] = useState<"1day"|"7days"|"30days"|"permanent">("7days");
  const [quantity, setQuantity] = useState(1);

  const handleGenerate = () => {
    generateMutation.mutate({ data: { duration, quantity } }, {
      onSuccess: () => {
        toast({ title: "Licencias generadas" });
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-display tracking-wider">GENERAR LICENCIAS</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Duración</label>
            <Select value={duration} onValueChange={(v: any) => setDuration(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1day">1 Día</SelectItem>
                <SelectItem value="7days">7 Días</SelectItem>
                <SelectItem value="30days">30 Días</SelectItem>
                <SelectItem value="permanent">Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Cantidad</label>
            <Input type="number" min={1} max={100} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="bg-primary text-primary-foreground font-display tracking-wider px-8">
            <Plus className="w-4 h-4 mr-2" /> GENERAR
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Key</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses?.map(license => (
                <TableRow key={license.id} className="border-border">
                  <TableCell className="font-mono text-xs">{license.key}</TableCell>
                  <TableCell>{license.duration}</TableCell>
                  <TableCell>
                    <Badge variant={license.status === 'active' ? 'default' : license.status === 'used' ? 'secondary' : 'destructive'} 
                           className={license.status === 'active' ? 'bg-primary text-primary-foreground' : ''}>
                      {license.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{license.createdAt ? new Date(license.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {license.status !== 'revoked' && (
                      <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/50 text-destructive hover:bg-destructive/10" 
                              onClick={() => { revokeMutation.mutate({ id: license.id }, { onSuccess: () => refetch() }) }}>
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => { deleteMutation.mutate({ id: license.id }, { onSuccess: () => refetch() }) }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadsTab() {
  const { toast } = useToast();
  const createMutation = useAdminCreateDownload();
  const deleteMutation = useAdminDeleteDownload();
  
  const [formData, setFormData] = useState({
    title: "", description: "", fileUrl: "", category: "", catalog: "packs_famosos", tier: "free"
  });

  const handleCreate = () => {
    if (!formData.title || !formData.fileUrl) return toast({ variant: "destructive", title: "Faltan campos" });
    createMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Descarga creada" });
        setFormData({ title: "", description: "", fileUrl: "", category: "", catalog: "packs_famosos", tier: "free" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader><CardTitle className="font-display tracking-wider">AÑADIR DESCARGA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm">Título</label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-sm">URL del Archivo</label><Input value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-sm">Categoría</label><Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-sm">Catálogo</label>
              <Select value={formData.catalog} onValueChange={v => setFormData({...formData, catalog: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="packs_famosos">Packs Famosos</SelectItem>
                  <SelectItem value="xit_android">XIT Android</SelectItem>
                  <SelectItem value="xit_iphone">XIT iPhone</SelectItem>
                  <SelectItem value="proxy">Proxy</SelectItem>
                  <SelectItem value="optimizacion">Optimización</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Nivel (Tier)</label>
              <Select value={formData.tier} onValueChange={v => setFormData({...formData, tier: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><label className="text-sm">Descripción</label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-primary text-primary-foreground font-display tracking-wider"><Plus className="w-4 h-4 mr-2"/> AÑADIR</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const setSetting = useAdminSetSetting();
  const [musicUrl, setMusicUrl] = useState("");

  const handleSave = () => {
    setSetting.mutate({ data: { key: "music_url", value: musicUrl } }, {
      onSuccess: () => toast({ title: "Configuración guardada" })
    });
  };

  return (
    <Card className="border-border">
      <CardHeader><CardTitle className="font-display tracking-wider">CONFIGURACIÓN DEL SISTEMA</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm">URL de Música de Fondo (Stream/MP3)</label>
          <Input placeholder="https://..." value={musicUrl} onChange={e => setMusicUrl(e.target.value)} />
        </div>
        <Button onClick={handleSave} className="bg-primary text-primary-foreground font-display tracking-wider">GUARDAR</Button>
      </CardContent>
    </Card>
  );
}
