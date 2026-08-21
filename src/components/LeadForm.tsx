"use client";

import { useState } from 'react';
import { CountryCodePicker } from './CountryCodePicker';
import { EqLoader } from './Loader';
import SaturdayCalendar from './SaturdayCalendar';

// Define the available fields as a type for strict checking
export type FormField =
  | 'f_name' | 'l_name' | 'full_name' | 'email' | 'phone' | 'city'
  | 'region' | 'country' | 'dob' | 'total_guests'
  | 'description' | 'additional_info' | 'company_name' | 'booking_date'
  | 'guest_names' | 'vip' | 'newsletter_consent';

interface LeadFormProps {
  formType: string;
  fields: FormField[];
  buttonText?: string;
  tone?: 'light' | 'dark';
  initialBookingDate?: string;
}

// ─── Smart DOB mask (DD/MM/YYYY) ─────────────────────────────────────────────
// Day  : first digit 4-9 auto-pads to 0X (no valid day 40+); 0-3 waits for a
//        second digit (space pads it — see handleDobKeyDown).
// Month: first digit 2-9 auto-pads to 0X (no valid month 20+); 0-1 waits.
// Year : 4 digits. Slashes are inserted automatically as each part completes.
function formatDobValue(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  let i = 0;

  let day = '';
  if (digits.length > i) {
    const d = digits[i];
    if (d >= '4' && d <= '9') { day = '0' + d; i += 1; }
    else { day = digits.slice(i, i + 2); i += day.length; }
  }

  let month = '';
  if (day.length === 2 && digits.length > i) {
    const m = digits[i];
    if (m >= '2' && m <= '9') { month = '0' + m; i += 1; }
    else { month = digits.slice(i, i + 2); i += month.length; }
  }

  let year = '';
  if (day.length === 2 && month.length === 2 && digits.length > i) {
    year = digits.slice(i, i + 4);
  }

  let out = day;
  if (day.length === 2) out += '/';
  out += month;
  if (month.length === 2) out += '/';
  out += year;
  return out;
}

