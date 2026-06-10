import { useState, useRef, useEffect } from 'react';

export default function SmartMarqueeTitle ({ title }: { title: string }) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const textWidth = textRef.current.getBoundingClientRect().width;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        setIsOverflowing(textWidth > containerWidth + 1);
      }
    };

    checkOverflow();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkOverflow);
    }

    const timeout = setTimeout(checkOverflow, 500);

    const resizeObserver = new ResizeObserver(() => checkOverflow());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [title]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden mb-2 group min-w-0">
      
      {/* INVISIBLE MEASURING TAPE */}
      <h3
        ref={textRef}
        className="absolute top-0 left-0 invisible w-max whitespace-nowrap text-2xl font-display font-bold uppercase tracking-tighter"
        aria-hidden="true"
      >
        {title}
      </h3>

      {/* RENDER LOGIC (Always uses text-brand-black now) */}
      {isOverflowing ? (
        <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tighter pr-8 flex-shrink-0 text-brand-white mix-blend-difference">
            {title}
          </h3>
          <h3 className="text-2xl font-display font-bold uppercase tracking-tighter pr-8 flex-shrink-0 text-brand-white mix-blend-difference" aria-hidden="true">
            {title}
          </h3>
        </div>
      ) : (
        <h3 className="text-2xl font-display font-bold uppercase tracking-tighter truncate text-brand-white mix-blend-difference">
          {title}
        </h3>
      )}
    </div>
  );
};