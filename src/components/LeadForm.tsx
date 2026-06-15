"use client";

import { useState, useEffect, useRef } from 'react';

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

// ─── Country code data ───────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+61',  flag: '🇦🇺', label: 'AU' },
  { code: '+64',  flag: '🇳🇿', label: 'NZ' },
  { code: '+65',  flag: '🇸🇬', label: 'SG' },
  { code: '+91',  flag: '🇮🇳', label: 'IN' },
  { code: '+44',  flag: '🇬🇧', label: 'GB' },
  { code: '+1',   flag: '🇺🇸', label: 'US' },
  { code: '+93',  flag: '🇦🇫', label: 'AF' },
  { code: '+355', flag: '🇦🇱', label: 'AL' },
  { code: '+213', flag: '🇩🇿', label: 'DZ' },
  { code: '+376', flag: '🇦🇩', label: 'AD' },
  { code: '+244', flag: '🇦🇴', label: 'AO' },
  { code: '+54',  flag: '🇦🇷', label: 'AR' },
  { code: '+374', flag: '🇦🇲', label: 'AM' },
  { code: '+43',  flag: '🇦🇹', label: 'AT' },
  { code: '+994', flag: '🇦🇿', label: 'AZ' },
  { code: '+973', flag: '🇧🇭', label: 'BH' },
  { code: '+880', flag: '🇧🇩', label: 'BD' },
  { code: '+375', flag: '🇧🇾', label: 'BY' },
  { code: '+32',  flag: '🇧🇪', label: 'BE' },
  { code: '+501', flag: '🇧🇿', label: 'BZ' },
  { code: '+229', flag: '🇧🇯', label: 'BJ' },
  { code: '+975', flag: '🇧🇹', label: 'BT' },
  { code: '+591', flag: '🇧🇴', label: 'BO' },
  { code: '+387', flag: '🇧🇦', label: 'BA' },
  { code: '+267', flag: '🇧🇼', label: 'BW' },
  { code: '+55',  flag: '🇧🇷', label: 'BR' },
  { code: '+673', flag: '🇧🇳', label: 'BN' },
  { code: '+359', flag: '🇧🇬', label: 'BG' },
  { code: '+226', flag: '🇧🇫', label: 'BF' },
  { code: '+257', flag: '🇧🇮', label: 'BI' },
  { code: '+855', flag: '🇰🇭', label: 'KH' },
  { code: '+237', flag: '🇨🇲', label: 'CM' },
  { code: '+238', flag: '🇨🇻', label: 'CV' },
  { code: '+236', flag: '🇨🇫', label: 'CF' },
  { code: '+235', flag: '🇹🇩', label: 'TD' },
  { code: '+56',  flag: '🇨🇱', label: 'CL' },
  { code: '+86',  flag: '🇨🇳', label: 'CN' },
  { code: '+57',  flag: '🇨🇴', label: 'CO' },
  { code: '+269', flag: '🇰🇲', label: 'KM' },
  { code: '+242', flag: '🇨🇬', label: 'CG' },
  { code: '+506', flag: '🇨🇷', label: 'CR' },
  { code: '+385', flag: '🇭🇷', label: 'HR' },
  { code: '+53',  flag: '🇨🇺', label: 'CU' },
  { code: '+357', flag: '🇨🇾', label: 'CY' },
  { code: '+420', flag: '🇨🇿', label: 'CZ' },
  { code: '+45',  flag: '🇩🇰', label: 'DK' },
  { code: '+253', flag: '🇩🇯', label: 'DJ' },
  { code: '+593', flag: '🇪🇨', label: 'EC' },
  { code: '+20',  flag: '🇪🇬', label: 'EG' },
  { code: '+503', flag: '🇸🇻', label: 'SV' },
  { code: '+240', flag: '🇬🇶', label: 'GQ' },
  { code: '+291', flag: '🇪🇷', label: 'ER' },
  { code: '+372', flag: '🇪🇪', label: 'EE' },
  { code: '+268', flag: '🇸🇿', label: 'SZ' },
  { code: '+251', flag: '🇪🇹', label: 'ET' },
  { code: '+679', flag: '🇫🇯', label: 'FJ' },
  { code: '+358', flag: '🇫🇮', label: 'FI' },
  { code: '+33',  flag: '🇫🇷', label: 'FR' },
  { code: '+241', flag: '🇬🇦', label: 'GA' },
  { code: '+220', flag: '🇬🇲', label: 'GM' },
  { code: '+995', flag: '🇬🇪', label: 'GE' },
  { code: '+49',  flag: '🇩🇪', label: 'DE' },
  { code: '+233', flag: '🇬🇭', label: 'GH' },
  { code: '+30',  flag: '🇬🇷', label: 'GR' },
  { code: '+502', flag: '🇬🇹', label: 'GT' },
  { code: '+224', flag: '🇬🇳', label: 'GN' },
  { code: '+245', flag: '🇬🇼', label: 'GW' },
  { code: '+592', flag: '🇬🇾', label: 'GY' },
  { code: '+509', flag: '🇭🇹', label: 'HT' },
  { code: '+504', flag: '🇭🇳', label: 'HN' },
  { code: '+852', flag: '🇭🇰', label: 'HK' },
  { code: '+36',  flag: '🇭🇺', label: 'HU' },
  { code: '+354', flag: '🇮🇸', label: 'IS' },
  { code: '+62',  flag: '🇮🇩', label: 'ID' },
  { code: '+98',  flag: '🇮🇷', label: 'IR' },
  { code: '+964', flag: '🇮🇶', label: 'IQ' },
  { code: '+353', flag: '🇮🇪', label: 'IE' },
  { code: '+972', flag: '🇮🇱', label: 'IL' },
  { code: '+39',  flag: '🇮🇹', label: 'IT' },
  { code: '+225', flag: '🇨🇮', label: 'CI' },
  { code: '+81',  flag: '🇯🇵', label: 'JP' },
  { code: '+962', flag: '🇯🇴', label: 'JO' },
  { code: '+7',   flag: '🇰🇿', label: 'KZ' },
  { code: '+254', flag: '🇰🇪', label: 'KE' },
  { code: '+686', flag: '🇰🇮', label: 'KI' },
  { code: '+965', flag: '🇰🇼', label: 'KW' },
  { code: '+996', flag: '🇰🇬', label: 'KG' },
  { code: '+856', flag: '🇱🇦', label: 'LA' },
  { code: '+371', flag: '🇱🇻', label: 'LV' },
  { code: '+961', flag: '🇱🇧', label: 'LB' },
  { code: '+266', flag: '🇱🇸', label: 'LS' },
  { code: '+231', flag: '🇱🇷', label: 'LR' },
  { code: '+218', flag: '🇱🇾', label: 'LY' },
  { code: '+423', flag: '🇱🇮', label: 'LI' },
  { code: '+370', flag: '🇱🇹', label: 'LT' },
  { code: '+352', flag: '🇱🇺', label: 'LU' },
  { code: '+853', flag: '🇲🇴', label: 'MO' },
  { code: '+261', flag: '🇲🇬', label: 'MG' },
  { code: '+265', flag: '🇲🇼', label: 'MW' },
  { code: '+60',  flag: '🇲🇾', label: 'MY' },
  { code: '+960', flag: '🇲🇻', label: 'MV' },
  { code: '+223', flag: '🇲🇱', label: 'ML' },
  { code: '+356', flag: '🇲🇹', label: 'MT' },
  { code: '+692', flag: '🇲🇭', label: 'MH' },
  { code: '+222', flag: '🇲🇷', label: 'MR' },
  { code: '+230', flag: '🇲🇺', label: 'MU' },
  { code: '+52',  flag: '🇲🇽', label: 'MX' },
  { code: '+691', flag: '🇫🇲', label: 'FM' },
  { code: '+373', flag: '🇲🇩', label: 'MD' },
  { code: '+377', flag: '🇲🇨', label: 'MC' },
  { code: '+976', flag: '🇲🇳', label: 'MN' },
  { code: '+382', flag: '🇲🇪', label: 'ME' },
  { code: '+212', flag: '🇲🇦', label: 'MA' },
  { code: '+258', flag: '🇲🇿', label: 'MZ' },
  { code: '+95',  flag: '🇲🇲', label: 'MM' },
  { code: '+264', flag: '🇳🇦', label: 'NA' },
  { code: '+674', flag: '🇳🇷', label: 'NR' },
  { code: '+977', flag: '🇳🇵', label: 'NP' },
  { code: '+31',  flag: '🇳🇱', label: 'NL' },
  { code: '+505', flag: '🇳🇮', label: 'NI' },
  { code: '+227', flag: '🇳🇪', label: 'NE' },
  { code: '+234', flag: '🇳🇬', label: 'NG' },
  { code: '+47',  flag: '🇳🇴', label: 'NO' },
  { code: '+968', flag: '🇴🇲', label: 'OM' },
  { code: '+92',  flag: '🇵🇰', label: 'PK' },
  { code: '+680', flag: '🇵🇼', label: 'PW' },
  { code: '+970', flag: '🇵🇸', label: 'PS' },
  { code: '+507', flag: '🇵🇦', label: 'PA' },
  { code: '+675', flag: '🇵🇬', label: 'PG' },
  { code: '+595', flag: '🇵🇾', label: 'PY' },
  { code: '+51',  flag: '🇵🇪', label: 'PE' },
  { code: '+63',  flag: '🇵🇭', label: 'PH' },
  { code: '+48',  flag: '🇵🇱', label: 'PL' },
  { code: '+351', flag: '🇵🇹', label: 'PT' },
  { code: '+974', flag: '🇶🇦', label: 'QA' },
  { code: '+40',  flag: '🇷🇴', label: 'RO' },
  { code: '+7',   flag: '🇷🇺', label: 'RU' },
  { code: '+250', flag: '🇷🇼', label: 'RW' },
  { code: '+966', flag: '🇸🇦', label: 'SA' },
  { code: '+221', flag: '🇸🇳', label: 'SN' },
  { code: '+381', flag: '🇷🇸', label: 'RS' },
  { code: '+232', flag: '🇸🇱', label: 'SL' },
  { code: '+386', flag: '🇸🇮', label: 'SI' },
  { code: '+677', flag: '🇸🇧', label: 'SB' },
  { code: '+252', flag: '🇸🇴', label: 'SO' },
  { code: '+27',  flag: '🇿🇦', label: 'ZA' },
  { code: '+82',  flag: '🇰🇷', label: 'KR' },
  { code: '+34',  flag: '🇪🇸', label: 'ES' },
  { code: '+94',  flag: '🇱🇰', label: 'LK' },
  { code: '+249', flag: '🇸🇩', label: 'SD' },
  { code: '+597', flag: '🇸🇷', label: 'SR' },
  { code: '+46',  flag: '🇸🇪', label: 'SE' },
  { code: '+41',  flag: '🇨🇭', label: 'CH' },
  { code: '+963', flag: '🇸🇾', label: 'SY' },
  { code: '+886', flag: '🇹🇼', label: 'TW' },
  { code: '+992', flag: '🇹🇯', label: 'TJ' },
  { code: '+255', flag: '🇹🇿', label: 'TZ' },
  { code: '+66',  flag: '🇹🇭', label: 'TH' },
  { code: '+670', flag: '🇹🇱', label: 'TL' },
  { code: '+228', flag: '🇹🇬', label: 'TG' },
  { code: '+676', flag: '🇹🇴', label: 'TO' },
  { code: '+1868',flag: '🇹🇹', label: 'TT' },
  { code: '+216', flag: '🇹🇳', label: 'TN' },
  { code: '+90',  flag: '🇹🇷', label: 'TR' },
  { code: '+993', flag: '🇹🇲', label: 'TM' },
  { code: '+688', flag: '🇹🇻', label: 'TV' },
  { code: '+256', flag: '🇺🇬', label: 'UG' },
  { code: '+380', flag: '🇺🇦', label: 'UA' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+598', flag: '🇺🇾', label: 'UY' },
  { code: '+998', flag: '🇺🇿', label: 'UZ' },
  { code: '+678', flag: '🇻🇺', label: 'VU' },
  { code: '+58',  flag: '🇻🇪', label: 'VE' },
  { code: '+84',  flag: '🇻🇳', label: 'VN' },
  { code: '+967', flag: '🇾🇪', label: 'YE' },
  { code: '+260', flag: '🇿🇲', label: 'ZM' },
  { code: '+263', flag: '🇿🇼', label: 'ZW' },
];

