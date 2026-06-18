"use client";

import { useState, useEffect } from 'react';
import { CountryCodePicker } from './CountryCodePicker';

// Define the available fields as a type for strict checking
export type FormField =
  | 'f_name' | 'l_name' | 'email' | 'phone' | 'city'
  | 'region' | 'country' | 'dob' | 'total_guests'
  | 'description' | 'company_name';

interface LeadFormProps {
  formType: string;
  fields: FormField[];
  buttonText?: string;
  tone?: 'light' | 'dark';
}

// ─── Main LeadForm ───────────────────────────────────────────────────────────
export default function LeadForm({ formType, fields, buttonText = "Subscribe", tone = 'light' }: LeadFormProps) {
  const dark = tone === 'dark';
  const [formData, setFormData] = useState<Record<string, string>>({
    f_name: '', l_name: '', email: '', phone: '', city: '',
    region: '', country: '', dob: '', total_guests: '',
    description: '', company_name: ''
  });

  const [citySelection, setCitySelection] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [countryCode, setCountryCode] = useState('+61');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');

    const finalCity = citySelection === 'Other' ? customCity : citySelection;

    // Phone format unchanged — still concatenates code + number
    const finalPhone = `${countryCode}${formData.phone}`;

    const payload = {
      ...formData,
      phone: finalPhone,
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
  const wrapperClass = `pb-2 border-b ${dark ? 'border-white/30' : 'border-brand-black'}`;

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
              <div key={field} className={wrapperClass}>
                <input type="date" name="dob" placeholder="DATE OF BIRTH" value={formData.dob} onChange={handleChange} className={inputClass} />
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
          className="w-full py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 sm:mt-4 rounded-full bg-brand-lime text-brand-black hover:bg-brand-white transition-colors duration-300 disabled:opacity-50"
        >
          {formStatus === 'loading' ? 'Submitting...' : buttonText}
        </button>
      ) : (
        <button
          type="submit"
          disabled={formStatus === 'loading'}
          className="btn-monumental w-full py-3 sm:py-4 md:py-5 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase mt-2 sm:mt-4 disabled:opacity-50"
        >
          <span>{formStatus === 'loading' ? 'Submitting...' : buttonText}</span>
        </button>
      )}
    </form>
  );
}