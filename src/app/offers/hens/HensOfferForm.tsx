"use client";

import { useState } from "react";
import Link from "next/link";
import { CountryCodePicker } from "@/components/CountryCodePicker";
import { EqLoader } from "@/components/Loader";
import OfferFlyer from "@/components/OfferFlyer";

const inputClass =
  "w-full bg-transparent text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-white placeholder-brand-gray focus:outline-none [color-scheme:dark]";
const wrapperClass = "border-b border-white/20 pb-2";
const labelClass =
  "text-[9px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-2 block";

export default function HensOfferForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    celebration_date: "",
    guests: "",
  });
  const [countryCode, setCountryCode] = useState("+61");
  const [boothInterest, setBoothInterest] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading");
    setErrorMessage("");

    try {
      const fd = new FormData();
      fd.append("offer_key", "hens");
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", `${countryCode}${formData.phone}`);
      fd.append("celebration_date", formData.celebration_date);
      fd.append("guests", formData.guests);
      fd.append("booth_interest", boothInterest ? "Yes" : "No");
      fd.append("source_url", window.location.href);

      const res = await fetch("/api/offers/submissions", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Submission failed");
      }

      setFormStatus("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred. Please try again.");
      setFormStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* HEADER — full width, top */}
      <div className="bg-brand-black/90 backdrop-blur-md z-10 p-6 sm:p-8 border-b border-white/10 flex flex-col gap-3">
        <Link
          href="/offers"
          className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 hover:text-brand-white flex items-center gap-2 w-fit transition-colors"
        >
          &larr; Back to Offers
        </Link>

        <div>
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-white/50 mb-3">
            Her Last Night Of Freedom
          </p>
          <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tighter text-brand-white leading-tight">
            Hens Night Made Memorable
          </h1>
          <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed font-medium mt-3 max-w-lg">
            The bride and her crew get <span className="text-brand-white font-bold">hen + 4 complimentary entry</span>{" "}
            — and you can enquire about a VIP booth for the ultimate hens night. Fill in your details
            below and we&apos;ll take care of the rest.
          </p>
        </div>
      </div>

      {formStatus === "success" ? (
        /* SUCCESS — full width */
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
          <p className="text-2xl mb-4">👑</p>
          <h3 className="text-xl font-display font-bold uppercase tracking-tighter text-brand-white mb-3">
            Details Received
          </h3>
          <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed max-w-xs tracking-widest uppercase font-bold">
            We&apos;ve got their details and we will get back to them.
            {boothInterest && " We'll be in touch about VIP booth options too."}
          </p>
        </div>
      ) : (
        <>
          {/* BODY — flyer beside fields */}
          <div className="flex flex-col md:flex-row">
            {/* FLYER */}
            <div className="w-full md:w-1/2 relative order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10 bg-[#0b0b10] flex items-center justify-center">
              <OfferFlyer
                slug="hens"
                alt="Hens offer — hen + 4 girls free entry"
                unavailableLabel="Hens flyer unavailable"
              />
            </div>

            {/* FIELDS */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col md:justify-center order-1 md:order-2">
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-6 border-b border-white/10 pb-2">
                Claim Your Free Entry
              </h2>

              <div className="flex flex-col gap-5">
                {formStatus === "error" && (
                  <div className="text-red-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                    {errorMessage || "An error occurred. Please try again."}
                  </div>
                )}

                <div className={wrapperClass}>
                  <input
                    type="text"
                    name="name"
                    placeholder="FULL NAME *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className={wrapperClass}>
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL ADDRESS *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className={`${wrapperClass} flex items-center gap-3 sm:gap-4`}>
                  <CountryCodePicker value={countryCode} onChange={setCountryCode} dark />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="PHONE NO. *"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Hens Night Date *</label>
                  <div className={wrapperClass}>
                    <input
                      type="date"
                      name="celebration_date"
                      value={formData.celebration_date}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Guest List — Hen + 4 Friends *</label>
                  <div className={wrapperClass}>
                    <textarea
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder={
                        "List every guest, including the hen — full name + Male/Female/Other, one per line. e.g.\nJane Doe – Female (Hen)\nSam Lee – Female\nAlex Kim – Other"
                      }
                      className={`${inputClass} resize-none normal-case tracking-normal leading-relaxed`}
                    />
                  </div>
                  <p className="text-[8px] tracking-[0.15em] uppercase text-brand-white/40 mt-2 font-bold leading-relaxed">
                    Hen + 4 friends, complimentary entry. Once you submit, we review based on
                    availability, allocation and our terms &amp; conditions, then send your tickets.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={boothInterest}
                    onChange={(e) => setBoothInterest(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-white cursor-pointer"
                  />
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray group-hover:text-brand-white transition-colors leading-relaxed">
                    I&apos;d like to enquire about a VIP booth for the night
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SUBMIT — full width, bottom */}
          <div className="p-6 sm:p-8 border-t border-white/10">
            <button
              type="submit"
              disabled={formStatus === "loading"}
              className="btn-monumental w-full py-4 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase border border-white/20 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                {formStatus === "loading" && <EqLoader tone="white" bars={4} />}
                {formStatus === "loading" ? "Submitting..." : "Claim Complimentary Entry"}
              </span>
            </button>
          </div>
        </>
      )}
    </form>
  );
}
