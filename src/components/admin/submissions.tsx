"use client";

import React from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface LeadSubmission {
  id: string | number;
  form_type: string;
  f_name?: string;
  l_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  country?: string;
  total_guests?: number | null;
  description?: string;
  company_name?: string;
  source_url?: string;
  ip_address?: string;
  created_at?: string;
}

export interface VipReservation {
  id: string | number;
  event_id?: string | number;
  event_name?: string;
  event_date?: string;
  event_location?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  guests?: number;
  status?: string;
  created_at?: string;
}

// ─── Form-type presentation ───────────────────────────────────────────────────
// Tailwind needs to see full class strings, so colours are mapped explicitly.
const BADGE_CLASSES: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  lime: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/40",
};

export const FORM_TYPE_META: Record<string, { label: string; color: keyof typeof BADGE_CLASSES }> = {
  vip_table_request: { label: "VIP Request", color: "amber" },
  home_newsletter: { label: "Newsletter · Home", color: "blue" },
  journal_newsletter: { label: "Newsletter · Journal", color: "blue" },
  contact_inquiry: { label: "Contact", color: "emerald" },
  corporate_inquiry: { label: "Corporate", color: "purple" },
  private_event_lead: { label: "Private Event", color: "pink" },
  offer_signup: { label: "Offer Signup", color: "lime" },
};

export function formTypeLabel(formType: string): string {
  return FORM_TYPE_META[formType]?.label ?? prettify(formType);
}

function prettify(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FormTypeBadge({ formType }: { formType: string }) {
  const meta = FORM_TYPE_META[formType];
  const cls = BADGE_CLASSES[meta?.color ?? "slate"];
  return (
    <span className={`inline-block whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {meta?.label ?? prettify(formType)}
    </span>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
};

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-500">—</span>;
  const cls = STATUS_CLASSES[status.toLowerCase()] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
  return (
    <span className={`inline-block whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

export function fullName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

// ─── Reusable cells ───────────────────────────────────────────────────────────
export function EmailCell({ email }: { email?: string }) {
  if (!email) return <span className="text-slate-600">—</span>;
  return (
    <a href={`mailto:${email}`} className="text-blue-400 hover:text-blue-300 hover:underline break-all">
      {email}
    </a>
  );
}

export function PhoneCell({ phone }: { phone?: string }) {
  if (!phone) return <span className="text-slate-600">—</span>;
  return (
    <a href={`tel:${phone}`} className="text-slate-200 hover:text-blue-300 whitespace-nowrap">
      {phone}
    </a>
  );
}

export function SourceCell({ url }: { url?: string }) {
  if (!url || url === "Direct") return <span className="text-slate-500">{url || "—"}</span>;
  let label = url;
  try {
    const u = new URL(url);
    label = u.pathname === "/" ? u.hostname : u.pathname;
  } catch {
    /* keep raw value if it isn't a parseable URL */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={url}
      className="text-slate-300 hover:text-blue-300 hover:underline truncate inline-block max-w-[200px] align-bottom"
    >
      {label}
    </a>
  );
}

// ─── Generic data table ───────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  /** When provided, rows become clickable. Clicks on links inside a row are
   *  ignored so mailto:/tel:/source links keep working without opening details. */
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800/40">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800/80 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className="sticky top-0 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap border-b border-slate-700"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              onClick={
                onRowClick
                  ? (e) => {
                      // Don't hijack clicks on interactive elements inside the row.
                      if ((e.target as HTMLElement).closest("a,button")) return;
                      onRowClick(row);
                    }
                  : undefined
              }
              className={`border-b border-slate-800 transition-colors hover:bg-slate-700/30 ${
                i % 2 === 1 ? "bg-slate-800/20" : ""
              } ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-top text-slate-200 ${c.className ?? ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
// Row-detail popup shared across the Submissions, Offer Submissions and Vendor
// Requests admin tables. Pages compose a list of DetailField entries; the modal
// handles layout, backdrop/Esc close and body-scroll lock.
export interface DetailField {
  label: string;
  value: React.ReactNode;
  /** Span the full width — use for long text like notes or a guest list. */
  full?: boolean;
}

function isEmptyValue(v: React.ReactNode): boolean {
  return v === null || v === undefined || v === "" || v === "—";
}

export function DetailModal({
  open,
  onClose,
  title,
  subtitle,
  fields,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fields: DetailField[];
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Drop empty fields so the panel only shows what was actually captured.
  const visible = fields.filter((f) => !isEmptyValue(f.value));

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-8 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mr-1 -mt-1 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 px-6 py-5">
          {visible.length === 0 ? (
            <p className="text-sm text-slate-500 col-span-full">No further details captured.</p>
          ) : (
            visible.map((f, i) => (
              <div key={i} className={f.full ? "sm:col-span-2" : ""}>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {f.label}
                </dt>
                <dd className="text-sm text-slate-100 break-words whitespace-pre-wrap">{f.value}</dd>
              </div>
            ))
          )}
        </dl>
      </div>
    </div>
  );
}

// Turn an arbitrary record (e.g. an offer submission `payload`) into detail
// fields with prettified labels. Skips null/empty entries and stringifies
// nested objects so nothing is silently dropped.
export function recordToFields(obj: Record<string, unknown> | null | undefined): DetailField[] {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ({
      label: prettify(k),
      value: typeof v === "object" ? JSON.stringify(v, null, 2) : String(v),
      full: typeof v === "string" && v.length > 40,
    }));
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = "Search name, email, phone, city…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-80">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );
}

export function ExportButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-blue-500 hover:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      ⬇ Export CSV
    </button>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-slate-700 bg-slate-800/30">
      <div className="text-4xl mb-3 opacity-60">📭</div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function TableLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote when the value contains a comma, quote, or newline.
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
