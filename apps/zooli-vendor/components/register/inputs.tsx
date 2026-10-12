"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X, Search, ChevronDown, Check, LocateFixed, Loader2, FileText, CheckCircle2 } from "lucide-react";
import type { Field, FieldValue, FileField, FormValues, TextField, UploadedFile } from "@zooli/vendor-forms";
import { isUploadedFile, isVisible } from "@zooli/vendor-forms";
import { cn } from "@/lib/utils";
import { checkFile, uploadToCloudinary } from "./upload";

// ---------- shared styling ----------
const inputCls =
  "w-full h-11 rounded-lg border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500";
const okBorder = "border-gray-200";
const errBorder = "border-red-400 bg-red-50/30";

const SPAN: Record<number, string> = {
  3: "col-span-12 sm:col-span-6 lg:col-span-3",
  4: "col-span-12 sm:col-span-6 lg:col-span-4",
  5: "col-span-12 sm:col-span-6 lg:col-span-5",
  6: "col-span-12 lg:col-span-6",
  8: "col-span-12 lg:col-span-8",
  12: "col-span-12",
};
const ROWSPAN: Record<number, string> = { 2: "lg:row-span-2", 3: "lg:row-span-3", 4: "lg:row-span-4" };

export interface FieldProps {
  field: Field;
  values: FormValues;
  errors: Record<string, string>;
  set: (name: string, value: FieldValue) => void;
  blur: (name: string) => void;
  search: (query: string) => void;
  searching: boolean;
}

