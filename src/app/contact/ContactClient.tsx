"use client";

import { useEffect, useState } from 'react';
import LeadForm from '@/components/LeadForm';

export default function ContactClient() {
    // ── State for the cinematic image reveal ──
    const [isRevealed, setIsRevealed] = useState(false);

    const contactInfo = [
        {
            icon: "fa-solid fa-headset",
            title: "General Support",
            desc: "For ticketing and general event inquiries.",
            link: "mailto:info@bollywoodclubx.com",
            linkText: "info@bollywoodclubx.com",
            isLink: true
        },
        {
            icon: "fa-solid fa-crown",
            title: "VIP Bookings",
            desc: "Exclusive booth reservations and packages.",
            link: "tel:+61483952024",
            linkText: "+61 483952024",
            isLink: false
        }
    ];

    const faqs = [
        {
            question: "What is the dress code?",
            icon: "fa-solid fa-shirt",
            answer: "Smart club wear is strictly enforced. No hoodies, sportswear, torn jeans, or sneakers. Dress to impress for an elevated experience.",
            delay: "0ms"
        },
        {
            question: "ID Requirements",
            icon: "fa-solid fa-id-card",
            answer: "All events are strictly 18+. You must present a valid physical Driver's License, State ID, or Passport upon entry to the venue.",
            delay: "100ms"
        },
        {
            question: "Ticket Refunds",
            icon: "fa-solid fa-ticket",
            answer: "Tickets are non-refundable unless the event is cancelled or rescheduled. You can securely transfer tickets via our authorized ticketing partners.",
            delay: "200ms"
        }
    ];

    useEffect(() => {
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
    }, []);

    return (
        <main className="w-full selection:bg-brand-black selection:text-white">
            
            {/* HERO SECTION */}
            <section className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 flex flex-col">
                <div 
                    className={`relative w-full h-[60vh] sm:h-[65vh] md:h-[65vh] min-h-[450px] sm:min-h-[500px] rounded-lg md:rounded-[2rem] overflow-hidden bg-brand-black shadow-2xl transition-[clip-path] duration-[1200ms] ease-custom ${
                        isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                    }`}
                >
                    <img 
                        src="https://images.unsplash.com/photo-1576525865260-9f0e7cfb02b3?q=80&w=1600&auto=format&fit=crop" 
                        alt="Contact Us Background"
                        className={`absolute inset-0 w-full h-full object-cover filter grayscale-[30%] opacity-60 transition-transform duration-[10000ms] ease-out ${
                            isRevealed ? 'scale-100' : 'scale-[1.15]'
                        }`} 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/95 via-brand-black/40 to-brand-black/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-12 lg:p-20 z-20">
                        <div className="fade-up max-w-4xl">
                            <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                                <span className="inline-block text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black bg-brand-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full shadow-lg">
                                    Support & Inquiries
                                </span>
                                <span className="inline-block text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white bg-brand-accent px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full shadow-lg">
                                    24/7 Available
                                </span>
                            </div>
                            
                            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl leading-[1.1] font-display font-extrabold uppercase tracking-tighter text-brand-white">
                                Get In <br className="md:hidden" /> 
                                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] py-[0.15em] inline-block">Touch</span>
                            </h1>
                            
                            <p className="mt-3 md:mt-4 text-brand-white/80 text-[10px] sm:text-xs md:text-sm lg:text-base font-medium max-w-lg leading-relaxed border-l-2 border-brand-accent pl-3 md:pl-4">
                                We are here to ensure your night is flawless. Reach out for VIP booth reservations, corporate event planning, and exclusive ticket inquiries.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT INFO & FORM SECTION */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-white">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 md:gap-16 lg:gap-24">
                    
                    {/* Left: Contact Info */}
                    <div className="lg:col-span-5 fade-up">
                        <div className="lg:sticky lg:top-32">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tighter uppercase leading-[0.9] text-brand-black mb-3 sm:mb-4 md:mb-6">
                                How Can We <br /> 
                                <span className="text-brand-gray text-transparent [-webkit-text-stroke:1px_#0A0A0A] hover:text-brand-black hover:[-webkit-text-stroke:0px] transition-all duration-400 cursor-default">Help?</span>
                            </h2>
                            <p className="text-[9px] sm:text-xs md:text-sm font-medium text-brand-gray leading-relaxed mb-6 sm:mb-8 md:mb-12 max-w-md">
                                Whether you have a question about an upcoming event, need assistance with tickets, or want to inquire about VIP services, our team is ready to assist you.
                            </p>

                            <div className="flex flex-col gap-3 sm:gap-4">
                                {contactInfo.map((info, i) => (
                                    <div 
                                        key={i} 
                                        className="group bg-brand-offwhite border border-transparent p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl md:rounded-2xl flex items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6 cursor-pointer transition-all duration-[400ms] ease-custom hover:bg-brand-black hover:border-brand-black hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                                    >
                                        <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-brand-black mt-0.5 sm:mt-1 transition-colors duration-300 group-hover:text-brand-accent flex-shrink-0">
                                            <i className={info.icon}></i>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-brand-black mb-1 sm:mb-2 transition-colors duration-300 group-hover:text-white">
                                                {info.title}
                                            </h4>
                                            <p className="text-[8px] sm:text-[9px] md:text-xs text-brand-gray font-medium leading-relaxed mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 group-hover:text-white/80">
                                                {info.desc}
                                            </p>
                                            {info.isLink ? (
                                                <a href={info.link} className="text-[8px] sm:text-[9px] md:text-xs font-bold text-brand-black underline underline-offset-4 decoration-brand-border hover:decoration-brand-black transition-colors duration-300 group-hover:text-white group-hover:decoration-white/40 group-hover:hover:decoration-white break-all">
                                                    {info.linkText}
                                                </a>
                                            ) : (
                                                <p className="text-[8px] sm:text-[9px] md:text-xs font-bold text-brand-black transition-colors duration-300 group-hover:text-white">
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
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold uppercase tracking-tighter text-brand-black mb-1 sm:mb-2">Send A Message</h3>
                        <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-6 sm:mb-8 md:mb-10 pb-4 sm:pb-6 border-b border-brand-border">We usually respond within 24 hours.</p>
                        
                        <LeadForm 
                          formType="contact_inquiry"
                          fields={['f_name', 'l_name', 'email', 'phone', 'city', 'description']}
                          buttonText="Send Message"
                        />
                    </div>

                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-offwhite border-t border-brand-border">
                <div className="max-w-[1600px] mx-auto">
                    
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 sm:mb-12 md:mb-16 fade-up">
                        <div className="flex md:block max-w-2xl">
                            <h2 className="flex flex-col items-end text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-black leading-[0.9]">
                                <span className="flex">
                                    <h3 className="text-[8px] sm:text-[9px] md:text-sm font-bold tracking-[0.2em] uppercase text-brand-gray mb-2 sm:mb-3 md:mb-4">FAQ</h3>
                                    <span>Quick</span>
                                </span> 
                                <span className="text-transparent [-webkit-text-stroke:1px_#0A0A0A]">Answers</span>
                            </h2>
                        </div>
                        <div className="mt-6 md:mt-0 max-w-sm">
                            <p className="text-sm font-medium text-brand-gray leading-relaxed">
                                Save time and find exactly what you're looking for with our most frequently asked questions.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {faqs.map((faq, i) => (
                            <div 
                                key={i} 
                                className="group bg-brand-offwhite border border-transparent p-8 md:p-10 rounded-2xl flex flex-col justify-between min-h-[250px] transition-all duration-[400ms] ease-custom hover:bg-brand-black hover:border-brand-black hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] fade-up"
                                style={{ transitionDelay: faq.delay }}
                            >
                                <div className="mb-6 flex justify-between items-start">
                                    <h4 className="text-base md:text-lg font-display font-bold uppercase tracking-tighter text-brand-black transition-colors duration-300 w-3/4 group-hover:text-white">
                                        {faq.question}
                                    </h4>
                                    <i className={`${faq.icon} text-brand-gray text-xl mt-1 transition-colors duration-300 group-hover:text-brand-accent`}></i>
                                </div>
                                <p className="text-xs text-brand-gray leading-relaxed font-medium transition-colors duration-300 group-hover:text-white/80">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

        </main>
    );
}