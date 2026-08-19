import Image from "next/image";
import { Bebas_Neue, Libre_Baskerville, Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

type BirthdayBookingPageProps = {
  age: "18th" | "21st";
  formUrl: string;
};

export default function BirthdayBookingPage({
  age,
  formUrl,
}: BirthdayBookingPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#05060b] text-white">
      <section className="relative h-[54vh] min-h-[420px] w-full sm:h-[64vh] md:min-h-[560px]">
        <Image
          src="/bday-hero-bg.png"
          alt="Friends celebrating a birthday together at Gasolina"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-3 text-center sm:px-6 md:px-10">
          <h1
            className={`${oswald.className} flex w-full rotate-0 flex-col items-center bg-transparent uppercase`}
          >
            <span className="block text-[clamp(9rem,24vw,18rem)] font-bold leading-[0.72] tracking-[-0.06em] text-[#f1f3c7]">
              {age}
            </span>
            <span className="relative z-10 -mb-2 -mt-1 block bg-[#e00000] px-3 py-1 text-[clamp(1.35rem,3.2vw,2.4rem)] font-medium leading-none tracking-[0.03em] text-white sm:-mb-3 sm:px-4 sm:py-1.5">
              Happy
            </span>
            <span
              className="block whitespace-nowrap text-[clamp(4.15rem,14.5vw,11.5rem)] font-bold leading-[0.8] tracking-[-0.045em] text-transparent"
              style={{ WebkitTextStroke: "clamp(1.5px, 0.22vw, 3px) #f1f3c7" }}
            >
              Birthday
            </span>
          </h1>
        </div>
      </section>

      <section
        className="bg-gradient-to-b from-[#05060b] via-[#060812] to-[#070a16] px-5 py-16 text-left text-white sm:px-8 sm:py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-4xl">
          <div className={`${bebasNeue.className} tracking-tight leading-[0.1] mb-12 text-center text-[clamp(50px,12vw,150px)] font-bold uppercase leading-[0.9] tracking-[0.02em] md:mb-16 [-webkit-text-stroke:2px_#ff0000]`}>
            <p>Free entry</p>
            <p>Skip the line</p>
          </div>
          <div className="grid gap-8 border-t border-white/20 pt-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-end md:gap-12 md:pt-12">
            <h2 className={`${baskerville.className} text-2xl leading-[1.05] tracking-[-0.03em] sm:text-3xl md:text-4xl`}>
              {age} BIRTHDAY PACKAGE
            </h2>
            <div className={`${bebasNeue.className} self-start space-y-2 text-3xl font-bold uppercase leading-[0.95] tracking-wide sm:text-2xl md:text-left md:text-3xl`}>
              <p>Free entry for you and your mates</p>
              <p>Skip the queue</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070a16] px-3 pb-16 sm:px-6 sm:pb-20 md:px-12 md:pb-24">
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white">
          <iframe
            src={formUrl}
            width="100%"
            height="800"
            title="BOOK YOUR BIRTHDAY"
            loading="lazy"
            className="h-[900px] w-full sm:h-[900px]"
            style={{ border: 0, borderRadius: 16 }}
          />
        </div>
      </section>
    </main>
  );
}
