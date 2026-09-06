import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Anchor,
  Lock,
  Mail,
  User,
  Building2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Shield
} from 'lucide-react';


// ✅ MOVE FIELD OUTSIDE SIGNUP COMPONENT
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label
      style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '6px'
      }}
    >
      {label}
    </label>

    <div style={{ position: 'relative' }}>
      <Icon
        size={16}
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}
      />

      {children}
    </div>
  </div>
);


const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { signup } = useAuth();
  const navigate = useNavigate();


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


  const strengthColors = [
    '#E2E8F0',
    '#DC2626',
    '#F59E0B',
    '#2563EB',
    '#16A34A'
  ];

  const strengthLabels = [
    '',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];


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
        company: formData.company
      });

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  const inputStyle = {
    width: '100%',
    paddingLeft: '42px',
    paddingRight: '14px',
    paddingTop: '11px',
    paddingBottom: '11px',
    border: '1.5px solid var(--border)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: '#FAFAFA',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  };


  const onFocus = (e) => {
    e.target.style.borderColor = 'var(--brand-blue)';
    e.target.style.background = 'white';
    e.target.style.boxShadow =
      '0 0 0 3px rgba(29,78,216,0.08)';
  };


  const onBlur = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.background = '#FAFAFA';
    e.target.style.boxShadow = 'none';
  };


  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: "'Inter', sans-serif"
      }}
    >

      {/* LEFT PANEL */}

      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          background:
            'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.06,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '48px'
            }}
          >

            <div
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '14px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Anchor size={22} color="white" />
            </div>

            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'white'
                }}
              >
                BULKMATRIX
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.6)'
                }}
              >
                MARITIME INTELLIGENCE
              </div>
            </div>

          </div>


          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2
            }}
          >
            Join the Platform
            <br />
            Powering Smarter
            <br />
            Maritime Decisions
          </h1>


          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              maxWidth: '380px'
            }}
          >
            Get access to ML-powered freight forecasting,
            real-time port monitoring, and AI-backed
            chartering recommendations.
          </p>


          {[
            'No credit card required',
            'Full platform access upon approval',
            'Enterprise-grade security'
          ].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '14px'
              }}
            >
              <CheckCircle2
                size={18}
                color="rgba(255,255,255,0.8)"
              />

              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                {feature}
              </span>

            </div>
          ))}

        </div>
      </div>


      {/* RIGHT PANEL */}

      <div
        style={{
          width: '520px',
          flexShrink: 0,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '50px 48px',
          overflowY: 'auto'
        }}
      >

        <div style={{ marginBottom: '28px' }}>

          <h2
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}
          >
            Create your account
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}
          >
            Fill in the details below to request platform access
          </p>

        </div>


        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '18px'
            }}
          >
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}
          >

            <Field label="Full Name" icon={User}>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                }
                placeholder="Ayush Kumar"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>


            <Field label="Company" icon={Building2}>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company: e.target.value
                  })
                }
                placeholder="Global Freight"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>

          </div>


          <Field label="Email Address" icon={Mail}>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
              }
              placeholder="you@company.com"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </Field>


          <Field label="Password" icon={Lock}>

            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value
                })
              }
              placeholder="••••••••"
              style={{
                ...inputStyle,
                paddingRight: '60px'
              }}
              onFocus={onFocus}
              onBlur={onBlur}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--brand-blue)'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

          </Field>


          {formData.password && (
            <div>

              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '4px'
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background:
                        i <= passwordStrength
                          ? strengthColors[passwordStrength]
                          : '#E2E8F0'
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: strengthColors[passwordStrength]
                }}
              >
                {strengthLabels[passwordStrength]}
              </div>

            </div>
          )}


          <Field
            label="Confirm Password"
            icon={Shield}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value
                })
              }
              placeholder="••••••••"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </Field>


          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? '#94A3B8'
                : 'var(--brand-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading
                ? 'not-allowed'
                : 'pointer'
            }}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>

        </form>


        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13.5px'
          }}
        >
          Already have an account?{' '}

          <Link to="/login">
            Sign in
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Signup;