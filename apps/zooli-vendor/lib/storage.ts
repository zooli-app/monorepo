const safe = (fn: () => string | null): string | null => {
  if (typeof window === "undefined") return null;
  try { return fn(); } catch { return null; }
};
export const authStorage = {
  getToken: () => safe(() => localStorage.getItem("zooli_vendor_token")),
  setToken: (t: string) => { if (typeof window !== "undefined") try { localStorage.setItem("zooli_vendor_token", t); } catch {} },
  clearToken: () => { if (typeof window !== "undefined") try { localStorage.removeItem("zooli_vendor_token"); } catch {} },
};
