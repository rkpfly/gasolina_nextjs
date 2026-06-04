"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-block border border-brand-black px-12 py-5 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-brand-black hover:bg-brand-black hover:text-brand-white transition-colors"
    >
      ← Back to The Journal
    </button>
  );
}