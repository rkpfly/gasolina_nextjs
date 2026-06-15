import type { Metadata } from "next";
import Link from "next/link";
import FadeUp from "@/components/FadeUp";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Private Events | Dami Club Melbourne",
  description:
    "Host your private event at Dami Club — birthdays, corporate nights, VIP tables and full venue buyouts at The Loft, L3 Nightclubs, Crown, Melbourne.",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const OCCASIONS = [
  {
    num: "01",
    title: "Birthdays",
    desc: "Turn your night into the main event. Private booths, bottle service, and a floor that plays your sound — Nepali bangers, R&B and hip hop.",
  },
  {
    num: "02",
    title: "Corporate & Galas",
    desc: "End-of-year parties, launches and galas with a premium edge. Tailored production, hosting and bar packages for your team.",
  },
  {
    num: "03",
    title: "VIP Tables",
    desc: "Skip the line and own a section. A dedicated host, premium spirits, and the best seats in the room — bottle service handled.",
  },
  {
    num: "04",
    title: "Full Venue Buyout",
    desc: "Take the whole room. The Loft at L3 Nightclubs, exclusively yours for the night, built entirely around your guest list.",
  },
];

const INCLUSIONS = [
  "Dedicated event host & coordinator",
  "Private booth or roped-off section",
  "Custom playlist — Nepali · R&B · Hip Hop",
  "Premium bar & bottle packages",
  "In-house photographer on request",
  "Priority entry for your guest list",
];

const DETAILS = [
  ["Venue", "The Loft · L3 Nightclubs"],
  ["Location", "Crown, Melbourne"],
  ["Capacity", "Sections & full buyouts"],
  ["Availability", "By arrangement"],
];

