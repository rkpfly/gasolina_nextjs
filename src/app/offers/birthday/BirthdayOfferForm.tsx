"use client";

import { useEffect, useRef, useState } from "react";
import { CountryCodePicker } from "@/components/CountryCodePicker";
import { EqLoader } from "@/components/Loader";

const inputClass =
  "w-full bg-transparent text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-white placeholder-brand-gray focus:outline-none [color-scheme:dark]";
const wrapperClass = "border-b border-white/20 pb-2";
const labelClass =
  "text-[9px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-2 block";

export default function BirthdayOfferForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    guests: "",
    celebration_date: "",
  });
  const [countryCode, setCountryCode] = useState("+61");
  // const [proofFile, setProofFile] = useState<File | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!proofFile) {
    //   setErrorMessage("Please attach proof of your birthday.");
    //   setFormStatus("error");
    //   return;
    // }

    setFormStatus("loading");
    setErrorMessage("");

    try {
      const fd = new FormData();
      fd.append("offer_key", "birthday");
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("phone", `${countryCode}${formData.phone}`);
      fd.append("dob", formData.dob);
      fd.append("guests", formData.guests);
      fd.append("celebration_date", formData.celebration_date);
      // fd.append("proofFile", proofFile);
      fd.append("source_url", currentUrl);

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

  if (formStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-white/10 rounded-xl bg-white/5">
        <p className="text-2xl mb-4">🥂</p>
        <h3 className="text-xl font-display font-bold uppercase tracking-tighter text-brand-white mb-3">
          Details Received
        </h3>
        <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed max-w-xs tracking-widest uppercase font-bold">
          We&apos;ve got their details and we will get back to them.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-7">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div>
          <label className={labelClass}>Date of Birth *</label>
          <div className={wrapperClass}>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Day of Celebration *</label>
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
      </div>

      <div>
        <label className={labelClass}>Guest List — You + 4 Friends *</label>
        <div className={wrapperClass}>
          <textarea
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            required
            rows={6}
            placeholder={
              "List every guest, including yourself — full name + Male/Female/Other, one per line. e.g.\nJane Doe – Female (Birthday)\nJohn Smith – Male\nAlex Kim – Other"
            }
            className={`${inputClass} resize-none normal-case tracking-normal leading-relaxed`}
          />
        </div>
        <p className="text-[8px] tracking-[0.15em] uppercase text-brand-white/40 mt-2 font-bold leading-relaxed">
          Entry for you + 4 friends, complimentary. Once you submit, we review based on
          availability, allocation and our terms &amp; conditions, then send your tickets.
        </p>
        <p className="text-[8px] tracking-[0.15em] uppercase text-brand-white/30 mt-2 font-bold leading-relaxed">
          Must provide ID &amp; proof of birthday. Valid for 14 days before or after your birthday.
        </p>
      </div>

      {/* <div>
        <label className={labelClass}>Proof of Birthday *</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border border-dashed border-white/30 bg-white/5 hover:bg-white/10 rounded-sm px-4 py-5 text-left transition-colors cursor-pointer"
        >
          {proofFile ? (
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-white flex items-center justify-between gap-3">
              <span className="truncate">{proofFile.name}</span>
              <span className="text-brand-white/40 shrink-0">Change</span>
            </span>
          ) : (
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray">
              Upload ID or document showing your DOB
            </span>
          )}
        </button>
        <p className="text-[8px] tracking-[0.15em] uppercase text-brand-white/30 mt-2 font-bold">
          JPG, PNG, WEBP, HEIC or PDF — max 8MB
        </p>
      </div> */}

      <button
        type="submit"
        disabled={formStatus === "loading"}
        className="btn-monumental w-full py-4 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 border border-white/20 disabled:opacity-50"
      >
        <span className="inline-flex items-center gap-2">
          {formStatus === "loading" && <EqLoader tone="white" bars={4} />}
          {formStatus === "loading" ? "Submitting..." : "Claim Complimentary Entry"}
        </span>
      </button>
    </form>
  );
}
