"use client";

import { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        id="navbar"
        ref={navbarRef}
        className={`fixed top-0 left-0 w-full z-9999 sm:py-4 md:py-6 px-4 sm:px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md`}
      >
        <Link
          href="/"
          className={`absolute mx-auto md:block flex md:mx-0 items-center relative ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} transition-opacity duration-300`}
        >
          {/* The wrapper strictly dictates the space so the header height never shifts */}
          <div className="relative w-44 h-16 sm:w-40 sm:h-10 md:w-48 md:h-12 lg:w-56 lg:h-14">
            <Image 
              src="/bclogo-black-v1.png" 
              alt="Bollywood Club Logo" 
              fill
              className="object-contain object-left" 
              priority 
            />
          </div>
        </Link>
        

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 lg:space-x-12 items-center text-xs font-semibold tracking-[0.15em] uppercase text-brand-black">
          <Link href="/events" className="hover:text-brand-accent transition-colors">
            Events
          </Link>
          <Link href="/gallery" className="hover:text-brand-accent transition-colors">
            Gallery
          </Link>
          <Link href="/blogs" className="hover:text-brand-accent transition-colors">
            Blogs
          </Link>
        </nav>

        <div className="flex items-center gap-4 sm:gap-6 relative z-[60]">
          <button
            id="menu-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col justify-center items-end gap-1 sm:gap-1.5 group cursor-pointer${
              isMenuOpen ? " menu-open" : ""
            }`}
            aria-label="Toggle Menu"
          >
            <span className="ham-line ham-top w-6 sm:w-8 h-0.5 bg-brand-black group-hover:w-full" />
            <span className="ham-line ham-mid w-full h-0.5 bg-brand-black" />
            <span className="ham-line ham-bot w-5 sm:w-6 h-0.5 bg-brand-black group-hover:w-full" />
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        id="menu-overlay"
        className={`fixed inset-0 bg-brand-white z-50 flex flex-col justify-center px-4 sm:px-6 md:px-24 pt-20 pb-10 overflow-y-auto${
          isMenuOpen ? " open" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-[1600px] mx-auto h-full items-center">
          <div 
            className="absolute right-4 sm:right-6 md:right-10 top-4 sm:top-6 p-1 rounded-full font-bold text-black text-4xl sm:text-5xl cursor-pointer
             hover:scale"
            onClick={closeMenu}>
            X
          </div>
          <nav className="flex flex-col space-y-3 sm:space-y-4 md:space-y-6">
            {[
              { label: "Home", href: "/" },
              { label: "Events", href: "/events" },
              { label: "Gallery", href: "/gallery" },
              { label: "Blogs", href: "/blogs" },
            ].map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="menu-item text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter text-brand-black hover:text-outline transition-all duration-300 w-fit"
                style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col space-y-4 md:space-y-6 border-t md:border-t-0 md:border-l border-brand-border pt-8 md:pt-0 md:pl-12">
            {[
              { label: "Offers", href: "/offers", delay: "0.3s" },
              { label: "Birthday", href: "/birthday", delay: "0.3s" },
              { label: "VIP Reservations", href: "/vip", delay: "0.35s" },
              { label: "Corporate Galas", href: "/corporate", delay: "0.4s" },
              { label: "Careers", href: "/careers", delay: "0.45s" },
              { label: "Contact Us", href: "/contact", delay: "0.5s" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="menu-item text-2xl md:text-4xl font-display font-bold uppercase tracking-tighter text-brand-gray hover:text-brand-black transition-colors w-fit"
                style={{ transitionDelay: item.delay }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}