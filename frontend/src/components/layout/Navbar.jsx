import { useState } from 'react';
import { Bell, Search, LogOut, ChevronDown, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'BM';

  return (
    <header style={{
      height: '64px',
      flexShrink: 0,
      background: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 0 var(--border)',
    }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 14px', width: '280px', transition: 'all 0.2s' }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand-blue)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <Search size={15} color="var(--text-muted)" style={{ marginRight: '8px', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search vessels, ports, routes..."
          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', color: 'var(--text-primary)', width: '100%' }}
        />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '20px', padding: '5px 12px', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', animation: 'pulse-dot 2s infinite', flexShrink: 0 }}></span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#15803D', whiteSpace: 'nowrap' }}>Live Data Feed</span>
        </div>

        {/* Notifications */}
        <button
          style={{ position: 'relative', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--light-blue-bg)'; e.currentTarget.style.color = 'var(--brand-blue)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Bell size={17} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border)' }}></div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>{initials}</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', letterSpacing: '0.03em', lineHeight: 1.2 }}>{user?.company || user?.role}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: 'var(--shadow-lg)', minWidth: '180px', zIndex: 50, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--light-blue-bg)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              {[
                { icon: User, label: 'Profile', action: () => setDropdownOpen(false) },
                { icon: Settings, label: 'Settings', action: () => setDropdownOpen(false) },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)', transition: 'background 0.15s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon size={15} color="var(--text-secondary)" />
                  {item.label}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13.5px', color: 'var(--danger)', transition: 'background 0.15s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
