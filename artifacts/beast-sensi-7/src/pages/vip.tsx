import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRedeemLicense, useCheckLicenseStatus } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Key, ShieldCheck, AlertTriangle } from "lucide-react";
import { getVipKey, setVipKey, clearVipKey } from "@/lib/store";

export default function VipAccess() {
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [currentVipStatus, setCurrentVipStatus] = useState<any>(null);
  
  const redeemLicense = useRedeemLicense();
  const checkLicense = useCheckLicenseStatus();

  useEffect(() => {
    const savedKey = getVipKey();
    if (savedKey) {
      checkLicense.mutate({ data: { key: savedKey } }, {
        onSuccess: (data) => {
          setCurrentVipStatus(data);
        },
        onError: () => {
          clearVipKey();
        }
      });
    }
  }, []);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey) return;

    redeemLicense.mutate({ data: { key: licenseKey, deviceInfo: navigator.userAgent } }, {
      onSuccess: (data) => {
        setVipKey(data.key);
        setCurrentVipStatus(data);
        setLicenseKey("");
        toast({
          title: "Acceso VIP Desbloqueado",
          description: "Bienvenido a Beast Sensi VIP.",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "Licencia inválida o ya en uso.",
        });
      }
    });
  };

  const handleLogout = () => {
    clearVipKey();
    setCurrentVipStatus(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-display text-primary tracking-widest drop-shadow-md mb-4">ACCESO VIP</h1>
          <p className="text-muted-foreground">Desbloquea descargas exclusivas y configuraciones premium.</p>
        </div>

        {currentVipStatus && currentVipStatus.isVip ? (
          <Card className="border-primary/50 bg-card/80 backdrop-blur shadow-[0_0_30px_-15px_rgba(22,163,74,0.4)] animate-in zoom-in-95">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-3xl text-primary tracking-wider">VIP ACTIVO</CardTitle>
              <CardDescription>Tu acceso premium está validado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Estado</p>
                  <p className="font-bold text-primary">{currentVipStatus.status}</p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Duración</p>
                  <p className="font-bold">{currentVipStatus.duration || "N/A"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogout} variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
                Cerrar Sesión VIP
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-border bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-2xl tracking-wider">
                <Key className="w-6 h-6 text-primary" />
                CANJEAR LICENCIA
              </CardTitle>
              <CardDescription>Ingresa tu código de licencia para obtener beneficios VIP.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRedeem} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="license">Código de Licencia</Label>
                  <Input 
                    id="license" 
                    placeholder="BEAST-XXXX-XXXX-XXXX" 
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="font-mono text-center text-lg h-12 border-primary/30 focus-visible:ring-primary uppercase"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={redeemLicense.isPending || !licenseKey} 
                  className="w-full h-12 text-lg font-display tracking-widest bg-primary hover:bg-primary/80 text-primary-foreground"
                >
                  {redeemLicense.isPending ? "VERIFICANDO..." : "ACTIVAR VIP"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-lg flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-1" />
          <p className="text-sm text-muted-foreground">
            Las licencias son para un solo dispositivo. Compartir tu licencia resultará en un baneo automático del sistema. Para adquirir una licencia, contacta al administrador en nuestro grupo oficial.
          </p>
        </div>
      </div>
    </Layout>
  );
}
