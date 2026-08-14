"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Event } from "@/types/events";
import LeadForm from "@/components/LeadForm";

function bookingDate(value?: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function GuestlistModal({ event, onClose }: { event: Event; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden p-4 md:p-8" role="dialog" aria-modal="true" aria-labelledby="guestlist-modal-title">
      <button type="button" aria-label="Close guestlist form" className="fixed inset-0 bg-brand-ink/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden border border-white/10 bg-brand-ink shadow-2xl md:max-h-[calc(100dvh-4rem)]">
        <div className="z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-brand-ink px-5 py-5 md:px-8">
          <div>
            <h2 id="guestlist-modal-title" className="font-display text-xl font-bold uppercase tracking-tight text-brand-white md:text-2xl">
              Join the guestlist
            </h2>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-brand-gray">
              {event.basicInfo?.name}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            &times;
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">
          <p className="mb-8 border border-brand-blue/40 bg-brand-blue/10 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-brand-white sm:text-xs">
            Free Entry B4 11PM, Discounted Entry After 11PM on Guestlist
          </p>
          <LeadForm
            formType="guestlist_request"
            fields={["full_name", "email", "phone", "booking_date", "guest_names", "total_guests", "additional_info", "vip", "newsletter_consent"]}
            buttonText="Join Guestlist"
            tone="dark"
            initialBookingDate={bookingDate(event.basicInfo?.date)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
