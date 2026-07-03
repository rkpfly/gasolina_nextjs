"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LeadForm from '@/components/LeadForm';

// Define the shape of our Section data based on the DB schema
interface Section {
    id: number;
    section_id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
}

const PAGE_ID = 3; // The ID for the Contact Page

// Helper function to style the last word of a title dynamically
const formatTitle = (title?: string) => {
    if (!title) return { main: '', last: '' };
    const words = title.trim().split(' ');
    const last = words.pop() || '';
    const main = words.join(' ');
    return { main, last };
};

export default function ContactClient() {
    // ── Data & Animation State ──
    const [sections, setSections] = useState<Record<string, Section>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isRevealed, setIsRevealed] = useState(false);

    // 1. Fetch Dynamic Page Data
    useEffect(() => {
        const fetchPageData = async () => {
            try {
                // Adjust this URL to match your public-facing GET route for sections
                const res = await fetch(`/api/v1/sections?pageId=${PAGE_ID}`);
                if (res.ok) {
                    const data: Section[] = await res.json();
                    // Convert array to a keyed object for easy access
                    const sectionMap = data.reduce((acc, curr) => ({ ...acc, [curr.section_id]: curr }), {});
                    setSections(sectionMap);
                }
            } catch (error) {
                console.error("Failed to fetch contact page data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPageData();
    }, []);

    // 2. Scroll reveal animations (Wait for loading to finish)
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
            observer.disconnect();
        };
    }, [isLoading]);

    // 3. Deep-link support: once data has loaded, honor a #hash (e.g. /contact#faq)
    //    arriving from another page — the target section isn't in the DOM until then,
    //    so the browser's initial hash scroll finds nothing and is lost.
    useEffect(() => {
        if (isLoading) return;
        const id = window.location.hash.slice(1);
        if (!id) return;
        const t = setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(t);
    }, [isLoading]);

    if (isLoading) {
        // Simple fallback while data loads to prevent layout shift
        return <div className="min-h-screen bg-brand-black" />;
    }

    // Safely extract section data with fallbacks
    const hero = sections['hero'];
    const contactInfo = sections['contact_info'];
    const faqs = sections['faqs'];

    const heroTitle = formatTitle(hero?.title || 'Get In Touch');
    const contactTitle = formatTitle(contactInfo?.title || 'How Can We Help?');
    const faqTitle = formatTitle(faqs?.title || 'FAQ Quick Answers');

    return (
        <main className="w-full bg-brand-black text-brand-white selection:bg-brand-blue selection:text-brand-white">

            {/* ── HERO SECTION ── */}
            <section className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 flex flex-col">
                <div
                    className={`relative w-full h-[60vh] sm:h-[65vh] md:h-[65vh] min-h-[450px] sm:min-h-[500px] rounded-lg md:rounded-[2rem] overflow-hidden bg-brand-black shadow-2xl transition-[clip-path] duration-[1200ms] ease-custom ${
                        isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                    }`}
                >
                    {/* Render Image or Video based on Metadata */}
                    {hero?.metadata?.mediaType === 'video' ? (
                        <video
                            src={hero?.metadata?.mediaUrl}
                            autoPlay muted loop playsInline
                            className={`absolute inset-0 w-full h-full object-cover filter grayscale opacity-50 transition-transform duration-[10000ms] ease-out ${
                                isRevealed ? 'scale-100' : 'scale-[1.15]'
                            }`}
                        />
                    ) : (
                        <img
                            src={hero?.metadata?.mediaUrl || "https://images.unsplash.com/photo-1576525865260-9f0e7cfb02b3?q=80&w=1600&auto=format&fit=crop"}
                            alt={hero?.metadata?.altText || "Contact Us Background"}
                            className={`absolute inset-0 w-full h-full object-cover filter grayscale opacity-50 transition-transform duration-[10000ms] ease-out ${
                                isRevealed ? 'scale-100' : 'scale-[1.15]'
                            }`}
                        />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-brand-black/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-black/60 via-transparent to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-12 lg:p-20 z-20">
                        <div className="fade-up max-w-4xl">
                            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                                <span className="inline-block text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white bg-brand-blue px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full shadow-lg">
                                    Support & Inquiries
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl leading-[1.1] font-display font-extrabold uppercase tracking-tighter text-brand-white">
                                {heroTitle.main} <br className="md:hidden" />
                                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] py-[0.15em] inline-block ml-3 md:ml-4">
                                    {heroTitle.last}
                                </span>
                            </h1>

                            <p className="mt-3 md:mt-4 text-brand-white/80 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium max-w-lg leading-relaxed border-l-2 border-brand-blue pl-3 md:pl-4">
                                {hero?.content}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTACT INFO & FORM SECTION ── */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-black">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 md:gap-16 lg:gap-24">

                    {/* Left: Contact Info */}
                    <div className="lg:col-span-5 fade-up">
                        <div className="lg:sticky lg:top-32">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tighter uppercase leading-[0.9] text-brand-white mb-3 sm:mb-4 md:mb-6">
                                {contactTitle.main} <br />
                                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] hover:text-brand-blue hover:[-webkit-text-stroke:0px] transition-all duration-400 cursor-default">
                                    {contactTitle.last}
                                </span>
                            </h2>
                            <p className="text-[9px] sm:text-xs md:text-sm font-medium text-brand-gray leading-relaxed mb-6 sm:mb-8 md:mb-12 max-w-md">
                                {contactInfo?.content}
                            </p>

                            <div className="flex flex-col gap-3 sm:gap-4">
                                {contactInfo?.metadata?.items?.map((info: any, i: number) => (
                                    <div
                                        key={i}
                                        className="group bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl md:rounded-2xl flex items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6 cursor-pointer transition-all duration-[400ms] ease-custom hover:bg-white/10 hover:border-white/20 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                                    >
                                        <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-white mt-0.5 sm:mt-1 transition-colors duration-300 group-hover:text-brand-blue flex-shrink-0">
                                            <i className={info.icon}></i>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-brand-white mb-1 sm:mb-2">
                                                {info.title}
                                            </h4>
                                            <p className="text-[8px] sm:text-[9px] md:text-xs text-brand-gray font-medium leading-relaxed mb-2 sm:mb-3 md:mb-4">
                                                {info.desc}
                                            </p>
                                            {info.isLink ? (
                                                <a href={info.link} className="text-[8px] sm:text-[9px] md:text-xs font-bold text-brand-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-colors duration-300 break-all">
                                                    {info.linkText}
                                                </a>
                                            ) : (
                                                <p className="text-[8px] sm:text-[9px] md:text-xs font-bold text-brand-white">
                                                    {info.linkText}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="lg:col-span-7 flex flex-col justify-center mt-8 lg:mt-0 fade-up" style={{ transitionDelay: '200ms' }}>
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold uppercase tracking-tighter text-brand-white mb-1 sm:mb-2">Send A Message</h3>
                        <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-6 sm:mb-8 md:mb-10 pb-4 sm:pb-6 border-b border-white/10">We usually respond within 24 hours.</p>

                        <LeadForm
                          formType="contact_inquiry"
                          fields={['f_name', 'l_name', 'email', 'phone', 'city', 'description']}
                          buttonText="Send Message"
                          tone="dark"
                        />
                    </div>

                </div>
            </section>

            {/* ── FAQ SECTION ── */}
            <section id="faq" className="scroll-mt-24 md:scroll-mt-32 py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-[#0f0f10] border-t border-white/10">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 sm:mb-12 md:mb-16 fade-up">
                        <div className="flex md:block max-w-2xl">
                            <h2 className="flex flex-col items-end text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-white leading-[0.9]">
                                <span className="flex">
                                    <h3 className="text-[8px] sm:text-[9px] md:text-sm font-bold tracking-[0.2em] uppercase text-brand-blue mb-2 sm:mb-3 md:mb-4">FAQ</h3>
                                    <span className="ml-3">{faqTitle.main}</span>
                                </span>
                                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">{faqTitle.last}</span>
                            </h2>
                        </div>
                        <div className="mt-6 md:mt-0 max-w-sm">
                            <p className="text-sm font-medium text-brand-gray leading-relaxed">
                                {faqs?.content}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {faqs?.metadata?.items?.map((faq: any, i: number) => {
                            const CardContent = (
                                <>
                                    <div className="mb-6 flex justify-between items-start gap-3">
                                        <div className="flex items-start gap-2 flex-1">
                                            <h4 className="text-base md:text-lg font-display font-bold uppercase tracking-tighter text-brand-white w-full">
                                                {faq.question}
                                            </h4>
                                            {faq.pageLink && (
                                                <span className="text-brand-white transition-colors duration-300 group-hover:text-brand-blue flex-shrink-0 mt-0.5">
                                                    📄
                                                </span>
                                            )}
                                        </div>
                                        <i className={`${faq.icon} text-brand-gray text-xl transition-colors duration-300 group-hover:text-brand-blue flex-shrink-0`}></i>
                                    </div>
                                    <p className="text-xs text-brand-gray leading-relaxed font-medium transition-colors duration-300 group-hover:text-white/80">
                                        {faq.answer}
                                    </p>
                                </>
                            );

                            return (
                                <div
                                    key={i}
                                    className="group bg-white/5 border border-white/10 p-8 md:p-10 rounded-2xl flex flex-col justify-between min-h-[250px] transition-all duration-[400ms] ease-custom hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] fade-up"
                                    style={{ transitionDelay: faq.delay || '0ms' }}
                                >
                                    {faq.pageLink ? (
                                        <Link href={faq.pageLink} className="contents cursor-pointer hover:no-underline">
                                            {CardContent}
                                        </Link>
                                    ) : (
                                        CardContent
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

        </main>
    );
}
