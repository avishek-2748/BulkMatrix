import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    title: 'Market Data Ingestion',
    desc: 'Historical freight rates, current spot fixtures, and vessel AIS locations enter the platform.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Multi-Factor Intelligence',
    desc: 'BulkMatrix synthesizes freight forecasts, port congestion, weather conditions, and vessel specs.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Actionable Recommendations',
    desc: 'The platform identifies optimal charter timing, suitable fleet matches, and voyage risk profiles.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Execution & Monitoring',
    desc: 'Logistics and vessel teams execute confident charters and monitor real-time voyage progress.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const lineRef = useRef(null);
  const headingRef = useRef(null);

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

      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleX: 0,
          duration: 1.2,
          ease: 'power2.inOut',
          transformOrigin: 'left center',
          scrollTrigger: { trigger: lineRef.current, start: 'top 80%', once: true },
        });
      }

      stepsRef.current.forEach((step, i) => {
        if (!step) return;
        gsap.from(step, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power2.out',
          delay: i * 0.1,
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{
        background: '#F4FAFD',
        padding: '96px 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #D9E6EF',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        {/* Section Heading */}
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
              marginBottom: '14px',
            }}
          >
            ● WORKFLOW ARCHITECTURE
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '14px',
            }}
          >
            How BulkMatrix Powers <span style={{ color: '#0B82C9' }}>Your Decisions</span>
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#23466B',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            From raw maritime data to high-confidence operational action in four clear stages.
          </p>
        </div>

        {/* Steps Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            position: 'relative',
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => (stepsRef.current[i] = el)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D9E6EF',
                borderRadius: '16px',
                padding: '30px 24px',
                boxShadow: '0 4px 20px rgba(18,47,85,0.06)',
                position: 'relative',
                transition: 'all 0.22s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#0B82C9';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(18,47,85,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#D9E6EF';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(18,47,85,0.06)';
              }}
            >
              {/* Step Number & Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: '#0B82C9',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {step.num}
                </span>

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    background: '#EAF6FC',
                    border: '1px solid #D3EAF6',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {step.icon}
                </div>
              </div>

              {/* Title & Desc */}
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#122F55',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#5F7894',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
