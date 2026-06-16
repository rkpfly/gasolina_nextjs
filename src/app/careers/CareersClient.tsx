"use client";

import { useEffect, useState } from 'react';
import { MediaAsset } from '@/lib/media';
import MediaSlot from '@/lib/media';
import Link from 'next/link';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Job {
    job_id: number;
    slug: string;
    designation: string;
    department: string;
    experience_min: number;
    experience_max: number;
    experience_label: string;
    employment_type: string;
    location: string;
    status: string;
}

export default function CareersClient() {
    // Media State
    const [media, setMedia] = useState<Record<string, MediaAsset>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Job Fetching State
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobPage, setJobPage] = useState(1);
    const [totalJobPages, setTotalJobPages] = useState(1);
    const [isJobsLoading, setIsJobsLoading] = useState(true);

    // Cinematic State
    const [isRevealed, setIsRevealed] = useState(false);

    // Form State for Country Code
    const [countryCode, setCountryCode] = useState('+61');

    // Role autofilled when a roster card is clicked
    const [selectedRole, setSelectedRole] = useState('');

    const handleRoleSelect = (value: string) => {
        setSelectedRole(value);
        document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Hardcoded Roster Array (value maps to the application form's role <select>)
    const roles = [
        {
            id: "role-1",
            title: "Promoters",
            value: "promoter",
            icon: "fa-solid fa-bullhorn",
            desc: "Expand our reach. Bring the energy to the streets and pack the club with your network.",
            cols: "lg:col-span-2",
            delay: "0ms"
        },
        {
            id: "role-2",
            title: "Influencers",
            value: "influencer",
            icon: "fa-solid fa-camera-retro",
            desc: "Shape the culture. Share the vibe and capture the definitive moments of our events online.",
            cols: "lg:col-span-2",
            delay: "100ms"
        },
        {
            id: "role-3",
            title: "DJs & Artists",
            value: "artist",
            icon: "fa-solid fa-compact-disc",
            desc: "Control the rhythm. Bring your unique sound and keep the dancefloor alive until dawn.",
            cols: "lg:col-span-2",
            delay: "200ms"
        },
        {
            id: "role-4",
            title: "Live Musicians",
            value: "musician",
            icon: "fa-solid fa-guitar",
            desc: "Elevate the live experience. Blend classical elements with modern, high-energy club tracks.",
            cols: "lg:col-span-3",
            delay: "0ms"
        },
        {
            id: "role-5",
            title: "Vocalists",
            value: "vocalist",
            icon: "fa-solid fa-microphone-lines",
            desc: "Command the crowd. Deliver powerful performances that act as the centerpiece of our shows.",
            cols: "lg:col-span-3",
            delay: "100ms"
        }
    ];

    // 1. Fetch Media
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch('/api/media?page=/careers');
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

    // 2. Fetch Jobs when jobPage changes
    useEffect(() => {
        const fetchJobs = async () => {
            setIsJobsLoading(true);
            try {
                // Fetching 4 items per page for a nice horizontal scroll view
                const res = await fetch(`/api/jobs?page=${jobPage}&limit=4`);
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data.data);
                    setTotalJobPages(data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setIsJobsLoading(false);
            }
        };
        fetchJobs();
    }, [jobPage]);

    // 3. Scroll reveal animations
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

    return (
        <main className="w-full bg-brand-black text-brand-white selection:bg-brand-lime selection:text-brand-black">

            {/* ── HERO SECTION ── */}
            <section className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12 flex flex-col">
                <div
                    className={`relative w-full h-[40svh] sm:h-[45svh] md:h-[50svh] min-h-[350px] sm:min-h-[400px] rounded-lg md:rounded-[2rem] overflow-hidden bg-brand-black shadow-2xl flex items-center justify-center text-center transition-[clip-path] duration-[1200ms] ease-custom ${
                        isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                    }`}
                >
                    <MediaSlot
                        id="hero-video"
                        mediaMap={media}
                        className={`absolute inset-0 w-full h-full object-cover filter grayscale opacity-60 transition-transform duration-[10000ms] ease-out ${
                            isRevealed ? 'scale-100' : 'scale-[1.15]'
                        }`}
                    />

                    <div className="absolute inset-0 bg-brand-black/30"></div>

                    <div className="relative z-20 fade-up px-3 sm:px-6 w-full flex flex-col items-center">
                        <span className="inline-block text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-black bg-brand-lime px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full shadow-lg mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                            Join The Movement
                        </span>

                        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-[8vw] leading-none font-display font-extrabold uppercase tracking-tighter text-brand-white">
                            <span className="py-[0.15em] inline-block align-bottom">CA</span><span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] py-[0.15em] inline-block align-bottom">REERS</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* ── INTRO TEXT SECTION ── */}
            <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-black text-center">
                <div className="max-w-4xl mx-auto fade-up">
                    <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-white mb-4 sm:mb-6 leading-[0.95]">
                        Build A Career. <br />
                        <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] hover:text-brand-lime hover:[-webkit-text-stroke:0px] transition-all duration-400 cursor-default">Build The Hype.</span>
                    </h2>
                    <div className="w-12 sm:w-16 h-[2px] bg-brand-lime mx-auto mb-4 sm:mb-6 md:mb-8"></div>
                    <p className="text-[9px] sm:text-xs md:text-sm lg:text-base font-medium text-brand-gray leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-6">
                        Dami Club aspires to build an interconnected community of nightlife enthusiasts. We are looking to connect, collaborate, and build a career while doing something that pushes the boundaries of entertainment.
                    </p>
                    <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-white mt-4 sm:mt-6 md:mt-8">
                        If you believe in us, come join us.
                    </p>
                </div>
            </section>

            {/* ── OPEN POSITIONS GRID (ROSTER) ── */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-[#0f0f10] border-t border-white/10">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-10 md:mb-16 fade-up">
                        <div className="max-w-2xl">
                            <h3 className="text-[8px] sm:text-[9px] md:text-sm font-bold tracking-[0.2em] uppercase text-brand-gray mb-2 sm:mb-3 md:mb-4 text-center">Talent Roster</h3>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-white leading-[0.9]">
                                Take The <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">Stage</span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                onClick={() => handleRoleSelect(role.value)}
                                className={`${role.cols} group bg-white/5 border border-white/10 py-6 sm:p-8 md:p-10 flex flex-col min-h-[300px] sm:min-h-[320px] md:min-h-[350px] rounded-lg md:rounded-2xl cursor-pointer transition-all duration-[400ms] ease-custom hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] fade-up`}
                                style={{ transitionDelay: role.delay }}
                            >
                                <div className="relative w-full h-28 sm:h-32 md:h-40 mb-4 sm:mb-5 md:mb-6 overflow-hidden rounded-lg bg-white/5">
                                    <MediaSlot
                                        id={role.id}
                                        mediaMap={media}
                                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                    />
                                    {/* Transparent cover: blocks the media lightbox so the card click drives the action */}
                                    <div className="absolute inset-0 z-10" aria-hidden="true" />
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="text-base sm:text-lg md:text-2xl text-brand-white transition-colors duration-300 group-hover:text-brand-lime flex-shrink-0">
                                        <i className={role.icon}></i>
                                    </div>
                                    <h4 className="text-sm sm:text-base md:text-xl font-display font-bold uppercase tracking-tighter text-brand-white">
                                        {role.title}
                                    </h4>
                                </div>
                                <div className="mt-auto">
                                    <p className="text-[8px] sm:text-[9px] md:text-xs text-brand-gray leading-relaxed font-medium transition-colors duration-300 group-hover:text-white/80">
                                        {role.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CURRENT OPENINGS (DATABASE JOBS) ── */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-black border-t border-white/10">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 sm:mb-10 md:mb-12 gap-4 fade-up">
                        <div className="self-start md:self-end max-w-2xl">
                            <h3 className="text-[8px] sm:text-[9px] md:text-sm font-bold tracking-[0.2em] uppercase text-brand-gray mb-2 sm:mb-3 md:mb-4">Corporate & Operations</h3>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase text-brand-white leading-[0.9]">
                                Current <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF]">Openings</span>
                            </h2>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex gap-2 sm:gap-3 md:gap-4 mt-4 md:mt-0">
                            <button
                                onClick={() => setJobPage(p => Math.max(1, p - 1))}
                                disabled={jobPage === 1 || isJobsLoading}
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-white/30 flex items-center justify-center text-sm sm:text-base md:text-lg text-brand-white transition-all duration-300 hover:bg-brand-lime hover:text-brand-black hover:border-brand-lime disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-brand-white disabled:hover:border-white/30"
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            <button
                                onClick={() => setJobPage(p => Math.min(totalJobPages, p + 1))}
                                disabled={jobPage >= totalJobPages || isJobsLoading}
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-white/30 flex items-center justify-center text-sm sm:text-base md:text-lg text-brand-white transition-all duration-300 hover:bg-brand-lime hover:text-brand-black hover:border-brand-lime disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-brand-white disabled:hover:border-white/30"
                            >
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 sm:pb-8 pt-3 sm:pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {isJobsLoading ? (
                            <div className="w-full py-16 sm:py-20 text-center flex flex-col items-center">
                                <i className="fa-solid fa-circle-notch animate-spin text-2xl sm:text-3xl text-brand-gray mb-2 sm:mb-4"></i>
                                <span className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-gray">Loading Opportunities...</span>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="w-full py-16 sm:py-20 text-center">
                                <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-gray">No open positions at the moment.</p>
                            </div>
                        ) : (
                            jobs.map((job, index) => (
                                <div
                                    key={job.job_id}
                                    className="snap-start shrink-0 w-[85vw] sm:w-[90vw] md:w-[420px] group bg-white/5 border border-white/10 p-6 sm:p-7 md:p-8 flex flex-col rounded-lg md:rounded-2xl transition-all duration-[400ms] ease-custom hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] fade-up"
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    {/* Top Tags */}
                                    <div className="flex justify-between items-start mb-6 sm:mb-7 md:mb-8 gap-2">
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 border border-white/10 text-brand-white rounded-full group-hover:bg-white/20 transition-colors flex-shrink-0">
                                            {job.department || 'General'}
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gray transition-colors flex-shrink-0">
                                            <i className="fa-solid fa-location-dot mr-1"></i> {job.location || 'Remote'}
                                        </span>
                                    </div>

                                    {/* Job Title */}
                                    <h4 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-display font-bold uppercase tracking-tighter text-brand-white mb-4 sm:mb-5 md:mb-6 line-clamp-2">
                                        {job.designation}
                                    </h4>

                                    {/* Bottom Meta */}
                                    <div className="flex flex-col gap-2 sm:gap-3 mt-auto pt-4 sm:pt-5 md:pt-6 border-t border-white/10 transition-colors">
                                        <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-widest text-brand-gray group-hover:text-brand-lime transition-colors">
                                            <i className="fa-solid fa-briefcase w-4 text-center flex-shrink-0"></i>
                                            <span className="uppercase">{job.employment_type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-widest text-brand-gray transition-colors">
                                            <i className="fa-solid fa-star w-4 text-center flex-shrink-0"></i>
                                            <span className="uppercase">{job.experience_label || `${job.experience_min}-${job.experience_max} YRS`}</span>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <Link href={`/careers/${job.slug}`} className="mt-6 sm:mt-7 md:mt-8 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-white transition-colors flex items-center justify-between">
                                        View Details
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand-lime group-hover:text-brand-black transition-all group-hover:translate-x-1 flex-shrink-0">
                                            <i className="fa-solid fa-arrow-right text-[9px] sm:text-xs"></i>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ── APPLICATION FORM SECTION ── */}
            <section id="apply" className="scroll-mt-24 py-10 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-4 md:px-6 lg:px-12 bg-[#0f0f10] border-t border-white/10">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-stretch">

                    {/* Left Image Reveal */}
                    <div
                        className={`w-full lg:w-1/2 relative rounded-lg md:rounded-[2rem] overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] transition-[clip-path] duration-[1200ms] ease-custom ${
                            isRevealed ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]' : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
                        }`}
                    >
                        <MediaSlot
                            id="form-media"
                            mediaMap={media}
                            className="absolute inset-0 w-full h-full object-cover filter grayscale-[10%]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent"></div>

                        <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-4 sm:left-8 md:left-12 text-brand-white z-10 pr-4 sm:pr-6 md:pr-8">
                            <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none mb-2 sm:mb-3 md:mb-4">
                                Join The <br /> <span className="text-brand-lime">Team</span>
                            </h3>
                            <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-white/80">Our recruitment team reviews all submissions.</p>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center py-6 sm:py-8 mt-6 sm:mt-8 lg:mt-0 fade-up" style={{ transitionDelay: '200ms' }}>
                        <div className="max-w-xl w-full mx-auto lg:mx-0 mt-6 sm:mt-8 lg:mt-0">
                            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-display font-bold uppercase tracking-tighter text-brand-white mb-1 sm:mb-2">Application Form</h3>
                            <p className="text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-8 sm:mb-10 md:mb-12 border-b border-white/10 pb-4 sm:pb-5 md:pb-6">Submit your details and portfolio below.</p>

                            <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div>
                                        <input type="text" placeholder="FIRST NAME *" required className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-white placeholder-brand-gray rounded-none" />
                                    </div>
                                    <div>
                                        <input type="text" placeholder="LAST NAME" className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-white placeholder-brand-gray rounded-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    {/* ── UPDATED PHONE INPUT ── */}
                                    <div className="flex items-end border-b border-white/30 pb-2 transition-colors focus-within:border-brand-lime group">
                                        <div className="relative flex items-center shrink-0 mb-[-2px] mr-2 sm:mr-3 md:mr-4">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-widest uppercase text-white focus:outline-none appearance-none cursor-pointer pr-4 sm:pr-5"
                                            >
                                                <option className="text-brand-black" value="+61">🇦🇺 +61</option>
                                                <option className="text-brand-black" value="+64">🇳🇿 +64</option>
                                                <option className="text-brand-black" value="+65">🇸🇬 +65</option>
                                                <option className="text-brand-black" value="+91">🇮🇳 +91</option>
                                                <option className="text-brand-black" value="+44">🇬🇧 +44</option>
                                                <option className="text-brand-black" value="+1">🇺🇸 +1</option>
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-0 text-[8px] pointer-events-none text-white"></i>
                                        </div>
                                        <input type="tel" placeholder="PHONE NUMBER *" required className="w-full bg-transparent text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none placeholder-brand-gray text-white rounded-none" />
                                    </div>

                                    <div>
                                        <input type="email" placeholder="EMAIL ADDRESS *" required className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-white placeholder-brand-gray rounded-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    <div>
                                        <input type="date" required className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-brand-gray [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 transition-opacity rounded-none" />
                                    </div>
                                    <div>
                                        <input type="url" placeholder="SOCIAL / PORTFOLIO LINK *" required className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-white placeholder-brand-gray rounded-none" />
                                    </div>
                                </div>

                                <div>
                                    <div className="relative">
                                        <select required value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-transparent border-b border-white/30 pb-2 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-lime text-white appearance-none cursor-pointer pr-6 sm:pr-7 md:pr-8 rounded-none">
                                            <option className="text-brand-black" value="" disabled>SELECT ROLE *</option>
                                            <option className="text-brand-black" value="promoter">Promoter</option>
                                            <option className="text-brand-black" value="influencer">Influencer</option>
                                            <option className="text-brand-black" value="artist">Artist (DJ/Producer)</option>
                                            <option className="text-brand-black" value="musician">Live Musician</option>
                                            <option className="text-brand-black" value="vocalist">Vocalist</option>
                                        </select>
                                        <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[8px] sm:text-[9px] md:text-[10px] text-white pointer-events-none"></i>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 sm:py-5 md:py-6 text-[8px] sm:text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase mt-6 sm:mt-8 rounded-full bg-brand-lime text-brand-black hover:bg-brand-white transition-colors duration-300">
                                    Submit Application
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

        </main>
    );
}
