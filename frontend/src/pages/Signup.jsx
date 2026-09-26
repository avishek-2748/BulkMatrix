import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Anchor,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  MapPin,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: 'LOGISTIC_MANAGER',
    phoneNumber: '',
    address: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { user, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let strength = 0;
    const pwd = formData.password;
    if (pwd.length > 5) strength += 1;
    if (pwd.length > 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [formData.password]);

  const strengthColors = ['#E2E8F0', '#DC2626', '#F59E0B', '#2563EB', '#16A34A'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          flex: 1,
          background: 'linear-gradient(145deg, #0B2342 0%, #133056 55%, #1a5a8a 100%)',
        }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.05,
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3.5 mb-14">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <Anchor size={22} color="white" />
            </div>
            <div>
              <div className="text-white font-black text-lg tracking-wider">BULKMATRIX</div>
              <div className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Maritime Intelligence
              </div>
            </div>
          </div>

          <h1 className="text-white font-black leading-tight mb-5" style={{ fontSize: '36px' }}>
            Join the Platform<br />
            Powering Smarter<br />
            Maritime Decisions
          </h1>

          <p className="text-base leading-relaxed mb-10 max-w-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Get access to ML-powered freight forecasting, real-time port monitoring, and AI-backed chartering recommendations.
          </p>

          <div className="space-y-3.5">
            {['No credit card required', 'Full platform access upon approval', 'Enterprise-grade security'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={17} style={{ color: '#A7DAF1', flexShrink: 0 }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © {new Date().getFullYear()} BulkMatrix. Enterprise Maritime Intelligence Platform.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex flex-col justify-center bg-white overflow-y-auto"
        style={{ width: '520px', flexShrink: 0, padding: '48px 48px' }}
      >
        {/* Mobile brand */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#133056' }}
          >
            <Anchor size={18} color="white" />
          </div>
          <span className="font-black text-base tracking-wider" style={{ color: '#133056' }}>BULKMATRIX</span>
        </div>

        <div className="mb-7">
          <h2 className="font-black text-2xl mb-1.5" style={{ color: '#133056' }}>Create your account</h2>
          <p className="text-sm" style={{ color: '#586D85' }}>Fill in the details below to request platform access</p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {[
            { value: 'LOGISTIC_MANAGER', label: 'Logistic Manager', activeColor: '#0B82C9', activeBg: 'rgba(11, 130, 201, 0.06)' },
            { value: 'VESSEL_OWNER', label: 'Vessel Owner', activeColor: '#16A34A', activeBg: 'rgba(22, 163, 74, 0.06)' }
          ].map(r => {
            const isActive = formData.role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: r.value })}
                className="py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
                style={{
                  border: isActive ? `2px solid ${r.activeColor}` : '1.5px solid #D9E6EF',
                  background: isActive ? r.activeBg : '#fff',
                  color: isActive ? r.activeColor : '#586D85',
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm font-medium"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
            <AlertTriangle size={16} className="shrink-0" style={{ color: '#DC2626' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="saas-label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ayush Kumar"
                  className="saas-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="saas-label">Company</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Global Freight"
                  className="saas-input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="saas-label">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="saas-input pl-10"
              />
            </div>
          </div>

          {/* VESSEL OWNER extra fields */}
          {formData.role === 'VESSEL_OWNER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="saas-label">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="saas-input pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="saas-label">Address</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="HQ City, Country"
                    className="saas-input pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="saas-label">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="saas-input pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 p-0.5"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8295AB' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength bar */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i <= passwordStrength ? strengthColors[passwordStrength] : '#E2E8F0' }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: strengthColors[passwordStrength] }}>
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="saas-label">Confirm Password</label>
            <div className="relative">
              <Shield size={15} className="absolute left-3.5 top-3.5" style={{ color: '#8295AB' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="saas-input pl-10"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="saas-btn-primary w-full justify-center py-3 mt-1 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#586D85' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold" style={{ color: '#0B82C9', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;