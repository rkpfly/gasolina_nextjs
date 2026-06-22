"use client";

/**
 * Branded neon loaders for Dami Club.
 *  • EqLoader        — equalizer bars (on-brand club vibe), great inline in buttons.
 *  • RingLoader      — neon spinner ring with soft glow.
 *  • FullScreenLoader (default) — flashy-yet-sleek route/page loader.
 *
 * All honour prefers-reduced-motion via the global rule in globals.css.
 */

type Tone = "lime" | "pink" | "blue" | "coral" | "white" | "black";

const TONE_HEX: Record<Tone, string> = {
  lime: "#C6F94B",
  pink: "#FF2E93",
  blue: "#3E6FF5",
  coral: "#FF6B4A",
  white: "#FFFFFF",
  black: "#0A0A0A",
};

const TONE_TEXT: Record<Tone, string> = {
  lime: "text-brand-lime",
  pink: "text-brand-accent",
  blue: "text-brand-blue",
  coral: "text-brand-coral",
  white: "text-white",
  black: "text-brand-black",
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

/* ─── Full-screen branded loader ─────────────────────────────────── */
export default function FullScreenLoader({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-brand-ink animate-backdrop">
      {/* Ambient neon glow behind the mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl animate-glow-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(62,111,245,0.35) 0%, rgba(255,46,147,0.18) 45%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-7">
        <span className="font-display text-2xl font-extrabold uppercase tracking-tighter text-white">
          Louder<span className="text-brand-blue text-glow-blue">.</span>
        </span>

        <EqLoader tone="blue" bars={6} className="text-3xl" />

        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-gray">
          {label}
        </span>
      </div>
    </div>
  );
}
