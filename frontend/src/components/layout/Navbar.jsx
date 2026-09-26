import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Anchor,
  Map,
  CloudRain,
  TrendingUp,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Inbox,
  FileCheck,
  MessageSquare,
  BarChart2,
  Compass,
  Ship
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const isOwner = user?.role === 'VESSEL_OWNER';
  const homePath = isOwner ? '/owner/dashboard' : '/dashboard';

  const isPathActive = (path) => {
    if (path === '/dashboard' || path === '/owner/dashboard') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isToolsActive = [
    '/weather',
    '/market-analysis'
  ].some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'BM';

  return (
    <header 
      className="sticky top-0 z-40 h-[72px] flex-shrink-0 transition-all"
      style={{
        backgroundColor: '#FEFFFF',
        borderBottom: '1px solid #DADCEB',
        boxShadow: '0 1px 3px rgba(19, 48, 86, 0.03)'
      }}
    >
      <div className="w-full max-w-[1440px] h-full mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between gap-6">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <Link to={homePath} className="flex items-center gap-3 group no-underline text-inherit">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                backgroundColor: '#4187AB',
                color: '#FEFFFF',
                boxShadow: '0 2px 6px rgba(65, 135, 171, 0.25)'
              }}
            >
              <Anchor size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div 
                className="text-[17px] font-bold tracking-tight leading-none"
                style={{ color: '#133056' }}
              >
                BULKMATRIX
              </div>
              <div 
                className="text-[10px] font-bold uppercase tracking-widest mt-1 leading-none"
                style={{ color: '#586D85' }}
              >
                MARITIME INTELLIGENCE
              </div>
            </div>
          </Link>
        </div>

        {/* Center Navigation: Desktop */}
        <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-[850px]">
          {isOwner ? (
            /* Vessel Owner Nav Links */
            <>
              <Link
                to="/owner/dashboard"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/owner/dashboard') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/owner/dashboard') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/owner/dashboard') ? '600' : '500',
                  border: isPathActive('/owner/dashboard') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              <Link
                to="/owner/fleet"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/owner/fleet') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/owner/fleet') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/owner/fleet') ? '600' : '500',
                  border: isPathActive('/owner/fleet') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <Ship size={16} /> My Fleet
              </Link>

              <Link
                to="/owner/requests"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/owner/requests') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/owner/requests') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/owner/requests') ? '600' : '500',
                  border: isPathActive('/owner/requests') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <Inbox size={16} /> Requests
              </Link>

              <Link
                to="/owner/contracts"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/owner/contracts') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/owner/contracts') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/owner/contracts') ? '600' : '500',
                  border: isPathActive('/owner/contracts') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <FileCheck size={16} /> Active Contracts
              </Link>

              <Link
                to="/live-tracker"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/live-tracker') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/live-tracker') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/live-tracker') ? '600' : '500',
                  border: isPathActive('/live-tracker') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <Map size={16} /> Live AIS
              </Link>

              <Link
                to="/chat"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/chat') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/chat') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/chat') ? '600' : '500',
                  border: isPathActive('/chat') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <MessageSquare size={16} /> Messages
              </Link>
            </>
          ) : (
            /* Charterer / Logistics Manager Nav Links */
            <>
              <Link
                to="/dashboard"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/dashboard') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/dashboard') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/dashboard') ? '600' : '500',
                  border: isPathActive('/dashboard') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>

              <Link
                to="/planner"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/planner') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/planner') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/planner') ? '600' : '500',
                  border: isPathActive('/planner') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <Compass size={16} /> Charter Planner
              </Link>

              <Link
                to="/contracts"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/contracts') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/contracts') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/contracts') ? '600' : '500',
                  border: isPathActive('/contracts') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <FileCheck size={16} /> Bookings
              </Link>

              <Link
                to="/live-tracker"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/live-tracker') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/live-tracker') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/live-tracker') ? '600' : '500',
                  border: isPathActive('/live-tracker') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <Map size={16} /> Live AIS
              </Link>

              {/* Intelligence & Analytics Dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                  style={{
                    color: isToolsActive ? '#4187AB' : '#586D85',
                    backgroundColor: isToolsActive ? '#F5FAFE' : 'transparent',
                    fontWeight: isToolsActive ? '600' : '500',
                    border: isToolsActive ? '1px solid #DADCEB' : '1px solid transparent'
                  }}
                >
                  <BarChart2 size={16} />
                  <span>Intelligence & Tools</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#586D85' }} />
                </button>

                {toolsDropdownOpen && (
                  <div 
                    className="absolute top-[calc(100%+8px)] left-0 w-68 rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      backgroundColor: '#FEFFFF',
                      border: '1px solid #DADCEB',
                      boxShadow: '0 8px 24px rgba(19, 48, 86, 0.08)'
                    }}
                  >

                    <Link
                      to="/market-analysis"
                      className="flex items-start gap-3 p-3 rounded-lg text-xs transition-colors"
                      style={{ color: '#586D85' }}
                    >
                      <div 
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}
                      >
                        <TrendingUp size={15} />
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: '#133056' }}>Baltic Market Indices</div>
                        <div className="text-[11px]" style={{ color: '#586D85' }}>BDI, BCI, BPI & freight rates</div>
                      </div>
                    </Link>

                    <Link
                      to="/weather"
                      className="flex items-start gap-3 p-3 rounded-lg text-xs transition-colors"
                      style={{ color: '#586D85' }}
                    >
                      <div 
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB' }}
                      >
                        <CloudRain size={15} />
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: '#133056' }}>Weather Intelligence</div>
                        <div className="text-[11px]" style={{ color: '#586D85' }}>Route cyclone & sea warnings</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/chat"
                className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
                style={{
                  color: isPathActive('/chat') ? '#4187AB' : '#586D85',
                  backgroundColor: isPathActive('/chat') ? '#F5FAFE' : 'transparent',
                  fontWeight: isPathActive('/chat') ? '600' : '500',
                  border: isPathActive('/chat') ? '1px solid #DADCEB' : '1px solid transparent'
                }}
              >
                <MessageSquare size={16} /> Messages
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-lg text-sm transition-all inline-flex items-center gap-2"
              style={{
                color: isPathActive('/admin') ? '#4187AB' : '#586D85',
                backgroundColor: isPathActive('/admin') ? '#F5FAFE' : 'transparent',
                fontWeight: isPathActive('/admin') ? '600' : '500',
                border: isPathActive('/admin') ? '1px solid #DADCEB' : '1px solid transparent'
              }}
            >
              <Settings size={16} /> Admin
            </Link>
          )}
        </nav>

        {/* Right Controls: Role Badge + Notification + Profile */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Role Pill */}
          <span 
            className="hidden sm:inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold"
            style={{
              backgroundColor: '#F5FAFE',
              color: '#133056',
              border: '1px solid #DADCEB'
            }}
          >
            {isOwner ? 'Vessel Owner' : 'Charterer'}
          </span>

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all cursor-pointer"
              style={{
                backgroundColor: '#FEFFFF',
                borderColor: '#DADCEB',
                color: '#133056'
              }}
            >
              <div 
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ backgroundColor: '#133056' }}
              >
                {initials}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <div className="font-semibold" style={{ color: '#133056' }}>{user?.name?.split(' ')[0] || 'User'}</div>
              </div>
              <ChevronDown size={13} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#586D85' }} />
            </button>

            {profileDropdownOpen && (
              <div 
                className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: '#FEFFFF',
                  border: '1px solid #DADCEB',
                  boxShadow: '0 8px 24px rgba(19, 48, 86, 0.08)'
                }}
              >
                <div className="px-3 py-2.5 border-b" style={{ borderColor: '#DADCEB' }}>
                  <div className="text-xs font-bold truncate" style={{ color: '#133056' }}>{user?.name}</div>
                  <div className="text-[11px] truncate mt-0.5" style={{ color: '#586D85' }}>{user?.email}</div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors hover:bg-slate-50"
                    style={{ color: '#133056' }}
                  >
                    <User size={14} style={{ color: '#4187AB' }} />
                    <span>Company & User Profile</span>
                  </Link>
                </div>

                <div className="border-t pt-1" style={{ borderColor: '#DADCEB' }}>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none bg-transparent text-left"
                    style={{ color: '#B91C1C' }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border"
            style={{
              backgroundColor: '#FEFFFF',
              borderColor: '#DADCEB',
              color: '#133056'
            }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden border-b px-6 py-4 space-y-1 shadow-lg max-h-[calc(100vh-72px)] overflow-y-auto"
          style={{
            backgroundColor: '#FEFFFF',
            borderColor: '#DADCEB'
          }}
        >
          {isOwner ? (
            <>
              <Link to="/owner/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <LayoutDashboard size={16} style={{ color: '#4187AB' }} /> Dashboard
              </Link>
              <Link to="/owner/fleet" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <Ship size={16} style={{ color: '#4187AB' }} /> My Fleet
              </Link>
              <Link to="/owner/requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <Inbox size={16} style={{ color: '#4187AB' }} /> Requests
              </Link>
              <Link to="/owner/contracts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <FileCheck size={16} style={{ color: '#4187AB' }} /> Active Contracts
              </Link>
              <Link to="/live-tracker" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <Map size={16} style={{ color: '#4187AB' }} /> Live AIS
              </Link>
              <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <MessageSquare size={16} style={{ color: '#4187AB' }} /> Messages
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <LayoutDashboard size={16} style={{ color: '#4187AB' }} /> Dashboard
              </Link>
              <Link to="/planner" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <Compass size={16} style={{ color: '#4187AB' }} /> Charter Planner
              </Link>
              <Link to="/contracts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <FileCheck size={16} style={{ color: '#4187AB' }} /> Bookings
              </Link>
              <Link to="/live-tracker" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                <Map size={16} style={{ color: '#4187AB' }} /> Live AIS
              </Link>
              <div className="pt-2 pb-1 border-t" style={{ borderColor: '#DADCEB' }}>
                <div className="text-[11px] font-bold uppercase tracking-wider px-3 mb-1" style={{ color: '#586D85' }}>Intelligence & Tools</div>
                <Link to="/market-analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                  <TrendingUp size={16} style={{ color: '#15803D' }} /> Baltic Markets
                </Link>
                <Link to="/weather" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                  <CloudRain size={16} style={{ color: '#4187AB' }} /> Weather Intelligence
                </Link>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: '#DADCEB' }}>
                <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
                  <MessageSquare size={16} style={{ color: '#4187AB' }} /> Messages
                </Link>
              </div>
            </>
          )}
          <div className="pt-2 border-t" style={{ borderColor: '#DADCEB' }}>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold" style={{ color: '#133056' }}>
              <User size={16} style={{ color: '#4187AB' }} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer border-none bg-transparent text-left"
              style={{ color: '#B91C1C' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
