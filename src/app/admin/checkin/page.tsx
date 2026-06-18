'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ALLOWED_CITIES, type CheckinCity } from '@/app/checkin/cities';

export default function CheckinQrPage() {
  // Base origin for the public check-in links. Pre-filled from the configured
  // app URL (or the current origin) and editable in case you want prod links
  // while developing locally.
  const [base, setBase] = useState('');
  const [qr, setQr] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
    setBase((fromEnv || window.location.origin).replace(/\/$/, ''));
  }, []);

  const linkFor = (city: CheckinCity) => `${base}/checkin?place=${encodeURIComponent(city)}`;

  const generate = async (city: CheckinCity) => {
    setError('');
    try {
      const dataUrl = await QRCode.toDataURL(linkFor(city), {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0A0A0A', light: '#FFFFFF' },
      });
      setQr((prev) => ({ ...prev, [city]: dataUrl }));
    } catch (err) {
      console.error(err);
      setError(`Could not generate QR for ${city}.`);
    }
  };

  const generateAll = () => ALLOWED_CITIES.forEach(generate);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Check-in QR Codes</h2>
        <p className="mt-1 text-sm text-slate-400">
          One self-hosted check-in form per location. Leads are seeded into Zoho flagged as{' '}
          <span className="font-semibold text-emerald-400">DamiClub</span>. Generate a QR per city,
          download it, and print or embed on signage.
        </p>
      </div>

      {/* Base URL control */}
      <label className="mb-6 block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Base URL
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={base}
            onChange={(e) => setBase(e.target.value.replace(/\/$/, ''))}
            placeholder="https://damiclub.com"
            className="flex-1 min-w-[240px] rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={generateAll}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Generate all
          </button>
        </div>
      </label>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ALLOWED_CITIES.map((city) => (
          <div
            key={city}
            className="flex flex-col rounded-lg border border-slate-700 bg-slate-800/60 p-5"
          >
            <h3 className="text-lg font-bold text-slate-100">{city}</h3>

            <a
              href={linkFor(city)}
              target="_blank"
              rel="noreferrer"
              className="mt-1 break-all text-xs text-blue-400 hover:underline"
            >
              {linkFor(city)}
            </a>

            <div className="mt-4 grid aspect-square w-full place-items-center rounded-md border border-dashed border-slate-600 bg-slate-900/40 p-3">
              {qr[city] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr[city]} alt={`Check-in QR for ${city}`} className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-slate-500">No QR generated yet</span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => generate(city)}
                className="flex-1 rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-600"
              >
                {qr[city] ? 'Regenerate' : 'Generate QR'}
              </button>
              {qr[city] && (
                <a
                  href={qr[city]}
                  download={`checkin-${city.toLowerCase()}.png`}
                  className="flex-1 rounded-md bg-emerald-500 px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Download PNG
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
