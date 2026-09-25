import { useState } from 'react';

const RoleSection = ({ onLoginLogistics, onLoginVessel }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const roles = [
    {
      id: 'logistics',
      title: 'Logistics Manager',
      badge: 'CARGO OWNERS & CHARTERERS',
      description: 'Optimize freight decisions, charter timing, vessel selection and cargo movement.',
      bullets: [
        'Forecast freight market indexes & spot rates',
        'Analyze port congestion and waiting times',
        'Assess voyage weather hazards and risks',
        'Compare charter bids & fixture economics',
      ],
      ctaText: 'Login as Logistics Manager',
      onSelect: onLoginLogistics,
      iconColor: '#0B82C9',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: 'vessel',
      title: 'Vessel Owner',
      badge: 'FLEET OPERATORS & MANAGERS',
      description: 'Manage vessel opportunities, availability and operational information.',
      bullets: [
        'Connect fleet availability with active cargo orders',
        'Benchmark vessel performance and turnaround',
        'Monitor bunkering & port readiness',
        'Maximize voyage earnings & TCE returns',
      ],
      ctaText: 'Login as Vessel Owner',
      onSelect: onLoginVessel,
      iconColor: '#0B82C9',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="choose-role"
      style={{
        padding: '96px 32px',
        background: '#F8FAFC',
        borderBottom: '1px solid #D9E6EF',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            ● ROLE-BASED WORKFLOWS
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.025em',
              marginBottom: '12px',
            }}
          >
            Choose Your <span style={{ color: '#0B82C9' }}>Role</span>
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: '#23466B',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Access the dedicated tools engineered for your maritime workflow.
          </p>
        </div>

        {/* Two Role Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
          }}
        >
          {roles.map((card) => {
            const isHovered = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: '#FFFFFF',
                  border: isHovered ? '1px solid #0B82C9' : '1px solid #D9E6EF',
                  borderTop: '3px solid #0B82C9',
                  borderRadius: '16px',
                  padding: '36px 32px',
                  boxShadow: isHovered
                    ? '0 8px 28px rgba(18,47,85,0.10)'
                    : '0 4px 20px rgba(18,47,85,0.06)',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.22s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '22px',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        background: '#EAF6FC',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #D3EAF6',
                      }}
                    >
                      {card.icon}
                    </div>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#5F7894',
                        background: '#F4FAFD',
                        border: '1px solid #D9E6EF',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#122F55',
                      marginBottom: '10px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '14px',
                      color: '#5F7894',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                    }}
                  >
                    {card.description}
                  </p>

                  {/* Bullets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                    {card.bullets.map((bullet, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#23466B' }}>
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
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary CTA: Orange button */}
                <button
                  onClick={card.onSelect}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: '#FF7426',
                    border: 'none',
                    borderRadius: '11px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(255,116,38,0.28)',
                    transition: 'all 0.20s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F5661F';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,116,38,0.38)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FF7426';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,116,38,0.28)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {card.ctaText}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleSection;
