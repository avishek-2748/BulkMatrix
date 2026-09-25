import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';

const COMPANY_TYPES_BY_ROLE = {
  logistics: [
    'Steel Manufacturer',
    'Power / Energy Company',
    'Mining Company',
    'Trading Company',
    'Importer / Exporter',
    'Logistics Company',
    'Procurement Organization',
    'Other',
  ],
  vessel: [
    'Vessel Owner / Fleet Operator',
    'Ship Management Company',
    'Commercial Fleet Operator',
    'Vessel Chartering Desk',
    'Maritime Logistics Provider',
    'Port & Offshore Services',
    'Other',
  ],
};

const ROLE_DETAILS = {
  logistics: {
    roleName: 'Logistics Manager',
    subtitle: 'Manage smarter. Charter with confidence.',
    leftTitle: 'Maritime Intelligence for Smarter Bulk Cargo Decisions',
    leftDesc: 'Connect freight markets, vessel analytics, port intelligence, and weather risks in one command center.',
    corridorBadge: 'ACTIVE LOGISTICS CORRIDOR',
    footerAudience: 'Built for logistics managers, charterers & procurement heads',
    signupHeading: 'Create your BulkMatrix account',
    signupSubtitle: 'Join BulkMatrix to make smarter maritime and bulk cargo decisions.',
    companyLabel: 'COMPANY NAME',
    companyPlaceholder: 'Enter your company name',
    roleValue: 'LOGISTICS_MANAGER',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#087CC1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  vessel: {
    roleName: 'Vessel Owner',
    subtitle: 'Manage your fleet. Find better charter opportunities.',
    leftTitle: 'Connect Your Fleet with Global Bulk Cargo Demand',
    leftDesc: 'Manage vessel availability, evaluate charter inquiries, analyze port readiness, and optimize voyage earnings.',
    corridorBadge: 'ACTIVE FLEET & CHARTER CORRIDOR',
    footerAudience: 'Built for vessel owners, fleet managers & ship operators',
    signupHeading: 'Create your Vessel Owner account',
    signupSubtitle: 'Join BulkMatrix to connect your fleet with active bulk cargo charterers.',
    companyLabel: 'COMPANY / FLEET NAME',
    companyPlaceholder: 'Enter your company or fleet name',
    roleValue: 'VESSEL_OWNER',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1591DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
};

const LogisticsAuthModal = ({ role = 'logistics', onBack, onClose }) => {
  const roleConfig = ROLE_DETAILS[role] || ROLE_DETAILS.logistics;
  const companyOptions = COMPANY_TYPES_BY_ROLE[role] || COMPANY_TYPES_BY_ROLE.logistics;
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [loginGeneralError, setLoginGeneralError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up state
  const [signupData, setSignupData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyType: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState({});
  const [signupGeneralError, setSignupGeneralError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Forgot password popup/state
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // DOM Refs
  const overlayRef = useRef(null);
  const modalBoxRef = useRef(null);
  const formWrapperRef = useRef(null);
  const vesselAnimRef = useRef(null);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Entrance animation
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = prefersReduced ? 0.01 : 0.5;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(overlayRef.current, {
        opacity: 0,
        duration: dur * 0.7,
        ease: 'power2.out',
      }).from(modalBoxRef.current, {
        opacity: 0,
        y: prefersReduced ? 0 : 20,
        scale: prefersReduced ? 1 : 0.98,
        duration: dur,
        ease: 'power3.out',
      }, `-=${dur * 0.4}`);

      if (vesselAnimRef.current && !prefersReduced) {
        gsap.to(vesselAnimRef.current, {
          y: 90,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }
    });

    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      ctx.revert();
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleClose = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      onClose();
      return;
    }
    gsap.to(modalBoxRef.current, {
      opacity: 0,
      y: 15,
      scale: 0.98,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
  };

  // Switch between Sign In and Sign Up tabs with GSAP
  const handleSwitchTab = (tab) => {
    if (tab === activeTab) return;
    setLoginErrors({});
    setLoginGeneralError('');
    setSignupErrors({});
    setSignupGeneralError('');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !formWrapperRef.current) {
      setActiveTab(tab);
      return;
    }

    const direction = tab === 'signup' ? -12 : 12;
    gsap.to(formWrapperRef.current, {
      opacity: 0,
      x: direction,
      duration: 0.14,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(tab);
        gsap.fromTo(
          formWrapperRef.current,
          { opacity: 0, x: -direction },
          { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out' }
        );
      },
    });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Sign In submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginGeneralError('');
    const errors = {};

    if (!loginEmail.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(loginEmail.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginLoading(true);

    try {
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setLoginGeneralError('Email or password is incorrect.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign Up submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupGeneralError('');
    const errors = {};

    if (!signupData.fullName.trim()) {
      errors.fullName = 'Please enter your full name.';
    }

    if (!signupData.companyName.trim()) {
      errors.companyName = 'Please enter your company name.';
    }

    if (!signupData.email.trim() || !isValidEmail(signupData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!signupData.password || signupData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!signupData.confirmPassword || signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!signupData.companyType) {
      errors.companyType = 'Please select your company type.';
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }

    setSignupErrors({});
    setSignupLoading(true);

    try {
      await signup({
        name: signupData.fullName.trim(),
        company: signupData.companyName.trim(),
        companyType: signupData.companyType,
        email: signupData.email.trim(),
        password: signupData.password,
        role: roleConfig.roleValue,
      });

      setSignupSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details and try again.';
      setSignupGeneralError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  const inputBaseStyle = {
    width: '100%',
    height: '46px',
    background: '#FFFFFF',
    border: '1px solid #D9E5EC',
    borderRadius: '9px',
    padding: '0 14px',
    color: '#132B4F',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const handleInputFocus = (e, hasError) => {
    e.target.style.borderColor = hasError ? '#DC2626' : '#1591DC';
    e.target.style.boxShadow = hasError
      ? '0 0 0 3px rgba(220,38,38,0.12)'
      : '0 0 0 3px rgba(21,145,220,0.10)';
  };

  const handleInputBlur = (e, hasError) => {
    e.target.style.borderColor = hasError ? '#DC2626' : '#D9E5EC';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'rgba(19,43,79,0.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${roleConfig.roleName} Authentication`}
    >
      <div
        ref={modalBoxRef}
        className="bm-auth-container"
        style={{
          width: '100%',
          maxWidth: '960px',
          background: '#FFFFFF',
          border: '1px solid #D9E5EC',
          borderRadius: '16px',
          boxShadow: '0 15px 45px rgba(19,43,79,0.12)',
          display: 'grid',
          gridTemplateColumns: '1fr 480px',
          overflow: 'hidden',
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* ================= LEFT COLUMN: Maritime Branding & Visual ================= */}
        <div
          className="bm-auth-left"
          style={{
            background: 'linear-gradient(160deg, #F4FAFD 0%, #EAF6FB 100%)',
            borderRight: '1px solid #D9E5EC',
            padding: '38px 34px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Brand Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
              <div style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" fill="none" width="36" height="36">
                  <rect x="2" y="2" width="7" height="7" rx="2" fill="rgba(8,124,193,0.25)" />
                  <rect x="11" y="2" width="7" height="7" rx="2" fill="rgba(8,124,193,0.5)" />
                  <rect x="20" y="2" width="7" height="7" rx="2" fill="rgba(8,124,193,0.25)" />
                  <rect x="2" y="11" width="7" height="7" rx="2" fill="rgba(8,124,193,0.5)" />
                  <rect x="11" y="11" width="7" height="7" rx="2" fill="#087CC1" />
                  <rect x="20" y="11" width="7" height="7" rx="2" fill="rgba(8,124,193,0.5)" />
                  <rect x="2" y="20" width="7" height="7" rx="2" fill="rgba(8,124,193,0.25)" />
                  <path d="M8 27 Q18 33 28 27 L26 24 Q18 29 10 24 Z" fill="#087CC1" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '19px', fontWeight: 800, color: '#132B4F', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Bulk<span style={{ color: '#087CC1' }}>Matrix</span>
                </div>
                <div style={{ fontSize: '8px', fontWeight: 700, color: '#087CC1', letterSpacing: '0.14em', marginTop: '2px' }}>
                  MARITIME INTELLIGENCE
                </div>
              </div>
            </div>

            <h3
              style={{
                fontSize: '21px',
                fontWeight: 800,
                color: '#132B4F',
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}
            >
              {roleConfig.leftTitle}
            </h3>
            <p style={{ fontSize: '13px', color: '#40566D', lineHeight: 1.6, margin: 0 }}>
              {roleConfig.leftDesc}
            </p>
          </div>

          {/* Center Maritime Visualization */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              margin: '20px 0',
              padding: '18px',
              background: '#FFFFFF',
              border: '1px solid #CFE0EA',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(19,43,79,0.04)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#087CC1',
                letterSpacing: '0.08em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#087CC1' }} />
              {roleConfig.corridorBadge}
            </div>

            <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
              <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%' }}>
                {/* Lat/Lon gridlines */}
                <line x1="0" y1="30" x2="320" y2="30" stroke="#D9E5EC" strokeWidth="0.8" strokeDasharray="3,4" />
                <line x1="0" y1="70" x2="320" y2="70" stroke="#D9E5EC" strokeWidth="0.8" strokeDasharray="3,4" />
                <line x1="160" y1="0" x2="160" y2="120" stroke="#D9E5EC" strokeWidth="0.8" strokeDasharray="3,4" />

                {/* Shipping Route Curved Path */}
                <path
                  d="M 270 20 C 210 45 120 65 50 100"
                  fill="none"
                  stroke="#087CC1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 270 20 C 210 45 120 65 50 100"
                  fill="none"
                  stroke="#38C6D8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.25"
                />

                {/* Origin Port Node */}
                <circle cx="270" cy="20" r="7" fill="none" stroke="#087CC1" strokeWidth="1" opacity="0.4" />
                <circle cx="270" cy="20" r="4" fill="#087CC1" />
                <text x="260" y="14" fontSize="9" fontWeight="700" fill="#132B4F" textAnchor="end">
                  Australia (Hay Point)
                </text>

                {/* Destination Port Node */}
                <circle cx="50" cy="100" r="7" fill="none" stroke="#38C6D8" strokeWidth="1" opacity="0.4" />
                <circle cx="50" cy="100" r="4" fill="#38C6D8" />
                <text x="62" y="108" fontSize="9" fontWeight="700" fill="#132B4F">
                  Paradip / Vizag
                </text>

                {/* Animated Vessel Marker */}
                <g ref={vesselAnimRef} transform="translate(160, 50)">
                  <polygon
                    points="0,-4 3,3 0,1.5 -3,3"
                    fill="#087CC1"
                    stroke="#132B4F"
                    strokeWidth="0.8"
                    transform="rotate(-40)"
                  />
                  <circle cx="0" cy="0" r="1.5" fill="#FF7628" />
                </g>
              </svg>
            </div>
          </div>

          {/* Bottom Audience Reassurance */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '12px', color: '#40566D', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>{roleConfig.footerAudience}</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Authentication Card ================= */}
        <div
          style={{
            padding: '36px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#FFFFFF',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}
        >
          {/* Top Bar: Back & Close Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            {/* Back button */}
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71859A',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#132B4F')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#71859A')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Choose another role
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: '32px',
                height: '32px',
                background: '#F4FAFD',
                border: '1px solid #D9E5EC',
                borderRadius: '8px',
                color: '#71859A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#132B4F';
                e.currentTarget.style.borderColor = '#CFE0EA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#71859A';
                e.currentTarget.style.borderColor = '#D9E5EC';
              }}
              aria-label="Close modal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Role badge & Heading */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#EAF6FB',
                border: '1px solid #CFE0EA',
                marginBottom: '10px',
              }}
            >
              {roleConfig.icon}
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#087CC1', letterSpacing: '0.04em' }}>
                {roleConfig.roleName}
              </span>
            </div>
            <h2
              style={{
                fontSize: '23px',
                fontWeight: 800,
                color: '#132B4F',
                letterSpacing: '-0.025em',
                marginBottom: '4px',
                lineHeight: 1.2,
              }}
            >
              Welcome to BulkMatrix
            </h2>
            <p style={{ fontSize: '13px', color: '#40566D', margin: 0, fontWeight: 400 }}>
              {roleConfig.subtitle}
            </p>
          </div>

          {/* ================= TABS: [ Sign In ] [ Create Account ] ================= */}
          <div
            style={{
              display: 'flex',
              background: '#F4FAFD',
              padding: '4px',
              borderRadius: '9px',
              border: '1px solid #D9E5EC',
              marginBottom: '20px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchTab('signin')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 700,
                border: activeTab === 'signin' ? '1px solid #CFE0EA' : '1px solid transparent',
                background: activeTab === 'signin' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'signin' ? '#132B4F' : '#71859A',
                boxShadow: activeTab === 'signin' ? '0 2px 6px rgba(19,43,79,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'signin' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7628' }} />
              )}
              Sign In
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('signup')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 700,
                border: activeTab === 'signup' ? '1px solid #CFE0EA' : '1px solid transparent',
                background: activeTab === 'signup' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'signup' ? '#132B4F' : '#71859A',
                boxShadow: activeTab === 'signup' ? '0 2px 6px rgba(19,43,79,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'signup' && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF7628' }} />
              )}
              Create Account
            </button>
          </div>

          {/* Form Switch Container */}
          <div ref={formWrapperRef} style={{ width: '100%' }}>
            {/* ================= SIGN IN TAB ================= */}
            {activeTab === 'signin' && (
              <form onSubmit={handleLoginSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loginGeneralError && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#DC2626',
                      fontSize: '13px',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{loginGeneralError}</span>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="lm-login-email"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#40566D',
                      marginBottom: '5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="lm-login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: null }));
                    }}
                    placeholder="you@company.com"
                    style={{
                      ...inputBaseStyle,
                      borderColor: loginErrors.email ? '#DC2626' : '#D9E5EC',
                    }}
                    onFocus={(e) => handleInputFocus(e, !!loginErrors.email)}
                    onBlur={(e) => handleInputBlur(e, !!loginErrors.email)}
                  />
                  {loginErrors.email && (
                    <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', fontWeight: 500 }}>
                      {loginErrors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="lm-login-password"
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#40566D',
                      marginBottom: '5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="lm-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: null }));
                      }}
                      placeholder="Enter your password"
                      style={{
                        ...inputBaseStyle,
                        paddingRight: '44px',
                        borderColor: loginErrors.password ? '#DC2626' : '#D9E5EC',
                      }}
                      onFocus={(e) => handleInputFocus(e, !!loginErrors.password)}
                      onBlur={(e) => handleInputBlur(e, !!loginErrors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#71859A',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#087CC1')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#71859A')}
                    >
                      {showLoginPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', fontWeight: 500 }}>
                      {loginErrors.password}
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotNotice(!showForgotNotice)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#087CC1',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1591DC')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#087CC1')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {showForgotNotice && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        background: '#EAF6FB',
                        border: '1px solid #CFE0EA',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#40566D',
                        lineHeight: 1.45,
                      }}
                    >
                      For password assistance, please contact your administrator or support at{' '}
                      <span style={{ color: '#087CC1', fontWeight: 600 }}>support@bulkmatrix.com</span>.
                    </div>
                  )}
                </div>

                {/* Primary CTA Button: Sign In */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: loginLoading ? '#CBD5E1' : '#FF7628',
                    border: 'none',
                    borderRadius: '9px',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loginLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: loginLoading ? 'none' : '0 3px 12px rgba(255,118,40,0.22)',
                    transition: 'all 0.2s',
                    marginTop: '4px',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!loginLoading) {
                      e.currentTarget.style.background = '#F26522';
                      e.currentTarget.style.boxShadow = '0 5px 16px rgba(255,118,40,0.32)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loginLoading) {
                      e.currentTarget.style.background = '#FF7628';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(255,118,40,0.22)';
                    }
                  }}
                >
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Below the form: Switch to signup */}
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#71859A',
                  }}
                >
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signup')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#087CC1',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1591DC')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#087CC1')}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* ================= SIGN UP TAB ================= */}
            {activeTab === 'signup' && (
              <>
                {signupSuccess ? (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '12px',
                      padding: '36px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#DCFCE7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#16A34A', margin: '0 0 6px' }}>
                      Account created successfully!
                    </h3>
                    <p style={{ fontSize: '13px', color: '#40566D', margin: 0 }}>
                      Entering dashboard...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignupSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Heading for Signup */}
                    <div>
                      <h4
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#132B4F',
                          margin: '0 0 2px',
                        }}
                      >
                        {roleConfig.signupHeading}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#71859A', margin: 0 }}>
                        {roleConfig.signupSubtitle}
                      </p>
                    </div>

                    {signupGeneralError && (
                      <div
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#DC2626',
                          fontSize: '12px',
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{signupGeneralError}</span>
                      </div>
                    )}

                    {/* 1. Full Name */}
                    <div>
                      <label htmlFor="lm-signup-name" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                        FULL NAME
                      </label>
                      <input
                        id="lm-signup-name"
                        type="text"
                        value={signupData.fullName}
                        onChange={(e) => {
                          setSignupData({ ...signupData, fullName: e.target.value });
                          if (signupErrors.fullName) setSignupErrors((prev) => ({ ...prev, fullName: null }));
                        }}
                        placeholder="Enter your full name"
                        style={{
                          ...inputBaseStyle,
                          height: '42px',
                          borderColor: signupErrors.fullName ? '#DC2626' : '#D9E5EC',
                        }}
                        onFocus={(e) => handleInputFocus(e, !!signupErrors.fullName)}
                        onBlur={(e) => handleInputBlur(e, !!signupErrors.fullName)}
                      />
                      {signupErrors.fullName && (
                        <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>
                          {signupErrors.fullName}
                        </div>
                      )}
                    </div>

                    {/* 2. Company Name */}
                    <div>
                      <label htmlFor="lm-signup-company" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                        {roleConfig.companyLabel}
                      </label>
                      <input
                        id="lm-signup-company"
                        type="text"
                        value={signupData.companyName}
                        onChange={(e) => {
                          setSignupData({ ...signupData, companyName: e.target.value });
                          if (signupErrors.companyName) setSignupErrors((prev) => ({ ...prev, companyName: null }));
                        }}
                        placeholder={roleConfig.companyPlaceholder}
                        style={{
                          ...inputBaseStyle,
                          height: '42px',
                          borderColor: signupErrors.companyName ? '#DC2626' : '#D9E5EC',
                        }}
                        onFocus={(e) => handleInputFocus(e, !!signupErrors.companyName)}
                        onBlur={(e) => handleInputBlur(e, !!signupErrors.companyName)}
                      />
                      {signupErrors.companyName && (
                        <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>
                          {signupErrors.companyName}
                        </div>
                      )}
                    </div>

                    {/* 3. Email Address */}
                    <div>
                      <label htmlFor="lm-signup-email" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                        EMAIL ADDRESS
                      </label>
                      <input
                        id="lm-signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => {
                          setSignupData({ ...signupData, email: e.target.value });
                          if (signupErrors.email) setSignupErrors((prev) => ({ ...prev, email: null }));
                        }}
                        placeholder="you@company.com"
                        style={{
                          ...inputBaseStyle,
                          height: '42px',
                          borderColor: signupErrors.email ? '#DC2626' : '#D9E5EC',
                        }}
                        onFocus={(e) => handleInputFocus(e, !!signupErrors.email)}
                        onBlur={(e) => handleInputBlur(e, !!signupErrors.email)}
                      />
                      {signupErrors.email && (
                        <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>
                          {signupErrors.email}
                        </div>
                      )}
                    </div>

                    {/* 4 & 5. Password & Confirm Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label htmlFor="lm-signup-pass" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                          PASSWORD
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="lm-signup-pass"
                            type={showSignupPassword ? 'text' : 'password'}
                            value={signupData.password}
                            onChange={(e) => {
                              setSignupData({ ...signupData, password: e.target.value });
                              if (signupErrors.password) setSignupErrors((prev) => ({ ...prev, password: null }));
                            }}
                            placeholder="Min 8 chars"
                            style={{
                              ...inputBaseStyle,
                              height: '42px',
                              paddingRight: '32px',
                              borderColor: signupErrors.password ? '#DC2626' : '#D9E5EC',
                            }}
                            onFocus={(e) => handleInputFocus(e, !!signupErrors.password)}
                            onBlur={(e) => handleInputBlur(e, !!signupErrors.password)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            aria-label="Toggle password"
                            style={{
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: '#71859A',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {showSignupPassword ? (
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8" />
                              ) : (
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {signupErrors.password && (
                          <div style={{ color: '#DC2626', fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>
                            {signupErrors.password}
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lm-signup-confirm" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                          CONFIRM
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="lm-signup-confirm"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={signupData.confirmPassword}
                            onChange={(e) => {
                              setSignupData({ ...signupData, confirmPassword: e.target.value });
                              if (signupErrors.confirmPassword) setSignupErrors((prev) => ({ ...prev, confirmPassword: null }));
                            }}
                            placeholder="Repeat"
                            style={{
                              ...inputBaseStyle,
                              height: '42px',
                              paddingRight: '32px',
                              borderColor: signupErrors.confirmPassword ? '#DC2626' : '#D9E5EC',
                            }}
                            onFocus={(e) => handleInputFocus(e, !!signupErrors.confirmPassword)}
                            onBlur={(e) => handleInputBlur(e, !!signupErrors.confirmPassword)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Toggle confirm password"
                            style={{
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: '#71859A',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {showConfirmPassword ? (
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8" />
                              ) : (
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {signupErrors.confirmPassword && (
                          <div style={{ color: '#DC2626', fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>
                            {signupErrors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Company Type Dropdown */}
                    <div>
                      <label htmlFor="lm-signup-company-type" style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#40566D', marginBottom: '4px', letterSpacing: '0.04em' }}>
                        COMPANY TYPE
                      </label>
                      <select
                        id="lm-signup-company-type"
                        value={signupData.companyType}
                        onChange={(e) => {
                          setSignupData({ ...signupData, companyType: e.target.value });
                          if (signupErrors.companyType) setSignupErrors((prev) => ({ ...prev, companyType: null }));
                        }}
                        style={{
                          ...inputBaseStyle,
                          height: '42px',
                          cursor: 'pointer',
                          borderColor: signupErrors.companyType ? '#DC2626' : '#D9E5EC',
                          color: signupData.companyType ? '#132B4F' : '#71859A',
                        }}
                        onFocus={(e) => handleInputFocus(e, !!signupErrors.companyType)}
                        onBlur={(e) => handleInputBlur(e, !!signupErrors.companyType)}
                      >
                        <option value="" disabled style={{ color: '#71859A' }}>
                          Select your company type
                        </option>
                        {companyOptions.map((type) => (
                          <option key={type} value={type} style={{ color: '#132B4F' }}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {signupErrors.companyType && (
                        <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>
                          {signupErrors.companyType}
                        </div>
                      )}
                    </div>

                    {/* Primary Button: Create Account */}
                    <button
                      type="submit"
                      disabled={signupLoading}
                      style={{
                        width: '100%',
                        height: '46px',
                        background: signupLoading ? '#CBD5E1' : '#FF7628',
                        border: 'none',
                        borderRadius: '9px',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: signupLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: signupLoading ? 'none' : '0 3px 12px rgba(255,118,40,0.22)',
                        transition: 'all 0.2s',
                        marginTop: '4px',
                        letterSpacing: '0.01em',
                      }}
                      onMouseEnter={(e) => {
                        if (!signupLoading) {
                          e.currentTarget.style.background = '#F26522';
                          e.currentTarget.style.boxShadow = '0 5px 16px rgba(255,118,40,0.32)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!signupLoading) {
                          e.currentTarget.style.background = '#FF7628';
                          e.currentTarget.style.boxShadow = '0 3px 12px rgba(255,118,40,0.22)';
                        }
                      }}
                    >
                      {signupLoading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    {/* Switch to sign in */}
                    <div
                      style={{
                        textAlign: 'center',
                        marginTop: '6px',
                        fontSize: '13px',
                        color: '#71859A',
                      }}
                    >
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('signin')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#087CC1',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#1591DC')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#087CC1')}
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder { color: #71859A; }
        @media (max-width: 860px) {
          .bm-auth-container {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
          }
          .bm-auth-left {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LogisticsAuthModal;
