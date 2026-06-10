import Link from "next/link";
import { query } from '@/lib/database/db'; 
import FadeUp from "@/components/FadeUp"; // Import the new wrapper

interface FooterCity {
  display_name: string;
  slug: string;
}

interface FooterSocial {
  platform: string;
  label: string;
  href: string;
  icon_class: string;
}

interface FooterContact {
  phone1: string;
  phone2: string;
  email: string;
  copy_year: number;
}

export default async function Footer() {
  let cities: FooterCity[] = [];
  let socials: FooterSocial[] = [];
  let contact: FooterContact | null = null;

  try {
    const [citiesResult, socialsResult, contactResult] = await Promise.all([
      query(`
        SELECT 
          COALESCE(footer_label, title) AS display_name, 
          slug 
        FROM city_pages 
        ORDER BY display_name ASC
      `, []),
      query(`
        SELECT platform, label, href, icon_class 
        FROM "FooterSocials" 
        WHERE is_active = true 
        ORDER BY sort_order ASC
      `, []),
      query(`
        SELECT phone1, phone2, email, copy_year 
        FROM "FooterContact" 
        WHERE is_active = true 
        ORDER BY id DESC 
        LIMIT 1
      `, [])
    ]);
    
    cities = citiesResult.rows;
    socials = socialsResult.rows;
    contact = contactResult.rows[0] || null; 
  } catch (error) {
    console.error('Failed to fetch footer data:', error);
  }

  const formatPhoneHref = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <footer className="bg-brand-white pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6 md:px-12">
      {/* Wrapped the main container in the FadeUp component */}
      <FadeUp className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 lg:gap-8 mb-16 sm:mb-20 md:mb-24 text-xs sm:text-sm font-medium">

          {/* Brand & Contact */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-lg sm:text-xl md:text-2xl font-display font-bold tracking-tighter uppercase text-brand-black flex items-center gap-1"
            >
              DAMI CLUB<span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-brand-accent rounded-full mb-2" />
            </Link>
            
            <div className="flex flex-col gap-1.5 sm:gap-2 text-brand-gray text-xs sm:text-sm">
              {contact?.phone1 && (
                <a href={formatPhoneHref(contact.phone1)} className="hover:text-brand-black transition-colors">
                  {contact.phone1}
                </a>
              )}
              {contact?.phone2 && (
                <a href={formatPhoneHref(contact.phone2)} className="hover:text-brand-black transition-colors">
                  {contact.phone2}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-brand-black transition-colors mt-1 sm:mt-2 text-brand-black font-semibold underline underline-offset-4"
                >
                  {contact.email}
                </a>
              )}
            </div>
          </div>

          {/* Territories */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <p className="text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase text-brand-black">Territories</p>
            <div className="grid grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-4 text-xs sm:text-sm text-brand-gray">
              {cities.length > 0 ? (
                cities.map((city) => (
                  <Link 
                    key={city.slug} 
                    href={`/city/${city.slug}`} 
                    className="hover:text-brand-black transition-colors"
                  >
                    {city.display_name}
                  </Link>
                ))
              ) : (
                <span className="col-span-2 text-gray-400 italic">No territories found</span>
              )}
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <p className="text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase text-brand-black">Legal</p>
            <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-brand-gray">
              <Link href="/privacy-policy" className="hover:text-brand-black transition-colors">Privacy Policy</Link>
              <Link href="/dress-code" className="hover:text-brand-black transition-colors">Dress Code</Link>
              <Link href="/terms" className="hover:text-brand-black transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <p className="text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase text-brand-black">Socials</p>
            <div className="flex gap-3 sm:gap-4 text-lg sm:text-xl text-brand-black">
              {socials.length > 0 ? (
                socials.map((social) => (
                  <a 
                    key={social.platform} 
                    href={social.href} 
                    aria-label={social.label} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-accent transition-colors"
                  >
                    <i className={social.icon_class} />
                  </a>
                ))
              ) : (
                <span className="text-gray-400 text-xs italic">No socials found</span>
              )}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-brand-border gap-3 sm:gap-4">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray text-center sm:text-left">
            © {contact?.copy_year || 2026} DamiBollywood Club. Owned by Louder World Pty Ltd.
          </p>
          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black">
            Designed for Nightlife
          </p>
        </div>
      </FadeUp>
    </footer>
  );
}