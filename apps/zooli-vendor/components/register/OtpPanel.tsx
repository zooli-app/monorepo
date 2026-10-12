"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { api } from "@/lib/api";

/** Mobile OTP. Only rendered when the API says OTP_REQUIRED=true. Works in mock and live mode. */
export function OtpPanel({ mobile, session, verifiedMobile, onVerified }: {
  mobile: string; session: string; verifiedMobile: string | null; onVerified: (token: string, mobile: string) => void;
}) {
  const clean = mobile.replace(/\D/g, "");
  const valid = /^[6-9]\d{9}$/.test(clean);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (verifiedMobile && verifiedMobile === clean) {
    return <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 size={16} />Mobile number {clean} verified</div>;
  }

  async function send() {
    setBusy(true); setErr(null); setMsg(null);
    try { const r = await api.applications.sendOtp(clean, session); setSent(true); setMsg(r.devHint ?? `Code sent to ${clean}`); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function verify() {
    setBusy(true); setErr(null);
    try { const r = await api.applications.verifyOtp(clean, code, session); onVerified(r.otpToken, clean); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-indigo-900"><Smartphone size={15} />Verify your mobile number</p>
      <p className="text-xs text-gray-500 mt-0.5">{valid ? `We'll send a one-time code to ${clean}.` : "Enter a valid mobile number above first."}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <button type="button" disabled={!valid || busy} onClick={send}
          className="h-10 px-4 rounded-lg border border-purple-200 bg-purple-50 text-sm font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 inline-flex items-center gap-2">
          {busy && <Loader2 size={14} className="animate-spin" />}{sent ? "Resend code" : "Send code"}
        </button>
        {sent && (
          <>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" placeholder="Enter code"
              className="h-10 w-36 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-purple-500" />
            <button type="button" disabled={code.length < 4 || busy} onClick={verify}
              className="h-10 px-4 rounded-lg bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50">Verify</button>
          </>
        )}
      </div>
      {msg && <p className="text-xs text-blue-700 mt-2">{msg}</p>}
      {err && <p className="text-xs text-red-600 mt-2">{err}</p>}
    </div>
  );
}
