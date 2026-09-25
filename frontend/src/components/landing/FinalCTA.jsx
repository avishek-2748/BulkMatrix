import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FinalCTA = ({ onLoginLogistics, onLoginVessel }) => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current?.children || [], {
        opacity: 0,
        y: 25,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: contentRef.current, start: 'top 80%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#F4FAFD',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #D9E6EF',
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 32px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: '#EAF6FC',
            border: '1px solid #CFE7F5',
            color: '#0B82C9',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '20px',
          }}
        >
          READY TO OPTIMIZE YOUR VOYAGES?
        </div>

        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 800,
            color: '#122F55',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: '16px',
          }}
        >
          Make Every Chartering Decision <br />
          <span style={{ color: '#0B82C9' }}>With Better Intelligence.</span>
        </h2>

        <p
          style={{
            fontSize: 'clamp(15px, 1.5vw, 17px)',
            color: '#5F7894',
            lineHeight: 1.65,
            maxWidth: '580px',
            margin: '0 auto 40px',
          }}
        >
          Bring freight forecasting, vessel suitability, weather risk, and port congestion
          together into one unified maritime decision platform.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
          }}
        >
          <button
            id="final-cta-logistics"
            onClick={onLoginLogistics}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              background: '#FF7426',
              border: 'none',
              borderRadius: '11px',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(255, 116, 38, 0.28)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F5661F';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 116, 38, 0.38)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF7426';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 116, 38, 0.28)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Login as Logistics Manager
          </button>

          <button
            id="final-cta-vessel"
            onClick={onLoginVessel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              background: '#FFFFFF',
              border: '1.5px solid #BFD5E4',
              borderRadius: '11px',
              color: '#122F55',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
              boxShadow: '0 1px 3px rgba(18, 47, 85, 0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F8FC';
              e.currentTarget.style.borderColor = '#0B82C9';
              e.currentTarget.style.color = '#0B82C9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#BFD5E4';
              e.currentTarget.style.color = '#122F55';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            Login as Vessel Owner
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
