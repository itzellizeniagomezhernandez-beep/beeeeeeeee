import { useState, useEffect } from "react";
import { AdminDashboard } from "./dashboard";
import { AdminLogin } from "./login";

export function Admin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminToken");
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    const manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    const appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    const appleTitle = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-title']");

    const prevManifest = manifestLink?.href ?? "";
    const prevIcon = appleIcon?.href ?? "";
    const prevTitle = appleTitle?.content ?? "";

    if (manifestLink) manifestLink.href = "/admin-manifest.json";
    if (appleIcon) appleIcon.href = "/admin-icon.png";
    if (appleTitle) appleTitle.content = "Admin App";

    return () => {
      if (manifestLink) manifestLink.href = prevManifest;
      if (appleIcon) appleIcon.href = prevIcon;
      if (appleTitle) appleTitle.content = prevTitle;
    };
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  if (!token) return <AdminLogin onLogin={handleLogin} />;

  return <AdminDashboard token={token} onLogout={handleLogout} />;
}
