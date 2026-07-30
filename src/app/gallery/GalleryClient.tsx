"use client";

import { useEffect, useState } from 'react';
import { GalleryPost } from '../api/admin/gallery/types';
import { MediaAsset } from '@/lib/media';
import MediaSlot from '@/lib/media';

// The exact layout pattern from your original HTML
const layoutClasses = [
    "md:col-span-2 md:row-span-2", // Large Square
    "col-span-1 row-span-1",       // Standard Small
    "col-span-1 md:row-span-2",    // Tall Vertical
    "md:col-span-2 row-span-1",    // Wide Horizontal
    "col-span-1 row-span-1",       // Standard Small
    "col-span-1 row-span-1",       // Standard Small
];

const GalleryItemCard = ({ post, index }: { post: GalleryPost, index: number }) => {
    const layoutClass = layoutClasses[index % layoutClasses.length];
    const isVideo = post.type?.toLowerCase() === 'video';

    return (
        <div
            className={`gallery-item relative overflow-hidden bg-white/5 group scale-hover img-wrapper rounded-xl ${layoutClass} ${post.redirect_link ? 'cursor-pointer' : ''}`}
            onClick={() => {
                if (post.redirect_link) {
                    window.open(post.redirect_link, '_blank');
                }
            }}
        >
            <img
                src={post.thumbnail_url || post.media_url}
                alt={post.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div
                className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent gallery-overlay"
            >
            </div>

            <div className="absolute top-6 left-6 z-20">
                <span className={`${isVideo ? 'bg-brand-blue text-brand-white' : 'bg-brand-white text-brand-black'} text-[9px] font-bold px-3 py-1.5 uppercase tracking-widest rounded-full`}>
                    {post.category || (isVideo ? 'Video Recap' : 'Photo Album')}
                </span>
            </div>

            {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center z-20 gallery-play-btn">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white">
                        <i className="fa-solid fa-play ml-1"></i>
                    </div>
                </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 z-20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <h3 className="text-xl md:text-3xl font-display font-bold text-white uppercase tracking-tighter mb-1 truncate">
                    {post.title}
                </h3>
                <p className="text-[9px] md:text-xs font-bold tracking-[0.15em] uppercase text-brand-blue truncate">
                    {post.location || 'Location TBA'} {post.caption && `• ${post.caption}`}
                </p>
            </div>
        </div>
    );
};

export default function GalleryClient({
    initialPosts,
    mediaSlots
}: {
    initialPosts: GalleryPost[],
    mediaSlots: Record<string, MediaAsset>
}) {
    const [activeTab, setActiveTab] = useState('All Media');
    const tabs = ['All Media', 'Photos', 'Videos', 'Melbourne', 'Sydney', 'Singapore'];

    const filteredPosts = initialPosts.filter(post => {
        if (activeTab === 'All Media') return true;
        if (activeTab === 'Photos') return post.type?.toLowerCase() === 'photo' || post.type?.toLowerCase() === 'image';
        if (activeTab === 'Videos') return post.type?.toLowerCase() === 'video';
        return post.location?.toLowerCase().includes(activeTab.toLowerCase());
    });

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

    // Section-focused scroll snapping, scoped to this page only.
    useEffect(() => {
        const html = document.documentElement;
        html.classList.add('snap-sections');
        return () => html.classList.remove('snap-sections');
    }, []);

    return (
        <main className="w-full bg-brand-black text-brand-white">
            {/* HERO SECTION */}
            <section className="relative h-[85svh] w-full px-4 md:px-8 pt-20 md:pt-20 pb-12 flex flex-col snap-start">
                <div className="relative w-full h-full min-h-[500px] rounded-[2rem] overflow-hidden bg-brand-black img-reveal shadow-2xl img-wrapper">

                    {/* Correctly Implemented Media Slot */}
                    <div className="h-48 md:h-[700px]">
                        <MediaSlot
                            id="hero-video"
                            mediaMap={mediaSlots}
                            className="hero-img-anim absolute inset-0 w-full h-full object-fit filter grayscale opacity-50"
                        />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>

                    <div className="absolute bottom-0 md:inset-0 flex flex-col justify-between py-8 px-4 md:p-16 z-20">
                        <div className="fade-up max-w-4xl text-center mx-auto">
                            <span className="inline-block text-[10px] md:text-xs font-display font-extrabold tracking-[0.2em] uppercase text-brand-white bg-brand-blue px-5 py-2.5 rounded-full shadow-lg mb-6">
                                Captured Moments
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-[7.5vw] leading-[1.1] font-display font-extrabold uppercase tracking-tighter text-brand-white py-2">
                                Relive The <br className="md:hidden" />
                                <span className="text-transparent [-webkit-text-stroke:1.5px_#FFFFFF] py-[0.15em] inline-block">
                                    Nights
                                </span>
                            </h1>
                            <p className="mt-4 text-brand-white/80 text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed">
                                The floor, the sound, the people — every Dami Club night, captured.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* LATEST AFTERMOVIE SECTION */}
            <section className="pt-12 bg-brand-black snap-start">
                <div className="max-w-[1600px] mx-auto fade-up">

                    <div className="flex justify-between items-end mb-4 px-2 md:px-12">
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-blue mb-2">Featured</p>
                            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-white">
                                Latest <span className='bg-brand-blue text-brand-white px-2'>Aftermovie</span>
                            </h2>
                        </div>
                        <button className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-brand-gray hover:text-brand-white transition-colors">
                            View All <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <div className="px-0 md:px-12">
                        <div className="w-full aspect-video md:aspect-[21/9] rounded-none md:rounded-2xl overflow-hidden relative group cursor-pointer bg-white/5 scale-hover img-wrapper">

                            {/* Correctly Implemented Media Slot */}
                            <MediaSlot
                                id="latest-aftermovie"
                                mediaMap={mediaSlots}
                                className="w-full h-full object-cover filter grayscale-[10%]"
                            />

                            <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/10 transition-colors duration-500 pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DYNAMIC ARCHIVES SECTION */}
            <section id="all-media" className="pb-32 px-6 md:px-12 bg-brand-black border-t border-white/10 pt-12 md:pt-24 snap-start">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col xl:flex-row justify-between items-end mb-4 fade-up">
                        <div className="mb-8 xl:mb-0">
                            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase text-brand-white">The Archives</h2>
                        </div>

                        <div className="flex space-x-8 overflow-x-auto w-full xl:w-auto pb-4 hide-scroll text-[11px] font-bold tracking-[0.15em] uppercase text-brand-gray border-b border-white/10">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`filter-tab pb-4 whitespace-nowrap transition-colors hover:text-brand-white ${
                                        activeTab === tab ? 'active text-brand-white border-b-2 border-brand-blue' : 'border-b-2 border-transparent'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DYNAMIC GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[320px] fade-up" style={{ transitionDelay: '100ms' }}>
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post, index) => (
                                <GalleryItemCard key={post.id} post={post} index={index} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-brand-gray font-bold tracking-widest uppercase text-sm">
                                No media found for this category.
                            </div>
                        )}
                    </div>

                    <div className="mt-20 text-center fade-up">
                        <button className="border border-white/30 text-brand-white hover:bg-brand-blue hover:text-brand-white hover:border-brand-blue px-12 py-5 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-300">
                            Load More Memories
                        </button>
                    </div>
                </div>
            </section>

            {/* FOLLOW THE VIBE SECTION */}
            <section className="py-24 bg-[#0f0f10] text-brand-white px-6 md:px-12 border-t border-white/10 snap-start">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 fade-up">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter uppercase mb-2">Follow The Vibe</h2>
                            <p className="text-sm font-medium text-brand-gray">Tag @damiclub to be featured.</p>
                        </div>
                        <a href="#" className="mt-6 md:mt-0 flex items-center gap-3 text-xs font-bold tracking-[0.15em] uppercase text-brand-blue hover:text-white transition-colors">
                            <i className="fa-brands fa-instagram text-lg"></i> Follow Us
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up">
                        {[
                            "https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop",
                            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop",
                        ].map((src, i) => (
                            <div
                                key={src}
                                className={`aspect-square bg-white/5 rounded-lg overflow-hidden group cursor-pointer relative ${i > 1 ? 'hidden md:block' : ''}`}
                            >
                                <img src={src} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={`Dami Club social ${i + 1}`} />
                                <div className="absolute inset-0 bg-brand-blue/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-brand-white text-3xl">
                                    <i className="fa-brands fa-instagram"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
