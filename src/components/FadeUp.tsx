"use client";

import { useEffect, useRef, useState } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FadeUp({ children, className = "", delay = 0 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Standard Observer Setup
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0, rootMargin: "50px" }
    );

    if (ref.current) observer.observe(ref.current);

    // 2. THE FIX: The Scroll Restoration Safety Net
    // Wait 150ms for Next.js/Browser to restore the scroll position, 
    // then manually check if the element is currently visible.
    const safetyCheck = setTimeout(() => {
      if (ref.current && !isVisible) {
        const rect = ref.current.getBoundingClientRect();
        // Check if the element is within the vertical viewport bounds
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setIsVisible(true);
          observer.disconnect();
        }
      }
    }, 150);

    return () => {
      observer.disconnect();
      clearTimeout(safetyCheck);
    };
  }, [isVisible]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}