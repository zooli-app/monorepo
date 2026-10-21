"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { profile, loading, refresh } = useAuth();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next.length < 8) return setError("Password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next, data: { must_change_password: false } });
      if (error) throw error;
      await refresh(); // pick up the cleared flag before navigating, or the dashboard would bounce back here
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E0B4B] via-[#2D1060] to-[#130D2E] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-8">
        <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4"><KeyRound size={20} /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h2>
        <p className="text-gray-400 text-sm mb-6">You signed in with a temporary password. Choose your own to continue.</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-3.5 mb-5">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <input type={show ? "text" : "password"} className={inp + " pr-12"} placeholder="New password (min 8 characters)" value={next} onChange={(e) => setNext(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <input type={show ? "text" : "password"} className={inp} placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm">
            {busy ? "Saving..." : "Save and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
