"use client";

import { useEffect, useState } from 'react';

// Define the shape of our mapped blog posts
interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    author: string;
    tags: string[];
    publishedAt: string;
    createdAt: string;
}

export default function JournalClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [activeTab, setActiveTab] = useState('All Stories');
    const tabs = ['All Stories', 'Recaps', 'Interviews', 'Guides', 'Announcements'];

    // --- NEW FORM STATE ---
    const [formData, setFormData] = useState({
        f_name: '',
        l_name: '',
        email: '',
        phone: '',
    });
    const [citySelection, setCitySelection] = useState("");
    const [customCity, setCustomCity] = useState("");
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Helper to format dates like "May 15, 2024"
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long', day: '2-digit', year: 'numeric'
        });
    };

    // Filter Logic for the Archives Grid
    const filteredPosts = initialPosts.filter(post => {
        if (activeTab === 'All Stories') return true;
        return post.tags?.some(tag => tag.toLowerCase().includes(activeTab.toLowerCase().replace(/s$/, ''))); 
    });

    const featuredPost = initialPosts[0];
    const sidePosts = initialPosts.slice(1, 3);
    const archivePosts = filteredPosts.slice(3);

    useEffect(() => {
        const reveals = document.querySelectorAll('.img-reveal');
        const timer = setTimeout(() => {
            reveals.forEach(r => r.classList.add('active'));
        }, 100);

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
            clearTimeout(timer);
            fadeElements.forEach(el => observer.unobserve(el));
        };
    }, [filteredPosts]);

    // --- NEW SUBMIT HANDLER ---
    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('loading');
    
        const finalCity = citySelection === 'Other' ? customCity : citySelection;
    
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    form_type: 'journal_newsletter', // Identifies where the lead came from
                    f_name: formData.f_name,
                    l_name: formData.l_name,
                    email: formData.email,
                    phone: formData.phone,
                    city: finalCity
                })
            });
    
            if (res.ok) {
                setFormStatus('success');
                setFormData({ f_name: '', l_name: '', email: '', phone: '' });
                setCitySelection("");
                setCustomCity("");
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            setFormStatus('error');
        }
    };

    return (
        <main className="w-full">
            
            {/* HERO SECTION */}
            <section className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-16 sm:pt-24 md:pt-28 pb-0 flex flex-col">
                <div className="relative w-full h-[30svh] sm:h-[45svh] md:h-[50svh] min-h-[300px] sm:min-h-[350px] rounded-t-xl md:rounded-t-[2rem] overflow-hidden bg-brand-black img-reveal shadow-2xl img-wrapper flex items-center justify-center text-center">
                    <div className="absolute inset-0 bg-brand-black/40"></div>
                    
                    <div className="relative z-20 fade-up px-3 sm:px-4 w-full flex flex-col items-center mt-6 sm:mt-8">
                        <span className="inline-block text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-black bg-brand-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg mb-3 sm:mb-4 md:mb-6">
                            News & Editorials
                        </span>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-[7vw] leading-none font-display font-extrabold uppercase tracking-tighter text-brand-white whitespace-normal sm:whitespace-nowrap">
                            <span className="py-[0.15em] inline-block align-bottom">THE</span> <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] py-[0.15em] inline-block align-bottom">JOURNAL</span>
                        </h1>
                    </div>
                </div>
            </section>

            {/* MARQUEE SECTION */}
            <div className="w-full bg-brand-accent border-y-2 sm:border-y-3 md:border-y-4 border-brand-black overflow-hidden flex whitespace-nowrap py-2 sm:py-3 md:py-4 z-20 relative">
                <div className="animate-marquee flex items-center w-max">
                    {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center shrink-0 text-brand-black px-2 sm:px-4"
                    >
                        <span className="text-xs sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter">LATEST NEWS</span>
                        <span className="text-sm sm:text-xl md:text-3xl mx-2 sm:mx-4">•</span>
                        <span className="text-xs sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter">EVENT RECAPS</span>
                        <span className="text-sm sm:text-xl md:text-3xl mx-2 sm:mx-4">•</span>
                        <span className="text-xs sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter">ARTIST INTERVIEWS</span>
                        <span className="text-sm sm:text-xl md:text-3xl mx-2 sm:mx-4">•</span>
                        <span className="text-xs sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter text-transparent [-webkit-text-stroke:1px_#0A0A0A] hover:text-brand-black transition-colors">STYLE GUIDES</span>
                        <span className="text-sm sm:text-xl md:text-3xl mx-2 sm:mx-4">•</span>
                    </div>
                    ))}
                </div>
            </div>

            {/* DYNAMIC EDITOR'S PICK SECTION */}
            <section className="pt-4 md:py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-white border-b border-brand-border">
                <div className="max-w-[1600px] mx-auto">
                    
                    <div className="mb-6 sm:mb-8 md:mb-12 fade-up">
                        <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold tracking-tighter uppercase text-brand-black">
                            Editor's <span className="text-brand-gray text-transparent [-webkit-text-stroke:1.5px_#0A0A0A] hover:text-brand-black hover:[-webkit-text-stroke:0px] transition-all duration-400">Pick</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                        {featuredPost && (
                            <a href={`/blogs/${featuredPost.slug}`} className="editorial-card lg:col-span-8 flex flex-col group fade-up">
                                <div className="relative w-full aspect-video md:aspect-[16/9] lg:aspect-auto lg:h-[600px] rounded-xl sm:rounded-2xl bg-brand-offwhite img-wrapper mb-4 sm:mb-6">
                                    <img src={featuredPost.coverImage} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover filter grayscale-[100%]" />
                                    <div className="absolute top-6 left-6 z-10">
                                        <span className="bg-brand-black text-brand-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">Feature Story</span>
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 pr-4">
                                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-gray mb-3">
                                        {formatDate(featuredPost.publishedAt || featuredPost.createdAt)} • {featuredPost.tags[0] || 'Editorial'}
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tighter text-brand-black leading-[0.95] mb-2 sm:mb-4 group-hover:text-brand-accent transition-colors">
                                        {featuredPost.title}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-brand-gray leading-relaxed mb-4 sm:mb-6 line-clamp-2 max-w-3xl">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="text-xs font-bold uppercase tracking-[0.15em] text-brand-black flex items-center">
                                        Read Full Article <i className="fa-solid fa-arrow-right ml-2 arrow-icon text-lg"></i>
                                    </div>
                                </div>
                            </a>
                        )}

                        <div className="lg:col-span-4 flex flex-col gap-6 sm:gap-8 md:gap-12 lg:gap-0 lg:justify-between fade-up mt-6 lg:mt-0" style={{ transitionDelay: '200ms' }}>
                            {sidePosts.map((post, idx) => (
                                <a href={`/blogs/${post.slug}`} key={post._id} className="editorial-card flex flex-col group">
                                    <div className="relative w-full aspect-video rounded-xl bg-brand-offwhite img-wrapper mb-4 md:mb-5">
                                        <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover filter grayscale-[100%]" />
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-brand-white text-brand-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md">
                                                {post.tags[0] || 'Article'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gray mb-2">
                                            {formatDate(post.publishedAt || post.createdAt)}
                                        </p>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold uppercase tracking-tighter text-brand-black leading-tight mb-2 group-hover:text-brand-accent transition-colors">
                                            {post.title}
                                        </h3>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray flex items-center mt-3">
                                            Read <i className="fa-solid fa-arrow-right ml-2 arrow-icon"></i>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* DYNAMIC ARCHIVES SECTION */}
            <section className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-12 bg-brand-offwhite">
                <div className="max-w-[1600px] mx-auto">
                    
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 sm:mb-12 md:mb-16 fade-up">
                        <div className="mb-6 sm:mb-8 xl:mb-0">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-black">The Archives</h2>
                        </div>
                        
                        <div className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto w-full xl:w-auto pb-3 sm:pb-4 hide-scroll text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-brand-gray border-b border-brand-border">
                            {tabs.map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`filter-tab pb-4 whitespace-nowrap transition-colors hover:text-brand-black ${
                                        activeTab === tab ? 'active text-brand-black border-b-2 border-brand-black' : 'border-b-2 border-transparent'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-y-16">
                        {archivePosts.length > 0 ? (
                            archivePosts.map((post, i) => (
                                <a href={`/blogs/${post.slug}`} key={post._id} className="editorial-card flex flex-col group fade-up" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                                    <div className="relative w-full aspect-[4/3] rounded-xl bg-brand-white img-wrapper mb-5">
                                        <img src={post.coverImage} className="absolute inset-0 w-full h-full object-cover filter grayscale-[100%]" alt={post.title} />
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className={`${i % 2 === 0 ? 'bg-brand-black' : 'bg-brand-accent'} text-brand-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full`}>
                                                {post.tags[0] || 'Story'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gray mb-3">
                                            {formatDate(post.publishedAt || post.createdAt)}
                                        </p>
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold uppercase tracking-tighter text-brand-black leading-tight mb-2 sm:mb-3 group-hover:text-brand-accent transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm font-medium text-brand-gray leading-relaxed mb-5 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-black flex items-center">
                                            Read Article <i className="fa-solid fa-arrow-right ml-2 arrow-icon"></i>
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-brand-gray font-bold tracking-widest uppercase text-sm">
                                No stories found in this category.
                            </div>
                        )}
                    </div>

                    {archivePosts.length > 0 && (
                        <div className="mt-20 text-center fade-up">
                            <button className="btn-outline px-12 py-5 rounded-full text-xs font-bold tracking-[0.15em] uppercase">
                                Load More Stories
                            </button>
                        </div>
                    )}

                </div>
            </section>

            {/* DYNAMIC SUBSCRIBE SECTION */}
            <section className="py-0 flex flex-col lg:flex-row bg-brand-white border-t border-brand-border">
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-24 fade-up order-2 lg:order-1 border-r border-brand-border">
                    <div className="w-full max-w-md mx-auto">
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-accent mb-2 sm:mb-4 block">The Inner Circle</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-black mb-3 sm:mb-4">Stay In The Loop</h2>
                        <p className="text-brand-gray font-medium text-[10px] sm:text-xs md:text-sm mb-8 sm:mb-10 md:mb-12 leading-relaxed">Subscribe to the journal to receive priority access to ticket drops, exclusive editorial content, and secret venue reveals delivered directly to your inbox.</p>
                        
                        {/* Render Success State OR The Form */}
                        {formStatus === 'success' ? (
                            <div className="bg-brand-black text-brand-white p-8 rounded-xl text-center animate-in fade-in zoom-in duration-500">
                                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-2">You're on the list</h3>
                                <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gray">Check your email soon.</p>
                            </div>
                        ) : (
                            <form className="flex flex-col gap-8" onSubmit={handleSubscribe}>
                                
                                {formStatus === 'error' && (
                                    <div className="text-red-500 text-xs font-bold uppercase tracking-widest">
                                        An error occurred. Please try again.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="FIRST NAME *" 
                                            required 
                                            value={formData.f_name}
                                            onChange={(e) => setFormData({...formData, f_name: e.target.value})}
                                            className="w-full bg-transparent border-b border-brand-black pb-3 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors text-brand-black placeholder-brand-gray" 
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="LAST NAME" 
                                            value={formData.l_name}
                                            onChange={(e) => setFormData({...formData, l_name: e.target.value})}
                                            className="w-full bg-transparent border-b border-brand-black pb-3 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors text-brand-black placeholder-brand-gray" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <input 
                                            type="email" 
                                            placeholder="EMAIL ADDRESS *" 
                                            required 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-transparent border-b border-brand-black pb-3 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors text-brand-black placeholder-brand-gray" 
                                        />
                                    </div>
                                    {/* <div className="relative">
                                        <span className="absolute left-0 bottom-3 text-xs font-bold tracking-[0.15em] uppercase text-brand-black">+61</span>
                                        <input 
                                            type="tel" 
                                            placeholder="PHONE NO. *" 
                                            required 
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-transparent border-b border-brand-black pb-3 pl-10 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors text-brand-black placeholder-brand-gray" 
                                        />
                                    </div> */}
                                </div>

                                {/* Dynamic City Dropdown */}
                                <div className="relative">
                                    <select
                                        value={citySelection}
                                        onChange={(e) => setCitySelection(e.target.value)}
                                        className={`w-full bg-transparent border-b border-brand-black pb-3 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors appearance-none cursor-pointer ${citySelection === "" ? 'text-brand-gray' : 'text-brand-black'}`}
                                        required
                                    >
                                        <option value="" disabled className="text-brand-gray">SELECT CITY *</option>
                                        <option value="Melbourne" className="text-brand-black">Melbourne</option>
                                        <option value="Sydney" className="text-brand-black">Sydney</option>
                                        <option value="Perth" className="text-brand-black">Perth</option>
                                        <option value="Adelaide" className="text-brand-black">Adelaide</option>
                                        <option value="Brisbane" className="text-brand-black">Brisbane</option>
                                        <option value="Singapore" className="text-brand-black">Singapore</option>
                                        <option value="Other" className="text-brand-black">Other</option>
                                    </select>
                                    <div className="absolute right-0 top-[20%] pointer-events-none pb-3">
                                        <i className="fa-solid fa-chevron-down text-brand-gray text-xs"></i>
                                    </div>
                                </div>

                                {/* Conditional Input for "Other" City */}
                                {citySelection === 'Other' && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            placeholder="ENTER YOUR CITY *"
                                            value={customCity}
                                            onChange={(e) => setCustomCity(e.target.value)}
                                            className="w-full bg-transparent border-b border-brand-black pb-3 text-xs font-bold tracking-[0.15em] uppercase outline-none focus:border-brand-accent transition-colors text-brand-black placeholder-brand-gray"
                                            required
                                        />
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={formStatus === 'loading'}
                                    className="btn-monumental w-full py-5 text-xs font-bold tracking-[0.15em] uppercase mt-4 disabled:opacity-50"
                                >
                                    <span>{formStatus === 'loading' ? 'Submitting...' : 'Subscribe'}</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
                <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto relative img-reveal active order-1 lg:order-2 img-wrapper">
                    <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover filter grayscale-[20%]" alt="Subscribe" />
                </div>
            </section>
        </main>
    );
}