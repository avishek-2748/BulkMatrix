import { useState, useEffect } from 'react';
import { getKPIs, getMyCharterContracts } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Ship,
  AlertTriangle,
  Activity,
  Anchor,
  ArrowRight,
  Cloud,
  MessageSquare,
  FileCheck,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SkeletonCard = () => (
  <div className="saas-card">
    <div className="skeleton h-3 w-1/2 mb-4" />
    <div className="skeleton h-8 w-1/3 mb-2" />
    <div className="skeleton h-3 w-3/4" />
  </div>
);

const Home = () => {
  const [kpis, setKpis] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      getKPIs().catch(() => null),
      getMyCharterContracts().catch(() => [])
    ]).then(([kpiData, contractData]) => {
      if (kpiData) setKpis(kpiData);
      if (contractData) setContracts(contractData);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load dashboard metrics.');
      setLoading(false);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const alerts = [
    {
      severity: 'CRITICAL',
      badgeClass: 'saas-badge-danger',
      title: 'High Cyclone Risk in Paradip',
      desc: 'Severe depression forming over Bay of Bengal. 48-hr voyage delay expected.',
      time: '15 min ago'
    },
    {
      severity: 'WARNING',
      badgeClass: 'saas-badge-warning',
      title: 'Haldia Port Congestion Alert',
      desc: 'Average waiting time increased by +2.5 days for Supramax and Panamax.',
      time: '2 hrs ago'
    },
    {
      severity: 'INFO',
      badgeClass: 'saas-badge-info',
      title: 'BDI Benchmark Trending Up',
      desc: 'Dry bulk index up +3.8% week-over-week. Spot freight rates rising.',
      time: '5 hrs ago'
    }
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-3">
            {greeting()}, {user?.name?.split(' ')[0] || 'Manager'}
          </h1>
          <p className="saas-subtitle">
            BulkMatrix maritime intelligence, predictive freight indicators, and commercial voyage operations.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D'
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Feed
          </div>

          <Link
            to="/planner"
            className="saas-btn-primary"
          >
            <Compass size={16} /> New Charter Plan
          </Link>
        </div>
      </div>

      {/* KEY METRICS RIBBON */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider mb-4 px-1" style={{ color: '#586D85' }}>
          Key Market & Fleet Metrics
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="col-span-full p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          ) : kpis ? (
            <>
              {/* KPI 1: Baltic Dry Index */}
              <div className="saas-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#586D85' }}>
                      Baltic Dry Index (BDI)
                    </span>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: '#133056' }}>
                      {formatNumber(kpis.bdi)}
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB' }}
                  >
                    <Activity size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3.5 flex items-center gap-2 text-xs" style={{ borderTop: '1px solid #DADCEB' }}>
                  <span className={`saas-badge ${kpis.bdiTrend >= 0 ? 'saas-badge-success' : 'saas-badge-danger'}`}>
                    {kpis.bdiTrend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {kpis.bdiTrend >= 0 ? '+' : ''}{kpis.bdiTrend}%
                  </span>
                  <span style={{ color: '#586D85' }}>vs 7-day average</span>
                </div>
              </div>

              {/* KPI 2: Active Charters */}
              <div className="saas-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#586D85' }}>
                      Active Voyages
                    </span>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: '#133056' }}>
                      {kpis.activeCharters || contracts.filter(c => c.status === 'ACCEPTED' || c.status === 'ACTIVE').length}
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB' }}
                  >
                    <Anchor size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3.5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #DADCEB', color: '#586D85' }}>
                  <span>Vessels currently on water</span>
                  <Link to="/contracts" className="font-semibold hover:underline" style={{ color: '#4187AB' }}>View all →</Link>
                </div>
              </div>

              {/* KPI 3: Port Congestion */}
              <div className="saas-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#586D85' }}>
                      Port Congestion Index
                    </span>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: '#B45309' }}>
                      {kpis.congestionIndex}
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }}
                  >
                    <Ship size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3.5 flex items-center gap-1.5 text-xs" style={{ borderTop: '1px solid #DADCEB', color: '#586D85' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>East Coast Ports (Haldia/Paradip)</span>
                </div>
              </div>

              {/* KPI 4: Weather Risk */}
              <div className="saas-card">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#586D85' }}>
                      Maritime Weather Risk
                    </span>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: '#B91C1C' }}>
                      {kpis.weatherRisk?.split(' ')[0] || 'Elevated'}
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
                  >
                    <Cloud size={20} />
                  </div>
                </div>
                <div className="mt-4 pt-3.5 flex items-center justify-between text-xs" style={{ borderTop: '1px solid #DADCEB', color: '#586D85' }}>
                  <span>Bay of Bengal advisory</span>
                  <Link to="/weather" className="font-semibold hover:underline" style={{ color: '#B91C1C' }}>Details →</Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Main Analytics & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols wide on desktop): Operational Contracts & Pipeline */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Contracts Table Preview */}
          <div className="saas-card p-0 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: '#DADCEB', backgroundColor: '#F5FAFE' }}>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                  <FileCheck size={18} style={{ color: '#4187AB' }} /> Active Charter Pipeline
                </h2>
                <p className="text-xs mt-1" style={{ color: '#586D85' }}>Recent bookings, fixture requests, and owner confirmations</p>
              </div>
              <Link to="/contracts" className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#4187AB' }}>
                View all ({contracts.length}) <ArrowRight size={13} />
              </Link>
            </div>

            {contracts.length === 0 ? (
              <div className="py-16 text-center" style={{ color: '#586D85' }}>
                <Anchor size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold mb-1" style={{ color: '#133056' }}>No active charter contracts</p>
                <p className="text-xs mb-5" style={{ color: '#586D85' }}>Run an AI match in Charter Planner to initiate vessel requests.</p>
                <Link to="/planner" className="saas-btn-primary text-xs py-2 px-4">
                  Open Charter Planner
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Contract</th>
                      <th>Cargo / Route</th>
                      <th>Volume</th>
                      <th>Assigned Vessel</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.slice(0, 5).map(contract => (
                      <tr key={contract._id}>
                        <td className="font-mono font-bold" style={{ color: '#133056' }}>
                          #{contract._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div className="font-semibold" style={{ color: '#133056' }}>{contract.cargoType}</div>
                          <div className="text-xs" style={{ color: '#586D85' }}>{contract.originPort} → {contract.destinationPort}</div>
                        </td>
                        <td className="font-semibold" style={{ color: '#133056' }}>
                          {contract.volume?.toLocaleString()} MT
                        </td>
                        <td>
                          <span className="font-medium" style={{ color: '#133056' }}>
                            {contract.vesselId?.vesselName || 'Pending Assignment'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`saas-badge ${
                            contract.status === 'ACCEPTED' ? 'saas-badge-success' :
                            contract.status === 'ACTIVE' ? 'saas-badge-info' :
                            contract.status === 'REJECTED' ? 'saas-badge-danger' :
                            'saas-badge-warning'
                          }`}>
                            {contract.status === 'ACCEPTED' ? 'Accepted' :
                             contract.status === 'ACTIVE' ? 'On Voyage' :
                             contract.status === 'REJECTED' ? 'Declined' : 'Pending Owner'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Platform Modules (Grid of 4 clean cards) */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-4 px-1" style={{ color: '#586D85' }}>
              Maritime Intelligence Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link
                to="/planner"
                className="saas-card-interactive flex items-start gap-4 p-5"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#FFF5EF', color: '#F3752F', border: '1px solid #FCD4BE' }}
                >
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: '#133056' }}>Charter Planner</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#586D85' }}>
                    AI vessel matching, freight cost forecasts, and route optimizations.
                  </p>
                </div>
              </Link>

              <Link
                to="/market-analysis"
                className="saas-card-interactive flex items-start gap-4 p-5"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}
                >
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: '#133056' }}>Baltic Market Indices</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#586D85' }}>
                    Live BDI, BCI, BPI dry bulk indices, freight benchmarks, and market trends.
                  </p>
                </div>
              </Link>

              <Link
                to="/weather"
                className="saas-card-interactive flex items-start gap-4 p-5"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB' }}
                >
                  <Cloud size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: '#133056' }}>Weather Intelligence</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#586D85' }}>
                    Ocean route cyclone alerts, wave heights, and voyage weather hazard tracking.
                  </p>
                </div>
              </Link>

              <Link
                to="/live-tracker"
                className="saas-card-interactive flex items-start gap-4 p-5"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: '#F5FAFE', color: '#4187AB', border: '1px solid #DADCEB' }}
                >
                  <Ship size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: '#133056' }}>Live Fleet AIS Tracker</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#586D85' }}>
                    Track dry bulk carriers, underway speeds, headings, and weather risks.
                  </p>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Operational Risk & Alerts */}
        <div className="space-y-6">
          
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b" style={{ borderColor: '#DADCEB' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                <AlertTriangle size={16} style={{ color: '#F3752F' }} /> Operational Advisories
              </h2>
              <Link to="/weather" className="text-xs font-semibold hover:underline" style={{ color: '#4187AB' }}>
                Weather map →
              </Link>
            </div>

            <div className="space-y-3.5">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-xs space-y-1.5 transition-all"
                  style={{
                    backgroundColor: '#F5FAFE',
                    border: '1px solid #DADCEB'
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`saas-badge text-[10px] py-0.5 px-2 ${alert.badgeClass}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px]" style={{ color: '#8295AB' }}>{alert.time}</span>
                  </div>
                  <div className="font-bold pt-1" style={{ color: '#133056' }}>{alert.title}</div>
                  <p className="leading-relaxed text-[11.5px]" style={{ color: '#586D85' }}>{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messaging Banner */}
          <div 
            className="saas-card p-6"
            style={{
              backgroundColor: '#133056',
              color: '#FEFFFF',
              border: 'none',
              boxShadow: '0 8px 24px rgba(19, 48, 86, 0.12)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#A7DAF1' }}
              >
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Charter Communications</h4>
                <p className="text-[11px]" style={{ color: '#A7DAF1' }}>Direct negotiations with fleet owners</p>
              </div>
            </div>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: '#DADCEB' }}>
              Negotiate freight rates, review fixture recap notes, and coordinate port arrival readiness in real time.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all no-underline"
              style={{
                backgroundColor: '#F3752F',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(243, 117, 47, 0.35)'
              }}
            >
              Open Active Negotiations <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
