import { useState, useEffect } from "react";
import { AdminDashboard } from "./dashboard";
import { AdminLogin } from "./login";

export function Admin() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("adminToken");
    if (stored) setToken(stored);
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
