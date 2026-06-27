import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/layout";
import { VipLayout } from "@/components/vip-layout";
import { InstallBanner } from "@/components/install-banner";
import { VipNotifications } from "@/components/vip-notifications";

// Lazy-loaded pages — each becomes its own chunk (code splitting)
const Home            = lazy(() => import("@/pages/home").then(m => ({ default: m.Home })));
const Redeem          = lazy(() => import("@/pages/redeem").then(m => ({ default: m.Redeem })));
const Sensitivity     = lazy(() => import("@/pages/sensitivity").then(m => ({ default: m.Sensitivity })));
const Boton           = lazy(() => import("@/pages/boton").then(m => ({ default: m.Boton })));
const Admin           = lazy(() => import("@/pages/admin/index").then(m => ({ default: m.Admin })));
const NotFound        = lazy(() => import("@/pages/not-found"));
const VipDashboard    = lazy(() => import("@/pages/vip/index").then(m => ({ default: m.VipDashboard })));
const VipSensitivities= lazy(() => import("@/pages/vip/sensitivities").then(m => ({ default: m.VipSensitivities })));
const VipDownloads    = lazy(() => import("@/pages/vip/downloads").then(m => ({ default: m.VipDownloads })));
const VipProfile      = lazy(() => import("@/pages/vip/profile").then(m => ({ default: m.VipProfile })));
const Headtrick       = lazy(() => import("@/pages/vip/headtrick").then(m => ({ default: m.Headtrick })));
const Optimizacion    = lazy(() => import("@/pages/vip/optimizacion").then(m => ({ default: m.Optimizacion })));
const Modificacion    = lazy(() => import("@/pages/vip/modificacion").then(m => ({ default: m.Modificacion })));
const VipHud          = lazy(() => import("@/pages/vip/hud").then(m => ({ default: m.VipHud })));
const Descargas       = lazy(() => import("@/pages/descargas").then(m => ({ default: m.Descargas })));
const Catalogo        = lazy(() => import("@/pages/catalogo").then(m => ({ default: m.Catalogo })));
const Faq             = lazy(() => import("@/pages/faq").then(m => ({ default: m.Faq })));
const Referencias     = lazy(() => import("@/pages/referencias").then(m => ({ default: m.Referencias })));
const Soporte         = lazy(() => import("@/pages/soporte").then(m => ({ default: m.Soporte })));
const VipSoporte      = lazy(() => import("@/pages/vip/soporte").then(m => ({ default: m.VipSoporte })));
const Convertirte     = lazy(() => import("@/pages/convertirte").then(m => ({ default: m.Convertirte })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const access = typeof window !== "undefined" ? localStorage.getItem("beast-access") : null;
  const hasAccess = !!access;
  const isVip = access === "vip";
  const isAdminRoute = location.startsWith("/admin");
  const isRedeemRoute = location === "/redeem";
  const isDescargasRoute = location.startsWith("/descargas");
  const isPublicRoute = location === "/faq" || location === "/referencias" || location === "/soporte";
  const isRootRoute = location === "/";

  useEffect(() => {
    if (!hasAccess && !isRedeemRoute && !isAdminRoute && !isDescargasRoute && !isPublicRoute) {
      setLocation("/redeem");
    } else if (isVip && (isRootRoute || isRedeemRoute)) {
      setLocation("/vip");
    }
  }, [hasAccess, isVip, isRedeemRoute, isAdminRoute, isDescargasRoute, isPublicRoute, isRootRoute]);

  if (!hasAccess && !isRedeemRoute && !isAdminRoute && !isDescargasRoute && !isPublicRoute) return null;

  return <>{children}</>;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/redeem" component={Redeem} />
        <Route path="/sensitivity" component={Sensitivity} />
        <Route path="/admin" component={Admin} />

        <Route path="/vip">
          <VipLayout><VipDashboard /></VipLayout>
        </Route>
        <Route path="/vip/sensitivities">
          <VipLayout><VipSensitivities /></VipLayout>
        </Route>
        <Route path="/vip/downloads">
          <VipLayout><VipDownloads /></VipLayout>
        </Route>
        <Route path="/vip/profile">
          <VipLayout><VipProfile /></VipLayout>
        </Route>
        <Route path="/vip/headtrick">
          <VipLayout><Headtrick /></VipLayout>
        </Route>
        <Route path="/vip/optimizacion">
          <VipLayout><Optimizacion /></VipLayout>
        </Route>
        <Route path="/vip/modificacion">
          <VipLayout><Modificacion /></VipLayout>
        </Route>
        <Route path="/vip/hud">
          <VipLayout><VipHud /></VipLayout>
        </Route>
        <Route path="/vip/soporte">
          <VipLayout><VipSoporte /></VipLayout>
        </Route>

        <Route path="/boton" component={Boton} />
        <Route path="/descargas" component={Descargas} />
        <Route path="/descargas/:slug" component={Catalogo} />
        <Route path="/faq" component={Faq} />
        <Route path="/referencias" component={Referencias} />
        <Route path="/soporte" component={Soporte} />
        <Route path="/convertirte" component={Convertirte} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function usePing() {
  const sessionIdRef = useRef<string>(
    (() => {
      let id = sessionStorage.getItem("bs7-session");
      if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("bs7-session", id);
      }
      return id;
    })()
  );

  useEffect(() => {
    const ping = () =>
      fetch("/api/stats/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      }).catch(() => {});
    ping();
    const id = setInterval(ping, 30000);
    return () => clearInterval(id);
  }, []);
}

function App() {
  usePing();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Gate>
              <Router />
            </Gate>
          </Layout>
        </WouterRouter>
        <Toaster />
        <InstallBanner />
        <VipNotifications />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
