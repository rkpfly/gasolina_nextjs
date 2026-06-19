"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LeadSubmission,
  VipReservation,
  Column,
  DataTable,
  FormTypeBadge,
  StatusBadge,
  formTypeLabel,
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

type Tab = "leads" | "vip";

export default function SubmissionsPage() {
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [vip, setVip] = useState<VipReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("leads");
  const [typeFilter, setTypeFilter] = useState<string>("all"); // "all" | a form_type
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions");
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setVip(Array.isArray(data.vipReservations) ? data.vipReservations : []);
    } catch (e) {
      console.error(e);
      setError("Could not load submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Offer signups live in their own section — keep them out of this list.
  const generalLeads = useMemo(
    () => leads.filter((l) => l.form_type !== "offer_signup"),
    [leads]
  );

  // Build the filter pills from whatever form types are actually present.
  const presentTypes = useMemo(() => {
    const set = new Set<string>();
    generalLeads.forEach((l) => set.add(l.form_type));
    // VIP requests first, then alphabetical by label.
    return Array.from(set).sort((a, b) => {
      if (a === "vip_table_request") return -1;
      if (b === "vip_table_request") return 1;
      return formTypeLabel(a).localeCompare(formTypeLabel(b));
    });
  }, [generalLeads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return generalLeads
      .filter((l) => (typeFilter === "all" ? true : l.form_type === typeFilter))
      .filter((l) =>
        !q
          ? true
          : [l.f_name, l.l_name, l.email, l.phone, l.city, l.company_name]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q))
      );
  }, [generalLeads, typeFilter, search]);

  const filteredVip = useMemo(() => {
    if (!search.trim()) return vip;
    const q = search.toLowerCase();
    return vip.filter((v) =>
      [v.full_name, v.email, v.phone, v.event_name, v.event_location]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [vip, search]);

  // ─── Columns ────────────────────────────────────────────────────────────────
  const leadColumns: Column<LeadSubmission>[] = [
    { key: "created_at", header: "Date", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: "form_type", header: "Type", render: (r) => <FormTypeBadge formType={r.form_type} /> },
    { key: "name", header: "Name", render: (r) => <span className="font-medium text-slate-100 whitespace-nowrap">{fullName(r.f_name, r.l_name)}</span> },
    { key: "email", header: "Email", render: (r) => <EmailCell email={r.email} /> },
    { key: "phone", header: "Phone", render: (r) => <PhoneCell phone={r.phone} /> },
    { key: "city", header: "City", render: (r) => <span className="whitespace-nowrap">{r.city || "—"}</span> },
    { key: "company_name", header: "Company", render: (r) => <span className="whitespace-nowrap">{r.company_name || "—"}</span> },
    { key: "total_guests", header: "Guests", render: (r) => <span className="text-center block">{r.total_guests ?? "—"}</span> },
    { key: "description", header: "Notes", render: (r) => r.description ? <span title={r.description} className="block max-w-[220px] truncate text-slate-300">{r.description}</span> : <span className="text-slate-600">—</span> },
    { key: "source_url", header: "Source", render: (r) => <SourceCell url={r.source_url} /> },
  ];

  const vipColumns: Column<VipReservation>[] = [
    { key: "created_at", header: "Requested", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: "full_name", header: "Name", render: (r) => <span className="font-medium text-slate-100 whitespace-nowrap">{r.full_name || "—"}</span> },
    { key: "email", header: "Email", render: (r) => <EmailCell email={r.email} /> },
    { key: "phone", header: "Phone", render: (r) => <PhoneCell phone={r.phone} /> },
    { key: "guests", header: "Guests", render: (r) => <span className="text-center block">{r.guests ?? "—"}</span> },
    { key: "event_name", header: "Event", render: (r) => <span className="whitespace-nowrap">{r.event_name || "—"}</span> },
    { key: "event_date", header: "Event Date", render: (r) => <span className="whitespace-nowrap text-slate-400">{formatDate(r.event_date)}</span> },
    { key: "event_location", header: "Location", render: (r) => <span className="whitespace-nowrap">{r.event_location || "—"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  // ─── CSV exports ──────────────────────────────────────────────────────────────
  const exportLeads = () => {
    const headers = ["Date", "Type", "First Name", "Last Name", "Email", "Phone", "City", "Company", "Guests", "Notes", "Source"];
    const rows = filteredLeads.map((l) => [
      formatDateTime(l.created_at),
      formTypeLabel(l.form_type),
      l.f_name, l.l_name, l.email, l.phone, l.city, l.company_name, l.total_guests ?? "", l.description, l.source_url,
    ]);
    downloadCsv(`submissions-${typeFilter}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const exportVip = () => {
    const headers = ["Requested", "Name", "Email", "Phone", "Guests", "Event", "Event Date", "Location", "Status"];
    const rows = filteredVip.map((v) => [
      formatDateTime(v.created_at), v.full_name, v.email, v.phone, v.guests ?? "", v.event_name, formatDate(v.event_date), v.event_location, v.status,
    ]);
    downloadCsv(`vip-reservations-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="max-w-[1500px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Submissions</h2>
          <p className="text-slate-400 text-sm mt-1">
            Lead captures and VIP requests from across the site. Offer signups live in{" "}
            <Link href="/admin/offer-submissions" className="text-blue-400 hover:text-blue-300 hover:underline">
              Offer Submissions
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 mb-6">
        <TabButton active={tab === "leads"} onClick={() => setTab("leads")}>
          Leads &amp; Requests <Count n={generalLeads.length} />
        </TabButton>
        <TabButton active={tab === "vip"} onClick={() => setTab("vip")}>
          VIP Reservations <Count n={vip.length} />
        </TabButton>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <SearchInput value={search} onChange={setSearch} />
        <ExportButton
          onClick={tab === "leads" ? exportLeads : exportVip}
          disabled={tab === "leads" ? filteredLeads.length === 0 : filteredVip.length === 0}
        />
      </div>

      {/* Type filter pills (leads only) */}
      {tab === "leads" && presentTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
            All
          </FilterPill>
          {presentTypes.map((t) => (
            <FilterPill key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {formTypeLabel(t)}
            </FilterPill>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <TableLoading />
      ) : tab === "leads" ? (
        filteredLeads.length === 0 ? (
          <EmptyState message={search || typeFilter !== "all" ? "No submissions match your filters." : "No submissions yet."} />
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-3">{filteredLeads.length} result{filteredLeads.length === 1 ? "" : "s"}</p>
            <DataTable columns={leadColumns} rows={filteredLeads} />
          </>
        )
      ) : filteredVip.length === 0 ? (
        <EmptyState message={search ? "No VIP reservations match your search." : "No VIP reservations yet."} />
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-3">{filteredVip.length} result{filteredVip.length === 1 ? "" : "s"}</p>
          <DataTable columns={vipColumns} rows={filteredVip} />
        </>
      )}
    </div>
  );
}

// ─── Local UI bits ─────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
        active ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
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

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1.5 inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
      {n}
    </span>
  );
}
