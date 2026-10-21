"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOwnProfile, signIn, signOut, type Profile } from "@zooli/api-client";
import { supabase } from "../supabase";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    setMustChangePassword(data.user?.user_metadata?.must_change_password === true);
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

  async function logout() {
    await signOut(supabase);
    setProfile(null);
  }

  return <AuthContext.Provider value={{ profile, loading, mustChangePassword, refresh, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Wrap a dashboard layout with this to bounce unauthenticated/wrong-role users to /login. */
export function useRequireRole(role: "vendor") {
  const { profile, loading, mustChangePassword } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!profile || profile.role !== role) router.replace("/login");
    else if (mustChangePassword) router.replace("/change-password");
  }, [loading, profile, role, mustChangePassword, router]);
  return { profile, loading, mustChangePassword };
}
