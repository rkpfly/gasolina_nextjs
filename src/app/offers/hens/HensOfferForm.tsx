"use client";

import { useEffect, useState } from "react";

const COUNTRY_CODES = [
  { code: "+61", label: "AU" },
  { code: "+64", label: "NZ" },
  { code: "+65", label: "SG" },
  { code: "+91", label: "IN" },
  { code: "+44", label: "GB" },
  { code: "+1", label: "US" },
];

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
    group_size: "",
  });
  const [countryCode, setCountryCode] = useState("+61");
  const [boothInterest, setBoothInterest] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      fd.append("gender", "Female");
      fd.append("celebration_date", formData.celebration_date);
      fd.append("group_size", formData.group_size);
      fd.append("booth_interest", boothInterest ? "Yes" : "No");
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
        <p className="text-2xl mb-4">👑</p>
        <h3 className="text-xl font-display font-bold uppercase tracking-tighter text-brand-white mb-3">
          You&apos;re On The List
        </h3>
        <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed max-w-xs tracking-widest uppercase font-bold">
          We&apos;ve received your details. Keep an eye on your inbox — your hens entry is on its way.
          {boothInterest && " We'll be in touch about VIP booth options too."}
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
        <div className="relative shrink-0 flex items-center">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-transparent text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-white focus:outline-none appearance-none cursor-pointer pr-4 [color-scheme:dark]"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.label} value={c.code} className="bg-brand-black">
                {c.label} {c.code}
              </option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-0 text-[8px] pointer-events-none text-brand-white/50" />
        </div>
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
          <label className={labelClass}>Group Size</label>
          <div className={`${wrapperClass} relative`}>
            <select
              name="group_size"
              value={formData.group_size}
              onChange={handleChange}
              className={`w-full bg-transparent text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase focus:outline-none appearance-none cursor-pointer [color-scheme:dark] ${
                formData.group_size === "" ? "text-brand-gray" : "text-brand-white"
              }`}
            >
              <option value="" disabled className="bg-brand-black">SELECT SIZE</option>
              <option value="1-3" className="bg-brand-black">1 – 3 (Free Entry)</option>
              <option value="4-6" className="bg-brand-black">4 – 6</option>
              <option value="7-10" className="bg-brand-black">7 – 10</option>
              <option value="10+" className="bg-brand-black">10+</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-0 top-1 text-[8px] pointer-events-none text-brand-white/50" />
          </div>
        </div>
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

      <button
        type="submit"
        disabled={formStatus === "loading"}
        className="btn-monumental w-full py-4 sm:py-5 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 border border-white/20 disabled:opacity-50"
      >
        <span>{formStatus === "loading" ? "Submitting..." : "Claim Our Free Entry"}</span>
      </button>
    </form>
  );
}
