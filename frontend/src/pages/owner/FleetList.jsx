import React, { useState, useEffect } from 'react';
import { Plus, Anchor, Loader2, Navigation, Ship, Activity, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyVessels } from '../../services/api';

const FleetList = () => {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const data = await getMyVessels();
        setVessels(data);
      } catch (error) {
        console.error("Failed to fetch vessels", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  const totalDwt = vessels.reduce((acc, v) => acc + (v.dwt || 0), 0);
  const availableCount = vessels.filter(v => v.status === 'AVAILABLE').length;
  const onCharterCount = vessels.filter(v => v.status === 'ON_CHARTER').length;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <Anchor size={24} className="text-sky-600" />
            My Fleet
          </h1>
          <p className="saas-subtitle">
            Monitor technical specifications, operational status, and charter readiness across your vessel registry.
          </p>
        </div>

        <Link 
          to="/owner/fleet/add" 
          className="saas-btn-primary"
        >
          <Plus size={16} /> Register Vessel
        </Link>
      </div>

      {/* Fleet KPI Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Fleet</span>
          <div className="text-2xl font-bold text-slate-900">{loading ? '—' : vessels.length}</div>
          <span className="text-xs text-slate-400 mt-1 block">Commercial vessels</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Available for Spot</span>
          <div className="text-2xl font-bold text-emerald-700">{loading ? '—' : availableCount}</div>
          <span className="text-xs text-slate-400 mt-1 block">Ready for fixture requests</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block mb-1">On Charter</span>
          <div className="text-2xl font-bold text-sky-700">{loading ? '—' : onCharterCount}</div>
          <span className="text-xs text-slate-400 mt-1 block">Currently on laden voyage</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Combined Capacity</span>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? '—' : `${(totalDwt / 1000).toFixed(0)}k`} <span className="text-sm font-normal text-slate-500">DWT</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Total cargo deadweight</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="saas-card p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-sky-500 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">Loading your vessel fleet...</p>
        </div>
      ) : vessels.length === 0 ? (
        <div className="saas-card p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <Anchor size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No vessels registered yet</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Register your bulk carrier vessels to start receiving charter requests and contract inquiries from procurement managers.
          </p>
          <Link 
            to="/owner/fleet/add" 
            className="saas-btn-primary"
          >
            <Plus size={16} /> Register First Vessel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vessels.map(vessel => (
            <Link
              to={`/owner/fleet/${vessel._id}`}
              key={vessel._id}
              className="saas-card-interactive group flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                    <Ship size={20} />
                  </div>
                  <span className={`saas-badge ${
                    vessel.status === 'AVAILABLE' ? 'saas-badge-success' :
                    vessel.status === 'ON_CHARTER' ? 'saas-badge-info' :
                    'saas-badge-neutral'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {vessel.status === 'AVAILABLE' ? 'Available' : vessel.status === 'ON_CHARTER' ? 'On Charter' : vessel.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                  {vessel.vesselName}
                </h3>
                <p className="text-xs text-slate-500 mb-5 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{vessel.vesselClass}</span>
                  <span>•</span>
                  <span>Flag: {vessel.flag || 'Global'}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">IMO {vessel.imoNumber}</span>
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 px-3.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Capacity (DWT)</span>
                    <span className="font-semibold text-slate-800">{vessel.dwt?.toLocaleString() || 'N/A'} MT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Built</span>
                    <span className="font-semibold text-slate-800">{vessel.yearBuilt || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Draft / LOA</span>
                    <span className="font-semibold text-slate-800">{vessel.draft || '—'}m / {vessel.loa || '—'}m</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Fuel Spec</span>
                    <span className="font-semibold text-slate-800">{vessel.fuelType || 'VLSFO'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-semibold group-hover:text-sky-700">
                <span>View Specifications & Availability</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetList;
