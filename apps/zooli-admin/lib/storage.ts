/**
 * SSR-safe wrappers for localStorage.
 * Always check `typeof window !== "undefined"` before accessing
 * browser-only APIs in Next.js — server-side rendering has no window.
 */

export const storage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Silently fail (e.g. private browsing quota exceeded)
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },

  getJson<T>(key: string): T | null {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson<T>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  },
};

/**
 * Example auth token helpers (to be used in client components only).
 * Replace with proper session management (next-auth, jose, etc.) later.
 */
export const authStorage = {
  getToken(): string | null {
    return storage.get("zooli_admin_token");
  },
  setToken(token: string): void {
    storage.set("zooli_admin_token", token);
  },
  clearToken(): void {
    storage.remove("zooli_admin_token");
  },
  isLoggedIn(): boolean {
    return !!this.getToken();
  },
};
