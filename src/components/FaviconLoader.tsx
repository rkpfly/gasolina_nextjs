/**
 * FaviconLoader — lightweight route-transition loader (shown on navigations
 * after the first-visit splash). The site favicon spins three times quickly,
 * pauses, and repeats. See `.animate-spin-thrice` in globals.css.
 */
export default function FaviconLoader({
  label = "Loading",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-6 bg-brand-ink animate-backdrop">
      <img
        src="/favicon.ico"
        alt=""
        aria-hidden
        className="h-14 w-14 animate-spin-thrice [filter:drop-shadow(0_0_10px_rgba(255,35,35,0.4))]"
      />
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-gray">
          {label}
        </span>
      )}
    </div>
  );
}
