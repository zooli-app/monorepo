"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X, ExternalLink, Loader2 } from "lucide-react";
import { FORMS, SERVICE_KEYS, SENSITIVE_FIELDS, getForm, isUploadedFile, isVisible, displayValue } from "@zooli/vendor-forms";
import type { UploadedFile } from "@zooli/vendor-forms";
import type { ApplicationStatus, ReviewResult, VendorApplication, VendorApplicationSummary } from "@zooli/api-client";
import { PageHeader, SectionCard } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "Pending", under_review: "Under review", needs_info: "Needs info", approved: "Approved", rejected: "Rejected",
};
const STATUS_STYLE: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700", under_review: "bg-blue-50 text-blue-700",
  needs_info: "bg-orange-50 text-orange-700", approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700",
};

function Pill({ s }: { s: ApplicationStatus }) {
  return <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", STATUS_STYLE[s])}>{STATUS_LABEL[s]}</span>;
}

export default function ApplicationsPage() {
  const [rows, setRows] = useState<VendorApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRows((await api.admin.applications({ status, service, q })).applications); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [status, service, q]);

  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);

  const counts = rows.reduce<Record<string, number>>((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});

  return (
    <div>
      <PageHeader title="Vendor Applications" description="Registration forms submitted from the vendor portal — review documents and approve or reject." />

      <div className="flex flex-wrap gap-3 mb-4">
        {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => (
          <button key={s} onClick={() => setStatus(status === s ? "" : s)}
            className={cn("rounded-xl border px-4 py-2 text-left bg-white", status === s ? "border-purple-500 ring-1 ring-purple-300" : "border-gray-100")}>
            <p className="text-[11px] text-gray-400">{STATUS_LABEL[s]}</p>
            <p className="text-lg font-bold text-gray-900">{status && status !== s ? "–" : counts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      <SectionCard noPadding>
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-50">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, business, mobile or reference…"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <select value={service} onChange={(e) => setService(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
            <option value="">All services</option>
            {SERVICE_KEYS.map((k) => <option key={k} value={k}>{FORMS[k].shortTitle}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-gray-200 px-3 text-sm">
            <option value="">All statuses</option>
            {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        {error && <p className="p-4 text-sm text-red-600">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b border-gray-50">
                <th className="px-4 py-3">Reference</th><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Location</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-gray-400"><Loader2 className="inline animate-spin" size={16} /> Loading…</td></tr>}
              {!loading && !rows.length && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No applications found.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} onClick={() => setOpenId(r.id)} className="border-b border-gray-50 hover:bg-purple-50/40 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.reference}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-gray-900">{r.business_name || r.applicant_name}</p>
                    <p className="text-xs text-gray-400">{r.business_name ? `${r.applicant_name} · ` : ""}{r.mobile}</p></td>
                  <td className="px-4 py-3">{getForm(r.service)?.emoji} {getForm(r.service)?.shortTitle ?? r.service}</td>
                  <td className="px-4 py-3 text-gray-600">{[r.city, r.district].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3"><Pill s={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {openId && <Detail id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}

function Detail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [app, setApp] = useState<VendorApplication | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [approving, setApproving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  useEffect(() => {
    api.admin.application(id).then(({ application }) => {
      setApp(application); setNotes(application.admin_notes ?? ""); setLoginEmail(application.email ?? "");
    }).catch((e) => setErr((e as Error).message));
  }, [id]);

  async function review(status?: ApplicationStatus) {
    setBusy(true); setErr(null); setResult(null);
    try {
      const r = await api.admin.reviewApplication(id, {
        status, admin_notes: notes, notify,
        message: status === "needs_info" || status === "rejected" ? message : undefined,
        login_email: status === "approved" ? loginEmail : undefined,
      });
      setApp(r.application); setResult(r); setApproving(false); onChanged();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function reveal(field: string) {
    setErr(null);
    try { const { value } = await api.admin.revealApplicationField(id, field); setRevealed((p) => ({ ...p, [field]: value })); }
    catch (e) { setErr((e as Error).message); }
  }

  const form = app ? getForm(app.service) : null;
  const values = (app?.data ?? {}) as Record<string, never>;
  const revealable = ((app?.data?._revealable as string[] | undefined) ?? []);
  const locked = app?.status === "approved";
  const fileLink = (x: { name: string; url: string; signedUrl?: string | null }) => x.signedUrl ?? null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="w-full max-w-2xl h-full bg-white overflow-y-auto slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{app ? (app.business_name || app.applicant_name) : "Loading…"}</p>
            {app && <p className="text-xs text-gray-400 font-mono">{app.reference} · {form?.shortTitle}</p>}
          </div>
          <div className="flex items-center gap-3">{app && <Pill s={app.status} />}
            <button onClick={onClose} aria-label="Close"><X size={18} className="text-gray-400" /></button></div>
        </div>

        {err && <p className="m-5 text-sm text-red-600">{err}</p>}
        {result && (
          <div className="m-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-1">
            <p className="font-semibold">Saved.</p>
            <p className="text-xs">Notifications — SMS: <b>{result.delivery.sms}</b> · Email: <b>{result.delivery.email}</b>{result.delivery.sms === "mock" || result.delivery.email === "mock" ? " (mock mode: nothing was actually sent)" : ""}</p>
            {result.credentials && (
              <div className="mt-2 rounded-lg bg-white border border-emerald-200 p-3 text-xs space-y-0.5">
                <p className="font-semibold text-gray-800">Vendor account created — pass these on if the vendor didn&apos;t receive them:</p>
                <p>Login: <span className="font-mono">{result.credentials.portalUrl}</span></p>
                <p>Email: <span className="font-mono">{result.credentials.email}</span></p>
                <p>Temporary password: <span className="font-mono select-all">{result.credentials.tempPassword}</span></p>
                <p className="text-gray-400">Shown only once. The vendor should change it after first login.</p>
              </div>
            )}
          </div>
        )}
        {app && form && (
          <div className="p-5 space-y-6">
            <div className="rounded-xl border border-gray-100 p-4 space-y-3">
              {app.vendor_user_id && <p className="text-xs text-emerald-700 font-semibold">✓ Vendor account created{app.store_id ? " with a store (closed until the vendor opens it)" : ""}.</p>}
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Internal notes (never shown to the applicant)…"
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:border-purple-500" />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={300}
                placeholder="Message to the applicant (included in the SMS/email for ‘Needs more info’ and ‘Reject’)…"
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:border-purple-500" />
              <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-purple-700" />Notify the applicant by SMS / email</label>

              {approving ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-emerald-900">Create the vendor login{app.service === "rides" || app.service === "parcel" ? " (driver account)" : " and store"}</p>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Login email (required)"
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-emerald-500" />
                  <div className="flex gap-2">
                    <button disabled={busy || !loginEmail} onClick={() => review("approved")} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50">{busy ? "Creating…" : "Confirm & approve"}</button>
                    <button disabled={busy} onClick={() => setApproving(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy || locked} onClick={() => review("under_review")} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold disabled:opacity-50">Mark under review</button>
                  <button disabled={busy || locked} onClick={() => review("needs_info")} className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold disabled:opacity-50">Needs more info</button>
                  <button disabled={busy || locked} onClick={() => setApproving(true)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50">Approve…</button>
                  <button disabled={busy || locked} onClick={() => review("rejected")} className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-50">Reject</button>
                  <button disabled={busy} onClick={() => review()} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-50 ml-auto">Save notes</button>
                </div>
              )}
              <p className="text-[11px] text-gray-400">Opening this panel, revealing a number and every status change are recorded in the audit log. Document links expire after 15 minutes — reopen the panel for fresh ones.</p>
            </div>

            {form.sections.map((s) => (
              <div key={s.id}>
                <h4 className="text-sm font-bold text-indigo-900 mb-2">{s.title}</h4>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {s.fields.filter((f) => f.type !== "map" && f.type !== "checkbox" && isVisible(f, values)).map((f) => {
                    const v = values[f.name] as unknown;
                    const files = (Array.isArray(v) ? v : [v]).filter(isUploadedFile) as { name: string; url: string; signedUrl?: string | null }[];
                    const attach = "attach" in f && f.attach ? (values[f.attach.name] as unknown) : undefined;
                    const isSensitive = (SENSITIVE_FIELDS as readonly string[]).includes(f.name);
                    return (
                      <div key={f.name} className="text-sm">
                        <dt className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</dt>
                        <dd className="text-gray-800 break-words">
                          {f.type === "file"
                            ? (files.length ? files.map((x) => {
                                const href = fileLink(x);
                                return href
                                  ? <a key={x.url} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-700 hover:underline truncate"><ExternalLink size={12} />{x.name}</a>
                                  : <span key={x.url} className="block text-gray-400 truncate">{x.name} (unavailable)</span>;
                              }) : "—")
                            : (
                              <span className="inline-flex items-center gap-2">
                                <span className={cn(isSensitive && "font-mono")}>{revealed[f.name] ?? displayValue(f, values)}</span>
                                {isSensitive && revealable.includes(f.name) && !revealed[f.name] && (
                                  <button onClick={() => reveal(f.name)} className="text-[11px] font-semibold text-purple-700 hover:underline">Reveal</button>
                                )}
                              </span>
                            )}
                          {isUploadedFile(attach) && (() => {
                            const a = attach as unknown as { signedUrl?: string | null };
                            return a.signedUrl
                              ? <a href={a.signedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-700 hover:underline text-xs mt-0.5"><ExternalLink size={11} />{(f as { attach?: { label: string } }).attach?.label} — view</a>
                              : null;
                          })()}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
          </div>
        )}
        {!app && !err && <p className="p-8 text-center text-gray-400"><Loader2 className="inline animate-spin" size={16} /> </p>}
      </div>
    </div>
  );
}
