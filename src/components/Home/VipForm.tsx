import { motion, AnimatePresence, Variants } from 'framer-motion';
import LeadForm from '../LeadForm';

// Single, overflow-safe entrance — scale + fade + a small vertical rise.
// (No horizontal translate, which previously pushed the panel past the viewport.)
const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 24 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 26, stiffness: 320, mass: 0.9 },
  },
  exit: { opacity: 0, scale: 0.97, y: 12, transition: { duration: 0.22, ease: 'easeIn' } },
};

export default function VIPForm({
  vipModal,
  setVipModal,
}: {
  vipModal: boolean;
  setVipModal: (value: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {vipModal && (
        /* Full-screen overlay — clips anything beyond the viewport (overflow-hidden) */
        <motion.div
          className="fixed inset-0 z-[999] flex items-start md:items-center justify-center bg-brand-ink/80 backdrop-blur-md px-4 pt-28 md:pt-8 pb-6 overflow-hidden"
          onClick={() => setVipModal(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Ambient neon glow behind the panel (size-capped so it can't widen the layout) */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[20rem] w-[20rem] max-w-[90vw] rounded-full blur-3xl opacity-70 animate-glow-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(114,60,244,0.35) 0%, rgba(108,251,19,0.18) 45%, transparent 72%)',
            }}
          />

          {/* The Modal Box itself — never exceeds the viewport width */}
          <motion.div
            className="vip-form relative flex flex-col gap-6 sm:gap-3 w-full max-w-md min-w-0 max-h-[calc(100svh-9rem)] bg-brand-ink p-6 md:p-8 border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_44px_-8px_rgba(114,60,244,0.5),0_0_70px_-14px_rgba(108,251,19,0.28)] overflow-x-hidden overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: 'center' }}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Neon top accent */}
            <span
              aria-hidden
              className="absolute top-0 left-0 h-1 w-full bg-[linear-gradient(90deg,#723CF4,#6CFB13,#723CF4)] bg-size-[200%_auto] animate-gradient"
            />

            {/* Close */}
            <button
              onClick={() => setVipModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-brand-white/60 transition-colors hover:bg-white/10 hover:text-brand-white cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>

            <div className="text-center mt-1 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-club-green mb-2">
                The Guest List
              </p>
              <h3 className="text-xl font-display font-extrabold uppercase tracking-widest text-brand-white">
                Request VIP Access
              </h3>
            </div>

            <LeadForm
              fields={['f_name', 'l_name', 'email', 'phone', 'total_guests']}
              formType="vip_table_request"
              buttonText="Become a VIP"
              tone="dark"
            />

            <p
              onClick={() => setVipModal(false)}
              className="text-brand-gray text-sm font-inter font-[600] uppercase tracking-widest text-center cursor-pointer hover:text-brand-white transition-colors w-24 self-center mt-2"
            >
              Later
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
