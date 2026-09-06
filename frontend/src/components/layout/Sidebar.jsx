import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Anchor, Map, CloudRain, BarChart2, History, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/planner', label: 'Charter Planner', icon: Anchor },
  { path: '/live', label: 'Live Operations', icon: Map },
  { path: '/weather', label: 'Weather Intelligence', icon: CloudRain },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/history', label: 'Forecast History', icon: History },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const allItems = [...navItems];
  if (user?.role === 'admin') {
    allItems.push({ path: '/admin', label: 'System Admin', icon: Settings });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'BM';

  return (
    <aside style={{ width: '256px', flexShrink: 0, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
      {/* Logo */}
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--brand-blue)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
          <Anchor size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1 }}>BULKMATRIX</div>
          <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginTop: '2px' }}>MARITIME INTELLIGENCE</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px', marginBottom: '4px' }}>
          Main Menu
        </div>
        {allItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                position: 'relative',
                background: isActive ? 'var(--light-blue-bg)' : 'transparent',
                color: isActive ? 'var(--brand-blue)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--brand-blue)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <item.icon size={17} style={{ marginRight: '10px', flexShrink: 0 }} />
              <span style={{ fontSize: '13.5px' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', flexShrink: 0, marginRight: '8px', boxShadow: '0 0 0 2px rgba(22,163,74,0.2)', animation: 'pulse-dot 2s infinite' }}></span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#15803D' }}>ML Engine Ready</span>
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{initials}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.company || user?.role || 'Member'}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '5px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Sign Out"
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
