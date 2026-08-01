"use client";

import { useEffect, useState } from 'react';
import { MediaAsset } from '@/lib/media';
import MediaSlot from '@/lib/media';
import LeadForm from '@/components/LeadForm';

export default function VipClient() {
    const [media, setMedia] = useState<Record<string, MediaAsset>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRevealed, setIsRevealed] = useState(false);

    const vipFeatures = [
        { num: "01", title: "Exclusive Lounge", desc: "Your group will enjoy the best seats in the house, strategically positioned for optimal views of the electrifying dance floor and the pulsating beats.", delay: "0ms" },
        { num: "02", title: "Premium Bottles", desc: "Bottle service that steals the show. Sip on top-shelf spirits and let the beats move you while our dedicated staff keep your glasses filled.", delay: "100ms" },
        { num: "03", title: "Fast-Track Entry", desc: "Skip the lines and make a grand entrance. Our priority entry ensures you're in the spotlight immediately. Walk in like you own the place.", delay: "200ms" },
        { num: "04", title: "Bespoke Packages", desc: "Tailor your VIP experience to perfection by choosing from our customizable packages, whether celebrating a milestone or a casual night out.", delay: "300ms" }
    ];

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch('/api/media?page=/vip');
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

    useEffect(() => {
        if (isLoading) return;

        const revealTimer = setTimeout(() => setIsRevealed(true), 100);
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
            fadeElements.forEach(el => observer.unobserve(el));
        };
    }, [isLoading]);

    return (
        <main className="w-full bg-brand-black text-brand-white selection:bg-brand-blue selection:text-brand-white">

            {/* ── HERO SECTION ── */}
            <section className="relative h-[92svh] md:h-[100svh] min-h-[500px] w-full md:px-3 pt-16 md:pt-20 pb-4 md:pb-12 flex flex-col">
                <div
                    className={`relative w-full h-full md:rounded-sm overflow-hidden bg-brand-black shadow-xl transition-[clip-path] duration-[1200ms] ease-custom ${
                        isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                    }`}
                >
                    <MediaSlot
                        id="hero-media"
                        mediaMap={media}
                        className={`absolute inset-0 w-full h-full object-cover filter grayscale mix-blend-screen opacity-60 transition-transform duration-[8000ms] ease-out ${
                            isRevealed ? 'scale-100' : 'scale-[1.05]'
                        }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-end pb-16 px-4 md:px-16 lg:px-24 z-20">
                        <div className="fade-up">
                            <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white bg-brand-blue px-4 py-2 rounded-full mb-6">
                                Bottle Service
                            </span>
                            <h1 className="text-[26px] min-[360px]:text-3xl text-5xl md:text-7xl lg:text-[8vw] leading-[0.9] font-display font-extrabold uppercase tracking-tighter text-brand-white">
                                VIP <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">Tables</span>
                            </h1>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── INTRO TEXT SECTION ── */}
            <section className="pb-12 pt-8 md:py-20 px-6 md:px-12 bg-brand-black text-center">
                <div className="max-w-4xl mx-auto fade-up">
                    <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-white mb-6">
                        Elevate Your Nightlife <br />
                        <span className="text-brand-gray text-2xl md:text-4xl">With Our Exclusive VIP Packages</span>
                    </h2>
                    <div className="w-16 h-[2px] bg-brand-blue mx-auto mb-8"></div>
                    <p className="text-sm md:text-base font-medium text-brand-gray leading-relaxed max-w-3xl mx-auto">
                        Indulge in the ultimate VIP treatment with Louder Club, where luxury meets excitement. Our VIP Booth Package is designed to take your night out to extraordinary heights, offering an exclusive haven for you and your entourage to revel in style and absolute glamour.
                    </p>
                </div>
            </section>

            {/* ── BOOKING FORM SECTION ── */}
            <section className="py-12 px-3 md:px-12 bg-brand-black border-t border-white/10">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-16 items-stretch">

                    {/* 1. Added 'bg-brand-black' here so the box itself is always black */}
                    <div
                        className={`w-full lg:w-1/2 relative bg-brand-black rounded-sm overflow-hidden min-h-[300px] md:min-h-0 md:aspect-[2048/1365] lg:self-start transition-[clip-path] duration-[1200ms] ease-custom ${
                            isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                        }`}
                    >
                        {/* 2. Hidden on mobile, covers the black background on desktop */}
                        <MediaSlot
                            id="form-media"
                            mediaMap={media}
                            className="hidden md:block absolute inset-0 w-full h-[85svh] md:h-full object-cover filter grayscale-[10%]"
                        />

                        {/* Overlay only needed when the image is showing */}
                        <div className="hidden md:block absolute inset-0 bg-brand-black/20"></div>

                        {/* 3. Text is visible ONLY on mobile, resting on the black background */}
                        <div className="absolute bottom-2 left-2 text-brand-white z-10 md:hidden">
                            <h3 className="text-5xl font-display font-extrabold uppercase tracking-tighter leading-none">
                                The <br /> Inner <br /> <span className="text-brand-blue">Circle</span>
                            </h3>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col justify-center py-8 fade-up" style={{ transitionDelay: '200ms' }}>
                        <div className="max-w-xl w-full mx-auto lg:mx-0">
                            <h3 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-brand-white mb-2">Request A Table</h3>
                            <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-12">Secure your premium access.</p>

                            <LeadForm
                                formType="vip_table_request"
                                fields={['f_name', 'l_name', 'email', 'phone', 'total_guests', 'booking_date']}
                                buttonText="Request Table"
                                tone="dark"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* ── FEATURES SECTION ── */}
            <section className="py-24 px-6 md:px-12 bg-[#0f0f10]">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 fade-up">
                        <div className="max-w-2xl">
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-brand-gray mb-4">The VIP Standard</h3>
                            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase text-brand-white leading-[0.9]">
                                Why Settle For <br />
                                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] hover:text-brand-blue hover:[-webkit-text-stroke:0px] transition-colors duration-400 cursor-default">Ordinary?</span>
                            </h2>
                        </div>
                        <div className="mt-6 md:mt-0 max-w-sm">
                            <p className="text-sm font-medium text-brand-gray leading-relaxed">
                                Our package is the real deal, giving you the red carpet treatment you absolutely deserve. Here is what is included.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {vipFeatures.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white/5 border border-white/10 p-10 flex flex-col justify-between min-h-[300px] transition-all duration-[400ms] ease-custom hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] fade-up group"
                                style={{ transitionDelay: feature.delay }}
                            >
                                <div className="mb-8">
                                    <span className="text-5xl font-display font-extrabold text-white/10 group-hover:text-brand-blue transition-colors duration-500">
                                        {feature.num}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-display font-bold uppercase tracking-tighter text-brand-white mb-3">
                                        {feature.title}
                                    </h4>
                                    <p className="text-xs text-brand-gray leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ── PRIVATE EVENTS CTA SECTION ── */}
            <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-brand-black text-brand-white relative overflow-hidden flex items-center justify-center text-center border-t border-white/10">
                <div className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 md:left-1/4 md:translate-x-0 w-64 h-64 md:w-96 md:h-96 bg-brand-blue rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-3xl mx-auto fade-up w-full">
                    <h2 className="flex flex-col items-center text-2xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter leading-[1] md:leading-[0.9] mb-4 md:mb-8">
                        <span>Planning</span>
                        <span>Something</span>
                        <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">Private?</span>
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base font-medium text-brand-gray mb-8 md:mb-12 max-w-xl mx-auto leading-relaxed">
                        Birthdays, corporate nights and full venue buyouts — hosted with the sound and service that made Louder Club. Tell us your night and we&apos;ll build it.
                    </p>
                    <a
                        href="/private-events"
                        className="btn-glow relative inline-flex items-center justify-center bg-brand-blue text-brand-white border border-brand-blue px-6 py-4 md:px-12 md:py-5 rounded-full text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-brand-white hover:border-brand-white hover:text-brand-black w-full sm:w-auto"
                    >
                        <span>Explore Private Events</span>
                    </a>
                </div>
            </section>

        </main>
    );
}
