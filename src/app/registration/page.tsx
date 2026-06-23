'use client';

import { useRef, useState } from 'react';
import './registration.css'; // static stylesheet → no FOUC (was styled-jsx, injected at runtime)

type Status = 'idle' | 'submitting' | 'done' | 'error';

// CSS-var styles need a small cast to satisfy TS.
const v = (delay: string) => ({ ['--d']: delay } as React.CSSProperties);

// Country dial codes for the phone field. Defaults to AU (+61); changeable.
const COUNTRIES = [
  { iso: 'AU', dial: '+61', label: 'AU +61' },
  { iso: 'NZ', dial: '+64', label: 'NZ +64' },
  { iso: 'GB', dial: '+44', label: 'GB +44' },
  { iso: 'US', dial: '+1', label: 'US +1' },
  { iso: 'IN', dial: '+91', label: 'IN +91' },
  { iso: 'SG', dial: '+65', label: 'SG +65' },
  { iso: 'AE', dial: '+971', label: 'AE +971' },
  { iso: 'CA', dial: '+1', label: 'CA +1' },
  { iso: 'ID', dial: '+62', label: 'ID +62' },
  { iso: 'PH', dial: '+63', label: 'PH +63' },
];

export default function RegistrationPage() {
  const [status, setStatus] = useState<Status>('done');
  const [error, setError] = useState<string | null>(null);
  const [cc, setCc] = useState('AU'); // selected country (ISO)
  const videoRef = useRef<HTMLVideoElement>(null);

  const sent = status === 'done';
  const dial = COUNTRIES.find((c) => c.iso === cc)?.dial ?? '+61';

  // Background video: play once, then hold the final frame.
  const handleEnded = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    if (isFinite(el.duration)) el.currentTime = Math.max(0, el.duration - 0.04);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    const fd = new FormData(formEl);
    // national number → digits only, drop any trunk 0, then prefix the dial code → E.164
    const nationalNumber = String(fd.get('phone') || '').replace(/\D/g, '').replace(/^0+/, '');
    const payload = {
      email: String(fd.get('email') || '').trim(),
      phone: `${dial}${nationalNumber}`,
      countryCode: dial,
      name: String(fd.get('name') || '').trim(),
    };

    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/v1/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('done'); // flips the card to the back face
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="reg-scene">
      {/* ░░░ Background ░░░ */}
      <div className="background-wrapper" aria-hidden="true">
        <video ref={videoRef} autoPlay muted playsInline onEnded={handleEnded}>
          <source src="/registration/bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="overlay" aria-hidden="true" />

      {/* ░░░ Form ░░░ */}
      <div className="container">
        <div className={`flip${sent ? ' is-sent' : ''}`}>
          <div className="flip-inner">

            {/* FRONT */}
            <div className="access-card card-front" aria-hidden={sent}>
              <img
                className="title-img reveal"
                style={v('.35s')}
                src="/registration/title.png"
                alt="The city is about to get LOUDER."
              />
              <div className="accent-line" style={v('.25s')} />

              <form noValidate onSubmit={handleSubmit}>
                <div className="field reveal" style={v('.55s')}>
                  <input type="email" id="email" name="email" placeholder=" " required autoComplete="email" />
                  <label htmlFor="email">Email</label>
                  <span className="underline" />
                </div>

                <div className="field phone reveal" style={v('.65s')}>
                  <label htmlFor="phone">Mobile</label>
                  <div className="phone-row">
                    <select
                      className="cc"
                      aria-label="Country code"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso}>{c.label}</option>
                      ))}
                    </select>
                    <input type="tel" id="phone" name="phone" inputMode="tel" placeholder=" " required autoComplete="tel" />
                  </div>
                  <span className="underline" />
                </div>

                <div className="field reveal" style={v('.75s')}>
                  <input type="text" id="name" name="name" placeholder=" " autoComplete="name" />
                  <label htmlFor="name">Name (optional)</label>
                  <span className="underline" />
                </div>

                <button
                  type="submit"
                  className="btn reveal"
                  style={v('.85s')}
                  disabled={status === 'submitting'}
                  aria-busy={status === 'submitting'}
                  aria-label={status === 'submitting' ? 'Sending' : undefined}
                >
                  <span>
                    {status === 'submitting' ? (
                      <span className="eq" aria-hidden="true">
                        <i /><i /><i /><i /><i />
                      </span>
                    ) : (
                      'Request Access'
                    )}
                  </span>
                </button>

                {status === 'error' && (
                  <p className="form-error" role="alert">{error}</p>
                )}
              </form>

              <p className="footer-note reveal" style={v('.95s')}>
                First access to perks, pre-sale tickets and offers.
              </p>
            </div>

            {/* BACK */}
            <div className="access-card card-back" aria-hidden={!sent}>
              <div className="back-inner">
                <svg className="check" viewBox="0 0 52 52" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" />
                  <path d="M14 27l8 8 16-16" />
                </svg>
                <h2>You&apos;re in.</h2>
                <p>You&apos;ll be the first to get perks, plus pre-sale access to tickets and offers.</p>
                <a
                  className="ig-btn"
                  href="https://www.instagram.com/loudersaturdays/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                >
                  <i className="fab fa-instagram" aria-hidden="true" />
                  Follow us
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
