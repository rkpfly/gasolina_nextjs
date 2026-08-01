"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MediaAsset } from "@/lib/media";
import MediaSlot from "@/lib/media";
import LeadForm from "@/components/LeadForm";
import VIPForm from "@/components/Home/VipForm";
import FadeUp from "@/components/FadeUp";
import { EventCard } from "@/components/Events/EventCard";
import VipModal from "@/components/Events/VIPModal";
import type { Event, EventsApiResponse } from "@/types/events";

interface Offer {
  id: string;
  slug: string;
  offer_title: string;
  short_description: string;
  thumbnail_url: string;
  category: string;
  expiry_date: string;
}

// Left-to-right fade so the poster melts into the black hero
const POSTER_MASK =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 38%, #000 85%)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function HomePage() {
  const router = useRouter();

  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  const [offers, setOffers] = useState<Offer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [vipModal, setVipModal] = useState(false);
  const [vipModalEvent, setVipModalEvent] = useState<Event | null>(null);

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
  const overlayOpacity = useTransform(smoothProgress, [0, 1], [0.9, 1.0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mediaRes, offersRes] = await Promise.all([
          fetch("/api/media?page=/home"),
          fetch("/api/offers"),
        ]);
        if (mediaRes.ok) setMedia(await mediaRes.json());
        if (offersRes.ok) setOffers(await offersRes.json());
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Upcoming Louder Club events (proxied → tixmojo, filtered by organizerName).
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const query = new URLSearchParams({
          limit: "100",
          sortBy: "basicInfo.date",
          status: "published",
          excludePast: "true",
          publicOnly: "false",
        });
        const res = await fetch(`/api/v1/events?${query.toString()}`);
        if (res.ok) {
          const data: EventsApiResponse = await res.json();
          setEvents(data.data ?? data.events ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Screen-by-screen scroll snapping, scoped to the home page only.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("snap-home");
    return () => html.classList.remove("snap-home");
  }, []);


  // An event is bookable if it's published/active or has a valid publish date.
  const isEventActive = (event: Event) => {
    const hasActiveStatus = event.status === "published" || event.status === "active";
    const hasValidPublishDate = !!event.publishedAt && !isNaN(Date.parse(event.publishedAt));
    return hasActiveStatus || hasValidPublishDate;
  };

  // Build a usable image URL from whatever the backend returns.
  const resolveImage = (event: Event) => {
    const image = event.media?.coverImage || event.media?.thumbnailImage;
    const DB_SOURCE = process.env.NEXT_PUBLIC_TICKETING_BACKEND_URL;
    if (!image)
      return "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop";
    return image.startsWith("http") ? image : `${DB_SOURCE}/${image}`;
  };

  return (
    <>
      {/* Per-event VIP booking modal (self-manages Escape + scroll lock) */}
      {vipModalEvent && (
        <VipModal event={vipModalEvent} onClose={() => setVipModalEvent(null)} />
      )}

      <VIPForm vipModal={vipModal} setVipModal={setVipModal} />

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-[80svh] md:min-h-[90svh] w-full flex flex-col bg-brand-black overflow-hidden snap-start px-4 sm:px-6 md:px-12 pt-28 md:pt-24 pb-6 md:pb-10">
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
          {/* Purple theme tint over the hero video (masked + fades with it) */}
          <div className="absolute inset-0 bg-club-purple/25 mix-blend-overlay" />
        </div>
        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.1] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />

        {/* Kicker banner (top) */}
        <span className="relative z-10 self-start bg-club-purple text-brand-white font-bold uppercase tracking-[0.18em] text-[10px] sm:text-xs md:text-sm px-4 py-2 glow-purple">
          A New Clubbing Era Begins
        </span>

        {/* Title block (bottom) */}
        <FadeUp className="relative z-10 mt-auto w-full max-w-[1600px] mx-auto">
          <h1 className="font-display font-extrabold uppercase tracking-tighter text-brand-white leading-[0.82] text-[8vw] sm:text-[8.5vw] md:text-[9vw] lg:text-[8rem]">
            LOUDER<span className="text-club-green text-glow-green">.</span><br />EVERY <span className="text-club-green text-glow-green">SATURDAY</span>
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            {["DANCE", "POP", "HOUSE"].map((g, i) => (
              <span key={g} className="flex items-center gap-5">
                {i > 0 && <span className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-club-green shadow-[0_0_8px_#6CFB13]" : "bg-club-purple shadow-[0_0_8px_#723CF4]"}`} />}
                <span className="text-[11px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-brand-offwhite">
                  {g}
                </span>
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setVipModal(true)}
              className="btn-glow glow-on-purple bg-club-purple text-brand-white px-8 md:px-10 py-4 text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center cursor-pointer hover:bg-brand-white hover:text-brand-black transition-colors duration-300 w-full sm:w-auto"
            >
              <span>Reserve VIP</span>
            </button>
            <Link
              href="#events"
              className="border border-club-green/50 text-brand-white px-8 md:px-10 py-4 text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center hover:bg-club-green hover:text-brand-black hover:shadow-[0_0_28px_-6px_#6CFB13] transition-all duration-300 w-full sm:w-auto"
            >
              Upcoming Events
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ MARQUEE ════════════════ */}
      <div className="bg-club-purple border-y border-brand-black overflow-hidden whitespace-nowrap">
        <div className="flex w-max animate-marquee">
          {[0, 1, 2].map((g) => (
            <div key={g} className="flex items-center gap-8 py-3 pr-8 text-brand-white">
              <MarqueeSet />
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════ VIP ════════════════ */}
      <section className="relative min-h-screen flex items-center snap-start overflow-hidden bg-brand-black pt-28 md:pt-0 md:py-10">
        {/* Cinematic background */}
        <img
          src="/vip.png"
          alt="Louder Club VIP experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Legibility: uniform scrim on mobile, edge-gradient (clear center) on desktop */}
        <div className="absolute inset-0 bg-brand-black/55 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-brand-black via-transparent to-brand-black" />

        <FadeUp className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-4 md:py-8">
          {/* Mobile: title pinned high, copy + CTA pushed low so the art shows
              between them. Desktop: heading in the top-left corner, CTA in the
              opposite (bottom-right) corner. */}
          <div className="max-w-lg md:max-w-none flex flex-col justify-between min-h-[86svh] pb-12 md:pb-0 md:min-h-[74svh]">
            <div className="md:max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-club-purple mb-4">
                By Invitation Only
              </p>
              <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-brand-white text-[1.9rem] min-[380px]:text-4xl sm:text-5xl md:text-6xl mb-5">
                {/* Mobile: "Rise Above" / "The" / "Ordinary" (3 lines, first line
                    unbreakable). Desktop (md+): each word on its own line (4 lines). */}
                <span className="whitespace-nowrap">
                  Rise<br className="hidden md:inline" /> <span className="text-club-green text-glow-green">Above</span>
                </span>
                <br />
                The<br />
                Ordinary
              </h2>
            </div>
            <div className="md:self-end md:text-right md:max-w-sm md:translate-y-8">
              <p className="text-brand-gray text-sm md:text-base leading-relaxed mb-8">
                Priority entry, private booths, bottle service. Skip the queue and own the room.
              </p>
              <button
                onClick={() => setVipModal(true)}
                className="bg-club-purple text-brand-white px-10 py-4 text-xs md:text-sm font-bold tracking-[0.16em] uppercase hover:bg-club-purple/85 transition-colors cursor-pointer"
              >
                Request VIP Access
              </button>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ OFFERS ════════════════ */}
      {offers.length > 0 && (
        <section className="min-h-screen flex flex-col justify-center bg-brand-black text-brand-white snap-start px-4 sm:px-6 md:px-12 py-20">
          <div className="max-w-[1600px] mx-auto w-full">
            <FadeUp className="flex justify-between items-end gap-4 flex-wrap mb-10">
              <div>
                <p className="text-xs font-semibold tracking-[0.28em] uppercase text-club-purple mb-3">
                  (01) — The Offers
                </p>
                <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-4xl sm:text-5xl md:text-7xl">
                  Offers
                </h2>
              </div>
              <Link
                href="/offers"
                className="btn-glow glow-on-purple bg-club-purple text-brand-white px-6 py-3 text-xs font-bold tracking-[0.14em] uppercase hover:bg-brand-white hover:text-brand-black transition-colors"
              >
                <span>All Offers →</span>
              </Link>
            </FadeUp>

            <FadeUp
              delay={150}
              className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  href={`/offers/${offer.slug}`}
                  className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[340px] flex flex-col group"
                >
                  {/* Image */}
                  <div className="aspect-[4/5] w-full overflow-hidden relative mb-4 bg-white/5">
                    <img
                      src={offer.thumbnail_url}
                      alt={offer.offer_title}
                      className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                    {offer.category && (
                      <span className="absolute top-3 left-3 z-10 bg-brand-black/80 backdrop-blur-sm text-brand-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5">
                        {offer.category}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg md:text-xl font-display font-bold uppercase tracking-tighter text-brand-white mb-2 group-hover:text-transparent group-hover:[-webkit-text-stroke:1px_#FFFFFF] transition-colors duration-300">
                    {offer.offer_title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-brand-gray leading-relaxed font-medium mb-4 line-clamp-2">
                    {offer.short_description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-brand-white/50 font-bold">
                      {offer.expiry_date
                        ? `Expires ${new Date(offer.expiry_date).toLocaleDateString()}`
                        : "Ongoing"}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-club-green group-hover:text-brand-white transition-colors">
                      View Details &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </FadeUp>
          </div>
        </section>
      )}

      {/* ════════════════ JOIN THE TEAM (careers CTA) ════════════════ */}
      <section className="flex min-h-[50svh] sm:min-h-[55svh] md:min-h-[60svh] bg-brand-white border-y border-brand-border">
        <FadeUp className="w-full flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-24">
          <div className="w-full max-w-md text-center">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-4">
              (02) — Join the Team
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter text-brand-black text-3xl sm:text-4xl md:text-5xl mb-3">
              Join the team
            </h2>
            <p className="text-brand-gray font-medium text-xs sm:text-sm mb-8 md:mb-10">
              Want to run the night with us? Bar, security, promo, hosting and more
              — bring the energy, we&apos;ll bring the stage.
            </p>
            <Link
              href="/careers#apply"
              className="btn-glow glow-on-purple inline-block bg-club-purple text-brand-white px-10 py-4 text-xs md:text-sm font-bold tracking-[0.16em] uppercase hover:bg-brand-black transition-colors"
            >
              <span>Join the team</span>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ EVENTS / THE LINEUP ════════════════ */}
      <section
        id="events"
        className="min-h-screen flex flex-col justify-center bg-brand-black text-brand-white snap-start px-4 sm:px-6 md:px-12 py-20"
      >
        <div className="max-w-[1600px] mx-auto w-full">
          <FadeUp className="flex justify-between items-end gap-4 flex-wrap mb-10">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-club-purple mb-3">
                (03) — The Lineup
              </p>
              <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-3xl min-[360px]:text-4xl sm:text-5xl md:text-7xl">
                Weekly Every Saturday
              </h2>
            </div>
            <Link
              href="/events"
              className="btn-glow glow-on-purple bg-club-purple text-brand-white px-6 py-3 text-xs font-bold tracking-[0.14em] uppercase hover:bg-brand-white hover:text-brand-black transition-colors"
            >
              <span>All Events →</span>
            </Link>
          </FadeUp>

          <FadeUp delay={150}>
            {isEventsLoading ? (
              <div className="w-full py-20 text-center text-brand-gray font-bold tracking-[0.15em] uppercase text-xs sm:text-sm">
                Loading events…
              </div>
            ) : events.length === 0 ? (
              <div className="w-full py-20 text-center text-brand-gray font-bold tracking-[0.15em] uppercase text-xs sm:text-sm">
                No upcoming events right now — check back soon.
              </div>
            ) : (
              <div className="border-t border-white/10 pt-10">
                {/* Season lead-in */}
                <div className="mb-12 max-w-[38ch]">
                  {/* <p className="text-xs font-semibold tracking-[0.28em] uppercase text-club-purple mb-5">
                    The Season
                  </p> */}
                  <p className="text-brand-gray text-sm md:text-base leading-relaxed">
                    Starting{" "}
                    <span className="text-brand-white font-semibold">22 August</span>
                    {" "}— Saturday night, every week, one home for the movement.
                  </p>
                </div>

                {/* All upcoming events — horizontal scroll */}
                <div className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {events.map((event, index) => (
                    <div
                      key={event._id || index}
                      className="shrink-0 w-[260px] sm:w-[300px] md:w-[320px] snap-start"
                    >
                      <EventCard
                        event={event}
                        isActive={isEventActive(event)}
                        imgSrc={resolveImage(event)}
                        delay={`${(index % 4) * 100}ms`}
                        onReserve={() => router.push(`/events/${event._id}`)}
                        onBookVIP={() => setVipModalEvent(event)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ INNER CIRCLE (newsletter) ════════════════ */}
      <section className="flex min-h-[50svh] sm:min-h-[55svh] md:min-h-[60svh] bg-[#BFC9D1] border-b border-brand-border">
        <FadeUp className="w-full flex items-center justify-center p-6 sm:p-10 md:p-16 lg:p-24">
          <div className="w-full max-w-md text-center">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-4">
              Inner Circle
            </p>
            <h3 className="font-display font-extrabold uppercase tracking-tighter text-brand-black text-2xl sm:text-3xl md:text-4xl mb-3">
              Get on the List
            </h3>
            <p className="text-brand-gray font-medium text-xs sm:text-sm mb-8 md:mb-10">
              Priority access to ticket drops, VIP tables, and the next Louder
              Club night — straight to your inbox.
            </p>
            <div className="text-left">
              <LeadForm
                formType="home_newsletter"
                fields={["f_name", "l_name", "email", "phone", "dob"]}
                buttonText="Join the Club"
              />
            </div>
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
            className="absolute inset-0 bg-[#462C7D] -z-10 pointer-events-none"
          ></motion.div>

        {/* Foreground Content */}
        <FadeUp className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-white/70 mb-6">
            Doors open every Saturday
          </p>
          <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.84] text-[14vw] md:text-[10rem]">
            See You
            <br />
            On The Floor
          </h2>
          <button
            onClick={() => setVipModal(true)}
            className="mt-10 bg-brand-black text-brand-white px-12 py-4 text-sm font-bold tracking-[0.16em] uppercase border border-club-green/40 shadow-[0_0_30px_-6px_#6CFB13] hover:-translate-y-1 hover:shadow-[0_0_46px_-6px_#6CFB13] transition-all duration-300 cursor-pointer"
          >
            Reserve Your Spot
          </button>
        </FadeUp>
      </section>
    </>
  );
}

function MarqueeSet() {
  const items = ["Every Saturday", "Therapy · L3 Nightclubs", "Crown, Melbourne"];
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
