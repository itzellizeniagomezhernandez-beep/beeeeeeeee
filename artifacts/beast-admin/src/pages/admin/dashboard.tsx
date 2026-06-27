import { useState, useEffect } from "react";
import { ModPhotosCard } from "@/components/mod-photos-card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  adminGetStats,
  adminListLicenses,
  adminGenerateLicense,
  adminRevokeLicense,
  adminCreateDownload,
  adminDeleteDownload,
  listDownloads,
} from "@workspace/api-client-react";
import { 
  LogOut, 
  Key, 
  Users, 
  Clock, 
  Ban, 
  Plus, 
  RefreshCw, 
  Loader2, 
  Trash2,
  Copy,
  Download,
  Link as LinkIcon,
  PackageOpen,
  Settings,
  Music,
  Lightbulb,
  Save,
  Megaphone,
  MessageSquare,
  ShoppingCart,
  ToggleLeft,
  ToggleRight,
  Zap,
  Star,
  ImageIcon,
  Smartphone,
  Wrench,
  X,
  PlayCircle,
  Upload,
} from "lucide-react";
import { GenerateLicenseInputDuration } from "@workspace/api-client-react";

export function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authHeader = { headers: { 'x-admin-token': token } };

  const uploadImage = (onDone: (url: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          onDone(data.url);
          toast({ title: "Imagen subida", description: "Foto cargada correctamente." });
        } else {
          toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Error al subir la imagen.", variant: "destructive" });
      }
    };
    input.click();
  };

  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);

  const uploadVideo = (onDone: (url: string) => void, slotKey?: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      const key = slotKey ?? "video";
      setUploadingVideo(key);
      const formData = new FormData();
      formData.append("video", file);
      try {
        const res = await fetch("/api/admin/upload-video", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          onDone(data.url);
          toast({ title: "Video subido", description: "Video cargado correctamente." });
        } else {
          toast({ title: "Error", description: data.error ?? "No se pudo subir el video.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Error al subir el video.", variant: "destructive" });
      } finally {
        setUploadingVideo(null);
      }
    };
    input.click();
  };

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats', token],
    queryFn: () => adminGetStats(authHeader),
  });

  const { data: licenses, isLoading: licensesLoading } = useQuery({
    queryKey: ['adminLicenses', token],
    queryFn: () => adminListLicenses(undefined, authHeader),
  });

  const { data: downloads, isLoading: downloadsLoading } = useQuery({
    queryKey: ['downloads', 'all'],
    queryFn: async () => {
      const r = await fetch("/api/downloads");
      return r.json() as Promise<any[]>;
    },
  });

  const { data: catalogStats, isLoading: catalogStatsLoading, refetch: refetchCatalogStats } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: async () => {
      const r = await fetch("/api/admin/catalog-stats", { headers: { "x-admin-token": token } });
      return r.json() as Promise<{ statsByCatalog: any[]; topItems: any[] }>;
    },
  });

  const { data: sensiCount, refetch: refetchSensiCount } = useQuery({
    queryKey: ['sensi-count'],
    queryFn: async () => {
      const r = await fetch("/api/stats/sensi-count");
      return r.json() as Promise<{ count: number }>;
    },
  });

  const { data: modifCount } = useQuery({
    queryKey: ['modif-count'],
    queryFn: async () => {
      const r = await fetch("/api/stats/modif-count");
      return r.json() as Promise<{ count: number }>;
    },
  });

  const { data: ratingsSummary, isLoading: ratingsLoading, refetch: refetchRatings } = useQuery({
    queryKey: ['ratings-summary'],
    queryFn: async () => {
      const r = await fetch("/api/admin/ratings-summary", { headers: { "x-admin-token": token } });
      return r.json() as Promise<{ total: number; average: number; distribution: Record<number, number>; recent: any[] }>;
    },
  });

  const { data: accessLogs, isLoading: accessLogsLoading, refetch: refetchAccessLogs } = useQuery({
    queryKey: ['access-logs', token],
    queryFn: async () => {
      const r = await fetch("/api/admin/access-logs", { headers: { "x-admin-token": token } });
      return r.json() as Promise<{ logs: { id: number; license_key: string; device_id: string; action: string; created_at: string }[] }>;
    },
  });

  const { data: onlineCount } = useQuery({
    queryKey: ['online-count'],
    queryFn: async () => {
      const r = await fetch("/api/stats/online-count");
      return r.json() as Promise<{ count: number }>;
    },
    refetchInterval: 15000,
  });

  const { data: suspiciousData, refetch: refetchSuspicious } = useQuery({
    queryKey: ['suspicious-attempts', token],
    queryFn: async () => {
      const r = await fetch("/api/admin/suspicious-attempts", { headers: { "x-admin-token": token } });
      return r.json() as Promise<{ attempts: { id: number; key: string; originalUsername: string | null; originalDevice: string | null; attemptUsername: string | null; attemptDevice: string | null; createdAt: string }[] }>;
    },
    refetchInterval: 30000,
  });

  const generateMutation = useMutation({
    mutationFn: (data: { duration: GenerateLicenseInputDuration; quantity: number }) =>
      adminGenerateLicense(data, authHeader),
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: "DELETE", ...authHeader });
      if (!res.ok) throw new Error("Error al eliminar");
      return res.json();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: number) => adminRevokeLicense(id, authHeader),
  });

  const resetMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/licenses/${id}/reset`, { method: "POST", ...authHeader });
      if (!res.ok) throw new Error("Error al resetear");
      return res.json();
    },
  });

  const notesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await fetch(`/api/admin/licenses/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
  });

  const createDownloadMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; imageUrl?: string; fileUrl: string; fileUrl2?: string; category: string; catalog: string; tier: string }) => {
      const res = await fetch("/api/admin/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
  });

  const deleteDownloadMutation = useMutation({
    mutationFn: (id: number) => adminDeleteDownload(id, authHeader),
  });

  const [genDuration, setGenDuration] = useState<GenerateLicenseInputDuration>('7days');
  const [genCount, setGenCount] = useState<string>("1");
  const [licenseSearch, setLicenseSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<{ id: number; value: string } | null>(null);

  const [dlTitle, setDlTitle] = useState("");
  const [dlDesc, setDlDesc] = useState("");
  const [dlImage, setDlImage] = useState("");
  const [dlUrl, setDlUrl] = useState("");
  const [dlUrl2, setDlUrl2] = useState("");
  const [dlCategory, setDlCategory] = useState<"pack" | "config" | "file">("pack");
  const [dlTier, setDlTier] = useState<"all" | "vip">("all");
  const [dlCatalog, setDlCatalog] = useState<string>("packs_famosos");

  const [tipValue, setTipValue] = useState("");
  const [musicValue, setMusicValue] = useState("");
  const [waUrl, setWaUrl] = useState("https://wa.me/526462676766?text=Hola,%20quiero%20comprar%20acceso%20VIP%20a%20Beast%20Sensi%207");
  const [igUrl, setIgUrl] = useState("");
  const [ttUrl, setTtUrl] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [dcUrl, setDcUrl] = useState("");

  const [packsFamososUrl, setPacksFamososUrl] = useState("");
  const [xitAndroidUrl, setXitAndroidUrl] = useState("");
  const [xitIphoneUrl, setXitIphoneUrl] = useState("");
  const [proxyUrl, setProxyUrl] = useState("");
  const [optimizacionUrl, setOptimizacionUrl] = useState("");

  const [catalogImgPacksFamosos, setCatalogImgPacksFamosos] = useState("");
  const [catalogImgXitAndroid, setCatalogImgXitAndroid] = useState("");
  const [catalogImgXitIphone, setCatalogImgXitIphone] = useState("");
  const [catalogImgProxy, setCatalogImgProxy] = useState("");
  const [catalogImgOptimizacion, setCatalogImgOptimizacion] = useState("");
  const [catalogImgHudFamosos, setCatalogImgHudFamosos] = useState("");
  const [catalogImgProyectosBeast, setCatalogImgProyectosBeast] = useState("");

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [vipPurchaseUrl, setVipPurchaseUrl] = useState("https://wa.me/526462676766?text=Hola,%20quiero%20comprar%20acceso%20VIP%20a%20Beast%20Sensi%207");
  const [welcomeMsg, setWelcomeMsg] = useState("");

  const [activeTab, setActiveTab] = useState<'inicio'|'licencias'|'contenido'|'config'|'modificacion'|'feedback'>('inicio');

  const ALL_IPHONE_MODELS = [
    "iPhone 6","iPhone 6 Plus","iPhone 6s","iPhone 6s Plus",
    "iPhone 7","iPhone 7 Plus","iPhone 8","iPhone 8 Plus",
    "iPhone X","iPhone XS","iPhone XS Max","iPhone XR",
    "iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max",
    "iPhone 12 mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max",
    "iPhone 13 mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max",
    "iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max",
    "iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max",
    "iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max",
    "iPhone 17","iPhone 17 Plus","iPhone 17 Pro","iPhone 17 Pro Max",
  ];
  const [hudItems, setHudItems] = useState<{ nombre: string; imageUrl: string; hudCode: string; qrUrl: string }[]>([]);
  const [hudForm, setHudForm] = useState({ nombre: "", imageUrl: "", hudCode: "", qrUrl: "" });
  const [modPhotos, setModPhotos] = useState<Record<string, string[]>>({});
  const [modSelectedModel, setModSelectedModel] = useState<string>(ALL_IPHONE_MODELS[0]);
  const [modVideos, setModVideos] = useState<Record<string, string[]>>({});
  const [modVideoSelectedModel, setModVideoSelectedModel] = useState<string>(ALL_IPHONE_MODELS[0]);
  const [modifTutorialVideo, setModifTutorialVideo] = useState("");
  const [referencias, setReferencias] = useState<{ avatar: string; name: string; stars: number; text: string; verified: boolean }[]>([]);
  const [refForm, setRefForm] = useState({ avatar: "", name: "", stars: 5, text: "", verified: true });

  const { data: tipSetting } = useQuery({
    queryKey: ['settings', 'tip_of_day'],
    queryFn: async () => {
      const res = await fetch("/api/settings/tip_of_day");
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    onSuccess: (d: any) => { if (d?.value) setTipValue(d.value); },
  } as any);

  const { data: musicSetting } = useQuery({
    queryKey: ['settings', 'music_url'],
    queryFn: async () => {
      const res = await fetch("/api/settings/music_url");
      return res.json() as Promise<{ key: string; value: string | null }>;
    },
    onSuccess: (d: any) => { if (d?.value) setMusicValue(d.value); },
  } as any);

  useQuery({
    queryKey: ['settings', 'social_whatsapp'],
    queryFn: async () => { const r = await fetch("/api/settings/social_whatsapp"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setWaUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'social_instagram'],
    queryFn: async () => { const r = await fetch("/api/settings/social_instagram"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setIgUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'social_tiktok'],
    queryFn: async () => { const r = await fetch("/api/settings/social_tiktok"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setTtUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'social_youtube'],
    queryFn: async () => { const r = await fetch("/api/settings/social_youtube"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setYtUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'social_discord'],
    queryFn: async () => { const r = await fetch("/api/settings/social_discord"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setDcUrl(d.value); },
  } as any);

  useQuery({
    queryKey: ['settings', 'free_url_packs_famosos'],
    queryFn: async () => { const r = await fetch("/api/settings/free_url_packs_famosos"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setPacksFamososUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'free_url_xit_android'],
    queryFn: async () => { const r = await fetch("/api/settings/free_url_xit_android"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setXitAndroidUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'free_url_xit_iphone'],
    queryFn: async () => { const r = await fetch("/api/settings/free_url_xit_iphone"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setXitIphoneUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'free_url_proxy'],
    queryFn: async () => { const r = await fetch("/api/settings/free_url_proxy"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setProxyUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'free_url_optimizacion'],
    queryFn: async () => { const r = await fetch("/api/settings/free_url_optimizacion"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setOptimizacionUrl(d.value); },
  } as any);

  useQuery({
    queryKey: ['settings', 'catalog_img_packs_famosos'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_packs_famosos"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgPacksFamosos(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_xit_android'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_xit_android"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgXitAndroid(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_xit_iphone'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_xit_iphone"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgXitIphone(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_proxy'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_proxy"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgProxy(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_optimizacion'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_optimizacion"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgOptimizacion(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_hud_famosos'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_hud_famosos"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgHudFamosos(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'catalog_img_proyectos_beast'],
    queryFn: async () => { const r = await fetch("/api/settings/catalog_img_proyectos_beast"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setCatalogImgProyectosBeast(d.value); },
  } as any);

  useQuery({
    queryKey: ['settings', 'site_announcement'],
    queryFn: async () => { const r = await fetch("/api/settings/site_announcement"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setAnnouncementText(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'site_announcement_on'],
    queryFn: async () => { const r = await fetch("/api/settings/site_announcement_on"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setAnnouncementEnabled(d.value === "1"); },
  } as any);
  useQuery({
    queryKey: ['settings', 'vip_purchase_url'],
    queryFn: async () => { const r = await fetch("/api/settings/vip_purchase_url"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setVipPurchaseUrl(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'welcome_msg'],
    queryFn: async () => { const r = await fetch("/api/settings/welcome_msg"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setWelcomeMsg(d.value); },
  } as any);
  useQuery({
    queryKey: ['settings', 'hud_famosos'],
    queryFn: async () => { const r = await fetch("/api/settings/hud_famosos"); return r.json(); },
    onSuccess: (d: any) => {
      if (d?.value) {
        try { setHudItems(JSON.parse(d.value)); } catch {}
      }
    },
  } as any);
  const { data: modPhotosQuery } = useQuery({
    queryKey: ['settings', 'modificacion_photos'],
    queryFn: async () => { const r = await fetch("/api/settings/modificacion_photos"); return r.json(); },
    staleTime: Infinity,
  });
  useEffect(() => {
    if (modPhotosQuery?.value) {
      try {
        const parsed = JSON.parse(modPhotosQuery.value);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          setModPhotos(parsed);
        }
      } catch {}
    }
  }, [modPhotosQuery]);

  const { data: modVideosQuery } = useQuery({
    queryKey: ['settings', 'modificacion_videos'],
    queryFn: async () => { const r = await fetch("/api/settings/modificacion_videos"); return r.json(); },
    staleTime: Infinity,
  });
  useEffect(() => {
    if (modVideosQuery?.value) {
      try {
        const parsed = JSON.parse(modVideosQuery.value);
        if (typeof parsed === "object" && !Array.isArray(parsed)) {
          setModVideos(parsed);
        }
      } catch {}
    }
  }, [modVideosQuery]);
  useQuery({
    queryKey: ['settings', 'modificacion_tutorial_video'],
    queryFn: async () => { const r = await fetch("/api/settings/modificacion_tutorial_video"); return r.json(); },
    onSuccess: (d: any) => { if (d?.value) setModifTutorialVideo(d.value); },
  } as any);
  const { data: refQueryData } = useQuery({
    queryKey: ['settings', 'referencias_testimonials'],
    queryFn: async () => { const r = await fetch("/api/settings/referencias_testimonials"); return r.json(); },
  });
  useEffect(() => {
    if (refQueryData?.value) {
      try {
        const parsed = JSON.parse(refQueryData.value);
        if (Array.isArray(parsed)) setReferencias(parsed);
      } catch {}
    }
  }, [refQueryData]);

  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(genCount, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 50) {
      toast({ title: "Error", description: "Cantidad debe ser entre 1 y 50", variant: "destructive" });
      return;
    }

    generateMutation.mutate({ duration: genDuration, quantity }, {
      onSuccess: () => {
        toast({ title: "Éxito", description: `${quantity} licencias generadas.` });
        queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        setGenCount("1");
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.data?.error || "Error al generar", variant: "destructive" });
        if (err.status === 401) onLogout();
      }
    });
  };

  const handleDeleteLicense = (id: number, key: string) => {
    if (!confirm(`¿Eliminar permanentemente la licencia ${key.substring(0, 8)}...? No se puede deshacer.`)) return;
    deleteLicenseMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Eliminada", description: "Licencia eliminada permanentemente." });
        queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      },
      onError: () => toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" }),
    });
  };

  const handleReset = (id: number, key: string) => {
    if (!confirm(`¿Resetear la key ${key.substring(0, 8)}...? Quedará activa y se podrá canjear en un nuevo dispositivo.`)) return;
    resetMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Key reseteada", description: "La key puede canjearse en un nuevo dispositivo." });
        queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      },
      onError: () => toast({ title: "Error", description: "No se pudo resetear.", variant: "destructive" }),
    });
  };

  const handleSaveNotes = (id: number) => {
    if (!editingNotes || editingNotes.id !== id) return;
    notesMutation.mutate({ id, notes: editingNotes.value }, {
      onSuccess: () => {
        toast({ title: "Nota guardada" });
        setEditingNotes(null);
        queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
      },
      onError: () => toast({ title: "Error", description: "No se pudo guardar la nota.", variant: "destructive" }),
    });
  };

  const exportCSV = () => {
    if (!licenses?.length) return;
    const rows = licenses.map((l: any) =>
      `"${l.key}","${l.username ?? ""}","${l.duration}","${l.status}","${l.notes ?? ""}","${new Date(l.createdAt).toLocaleDateString()}"`
    );
    const csv = ["KEY,USUARIO,TIPO,ESTADO,NOTAS,CREADA", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "beast-keys.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevoke = (id: number) => {
    if (!confirm("¿Seguro que deseas revocar esta licencia?")) return;
    
    revokeMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Revocada", description: "La licencia ha sido invalidada." });
        queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
        queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.data?.error || "Error al revocar", variant: "destructive" });
        if (err.status === 401) onLogout();
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast({ title: "Copiado", description: "Clave copiada al portapapeles." });
  };

  const handleCreateDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dlTitle.trim()) {
      toast({ title: "Error", description: "El título es obligatorio.", variant: "destructive" });
      return;
    }
    createDownloadMutation.mutate(
      { title: dlTitle, description: dlDesc, imageUrl: dlImage || undefined, fileUrl: dlUrl, fileUrl2: dlUrl2 || undefined, category: dlCategory, catalog: dlCatalog, tier: dlTier },
      {
        onSuccess: () => {
          toast({ title: "Descarga añadida", description: `"${dlTitle}" publicada correctamente.` });
          queryClient.invalidateQueries({ queryKey: ['downloads'] });
          queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
          setDlTitle(""); setDlDesc(""); setDlImage(""); setDlUrl(""); setDlUrl2("");
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.data?.error || "Error al crear.", variant: "destructive" });
          if (err.status === 401) onLogout();
        }
      }
    );
  };

  const handleDeleteDownload = (id: number, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    deleteDownloadMutation.mutate(
      id,
      {
        onSuccess: () => {
          toast({ title: "Eliminada", description: "Descarga eliminada." });
          queryClient.invalidateQueries({ queryKey: ['downloads'] });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.data?.error || "Error al eliminar.", variant: "destructive" });
          if (err.status === 401) onLogout();
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-12 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <header className="border-b border-primary/20 bg-[rgba(255,255,255,0.02)] backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_30px_rgba(139,92,246,0.05)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center rotate-45 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <span className="font-display font-bold text-white -rotate-45">A</span>
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-white">ADMIN<span className="text-primary drop-shadow-[0_0_5px_rgba(139,92,246,0.8)]">CORE</span></span>
          </div>
          <div className="flex items-center gap-2">
            {installPrompt && !installed && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-widest text-black shadow-[0_0_14px_rgba(251,191,36,0.5)]"
                style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)", backgroundSize: "200% 100%", animation: "goldShift 2.5s linear infinite" }}
              >
                <Smartphone className="w-3.5 h-3.5" />
                📲 Instalar App
              </button>
            )}
            {installed && (
              <span className="text-xs text-yellow-400 font-display font-bold">✅ App instalada</span>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-white hover:bg-primary/20">
              <LogOut className="w-4 h-4 mr-2 text-primary" />
              SALIR
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 mt-6 space-y-6 relative z-10">
        {/* Stats Row — siempre visible */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
          <StatCard title="Total" value={stats?.total} icon={<Key className="text-primary" />} loading={statsLoading} />
          <StatCard title="Activas" value={stats?.active} icon={<Users className="text-green-400" />} loading={statsLoading} />
          <StatCard title="Sin Usar" value={stats?.used === undefined ? undefined : (stats.total - stats.used)} icon={<Clock className="text-purple-400" />} loading={statsLoading} />
          <StatCard title="Revocadas" value={stats?.revoked} icon={<Ban className="text-red-400" />} loading={statsLoading} />
          <StatCard title="En Línea" value={onlineCount?.count} icon={<span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)] inline-block" />} loading={false} subtitle="últimos 2 min" />
          <StatCard title="Alertas" value={suspiciousData?.attempts?.length ?? 0} icon={<span className="text-red-400">🚨</span>} loading={false} subtitle="sospechosos" />
          <StatCard title="Sensi" value={sensiCount?.count} icon={<Zap className="text-yellow-400" />} loading={false} />
          <StatCard title="Modif" value={modifCount?.count} icon={<Wrench className="text-purple-400" />} loading={false} />
          <StatCard title="Ratings" value={ratingsSummary?.total} icon={<Star className="text-yellow-400" />} loading={false} subtitle={ratingsSummary?.average ? `★ ${ratingsSummary.average}/5` : undefined} />
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 p-1 bg-black/50 border border-primary/20 rounded-xl backdrop-blur-md">
          {([
            { id: 'inicio',       label: 'Inicio',        emoji: '🏠' },
            { id: 'licencias',    label: 'Licencias',     emoji: '🔑' },
            { id: 'contenido',    label: 'Contenido',     emoji: '📦' },
            { id: 'config',       label: 'Configuración', emoji: '⚙️' },
            { id: 'modificacion', label: 'Modificación',  emoji: '📱' },
            { id: 'feedback',     label: 'Feedback',      emoji: '⭐' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0
                ${activeTab === t.id
                  ? 'bg-primary text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                  : 'text-zinc-500 hover:text-white hover:bg-primary/10'}`}
            >
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== INICIO ===== */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Licencias', desc: 'Genera y administra keys', emoji: '🔑', tab: 'licencias' as const },
                { label: 'Contenido', desc: 'Publica packs y configs', emoji: '📦', tab: 'contenido' as const },
                { label: 'Configuración', desc: 'Ajustes del sitio', emoji: '⚙️', tab: 'config' as const },
                { label: 'Modificación', desc: 'Fotos y videos por iPhone', emoji: '📱', tab: 'modificacion' as const },
                { label: 'Feedback', desc: 'Testimonios y ratings', emoji: '⭐', tab: 'feedback' as const },
              ].map(c => (
                <button key={c.tab} onClick={() => setActiveTab(c.tab)}
                  className="text-left p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group">
                  <div className="text-2xl mb-2">{c.emoji}</div>
                  <p className="font-display font-bold text-white uppercase tracking-wider text-sm group-hover:text-primary transition-colors">{c.label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
            {(suspiciousData?.attempts?.length ?? 0) > 0 && (
              <Card className="bg-[rgba(239,68,68,0.05)] backdrop-blur-md border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse inline-block" />
                    🚨 Intentos Sospechosos — {suspiciousData!.attempts.length}
                  </CardTitle>
                  <Button variant="outline" size="sm" className="h-8 border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20" onClick={() => refetchSuspicious()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-zinc-400 mb-3">Alguien intentó canjear una key ya usada desde un dispositivo diferente.</p>
                  <div className="space-y-2">
                    {suspiciousData!.attempts.map(a => (
                      <div key={a.id} className="rounded-lg bg-black/60 border border-red-500/20 p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                        <div className="flex-1 space-y-1">
                          <div className="font-mono text-red-300 font-bold">{a.key}</div>
                          <div className="text-zinc-400"><span className="text-green-400">Dueño:</span> {a.originalUsername || "desconocido"} — {a.originalDevice?.substring(0, 20) ?? "—"}</div>
                          <div className="text-zinc-400"><span className="text-red-400">Intento:</span> {a.attemptUsername || "sin nombre"} — {a.attemptDevice?.substring(0, 20) ?? "—"}</div>
                        </div>
                        <div className="text-zinc-600 text-[10px] shrink-0">{new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {(suspiciousData?.attempts?.length ?? 0) === 0 && (
              <div className="text-center py-8 text-zinc-600 text-sm">
                ✅ Sin intentos sospechosos — todo limpio
              </div>
            )}
          </div>
        )}

        {/* ===== LICENCIAS ===== */}
        {activeTab === 'licencias' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Generate Form */}
          <Card className="lg:col-span-1 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 h-fit shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-primary" />
                Generar Licencias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Duración</label>
                  <Select value={genDuration} onValueChange={(v) => setGenDuration(v as GenerateLicenseInputDuration)}>
                    <SelectTrigger className="bg-black/60 border-primary/30 text-white focus:ring-primary focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-primary/30">
                      <SelectItem value="1day">1 Día</SelectItem>
                      <SelectItem value="7days">7 Días</SelectItem>
                      <SelectItem value="30days">30 Días</SelectItem>
                      <SelectItem value="permanent">Permanente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Cantidad</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="50" 
                    value={genCount} 
                    onChange={e => setGenCount(e.target.value)}
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                >
                  {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  GENERAR
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Licenses Table */}
          <Card className="lg:col-span-2 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <Key className="w-5 h-5 text-primary" />
                Registro de Licencias
              </CardTitle>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <Input
                  placeholder="Buscar key o usuario..."
                  value={licenseSearch}
                  onChange={e => setLicenseSearch(e.target.value)}
                  className="h-8 w-48 bg-black/60 border-primary/30 text-white text-xs focus:border-primary focus-visible:ring-primary"
                />
                <Button variant="outline" size="sm" title="Exportar CSV" className="h-8 border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-white transition-colors" onClick={exportCSV}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-colors" onClick={() => queryClient.invalidateQueries({queryKey: ['adminLicenses', token]})}>
                  <RefreshCw className={`w-4 h-4 ${licensesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/20 bg-black/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/60 border-b border-primary/20">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="font-mono text-xs text-muted-foreground">KEY</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">USUARIO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">TIPO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">ESTADO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">CREADA</TableHead>
                      <TableHead className="text-right font-mono text-xs text-muted-foreground">ACCIONES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licensesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : licenses?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No hay licencias registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      licenses
                        ?.filter((l: any) => {
                          if (!licenseSearch.trim()) return true;
                          const q = licenseSearch.toLowerCase();
                          return l.key.toLowerCase().includes(q) || (l.username ?? "").toLowerCase().includes(q);
                        })
                        .map((license: any) => (
                        <TableRow key={license.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="font-mono text-sm text-white">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {license.key.substring(0, 12)}...
                                <button onClick={() => copyToClipboard(license.key)} className="text-muted-foreground hover:text-primary transition-colors">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              {editingNotes?.id === license.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    autoFocus
                                    className="text-[10px] bg-black/60 border border-primary/30 rounded px-1 py-0.5 text-white w-28"
                                    value={editingNotes.value}
                                    onChange={e => setEditingNotes({ id: license.id, value: e.target.value })}
                                    onKeyDown={e => { if (e.key === "Enter") handleSaveNotes(license.id); if (e.key === "Escape") setEditingNotes(null); }}
                                    placeholder="Nota..."
                                  />
                                  <button onClick={() => handleSaveNotes(license.id)} className="text-green-400 hover:text-green-300"><Save className="w-3 h-3" /></button>
                                  <button onClick={() => setEditingNotes(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-3 h-3" /></button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingNotes({ id: license.id, value: license.notes ?? "" })}
                                  className="text-[10px] text-left text-zinc-500 hover:text-zinc-300 italic truncate max-w-[100px]"
                                  title="Clic para editar nota"
                                >
                                  {license.notes ? license.notes : "+ nota"}
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {license.username ? (
                              <span className="text-white font-semibold">{license.username}</span>
                            ) : (
                              <span className="text-zinc-600 italic">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary uppercase text-[10px]">
                              {license.duration}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`uppercase text-[10px] ${
                              license.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                              license.status === 'used' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              license.status === 'expired' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                              'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                              {license.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(license.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReset(license.id, license.key)}
                                disabled={license.status === 'active'}
                                title="Resetear (desbloquear dispositivo)"
                                className="h-8 w-8 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRevoke(license.id)}
                                disabled={license.status === 'revoked'}
                                title="Revocar (desactiva pero conserva)"
                                className="h-8 w-8 text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteLicense(license.id, license.key)}
                                title="Eliminar permanentemente"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* ===== CONTENIDO ===== */}
        {activeTab === 'contenido' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Download Form */}
          <Card className="lg:col-span-1 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 h-fit shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <Download className="w-5 h-5 text-primary" />
                Agregar Descarga VIP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDownload} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Título *</label>
                  <Input
                    value={dlTitle}
                    onChange={e => setDlTitle(e.target.value)}
                    placeholder="Ej: Pack Config Beast v3"
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Descripción</label>
                  <Input
                    value={dlDesc}
                    onChange={e => setDlDesc(e.target.value)}
                    placeholder="Descripción corta (opcional)"
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span className="text-purple-400 font-bold">Imagen</span> — portada (opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => uploadImage(url => setDlImage(url))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold transition-colors shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Subir imagen
                    </button>
                    {dlImage && (
                      <>
                        <img src={dlImage} alt="preview" className="w-10 h-10 rounded object-cover border border-primary/30 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <button type="button" onClick={() => setDlImage("")} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3" /></button>
                      </>
                    )}
                  </div>
                  {!dlImage && (
                    <Input
                      value={dlImage}
                      onChange={e => setDlImage(e.target.value)}
                      placeholder="o pega un URL directo..."
                      className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span className="text-primary font-bold">Botón 1</span> — Link principal
                  </label>
                  <Input
                    value={dlUrl}
                    onChange={e => setDlUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    <span className="text-zinc-300 font-bold">Botón 2</span> — Link alternativo (si el 1 falla)
                  </label>
                  <Input
                    value={dlUrl2}
                    onChange={e => setDlUrl2(e.target.value)}
                    placeholder="https://mega.nz/... (opcional)"
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Catálogo (sección pública)</label>
                  <Select value={dlCatalog} onValueChange={v => setDlCatalog(v)}>
                    <SelectTrigger className="bg-black/60 border-primary/30 text-white focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-primary/30">
                      <SelectItem value="packs_famosos">Packs de Famosos</SelectItem>
                      <SelectItem value="xit_android">Xit Android</SelectItem>
                      <SelectItem value="xit_iphone">Xit iPhone</SelectItem>
                      <SelectItem value="proxy">Proxy</SelectItem>
                      <SelectItem value="optimizacion">Optimización</SelectItem>
                      <SelectItem value="proyectos_beast">Proyectos Beast</SelectItem>
                      <SelectItem value="vip">Descargas VIP (sección VIP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Tipo</label>
                    <Select value={dlCategory} onValueChange={v => setDlCategory(v as any)}>
                      <SelectTrigger className="bg-black/60 border-primary/30 text-white focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-primary/30">
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="config">Config</SelectItem>
                        <SelectItem value="file">Archivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">Acceso</label>
                    <Select value={dlTier} onValueChange={v => setDlTier(v as any)}>
                      <SelectTrigger className="bg-black/60 border-primary/30 text-white focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-primary/30">
                        <SelectItem value="all">Todos (gratis)</SelectItem>
                        <SelectItem value="vip">Solo VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={createDownloadMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                >
                  {createDownloadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  PUBLICAR
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Downloads List */}
          <Card className="lg:col-span-2 bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <PackageOpen className="w-5 h-5 text-primary" />
                Packs Publicados
              </CardTitle>
              <Button variant="outline" size="sm" className="h-8 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-colors" onClick={() => queryClient.invalidateQueries({ queryKey: ['downloads'] })}>
                <RefreshCw className={`w-4 h-4 ${downloadsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/20 bg-black/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black/60 border-b border-primary/20">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="font-mono text-xs text-muted-foreground">TÍTULO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">CATÁLOGO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">ACCESO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">↓</TableHead>
                      <TableHead className="text-right font-mono text-xs text-muted-foreground">ACCIÓN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloadsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : !downloads?.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No hay items publicados aún.
                        </TableCell>
                      </TableRow>
                    ) : (
                      downloads.map(dl => {
                        const catalogLabel: Record<string, string> = {
                          packs_famosos: "Packs Famosos",
                          xit_android: "Xit Android",
                          xit_iphone: "Xit iPhone",
                          proxy: "Proxy",
                          optimizacion: "Optimización",
                          proyectos_beast: "Proyectos Beast",
                          vip: "VIP",
                        };
                        return (
                        <TableRow key={dl.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="text-sm text-white font-medium max-w-[180px]">
                            <div className="flex items-center gap-2">
                              {dl.imageUrl ? (
                                <img src={dl.imageUrl} alt="" className="w-10 h-10 rounded object-cover border border-primary/30 flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-4 h-4 text-primary/40" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate">{dl.title}</div>
                                {dl.description && <div className="text-[10px] text-muted-foreground truncate">{dl.description}</div>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px]">
                              {catalogLabel[dl.catalog] ?? dl.catalog}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`uppercase text-[10px] ${
                              dl.tier === 'vip' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              'bg-green-500/10 text-green-400 border-green-500/30'
                            }`}>
                              {dl.tier === 'vip' ? 'VIP' : 'Gratis'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500 font-mono">
                            {dl.downloadCount ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDownload(dl.id, dl.title)}
                              disabled={deleteDownloadMutation.isPending}
                              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Access Logs — en tab LICENCIAS */}
        {activeTab === 'licencias' && (
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-primary" />
              Historial de Accesos
            </CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-colors" onClick={() => refetchAccessLogs()}>
              <RefreshCw className={`w-4 h-4 ${accessLogsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {accessLogsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !accessLogs?.logs?.length ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Sin registros aún. Los accesos aparecerán aquí cuando los usuarios ingresen con sus licencias.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-black/60 border-b border-primary/20">
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableHead className="font-mono text-xs text-muted-foreground">LICENCIA</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">DISPOSITIVO</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">ACCIÓN</TableHead>
                      <TableHead className="font-mono text-xs text-muted-foreground">FECHA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(accessLogs.logs ?? []).map((log) => (
                      <TableRow key={log.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-mono text-sm text-white">{log.license_key}</TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400 max-w-[180px] truncate">{log.device_id || "—"}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs font-mono ${log.action === "access" ? "bg-green-900/40 text-green-400 border-green-500/30" : "bg-red-900/40 text-red-400 border-red-500/30"} border`}>
                            {log.action === "access" ? "✓ Acceso" : "✗ Denegado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Catalog Stats — en tab CONTENIDO */}
        {activeTab === 'contenido' && (
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 text-primary" />
              Estadísticas de Descargas
            </CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-colors" onClick={() => refetchCatalogStats()}>
              <RefreshCw className={`w-4 h-4 ${catalogStatsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {catalogStatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Per catalog */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">Por Catálogo</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(catalogStats?.statsByCatalog ?? []).map((cat: any) => {
                      const labels: Record<string, string> = {
                        packs_famosos: "Packs de Famosos",
                        xit_android: "Xit Android",
                        xit_iphone: "Xit iPhone",
                        proxy: "Proxy",
                        optimizacion: "Optimización",
                      };
                      return (
                        <div key={cat.catalog} className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                          <p className="text-xs font-display uppercase tracking-wider text-white">{labels[cat.catalog] ?? cat.catalog}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-500">Visitas</span>
                              <span className="text-primary font-mono font-bold">{cat.viewCount}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-500">Items</span>
                              <span className="text-white font-mono font-bold">{cat.itemCount}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-500">Descargas</span>
                              <span className="text-green-400 font-mono font-bold">{cat.totalDownloads}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top downloaded items */}
                {(catalogStats?.topItems ?? []).length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">Top Items Más Descargados</p>
                    <div className="rounded-md border border-primary/20 bg-black/40 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-black/60">
                          <TableRow className="border-0 hover:bg-transparent">
                            <TableHead className="font-mono text-xs text-muted-foreground">TÍTULO</TableHead>
                            <TableHead className="font-mono text-xs text-muted-foreground">CATÁLOGO</TableHead>
                            <TableHead className="font-mono text-xs text-muted-foreground">ACCESO</TableHead>
                            <TableHead className="text-right font-mono text-xs text-muted-foreground">DESCARGAS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(catalogStats?.topItems ?? []).map((item: any) => {
                            const labels: Record<string, string> = { packs_famosos: "Packs", xit_android: "Xit Android", xit_iphone: "Xit iPhone", proxy: "Proxy", optimizacion: "Optimización" };
                            return (
                              <TableRow key={item.id} className="border-b border-primary/10 hover:bg-primary/5">
                                <TableCell className="text-sm text-white truncate max-w-[200px]">{item.title}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px]">
                                    {labels[item.catalog] ?? item.catalog}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`uppercase text-[10px] ${item.tier === 'vip' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                    {item.tier === 'vip' ? 'VIP' : 'Gratis'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono text-primary font-bold">{item.downloadCount}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        )}

        {/* ===== CONFIG ===== */}
        {activeTab === 'config' && (
        <div className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tip del Día */}
          <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <Lightbulb className="w-5 h-5 text-primary" />
                Tip del Día
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Este texto aparece en el dashboard VIP de los usuarios.</p>
              <textarea
                className="w-full min-h-[100px] bg-black/60 border border-primary/30 rounded-md text-white text-sm p-3 focus:outline-none focus:border-primary resize-none"
                placeholder="Escribe el tip del día para tus usuarios VIP..."
                value={tipValue}
                onChange={e => setTipValue(e.target.value)}
              />
              <Button
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                disabled={saveSettingMutation.isPending}
                onClick={() =>
                  saveSettingMutation.mutate(
                    { key: "tip_of_day", value: tipValue },
                    {
                      onSuccess: () => {
                        toast({ title: "Guardado", description: "Tip del día actualizado." });
                        queryClient.invalidateQueries({ queryKey: ['settings', 'tip_of_day'] });
                      },
                      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                    }
                  )
                }
              >
                {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                GUARDAR TIP
              </Button>
            </CardContent>
          </Card>

          {/* Música de Fondo */}
          <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <Music className="w-5 h-5 text-primary" />
                Música de Fondo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">URL directa de audio MP3/OGG. Si está vacía, no se mostrará el botón de música.</p>
              <Input
                value={musicValue}
                onChange={e => setMusicValue(e.target.value)}
                placeholder="https://ejemplo.com/music.mp3"
                className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
              />
              <p className="text-xs text-zinc-500">Usa una URL directa de audio MP3/OGG (Google Drive: uc?export=download&id=…).</p>
              <Button
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                disabled={saveSettingMutation.isPending}
                onClick={() =>
                  saveSettingMutation.mutate(
                    { key: "music_url", value: musicValue },
                    {
                      onSuccess: () => {
                        toast({ title: "Guardado", description: "URL de música actualizada." });
                        queryClient.invalidateQueries({ queryKey: ['settings', 'music_url'] });
                      },
                      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                    }
                  )
                }
              >
                {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                GUARDAR URL
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Social Links */}
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <LinkIcon className="w-5 h-5 text-primary" />
              Links de Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Edita los links que aparecen en el footer y el botón de WhatsApp flotante.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "WhatsApp (link completo wa.me/...)", key: "social_whatsapp", value: waUrl, set: setWaUrl },
                { label: "Instagram", key: "social_instagram", value: igUrl, set: setIgUrl },
                { label: "TikTok", key: "social_tiktok", value: ttUrl, set: setTtUrl },
                { label: "YouTube", key: "social_youtube", value: ytUrl, set: setYtUrl },
                { label: "Discord", key: "social_discord", value: dcUrl, set: setDcUrl },
              ].map(({ label, key, value, set }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">{label}</label>
                  <Input
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={`https://...`}
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                  />
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
              disabled={saveSettingMutation.isPending}
              onClick={async () => {
                const pairs = [
                  { key: "social_whatsapp", value: waUrl },
                  { key: "social_instagram", value: igUrl },
                  { key: "social_tiktok", value: ttUrl },
                  { key: "social_youtube", value: ytUrl },
                  { key: "social_discord", value: dcUrl },
                ];
                for (const p of pairs) {
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                    body: JSON.stringify(p),
                  });
                }
                toast({ title: "Guardado", description: "Links sociales actualizados." });
              }}
            >
              {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              GUARDAR LINKS
            </Button>
          </CardContent>
        </Card>

        {/* Free Downloads Links */}
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Download className="w-5 h-5 text-primary" />
              Links de Descargas (Packs &amp; Configs)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Links de descarga para las secciones públicas (Packs de Famosos, Xit Android, Xit iPhone, Proxy). Los usuarios VIP pueden descargar; los demás ven el botón bloqueado.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Packs de Famosos", key: "free_url_packs_famosos", value: packsFamososUrl, set: setPacksFamososUrl },
                { label: "Xit Android", key: "free_url_xit_android", value: xitAndroidUrl, set: setXitAndroidUrl },
                { label: "Xit iPhone", key: "free_url_xit_iphone", value: xitIphoneUrl, set: setXitIphoneUrl },
                { label: "Proxy", key: "free_url_proxy", value: proxyUrl, set: setProxyUrl },
                { label: "Optimización", key: "free_url_optimizacion", value: optimizacionUrl, set: setOptimizacionUrl },
              ].map(({ label, key, value, set }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">{label}</label>
                  <Input
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder="https://..."
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                  />
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
              disabled={saveSettingMutation.isPending}
              onClick={async () => {
                const pairs = [
                  { key: "free_url_packs_famosos", value: packsFamososUrl },
                  { key: "free_url_xit_android", value: xitAndroidUrl },
                  { key: "free_url_xit_iphone", value: xitIphoneUrl },
                  { key: "free_url_proxy", value: proxyUrl },
                  { key: "free_url_optimizacion", value: optimizacionUrl },
                ];
                for (const p of pairs) {
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                    body: JSON.stringify(p),
                  });
                }
                toast({ title: "Guardado", description: "Links de descargas actualizados." });
                queryClient.invalidateQueries({ queryKey: ['settings'] });
              }}
            >
              {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              GUARDAR LINKS
            </Button>
          </CardContent>
        </Card>

        {/* Imágenes de Catálogos */}
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-primary" />
              Imágenes de Catálogos (Banners)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Sube la imagen o pega un URL para el banner de cada catálogo. Si lo dejas vacío se usa la imagen por defecto.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Packs de Famosos", key: "catalog_img_packs_famosos", value: catalogImgPacksFamosos, set: setCatalogImgPacksFamosos },
                { label: "Xit Android",       key: "catalog_img_xit_android",   value: catalogImgXitAndroid,   set: setCatalogImgXitAndroid   },
                { label: "Xit iPhone",         key: "catalog_img_xit_iphone",    value: catalogImgXitIphone,    set: setCatalogImgXitIphone    },
                { label: "Proxy",              key: "catalog_img_proxy",         value: catalogImgProxy,        set: setCatalogImgProxy        },
                { label: "Optimización",       key: "catalog_img_optimizacion",  value: catalogImgOptimizacion, set: setCatalogImgOptimizacion },
                { label: "HUD de Famosos",     key: "catalog_img_hud_famosos",   value: catalogImgHudFamosos,   set: setCatalogImgHudFamosos   },
                { label: "Proyectos Beast",    key: "catalog_img_proyectos_beast", value: catalogImgProyectosBeast, set: setCatalogImgProyectosBeast },
              ].map(({ label, key, value, set }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs uppercase text-muted-foreground tracking-widest font-medium">{label}</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => uploadImage(url => set(url))}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold transition-colors shrink-0"
                    >
                      <Upload className="w-3 h-3" />
                      Subir
                    </button>
                    {value ? (
                      <>
                        <img src={value} alt={label} className="w-10 h-10 rounded-lg object-cover border border-primary/30 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <button type="button" onClick={() => set("")} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"><X className="w-3 h-3" /></button>
                      </>
                    ) : (
                      <Input
                        value={value}
                        onChange={e => set(e.target.value)}
                        placeholder="o pega URL..."
                        className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
              onClick={async () => {
                const pairs = [
                  { key: "catalog_img_packs_famosos",   value: catalogImgPacksFamosos   },
                  { key: "catalog_img_xit_android",     value: catalogImgXitAndroid     },
                  { key: "catalog_img_xit_iphone",      value: catalogImgXitIphone      },
                  { key: "catalog_img_proxy",           value: catalogImgProxy          },
                  { key: "catalog_img_optimizacion",    value: catalogImgOptimizacion   },
                  { key: "catalog_img_hud_famosos",     value: catalogImgHudFamosos     },
                  { key: "catalog_img_proyectos_beast", value: catalogImgProyectosBeast },
                ];
                for (const p of pairs) {
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                    body: JSON.stringify(p),
                  });
                }
                toast({ title: "Guardado", description: "Imágenes de catálogos actualizadas." });
                queryClient.invalidateQueries({ queryKey: ['settings'] });
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              GUARDAR IMÁGENES
            </Button>
          </CardContent>
        </Card>

        {/* Anuncio del Sitio */}
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Megaphone className="w-5 h-5 text-primary" />
              Anuncio del Sitio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">Muestra una barra de anuncio en la parte superior del sitio para todos los visitantes.</p>
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5">
              <div>
                <p className="text-sm font-display font-bold text-white uppercase tracking-wide">Estado del Anuncio</p>
                <p className="text-[10px] text-zinc-500 font-mono">{announcementEnabled ? "Visible para todos los usuarios" : "Oculto — no se muestra"}</p>
              </div>
              <button
                onClick={async () => {
                  const newVal = !announcementEnabled;
                  setAnnouncementEnabled(newVal);
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-admin-token": token },
                    body: JSON.stringify({ key: "site_announcement_on", value: newVal ? "1" : "0" }),
                  });
                  toast({ title: announcementEnabled ? "Anuncio desactivado" : "Anuncio activado" });
                }}
                className="ml-4 shrink-0"
              >
                {announcementEnabled
                  ? <ToggleRight className="w-10 h-10 text-primary" />
                  : <ToggleLeft className="w-10 h-10 text-zinc-600" />}
              </button>
            </div>
            <textarea
              className="w-full min-h-[80px] bg-black/60 border border-primary/30 rounded-md text-white text-sm p-3 focus:outline-none focus:border-primary resize-none font-mono"
              placeholder="Ej: 🔥 Nuevo pack disponible — accede ya en la sección de descargas"
              value={announcementText}
              onChange={e => setAnnouncementText(e.target.value)}
            />
            <Button
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
              disabled={saveSettingMutation.isPending}
              onClick={() =>
                saveSettingMutation.mutate(
                  { key: "site_announcement", value: announcementText },
                  {
                    onSuccess: () => toast({ title: "Guardado", description: "Texto del anuncio actualizado." }),
                    onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                  }
                )
              }
            >
              {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              GUARDAR ANUNCIO
            </Button>
          </CardContent>
        </Card>

        {/* Mensaje de Bienvenida VIP + Link de Compra */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mensaje de bienvenida VIP */}
          <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-primary" />
                Mensaje de Bienvenida VIP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Texto que aparece en el dashboard VIP al iniciar sesión (debajo del saludo).</p>
              <textarea
                className="w-full min-h-[90px] bg-black/60 border border-primary/30 rounded-md text-white text-sm p-3 focus:outline-none focus:border-primary resize-none"
                placeholder="Ej: ¡Bienvenido! Aquí tienes todos tus beneficios VIP activos."
                value={welcomeMsg}
                onChange={e => setWelcomeMsg(e.target.value)}
              />
              <Button
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                disabled={saveSettingMutation.isPending}
                onClick={() =>
                  saveSettingMutation.mutate(
                    { key: "welcome_msg", value: welcomeMsg },
                    {
                      onSuccess: () => toast({ title: "Guardado", description: "Mensaje de bienvenida actualizado." }),
                      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                    }
                  )
                }
              >
                {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                GUARDAR MENSAJE
              </Button>
            </CardContent>
          </Card>

          {/* Link de Compra VIP */}
          <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Link de Compra VIP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">URL que aparece en los botones "Comprar VIP" y "Hacerme VIP" en toda la app (WhatsApp, Telegram, etc).</p>
              <Input
                value={vipPurchaseUrl}
                onChange={e => setVipPurchaseUrl(e.target.value)}
                placeholder="https://wa.me/52..."
                className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
              />
              <p className="text-xs text-zinc-500">Puedes usar cualquier link: wa.me, t.me, Instagram DM, etc.</p>
              <Button
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary shadow-[0_0_15px_rgba(139,92,246,0.4)] font-display font-bold tracking-widest border-0 text-white"
                disabled={saveSettingMutation.isPending}
                onClick={() =>
                  saveSettingMutation.mutate(
                    { key: "vip_purchase_url", value: vipPurchaseUrl },
                    {
                      onSuccess: () => toast({ title: "Guardado", description: "Link de compra VIP actualizado." }),
                      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                    }
                  )
                }
              >
                {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                GUARDAR LINK
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* HUD de Famosos Management */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
                <ImageIcon className="w-5 h-5 text-primary" />
                HUD de Famosos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 rounded-xl border border-primary/10 bg-black/30">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Añadir nuevo famoso</p>
                <Input
                  placeholder="Nombre del jugador (ej: LOUD Coringa)"
                  value={hudForm.nombre}
                  onChange={e => setHudForm(f => ({ ...f, nombre: e.target.value }))}
                  className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(url => setHudForm(f => ({ ...f, imageUrl: url })))}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold transition-colors shrink-0"
                  >
                    <Upload className="w-3 h-3" />
                    Foto
                  </button>
                  {hudForm.imageUrl ? (
                    <>
                      <img src={hudForm.imageUrl} alt="preview" className="w-8 h-8 rounded object-cover border border-primary/30 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <button type="button" onClick={() => setHudForm(f => ({ ...f, imageUrl: "" }))} className="text-zinc-600 hover:text-red-400 shrink-0"><X className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <Input
                      placeholder="o pega URL de la foto..."
                      value={hudForm.imageUrl}
                      onChange={e => setHudForm(f => ({ ...f, imageUrl: e.target.value }))}
                      className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                    />
                  )}
                </div>
                <Input
                  placeholder="Código HUD (ej: 1234567890ABCD...)"
                  value={hudForm.hudCode}
                  onChange={e => setHudForm(f => ({ ...f, hudCode: e.target.value }))}
                  className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(url => setHudForm(f => ({ ...f, qrUrl: url })))}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold transition-colors shrink-0"
                  >
                    <Upload className="w-3 h-3" />
                    QR
                  </button>
                  {hudForm.qrUrl ? (
                    <>
                      <img src={hudForm.qrUrl} alt="qr" className="w-8 h-8 rounded object-cover border border-primary/30 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <button type="button" onClick={() => setHudForm(f => ({ ...f, qrUrl: "" }))} className="text-zinc-600 hover:text-red-400 shrink-0"><X className="w-3 h-3" /></button>
                    </>
                  ) : (
                    <Input
                      placeholder="o pega URL del QR (opcional)..."
                      value={hudForm.qrUrl}
                      onChange={e => setHudForm(f => ({ ...f, qrUrl: e.target.value }))}
                      className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                    />
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (!hudForm.nombre || !hudForm.hudCode) return;
                    const newItems = [...hudItems, { ...hudForm }];
                    setHudItems(newItems);
                    setHudForm({ nombre: "", imageUrl: "", hudCode: "", qrUrl: "" });
                    saveSettingMutation.mutate(
                      { key: "hud_famosos", value: JSON.stringify(newItems) },
                      {
                        onSuccess: () => toast({ title: "HUD guardado", description: "HUD de Famosos actualizado." }),
                        onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                      }
                    );
                  }}
                  disabled={!hudForm.nombre || !hudForm.hudCode}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 font-display font-bold tracking-widest border-0 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  AÑADIR FAMOSO
                </Button>
              </div>

              {hudItems.length > 0 && (
                <div className="space-y-2">
                  {hudItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-primary/10 bg-black/20">
                      <div>
                        <p className="text-sm font-bold text-white">{item.nombre}</p>
                        <p className="text-[10px] font-mono text-zinc-600 truncate max-w-[200px]">{item.hudCode}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newItems = hudItems.filter((_, j) => j !== i);
                          setHudItems(newItems);
                          saveSettingMutation.mutate(
                            { key: "hud_famosos", value: JSON.stringify(newItems) },
                            {
                              onSuccess: () => toast({ title: "Eliminado", description: `${item.nombre} eliminado.` }),
                            }
                          );
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
        )}

        {/* ===== MODIFICACION ===== */}
        {activeTab === 'modificacion' && (
        <div className="space-y-8">
          {/* Modificación Interna - iPhone Photos */}
          <ModPhotosCard
            token={token}
            modPhotos={modPhotos}
            setModPhotos={setModPhotos}
            ALL_IPHONE_MODELS={ALL_IPHONE_MODELS}
          />
        </div>
        )}

        {/* ===== FEEDBACK ===== */}
        {activeTab === 'feedback' && (
        <div className="space-y-8">
        {/* Referencias / Testimonios */}
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-primary" />
              Referencias &amp; Testimonios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-muted-foreground">Añade testimonios reales. La <span className="text-primary font-bold">foto de referencia</span> es el screenshot grande del cliente (WhatsApp, chat, etc.) que se muestra en la tarjeta. La foto de perfil es automáticamente el logo de Beast.</p>

            <div className="space-y-3 p-4 rounded-xl border border-primary/10 bg-black/30">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Nuevo testimonio</p>
              <Input
                placeholder="Nombre de usuario (ej: ShadowX_09)"
                value={refForm.name}
                onChange={e => setRefForm(f => ({ ...f, name: e.target.value }))}
                className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary text-sm"
              />
              {/* Foto grande de referencia (screenshot del cliente) */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Foto de referencia grande (screenshot del cliente)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => uploadImage(url => setRefForm(f => ({ ...f, avatar: url })))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold transition-colors shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Subir screenshot
                  </button>
                  {refForm.avatar ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={refForm.avatar} alt="preview" className="w-16 h-12 rounded object-cover border border-primary/30 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span className="text-[10px] font-mono text-zinc-500 truncate flex-1">screenshot cargado ✓</span>
                      <button type="button" onClick={() => setRefForm(f => ({ ...f, avatar: "" }))} className="text-zinc-600 hover:text-red-400 shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <Input
                      placeholder="o pega URL del screenshot..."
                      value={refForm.avatar}
                      onChange={e => setRefForm(f => ({ ...f, avatar: e.target.value }))}
                      className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                    />
                  )}
                </div>
              </div>
              <textarea
                placeholder="Texto del testimonio..."
                value={refForm.text}
                onChange={e => setRefForm(f => ({ ...f, text: e.target.value }))}
                className="w-full min-h-[70px] bg-black/60 border border-primary/30 rounded-md text-white text-sm p-3 focus:outline-none focus:border-primary resize-none"
              />
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">Estrellas:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setRefForm(f => ({ ...f, stars: s }))}
                        className={`w-6 h-6 rounded text-sm transition-all ${s <= refForm.stars ? "text-yellow-400" : "text-zinc-700"}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={refForm.verified} onChange={e => setRefForm(f => ({ ...f, verified: e.target.checked }))}
                    className="w-4 h-4 accent-purple-500" />
                  <span className="text-xs text-zinc-400 font-mono">Verificado</span>
                </label>
              </div>
              <Button
                disabled={!refForm.name || !refForm.text}
                onClick={() => {
                  if (!refForm.name || !refForm.text) return;
                  const snapshot = { ...refForm };
                  const newRefs = [...referencias, snapshot];
                  setReferencias(newRefs);
                  setRefForm({ avatar: "", name: "", stars: 5, text: "", verified: true });
                  saveSettingMutation.mutate(
                    { key: "referencias_testimonials", value: JSON.stringify(newRefs) },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['settings', 'referencias_testimonials'] });
                        toast({ title: "Guardado", description: "Testimonio agregado a Referencias." });
                      },
                      onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                    }
                  );
                }}
                className="w-full bg-gradient-to-r from-primary to-purple-600 font-display font-bold tracking-widest border-0 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> AGREGAR TESTIMONIO
              </Button>
            </div>

            {referencias.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{referencias.length} testimonio{referencias.length !== 1 ? "s" : ""} publicado{referencias.length !== 1 ? "s" : ""}</p>
                {referencias.map((ref, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl border border-primary/10 bg-black/20">
                    <div className="flex items-start gap-3 min-w-0">
                      {ref.avatar ? (
                        <img src={ref.avatar} alt={ref.name} className="w-10 h-10 rounded-full object-cover border border-primary/30 shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-primary">{ref.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">{ref.name}</p>
                          {ref.verified && <span className="text-[9px] text-primary font-bold">✓ VER</span>}
                        </div>
                        <div className="flex gap-0.5 mb-1">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= ref.stars ? "text-yellow-400" : "text-zinc-700"}`}>★</span>)}
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-2">{ref.text}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"
                      onClick={() => {
                        const newRefs = referencias.filter((_, j) => j !== i);
                        setReferencias(newRefs);
                        saveSettingMutation.mutate(
                          { key: "referencias_testimonials", value: JSON.stringify(newRefs) },
                          { onSuccess: () => toast({ title: "Eliminado", description: `${ref.name} eliminado.` }) }
                        );
                      }}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
        )}

        {/* Videos por Modelo — en tab MODIFICACION */}
        {activeTab === 'modificacion' && (
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <PlayCircle className="w-5 h-5 text-primary" />
              Videos por Modelo de iPhone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-zinc-500 font-mono">
              Agrega URLs de video (YouTube, TikTok, MP4, etc.) para cada modelo. Se mostrarán en la sección VIP de Modificación.
            </p>

            {/* Video tutorial general */}
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold flex items-center gap-2">
                <PlayCircle className="w-3.5 h-3.5" />
                Video Tutorial General (antes de aplicar)
              </label>
              <p className="text-[10px] text-zinc-500 font-mono">Este video aparece para TODOS los modelos, antes de las fotos, con el aviso de reiniciar configuración.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="URL del video tutorial (YouTube, MP4...)..."
                  value={modifTutorialVideo}
                  onChange={e => setModifTutorialVideo(e.target.value)}
                  className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => uploadVideo(url => setModifTutorialVideo(url), "tutorial")}
                  disabled={uploadingVideo === "tutorial"}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 text-xs font-bold transition-colors shrink-0 disabled:opacity-50"
                >
                  {uploadingVideo === "tutorial" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingVideo === "tutorial" ? "Subiendo..." : "Subir"}
                </button>
                <Button
                  size="sm"
                  onClick={() => {
                    saveSettingMutation.mutate(
                      { key: "modificacion_tutorial_video", value: modifTutorialVideo },
                      {
                        onSuccess: () => toast({ title: "Video tutorial guardado", description: "El video tutorial fue actualizado." }),
                        onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                      }
                    );
                  }}
                  className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30 shrink-0"
                >
                  {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Modelo de iPhone (videos por modelo)</label>
              <select
                value={modVideoSelectedModel}
                onChange={e => setModVideoSelectedModel(e.target.value)}
                className="w-full bg-black/60 border border-primary/30 text-white rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
              >
                {ALL_IPHONE_MODELS.map(m => (
                  <option key={m} value={m} className="bg-zinc-900">{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 p-4 rounded-xl border border-primary/10 bg-black/30">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">
                Videos para <span className="text-primary font-bold">{modVideoSelectedModel}</span>
              </p>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-600 w-6 text-right shrink-0">{i + 1}</span>
                  <Input
                    placeholder={`URL del video ${i + 1} (YouTube, MP4...)...`}
                    value={(modVideos[modVideoSelectedModel] ?? [])[i] ?? ""}
                    onChange={e => {
                      const current = [...(modVideos[modVideoSelectedModel] ?? Array(5).fill(""))];
                      current[i] = e.target.value;
                      setModVideos(prev => ({ ...prev, [modVideoSelectedModel]: current }));
                    }}
                    className="bg-black/60 border-primary/30 text-white focus:border-primary focus-visible:ring-primary font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => uploadVideo(url => {
                      const current = [...(modVideos[modVideoSelectedModel] ?? Array(5).fill(""))];
                      current[i] = url;
                      setModVideos(prev => ({ ...prev, [modVideoSelectedModel]: current }));
                    }, `${modVideoSelectedModel}-${i}`)}
                    disabled={uploadingVideo === `${modVideoSelectedModel}-${i}`}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-[10px] font-bold transition-colors shrink-0 disabled:opacity-50"
                  >
                    {uploadingVideo === `${modVideoSelectedModel}-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                saveSettingMutation.mutate(
                  { key: "modificacion_videos", value: JSON.stringify(modVideos) },
                  {
                    onSuccess: () => toast({ title: "Videos guardados", description: `Videos de ${modVideoSelectedModel} actualizados.` }),
                    onError: () => toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }),
                  }
                );
              }}
              className="w-full bg-gradient-to-r from-primary to-purple-600 font-display font-bold tracking-widest border-0 text-white mt-2"
            >
              {saveSettingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              GUARDAR VIDEOS DE {modVideoSelectedModel.toUpperCase()}
            </Button>

            {/* Vista previa de videos guardados */}
            {(modVideos[modVideoSelectedModel] ?? []).filter(Boolean).length > 0 && (
              <div className="space-y-2 pt-2 border-t border-primary/10">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">URLs guardadas para {modVideoSelectedModel}</p>
                {(modVideos[modVideoSelectedModel] ?? []).filter(Boolean).map((url, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-primary/10">
                    <PlayCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-mono text-zinc-400 truncate flex-1">{url}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const current = [...(modVideos[modVideoSelectedModel] ?? [])];
                        current[i] = "";
                        const cleaned = { ...modVideos, [modVideoSelectedModel]: current };
                        setModVideos(cleaned);
                        saveSettingMutation.mutate(
                          { key: "modificacion_videos", value: JSON.stringify(cleaned) },
                          { onSuccess: () => toast({ title: "Eliminado", description: "Video eliminado." }) }
                        );
                      }}
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Ratings Summary — en tab FEEDBACK */}
        {activeTab === 'feedback' && (
        <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-yellow-400" />
              Valoraciones de Usuarios
            </CardTitle>
            <Button variant="outline" size="sm" className="h-8 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-colors" onClick={() => refetchRatings()}>
              <RefreshCw className={`w-4 h-4 ${ratingsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {ratingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !ratingsSummary?.total ? (
              <p className="text-center text-zinc-500 py-8 text-sm">Aún no hay valoraciones.</p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 border-yellow-500/40 bg-yellow-500/10 shrink-0">
                    <span className="text-5xl font-display font-black text-yellow-400">{ratingsSummary.average}</span>
                    <span className="text-xs text-zinc-500 font-mono mt-1">de 5 estrellas</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(ratingsSummary.average) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5,4,3,2,1].map(stars => {
                      const count = ratingsSummary.distribution[stars] ?? 0;
                      const pct = ratingsSummary.total > 0 ? Math.round((count / ratingsSummary.total) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex gap-0.5 shrink-0">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden">
                            <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400 w-10 text-right">{count}</span>
                        </div>
                      );
                    })}
                    <p className="text-[11px] text-zinc-500 font-mono pt-1">{ratingsSummary.total} valoraciones en total</p>
                  </div>
                </div>
                {(ratingsSummary.recent?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-3">Últimos Comentarios</p>
                    <div className="space-y-2">
                      {ratingsSummary.recent.map((r: any) => (
                        <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-black/30 border border-primary/10">
                          <div className="flex gap-0.5 shrink-0 mt-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= r.stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                          <p className="text-xs text-zinc-300 flex-1">{r.comment}</p>
                          <span className="text-[10px] text-zinc-600 shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        )}

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading, subtitle }: { title: string; value: number | undefined; icon: React.ReactNode; loading: boolean; subtitle?: string }) {
  return (
    <Card className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-primary/20 overflow-hidden relative shadow-[0_0_15px_rgba(139,92,246,0.05)] hover:border-primary/40 transition-colors">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        {icon}
      </div>
      <CardContent className="p-6">
        <p className="text-xs text-muted-foreground font-display uppercase tracking-widest mb-1">{title}</p>
        <div className="text-3xl font-display font-black text-white">
          {loading || value === undefined ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            value
          )}
        </div>
        {subtitle && <p className="text-xs text-yellow-400 font-mono mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
