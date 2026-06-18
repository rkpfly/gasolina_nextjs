'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CheckinCity } from './cities';
import { CountryCodePicker } from '@/components/CountryCodePicker';

type Phase = 'phone' | 'details' | 'registered' | 'done';

const inputClass =
  'w-full bg-transparent text-xs sm:text-sm font-bold tracking-[0.15em] uppercase placeholder-brand-gray focus:outline-none text-brand-white';
const wrapperClass = 'pb-2 border-b border-white/30';

export default function CheckinForm({ city }: { city: CheckinCity }) {
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(city === 'Singapore' ? '+65' : '+61');
  const [greetName, setGreetName] = useState<string | null>(null);
  const [details, setDetails] = useState({ fullName: '', email: '', gender: '', dob: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Combine the picked country code with the national number into E.164,
  // dropping a leading trunk zero (e.g. +61 + 0412… → +61412…).
  const fullPhone = () =>
    `${countryCode}${phone.trim().replace(/[\s()-]/g, '').replace(/^0+/, '')}`;

  // Step 1 → lookup by phone
  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkin/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone(), place: city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      if (data.found) {
        setGreetName(data.firstName);
        setPhase('registered');
      } else {
        setPhase('details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  // Step 2 → register (create Zoho contact, owned by DamiClub)
  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/checkin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone(), place: city, ...details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setPhase('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Dami Club logo — source PNG is black, inverted to white for the dark kiosk */}
      <Image
        src="/dc-logo-black-v1.png"
        alt="Dami Club"
        width={160}
        height={48}
        priority
        className="mb-10 h-12 w-auto object-contain filter-[brightness(0)_invert(1)]"
      />

      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-lime">{city}</p>
      <h1 className="mt-4 font-syne text-4xl font-extrabold uppercase tracking-tight">Check in</h1>

      {error && (
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-accent">
          {error}
        </p>
      )}

      {phase === 'phone' && (
        <form onSubmit={lookup} className="mt-10 flex flex-col gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray">
            Enter your phone number to begin.
          </p>
          <div className={`${wrapperClass} flex items-center gap-3 sm:gap-4`}>
            <CountryCodePicker value={countryCode} onChange={setCountryCode} dark />
            <input
              type="tel"
              required
              autoFocus
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={city === 'Singapore' ? 'XXXX XXXX' : '4XX XXX XXX'}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={busy} className={btnClass}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
        </form>
      )}

      {phase === 'registered' && (
        <div className="mt-10">
          <i className="fa-solid fa-circle-check text-6xl text-brand-lime" aria-hidden />
          <h2 className="mt-6 font-syne text-2xl font-extrabold uppercase tracking-tight">
            You’re already registered{greetName ? `, ${greetName}` : ''}
          </h2>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-gray">
            Welcome back — you’re all set for {city}.
          </p>
        </div>
      )}

      {phase === 'details' && (
        <form onSubmit={register} className="mt-10 flex flex-col gap-8">
          <div className={wrapperClass}>
            <input
              type="text"
              required
              autoFocus
              value={details.fullName}
              onChange={(e) => setDetails({ ...details, fullName: e.target.value })}
              placeholder="FULL NAME *"
              className={inputClass}
            />
          </div>

          <div className={wrapperClass}>
            <input
              type="email"
              required
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              placeholder="EMAIL ADDRESS *"
              className={inputClass}
            />
          </div>

          <div className={`${wrapperClass} relative`}>
            <select
              value={details.gender}
              onChange={(e) => setDetails({ ...details, gender: e.target.value })}
              className={`w-full bg-transparent text-xs sm:text-sm font-bold tracking-[0.15em] uppercase focus:outline-none appearance-none cursor-pointer ${
                details.gender === '' ? 'text-brand-gray' : 'text-brand-white'
              }`}
            >
              <option value="" className="text-brand-black">
                GENDER (OPTIONAL)
              </option>
              <option value="Female" className="text-brand-black">
                Female
              </option>
              <option value="Male" className="text-brand-black">
                Male
              </option>
              <option value="Non-binary" className="text-brand-black">
                Non-binary
              </option>
            </select>
            <i className="fa-solid fa-chevron-down pointer-events-none absolute right-0 top-1 text-[10px] text-brand-gray" />
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gray">
              Date of birth (optional)
            </span>
            <div className={wrapperClass}>
              <input
                type="date"
                value={details.dob}
                onChange={(e) => setDetails({ ...details, dob: e.target.value })}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
          </label>

          <button type="submit" disabled={busy} className={btnClass}>
            {busy ? 'Submitting…' : 'Complete check-in'}
          </button>
        </form>
      )}

      {phase === 'done' && (
        <div className="mt-10">
          <i className="fa-solid fa-circle-check text-6xl text-brand-lime" aria-hidden />
          <h2 className="mt-6 font-syne text-3xl font-extrabold uppercase tracking-tight">
            You’re checked in!
          </h2>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-gray">
            See you at {city}.
          </p>
        </div>
      )}
    </div>
  );
}

const btnClass =
  'w-full rounded-full bg-brand-lime py-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-black transition-colors duration-300 hover:bg-brand-white disabled:opacity-50';
