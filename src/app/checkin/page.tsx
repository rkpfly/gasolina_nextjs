import type { Metadata } from 'next';
import Image from 'next/image';
import { resolveCity } from './cities';
import CheckinForm from './CheckinForm';

export const metadata: Metadata = {
  title: 'Check In | Dami Club',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ place?: string }> };

export default async function CheckinPage({ searchParams }: Props) {
  const { place } = await searchParams;
  const city = resolveCity(place);

  return (
    // Fixed kiosk layer — covers the global footer for a focused check-in screen.
    <div className="fixed inset-0 z-60 bg-brand-black text-brand-white overflow-y-auto">
      <div className="min-h-full grid place-items-center px-6 py-12">
        {city ? (
          <CheckinForm city={city} />
        ) : (
          <div className="flex w-full max-w-md flex-col items-center text-center">
            <Image
              src="/dc-logo-black-v1.png"
              alt="Dami Club"
              width={160}
              height={48}
              priority
              className="mb-10 h-12 w-auto object-contain filter-[brightness(0)_invert(1)]"
            />
            <h1 className="font-syne text-3xl font-extrabold uppercase tracking-tight">
              Check-in unavailable
            </h1>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-gray">
              This check-in link isn’t valid. Please use the link for Melbourne, Sydney, or Singapore.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
