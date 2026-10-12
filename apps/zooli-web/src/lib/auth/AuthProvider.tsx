"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchOwnProfile, signIn, signUp, signOut, type Profile } from "@zooli/api-client";
import { supabase } from "../supabase";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const p = await fetchOwnProfile(supabase);
    setProfile(p);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    await signIn(supabase, email, password);
    await refresh();
  }
  async function register(email: string, password: string, fullName: string) {
    await signUp(supabase, email, password, "customer", fullName);
    await refresh();
  }
  async function logout() {
    await signOut(supabase);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