// DD/MM/YYYY (display) → YYYY-MM-DD (wire format, matches the old date input).
function isoFromDob(v: string): string {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return '';
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Main LeadForm ───────────────────────────────────────────────────────────
export default function LeadForm({ formType, fields, buttonText = "Subscribe", tone = 'light', initialBookingDate = '' }: LeadFormProps) {
  const dark = tone === 'dark';
  const [formData, setFormData] = useState<Record<string, string>>({
    f_name: '', l_name: '', full_name: '', email: '', phone: '', city: '',
    region: '', country: '', dob: '', total_guests: '',
    description: '', additional_info: '', company_name: '', booking_date: initialBookingDate,
    guest_names: ''
  });

  const [citySelection, setCitySelection] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [countryCode, setCountryCode] = useState('+61');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState(false);
  const [guestError, setGuestError] = useState(false);
  const [vip, setVip] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const deleting = raw.length < formData.dob.length;
    let next = formatDobValue(raw);
    // While deleting, don't re-add a trailing slash the user just removed.
    if (deleting && next.endsWith('/') && !raw.endsWith('/')) next = next.slice(0, -1);
    setFormData({ ...formData, dob: next });
  };

  // Space "commits" an ambiguous single digit by padding it with a leading zero.
  const handleDobKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== ' ') return;
    e.preventDefault();
    const v = formData.dob;
    if (/^[1-3]$/.test(v)) {                    // day 1-3 → 0X/
      setFormData({ ...formData, dob: `0${v}/` });
      return;
    }
    const m = v.match(/^(\d{2})\/1$/);          // month 1 → 01/
    if (m) setFormData({ ...formData, dob: `${m[1]}/01/` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The Saturday calendar has no native `required`, so guard it manually.
    if (fields.includes('booking_date') && !formData.booking_date) {
      setBookingError(true);
      return;
    }

    if (
      fields.includes('guest_names') &&
      fields.includes('total_guests') &&
      !formData.guest_names.trim() &&
      !formData.total_guests
    ) {
      setGuestError(true);
      return;
    }

    setFormStatus('loading');

    const finalCity = citySelection === 'Other' ? customCity : citySelection;

    // Phone format unchanged — still concatenates code + number
    const finalPhone = `${countryCode}${formData.phone}`;

    const nameParts = formData.full_name.trim().split(/\s+/).filter(Boolean);
    const payload = {
      ...formData,
      f_name: fields.includes('full_name') ? (nameParts.shift() || '') : formData.f_name,
      l_name: fields.includes('full_name') ? (nameParts.join(' ') || '') : formData.l_name,
      description: formData.additional_info || formData.description,
      // Send the DB/CRM-friendly ISO date; the field displays DD/MM/YYYY.
      dob: isoFromDob(formData.dob),
      phone: finalPhone,
      // Sent alongside the concatenated `phone` so the server can split the dial
      // code back off and build a correct E.164 number for the CRM. Not stored
      // in Postgres — `phone` there stays exactly as it always was.
      country_code: countryCode,
      form_type: formType,
      city: finalCity,
      source_url: window.location.href,
      vip,
      newsletter_consent: newsletterConsent,
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Submission failed');

      setFormStatus('success');
    } catch (error) {
      console.error(error);
      setFormStatus('error');
    }
  };

  const inputClass = `w-full bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase placeholder-brand-gray focus:outline-none ${dark ? 'text-white' : 'text-brand-black'}`;
  const wrapperClass = `pb-2 border-b transition-colors duration-300 ${dark ? 'border-white/30 focus-within:border-brand-blue' : 'border-brand-black focus-within:border-brand-blue'}`;

  if (formType === 'guestlist_request' && formStatus === 'success') {
    return (
      <div
        className={`border p-6 text-center sm:p-8 ${dark ? 'border-brand-blue/50 bg-brand-blue/10 text-white' : 'border-brand-black bg-brand-lime/35 text-brand-black shadow-[6px_6px_0_0_#723CF4]'}`}
        role="status"
        aria-live="polite"
      >
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 ${dark ? 'border-brand-blue bg-brand-blue/20 text-white' : 'border-brand-black bg-brand-lime text-brand-black'}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4 4L19 6" />
          </svg>
        </span>
        <p className={`mt-5 text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? 'text-brand-blue' : 'text-brand-accent'}`}>
          Submission confirmed
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
          You&apos;ve been added to the guestlist
        </h3>
        <div className={`mx-auto mt-6 max-w-md border-t pt-5 text-left ${dark ? 'border-white/15' : 'border-brand-black/15'}`}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em]">Entry conditions</p>
          <ul className={`space-y-3 text-xs font-bold uppercase tracking-[0.1em] sm:text-sm ${dark ? 'text-white/80' : 'text-brand-black/75'}`}>
            <li className="flex gap-3"><span aria-hidden="true">•</span><span>Upscale club attire</span></li>
            <li className="flex gap-3"><span aria-hidden="true">•</span><span>Photo ID (physical photo ID compulsory)</span></li>
            <li className="flex gap-3"><span aria-hidden="true">•</span><span>Mixed ratio applies</span></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6 md:gap-8">
      {formStatus === 'error' && (
        <div className="text-red-500 text-[8px] sm:text-[9px] md:text-xs font-bold uppercase tracking-widest">
          An error occurred. Please try again.
        </div>
      )}

      {formStatus === 'success' && (
        <div className="text-green-500 text-[8px] sm:text-[9px] md:text-xs font-bold uppercase tracking-widest">
          Successfully submitted!
        </div>
      )}

      {fields.map((field) => {
        switch (field) {
          case 'f_name':
            return (
              <div key={field} className={wrapperClass}>
                <input type="text" name="f_name" placeholder="FIRST NAME *" value={formData.f_name} onChange={handleChange} required className={inputClass} />
              </div>
            );
          case 'full_name':
            return (
              <div key={field} className={wrapperClass}>
                <input type="text" name="full_name" placeholder="FULL NAME *" value={formData.full_name} onChange={handleChange} autoComplete="name" required className={inputClass} />
              </div>
            );
          case 'l_name':
            return (
              <div key={field} className={wrapperClass}>
                <input type="text" name="l_name" placeholder="LAST NAME" value={formData.l_name} onChange={handleChange} className={inputClass} />
              </div>
            );
          case 'email':
            return (
              <div key={field} className={wrapperClass}>
                <input type="email" name="email" placeholder="EMAIL ADDRESS *" value={formData.email} onChange={handleChange} required className={inputClass} />
              </div>
            );
          case 'phone':
            return (
              <div key={field} className={`${wrapperClass} flex items-center gap-3 sm:gap-4`}>
                {/* ← swapped: CountryCodePicker replaces the old <select> */}
                <CountryCodePicker value={countryCode} onChange={setCountryCode} dark={dark} />

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
            );
          case 'city':
            return (
              <div key={field} className="flex flex-col gap-4">
                <div className={`${wrapperClass} relative`}>
                  <select
                    value={citySelection}
                    onChange={(e) => setCitySelection(e.target.value)}
                    required
                    className={`w-full bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase focus:outline-none appearance-none cursor-pointer ${citySelection === "" ? 'text-brand-gray' : (dark ? 'text-white' : 'text-brand-black')}`}
                  >
                    <option value="" disabled className="text-brand-gray bg-brand-black">SELECT CITY *</option>
                    <option className="text-brand-black" value="Melbourne">Melbourne</option>
                    <option className="text-brand-black" value="Sydney">Sydney</option>
                    <option className="text-brand-black" value="Perth">Perth</option>
                    <option className="text-brand-black" value="Adelaide">Adelaide</option>
                    <option className="text-brand-black" value="Brisbane">Brisbane</option>
                    <option className="text-brand-black" value="Singapore">Singapore</option>
                    <option className="text-brand-black" value="Other">Other</option>
                  </select>
                </div>
                {citySelection === 'Other' && (
                  <div className={`${wrapperClass} animate-in slide-in-from-top-2 duration-300`}>
                    <input type="text" placeholder="ENTER YOUR CITY *" value={customCity} onChange={(e) => setCustomCity(e.target.value)} required className={inputClass} />
                  </div>
                )}
              </div>
            );
          case 'company_name':
            return (
              <div key={field} className={wrapperClass}>
                <input type="text" name="company_name" placeholder="COMPANY NAME" value={formData.company_name} onChange={handleChange} className={inputClass} />
              </div>
            );
          case 'total_guests':
            return (
              <div key={field} className="flex flex-col gap-2">
                <div className={wrapperClass}>
                  <input
                    type="number"
                    name="total_guests"
                    min="1"
                    placeholder={fields.includes('guest_names') ? "TOTAL GUESTS (OR ADD NAMES ABOVE)" : "TOTAL GUESTS"}
                    value={formData.total_guests}
                    onChange={(e) => {
                      handleChange(e);
                      setGuestError(false);
                    }}
                    className={inputClass}
                  />
                </div>
                {guestError && (
                  <p className="text-red-500 text-[8px] sm:text-[9px] md:text-xs font-bold uppercase tracking-widest">
                    Add guest names or a total guest count.
                  </p>
                )}
              </div>
            );
          case 'guest_names':
            return (
              <div key={field} className={wrapperClass}>
                <textarea
                  name="guest_names"
                  placeholder="FULL NAMES OF GUESTS (ONE PER LINE)"
                  value={formData.guest_names}
                  onChange={(e) => {
                    handleChange(e);
                    setGuestError(false);
                  }}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            );
          case 'dob':
            return (
              <div key={field} className="flex flex-col gap-2">
                <label htmlFor="dob" className={`text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase ${dark ? 'text-white' : 'text-brand-black'}`}>
                  Date of Birth
                </label>
                <div className={wrapperClass}>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="dob"
                    name="dob"
                    placeholder="DD/MM/YYYY"
                    value={formData.dob}
                    onChange={handleDobChange}
                    onKeyDown={handleDobKeyDown}
                    maxLength={10}
                    autoComplete="bday"
                    className={inputClass}
                  />
                </div>
              </div>
            );
          case 'booking_date':
            return (
              <div key={field} className="flex flex-col gap-3">
                <label className={`text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase ${dark ? 'text-white' : 'text-brand-black'}`}>
                  Select Booking Date (Saturdays) *
                </label>
                <SaturdayCalendar
                  value={formData.booking_date}
                  onChange={(val) => {
                    setFormData({ ...formData, booking_date: val });
                    setBookingError(false);
                  }}
                  dark={dark}
                />
                {bookingError && (
                  <p className="text-red-500 text-[8px] sm:text-[9px] md:text-xs font-bold uppercase tracking-widest">
                    Please select a Saturday.
                  </p>
                )}
              </div>
            );
          case 'description':
            return (
              <div key={field} className={wrapperClass}>
                <textarea name="description" placeholder="DESCRIPTION" value={formData.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
              </div>
            );
          case 'additional_info':
            return (
              <div key={field} className={wrapperClass}>
                <textarea name="additional_info" placeholder="ADDITIONAL INFORMATION" value={formData.additional_info} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
              </div>
            );
          case 'vip':
            return (
              <label key={field} className={`flex items-center justify-between gap-4 border p-4 cursor-pointer transition-colors ${dark ? 'border-white/20 hover:border-white/40' : 'border-brand-black/20 hover:border-brand-black/40'}`}>
                <span className={`text-[9px] sm:text-xs font-bold tracking-[0.15em] uppercase ${dark ? 'text-white' : 'text-brand-black'}`}>
                  Interested in VIP?
                </span>
                <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} className="peer sr-only" />
                <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-blue ${vip ? 'bg-brand-blue' : (dark ? 'bg-white/20' : 'bg-brand-black/20')}`}>
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${vip ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
              </label>
            );
          case 'newsletter_consent':
            return (
              <label key={field} className={`flex items-start gap-3 cursor-pointer text-[9px] sm:text-xs font-medium leading-relaxed ${dark ? 'text-white/70' : 'text-brand-black/70'}`}>
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                />
                <span>I agree to receive news, event updates and offers from Gasolina.</span>
              </label>
            );
          default:
            return null;
        }
      })}

      {dark ? (
        <button
          type="submit"
          disabled={formStatus === 'loading'}
          className="btn-glow w-full py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 sm:mt-4 rounded-full bg-brand-blue text-brand-white hover:bg-brand-white hover:text-brand-black transition-colors duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <span className="flex items-center justify-center gap-2">
            {formStatus === 'loading' ? (<><EqLoader tone="white" bars={4} /> Submitting</>) : buttonText}
          </span>
        </button>
      ) : (
        <button
          type="submit"
          disabled={formStatus === 'loading'}
          className="btn-monumental w-full py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 sm:mt-4 disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            {formStatus === 'loading' ? (<><EqLoader tone="white" bars={4} /> Submitting</>) : buttonText}
          </span>
        </button>
      )}
    </form>
  );
}
