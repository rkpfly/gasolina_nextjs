import Image from "next/image";
import { Bebas_Neue, Libre_Baskerville, Margarine } from "next/font/google";

const margarine = Margarine({
  subsets: ["latin"],
  weight: "400",
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
        <div className="absolute inset-0 flex items-center justify-center px-5 text-center sm:px-8 md:px-12">
          <h1
            className={`${margarine.className} -rotate-2 bg-white px-5 py-4 text-4xl leading-[0.76] tracking-[0.025em] text-black sm:px-8 sm:py-5 sm:text-6xl md:text-7xl lg:text-8xl`}
          >
            <span className="block lowercase">{age}</span>
            <span className="block uppercase">Happy</span>
            <span className="block uppercase">Birthday</span>
          </h1>
        </div>
      </section>

      <section
        className="bg-gradient-to-b from-[#05060b] via-[#060812] to-[#070a16] px-5 py-16 text-left text-white sm:px-8 sm:py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-4xl">
          <div className={`${bebasNeue.className} mb-12 text-center text-5xl font-bold uppercase leading-[0.9] tracking-[0.02em] sm:text-5xl md:mb-16 md:text-7xl [-webkit-text-stroke:2px_#ff0000]`}>
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
