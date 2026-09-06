import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, Lock, Mail, AlertTriangle, Loader2, TrendingUp, Ship, BarChart2 } from 'lucide-react';

const stats = [
  { label: 'Active Vessels', value: '1,240+' },
  { label: 'Ports Monitored', value: '85' },
  { label: 'Forecast Accuracy', value: '94.2%' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel — Brand */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }} className="hidden lg:flex">
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}></div>
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Anchor size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>BULKMATRIX</div>
              <div style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>MARITIME INTELLIGENCE</div>
            </div>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            AI-Powered Freight<br />Intelligence Platform
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '400px', marginBottom: '48px' }}>
            Make smarter chartering decisions with real-time market analytics, ML-powered forecasts, and live vessel tracking.
          </p>

          {/* Feature icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {[
              { icon: TrendingUp, text: 'Real-time freight rate forecasting' },
              { icon: Ship, text: 'Live fleet & port congestion monitoring' },
              { icon: BarChart2, text: 'AI-powered chartering recommendations' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={16} color="white" />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ width: '480px', flexShrink: 0, background: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }} className="flex lg:hidden">
          <div style={{ width: '36px', height: '36px', background: 'var(--brand-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
            <Anchor size={18} color="white" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>BULKMATRIX</div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sign in to your maritime intelligence dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '13.5px', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '14px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)', background: '#FAFAFA', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#FAFAFA'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '60px', paddingTop: '11px', paddingBottom: '11px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text-primary)', background: '#FAFAFA', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = '#FAFAFA'; e.target.style.boxShadow = 'none'; }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--brand-blue)' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--brand-blue)' }} />
              Remember me
            </label>
            <a href="#" style={{ fontSize: '13px', color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#94A3B8' : 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', letterSpacing: '0.01em', boxShadow: loading ? 'none' : 'var(--shadow-blue)', marginTop: '4px' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1E40AF'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--brand-blue)'; }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : 'Sign in to Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--brand-blue)', fontWeight: 700, textDecoration: 'none' }}>Request Access</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
