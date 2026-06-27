import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAdminLogin } from "@workspace/api-client-react";
import { Lock, Shield, Loader2 } from "lucide-react";

export function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    loginMutation.mutate({ data: { password } }, {
      onSuccess: (data) => {
        onLogin(data.token);
        toast({
          title: "Acceso Concedido",
          description: "Bienvenido al panel de administración.",
        });
      },
      onError: () => {
        toast({
          title: "Acceso Denegado",
          description: "Contraseña incorrecta.",
          variant: "destructive",
        });
        setPassword("");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-md bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-primary/30 shadow-[0_0_50px_rgba(139,92,246,0.2)] relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 mx-auto bg-black border border-primary/50 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(139,92,246,0.4)]">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-display font-black text-3xl uppercase tracking-widest mb-2 text-white">
            ADMIN <span className="text-primary drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">CORE</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground uppercase tracking-wider text-xs">
            Sistema de Gestión Restringido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 h-14 bg-black/60 border border-primary/30 focus-visible:ring-primary focus-visible:border-primary font-mono text-xl tracking-widest text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/70" />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-500 hover:to-primary font-display font-bold tracking-widest text-lg shadow-[0_0_20px_rgba(139,92,246,0.5)] border-0"
              disabled={!password || loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "AUTENTICAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