export default function PrivateEventsPage() {
  return (
    <>
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-screen w-full flex flex-col justify-end bg-brand-black overflow-hidden px-4 sm:px-6 md:px-12 pt-28 md:pt-32 pb-10 md:pb-16">
        {/* Ambient glow + grain */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-1/4 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-brand-lime/10 blur-[120px]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />

        <span className="relative z-10 self-start bg-brand-lime text-brand-black font-bold uppercase tracking-[0.18em] text-[10px] sm:text-xs md:text-sm px-4 py-2">
          Private Hire · The Loft, Crown
        </span>

        <FadeUp className="relative z-10 mt-auto w-full max-w-[1600px] mx-auto">
          <h1 className="font-display font-extrabold uppercase tracking-tighter text-brand-white leading-[0.82] text-[18vw] sm:text-[15vw] md:text-[12vw] lg:text-[11rem]">
            Private
            <br />
            <span className="text-transparent [-webkit-text-stroke:1.5px_#FFFFFF]">
              Events
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-sm md:text-base font-medium text-brand-offwhite/70 leading-relaxed">
            The floor is yours. Birthdays, corporate nights and full venue
            buyouts — hosted with the sound and energy that made Dami Club.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="#inquire"
              className="bg-brand-lime text-brand-black px-8 md:px-10 py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center hover:bg-brand-white transition-colors duration-300 w-full sm:w-auto"
            >
              Plan Your Event
            </Link>
            <Link
              href="#occasions"
              className="border border-brand-white/40 text-brand-white px-8 md:px-10 py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-center hover:bg-brand-white hover:text-brand-black transition-colors duration-300 w-full sm:w-auto"
            >
              View Occasions
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ════════════════ STATEMENT ════════════════ */}
      <section className="flex flex-col justify-center bg-brand-offwhite text-brand-black px-4 sm:px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto w-full">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-8 md:mb-12">
              (01) — The Floor Is Yours
            </p>
          </FadeUp>
          <FadeUp delay={120}>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[1.02] text-[7vw] md:text-[4.4vw] max-w-[20ch]">
              A room built for the night you&apos;ve been{" "}
              <span className="bg-brand-lime px-1.5">planning</span> in your head.
            </h2>
          </FadeUp>
          <FadeUp delay={200}>
            <p className="mt-8 max-w-2xl text-sm md:text-base text-brand-gray leading-relaxed font-medium">
              Whether it&apos;s twenty close friends or a full venue takeover, our
              team handles the booth, the bar and the playlist so you can stay on
              the floor. One point of contact, premium service, and a sound
              system tuned for Nepali, R&amp;B and hip hop.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ OCCASIONS ════════════════ */}
      <section
        id="occasions"
        className="bg-brand-black text-brand-white px-4 sm:px-6 md:px-12 py-20 md:py-28 border-t border-white/10"
      >
        <div className="max-w-[1600px] mx-auto w-full">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-lime mb-3">
              (02) — Occasions
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-4xl md:text-6xl mb-12 md:mb-16">
              However You Celebrate
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {OCCASIONS.map((o, i) => (
              <FadeUp
                key={o.num}
                delay={i * 90}
                className="group bg-brand-black p-8 md:p-10 hover:bg-[#121214] transition-colors duration-500"
              >
                <span className="block text-3xl md:text-4xl font-display font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)] group-hover:[-webkit-text-stroke:1px_#C8F23C] transition-all duration-300 mb-6">
                  {o.num}
                </span>
                <h3 className="text-xl md:text-2xl font-display font-bold uppercase tracking-tighter text-brand-white mb-3">
                  {o.title}
                </h3>
                <p className="text-sm text-brand-gray leading-relaxed font-medium max-w-md">
                  {o.desc}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ INCLUSIONS + DETAILS ════════════════ */}
      <section className="bg-[#0f0f10] text-brand-white px-4 sm:px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-lime mb-3">
              (03) — The Package
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-4xl md:text-6xl mb-10">
              What&apos;s Included
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
              {INCLUSIONS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm md:text-base text-brand-offwhite/85 font-medium border-b border-white/10 pb-5"
                >
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-lime shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={150}>
            <div className="relative border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 h-full">
              <span className="absolute top-0 left-0 w-full h-1 bg-brand-lime" />
              <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-brand-lime mb-6">
                The Details
              </p>
              {DETAILS.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-baseline gap-4 py-4 border-b border-dashed border-white/10 last:border-0"
                >
                  <span className="text-[11px] tracking-[0.16em] uppercase text-brand-gray">
                    {label}
                  </span>
                  <span className="font-display font-bold uppercase tracking-tight text-right text-base md:text-lg text-brand-white">
                    {value}
                  </span>
                </div>
              ))}
              <Link
                href="#inquire"
                className="mt-6 block bg-brand-lime text-brand-black text-center py-4 text-xs font-bold tracking-[0.16em] uppercase hover:bg-brand-white transition-colors"
              >
                Check Availability
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════ INQUIRE ════════════════ */}
      <section
        id="inquire"
        className="bg-brand-white text-brand-black px-4 sm:px-6 md:px-12 py-20 md:py-28 border-t border-brand-border"
      >
        <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <FadeUp>
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-brand-gray mb-4">
              (04) — Enquire
            </p>
            <h2 className="font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-3xl sm:text-4xl md:text-6xl mb-4">
              Let&apos;s Make It
              <br />
              <span className="text-transparent [-webkit-text-stroke:1px_#0A0A0A]">
                Happen
              </span>
            </h2>
            <p className="max-w-md text-sm md:text-base text-brand-gray font-medium leading-relaxed">
              Tell us about your night and our events team will be back to you
              within 24 hours with availability and a tailored package.
            </p>
          </FadeUp>

          <FadeUp delay={150} className="w-full">
            <LeadForm
              formType="private_event_lead"
              fields={["f_name", "l_name", "email", "phone", "total_guests"]}
              buttonText="Request a Callback"
            />
          </FadeUp>
        </div>
      </section>
    </>
  );
}