function Label({ field }: { field: Field }) {
  if (field.type === "checkbox") return null;
  return (
    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function ErrorText({ msg }: { msg?: string }) {
  return msg ? <p className="text-[11px] text-red-600 mt-1 font-medium">{msg}</p> : null;
}

// ---------- file upload ----------
export function FileInput({
  field, value, error, onChange, compact,
}: {
  field: FileField; value: FieldValue; error?: string; compact?: boolean;
  onChange: (v: FieldValue) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const files: UploadedFile[] = Array.isArray(value) ? (value as UploadedFile[]) : isUploadedFile(value) ? [value] : [];
  const accept = field.accept === "image" ? "image/jpeg,image/png" : "image/jpeg,image/png,application/pdf";

  async function pick(list: FileList | null) {
    if (!list || !list.length) return;
    setLocalErr(null);
    const chosen = Array.from(list).slice(0, field.multiple ? 10 : 1);
    for (const f of chosen) {
      const bad = checkFile(f, field.accept);
      if (bad) { setLocalErr(bad); return; }
    }
    setBusy(true); setPct(0);
    try {
      const done: UploadedFile[] = [];
      for (let i = 0; i < chosen.length; i++) {
        done.push(await uploadToCloudinary(chosen[i], (p) => setPct(Math.round(((i + p / 100) / chosen.length) * 100))));
      }
      onChange(field.multiple ? [...files, ...done] : done[0]);
    } catch (e) {
      setLocalErr((e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  function remove(i: number) {
    if (field.multiple) {
      const next = files.filter((_, idx) => idx !== i);
      onChange(next.length ? next : undefined);
    } else onChange(undefined);
  }

  const label = field.actionLabel ?? (field.accept === "image" ? "Upload Photo" : "Upload Document");
  const hint = field.accept === "image" ? "JPG, PNG" : "JPG, PNG, PDF";
  const msg = localErr || error;

  const button = (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 disabled:opacity-60 transition-colors",
        compact ? "h-11 px-3 text-xs whitespace-nowrap" : "h-9 px-3 text-xs w-full"
      )}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
      {busy ? `${pct}%` : files.length && !field.multiple ? "Replace" : label}
    </button>
  );

  const list = files.length > 0 && (
    <ul className="mt-1.5 space-y-1">
      {files.map((f, i) => (
        <li key={f.url + i} className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 rounded-md px-2 py-1">
          <CheckCircle2 size={12} className="shrink-0" />
          <span className="truncate">{f.name}</span>
          <button type="button" onClick={() => remove(i)} aria-label="Remove file" className="ml-auto text-gray-400 hover:text-red-500"><X size={12} /></button>
        </li>
      ))}
    </ul>
  );

  const input = (
    <input ref={ref} type="file" hidden accept={accept} multiple={!!field.multiple} onChange={(e) => pick(e.target.files)} />
  );

  if (compact) {
    return (
      <div className="shrink-0">
        {input}{button}
        {files.length > 0 && <p className="text-[10px] text-emerald-600 mt-1 text-center">Uploaded ✓</p>}
        {msg && <p className="text-[10px] text-red-600 mt-1 max-w-[120px]">{msg}</p>}
      </div>
    );
  }

  if (field.variant === "tile") {
    return (
      <div className={cn("rounded-xl border p-3 text-center h-full", msg ? errBorder : "border-gray-200 bg-white")}>
        <p className="text-[11px] font-semibold text-gray-700 leading-tight min-h-[28px] flex items-center justify-center">
          {field.label}{field.required && <span className="text-red-500">&nbsp;*</span>}
        </p>
        <div className="text-3xl my-2" aria-hidden>{field.emoji ?? "📄"}</div>
        {input}{button}
        <p className="text-[10px] text-gray-400 mt-1.5">{hint}{field.multiple && field.min ? ` · min ${field.min}` : ""}</p>
        {list}
        {msg && <p className="text-[11px] text-red-600 mt-1 font-medium">{msg}</p>}
      </div>
    );
  }

  return (
    <div>
      <Label field={field} />
      <div className="max-w-[220px]">{input}{button}</div>
      <p className="text-[10px] text-gray-400 mt-1">{hint}</p>
      {list}
      <ErrorText msg={msg || undefined} />
    </div>
  );
}

// ---------- multi-select dropdown ----------
function MultiSelect({ options, value, onChange, placeholder, hasError }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn(inputCls, hasError ? errBorder : okBorder, "flex items-center justify-between text-left")}>
        <span className={cn("truncate", !value.length && "text-gray-400")}>{value.length ? value.join(", ") : placeholder ?? "Select"}</span>
        <ChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {options.map((o) => (
            <button type="button" key={o} onClick={() => toggle(o)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-purple-50">
              <span className={cn("w-4 h-4 rounded border flex items-center justify-center", value.includes(o) ? "bg-purple-600 border-purple-600" : "border-gray-300")}>
                {value.includes(o) && <Check size={12} className="text-white" />}
              </span>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- map ----------
function MapBox({ lat, lng, onLocate }: { lat: string; lng: string; onLocate: (lat: string, lng: string) => void }) {
  const la = Number(lat), lo = Number(lng);
  const valid = lat !== "" && lng !== "" && Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180;
  const [locating, setLocating] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  function useMyLocation() {
    setGeoErr(null);
    if (!navigator.geolocation) { setGeoErr("Location isn't supported on this device"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocating(false); onLocate(p.coords.latitude.toFixed(6), p.coords.longitude.toFixed(6)); },
      () => { setLocating(false); setGeoErr("Couldn't get your location. Allow location access or search the area."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="h-full min-h-[220px] flex flex-col">
      <div className="relative flex-1 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[200px]">
        {valid ? (
          <iframe
            title="Selected location"
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lo - 0.006},${la - 0.004},${lo + 0.006},${la + 0.004}&layer=mapnik&marker=${la},${lo}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-xs text-gray-400 px-4">
            <span className="text-3xl mb-1">📍</span>
            Search your area, use your current location, or type latitude / longitude
          </div>
        )}
      </div>
      <button type="button" onClick={useMyLocation} disabled={locating}
        className="mt-2 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 disabled:opacity-60">
        {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />} Use my current location
      </button>
      {geoErr && <p className="text-[11px] text-red-600 mt-1">{geoErr}</p>}
    </div>
  );
}

// ---------- field renderer ----------
export function FieldRenderer(p: FieldProps) {
  const { field, values, errors, set, blur } = p;
  if (!isVisible(field, values)) return null;

  const err = errors[field.name];
  const attachName = "attach" in field && field.attach ? field.attach.name : undefined;
  const wrap = cn(SPAN[field.span ?? 4], field.rowSpan && ROWSPAN[field.rowSpan]);
  const v = values[field.name];
  const str = typeof v === "string" ? v : "";
  const border = err ? errBorder : okBorder;
  const dataFields = [field.name, attachName].filter(Boolean).join(" ");

  let body: React.ReactNode = null;

  switch (field.type) {
    case "text": case "email": case "tel": case "number": case "date": case "time": {
      const f = field as TextField;
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const eighteen = new Date(today); eighteen.setFullYear(eighteen.getFullYear() - 18);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const dateProps = f.type === "date"
        ? f.rule === "adult" ? { max: iso(eighteen), min: "1920-01-01" }
          : f.rule === "future" ? { min: iso(tomorrow) }
          : f.rule === "pastOrToday" ? { max: iso(today) } : {}
        : {};
      const attachFile: FileField | null = f.attach
        ? { type: "file", name: f.attach.name, label: f.attach.label, accept: "doc", required: f.attach.required, actionLabel: f.attach.label }
        : null;
      const input = (
        <div className="relative flex-1 min-w-0">
          <input
            type={f.type === "tel" ? "tel" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
            inputMode={f.type === "tel" || f.type === "number" ? "numeric" : undefined}
            value={str}
            placeholder={f.placeholder}
            maxLength={f.maxLength}
            readOnly={f.readOnly}
            min={f.type === "number" ? 0 : undefined}
            {...dateProps}
            onChange={(e) => set(f.name, f.uppercase ? e.target.value.toUpperCase() : e.target.value)}
            onBlur={() => blur(f.name)}
            onKeyDown={(e) => { if (f.search && e.key === "Enter") { e.preventDefault(); p.search(str); } }}
            className={cn(inputCls, border, f.search && "pr-10")}
          />
          {f.search && (
            <button type="button" onClick={() => p.search(str)} aria-label="Search location"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600">
              {p.searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          )}
        </div>
      );
      body = (
        <>
          <Label field={field} />
          {attachFile ? (
            <div className="flex gap-2 items-start">
              {input}
              <FileInput field={attachFile} compact value={values[attachFile.name]} error={errors[attachFile.name]}
                onChange={(val) => set(attachFile.name, val)} />
            </div>
          ) : input}
          <ErrorText msg={err} />
        </>
      );
      break;
    }
    case "textarea":
      body = (
        <>
          <Label field={field} />
          <textarea value={str} rows={field.rows ?? 3} placeholder={field.placeholder} maxLength={field.maxLength}
            onChange={(e) => set(field.name, e.target.value)} onBlur={() => blur(field.name)}
            className={cn(inputCls, border, "h-auto py-2.5 resize-none")} />
          <ErrorText msg={err} />
        </>
      );
      break;
    case "select":
      body = (
        <>
          <Label field={field} />
          <div className="relative">
            <select value={str} disabled={field.readOnly}
              onChange={(e) => set(field.name, e.target.value)} onBlur={() => blur(field.name)}
              className={cn(inputCls, border, "appearance-none pr-9", !str && "text-gray-400")}>
              {!field.readOnly && <option value="">{field.placeholder ?? "Select"}</option>}
              {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {field.hint && <p className="text-[10px] text-gray-400 mt-1">{field.hint}</p>}
          <ErrorText msg={err} />
        </>
      );
      break;
    case "multiselect":
      body = (
        <>
          <Label field={field} />
          <MultiSelect options={field.options} placeholder={field.placeholder}
            value={Array.isArray(v) ? (v as string[]) : []} onChange={(x) => set(field.name, x)} hasError={!!err} />
          <ErrorText msg={err} />
        </>
      );
      break;
    case "radio": {
      const chips = field.variant === "chips";
      body = (
        <>
          <Label field={field} />
          <div className={cn("flex flex-wrap gap-2", !chips && "gap-x-5 h-11 items-center")}>
            {field.options.map((o) => (
              <label key={o} className={cn(
                "cursor-pointer text-sm select-none",
                chips
                  ? cn("rounded-lg border px-3 py-2 text-xs font-semibold", str === o ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-purple-300")
                  : "flex items-center gap-1.5 text-gray-700"
              )}>
                <input type={chips ? "radio" : "radio"} name={field.name} checked={str === o}
                  onChange={() => set(field.name, o)} className={cn(chips ? "sr-only" : "accent-purple-700 w-4 h-4")} />
                {o}
              </label>
            ))}
          </div>
          <ErrorText msg={err} />
        </>
      );
      break;
    }
    case "checkboxes": {
      const cur = Array.isArray(v) ? (v as string[]) : [];
      const toggle = (o: string) => set(field.name, cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
      const opts = field.options.map((o) => (typeof o === "string" ? { value: o, emoji: undefined as string | undefined } : o));
      const variant = field.variant ?? "plain";
      body = (
        <>
          <Label field={field} />
          <div className={cn(
            "flex flex-wrap",
            variant === "plain" ? "gap-x-5 gap-y-2" : "gap-2",
            variant === "cards" && "rounded-xl border border-gray-200 p-3"
          )}>
            {opts.map((o) => {
              const on = cur.includes(o.value);
              return (
                <label key={o.value} className={cn(
                  "flex items-center gap-2 cursor-pointer select-none text-sm",
                  variant === "chips" && cn("rounded-lg border px-3 py-2 text-xs font-medium", on ? "border-purple-500 bg-purple-50 text-purple-800" : "border-gray-200 text-gray-600 hover:border-purple-300"),
                  variant === "cards" && cn("rounded-lg border px-3 py-2.5 text-xs font-semibold min-w-[130px]", on ? "border-purple-500 bg-purple-50 text-purple-800" : "border-gray-100 bg-gray-50/60 text-gray-700 hover:border-purple-300"),
                  variant === "plain" && "text-gray-700"
                )}>
                  <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="accent-purple-700 w-4 h-4" />
                  {o.emoji && <span aria-hidden>{o.emoji}</span>}
                  {o.value}
                </label>
              );
            })}
          </div>
          <ErrorText msg={err} />
        </>
      );
      break;
    }
    case "checkbox":
      body = (
        <>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={v === true} onChange={(e) => set(field.name, e.target.checked)} className="accent-purple-700 w-4 h-4 mt-0.5" />
            <span>{field.text ?? field.label}{field.required && <span className="text-red-500"> *</span>}</span>
          </label>
          <ErrorText msg={err} />
        </>
      );
      break;
    case "file":
      body = <FileInput field={field} value={v} error={err} onChange={(val) => set(field.name, val)} />;
      break;
    case "map":
      body = (
        <>
          <Label field={field} />
          <MapBox lat={String(values[field.latField] ?? "")} lng={String(values[field.lngField] ?? "")}
            onLocate={(la, lo) => { set(field.latField, la); set(field.lngField, lo); }} />
          <ErrorText msg={err} />
        </>
      );
      break;
  }

  return <div data-fields={dataFields} className={wrap}>{body}</div>;
}
