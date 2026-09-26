import { useState, useEffect } from 'react';
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

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'VESSEL_OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login({ email, password });
      if (userData.role === 'VESSEL_OWNER') {
        navigate('/owner/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FEFFFF' }}>
      {/* Left Panel — Brand */}
      <div style={{ flex: 1, background: '#133056', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', position: 'relative', overflow: 'hidden' }} className="hidden lg:flex">
        {/* Subtle geometry */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(65, 135, 171, 0.12)' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(65, 135, 171, 0.08)' }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(65, 135, 171, 0.25)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', border: '1px solid rgba(167, 218, 241, 0.3)' }}>
              <Anchor size={22} color="#FEFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.02em' }}>BULKMATRIX</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#A7DAF1', letterSpacing: '0.12em' }}>MARITIME INTELLIGENCE</div>
            </div>
          </div>

          <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#FEFFFF', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Enterprise Freight & Fleet Intelligence
          </h1>
          <p style={{ fontSize: '15px', color: '#A7DAF1', lineHeight: 1.6, marginBottom: '48px' }}>
            Serious maritime platform for freight forecasting, vessel chartering, fleet intelligence, and risk decision support.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {[
              { icon: TrendingUp, text: 'Real-time dry bulk freight index analytics' },
              { icon: Ship, text: 'Live AIS vessel tracking & port congestion' },
              { icon: BarChart2, text: 'ML freight forecasting & market decision support' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(65, 135, 171, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={16} color="#A7DAF1" />
                </div>
                <span style={{ fontSize: '14px', color: '#FEFFFF', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', paddingTop: '32px', borderTop: '1px solid rgba(218, 220, 235, 0.2)' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#FEFFFF' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#A7DAF1', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ width: '500px', flexShrink: 0, background: '#FEFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
        {/* BulkMatrix Logo on Form Panel */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
          <div style={{ width: '38px', height: '38px', background: '#F5FAFE', border: '1px solid #DADCEB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
            <Anchor size={20} color="#4187AB" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#133056', letterSpacing: '-0.02em', lineHeight: 1.1 }}>BULKMATRIX</div>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#4187AB', letterSpacing: '0.08em', marginTop: '2px' }}>MARITIME INTELLIGENCE</div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#133056', letterSpacing: '-0.02em', marginBottom: '8px' }}>Sign in to BulkMatrix</h2>
          <p style={{ fontSize: '14px', color: '#586D85' }}>Enter your commercial account credentials</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="saas-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#586D85', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="saas-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <label className="saas-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#586D85', pointerEvents: 'none' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="saas-input"
                style={{ paddingLeft: '42px', paddingRight: '56px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#4187AB' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#586D85' }}>
              <input type="checkbox" style={{ accentColor: '#4187AB' }} />
              Remember credentials
            </label>
            <a href="#" style={{ fontSize: '13px', color: '#4187AB', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="saas-btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : 'Sign in to Dashboard'}
          </button>
        </form>

        <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', color: '#586D85' }}>
          Don't have an enterprise account?{' '}
          <Link to="/signup" style={{ color: '#4187AB', fontWeight: 700, textDecoration: 'none' }}>Register Organization</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
