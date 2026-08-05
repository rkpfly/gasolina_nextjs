"use client";

import { useState, useEffect } from 'react';
import { CountryCodePicker } from './CountryCodePicker';
import { EqLoader } from './Loader';
import SaturdayCalendar from './SaturdayCalendar';

// Define the available fields as a type for strict checking
export type FormField =
  | 'f_name' | 'l_name' | 'email' | 'phone' | 'city'
  | 'region' | 'country' | 'dob' | 'total_guests'
  | 'description' | 'company_name' | 'booking_date';

interface LeadFormProps {
  formType: string;
  fields: FormField[];
  buttonText?: string;
  tone?: 'light' | 'dark';
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
export default function LeadForm({ formType, fields, buttonText = "Subscribe", tone = 'light' }: LeadFormProps) {
  const dark = tone === 'dark';
  const [formData, setFormData] = useState<Record<string, string>>({
    f_name: '', l_name: '', email: '', phone: '', city: '',
    region: '', country: '', dob: '', total_guests: '',
    description: '', company_name: '', booking_date: ''
  });

  const [citySelection, setCitySelection] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [countryCode, setCountryCode] = useState('+61');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

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

    setFormStatus('loading');

    const finalCity = citySelection === 'Other' ? customCity : citySelection;

    // Phone format unchanged — still concatenates code + number
    const finalPhone = `${countryCode}${formData.phone}`;

    const payload = {
      ...formData,
      // Send the DB/CRM-friendly ISO date; the field displays DD/MM/YYYY.
      dob: isoFromDob(formData.dob),
      phone: finalPhone,
      // Sent alongside the concatenated `phone` so the server can split the dial
      // code back off and build a correct E.164 number for the CRM. Not stored
      // in Postgres — `phone` there stays exactly as it always was.
      country_code: countryCode,
      form_type: formType,
      city: finalCity,
      source_url: currentUrl,
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
              <div key={field} className={wrapperClass}>
                <input type="number" name="total_guests" placeholder="TOTAL GUESTS" value={formData.total_guests} onChange={handleChange} className={inputClass} />
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