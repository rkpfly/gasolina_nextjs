"use client";

/**
 * IntroLoader — shows the full GasolinaLoader splash on the FIRST load of the
 * site (once per browser session), then fades out. Subsequent client-side route
 * navigations use the lighter loader in `app/loading.tsx` instead.
 *
 * Mounted once in the root layout. Because the root layout persists across
 * client navigations, this only re-runs on a real (hard) page load.
 */

import { useEffect, useLayoutEffect, useState } from "react";
import GasolinaLoader from "./GasolinaLoader";

// Flip to a longer/shorter minimum on-screen time (ms) for the splash.
const MIN_VISIBLE_MS = 1900;
const FADE_MS = 500;
const SAFETY_CAP_MS = 6000;
const SESSION_KEY = "gasolina_intro_seen";

// useLayoutEffect on the client (hide-if-seen before paint), useEffect on server.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function IntroLoader() {
  // Server + first client render agree on `true` (no hydration mismatch); the
  // effect below immediately hides it for repeat visits in the same session.
  const [show, setShow] = useState(true);
  const [closing, setClosing] = useState(false);

  useIso(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setShow(false);
      return;
    }

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let done = false;

    const dismiss = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      window.setTimeout(() => {
        setClosing(true);
        sessionStorage.setItem(SESSION_KEY, "1");
        document.body.style.overflow = "";
        window.setTimeout(() => setShow(false), FADE_MS);
      }, wait);
    };

    if (document.readyState === "complete") dismiss();
    else window.addEventListener("load", dismiss, { once: true });

    const cap = window.setTimeout(dismiss, SAFETY_CAP_MS);

    return () => {
      window.removeEventListener("load", dismiss);
      window.clearTimeout(cap);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-opacity ease-out ${
        closing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <GasolinaLoader />
    </div>
  );
}
