"use client";

/**
 * Branded neon loaders for Dami Club.
 *  • EqLoader        — equalizer bars (on-brand club vibe), great inline in buttons.
 *  • RingLoader      — neon spinner ring with soft glow.
 *  • FullScreenLoader (default) — flashy-yet-sleek route/page loader.
 *
 * All honour prefers-reduced-motion via the global rule in globals.css.
 */

type Tone = "lime" | "pink" | "blue" | "coral" | "white" | "black" | "red";

const TONE_HEX: Record<Tone, string> = {
  lime: "#6CFB13",
  pink: "#B00010",
  blue: "#FF2323",
  coral: "#FF5A2E",
  white: "#FFFFFF",
  black: "#0A0A0A",
  red: "#FF2323",
};

const TONE_TEXT: Record<Tone, string> = {
  lime: "text-brand-lime",
  pink: "text-brand-accent",
  blue: "text-brand-blue",
  coral: "text-brand-coral",
  white: "text-white",
  black: "text-brand-black",
  red: "text-club-red",
};

/* ─── Equalizer bars ─────────────────────────────────────────────── */
export function EqLoader({
  tone = "lime",
  bars = 5,
  className = "",
}: {
  tone?: Tone;
  bars?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`eq-loader ${TONE_TEXT[tone]} ${className}`}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          style={{ animationDelay: `${(i % bars) * 0.11}s` }}
        />
      ))}
    </span>
  );
}

/* ─── Neon ring spinner ──────────────────────────────────────────── */
export function RingLoader({
  size = 28,
  tone = "lime",
  className = "",
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const hex = TONE_HEX[tone];
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: Math.max(2, Math.round(size / 11)),
        borderStyle: "solid",
        borderColor: "rgba(127,127,127,0.18)",
        borderTopColor: hex,
        boxShadow: `0 0 16px -2px ${hex}80`,
      }}
    />
  );
}

/* ─── Full-screen branded loader ─────────────────────────────────────
   Gasolina: gas-station-at-night meets Latin nightclub.
   • Red neon ¡GASOLINA! wordmark (Latin flair + flicker)
   • Equalizer beat (nightclub)
   • Fuel-pump meter filling up (gasoline)                              */
export default function FullScreenLoader({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-brand-ink animate-backdrop overflow-hidden">
      {/* Red ambient glow — the sodium-light haze of a late-night forecourt */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-80 w-80 rounded-full blur-3xl animate-glow-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(255,35,35,0.40) 0%, rgba(176,0,16,0.18) 45%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Latin neon wordmark */}
        <span className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-club-red text-glow-red animate-flicker flex items-center gap-1">
          <span className="text-club-red/60">¡</span>Gasolina<span className="text-club-red/60">!</span>
        </span>

        {/* Nightclub equalizer beat */}
        <EqLoader tone="red" bars={7} className="text-3xl" />

        {/* Gasoline pump meter — fills, resets, repeats */}
        <div className="relative h-1 w-52 sm:w-64 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 w-full bg-club-red animate-fuel"
            style={{ boxShadow: "0 0 12px rgba(255,35,35,0.7)" }}
          />
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-gray">
          {label}
        </span>
      </div>
    </div>
  );
}
