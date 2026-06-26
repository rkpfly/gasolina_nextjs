import { useEffect, useState } from 'react';
import { EqLoader } from '../Loader';

export default function VipModal({ event, onClose }: { event: any; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const eventLocation = event.location?.type === "offline" && event.location.customVenue
      ? event.location.customVenue.address
      : "Online Event";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Grab the data natively from the form elements using FormData
    const formData = new FormData(e.currentTarget);
    const payload = {
      eventId: event._id,
      eventName: event.basicInfo?.name,
      eventDate: event.basicInfo?.date,
      eventLocation: eventLocation,
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      guests: formData.get('guests'),
    };

    try {
      const res = await fetch('/api/v1/events/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Submission failed');

      setIsSuccess(true);
      setTimeout(() => onClose(), 2500);

    } catch (error) {
      console.error(error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-ink/70 backdrop-blur-md animate-backdrop"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl overflow-hidden modal-neon-ring animate-modal-pop">

        {/* Neon top accent */}
        <span
          aria-hidden
          className="absolute top-0 left-0 h-1 w-full bg-[linear-gradient(90deg,#723CF4,#6CFB13,#723CF4)] bg-size-[200%_auto] animate-gradient"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-brand-offwhite/50">
          <div>
            <h3 className="text-sm font-display font-bold tracking-[0.2em] uppercase text-brand-black">
              VIP Booking Request
            </h3>
            <p className="text-[10px] text-brand-gray tracking-widest uppercase mt-1">
              Event ID: {event._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-brand-black/60 hover:text-brand-black hover:bg-gray-200 transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-lime text-brand-black glow-lime rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-2xl" />
              </div>
              <h4 className="text-xl font-bold uppercase tracking-tight text-brand-black mb-2">Request Received</h4>
              <p className="text-sm text-brand-gray">Our VIP concierge will be in touch with you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName" // <-- ADDED
                  required
                  className="w-full px-4 py-3 bg-brand-offwhite border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email" // <-- ADDED
                  required
                  className="w-full px-4 py-3 bg-brand-offwhite border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone" // <-- ADDED
                  required
                  className="w-full px-4 py-3 bg-brand-offwhite border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="+61 400 000 000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray mb-2">Number of Guests (Optional)</label>
                <input
                  type="number"
                  name="guests" // <-- ADDED
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 bg-brand-offwhite border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  placeholder="e.g. 5"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-glow glow-on-pink mt-4 w-full py-4 rounded-full text-xs font-bold tracking-[0.15em] uppercase text-center bg-brand-black text-white hover:bg-gray-800 disabled:opacity-70 disabled:hover:translate-y-0 transition-all duration-300"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? (<><EqLoader tone="blue" bars={4} /> Submitting…</>) : 'Submit VIP Request'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}