import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import MaritimeNetwork from './MaritimeNetwork';

const HeroSection = ({ onLoginLogistics, onLoginVessel }) => {
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const ctasRef = useRef(null);
  const stripRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      if (headingRef.current) {
        tl.fromTo(headingRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,transform' });
      }
      if (subRef.current) {
        tl.fromTo(subRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'opacity,transform' });
      }
      if (ctasRef.current && ctasRef.current.children.length > 0) {
        tl.fromTo(
          ctasRef.current.children,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'opacity,transform' },
          '-=0.3'
        );
      }
      if (stripRef.current && stripRef.current.children.length > 0) {
        tl.fromTo(
          stripRef.current.children,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'opacity,transform' },
          '-=0.2'
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const scrollToRole = (e) => {
    e.preventDefault();
    document.querySelector('#choose-role')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPlatform = (e) => {
    e.preventDefault();
    document.querySelector('#platform')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F4FAFD 100%)',
        borderBottom: '1px solid #D9E6EF',
      }}
    >
      {/* Background Maritime Map & Shipping Network Visualization */}
      <MaritimeNetwork />

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '96px 32px 42px',
          width: '100%',
        }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#EAF6FC',
            border: '1px solid #CFE7F5',
            borderRadius: '999px',
            padding: '5px 14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0B82C9' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0B82C9', letterSpacing: '0.08em' }}>
            ENTERPRISE MARITIME INTELLIGENCE
          </span>
        </div>

        {/* Main heading */}
        <h1
          ref={headingRef}
          style={{
            fontSize: 'clamp(34px, 4.6vw, 62px)',
            fontWeight: 800,
            color: '#122F55',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            maxWidth: '840px',
          }}
        >
          Intelligent Freight Decisions <br />
          <span style={{ color: '#0B82C9' }}>for Global Bulk Cargo</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          style={{
            fontSize: 'clamp(15px, 1.35vw, 18px)',
            color: '#23466B',
            lineHeight: 1.6,
            maxWidth: '620px',
            marginBottom: '32px',
            fontWeight: 400,
          }}
        >
          BulkMatrix helps logistics managers and vessel owners make smarter chartering, freight,
          weather and operational decisions with real-time maritime intelligence.
        </p>

        {/* Hero CTAs */}
        <div
          ref={ctasRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            marginBottom: '42px',
          }}
        >
          {/* Primary CTA: Get Started */}
          <button
            id="hero-get-started-btn"
            onClick={scrollToRole}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
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
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Secondary CTA: Explore Platform */}
          <button
            id="hero-explore-btn"
            onClick={scrollToPlatform}
            style={{
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
            Explore Platform
          </button>
        </div>

        {/* Metric / feature strip (4 capabilities) */}
        <div
          id="hero-capability-strip"
          ref={stripRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            borderTop: '1px solid #D9E6EF',
            paddingTop: '28px',
            marginTop: '36px',
            position: 'relative',
            zIndex: 3,
            opacity: 1,
            visibility: 'visible',
          }}
        >
          {[
            {
              label: 'FREIGHT FORECASTING',
              desc: 'Market trends & rate prediction',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
            },
            {
              label: 'VESSEL SUITABILITY',
              desc: 'Deadweight & berth optimization',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                </svg>
              ),
            },
            {
              label: 'WEATHER INTELLIGENCE',
              desc: 'Wave risk & route advisory',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
                </svg>
              ),
            },
            {
              label: 'PORT READINESS',
              desc: 'Berth waiting & congestion status',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                background: '#FFFFFF',
                border: '1px solid #D9E6EF',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(18, 47, 85, 0.04)',
                transition: 'all 200ms ease',
                opacity: 1,
                visibility: 'visible',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0B82C9';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(18, 47, 85, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D9E6EF';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(18, 47, 85, 0.04)';
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  background: '#EAF6FC',
                  border: '1px solid #D0E6F4',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#122F55', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12.5px', color: '#5F7894', marginTop: '2px', fontWeight: 500, lineHeight: 1.3 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
