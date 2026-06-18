"use client";

import { useState, useEffect, useRef } from 'react';

// ─── Country code data ───────────────────────────────────────────────────────
export const COUNTRY_CODES = [
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

export function CountryCodePicker({ value, onChange, dark = false }: CountryCodePickerProps) {
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
