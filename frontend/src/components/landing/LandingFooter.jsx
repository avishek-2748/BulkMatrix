const LandingFooter = () => {
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#122F55',
        borderTop: '1px solid #1B3F6E',
        padding: '56px 0 32px',
        color: '#FFFFFF',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '36px',
            marginBottom: '44px',
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <svg viewBox="0 0 36 36" fill="none" width="30" height="30">
                <rect x="2" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.3)" />
                <rect x="11" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
                <rect x="20" y="2" width="7" height="7" rx="2" fill="rgba(11,130,201,0.3)" />
                <rect x="2" y="11" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
                <rect x="11" y="11" width="7" height="7" rx="2" fill="#0B82C9" />
                <rect x="20" y="11" width="7" height="7" rx="2" fill="rgba(11,130,201,0.6)" />
                <path d="M8 27 Q18 33 28 27 L26 24 Q18 29 10 24 Z" fill="#0B82C9" />
              </svg>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  BulkMatrix
                </div>
                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#55B9E8', letterSpacing: '0.14em', marginTop: '2px' }}>
                  MARITIME INTELLIGENCE
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', color: '#B8C7D6', lineHeight: 1.65, margin: 0 }}>
              Decision-support intelligence for maritime freight forecasting, vessel evaluation, port operations, and weather risk.
            </p>
          </div>

          {/* Links */}
          <nav style={{ display: 'flex', gap: '56px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.10em', marginBottom: '16px' }}>
                PRODUCT CAPABILITIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Freight Forecasting', href: '#intelligence' },
                  { label: 'Vessel Intelligence', href: '#platform' },
                  { label: 'Weather Risk Tracking', href: '#platform' },
                  { label: 'Port Congestion Index', href: '#platform' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    style={{ fontSize: '13.5px', color: '#DCEAF5', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38C6D8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#DCEAF5')}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.10em', marginBottom: '16px' }}>
                ENTERPRISE ROLES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Logistics Manager Portal', href: '#choose-role' },
                  { label: 'Vessel Owner Portal', href: '#choose-role' },
                  { label: 'Chartering Decision Support', href: '#how-it-works' },
                  { label: 'Voyage Risk Operations', href: '#platform' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    style={{ fontSize: '13.5px', color: '#DCEAF5', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#38C6D8')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#DCEAF5')}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid #1B3A5C',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#B8C7D6' }}>
            © {new Date().getFullYear()} BulkMatrix. All rights reserved. Maritime Decision Support Platform.
          </div>
          <div style={{ fontSize: '12px', color: '#B8C7D6' }}>
            Built for dry bulk cargo logistics & chartering operations.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
