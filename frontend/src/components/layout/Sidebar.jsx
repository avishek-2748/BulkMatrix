import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Anchor, Map, CloudRain, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/planner', label: 'Charter Planner', icon: Anchor },
  { path: '/live', label: 'Live Operations', icon: Map },
  { path: '/weather', label: 'Weather Intelligence', icon: CloudRain },
  { path: '/market-analysis', label: 'Market Analysis', icon: TrendingUp },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const allItems = [...navItems];
  if (user?.role === 'admin') {
    allItems.push({ path: '/admin', label: 'System Admin', icon: Settings });
  }

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
          const isActive = item.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
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
    </aside>
  );
};

export default Sidebar;
