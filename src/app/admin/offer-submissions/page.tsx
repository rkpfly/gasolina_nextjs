"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LeadSubmission,
  Column,
  DataTable,
  DetailModal,
  DetailField,
  recordToFields,
  formatDateTime,
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

export default function OfferSubmissionsPage() {
  const [rows, setRows] = useState<LeadSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LeadSubmission | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions?formType=offer_signup");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setRows(Array.isArray(data.leads) ? data.leads : []);
    } catch (e) {
      console.error(e);
      setError("Could not load offer submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((l) =>
      [l.f_name, l.l_name, l.email, l.phone, l.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const columns: Column<LeadSubmission>[] = [
    { key: "created_at", header: "Date", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium text-slate-100 whitespace-nowrap">{fullName(r.f_name, r.l_name)}</span> },
    { key: "email", header: "Email", render: (r) => <EmailCell email={r.email} /> },
    { key: "phone", header: "Phone", render: (r) => <PhoneCell phone={r.phone} /> },
    { key: "city", header: "City", render: (r) => <span className="whitespace-nowrap">{r.city || "—"}</span> },
    { key: "source_url", header: "Source", render: (r) => <SourceCell url={r.source_url} /> },
  ];

  const detailFields = (r: LeadSubmission): DetailField[] => {
    // Any extra columns returned by SELECT * (e.g. a JSON payload/metadata with
    // the offer-specific answers) are surfaced generically so nothing is hidden.
    const known = new Set([
      "id", "form_type", "f_name", "l_name", "email", "phone", "city", "region",
      "country", "total_guests", "description", "company_name", "source_url",
      "ip_address", "created_at",
    ]);
    const extras = Object.fromEntries(
      Object.entries(r as unknown as Record<string, unknown>).filter(([k]) => !known.has(k))
    );
    return [
      { label: "Submitted", value: formatDateTime(r.created_at) },
      { label: "Name", value: fullName(r.f_name, r.l_name) },
      { label: "Email", value: r.email ? <EmailCell email={r.email} /> : "—" },
      { label: "Phone", value: <PhoneCell phone={r.phone} /> },
      { label: "City", value: r.city || "—" },
      { label: "Region", value: r.region || "—" },
      { label: "Country", value: r.country || "—" },
      { label: "Company", value: r.company_name || "—" },
      { label: "Guests", value: r.total_guests ?? "—" },
      { label: "Notes", value: r.description || "—", full: true },
      { label: "Source", value: <SourceCell url={r.source_url} />, full: true },
      { label: "IP Address", value: r.ip_address || "—" },
      ...recordToFields(extras),
    ];
  };

  const exportCsv = () => {
    const headers = ["Date", "First Name", "Last Name", "Email", "Phone", "City", "Source"];
    const data = filtered.map((l) => [
      formatDateTime(l.created_at), l.f_name, l.l_name, l.email, l.phone, l.city, l.source_url,
    ]);
    downloadCsv(`offer-submissions-${new Date().toISOString().slice(0, 10)}.csv`, headers, data);
  };

  return (
    <div className="max-w-[1300px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Offer Submissions</h2>
          <p className="text-slate-400 text-sm mt-1">
            People who signed up via the offers page form. For all other leads and VIP requests, see{" "}
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
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, phone, city…" />
        <ExportButton onClick={exportCsv} disabled={filtered.length === 0} />
      </div>

      {/* Content */}
      {loading ? (
        <TableLoading />
      ) : filtered.length === 0 ? (
        <EmptyState message={search ? "No offer submissions match your search." : "No offer submissions yet."} />
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3">{filtered.length} result{filtered.length === 1 ? "" : "s"}</p>
          <DataTable columns={columns} rows={filtered} onRowClick={setSelected} />
        </>
      )}

      <DetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? fullName(selected.f_name, selected.l_name) : ""}
        subtitle={selected?.email}
        fields={selected ? detailFields(selected) : []}
      />
    </div>
  );
}
