import { useState, useEffect } from 'react';
import { getKPIs, getMyCharterContracts } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Ship,
  AlertTriangle,
  Activity,
  Anchor,
  BarChart2,
  ArrowRight,
  Cloud,
  MessageSquare,
  FileCheck,
  Compass,
  Calculator,
  Clock,
  CheckCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const SkeletonCard = () => (
  <div className="saas-card p-5">
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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2">
            {greeting()}, {user?.name?.split(' ')[0] || 'Manager'}
          </h1>
          <p className="saas-subtitle">
            BulkMatrix dry bulk freight intelligence, market indices, and voyage operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Feed
          </div>

          <Link
            to="/planner"
            className="saas-btn-primary"
          >
            <Compass size={15} /> New Charter Plan
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="col-span-full p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        ) : kpis ? (
          <>
            {/* KPI 1: Baltic Dry Index */}
            <div className="saas-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Baltic Dry Index (BDI)
                  </span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {formatNumber(kpis.bdi)}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <span className={`saas-badge ${kpis.bdiTrend >= 0 ? 'saas-badge-success' : 'saas-badge-danger'}`}>
                  {kpis.bdiTrend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpis.bdiTrend >= 0 ? '+' : ''}{kpis.bdiTrend}%
                </span>
                <span className="text-slate-400">vs 7-day average</span>
              </div>
            </div>

            {/* KPI 2: Active Charters */}
            <div className="saas-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Active Voyages
                  </span>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {kpis.activeCharters || contracts.filter(c => c.status === 'ACCEPTED' || c.status === 'ACTIVE').length}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <Anchor size={18} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Vessels currently on water</span>
                <Link to="/contracts" className="text-sky-600 font-semibold hover:underline">View all</Link>
              </div>
            </div>

            {/* KPI 3: Port Congestion */}
            <div className="saas-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Port Congestion Index
                  </span>
                  <div className="text-2xl font-bold text-amber-700 tracking-tight">
                    {kpis.congestionIndex}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Ship size={18} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>East Coast Ports (Haldia/Paradip)</span>
              </div>
            </div>

            {/* KPI 4: Weather Risk */}
            <div className="saas-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Maritime Weather Risk
                  </span>
                  <div className="text-2xl font-bold text-rose-600 tracking-tight">
                    {kpis.weatherRisk?.split(' ')[0] || 'Elevated'}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Cloud size={18} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Bay of Bengal advisory</span>
                <Link to="/weather" className="text-rose-600 font-semibold hover:underline">Details</Link>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Main Analytics & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 Cols wide on desktop): Operational Contracts & Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Contracts Table Preview */}
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck size={18} className="text-sky-600" /> Active Charter Pipeline
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Recent bookings, fixture requests, and owner confirmations</p>
              </div>
              <Link to="/contracts" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                View all ({contracts.length}) <ArrowRight size={13} />
              </Link>
            </div>

            {contracts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Anchor size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-slate-600 mb-1">No active contracts yet</p>
                <p className="text-xs text-slate-400 mb-4">Run an AI match in Charter Planner to initiate vessel requests.</p>
                <Link to="/planner" className="saas-btn-primary text-xs py-1.5 px-3">
                  Open Charter Planner
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-2">Contract</th>
                      <th className="py-2.5 px-2">Cargo / Route</th>
                      <th className="py-2.5 px-2">Volume</th>
                      <th className="py-2.5 px-2">Assigned Vessel</th>
                      <th className="py-2.5 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {contracts.slice(0, 5).map(contract => (
                      <tr key={contract._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-2 font-mono font-medium text-slate-900">
                          #{contract._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-semibold text-slate-900">{contract.cargoType}</div>
                          <div className="text-[11px] text-slate-400">{contract.originPort} → {contract.destinationPort}</div>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {contract.volume?.toLocaleString()} MT
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium text-slate-800">
                            {contract.vesselId?.vesselName || 'Pending Assignment'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
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

          {/* Quick Operations Hub (Grid of 4 clean cards) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Platform Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/planner"
                className="saas-card-interactive flex items-start gap-3.5 p-4.5"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Compass size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Charter Planner</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    AI vessel matching, freight cost forecasts, and route optimizations.
                  </p>
                </div>
              </Link>

              <Link
                to="/analytics"
                className="saas-card-interactive flex items-start gap-3.5 p-4.5"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Voyage Analytics</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cargo volume trends, contract funnel, and load port distributions.
                  </p>
                </div>
              </Link>

              <Link
                to="/calculator"
                className="saas-card-interactive flex items-start gap-3.5 p-4.5"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calculator size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">TCE & Laytime Calculator</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Time charter equivalent estimator, bunker costs, and demurrage settlement.
                  </p>
                </div>
              </Link>

              <Link
                to="/live-tracker"
                className="saas-card-interactive flex items-start gap-3.5 p-4.5"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ship size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-0.5">Live Fleet AIS Tracker</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
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
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Operational Advisories
              </h2>
              <Link to="/weather" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                Weather map
              </Link>
            </div>

            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`saas-badge text-[10px] py-0.5 px-2 ${alert.badgeClass}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-slate-400">{alert.time}</span>
                  </div>
                  <div className="font-bold text-slate-900 pt-1">{alert.title}</div>
                  <p className="text-slate-500 leading-relaxed text-[11.5px]">{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messaging Shortcut */}
          <div className="saas-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Charter Communications</h4>
                <p className="text-[11px] text-slate-300">Direct negotiations with fleet owners</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Negotiate freight rates, review fixture recap notes, and coordinate port arrival readiness.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Open Active Negotiations <ArrowRight size={13} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
