"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Column,
  DataTable,
  formatDateTime,
  formatDate,
  fullName,
  EmailCell,
  PhoneCell,
  SourceCell,
  SearchInput,
  ExportButton,
  EmptyState,
  TableLoading,
  downloadCsv,
} from "@/components/admin/submissions";

// Mirrors the vendor_requests table (see migrations/003_vendor_requests.sql).
interface VendorRequest {
  id: string | number;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  role?: string;
  collaboration_date?: string;
  portfolio_link?: string;
  source_url?: string;
  ip_address?: string;
  created_at?: string;
}

// Pretty labels for the role identifiers stored in the DB.
const ROLE_LABEL: Record<string, string> = {
  promoter: "Promoter",
  influencer: "Influencer",
  artist: "Artist (DJ/Producer)",
  musician: "Live Musician",
  vocalist: "Vocalist",
};

function roleLabel(role?: string): string {
  if (!role) return "—";
  return ROLE_LABEL[role] ?? role;
}

function RoleBadge({ role }: { role?: string }) {
  if (!role) return <span className="text-slate-500">—</span>;
  return (
    <span className="inline-block whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-blue-500/15 text-blue-300 border-blue-500/30">
      {roleLabel(role)}
    </span>
  );
}

function PortfolioCell({ url }: { url?: string }) {
  if (!url) return <span className="text-slate-600">—</span>;
  let label = url;
  try {
    const u = new URL(url);
    label = u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    /* keep raw value if it isn't a parseable URL */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={url}
      className="text-blue-400 hover:text-blue-300 hover:underline truncate inline-block max-w-[200px] align-bottom"
    >
      {label}
    </a>
  );
}

export default function VendorRequestsPage() {
  const [rows, setRows] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vendor-requests");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setRows(Array.isArray(data.requests) ? data.requests : []);
    } catch (e) {
      console.error(e);
      setError("Could not load vendor requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Build role filter pills from whatever roles are actually present.
  const presentRoles = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.role && set.add(r.role));
    return Array.from(set).sort((a, b) => roleLabel(a).localeCompare(roleLabel(b)));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => (roleFilter === "all" ? true : r.role === roleFilter))
      .filter((r) =>
        !q
          ? true
          : [r.first_name, r.last_name, r.email, r.phone, r.portfolio_link]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q))
      );
  }, [rows, roleFilter, search]);

  const columns: Column<VendorRequest>[] = [
    { key: "created_at", header: "Date", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium text-slate-100 whitespace-nowrap">{fullName(r.first_name, r.last_name)}</span> },
    { key: "role", header: "Role", render: (r) => <RoleBadge role={r.role} /> },
    { key: "email", header: "Email", render: (r) => <EmailCell email={r.email} /> },
    { key: "phone", header: "Phone", render: (r) => <PhoneCell phone={r.country_code ? `${r.country_code} ${r.phone ?? ""}`.trim() : r.phone} /> },
    { key: "collaboration_date", header: "Preferred Date", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDate(r.collaboration_date)}</span> },
    { key: "portfolio_link", header: "Portfolio", render: (r) => <PortfolioCell url={r.portfolio_link} /> },
    { key: "source_url", header: "Source", render: (r) => <SourceCell url={r.source_url} /> },
  ];

  const exportCsv = () => {
    const headers = ["Date", "First Name", "Last Name", "Role", "Email", "Country Code", "Phone", "Preferred Date", "Portfolio", "Source"];
    const data = filtered.map((r) => [
      formatDateTime(r.created_at),
      r.first_name,
      r.last_name,
      roleLabel(r.role),
      r.email,
      r.country_code,
      r.phone,
      formatDate(r.collaboration_date),
      r.portfolio_link,
      r.source_url,
    ]);
    downloadCsv(`vendor-requests-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Vendor Requests</h2>
          <p className="text-slate-400 text-sm mt-1">
            Talent &amp; vendor applications from the{" "}
            <Link href="/careers#apply" className="text-blue-400 hover:text-blue-300 hover:underline">
              Careers
            </Link>{" "}
            page form. For other leads and VIP requests, see{" "}
            <Link href="/admin/submissions" className="text-blue-400 hover:text-blue-300 hover:underline">
              Submissions
            </Link>
            .
          </p>
        </div>
        <button
          onClick={load}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-slate-700 bg-slate-800 text-slate-200 transition-colors hover:border-blue-500 hover:text-blue-300"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone, portfolio…" />
        <ExportButton onClick={exportCsv} disabled={filtered.length === 0} />
      </div>

      {/* Role filter pills */}
      {presentRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <FilterPill active={roleFilter === "all"} onClick={() => setRoleFilter("all")}>
            All
          </FilterPill>
          {presentRoles.map((r) => (
            <FilterPill key={r} active={roleFilter === r} onClick={() => setRoleFilter(r)}>
              {roleLabel(r)}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableLoading />
      ) : filtered.length === 0 ? (
        <EmptyState message={search || roleFilter !== "all" ? "No vendor requests match your filters." : "No vendor requests yet."} />
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          <DataTable columns={columns} rows={filtered} />
        </>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full border transition-colors ${
        active
          ? "bg-blue-500/15 border-blue-500 text-blue-300"
          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
