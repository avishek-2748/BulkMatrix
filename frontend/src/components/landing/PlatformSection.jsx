import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Freight Forecasting',
    desc: 'Compare current freight spot conditions with predicted market movement to pinpoint optimal chartering windows.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    title: 'Vessel Intelligence',
    desc: 'Evaluate vessel suitability based on dimensions, draft restrictions, cargo compatibility, and port limitations.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
        <path d="M15 13l-3 3-2-2" />
      </svg>
    ),
    title: 'Weather Intelligence',
    desc: 'Monitor maritime conditions and wave/wind hazards that affect route safety, speed, and port berthing schedules.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Port Intelligence',
    desc: 'Track port turnaround times, berth congestion, operational bottlenecks, and destination discharge readiness.',
  },
];

const PlatformSection = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current?.children || [], {
        opacity: 0,
        y: 25,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 80%', once: true },
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="platform"
      ref={sectionRef}
      style={{
        background: '#FFFFFF',
        padding: '96px 0',
        borderBottom: '1px solid #D9E6EF',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        {/* Heading */}
        <div ref={headingRef} style={{ textAlign: 'center', marginBottom: '60px' }}>
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
              marginBottom: '16px',
            }}
          >
            PLATFORM CAPABILITIES
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            One Intelligence Layer for <br />
            <span style={{ color: '#0B82C9' }}>Bulk Maritime Operations</span>
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#5F7894',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            BulkMatrix connects freight markets, vessel data, port conditions, weather intelligence,
            and operational insights to help maritime teams make data-driven chartering decisions.
          </p>
        </div>

        {/* Feature cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D9E6EF',
                borderRadius: '16px',
                padding: '32px 26px',
                boxShadow: '0 4px 20px rgba(18, 47, 85, 0.05)',
                cursor: 'default',
                transition: 'all 0.22s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-2px)';
                el.style.borderColor = '#0B82C9';
                el.style.boxShadow = '0 8px 26px rgba(18, 47, 85, 0.09)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = '#D9E6EF';
                el.style.boxShadow = '0 4px 20px rgba(18, 47, 85, 0.05)';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#EAF6FC',
                  border: '1px solid #D3EAF6',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}
              >
                {feature.icon}
              </div>

              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#122F55',
                  marginBottom: '10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#5F7894',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
