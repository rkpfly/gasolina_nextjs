"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { EqLoader } from "@/components/Loader";

// Helper to preserve TipTap empty paragraphs
function preserveEmptyParagraphs(html: string): string {
  if (!html) return '';
  return html.replace(/<p><\/p>/g, '<p>&nbsp;</p>');
}

export default function JobClientView({ job }: { job: any }) {
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for the success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  // Extract HTML whether it's stored as raw text or wrapped in { html: "..." }
  const htmlContent = typeof job.content === 'object' && job.content !== null 
    ? job.content.html 
    : job.content;

  // Scroll logic
  const handleApplyClick = () => {
    setIsFormExpanded(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('jobId', job.job_id.toString());

      const res = await fetch('/api/v1/applications', {
        method: 'POST',
        body: formData, 
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit application');
      }

      // Show custom modal instead of alert
      setShowSuccessModal(true);
      
      // Clear the form and retract the panel in the background
      e.currentTarget.reset();
      setFileName(null);
      setIsFormExpanded(false);

    } catch (error: any) {
      alert(error.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll reveal animations
  useEffect(() => {
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
    return () => observer.disconnect();
  }, []);

  return (
    <main className="w-full selection:bg-brand-black selection:text-white bg-brand-white min-h-screen relative">
      
      {/* ── HERO SECTION ── */}
      <section className="bg-brand-black text-brand-white pt-40 md:pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        
        <div className="max-w-[1000px] mx-auto relative z-10 fade-up">
          <Link href="/careers" className="inline-flex items-center text-xs font-bold tracking-[0.2em] uppercase text-brand-gray hover:text-brand-white transition-colors mb-8">
            <i className="fa-solid fa-arrow-left mr-3"></i> Back to Careers
          </Link>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 border border-brand-border/30 rounded-full text-brand-gray">
              {job.department || 'General'}
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 bg-brand-white/10 rounded-full text-brand-white">
              <i className="fa-solid fa-location-dot mr-1.5"></i> {job.location || 'Remote'}
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 bg-brand-accent/20 text-brand-accent rounded-full">
              {job.employment_type.replace('_', ' ')}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] mb-10">
            {job.designation}
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t border-brand-border/30 pt-8">
            <button 
              onClick={handleApplyClick}
              className="group relative overflow-hidden inline-flex items-center justify-center px-10 py-5 text-xs font-bold tracking-[0.15em] uppercase bg-brand-white text-brand-black transition-colors duration-300"
            >
              <div className="absolute top-full left-0 w-full h-full bg-brand-accent transition-all duration-[400ms] ease-custom z-10 group-hover:top-0"></div>
              <span className="relative z-20">Apply Now</span>
            </button>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-brand-gray">
              <i className="fa-solid fa-star mr-2"></i> {job.experience_label || `${job.experience_min}-${job.experience_max} Years Exp.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── TIPTAP CONTENT SECTION ── */}
      <section className="py-20 px-6 md:px-12 bg-brand-white">
        <div className="max-w-[800px] mx-auto fade-up">
          <article 
            className="
              prose prose-lg max-w-none text-brand-black
              prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-brand-black
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-brand-gray prose-p:leading-relaxed prose-p:font-medium
              prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-brand-black prose-strong:font-bold
              prose-ul:list-square prose-ul:text-brand-gray
              prose-li:marker:text-brand-accent
            "
            dangerouslySetInnerHTML={{ __html: preserveEmptyParagraphs(htmlContent) }}
          />

          {/* Bottom Trigger Button */}
          {!isFormExpanded && (
            <div className="mt-16 pt-16 border-t border-brand-border text-center fade-up">
              <h3 className="text-3xl font-display font-bold uppercase tracking-tighter text-brand-black mb-6">
                Ready to take the stage?
              </h3>
              <button 
                onClick={handleApplyClick}
                className="group relative overflow-hidden inline-flex items-center justify-center px-10 py-5 text-xs font-bold tracking-[0.15em] uppercase bg-brand-black text-brand-white transition-colors duration-300"
              >
                <div className="absolute top-full left-0 w-full h-full bg-brand-accent transition-all duration-[400ms] ease-custom z-10 group-hover:top-0"></div>
                <span className="relative z-20">Start Application</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── EXPANDABLE APPLICATION FORM ── */}
      <div 
        ref={formRef}
        className={`w-full overflow-hidden transition-all duration-[800ms] ease-custom bg-brand-offwhite border-t border-brand-border ${
          isFormExpanded ? 'max-h-[2000px] opacity-100 py-24' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <div className="mb-12">
            <h3 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-brand-black mb-2">
              Apply For <span className="text-transparent [-webkit-text-stroke:1px_#0A0A0A]">{job.designation}</span>
            </h3>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gray pb-6 border-b border-brand-border">
              Submit your details and resume below.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <input name="firstName" type="text" placeholder="FIRST NAME *" required className="w-full bg-transparent border-b border-brand-black pb-2 text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-blue text-brand-black placeholder-brand-gray rounded-none" />
                </div>
                <div>
                    <input name="lastName" type="text" placeholder="LAST NAME *" required className="w-full bg-transparent border-b border-brand-black pb-2 text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-blue text-brand-black placeholder-brand-gray rounded-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-end border-b border-brand-black pb-2 transition-colors focus-within:border-brand-blue group">
                    <div className="flex items-center gap-2 mr-4 text-xs font-bold tracking-widest text-brand-black">
                        <span>+91</span>
                    </div>
                    <input name="phone" type="tel" placeholder="PHONE NUMBER *" required className="w-full bg-transparent text-xs font-bold tracking-[0.15em] uppercase outline-none placeholder-brand-gray text-brand-black rounded-none" />
                </div>
                <div>
                    <input name="email" type="email" placeholder="EMAIL ADDRESS *" required className="w-full bg-transparent border-b border-brand-black pb-2 text-xs font-bold tracking-[0.15em] uppercase outline-none transition-colors duration-300 focus:border-brand-blue text-brand-black placeholder-brand-gray rounded-none" />
                </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold tracking-[0.15em] uppercase text-brand-black mb-4">
                Resume / CV (PDF, DOC) *
              </label>
              <div className="relative group">
                <input 
                  name="resume" 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="w-full border-2 border-dashed border-brand-black/20 group-hover:border-brand-accent transition-colors duration-300 rounded-xl p-8 flex flex-col items-center justify-center bg-brand-white text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-offwhite flex items-center justify-center mb-3 group-hover:bg-brand-accent group-hover:text-brand-black transition-colors text-brand-black">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-brand-black mb-1">
                    {fileName ? fileName : 'Click or drag file to upload'}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gray">
                    Max file size: 10MB
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative overflow-hidden inline-flex items-center justify-center w-full py-6 text-xs font-bold tracking-[0.15em] uppercase mt-4 bg-brand-black text-white transition-colors duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
                <div className="absolute top-full left-0 w-full h-full bg-brand-accent transition-all duration-[400ms] ease-custom z-10 group-hover:top-0"></div>
                <span className="relative z-20 inline-flex items-center gap-2">{isSubmitting ? <><EqLoader tone="white" bars={4} /> Submitting...</> : 'Submit Application'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${
          showSuccessModal ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
          onClick={() => setShowSuccessModal(false)}
        ></div>
        
        <div 
          className={`relative bg-brand-white p-10 md:p-14 max-w-lg w-[calc(100%-2rem)] flex flex-col items-center text-center transition-all duration-500 delay-100 border border-brand-border ${
            showSuccessModal ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <i className="fa-solid fa-circle-check text-5xl text-brand-accent mb-6"></i>
          
          <h3 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter text-brand-black mb-4">
            Application<br />Received
          </h3>
          
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-brand-gray mb-10 leading-relaxed">
            Thank you for applying for the <span className="text-brand-black">{job.designation}</span> position. Our team will review your profile and get back to you soon.
          </p>

          <button 
            onClick={() => setShowSuccessModal(false)}
            className="group relative overflow-hidden inline-flex items-center justify-center w-full py-5 text-xs font-bold tracking-[0.15em] uppercase bg-brand-black text-brand-white transition-colors duration-300"
          >
            <div className="absolute top-full left-0 w-full h-full bg-brand-accent transition-all duration-[400ms] ease-custom z-10 group-hover:top-0"></div>
            <span className="relative z-20">Close & Return</span>
          </button>
        </div>
      </div>

    </main>
  );
}