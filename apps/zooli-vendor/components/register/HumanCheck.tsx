"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import type { ApplyConfig } from "@zooli/api-client";
import { api } from "@/lib/api";

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void };
  }
}

/** Captcha gate. live = Cloudflare Turnstile widget; mock = one-click dev button. Calls onSession(token, expiresInSec). */
export function HumanCheck({ config, onSession }: { config: ApplyConfig; onSession: (token: string, expiresIn: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exchange(captchaToken: string) {
    setBusy(true); setError(null);
    try {
      const r = await api.applications.startSession(captchaToken);
      onSession(r.token, r.expiresIn);
    } catch (e) {
      setError((e as Error).message || "Verification failed. Please try again.");
      window.turnstile?.reset();
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (config.captcha !== "live" || !config.turnstileSiteKey) return;
    let widgetId: string | undefined;
    let cancelled = false;
    const mount = () => {
      if (cancelled || !box.current || !window.turnstile) return;
      widgetId = window.turnstile.render(box.current, {
        sitekey: config.turnstileSiteKey,
        callback: (t: string) => exchange(t),
        "error-callback": () => setError("Verification failed to load. Please refresh the page."),
      });
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true; s.onload = mount;
      document.head.appendChild(s);
    }
    return () => { cancelled = true; if (widgetId) window.turnstile?.remove(widgetId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.captcha, config.turnstileSiteKey]);

  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-purple-800"><ShieldCheck size={16} />Quick security check</p>
      <p className="text-xs text-gray-500 mt-0.5 mb-3">Confirm you&apos;re a person to enable uploads and submission.</p>
      {config.captcha === "live" ? <div ref={box} /> : (
        <button type="button" onClick={() => exchange("mock-pass")} disabled={busy}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-purple-300 bg-white text-sm font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />}I&apos;m not a robot <span className="text-[10px] font-normal text-gray-400">(dev mode)</span>
        </button>
      )}
      {busy && config.captcha === "live" && <p className="text-xs text-gray-500 mt-2">Verifying…</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
