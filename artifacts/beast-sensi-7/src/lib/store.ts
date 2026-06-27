export const getAdminToken = () => localStorage.getItem("x-admin-token");
export const setAdminToken = (token: string) => localStorage.setItem("x-admin-token", token);
export const clearAdminToken = () => localStorage.removeItem("x-admin-token");

export const getVipKey = () => localStorage.getItem("vip-key");
export const setVipKey = (key: string) => localStorage.setItem("vip-key", key);
export const clearVipKey = () => localStorage.removeItem("vip-key");
