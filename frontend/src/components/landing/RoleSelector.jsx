import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ROLES = [
  {
    id: 'logistics',
    title: 'Logistics Manager',
    desc: 'Forecast freight markets, evaluate vessels, monitor weather risk, and make chartering decisions.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#087CC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    cta: 'Continue as Logistics Manager',
  },
  {
    id: 'vessel',
    title: 'Vessel Owner',
    desc: 'Manage vessel availability, evaluate charter opportunities, and connect fleet intelligence with cargo demand.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1591DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    cta: 'Continue as Vessel Owner',
  },
];

const RoleSelector = ({ onSelect, onClose }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = prefersReduced ? 0.01 : 0.35;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(overlayRef.current, { opacity: 0, duration: dur, ease: 'power2.out' })
        .from(panelRef.current, {
          opacity: 0,
          y: prefersReduced ? 0 : 25,
          scale: prefersReduced ? 1 : 0.98,
          duration: prefersReduced ? 0.01 : 0.4,
          ease: 'power3.out',
        }, `-=${dur * 0.3}`)
        .from(cardsRef.current.filter(Boolean), {
          opacity: 0,
          y: prefersReduced ? 0 : 15,
          duration: prefersReduced ? 0.01 : 0.35,
          stagger: 0.1,
          ease: 'power2.out',
        }, '-=0.2');
    });

    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKey);

    return () => {
      ctx.revert();
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleClose = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { onClose(); return; }
    gsap.to(panelRef.current, {
      opacity: 0, y: 15, scale: 0.98, duration: 0.22, ease: 'power2.in',
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
  };

  const cardHover = (el, enter) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || prefersReduced) return;
    gsap.to(el, {
      y: enter ? -3 : 0,
      duration: 0.22,
      ease: 'power2.out',
    });
    el.style.borderColor = enter ? '#0B82C9' : '#D9E6EF';
    el.style.background = enter ? '#F8FAFD' : '#FFFFFF';
    el.style.boxShadow = enter ? '0 8px 28px rgba(18,47,85,0.10)' : '0 2px 8px rgba(18,47,85,0.04)';
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(11,35,66,0.50)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Role selection"
    >
      <div
        ref={panelRef}
        style={{
          background: '#FFFFFF',
          border: '1px solid #D9E6EF',
          borderRadius: '18px',
          padding: '36px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 20px 60px rgba(18,47,85,0.16)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '32px',
            height: '32px',
            background: '#F4FAFD',
            border: '1px solid #D9E6EF',
            borderRadius: '9px',
            color: '#7890A8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#122F55'; e.currentTarget.style.borderColor = '#0B82C9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#7890A8'; e.currentTarget.style.borderColor = '#D9E6EF'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 12px',
              background: '#EAF6FC',
              border: '1px solid #CFE7F5',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 36 36" fill="none" width="24" height="24">
              <rect x="2" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.3)" />
              <rect x="11" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
              <rect x="20" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.3)" />
              <rect x="2" y="11" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
              <rect x="11" y="11" width="7" height="7" rx="2" fill="#0B82C9" />
              <rect x="20" y="11" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            Welcome to BulkMatrix
          </h2>
          <p style={{ fontSize: '14px', color: '#5F7894', margin: 0 }}>
            Choose your role to continue to the platform.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {ROLES.map((role, i) => (
            <div
              key={role.id}
              ref={(el) => (cardsRef.current[i] = el)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D9E6EF',
                borderTop: '3px solid #0B82C9',
                borderRadius: '14px',
                padding: '24px 20px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(18,47,85,0.04)',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              }}
              role="button"
              tabIndex={0}
              aria-label={role.cta}
              onClick={() => onSelect(role.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(role.id); }}
              onMouseEnter={(e) => cardHover(e.currentTarget, true)}
              onMouseLeave={(e) => cardHover(e.currentTarget, false)}
            >
              {/* Icon */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  background: '#EAF6FC',
                  border: '1px solid #D3EAF6',
                  borderRadius: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {role.icon}
              </div>

              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#122F55',
                  marginBottom: '6px',
                  letterSpacing: '-0.01em',
                }}
              >
                {role.title}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#5F7894',
                  lineHeight: 1.55,
                  marginBottom: '20px',
                  minHeight: '60px',
                }}
              >
                {role.desc}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0B82C9',
                }}
              >
                {role.cta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
