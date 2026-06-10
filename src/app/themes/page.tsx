import Link from "next/link";
import FadeUp from "@/components/FadeUp";
import { getThemes } from "@/lib/database/db";

export const metadata = {
  title: "Signature Themes | Bollywood Club",
  description: "Explore our curated selection of premium nightlife experiences and signature themes.",
};

export default async function ThemesIndexPage() {
  // Fetch themes directly on the server
  const themes = await getThemes();

  return (
    <div className="min-h-screen bg-brand-black text-white">
      {/* ── Hardcoded Hero Section ── */}
      <section className="relative h-[50vh] md:h-[60vh] w-full flex flex-col justify-end pb-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop" 
            alt="Signature Themes" 
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay to blend seamlessly into the black background below */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-black/20" />
        </div>

        <FadeUp className="relative z-10 px-4 md:px-12 max-w-[1600px] mx-auto w-full text-center">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-tighter uppercase text-white mb-4">
            Signature Themes
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-lg font-medium leading-relaxed tracking-[0.1em] uppercase">
            Curated premium nightlife experiences spanning the globe.
          </p>
        </FadeUp>
      </section>

      {/* ── Dynamic Themes Grid ── */}
      <section className="py-12 md:py-24 px-4 sm:px-6 md:px-12 w-full">
        <div className="max-w-[1600px] mx-auto">
          {themes.length === 0 ? (
            <div className="py-20 text-center text-white/50 tracking-widest text-sm uppercase">
              No themes currently active.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {themes.map((theme, index) => (
                <FadeUp 
                  key={theme.id} 
                  delay={index * 100} // Stagger the animation slightly for each card
                  className="h-full w-full"
                >
                  <Link 
                    href={`/themes/${theme.slug}`} 
                    className="group relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] flex flex-col justify-end overflow-hidden cursor-pointer rounded-xl md:rounded-[2rem] border border-white/5 hover:border-white/20 transition-all duration-500"
                  >
                    {/* Background Image: using thumbnail if present, fallback to hero */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${theme.thumbnail_url || theme.hero_image})` }}
                    />
                    
                    {/* Overlays for depth and readability */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
                    
                    {/* Card Content */}
                    <div className="relative z-10 p-6 md:p-8 lg:p-12 w-full flex flex-col items-start text-left">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-white mb-3 group-hover:text-brand-accent transition-colors duration-300">
                        {theme.title}
                      </h2>
                      
                      <p className="text-xs sm:text-sm md:text-base font-medium text-white/80 max-w-md mb-6 line-clamp-2 md:line-clamp-3">
                        {theme.short_description}
                      </p>
                      
                      {/* Action Button/Link */}
                      <div className="inline-flex items-center gap-2 text-white text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border-b border-white/30 pb-1 group-hover:border-white transition-colors mt-auto">
                        Explore Theme <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}