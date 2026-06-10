import { useState, useRef } from 'react';
import type { Event } from '@/types/events';
import SmartMarqueeTitle from '@/components/SmartMarqueeTitle';

interface EventCardProps {
  event: Event;
  isActive: boolean;
  imgSrc: string;
  delay: string;
  onReserve: () => void;
  onBookVIP: () => void;
}

export function EventCard({ event, isActive, imgSrc, delay, onReserve, onBookVIP }: EventCardProps) {
  const [tapActive, setTapActive] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mobile tap: toggle the split overlay on image tap (not zone tap)
  const handleImageTap = (e: React.MouseEvent) => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (!isTouchDevice || !isActive) return;
    setTapActive((prev) => !prev);
  };

  // Close on blur (mobile: tap outside)
  const handleBlur = () => setTapActive(false);

  return (
    <div
      className="group flex flex-col"
      style={{ transitionDelay: delay }}
      onBlur={handleBlur}
    >
      {/* ── Image container ── */}
      <div
        ref={wrapperRef}
        onClick={handleImageTap}
        className={`
          w-full max-w-[350px] mx-auto aspect-square overflow-hidden bg-brand-offwhite mb-6 relative
          ${isActive ? 'cursor-pointer' : ''}
        `}
      >
        {/* Sold out overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-brand-black/20 z-10" />
        )}

        {/* Badges */}
        {event.badge && (
          <div className={`absolute ${isActive ? 'top-4 left-4 bg-brand-accent text-white px-3 py-1.5' : 'inset-0 flex items-center justify-center'} z-20`}>
            <span className={`${!isActive ? 'bg-brand-black text-brand-white px-4 py-2' : ''} text-[10px] uppercase font-bold tracking-[0.2em]`}>
              {String(event.badge)}
            </span>
          </div>
        )}

        {/* Image — blurs on hover (desktop) or tap (mobile) */}
        <img
          src={imgSrc}
          alt={event.basicInfo?.name ?? 'Event'}
          className={`
            w-full h-full object-cover transition-all duration-300 ease-custom
            ${!isActive ? 'grayscale opacity-70' : ''}
            ${isActive ? `group-hover:blur-sm group-hover:brightness-75 group-hover:scale-105
                          ${tapActive ? 'blur-sm brightness-75 scale-105' : ''}` : ''}
          `}
        />

        {/* ── Split zones (active events only) ── */}
        {isActive && (
          <>
            {/* Vertical divider */}
            <div
              className={`
                absolute top-[15%] bottom-[15%] left-1/2 w-px bg-white/40 z-30 pointer-events-none
                transition-opacity duration-300
                ${tapActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:delay-500'}
              `}
            />

            {/* VIP — left half */}
            <button
              onClick={(e) => { e.stopPropagation(); onBookVIP(); }}
              className={`
                absolute inset-y-0 left-0 w-1/2 z-25 flex flex-col items-center justify-center gap-1.5
                border-r border-white/25 bg-black/0 hover:bg-black/20
                transition-all duration-300
                ${tapActive
                  ? 'opacity-100 bg-black/15'
                  : 'opacity-0 group-hover:opacity-100 group-hover:delay-500'}
              `}
            >
              <div className="w-8 h-8 rounded-full border border-white/70 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 stroke-white fill-none" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </div>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white leading-tight text-center">
                Book<br />VIP
              </span>
            </button>

            {/* Tickets — right half */}
            <button
              onClick={(e) => { e.stopPropagation(); onReserve(); }}
              className={`
                absolute inset-y-0 right-0 w-1/2 z-25 flex flex-col items-center justify-center gap-1.5
                bg-black/0 hover:bg-black/20
                transition-all duration-300
                ${tapActive
                  ? 'opacity-100 bg-black/10'
                  : 'opacity-0 group-hover:opacity-100 group-hover:delay-[600ms]'}
              `}
            >
              <div className="w-8 h-8 rounded-full border border-white/70 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 stroke-white fill-none" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="10" rx="1" />
                  <path d="M16 7v10M8 7v10" />
                </svg>
              </div>
              <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white leading-tight text-center">
                Reserve<br />Tickets
              </span>
            </button>
          </>
        )}
      </div>

      {/* ── Card body (unchanged) ── */}
      <div className={`flex flex-col flex-1 text-white mix-blend-difference`}>
        <SmartMarqueeTitle title={event.basicInfo?.name ?? 'Event'} />

        <p className={`text-xs font-bold tracking-[0.15em] uppercase mb-1`}>
          {event.basicInfo?.date
            ? new Date(event.basicInfo.date).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
            : '—'}
        </p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray mb-4">
          {event.basicInfo?.city ?? event.basicInfo?.location}
        </p>
        <p className={`text-sm font-medium mb-6 flex-1`}>
          {event.basicInfo?.venue}
        </p>

        {isActive ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={onReserve}
              className="relative inline-flex items-center justify-center w-full py-3 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-center bg-brand-black text-white hover:bg-gray-800 transition-all duration-300"
            >
              Reserve Tickets
            </button>
            <button
              onClick={onBookVIP}
              className="relative inline-flex items-center justify-center w-full py-3 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-center bg-transparent text-brand-white border border-brand-white hover:bg-brand-offwhite transition-all duration-300"
            >
              Book VIP
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-3 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-center bg-brand-offwhite text-brand-gray cursor-not-allowed mt-auto"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}