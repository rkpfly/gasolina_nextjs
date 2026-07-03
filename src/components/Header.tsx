"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Brand runs electric-blue across the public site.
  const navHover = "hover:text-brand-blue";

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  // Header-bar elements: hide instantly on open, fade back in (delayed) on close.
  const revealOnClose = isMenuOpen
    ? "opacity-0 pointer-events-none delay-0"
    : "opacity-100 delay-200";

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 w-full z-9999 py-2 sm:py-4 md:py-6 px-4 sm:px-6 md:px-12 flex justify-between items-center transition-colors duration-300 ${
          isMenuOpen ? "bg-transparent" : "bg-brand-black/90 backdrop-blur-md border-b border-white/10"
        }`}
      >
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Louder"
          className={`flex items-center mt-1 sm:mt-1.5 md:mt-2 ml-1 sm:ml-2 md:ml-3 transition-opacity duration-500 ${
            isMenuOpen
              ? "opacity-0 pointer-events-none delay-0"
              : "opacity-100 pointer-events-auto delay-200"
          }`}
        >
          <Image
            src="/louderSaturdaysLogo.png"
            alt="Louder Saturdays"
            width={814}
            height={162}
            priority
            className="h-6 sm:h-7 md:h-9 w-auto transition-opacity duration-500 hover:opacity-80"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className={`hidden lg:flex space-x-8 lg:space-x-12 items-center text-xs font-semibold tracking-[0.15em] uppercase text-white transition-opacity duration-500 ${revealOnClose}`}
        >
          <Link href="/book" className={`${navHover} transition-colors`}>
            Book
          </Link>
          <Link href="/gallery" className={`${navHover} transition-colors`}>
            Gallery
          </Link>
          <Link href="/offers" className={`${navHover} transition-colors`}>
            Offers
          </Link>
          <Link href="/vip" className={`${navHover} transition-colors`}>
            VIP
          </Link>
          <Link href="/offers/birthday" className={`${navHover} transition-colors`}>
            Birthday
          </Link>
          <Link href="/offers/hens" className={`${navHover} transition-colors`}>
            Hens
          </Link>
          <Link href="/careers#apply" className={`${navHover} transition-colors`}>
            Party & Earn
          </Link>
        </nav>

        {/* Right cluster: Party & Earn + Reserve + hamburger */}
        <div className="flex items-center gap-3 sm:gap-4 relative z-[60]">
          <Link
            href="/book"
            className={`btn-glow glow-on-blue bg-brand-blue text-brand-white hover:bg-brand-white hover:text-brand-black hidden lg:inline-flex items-center text-xs font-bold tracking-[0.14em] uppercase px-5 py-2.5 transition-all duration-500 ${revealOnClose}`}
          >
            <span>Reserve</span>
          </Link>

          <button
            id="menu-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col justify-center items-end gap-1 sm:gap-1.5 group cursor-pointer ${
              isMenuOpen ? " menu-open" : ""
            }`}
            aria-label="Toggle Menu"
          >
            <span className="ham-line ham-top w-6 sm:w-8 h-0.5 bg-white group-hover:w-full" />
            <span className="ham-line ham-mid w-full h-0.5 bg-white" />
            <span className="ham-line ham-bot w-5 sm:w-6 h-0.5 bg-white group-hover:w-full" />
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        id="menu-overlay"
        className={`fixed inset-0 bg-brand-black z-50 flex flex-col justify-center px-4 sm:px-6 md:px-24 pt-20 pb-10 overflow-y-auto${
          isMenuOpen ? " open" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 w-full max-w-[1600px] mx-auto h-full items-center">
          <nav className="flex flex-col space-y-3 sm:space-y-4 md:space-y-6">
            {[
              { label: "Home", href: "/" },
              { label: "Book", href: "/book" },
              { label: "Gallery", href: "/gallery" },
              { label: "Blogs", href: "/blogs" },
              // { label: "Party & Earn", href: "/careers#apply" },
            ].map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="menu-item menu-primary text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter text-brand-white w-fit"
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col space-y-4 md:space-y-6 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-brand-blue mb-1">
              Index
            </span>
            {[
              { label: "Offers", href: "/offers", delay: "0.3s" },
              { label: "Private Events", href: "/private-events", delay: "0.45s" },
              { label: "VIP Reservations", href: "/vip", delay: "0.5s" },
              { label: "Corporate Galas", href: "/corporate", delay: "0.55s" },
              { label: "Careers", href: "/careers", delay: "0.6s" },
              { label: "Contact Us", href: "/contact", delay: "0.65s" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="menu-item menu-secondary text-2xl md:text-4xl font-display font-bold uppercase tracking-tighter text-brand-gray w-fit"
                style={{ animationDelay: item.delay }}
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
