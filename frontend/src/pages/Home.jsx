import { useState, useEffect } from 'react';
import { getKPIs } from '../services/api';
import { TrendingUp, TrendingDown, Ship, AlertTriangle, Activity, Anchor, BarChart2, ArrowRight, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SkeletonCard = () => (
  <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(18, 47, 85, 0.04)' }}>
    <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '16px' }}></div>
    <div className="skeleton" style={{ height: '32px', width: '40%', marginBottom: '10px' }}></div>
    <div className="skeleton" style={{ height: '10px', width: '80%' }}></div>
  </div>
);

const MetricCard = ({ title, value, subtitle, trend, icon: Icon, accentColor, accentBg }) => (
  <div
    style={{
      background: '#FFFFFF',
      border: '1px solid #D9E6EF',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(18, 47, 85, 0.04)',
      transition: 'all 0.22s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 26px rgba(18, 47, 85, 0.08)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = '#0B82C9';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(18, 47, 85, 0.04)';
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.borderColor = '#D9E6EF';
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#5F7894', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{title}</p>
        <p style={{ fontSize: '32px', fontWeight: 800, color: '#122F55', lineHeight: 1, marginBottom: '10px', letterSpacing: '-0.02em' }}>{value}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {trend !== undefined && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: trend >= 0 ? '#E8F8EF' : '#FEECEC', color: trend >= 0 ? '#16A34A' : '#DC2626' }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          <span style={{ fontSize: '12.5px', color: '#5F7894' }}>{subtitle}</span>
        </div>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px', border: `1px solid ${accentColor}25` }}>
        <Icon size={22} color={accentColor} />
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, description, color, bg }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: '#FFFFFF',
      border: '1px solid #D9E6EF',
      borderRadius: '14px',
      padding: '18px 20px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      flex: 1,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 6px 20px ${color}20`;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#D9E6EF';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'none';
    }}
  >
    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}25` }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '14.5px', fontWeight: 700, color: '#122F55', marginBottom: '2px' }}>{title}</p>
      <p style={{ fontSize: '12.5px', color: '#5F7894', lineHeight: 1.4, margin: 0 }}>{description}</p>
    </div>
    <ArrowRight size={16} color="#7890A8" />
  </Link>
);

const alerts = [
  { color: '#DC2626', bg: '#FEECEC', border: '#FECACA', severity: 'CRITICAL', title: 'High Cyclone Risk', desc: 'Expected to affect Paradip area within 48 hours. Consider rerouting.', time: '10 min ago' },
  { color: '#FF7426', bg: '#FFF1E8', border: '#FFD8C2', severity: 'WARNING', title: 'Congestion Warning', desc: 'Haldia port waiting time increased by +2 days.', time: '2 hrs ago' },
  { color: '#0B82C9', bg: '#EAF6FC', border: '#CFE7F5', severity: 'INFO', title: 'BDI Trending Up', desc: 'Freight rates trending upwards. Ideal for short-term charters.', time: '5 hrs ago' },
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
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#122F55', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Captain'} 👋
          </h1>
          <p style={{ fontSize: '14px', color: '#5F7894' }}>Here's your maritime intelligence overview for today</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E8F8EF', border: '1px solid #BBF7D0', borderRadius: '999px', padding: '6px 14px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', animation: 'pulse-dot 2s infinite' }}></span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#16A34A' }}>Live Data Feed Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {loading ? (
          [1,2,3,4].map(i => <SkeletonCard key={i} />)
        ) : error ? (
          <div style={{ gridColumn: '1/-1', padding: '24px', background: '#FEECEC', border: '1px solid #FECACA', borderRadius: '14px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} /> {error}
          </div>
        ) : kpis ? (<>
          <MetricCard title="Current BDI" value={formatNumber(kpis.bdi)} trend={kpis.bdiTrend} subtitle="7-Day Trend" icon={Activity} accentColor="#0B82C9" accentBg="#EAF6FC" />
          <MetricCard title="Active Charters" value={kpis.activeCharters} subtitle="Vessels currently booked" icon={Anchor} accentColor="#122F55" accentBg="#F4FAFD" />
          <MetricCard title="Port Congestion" value={kpis.congestionIndex} subtitle="East Coast Ports" icon={Ship} accentColor="#FF7426" accentBg="#FFF1E8" />
          <MetricCard title="Weather Risk" value={kpis.weatherRisk?.split(' ')[0]} subtitle={kpis.weatherRisk?.split(' ').slice(1).join(' ')} icon={Cloud} accentColor="#DC2626" accentBg="#FEECEC" />
        </>) : null}
      </div>

      {/* Quick Actions + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
        {/* Quick Actions */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(18, 47, 85, 0.04)' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#122F55', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '3px', height: '18px', background: '#FF7426', borderRadius: '2px', display: 'inline-block' }}></span>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <QuickAction to="/planner" icon={Anchor} title="New Charter Plan" description="Generate AI-powered vessel and freight recommendations" color="#FF7426" bg="#FFF1E8" />
            <QuickAction to="/live" icon={Ship} title="Live Fleet View" description="Track active vessels, routes, and port congestion" color="#0B82C9" bg="#EAF6FC" />
            <QuickAction to="/market-analysis" icon={BarChart2} title="Market Analysis" description="Live BDI, fuel, FX, coal and iron ore market indicators" color="#122F55" bg="#F4FAFD" />
            <QuickAction to="/weather" icon={Cloud} title="Weather Intelligence" description="Live marine weather conditions and risk alerts" color="#0B82C9" bg="#EAF6FC" />
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(18, 47, 85, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '18px', background: '#DC2626', borderRadius: '2px', display: 'inline-block' }}></span>
              Recent Alerts
            </h2>
            <Link to="/weather" style={{ fontSize: '12.5px', color: '#0B82C9', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ background: a.bg, border: `1px solid ${a.border}`, borderLeft: `3px solid ${a.color}`, borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: a.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{a.severity}</span>
                  <span style={{ fontSize: '11px', color: '#7890A8' }}>{a.time}</span>
                </div>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#122F55', marginBottom: '3px' }}>{a.title}</p>
                <p style={{ fontSize: '12.5px', color: '#5F7894', lineHeight: 1.5 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
