import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeadForm from '../LeadForm';

// 1. Define the separate animation configurations
const modalVariants: Variants = {
  // --- MOBILE CONFIG (Swoop & Rotate) ---
  mobileInitial: { 
    opacity: 0, 
    x: "100vw", 
    y: -60, 
    rotate: -12 
  },
  mobileAnimate: { 
    opacity: 1, 
    x: 0, 
    y: 0, 
    rotate: 0,
    transition: { type: "spring", damping: 14, stiffness: 75 }
  },
  mobileExit: { 
    opacity: 0, 
    x: "100vw", 
    y: -60, 
    rotate: -12, 
    transition: { duration: 0.3, ease: "easeInOut" } 
  },

  // --- DESKTOP CONFIG (Sleek spring pop) ---
  desktopInitial: {
    opacity: 0,
    scale: 0.92,
    y: 26,
    x: 0,
    rotate: 0
  },
  desktopAnimate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 340, mass: 0.9 }
  },
  desktopExit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.22, ease: "easeIn" }
  }
};

export default function VIPForm({
    vipModal,
    setVipModal
}: {
    vipModal: boolean;
    setVipModal: (value: boolean) => void;
}) {
  // 2. Check if the screen is under 500px
  const isMobile = useMediaQuery('(max-width: 500px)');

  return (
    <AnimatePresence>
      {vipModal && (
        /* Full-screen overlay wrapper */
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-brand-ink/60 backdrop-blur-md p-4 overflow-hidden"
          onClick={() => setVipModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Ambient neon glow behind the panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[26rem] w-[26rem] rounded-full blur-3xl opacity-70 animate-glow-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(62,111,245,0.30) 0%, rgba(255,46,147,0.20) 45%, transparent 72%)",
            }}
          />

          {/* The Modal Box itself */}
          <motion.div
            className="relative flex flex-col gap-6 sm:gap-3 w-full max-w-md max-h-[90vh] bg-white p-6 md:p-8 rounded-2xl modal-neon-ring overflow-y-auto"
            onClick={(e) => e.stopPropagation()}

            // 3. Conditionally apply transform origin
            style={{ transformOrigin: isMobile ? "bottom right" : "center" }}

            // 4. Connect the variants and conditionally switch paths
            variants={modalVariants}
            initial={isMobile ? "mobileInitial" : "desktopInitial"}
            animate={isMobile ? "mobileAnimate" : "desktopAnimate"}
            exit={isMobile ? "mobileExit" : "desktopExit"}
          >
            {/* Neon top accent */}
            <span
              aria-hidden
              className="absolute top-0 left-0 h-1 w-full rounded-t-2xl bg-[linear-gradient(90deg,#FF2E93,#7C5CFF,#3E6FF5,#C6F94B)] bg-size-[200%_auto] animate-gradient"
            />

            {/* Close */}
            <button
              onClick={() => setVipModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-brand-black/60 transition-colors hover:bg-brand-offwhite hover:text-brand-black cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <div className="text-center mt-1 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent mb-2">
                The Guest List
              </p>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-widest text-brand-black">
                Request VIP Access
              </h3>
            </div>

            <LeadForm
              fields={['f_name', 'l_name', 'email', 'phone', 'city', 'dob', 'total_guests']}
              formType="vip_table_request"
              buttonText="Become a VIP"
            />

            <p
              onClick={() => setVipModal(false)}
              className="text-brand-gray text-sm font-inter font-[600] tracking-widest text-center cursor-pointer hover:text-brand-black transition-colors w-24 self-center mt-2"
            >
              Later
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}