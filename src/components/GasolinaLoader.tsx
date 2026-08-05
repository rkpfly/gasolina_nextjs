"use client";

/**
 * GasolinaLoader — a full-screen route/page loader.
 *
 * Retro 1970s Latin-American gas pump meets nightclub neon:
 *  • A glowing fuel droplet travels up the hose and "powers" the pump sign.
 *  • The GASOLINA wordmark ignites letter-by-letter like real neon, then buzzes.
 *  • A red equalizer keeps the club beat under an ambient forecourt haze.
 *
 * CSS-only (GPU transform/opacity), responsive, and reduced-motion safe.
 * All animation lives in GasolinaLoader.module.css.
 */

import type { CSSProperties } from "react";
import styles from "./GasolinaLoader.module.css";

const WORD = "GASOLINA";

export default function GasolinaLoader({
  label = "Setting the mood",
}: {
  label?: string;
}) {
  return (
    <div className={styles.root} role="status" aria-label="Loading">
      <div className={styles.haze} aria-hidden />

      <div className={styles.stack}>
        {/* ── Neon wordmark: ignites letter by letter ── */}
        <div className={styles.word} aria-hidden>
          {/* <span className={styles.bang}>¡</span> */}
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              className={styles.letter}
              style={{ "--i": i } as CSSProperties}
            >
              {ch}
            </span>
          ))}
          {/* <span className={styles.bang}>!</span> */}
        </div>

        {/* ── Retro pump + hose + traveling droplet (disabled) ── */}
        {false && (
        <svg
          className={styles.scene}
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="gasBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FDFBD4" />
              <stop offset="1" stopColor="#E9E2B0" />
            </linearGradient>
            <linearGradient id="gasBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#26262b" />
              <stop offset="1" stopColor="#0e0e11" />
            </linearGradient>
          </defs>

          {/* ground shadow + puddle reflection */}
          <ellipse cx="106" cy="224" rx="78" ry="8" fill="#000" opacity="0.5" />
          <ellipse cx="196" cy="214" rx="18" ry="4" fill="#FF2323" opacity="0.18" />

          {/* base plinth */}
          <rect x="52" y="198" width="108" height="24" rx="6" fill="url(#gasBase)" />
          <rect x="52" y="198" width="108" height="4" rx="2" fill="#FF2323" opacity="0.55" />

          {/* pump body */}
          <rect x="64" y="52" width="84" height="150" rx="12" fill="url(#gasBody)" stroke="#B00010" strokeWidth="3" />

          {/* top neon sign */}
          <g className={styles.sign}>
            <rect x="60" y="34" width="92" height="26" rx="6" fill="#B00010" />
            <rect x="60" y="34" width="92" height="26" rx="6" fill="none" stroke="#FF3A3A" strokeWidth="1.5" opacity="0.7" />
            <text x="106" y="52" textAnchor="middle" fontFamily="var(--font-syne), sans-serif" fontSize="10" fontWeight="800" letterSpacing="1" fill="#FDFBD4">
              GASOLINA
            </text>
          </g>

          {/* display screen with ticking price wheels */}
          <rect x="76" y="72" width="60" height="36" rx="4" fill="#0A0A0A" stroke="#ffffff" strokeOpacity="0.12" />
          {[0, 1, 2, 3].map((n) => (
            <rect
              key={n}
              className={styles.wheel}
              x={84 + n * 12}
              y="80"
              width="7"
              height="20"
              rx="1.5"
              fill="#FF2323"
              opacity="0.85"
              style={{ animationDelay: `${n * 0.14}s` }}
            />
          ))}

          {/* accent stripe + LED */}
          <rect x="64" y="120" width="84" height="7" fill="#FF2323" opacity="0.9" />
          <circle className={styles.led} cx="106" cy="146" r="6" fill="#FF3A3A" />

          {/* holster where the hose exits the body */}
          <rect x="146" y="98" width="16" height="30" rx="4" fill="#2a2a2e" />

          {/* fuel hose */}
          <path d="M156 118 C 200 124, 214 166, 196 196" stroke="#2a0a0d" strokeWidth="7" strokeLinecap="round" />
          <path d="M156 118 C 200 124, 214 166, 196 196" stroke="#FF2323" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />

          {/* nozzle */}
          <rect x="186" y="188" width="20" height="9" rx="2.5" fill="#37373d" />
          <rect x="202" y="190" width="8" height="4" rx="1" fill="#1c1c20" />

          {/* traveling droplet (animated up the hose) */}
          <circle className={styles.droplet} cx="0" cy="0" r="3.4" fill="#FF5A2E" />
        </svg>
        )}

        {/* ── Nightclub equalizer ── */}
        <div className={styles.eq} aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} style={{ animationDelay: `${(i % 7) * 0.11}s` }} />
          ))}
        </div>

        <span className={styles.label}>{label}</span>
      </div>

      <div className={styles.scanline} aria-hidden />
    </div>
  );
}
