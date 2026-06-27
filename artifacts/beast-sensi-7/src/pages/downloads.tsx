import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useListDownloads, getListDownloadsQueryKey, useIncrementDownload } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Lock, FileArchive, Zap } from "lucide-react";
import { getVipKey } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";

export default function Downloads() {
  const [activeCatalog, setActiveCatalog] = useState("packs_famosos");
  const isVip = !!getVipKey();
  
  const { data: downloads, isLoading } = useListDownloads({ catalog: activeCatalog }, { 
    query: { 
      queryKey: getListDownloadsQueryKey({ catalog: activeCatalog })
    } 
  });
  
  const incrementDownload = useIncrementDownload();

  const handleDownload = (id: number, url: string, tier: string) => {
    if (tier === "vip" && !isVip) {
      window.location.href = "/vip";
      return;
    }
    
    incrementDownload.mutate({ id }, {
      onSuccess: () => {
        window.open(url, "_blank");
      }
    });
  };

  const catalogs = [
    { id: "packs_famosos", label: "Packs Famosos" },
    { id: "xit_android", label: "XIT Android" },
    { id: "xit_iphone", label: "XIT iPhone" },
    { id: "proxy", label: "Proxy" },
    { id: "optimizacion", label: "Optimización" }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display text-primary tracking-widest drop-shadow-md mb-2">CATÁLOGO DE DESCARGAS</h1>
          <p className="text-muted-foreground text-lg">Archivos, configuraciones y herramientas para dominar el juego.</p>
        </div>

        <Tabs defaultValue="packs_famosos" value={activeCatalog} onValueChange={setActiveCatalog} className="w-full">
          <div className="overflow-x-auto pb-4 mb-4 scrollbar-none">
            <TabsList className="bg-card border border-border h-12 w-max inline-flex">
              {catalogs.map(catalog => (
                <TabsTrigger 
                  key={catalog.id} 
                  value={catalog.id}
                  className="font-display tracking-wider text-base px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {catalog.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCatalog} className="mt-0 focus-visible:outline-none">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-card/50 border-border">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : downloads?.length === 0 ? (
              <div className="text-center py-20 bg-card/30 rounded-lg border border-dashed border-border">
                <FileArchive className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-display tracking-wider text-muted-foreground">NO HAY ARCHIVOS DISPONIBLES</h3>
                <p className="text-sm text-muted-foreground mt-2">Vuelve más tarde para nuevas actualizaciones.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {downloads?.map(item => (
                  <Card key={item.id} className={`border-border bg-card/80 backdrop-blur flex flex-col ${item.tier === 'vip' ? 'border-accent/30 shadow-[0_0_15px_-5px_rgba(22,163,74,0.15)]' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={item.tier === "vip" ? "default" : "secondary"} className={item.tier === "vip" ? "bg-accent text-accent-foreground font-bold tracking-wider" : ""}>
                          {item.tier === "vip" ? "VIP" : "GRATIS"}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.downloadCount}
                        </span>
                      </div>
                      <CardTitle className="font-display text-2xl tracking-wide">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-2 rounded border border-border">
                        <Zap className="w-4 h-4 text-primary" />
                        <span>Categoría: <strong className="text-foreground">{item.category}</strong></span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {item.tier === "vip" && !isVip ? (
                        <Button
                          onClick={() => handleDownload(item.id, item.fileUrl, item.tier)}
                          className="w-full font-bold tracking-wider bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                          variant="outline"
                        >
                          <Lock className="w-4 h-4 mr-2" /> REQUIERE VIP
                        </Button>
                      ) : item.tier === "vip" ? (
                        <button
                          onClick={() => handleDownload(item.id, item.fileUrl, item.tier)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-bold tracking-wider text-black shadow-[0_0_18px_rgba(251,191,36,0.45)] transition-all hover:shadow-[0_0_28px_rgba(251,191,36,0.65)] active:scale-95"
                          style={{ background: "linear-gradient(90deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b)", backgroundSize: "200% 100%", animation: "goldShift 2.5s linear infinite" }}
                        >
                          <Download className="w-4 h-4" /> DESCARGAR VIP
                        </button>
                      ) : (
                        <Button
                          onClick={() => handleDownload(item.id, item.fileUrl, item.tier)}
                          className="w-full font-bold tracking-wider"
                          variant="default"
                        >
                          <Download className="w-4 h-4 mr-2" /> DESCARGAR
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
