"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E0B4B] via-[#2D1060] to-[#130D2E] flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative">
        {/* Header */}
        <div className="text-center mb-8">
          {/* White plate keeps the indigo lettering readable on the dark page */}
          <div className="inline-block bg-white rounded-3xl px-6 py-3 shadow-2xl shadow-black/30 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zooli-logo.png" alt="Zooli — Move Fast, Stay Connected" className="h-20 w-auto" />
          </div>
          <p className="text-white/50 text-sm tracking-widest uppercase font-medium">Vendor Partner Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-purple-600 via-amber-400 to-orange-500" />

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm mb-6">Sign in to manage your store</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-3.5 mb-5 flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"
                  placeholder="owner@business.in" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all pr-12"
                    placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" className="text-xs text-purple-600 font-semibold hover:underline">Forgot password?</button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                ) : "Sign In to Dashboard"}
              </button>
            </form>

            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-100">
              <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-gray-400">Secured with 256-bit SSL encryption</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          New to Zooli? <a href="/register" className="text-amber-400 font-semibold hover:underline">Register your business →</a>
        </p>
      </div>
    </div>
  );
}
