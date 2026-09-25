import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyVessels, getIncomingRequests, getActiveContracts } from '../../services/api';
import {
  Anchor,
  Activity,
  Clock,
  Plus,
  Ship,
  TrendingUp,
  Navigation,
  ChevronRight,
  Map,
  MessageSquare,
  FileCheck,
  Calculator,
  ArrowRight,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ vessels: 0, contracts: 0, requests: 0 });
  const [vessels, setVessels] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vesselData, requestData, contractData] = await Promise.all([
          getMyVessels().catch(() => []),
          getIncomingRequests().catch(() => []),
          getActiveContracts().catch(() => [])
        ]);
        setVessels(vesselData.slice(0, 4));
        setIncomingRequests(requestData.slice(0, 3));
        setStats({
          vessels: vesselData.length,
          requests: requestData.length,
          contracts: contractData.length
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title">
            Welcome back, {user?.name?.split(' ')[0] || 'Shipowner'}
          </h1>
          <p className="saas-subtitle">
            {user?.company ? `${user.company} • ` : ''}Commercial fleet operations, contract requests, and vessel deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/calculator"
            className="saas-btn-secondary"
          >
            <Calculator size={15} /> TCE Estimator
          </Link>
          <Link
            to="/owner/fleet/add"
            className="saas-btn-primary"
          >
            <Plus size={16} /> Register Vessel
          </Link>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Fleet Registry
              </span>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                {loading ? '—' : stats.vessels}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Anchor size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Registered commercial bulkers</span>
            <Link to="/owner/fleet" className="text-sky-600 font-semibold hover:underline">Manage fleet</Link>
          </div>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                Active Charters
              </span>
              <div className="text-3xl font-bold text-emerald-700 tracking-tight">
                {loading ? '—' : stats.contracts}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileCheck size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Vessels on confirmed voyages</span>
            <Link to="/owner/contracts" className="text-emerald-700 font-semibold hover:underline">View charters</Link>
          </div>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">
                Pending Requests
              </span>
              <div className="text-3xl font-bold text-amber-700 tracking-tight">
                {loading ? '—' : stats.requests}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Inbox size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Awaiting fixture review</span>
            <Link to="/owner/requests" className="text-amber-700 font-semibold hover:underline">Review requests</Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Fleet Overview & Inbound Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Fleet Status Table */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ship size={18} className="text-sky-600" /> Active Fleet Deployment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick summary of registered vessels and current status</p>
            </div>
            <Link to="/owner/fleet" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View all ({stats.vessels}) <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading vessels...</div>
          ) : vessels.length === 0 ? (
            <div className="py-12 text-center">
              <Anchor size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700 mb-1">No vessels registered yet</p>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Add your bulk carriers to start receiving charter inquiries and fixture requests from logistics managers.
              </p>
              <Link to="/owner/fleet/add" className="saas-btn-primary text-xs py-1.5 px-3">
                Register First Vessel
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vessels.map(vessel => (
                <Link
                  key={vessel._id}
                  to={`/owner/fleet/${vessel._id}`}
                  className="py-3.5 px-2 flex items-center justify-between hover:bg-slate-50/70 transition-colors rounded-lg group text-inherit no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                      <Ship size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {vessel.vesselName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {vessel.vesselClass} • {vessel.dwt?.toLocaleString()} DWT • Flag: {vessel.flag || 'Global'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`saas-badge ${
                      vessel.status === 'AVAILABLE' ? 'saas-badge-success' :
                      vessel.status === 'ON_CHARTER' ? 'saas-badge-info' : 'saas-badge-neutral'
                    }`}>
                      {vessel.status === 'AVAILABLE' ? 'Available' :
                       vessel.status === 'ON_CHARTER' ? 'On Charter' : vessel.status}
                    </span>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-slate-600" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Inbound Requests & Live AIS Tracker Hub */}
        <div className="space-y-6">
          
          {/* Pending Inbound Requests Card */}
          <div className="saas-card p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" /> Inbound Charter Inquiries
              </h2>
              <Link to="/owner/requests" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                View all
              </Link>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No new pending fixture requests at this time.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map(req => (
                  <div key={req._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{req.cargoType} ({req.volume?.toLocaleString()} MT)</span>
                      <span className="saas-badge saas-badge-warning text-[10px] py-0.5 px-2">Action Required</span>
                    </div>
                    <p className="text-slate-500 text-[11.5px]">
                      {req.originPort} → {req.destinationPort}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">By {req.logisticManagerId?.company || 'Charterer'}</span>
                      <Link to="/owner/requests" className="text-sky-600 font-bold hover:underline text-[11px]">
                        Review & Assign →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Operations Links */}
          <div className="saas-card p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Fleet Operations
            </h3>

            <Link
              to="/calculator"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all text-xs font-semibold text-slate-800 no-underline"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <Calculator size={16} />
              </div>
              <div className="flex-1">
                <div>Voyage TCE Estimator</div>
                <div className="text-[11px] font-normal text-slate-500">Calculate net daily earnings & bunker costs</div>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              to="/live-tracker"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all text-xs font-semibold text-slate-800 no-underline"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Map size={16} />
              </div>
              <div className="flex-1">
                <div>Live Fleet AIS Map</div>
                <div className="text-[11px] font-normal text-slate-500">Monitor positions, speed & route weather</div>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>

            <Link
              to="/chat"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all text-xs font-semibold text-slate-800 no-underline"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div className="flex-1">
                <div>Charter Negotiations</div>
                <div className="text-[11px] font-normal text-slate-500">Direct charterer messaging & fixture notes</div>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
