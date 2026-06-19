"use client";

import { useEffect, useRef, useState } from "react";

interface HtmlFlyerProps {
  /** Path to a self-contained HTML document (e.g. "/offers/hens-flyer.html"). */
  src: string;
  /** The flyer's native width in px (the size it was designed at). */
  baseWidth: number;
  /** The flyer's native height in px. */
  baseHeight: number;
  /** Accessible title for the embedded frame. */
  title?: string;
  className?: string;
}

/**
 * Renders a fixed-size HTML document (a "flyer") inside an iframe and scales it
 * down to fit the available width, preserving its aspect ratio. The frame is
 * display-only — interaction is disabled so it reads as an image.
 */
export default function HtmlFlyer({
  src,
  baseWidth,
  baseHeight,
  title = "Flyer",
  className = "",
}: HtmlFlyerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / baseWidth);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      // aspect-ratio reserves the correct height before (and after) scaling, so
      // there's no layout shift once the iframe measures and appears.
      style={{ aspectRatio: `${baseWidth} / ${baseHeight}` }}
    >
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          aria-label={title}
          loading="lazy"
          tabIndex={-1}
          className="absolute top-0 left-0 border-0 pointer-events-none select-none"
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      )}
    </div>
  );
}
