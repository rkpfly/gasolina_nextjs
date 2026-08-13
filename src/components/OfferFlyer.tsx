"use client";

import { useEffect, useState } from "react";

type OfferSummary = {
  slug: string;
  thumbnail_url: string | null;
};

type OfferFlyerProps = {
  slug: string;
  alt: string;
  unavailableLabel: string;
};

export default function OfferFlyer({ slug, alt, unavailableLabel }: OfferFlyerProps) {
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFlyer() {
      try {
        const response = await fetch("/api/offers", { signal: controller.signal });
        if (!response.ok) return;

        const offers = (await response.json()) as OfferSummary[];
        const offer = offers.find((item) => item.slug === slug);
        setFlyerUrl(offer?.thumbnail_url ?? null);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(`Failed to load the ${slug} flyer`, error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFlyer();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <p className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-brand-white/40">
        Loading flyer...
      </p>
    );
  }

  if (!flyerUrl) {
    return (
      <p className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-brand-white/40">
        {unavailableLabel}
      </p>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={flyerUrl} alt={alt} className="w-full h-auto object-contain" />;
}
