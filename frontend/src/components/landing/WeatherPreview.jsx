import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const WeatherPreview = () => {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const headingRef = useRef(null);
  const navigate = useNavigate();

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
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 35,
        duration: 0.75,
        ease: 'power2.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 82%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const WEATHER_METRICS = [
    { label: 'Wind Speed', value: '18 kn', icon: '💨', sub: 'Beaufort 5' },
    { label: 'Wave Height', value: '1.8 m', icon: '🌊', sub: 'Moderate' },
    { label: 'Visibility', value: '12 km', icon: '👁', sub: 'Good' },
    { label: 'Swell Period', value: '8 s', icon: '〰', sub: 'Regular' },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#F4FAFD',
        padding: '96px 0',
        borderBottom: '1px solid #D9E6EF',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          {/* Left: Weather Dashboard Preview Card */}
          <div
            ref={cardRef}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D9E6EF',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(18,47,85,0.06)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0B82C9', letterSpacing: '0.08em' }}>
                    PORT WEATHER CONDITIONS
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#122F55' }}>Paradip Port</div>
                <div style={{ fontSize: '12px', color: '#5F7894', marginTop: '2px' }}>Odisha, India · 20.27°N, 86.67°E</div>
              </div>

              <div
                style={{
                  padding: '5px 14px',
                  background: '#FFF1E8',
                  border: '1px solid #FFD8C2',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#FF7426',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7426' }} />
                Moderate Risk
              </div>
            </div>

            {/* Main weather display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '22px',
                padding: '18px 20px',
                background: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #D9E6EF',
              }}
            >
              <div style={{ fontSize: '48px', lineHeight: 1 }}>⛅</div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#122F55', lineHeight: 1 }}>28°C</div>
                <div style={{ fontSize: '13px', color: '#23466B', marginTop: '4px', fontWeight: 600 }}>Partly Cloudy</div>
                <div style={{ fontSize: '12px', color: '#7890A8', marginTop: '2px' }}>Humidity: 78% · Pressure: 1012 hPa</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#7890A8', marginBottom: '4px' }}>Berth Advisory</div>
                <div
                  style={{
                    padding: '4px 12px',
                    background: '#E8F8EF',
                    border: '1px solid #BBF7D0',
                    borderRadius: '999px',
                    fontSize: '11px',
                    color: '#16A34A',
                    fontWeight: 700,
                  }}
                >
                  NORMAL OPERATIONS
                </div>
              </div>
            </div>

            {/* Weather metrics grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {WEATHER_METRICS.map((metric, i) => (
                <div
                  key={i}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D9E6EF',
                    borderRadius: '10px',
                    padding: '12px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{metric.icon}</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', marginBottom: '2px' }}>{metric.value}</div>
                  <div style={{ fontSize: '10px', color: '#7890A8', fontWeight: 700, marginBottom: '1px' }}>{metric.label}</div>
                  <div style={{ fontSize: '10px', color: '#5F7894' }}>{metric.sub}</div>
                </div>
              ))}
            </div>

            {/* Risk bar */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#23466B',
                  marginBottom: '6px',
                  fontWeight: 600,
                }}
              >
                <span>Overall Maritime Risk Score</span>
                <span style={{ color: '#FF7426', fontWeight: 700 }}>52 / 100</span>
              </div>
              <div
                style={{
                  height: '6px',
                  background: '#E7EFF5',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '52%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #16A34A, #FF7426)',
                    borderRadius: '3px',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#7890A8',
                  marginTop: '4px',
                }}
              >
                <span>Low Risk</span>
                <span>Moderate Risk</span>
                <span>Severe Storm</span>
              </div>
            </div>
          </div>

          {/* Right: Text Information */}
          <div ref={headingRef}>
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
              ● WEATHER RISK MANAGEMENT
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                fontWeight: 800,
                color: '#122F55',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              Weather Risk, <br />
              <span style={{ color: '#0B82C9' }}>Before It Costs You</span>
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#23466B',
                lineHeight: 1.65,
                marginBottom: '24px',
              }}
            >
              Monitor ocean swell, tropical storms, and port wind limits that affect vessel voyage time,
              demurrage costs, and discharging safety.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {['Live wind, wave & swell period monitoring', 'Port terminal operational thresholds & alerts', 'Voyage routing risk index'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#EAF6FC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid #CFE7F5',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '14px', color: '#23466B' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/weather')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                background: '#FFFFFF',
                border: '1px solid #BFD5E4',
                borderRadius: '11px',
                color: '#122F55',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.20s ease',
                boxShadow: '0 1px 3px rgba(18, 47, 85, 0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F0F8FC';
                e.currentTarget.style.borderColor = '#0B82C9';
                e.currentTarget.style.color = '#0B82C9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#BFD5E4';
                e.currentTarget.style.color = '#122F55';
                e.currentTarget.style.transform = 'none';
              }}
            >
              View Live Weather Dashboard
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherPreview;
