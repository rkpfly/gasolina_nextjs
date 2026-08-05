"use client";

// DEV-ONLY preview to compare the two loaders. Visit /loader-preview.
// Safe to delete when you're done tuning them.
import { useEffect, useState } from "react";
import GasolinaLoader from "@/components/GasolinaLoader";
import FaviconLoader from "@/components/FaviconLoader";

type Which = "gasolina" | "favicon" | null;

export default function LoaderPreviewPage() {
  const [active, setActive] = useState<Which>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const replayIntro = () => {
    sessionStorage.removeItem("gasolina_intro_seen");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Loader Preview</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Click a card to view it full-screen. Press Esc or the ✕ to close.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => setActive("gasolina")}
          className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-6 text-left"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red mb-2">
            First visit
          </div>
          <div className="text-lg font-bold">Gasolina Splash</div>
          <p className="text-neutral-400 text-sm mt-1">
            Full neon intro — wordmark ignites, equalizer, haze. Shown once per session.
          </p>
        </button>

        <button
          onClick={() => setActive("favicon")}
          className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-6 text-left"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red mb-2">
            Route changes
          </div>
          <div className="text-lg font-bold">Favicon Spinner</div>
          <p className="text-neutral-400 text-sm mt-1">
            Favicon spins three times, pauses, repeats. Shown on navigations.
          </p>
        </button>
      </div>

      <button
        onClick={replayIntro}
        className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300 underline underline-offset-4 hover:text-white"
      >
        Replay real intro on home →
      </button>

      {/* Full-screen preview overlay */}
      {active && (
        <>
          {active === "gasolina" ? (
            <GasolinaLoader />
          ) : (
            <FaviconLoader label="Loading" />
          )}
          <button
            onClick={() => setActive(null)}
            aria-label="Close preview"
            className="fixed top-5 right-5 z-[10001] h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-xl leading-none flex items-center justify-center"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}
