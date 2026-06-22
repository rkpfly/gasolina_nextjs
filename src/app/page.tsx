"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MediaAsset } from "@/lib/media";
import MediaSlot from "@/lib/media";
import LeadForm from "@/components/LeadForm";
import VIPForm from "@/components/Home/VipForm";
import FadeUp from "@/components/FadeUp";

import { fetchActiveThemes } from "@/app/actions/themes";

interface Theme {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  hero_image: string;
  thumbnail_url?: string;
}

// Left-to-right fade so the poster melts into the black hero
const POSTER_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 38%, #000 85%)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function HomePage() {
  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vipModal, setVipModal] = useState(false);

  const sectionRef = useRef(null);

  // 1. Track the scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // "start end" = top of section hits bottom of screen (just entered)
    // "center center" = middle of section hits middle of screen (fully in view)
    offset: ["start end", "center center"] 
  });

  // 2. Map scroll progress (0 to 1) to opacity (0.9 to 0)
  // When it enters, opacity is 0.9. When fully in view, opacity is 0.
  // const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.94, 0.75]);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30, // Higher number = more delay/friction
    restDelta: 0.001
  });

  // 👇 Use the smoothProgress here instead of the raw scrollYProgress
  const overlayOpacity = useTransform(smoothProgress, [0, 1], [0.9, 0.70]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, themesData] = await Promise.all([
          fetch("/api/media?page=/home"),
          fetchActiveThemes(),
        ]);
        if (mediaRes.ok) setMedia(await mediaRes.json());
        setThemes(themesData);
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Screen-by-screen scroll snapping, scoped to the home page only.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("snap-home");
    return () => html.classList.remove("snap-home");
  }, []);

  const featured = themes[0];

  return (
    <>
      <VIPForm vipModal={vipModal} setVipModal={setVipModal} />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen w-full flex flex-col bg-brand-black overflow-hidden snap-start px-4 sm:px-6 md:px-12 pt-28 md:pt-32 pb-10 md:pb-16">
        {/* Hero visual (CMS-driven) — full section height, fading to black toward the left */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-full w-full sm:w-[64%] md:w-[58%] max-w-[720px] z-0"
          style={{ WebkitMaskImage: POSTER_MASK, maskImage: POSTER_MASK }}
        >
          <MediaSlot
            id="hero-video"
            mediaMap={media}
            autoPlayVideo
            className="w-full h-full object-cover"
          />
        </div>
        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />

        {/* Kicker banner (top) */}
        <span className="relative z-10 self-start bg-brand-blue text-brand-white font-bold uppercase tracking-[0.18em] text-[10px] sm:text-xs md:text-sm px-4 py-2 glow-blue">
          A New Clubbing Era Begins
        </span>

        {/* Title block (bottom) */}
        <FadeUp className="relative z-10 mt-auto w-full max-w-[1600px] mx-auto">
          <h1 className="font-display font-extrabold uppercase tracking-tighter text-brand-white leading-[0.82] text-[14vw] sm:text-[11vw] md:text-[9vw] lg:text-[8rem]">
            LOUDER.<br />EVERY SATURDAY
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            {["Club Bangers", "R&B", "Hip Hop"].map((g, i) => (
              <span key={g} className="flex items-center gap-5">
                {i > 0 && <span className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-brand-accent" : "bg-brand-lime"}`} />}
                <span className="text-[11px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-brand-offwhite">
                  {g}
                </span>
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setVipModal(true)}
              className="btn-glow glow-on-blue bg-brand-blue text-brand-white px-8 md:px-10 py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center cursor-pointer hover:bg-brand-white hover:text-brand-black transition-colors duration-300 w-full sm:w-auto"
            >
              <span>Reserve VIP</span>
            </button>
            <Link
              href="#residency"
              className="border border-brand-white/40 text-brand-white px-8 md:px-10 py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center hover:bg-brand-white hover:text-brand-black transition-colors duration-300 w-full sm:w-auto"
            >
              The Residency
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ MARQUEE ════════════════ */}
      <div className="bg-brand-blue border-y border-brand-black overflow-hidden whitespace-nowrap">
        <div className="flex w-max animate-marquee">
          {[0, 1, 2].map((g) => (
            <div key={g} className="flex items-center gap-8 py-3 pr-8 text-brand-white">
              <MarqueeSet />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ STATEMENT ════════════════ */}
      <section className="min-h-screen flex flex-col justify-center bg-brand-offwhite text-brand-black snap-start px-4 sm:px-6 md:px-12 py-20">
        <div className="max-w-[1600px] mx-auto w-full">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-8 md:mb-12">
              (01) — The Movement
            </p>
          </FadeUp>
          <FadeUp delay={120}>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[1.02] text-[7vw] md:text-[4.6vw] max-w-[18ch]">
              Melbourne&apos;s home for{" "}
              <span className="bg-brand-blue text-brand-white px-1.5">louder</span> nights,
              big sound &amp; the crowd that runs it.
            </h2>
          </FadeUp>
          <FadeUp delay={200}>
            <div className="mt-12 md:mt-16 flex flex-wrap gap-8 md:gap-14 border-t border-brand-border pt-8">
              {[
                ["Residency", "Weekly"],
                ["Floor", "L3 Nightclubs"],
                ["Sound", "Club · R&B · Hip Hop"],
                ["City", "Melbourne"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-[11px] tracking-[0.12em] uppercase text-brand-gray">
                    {k}
                  </span>
                  <span className="block font-display font-bold uppercase tracking-tight text-xl md:text-2xl mt-1">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ RESIDENCY ════════════════ */}
      <section
        id="residency"
        className="min-h-screen flex items-center bg-brand-black text-brand-white snap-start px-4 sm:px-6 md:px-12 py-20"
      >
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-blue mb-6">
              (02) — The Residency
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-[16vw] md:text-[7rem] mb-6">
              Every
              <br />
              <span className="text-transparent [-webkit-text-stroke:1.5px_white]">
                Friday
              </span>
            </h2>
            <p className="text-brand-gray leading-relaxed max-w-[44ch] text-sm md:text-base">
              {featured?.short_description ??
                "One night, every week. A curated floor of club bangers cut with R&B and hip hop — built for the people who live for the night. Reserve a table or walk the door."}
            </p>
          </FadeUp>

          <FadeUp delay={150}>
            <div className="relative border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8">
              <span className="absolute top-0 left-0 w-full h-1 bg-brand-blue" />
              {[
                ["Event", featured?.title ?? "Dami Club", false],
                ["When", "Every Friday · 10PM", true],
                ["Venue", "The Loft · L3 Nightclubs", false],
                ["Location", "Crown, Melbourne", false],
                ["Dress", "Smart / Statement", false],
              ].map(([label, value, accent]) => (
                <div
                  key={label as string}
                  className="flex justify-between items-baseline gap-4 py-4 border-b border-dashed border-white/10 last:border-0"
                >
                  <span className="text-[11px] tracking-[0.16em] uppercase text-brand-gray">
                    {label}
                  </span>
                  <span
                    className={`font-display font-bold uppercase tracking-tight text-right text-base md:text-lg ${
                      accent ? "text-brand-blue" : "text-brand-white"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/book"
                  className="btn-glow glow-on-blue flex-1 bg-brand-blue text-brand-white text-center py-4 text-xs font-bold tracking-[0.16em] uppercase hover:bg-brand-white hover:text-brand-black transition-colors"
                >
                  <span>Book Tickets</span>
                </Link>
                <button
                  onClick={() => setVipModal(true)}
                  className="flex-1 border border-white/30 text-brand-white text-center py-4 text-xs font-bold tracking-[0.16em] uppercase hover:bg-brand-white hover:text-brand-black transition-colors cursor-pointer"
                >
                  Request VIP
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ GALLERY / THE NIGHTS ════════════════ */}
      <section className="min-h-screen flex flex-col justify-center bg-[#0f0f10] text-brand-white snap-start px-4 sm:px-6 md:px-12 py-20">
        <div className="max-w-[1600px] mx-auto w-full">
          <FadeUp className="flex justify-between items-end gap-4 flex-wrap mb-10">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-blue mb-3">
                (03) — The Nights
              </p>
              <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-5xl md:text-7xl">
                Inside the Room
              </h2>
            </div>
            <Link
              href="/gallery"
              className="btn-glow glow-on-blue bg-brand-blue text-brand-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.14em] uppercase hover:bg-brand-white hover:text-brand-black transition-colors"
            >
              <span>Full Gallery →</span>
            </Link>
          </FadeUp>

          <FadeUp delay={150} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {["cinematic-1", "cinematic-2"].map((id) => (
              <div
                key={id}
                className="group relative aspect-video overflow-hidden bg-white/5"
              >
                <MediaSlot
                  id={id}
                  mediaMap={media}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ INNER CIRCLE (newsletter) ════════════════ */}
      <section className="flex flex-col lg:flex-row bg-brand-white border-y border-brand-border">
        <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto relative overflow-hidden">
          <MediaSlot
            id="newsletter-visual"
            mediaMap={media}
            autoPlayVideo
            className="w-full h-full object-cover"
          />
        </div>
        <FadeUp className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-24">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-4">
              (04) — Inner Circle
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter text-brand-black text-3xl sm:text-4xl md:text-5xl mb-3">
              Get on the List
            </h2>
            <p className="text-brand-gray font-medium text-xs sm:text-sm mb-8 md:mb-10">
              Priority access to ticket drops, VIP tables, and the next Dami
              Club night — straight to your inbox.
            </p>
            <LeadForm
              formType="home_newsletter"
              fields={["f_name", "l_name", "email", "phone", "city"]}
              buttonText="Join the Club"
            />
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      {/* <section className="min-h-screen flex flex-col items-center justify-center text-center bg-brand-lime text-brand-black snap-start px-4 py-20">
        <FadeUp className="flex flex-col items-center">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-black/60 mb-6">
            Doors open every Friday
          </p>
          <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.84] text-[14vw] md:text-[10rem]">
            See You
            <br />
            On The Floor
          </h2>
          <button
            onClick={() => setVipModal(true)}
            className="mt-10 bg-brand-black text-brand-white px-12 py-4 rounded-full text-sm font-bold tracking-[0.16em] uppercase hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          >
            Reserve Your Spot
          </button>
        </FadeUp>
      </section> */}
      <section 
        ref={sectionRef} 
        className="relative min-h-screen flex flex-col items-center justify-center text-center text-brand-white snap-start px-4 py-20 overflow-hidden"
      >
        
        {/* Background Video Layer */}
        {/* <motion.video
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          className="absolute inset-0 w-full h-full object-cover -z-20"
        >
          <source src="/bg-animate-home.mp4" type="video/mp4" />
        </motion.video> */}

        {/* Dynamic Opacity Color Overlay Layer */}
          <motion.div 
            style={{ opacity: overlayOpacity }} // Opacity controlled by scroll
            className="absolute inset-0 bg-brand-blue -z-10 pointer-events-none"
          ></motion.div>

        {/* Foreground Content */}
        <FadeUp className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-white/70 mb-6">
            Doors open every Friday
          </p>
          <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.84] text-[14vw] md:text-[10rem]">
            See You
            <br />
            On The Floor
          </h2>
          <button
            onClick={() => setVipModal(true)}
            className="mt-10 bg-brand-black text-brand-white px-12 py-4 rounded-full text-sm font-bold tracking-[0.16em] uppercase hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          >
            Reserve Your Spot
          </button>
        </FadeUp>
      </section>
    </>
  );
}

function MarqueeSet() {
  const items = ["Every Friday", "The Loft · L3 Nightclubs", "Crown, Melbourne"];
  return (
    <>
      {items.map((t) => (
        <span key={t} className="flex items-center gap-8">
          <span className="font-display font-extrabold uppercase tracking-wide text-lg">
            {t}
          </span>
          <span className="opacity-40">✦</span>
        </span>
      ))}
    </>
  );
}
