"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name);
      router.push(params.get("next") ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className={styles.sub}>{mode === "login" ? "Sign in to order and track deliveries" : "A few details and you're set"}</p>

        {error && <div className={styles.error}>{error}</div>}

        {mode === "signup" && (
          <input className={styles.input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input className={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

        <button className={styles.submit} disabled={loading} type="submit">
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
        </button>

        <button type="button" className={styles.switch} onClick={() => setMode(m => m === "login" ? "signup" : "login")}>
          {mode === "login" ? "New to Zooli? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className={styles.wrap} />}>
      <LoginForm />
    </Suspense>
  );
}