// ─── Searchable Country Code Dropdown ───────────────────────────────────────
interface CountryCodePickerProps {
  value: string;
  onChange: (code: string) => void;
  dark?: boolean;
}

function CountryCodePicker({ value, onChange, dark = false }: CountryCodePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find(c => c.code === value) ?? COUNTRY_CODES[0];

  const filtered = search.trim()
    ? COUNTRY_CODES.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
      )
    : COUNTRY_CODES;

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex items-center shrink-0">
      {/* Trigger button — visually identical to the old <select> */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase focus:outline-none cursor-pointer pr-4 flex items-center gap-1 ${dark ? 'text-white' : 'text-brand-black'}`}
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
      </button>

      {/* Custom chevron (same as before) */}
      <i className={`fa-solid fa-chevron-down absolute right-0 text-[8px] pointer-events-none ${dark ? 'text-white' : 'text-brand-black'}`} />

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 bg-white border border-brand-black shadow-md">
          {/* Search input */}
          <div className="border-b border-brand-black px-2 py-1.5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH..."
              className="w-full bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase placeholder-brand-gray focus:outline-none text-brand-black"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-gray">
                No results
              </li>
            )}
            {filtered.map(c => (
              <li key={`${c.label}-${c.code}`}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase flex items-center gap-2 hover:bg-brand-black hover:text-white transition-colors ${
                    c.code === value && c.label === selected.label ? 'bg-brand-black text-white' : 'text-brand-black'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                  <span className="ml-auto text-[7px] sm:text-[8px] opacity-70">{c.code}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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