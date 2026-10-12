"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, Headphones, Lock, ShieldCheck, Info, Pencil } from "lucide-react";
import type { FieldValue, FormDefinition, FormValues, Section, UploadedFile } from "@zooli/vendor-forms";
import {
  SENSITIVE_FIELDS, displayValue, initialValues, isUploadedFile, isVisible, validateField, validateForm, validateSection,
} from "@zooli/vendor-forms";
import { ApiError } from "@zooli/api-client";
import type { ApplyConfig } from "@zooli/api-client";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { FieldRenderer } from "./inputs";
import { HumanCheck } from "./HumanCheck";
import { OtpPanel } from "./OtpPanel";
import { setApplySession } from "./upload";

type Stage = "edit" | "review" | "done";

const draftKey = (service: string) => `zooli.vendorDraft.v2.${service}`;
const DRAFT_MAX_AGE_MS = 7 * 24 * 3600 * 1000;

/** Drafts live in this browser only, so sensitive numbers are never written to them. */
function draftPayload(values: FormValues) {
  const safe: FormValues = { ...values };
  for (const f of SENSITIVE_FIELDS) delete safe[f];
  return JSON.stringify({ savedAt: Date.now(), values: safe });
}

function Card({ section, children }: { section: Section; children: React.ReactNode }) {
  return (
    <section id={`sec-${section.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 scroll-mt-24 h-full">
      <h2 className="text-[15px] font-bold text-indigo-900 mb-1">
        {section.title}
        {section.caption && <span className="ml-2 text-[11px] font-medium text-gray-400">{section.caption}</span>}
      </h2>
      {section.subtitle && <p className="text-xs text-gray-400 mb-3">{section.subtitle}</p>}
      {section.notice && (
        <div className="my-3 rounded-xl border border-purple-100 bg-purple-50/60 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-purple-800"><Info size={14} />{section.notice.title}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-600">
            {section.notice.items.map((i) => <span key={i}>• {i}</span>)}
          </div>
        </div>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function FormEngine({ form }: { form: FormDefinition }) {
  const [values, setValues] = useState<FormValues>(() => initialValues(form));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("edit");
  const [banner, setBanner] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);
  const [config, setConfig] = useState<ApplyConfig | null>(null);
  const [configError, setConfigError] = useState(false);
  const [session, setSession] = useState<{ token: string; exp: number } | null>(null);
  const [otp, setOtp] = useState<{ token: string; mobile: string } | null>(null);

  // ---- security config + captcha session ----
  useEffect(() => { api.applications.config().then(setConfig).catch(() => setConfigError(true)); }, []);
  useEffect(() => { setApplySession(session?.token ?? ""); }, [session]);
  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => setSession(null), Math.max(0, session.exp - Date.now() - 30_000)); // re-verify shortly before expiry
    return () => clearTimeout(t);
  }, [session]);

  // ---- draft: restore once, then autosave (localStorage, this device only) ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(form.service));
      if (raw) {
        const saved = JSON.parse(raw) as { savedAt?: number; values?: FormValues };
        if (saved?.values && typeof saved.savedAt === "number" && Date.now() - saved.savedAt < DRAFT_MAX_AGE_MS) {
          setValues({ ...initialValues(form), ...saved.values }); setRestored(true);
        } else localStorage.removeItem(draftKey(form.service));
      }
    } catch { /* ignore corrupt draft */ }
    loaded.current = true;
  }, [form]);

  useEffect(() => {
    if (!loaded.current || stage !== "edit") return;
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey(form.service), draftPayload(values)); } catch { /* storage full / private mode */ }
    }, 800);
    return () => clearTimeout(t);
  }, [values, stage, form.service]);

  const set = useCallback((name: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => { if (!(name in prev)) return prev; const n = { ...prev }; delete n[name]; return n; });
  }, []);

  const blur = useCallback((name: string) => {
    for (const s of form.sections) {
      const f = s.fields.find((x) => x.name === name);
      if (f) {
        const e = validateField(f, values);
        setErrors((prev) => { const n = { ...prev }; if (e) n[name] = e; else delete n[name]; return n; });
        return;
      }
    }
  }, [form, values]);

  // ---- OpenStreetMap (Nominatim) search for the food form's map ----
  async function searchLocation(q: string) {
    if (q.trim().length < 3) { setNotice("Type at least 3 characters to search"); return; }
    setSearching(true); setNotice(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`);
      const hits = (await res.json()) as { lat: string; lon: string }[];
      if (!hits.length) setNotice("Couldn't find that place. Try a nearby landmark or enter latitude / longitude.");
      else {
        set("latitude", Number(hits[0].lat).toFixed(6));
        set("longitude", Number(hits[0].lon).toFixed(6));
      }
    } catch { setNotice("Location search is unavailable right now. Enter latitude / longitude manually."); }
    finally { setSearching(false); }
  }

  // ---- step progress ----
  const stepState = useMemo(() => {
    return form.steps.map((_, i) => {
      const secs = form.sections.filter((s) => s.step === i);
      if (!secs.length) return { secs, done: stage !== "edit" };
      return { secs, done: secs.every((s) => Object.keys(validateSection(s, values)).length === 0) };
    });
  }, [form, values, stage]);
  const activeStep = Math.max(0, stepState.findIndex((s) => !s.done));
  const doneCount = stepState.filter((s) => s.done).length;

  function goToStep(i: number) {
    const secs = stepState[i].secs;
    const el = secs.length ? document.getElementById(`sec-${secs[0].id}`) : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function saveDraft() {
    try {
      localStorage.setItem(draftKey(form.service), draftPayload(values));
      setNotice("Draft saved on this device for 7 days. For your security, Aadhaar, PAN, account and licence numbers are not saved — you'll re-enter them.");
    } catch { setNotice("Couldn't save the draft on this device."); }
  }

  function discardDraft() {
    try { localStorage.removeItem(draftKey(form.service)); } catch { /* ignore */ }
    setValues(initialValues(form)); setErrors({}); setRestored(false); setNotice(null);
  }

  function review() {
    if (config?.otpRequired && otp?.mobile !== String(values.mobile ?? "").replace(/\D/g, "")) {
      setBanner("Please verify your mobile number with the OTP before continuing.");
      document.getElementById("otp-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const errs = validateForm(form, values);
    setErrors(errs);
    const keys = Object.keys(errs);
    if (keys.length) {
      setBanner(`${keys.length} field${keys.length > 1 ? "s" : ""} need your attention — highlighted in red below.`);
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-fields~="${keys[0]}"]`) ?? document.getElementById("declaration-bar");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setBanner(null); setStage("review"); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitting(true); setBanner(null);
    try {
      if (!session) throw new ApiError(401, "Please complete the security check first.", { code: "session_required" });
      const res = await api.applications.submit(form.service, values, session.token, otp?.token);
      try { localStorage.removeItem(draftKey(form.service)); } catch { /* ignore */ }
      setReference(res.reference); setStage("done"); window.scrollTo({ top: 0 });
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { fields?: Record<string, string>; code?: string } | null;
        if (body?.fields) { setErrors(body.fields); setStage("edit"); }
        if (body?.code === "session_required") setSession(null);
        setBanner(e.message);
      } else setBanner("Something went wrong. Please check your connection and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally { setSubmitting(false); }
  }

  // ---- group consecutive `half` sections into one row ----
  const rows: Section[][] = [];
  for (let i = 0; i < form.sections.length; i++) {
    const s = form.sections[i], n = form.sections[i + 1];
    if (s.half && n?.half) { rows.push([s, n]); i++; } else rows.push([s]);
  }

  const fieldGrid = (s: Section) => (
    <div className="grid grid-cols-12 gap-x-4 gap-y-4">
      {s.fields.map((f) => (
        <FieldRenderer key={f.name} field={f} values={values} errors={errors} set={set} blur={blur}
          search={searchLocation} searching={searching} />
      ))}
    </div>
  );

  const header = (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/register" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zooli-logo.png" alt="Zooli" className="h-11 w-auto" />
        </Link>
        <div className="hidden sm:block w-px h-10 bg-gray-200" />
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-indigo-900 leading-tight truncate">{form.emoji} {form.title}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Please fill all the details carefully to complete your registration</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-xs text-gray-600">
          <Headphones size={20} className="text-purple-700" />
          <div><p className="font-semibold text-gray-800">Need Help?</p><p>support@zooli.in</p><p>8985956617</p></div>
        </div>
      </div>
    </header>
  );

  // ================= DONE =================
  if (stage === "done") {
    return (
      <div className="min-h-screen bg-[#f6f4fb]">
        {header}
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
            <h2 className="text-2xl font-bold text-indigo-900 mt-4">Application submitted!</h2>
            <p className="text-sm text-gray-600 mt-2">Thank you for registering with Zooli. Our team will verify your documents and contact you on your mobile number.</p>
            <div className="mt-5 rounded-xl bg-purple-50 py-3">
              <p className="text-[11px] uppercase tracking-widest text-gray-500">Your reference number</p>
              <p className="text-xl font-black tracking-wider text-purple-800 select-all">{reference}</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">Please save this number — quote it if you contact support.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/register" className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Register another service</Link>
              <Link href="/login" className="px-4 py-2.5 rounded-xl bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800">Go to login</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ================= REVIEW =================
  if (stage === "review") {
    return (
      <div className="min-h-screen bg-[#f6f4fb]">
        {header}
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-indigo-900">Review your information</h2>
            <button onClick={() => { setStage("edit"); window.scrollTo({ top: 0 }); }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:underline"><Pencil size={14} />Edit</button>
          </div>
          {banner && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{banner}</div>}
          {!session && config && <HumanCheck config={config} onSession={(token, ttl) => setSession({ token, exp: Date.now() + ttl * 1000 })} />}
          {form.sections.map((s) => {
            const visible = s.fields.filter((f) => isVisible(f, values) && f.type !== "map");
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-indigo-900 mb-3">{s.title}</h3>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {visible.map((f) => {
                    const v = values[f.name];
                    const files: UploadedFile[] = Array.isArray(v) ? (v as UploadedFile[]).filter(isUploadedFile) : isUploadedFile(v) ? [v] : [];
                    return (
                      <div key={f.name} className="text-sm">
                        <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</dt>
                        <dd className="text-gray-800 break-words">
                          {f.type === "file"
                            ? (files.length ? files.map((x) => <span key={x.url} className="block text-emerald-700 truncate">✓ {x.name}</span>) : "—")
                            : displayValue(f, values)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}
          <div className="flex gap-3">
            <button onClick={() => setStage("edit")} className="flex-1 h-12 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2">
              <ArrowLeft size={16} />Back to edit
            </button>
            <button onClick={submit} disabled={submitting || !session}
              className="flex-[2] h-12 rounded-xl bg-indigo-900 hover:bg-indigo-950 disabled:opacity-60 text-white text-sm font-bold inline-flex items-center justify-center gap-2">
              {submitting ? "Submitting…" : session ? "Submit application" : "Complete security check to submit"}<ArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ================= EDIT =================
  return (
    <div className="min-h-screen bg-[#f6f4fb]">
      {header}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">
        {/* steps sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-bold text-indigo-900 mb-3">Registration Steps</p>
            <ol className="space-y-1">
              {form.steps.map((st, i) => {
                const done = stepState[i].done && i < activeStep;
                const active = i === activeStep;
                return (
                  <li key={st.title}>
                    <button type="button" onClick={() => goToStep(i)}
                      className={cn("w-full text-left flex gap-3 rounded-xl px-2 py-2 hover:bg-purple-50", active && "bg-purple-50")}>
                      <span className={cn("w-7 h-7 shrink-0 rounded-full text-xs font-bold flex items-center justify-center border",
                        done ? "bg-emerald-500 border-emerald-500 text-white" : active ? "bg-purple-700 border-purple-700 text-white" : "border-gray-300 text-gray-500")}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("block text-[13px] font-semibold leading-tight", active ? "text-purple-800" : "text-gray-800")}>{st.title}</span>
                        <span className="block text-[11px] text-gray-400 leading-tight">{st.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="mt-3 bg-purple-50 rounded-2xl p-4 text-xs text-gray-600 flex gap-2">
            <ShieldCheck size={18} className="text-purple-700 shrink-0" />
            <div><p className="font-semibold text-gray-800">Your Information is Safe</p>Your data is secure and will only be used for verification purposes.</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-4">
          {/* mobile progress */}
          <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
              <span>{form.steps[activeStep]?.title}</span><span>{doneCount} / {form.steps.length} steps</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${(doneCount / form.steps.length) * 100}%` }} />
            </div>
          </div>

          {configError && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">Can&apos;t reach the server. Check your connection and refresh the page.</div>}
          {!session && config && <HumanCheck config={config} onSession={(token, ttl) => setSession({ token, exp: Date.now() + ttl * 1000 })} />}

          {restored && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 flex items-center justify-between gap-3">
              <span>We restored your saved draft. Please re-enter Aadhaar, PAN, bank account and licence numbers (not saved for security).</span>
              <button onClick={discardDraft} className="text-xs font-semibold underline shrink-0">Start over</button>
            </div>
          )}
          {banner && <div role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{banner}</div>}
          {notice && <div className="rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3">{notice}</div>}

          {rows.map((row) => (
            <div key={row[0].id} className={cn(row.length > 1 && "grid lg:grid-cols-2 gap-4 items-stretch")}>
              {row.map((s) => (
                <Fragment key={s.id}><Card section={s}>{fieldGrid(s)}</Card></Fragment>
              ))}
            </div>
          ))}

          {config?.otpRequired && session && (
            <div id="otp-panel">
              <OtpPanel mobile={String(values.mobile ?? "")} session={session.token} verifiedMobile={otp?.mobile ?? null}
                onVerified={(token, mobile) => { setOtp({ token, mobile }); setBanner(null); }} />
            </div>
          )}

          <div id="declaration-bar" className={cn("rounded-xl border px-4 py-3", errors.declaration ? "border-red-300 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
            <label className="flex items-start gap-2.5 text-sm text-gray-800 cursor-pointer">
              <input type="checkbox" checked={values.declaration === true}
                onChange={(e) => set("declaration", e.target.checked)} className="accent-purple-700 w-4 h-4 mt-0.5" />
              <span>I confirm that all the information provided above is true and correct. I agree to ZOOLI&apos;s{" "}
                <span className="text-purple-700 font-semibold">Terms &amp; Conditions</span> and <span className="text-purple-700 font-semibold">Privacy Policy</span>.</span>
            </label>
            {errors.declaration && <p className="text-[11px] text-red-600 mt-1 font-medium ml-6">{errors.declaration}</p>}
          </div>

          <div className="space-y-2.5">
            <button type="button" onClick={review}
              className="w-full h-12 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-sm font-bold inline-flex items-center justify-center gap-2">
              {form.primaryLabel}<ArrowRight size={16} />
            </button>
            <button type="button" onClick={saveDraft}
              className="w-full h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2">
              <Bookmark size={15} />Save &amp; Continue Later
            </button>
            <p className="rounded-xl bg-amber-50 text-[11px] text-gray-600 py-2 text-center flex items-center justify-center gap-1.5">
              <Lock size={12} />By continuing, you agree to ZOOLI&apos;s Terms &amp; Conditions and Privacy Policy.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
