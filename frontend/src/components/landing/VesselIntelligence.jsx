import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VESSEL_SPECS = [
  { label: 'Vessel Type', value: 'Panamax Bulk Carrier', icon: '🚢' },
  { label: 'Deadweight (DWT)', value: '74,000 MT', icon: '⚓' },
  { label: 'Scantling Draft', value: '13.8 m', icon: '📏' },
  { label: 'Length Overall (LOA)', value: '228 m', icon: '↔' },
  { label: 'Moulded Beam', value: '32.3 m', icon: '⬌' },
  { label: 'Grain Capacity', value: '82,000 m³', icon: '📦' },
];

const VesselIntelligence = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const vesselRef = useRef(null);
  const specsRef = useRef(null);

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
      gsap.from(vesselRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: { trigger: vesselRef.current, start: 'top 82%', once: true },
      });
      gsap.from(specsRef.current?.children || [], {
        opacity: 0,
        x: 25,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: specsRef.current, start: 'top 82%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#FFFFFF',
        padding: '96px 0',
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
            ● FLEET & VESSEL INTELLIGENCE
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.2vw, 42px)',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '14px',
            }}
          >
            Match Cargo With the <span style={{ color: '#0B82C9' }}>Right Vessel</span>
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#23466B',
              maxWidth: '580px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Evaluate vessel suitability against cargo requirements, draft restrictions, and destination-port berthing constraints.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left: Vessel SVG Visualization */}
          <div
            ref={vesselRef}
            style={{
              background: '#F8FAFC',
              border: '1px solid #D9E6EF',
              borderRadius: '16px',
              padding: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(18,47,85,0.06)',
            }}
          >
            {/* Vessel SVG */}
            <svg viewBox="0 0 280 160" style={{ width: '100%', maxWidth: '280px' }} xmlns="http://www.w3.org/2000/svg">
              {/* Ocean waves */}
              <path
                d="M 0 120 Q 35 116 70 120 Q 105 124 140 120 Q 175 116 210 120 Q 245 124 280 120 L 280 160 L 0 160 Z"
                fill="#EAF6FC"
              />
              <path
                d="M 0 126 Q 30 122 60 126 Q 90 130 120 126 Q 150 122 180 126 Q 210 130 280 124 L 280 160 L 0 160 Z"
                fill="rgba(11,130,201,0.12)"
              />

              {/* Hull */}
              <path
                d="M 30 115 L 250 115 L 265 125 Q 270 130 265 133 L 15 133 Q 10 130 15 125 Z"
                fill="#122F55"
                stroke="#0B82C9"
                strokeWidth="1.5"
              />

              {/* Deck */}
              <rect x="35" y="90" width="210" height="25" rx="3" fill="#FFFFFF" stroke="#D9E6EF" strokeWidth="1" />

              {/* Cargo holds */}
              {[55, 100, 145, 190].map((x, i) => (
                <g key={i}>
                  <rect x={x} y="95" width="35" height="15" rx="2" fill="#EAF6FC" stroke="#0B82C9" strokeWidth="0.8" />
                  <text x={x + 17.5} y="106" textAnchor="middle" fontSize="7" fontWeight="700" fill="#0B82C9">
                    H{i + 1}
                  </text>
                </g>
              ))}

              {/* Bridge superstructure */}
              <rect x="185" y="70" width="45" height="25" rx="3" fill="#FFFFFF" stroke="#D9E6EF" strokeWidth="1" />
              {/* Windows */}
              {[192, 200, 208, 216, 224].map((x, i) => (
                <rect key={i} x={x} y="75" width="5" height="6" rx="1" fill="#0B82C9" opacity="0.85" />
              ))}

              {/* Mast & Radar */}
              <line x1="207" y1="35" x2="207" y2="70" stroke="#122F55" strokeWidth="1.5" />
              <line x1="195" y1="48" x2="220" y2="48" stroke="#122F55" strokeWidth="1" />
              <circle cx="207" cy="35" r="3" fill="none" stroke="#0B82C9" strokeWidth="1" />

              {/* Dimension indicators */}
              <line x1="30" y1="148" x2="250" y2="148" stroke="#0B82C9" strokeWidth="0.8" strokeDasharray="2,2" />
              <text x="140" y="157" textAnchor="middle" fontSize="8" fontWeight="700" fill="#122F55">
                228 m LOA · Panamax Class
              </text>
            </svg>
          </div>

          {/* Right: Specs List */}
          <div ref={specsRef}>
            {VESSEL_SPECS.map((spec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 18px',
                  background: i % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  border: '1px solid #D9E6EF',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0B82C9')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D9E6EF')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{spec.icon}</span>
                  <span style={{ fontSize: '13px', color: '#5F7894', fontWeight: 600 }}>{spec.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#122F55' }}>{spec.value}</span>
              </div>
            ))}

            {/* Port compatibility badge */}
            <div
              style={{
                marginTop: '16px',
                padding: '16px 18px',
                background: '#EAF6FC',
                border: '1px solid #CFE7F5',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0B82C9', letterSpacing: '0.08em', marginBottom: '8px' }}>
                INDIAN BULK PORTS COMPATIBILITY
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Paradip ✓', 'Visakhapatnam ✓', 'Gangavaram ✓', 'Dhamra ✓'].map((port) => (
                  <span
                    key={port}
                    style={{
                      fontSize: '12px',
                      color: '#0B82C9',
                      background: '#FFFFFF',
                      border: '1px solid #D9E6EF',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontWeight: 700,
                    }}
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VesselIntelligence;
