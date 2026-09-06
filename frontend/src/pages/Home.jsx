import { useState, useEffect } from 'react';
import { getKPIs } from '../services/api';
import { TrendingUp, TrendingDown, Ship, AlertTriangle, Activity, Anchor, BarChart2, ArrowRight, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SkeletonCard = () => (
  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
    <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '16px' }}></div>
    <div className="skeleton" style={{ height: '32px', width: '40%', marginBottom: '10px' }}></div>
    <div className="skeleton" style={{ height: '10px', width: '80%' }}></div>
  </div>
);

const MetricCard = ({ title, value, subtitle, trend, icon: Icon, accentColor, accentBg }) => (
  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', cursor: 'default' }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{title}</p>
        <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '10px', letterSpacing: '-0.02em' }}>{value}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {trend !== undefined && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: trend >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{subtitle}</span>
        </div>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px' }}>
        <Icon size={22} color={accentColor} />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, description, color, bg }) => (
  <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', textDecoration: 'none', transition: 'all 0.2s', flex: 1 }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 14px ${color}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>{title}</p>
      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</p>
    </div>
    <ArrowRight size={16} color="var(--text-muted)" />
  </Link>
);

const alerts = [
  { color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger-border)', severity: 'CRITICAL', title: 'High Cyclone Risk', desc: 'Expected to affect Paradip area within 48 hours. Consider rerouting.', time: '10 min ago' },
  { color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)', severity: 'WARNING', title: 'Congestion Warning', desc: 'Haldia port waiting time increased by +2 days.', time: '2 hrs ago' },
  { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)', severity: 'INFO', title: 'BDI Trending Up', desc: 'Freight rates trending upwards. Ideal for short-term charters.', time: '5 hrs ago' },
];

const Home = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    getKPIs().then(data => { setKpis(data); setLoading(false); }).catch(() => { setError('Failed to load KPIs.'); setLoading(false); });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Captain'} 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Here's your maritime intelligence overview for today</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '20px', padding: '6px 14px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-dot 2s infinite' }}></span>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--success)' }}>Live Data Feed Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : error ? (
          <div style={{ gridColumn: '1/-1', padding: '24px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '14px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        ) : kpis ? (<>
          <MetricCard title="Current BDI" value={formatNumber(kpis.bdi)} trend={kpis.bdiTrend} subtitle="7-Day Trend" icon={Activity} accentColor="#1D4ED8" accentBg="#EFF6FF" />
          <MetricCard title="Active Charters" value={kpis.activeCharters} subtitle="Vessels currently booked" icon={Anchor} accentColor="#7C3AED" accentBg="#F5F3FF" />
          <MetricCard title="Port Congestion" value={kpis.congestionIndex} subtitle="East Coast Ports" icon={Ship} accentColor="#D97706" accentBg="#FFFBEB" />
          <MetricCard title="Weather Risk" value={kpis.weatherRisk?.split(' ')[0]} subtitle={kpis.weatherRisk?.split(' ').slice(1).join(' ')} icon={Cloud} accentColor="#DC2626" accentBg="#FEF2F2" />
        </>) : null}
      </div>

      {/* Quick Actions + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
        {/* Quick Actions */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '3px', height: '18px', background: 'var(--brand-blue)', borderRadius: '2px', display: 'inline-block' }}></span>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickAction to="/planner" icon={Anchor} title="New Charter Plan" description="Generate AI-powered vessel and freight recommendations" color="#1D4ED8" bg="#EFF6FF" />
            <QuickAction to="/live" icon={Ship} title="Live Fleet View" description="Track active vessels, routes, and port congestion" color="#7C3AED" bg="#F5F3FF" />
            <QuickAction to="/analytics" icon={BarChart2} title="View Analytics" description="Analyze historical freight trends and market insights" color="#16A34A" bg="#F0FDF4" />
            <QuickAction to="/weather" icon={Cloud} title="Weather Intelligence" description="Live marine weather conditions and risk alerts" color="#D97706" bg="#FFFBEB" />
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '18px', background: 'var(--danger)', borderRadius: '2px', display: 'inline-block' }}></span>
              Recent Alerts
            </h2>
            <Link to="/weather" style={{ fontSize: '12.5px', color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ background: a.bg, border: `1px solid ${a.border}`, borderLeft: `3px solid ${a.color}`, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: a.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.severity}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.time}</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{a.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
