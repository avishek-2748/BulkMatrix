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
  Calculator,
  Compass,
  Layers,
  Sparkles
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
    '/analytics',
    '/calculator',
    '/weather',
    '/market-analysis'
  ].some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex-shrink-0">
      <div className="w-full max-w-[1440px] h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link to={homePath} className="flex items-center gap-2.5 group no-underline text-inherit">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-sm shadow-sky-500/20 group-hover:bg-sky-600 transition-colors">
              <Anchor size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-[16px] font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors leading-none">
                BulkMatrix
              </div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                {isOwner ? 'Fleet Operations' : 'Maritime SaaS'}
              </div>
            </div>
          </Link>
        </div>

        {/* Center Navigation: Desktop */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-[800px]">
          {isOwner ? (
            /* Vessel Owner Nav Links */
            <>
              <Link
                to="/owner/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/owner/dashboard')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <Link
                to="/owner/fleet"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/owner/fleet')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Anchor size={15} /> My Fleet
              </Link>

              <Link
                to="/owner/requests"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/owner/requests')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Inbox size={15} /> Requests
              </Link>

              <Link
                to="/owner/contracts"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/owner/contracts')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCheck size={15} /> Active Contracts
              </Link>

              <Link
                to="/calculator"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/calculator')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calculator size={15} /> TCE Estimator
              </Link>

              <Link
                to="/live-tracker"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/live-tracker')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Map size={15} /> Live AIS
              </Link>

              <Link
                to="/chat"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/chat')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare size={15} /> Messages
              </Link>
            </>
          ) : (
            /* Charterer / Logistics Manager Nav Links */
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/dashboard')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>

              <Link
                to="/planner"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/planner')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass size={15} /> Charter Planner
              </Link>

              <Link
                to="/contracts"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/contracts')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileCheck size={15} /> Bookings
              </Link>

              <Link
                to="/live-tracker"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/live-tracker')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Map size={15} /> Live AIS
              </Link>

              {/* Intelligence & Analytics Dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer border-none bg-transparent ${
                    isToolsActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart2 size={15} />
                  <span>Intelligence & Tools</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 text-slate-400 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      to="/analytics"
                      className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                        isPathActive('/analytics') ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BarChart2 size={15} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Voyage Analytics</div>
                        <div className="text-[11px] text-slate-500">Volume trends, KPIs & funnel</div>
                      </div>
                    </Link>

                    <Link
                      to="/calculator"
                      className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                        isPathActive('/calculator') ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calculator size={15} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">TCE & Laytime Calculator</div>
                        <div className="text-[11px] text-slate-500">Voyage profit & demurrage sheet</div>
                      </div>
                    </Link>

                    <Link
                      to="/market-analysis"
                      className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                        isPathActive('/market-analysis') ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp size={15} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Baltic Market Indices</div>
                        <div className="text-[11px] text-slate-500">BDI, BCI, BPI & freight rates</div>
                      </div>
                    </Link>

                    <Link
                      to="/weather"
                      className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors ${
                        isPathActive('/weather') ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CloudRain size={15} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Weather Intelligence</div>
                        <div className="text-[11px] text-slate-500">Route cyclone & sea warnings</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/chat"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  isPathActive('/chat')
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare size={15} /> Messages
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                isPathActive('/admin')
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings size={15} /> Admin
            </Link>
          )}
        </nav>

        {/* Right Controls: Role Badge + Notification + Profile */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Role Pill */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {isOwner ? 'Vessel Owner' : 'Charterer'}
          </span>

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer bg-white"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <div className="font-semibold text-slate-800">{user?.name?.split(' ')[0] || 'User'}</div>
              </div>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>User Profile</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Preferences & Security</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent text-left"
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
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg max-h-[calc(100vh-64px)] overflow-y-auto">
          {isOwner ? (
            <>
              <Link to="/owner/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/owner/fleet" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Anchor size={16} /> My Fleet
              </Link>
              <Link to="/owner/requests" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Inbox size={16} /> Requests
              </Link>
              <Link to="/owner/contracts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FileCheck size={16} /> Active Contracts
              </Link>
              <Link to="/calculator" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Calculator size={16} /> TCE Estimator
              </Link>
              <Link to="/live-tracker" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Map size={16} /> Live AIS
              </Link>
              <Link to="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <MessageSquare size={16} /> Messages
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/planner" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Compass size={16} /> Charter Planner
              </Link>
              <Link to="/contracts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FileCheck size={16} /> Bookings
              </Link>
              <Link to="/live-tracker" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Map size={16} /> Live AIS
              </Link>
              <div className="pt-2 pb-1 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Intelligence & Tools</div>
                <Link to="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <BarChart2 size={16} /> Voyage Analytics
                </Link>
                <Link to="/calculator" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Calculator size={16} /> TCE & Laytime Calculator
                </Link>
                <Link to="/market-analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <TrendingUp size={16} /> Baltic Markets
                </Link>
                <Link to="/weather" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <CloudRain size={16} /> Weather Intelligence
                </Link>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link to="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <MessageSquare size={16} /> Messages
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
