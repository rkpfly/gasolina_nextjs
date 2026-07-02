"use client";

import { useState } from "react";

interface SaturdayCalendarProps {
  value: string;                     // 'YYYY-MM-DD' or ''
  onChange: (val: string) => void;
  dark?: boolean;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Local-timezone YYYY-MM-DD (avoids the UTC shift you get from toISOString()).
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// A month-view calendar that only lets the user pick Saturdays from today
// onwards. Every other day is shown but disabled, so it reads as a normal
// calendar while enforcing "Saturdays only".
export default function SaturdayCalendar({ value, onChange, dark = false }: SaturdayCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const initial = selected ?? today;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Don't allow navigating to months that are entirely in the past.
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const border = dark ? "border-white/20" : "border-brand-black/20";
  const headText = dark ? "text-brand-white" : "text-brand-black";
  const mutedText = dark ? "text-brand-white/25" : "text-brand-black/30";
  const navBtn = dark
    ? "text-brand-white/60 hover:text-brand-white"
    : "text-brand-black/60 hover:text-brand-black";

  return (
    <div className={`border ${border} rounded-sm p-4`}>
      {/* Month header + navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className={`px-2 py-1 text-sm ${navBtn} disabled:opacity-20 disabled:cursor-not-allowed transition-colors`}
        >
          &larr;
        </button>
        <span className={`text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase ${headText}`}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next month"
          className={`px-2 py-1 text-sm ${navBtn} transition-colors`}
        >
          &rarr;
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className={`text-center text-[8px] font-bold uppercase tracking-wider ${mutedText}`}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid — only future Saturdays are clickable */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const isSelectable = date.getDay() === 6 && date >= today;
          const iso = toISO(date);
          const isSelected = value === iso;

          if (!isSelectable) {
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-[10px] font-bold ${mutedText}`}
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(iso)}
              className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-sm transition-colors ${
                isSelected
                  ? "bg-brand-blue text-brand-white"
                  : `${dark ? "text-brand-white" : "text-brand-black"} ring-1 ring-brand-blue/50 hover:bg-brand-blue/20`
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className={`mt-3 text-[8px] font-bold tracking-[0.15em] uppercase ${mutedText}`}>
        Saturdays only
      </p>
    </div>
  );
}
