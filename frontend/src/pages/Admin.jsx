import { useState, useEffect } from 'react';
import { getAllFleet, getAdminStats, updateAisPosition } from '../services/api';
import { Database, Server, Clock, RefreshCw, HardDrive, ShieldCheck, Activity, Send, Loader2, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const LOGS = [
  { type: 'system', text: '[SYSTEM] Initialization sequence complete.' },
  { type: 'info', text: '[ML_API] Connection established on port 5001.' },
  { type: 'info', text: '[DB_SYNC] Incremental fetch: MongoDB clusters returning code 200.' },
  { type: 'info', text: '[AIS_FEED] Live stream connected. Latency: 42ms.' },
  { type: 'warn', text: '[WARN] Forecast model divergence detected. Retraining scheduled for 03:00 UTC.' },
  { type: 'info', text: '[ROUTER] Dispatching payload to frontend clients...' },
  { type: 'system', text: '[SYS] Ready state achieved. Listening for simulation overrides.' },
];

const Admin = () => {
  const [fleet, setFleet] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    Promise.all([getAllFleet(), getAdminStats()]).then(([fleetData, statsData]) => {
      setFleet(fleetData);
      setStats(statsData);
      if (fleetData.length > 0) { 
        const first = fleetData[0];
        setSelectedVessel(first.id || first._id); 
        setNewLat(first.latitude); 
        setNewLng(first.longitude); 
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpdateAIS = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      await updateAisPosition({ vesselId: selectedVessel, lat: newLat, lng: newLng });
      setSyncStatus('success');
    } catch {
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #D9E6EF', borderRadius: '10px', fontSize: '14px', color: '#122F55', background: '#FFFFFF', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' };
  const onFocus = e => { e.target.style.borderColor = '#0B82C9'; e.target.style.boxShadow = '0 0 0 3px rgba(11, 130, 201, 0.14)'; };
  const onBlur = e => { e.target.style.borderColor = '#D9E6EF'; e.target.style.boxShadow = 'none'; };

  const statCards = stats ? [
    { label: 'Data Freshness', value: stats.dataFreshness || '--', icon: Clock, color: '#0B82C9', bg: '#EAF6FC' },
    { label: 'Last Updated', value: stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--', icon: RefreshCw, color: '#122F55', bg: '#F8FAFC' },
    { label: 'Dataset Status', value: stats.datasetStatus || 'UNKNOWN', icon: Database, color: stats.datasetStatus === 'LIVE' ? '#16A34A' : '#FF7426', bg: stats.datasetStatus === 'LIVE' ? '#E8F8EF' : '#FFF1E8' },
    { label: 'Total Records', value: stats.totalRecords?.toLocaleString() || '--', icon: HardDrive, color: '#0B82C9', bg: '#EAF6FC' },
  ] : [];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="saas-title flex items-center gap-2.5">
              <Shield className="text-blue-600" size={24} /> System Administration
            </h1>
            <span className="saas-badge saas-badge-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              SUPERUSER ACTIVE
            </span>
          </div>
          <p className="saas-subtitle">
            Telemetry ingestion pipelines, predictive model retraining, and AIS simulation controls.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck size={15} className="text-emerald-600" />
          <span>Root Privileges Granted</span>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="saas-card h-28 animate-pulse bg-slate-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(c => (
            <div key={c.label} className="saas-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{c.label}</p>
                  <p className="text-2xl font-black text-slate-900">{c.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                  <c.icon size={18} color={c.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AIS Simulation */}
        <div className="saas-card p-6 sm:p-7 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Simulated AIS Controls
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manually override live vessel coordinates to test fleet tracking, ETA re-computation, and geofence alerts.
            </p>
          </div>

          {syncStatus === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span>AIS coordinate override broadcasted successfully to all active clients.</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
              <span>Failed to dispatch AIS position update. Verify server telemetry port.</span>
            </div>
          )}

          <form onSubmit={handleUpdateAIS} className="space-y-4">
            <div>
              <label className="saas-label">Target Vessel</label>
              <select 
                value={selectedVessel} 
                onChange={e => { 
                  setSelectedVessel(e.target.value); 
                  const v = fleet.find(f => (f.id || f._id) === e.target.value); 
                  if (v) { 
                    setNewLat(v.latitude); 
                    setNewLng(v.longitude); 
                  }
                }} 
                className="saas-input"
              >
                {fleet.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.vesselName} ({v.vesselClass})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="saas-label">Latitude Override</label>
                <input 
                  type="number" 
                  step="any" 
                  value={newLat} 
                  onChange={e => setNewLat(e.target.value)} 
                  placeholder="e.g. 20.1234" 
                  className="saas-input" 
                />
              </div>
              <div>
                <label className="saas-label">Longitude Override</label>
                <input 
                  type="number" 
                  step="any" 
                  value={newLng} 
                  onChange={e => setNewLng(e.target.value)} 
                  placeholder="e.g. 86.1234" 
                  className="saas-input" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSyncing || !selectedVessel}
                className="saas-btn-primary w-full justify-center py-3"
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Transmitting to Vessel Transponder...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Force AIS Telemetry Sync</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Pipeline Logs */}
        <div className="saas-card p-6 sm:p-7 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server size={18} className="text-blue-600" /> Pipeline Logs & Event Stream
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tail -f active
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-y-auto flex-1 max-h-[300px] border border-slate-800 shadow-inner">
            {LOGS.map((log, i) => (
              <div key={i} className={`py-0.5 ${log.type === 'warn' ? 'text-amber-400' : log.type === 'system' ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}>
                {log.text}
              </div>
            ))}
            <div className="text-cyan-400 animate-pulse mt-1">▋</div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> System
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Info
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Warning
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
