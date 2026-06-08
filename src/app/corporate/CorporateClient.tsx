"use client";

import { useEffect, useState } from 'react';
import { MediaAsset } from '@/lib/media';
import MediaSlot from '@/lib/media';
import LeadForm from '@/components/LeadForm';

export default function CorporateClient() {
    // State for media fetching
    const [media, setMedia] = useState<Record<string, MediaAsset>>({});
    const [isLoading, setIsLoading] = useState(true);

    // State for the cinematic image reveal on load
    const [isRevealed, setIsRevealed] = useState(false);

    const capabilities = [
        {
            id: "cap-1",
            icon: "fa-solid fa-building",
            title: "Venue Setup",
            desc: "Access to the most exclusive club spaces, completely transformed to match your corporate branding and specific event requirements.",
            delay: "0ms"
        },
        {
            id: "cap-2",
            icon: "fa-solid fa-microphone-lines",
            title: "AV & Tech Support",
            desc: "State-of-the-art sound systems, dynamic lighting rigs, and giant LED screens perfect for presentations and impactful branding.",
            delay: "100ms"
        },
        {
            id: "cap-3",
            icon: "fa-solid fa-martini-glass-citrus",
            title: "Premium Catering",
            desc: "From elegant canapés to full banquet dinners, our curated catering partners and top-tier mixologists will keep your guests delighted.",
            delay: "200ms"
        },
        {
            id: "cap-4",
            icon: "fa-solid fa-handshake",
            title: "End-to-End Planning",
            desc: "Our dedicated corporate event managers act as an extension of your team, ensuring flawless execution from initial concept to final toast.",
            delay: "300ms"
        }
    ];

    // 1. Fetch Media from your GET Route
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch('/api/media?page=/corporate');
                if (res.ok) {
                    const data = await res.json();
                    setMedia(data);
                }
            } catch (error) {
                console.error("Failed to fetch media:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMedia();
    }, []);

    // 2. Scroll reveal animations (Re-runs when loading state changes)
    useEffect(() => {
        if (isLoading) return; 

        // Trigger the clip-path and zoom reveal slightly after mount
        const revealTimer = setTimeout(() => setIsRevealed(true), 100);

        // Scroll Reveal Animations 
        const fadeElements = document.querySelectorAll('.fade-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        fadeElements.forEach(el => observer.observe(el));

        return () => {
            clearTimeout(revealTimer);
            observer.disconnect();
        };
    }, [isLoading]);


    return (
        <main className="w-full selection:bg-brand-black selection:text-white">
            
            {/* ── HERO SECTION ── */}
            <section className="relative h-[88svh] md:h-[100svh] min-h-[400px] sm:min-h-[450px] w-full md:px-6 lg:px-12 pt-16 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 flex flex-col">
                <div 
                    className={`relative w-full h-full md:rounded-[2rem] overflow-hidden bg-brand-black shadow-xl transition-[clip-path] duration-[1200ms] ease-custom ${
                        isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                    }`}
                >
                    <MediaSlot 
                        id="hero-media" 
                        mediaMap={media} 
                        className={`absolute inset-0 w-full h-full object-cover filter grayscale-[20%] opacity-70 transition-transform duration-[8000ms] ease-out ${
                            isRevealed ? 'scale-100' : 'scale-[1.05]'
                        }`}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end pb-8 sm:pb-12 md:pb-8 px-4 md:px-8 z-20">
                        <div className="fade-up">
                            <span className="inline-block text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white bg-brand-accent px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
                                Unforgettable Experiences
                            </span>
                            <h1 className="text-[26px] min-[360px]:text-3xl sm:text-5xl md:text-7xl lg:text-[8vw] leading-[0.9] font-display font-extrabold uppercase tracking-tighter text-brand-white">
                                Corpo<span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">rate</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TEXT INTRO SECTION ── */}
            <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-white text-center">
                <div className="max-w-4xl mx-auto fade-up">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-black mb-4 sm:mb-6 leading-[0.95]">
                        Redefine Your <br />
                        <span className="text-transparent [-webkit-text-stroke:1px_#0A0A0A] text-brand-gray">Corporate Culture</span>
                    </h2>
                    <div className="w-16 h-[2px] bg-brand-accent mx-auto mb-8"></div>
                    <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-brand-gray leading-relaxed max-w-2xl mx-auto">
                        Elevate your next company milestone, product launch, or end-of-year celebration with Bollywood Club's premier event services. We blend sophisticated execution with unparalleled entertainment.
                    </p>
                </div>
            </section>

            {/* ── CAPABILITIES SECTION ── */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-offwhite">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-center mb-8 sm:mb-12 md:mb-16 fade-up">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-black text-center">
                            Our Capabilities
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {capabilities.map((cap) => (
                            <div 
                                key={cap.id} 
                                className="bg-brand-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-brand-border/50 hover:border-brand-black hover:shadow-lg transition-all duration-300 fade-up group flex flex-col"
                                style={{ transitionDelay: cap.delay }}
                            >
                                <div className="w-full h-32 sm:h-40 mb-4 sm:mb-6 overflow-hidden rounded-lg sm:rounded-xl bg-brand-border/20">
                                    <MediaSlot 
                                        id={cap.id} 
                                        mediaMap={media} 
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                                    />
                                </div>

                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-offwhite flex items-center justify-center text-brand-black text-lg sm:text-xl mb-4 sm:mb-6 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300">
                                    <i className={cap.icon}></i>
                                </div>
                                
                                <h3 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tighter text-brand-black mb-2 sm:mb-3">
                                    {cap.title}
                                </h3>
                                
                                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-brand-gray leading-relaxed flex-1">
                                    {cap.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BOOKING FORM SECTION ── */}
            <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-white border-t border-brand-border">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-stretch">
                    
                    {/* Image Reveal */}
                    <div 
                        className={`w-full lg:w-1/2 relative rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden min-h-[350px] sm:min-h-[450px] md:min-h-[600px] transition-[clip-path] duration-[1200ms] ease-custom ${
                            isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                        }`}
                    >
                        <MediaSlot 
                            id="form-media" 
                            mediaMap={media} 
                            className="absolute inset-0 w-full h-full object-cover filter grayscale-[10%]" 
                        />
                        <div className="absolute inset-0 bg-brand-black/20"></div>
                        
                        <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-6 sm:left-8 md:left-12 mix-blend-difference text-brand-white z-10 pr-4">
                            <h3 className="text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none">
                                Make An <br /> <span className="text-brand-accent">Inquiry</span>
                            </h3>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center py-6 sm:py-8 mt-6 sm:mt-8 lg:mt-0 fade-up" style={{ transitionDelay: '200ms' }}>
                        <div className="max-w-xl w-full mx-auto lg:mx-0">
                            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tighter text-brand-black mb-2">Plan Your Event</h3>
                            <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-8 sm:mb-12">Submit your requirements to our events team.</p>
                            
                            <LeadForm 
                              formType="corporate_inquiry"
                              fields={['f_name', 'l_name', 'company_name', 'email', 'phone', 'city', 'description']}
                              buttonText="Submit Inquiry"
                            />
                        </div>
                    </div>

                </div>
            </section>

        </main>
    );
}