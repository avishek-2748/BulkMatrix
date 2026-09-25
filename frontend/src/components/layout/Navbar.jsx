import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Anchor,
  Map,
  CloudRain,
  TrendingUp,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const existingNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/planner', label: 'Charter Planner', icon: Anchor },
  { path: '/live', label: 'Live Operations', icon: Map },
  { path: '/weather', label: 'Weather Intelligence', icon: CloudRain },
  { path: '/market-analysis', label: 'Market Analysis', icon: TrendingUp },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const allItems = [...existingNavItems];
  if (user?.role === 'admin') {
    allItems.push({ path: '/admin', label: 'System Admin', icon: Settings });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'BM';

  const isItemActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header
      style={{
        height: '72px',
        flexShrink: 0,
        background: '#FFFFFF',
        borderBottom: '1px solid #D9E6EF',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 12px rgba(18, 47, 85, 0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          height: '100%',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* LEFT: BulkMatrix Logo & Branding */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              background: '#EAF6FC',
              border: '1.5px solid #CFE7F5',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(11, 130, 201, 0.08)',
            }}
          >
            <Anchor size={20} color="#0B82C9" strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#122F55',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              BulkMatrix
            </div>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#0B82C9',
                letterSpacing: '0.09em',
                marginTop: '3px',
                lineHeight: 1,
              }}
            >
              MARITIME INTELLIGENCE
            </div>
          </div>
        </Link>

        {/* CENTER: Horizontal Desktop Navigation */}
        <nav
          className="hidden lg:flex"
          style={{
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            justifyContent: 'center',
            maxWidth: '920px',
          }}
        >
          {allItems.map((item) => {
            const active = isItemActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#122F55' : '#23466B',
                  background: active ? '#EAF6FC' : 'transparent',
                  border: active ? '1px solid #CFE7F5' : '1px solid transparent',
                  boxShadow: active ? '0 1px 3px rgba(11, 130, 201, 0.08)' : 'none',
                  transition: 'all 200ms ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#F0F8FC';
                    e.currentTarget.style.color = '#0B82C9';
                    e.currentTarget.style.borderColor = '#E7EFF5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#23466B';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <Icon
                  size={16}
                  color={active ? '#0B82C9' : '#0B82C9'}
                  strokeWidth={active ? 2.4 : 1.9}
                  style={{ transition: 'color 200ms ease' }}
                />
                <span>{item.label}</span>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '20%',
                      right: '20%',
                      height: '2.5px',
                      background: '#0B82C9',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: User Profile Control & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* User Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid #D9E6EF',
                background: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: '0 1px 3px rgba(18, 47, 85, 0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F4FAFD';
                e.currentTarget.style.borderColor = '#0B82C9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#D9E6EF';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#EAF6FC',
                  border: '1.5px solid #0B82C9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0B82C9' }}>{initials}</span>
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#122F55' }}>
                  {user?.name || 'Ayush'}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#5F7894',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginTop: '2px',
                  }}
                >
                  {user?.company || user?.role || 'GLOBAL'}
                </div>
              </div>
              <ChevronDown
                size={14}
                color="#5F7894"
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  marginLeft: '2px',
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#FFFFFF',
                  border: '1px solid #D9E6EF',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(18, 47, 85, 0.10)',
                  minWidth: '210px',
                  zIndex: 50,
                  overflow: 'hidden',
                  animation: 'pageEnter 200ms ease-out',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #D9E6EF',
                    background: '#F8FAFC',
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#122F55' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#5F7894', marginTop: '2px' }}>{user?.email}</div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  {[
                    { icon: User, label: 'Profile', action: () => setDropdownOpen(false) },
                    { icon: Settings, label: 'Settings', action: () => setDropdownOpen(false) },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '10px 16px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '13.5px',
                          color: '#122F55',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F4FAFD';
                          e.currentTarget.style.color = '#0B82C9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#122F55';
                        }}
                      >
                        <ItemIcon size={15} color="#0B82C9" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ borderTop: '1px solid #D9E6EF', padding: '6px 0' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      color: '#DC2626',
                      transition: 'background 0.15s ease',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FEECEC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} color="#DC2626" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger (Visible on small screens) */}
          <button
            className="flex lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '8px',
              borderRadius: '9px',
              border: '1px solid #D9E6EF',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#122F55',
            }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden"
          style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #D9E6EF',
            boxShadow: '0 10px 30px rgba(18, 47, 85, 0.10)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 35,
          }}
        >
          {allItems.map((item) => {
            const active = isItemActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#122F55' : '#23466B',
                  background: active ? '#EAF6FC' : 'transparent',
                  border: active ? '1px solid #CFE7F5' : '1px solid transparent',
                  borderLeft: active ? '4px solid #0B82C9' : '4px solid transparent',
                  boxShadow: active ? '0 1px 3px rgba(11, 130, 201, 0.08)' : 'none',
                }}
              >
                <Icon size={17} color="#0B82C9" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
