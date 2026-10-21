"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Store } from "@zooli/api-client";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface StoreState {
  store: Store | null;
  email: string;
  loading: boolean;
  refresh: () => Promise<void>;
  setOpen: (open: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreState | null>(null);

/** Loads the signed-in vendor's real store + login email once, for the sidebar, topbar and pages. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [{ store }, { data }] = await Promise.all([api.vendor.getStore(), supabase.auth.getUser()]);
      setStore(store);
      setEmail(data.user?.email ?? "");
    } catch {
      /* keep previous values; pages show their own errors */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setOpen = useCallback(async (open: boolean) => {
    const prev = store;
    setStore((s) => (s ? { ...s, is_open: open } : s)); // optimistic
    try {
      const { store: updated } = await api.vendor.updateStore({ is_open: open });
      setStore((s) => (s ? { ...s, ...updated } : s));
    } catch {
      setStore(prev); // revert if the API rejected it
    }
  }, [store]);

  return <StoreContext.Provider value={{ store, email, loading, refresh, setOpen }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
