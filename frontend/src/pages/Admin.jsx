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
      if (fleetData.length > 0) { setSelectedVessel(fleetData[0].id); setNewLat(fleetData[0].latitude); setNewLng(fleetData[0].longitude); }
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

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-primary)', background: 'white', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' };
  const onFocus = e => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'; };
  const onBlur = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  const statCards = stats ? [
    { label: 'Data Freshness', value: stats.dataFreshness || '--', icon: Clock, color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Last Updated', value: stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--', icon: RefreshCw, color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'Dataset Status', value: stats.datasetStatus || 'UNKNOWN', icon: Database, color: stats.datasetStatus === 'LIVE' ? '#16A34A' : '#D97706', bg: stats.datasetStatus === 'LIVE' ? '#F0FDF4' : '#FFFBEB' },
    { label: 'Total Records', value: stats.totalRecords?.toLocaleString() || '--', icon: HardDrive, color: '#DC2626', bg: '#FEF2F2' },
  ] : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>System Administration</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Data pipeline management and simulation controls</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '20px' }}>
          <Shield size={14} color="var(--success)" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--success)' }}>Admin Privileges Active</span>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '14px' }}></div>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {statCards.map(c => (
            <div key={c.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{c.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <c.icon size={18} color={c.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* AIS Simulation */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--brand-blue)" /> Simulated AIS Controls
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
            Manually override vessel positions to test the Live Operations map rendering and alert triggers.
          </p>

          {syncStatus === 'success' && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--success)" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--success)' }}>AIS position updated successfully!</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="var(--danger)" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--danger)' }}>Failed to update AIS position.</span>
            </div>
          )}

          <form onSubmit={handleUpdateAIS} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Active Vessel</label>
              <select value={selectedVessel} onChange={e => { setSelectedVessel(e.target.value); const v = fleet.find(f => f.id === e.target.value); if (v) { setNewLat(v.latitude); setNewLng(v.longitude); }}} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                {fleet.map(v => <option key={v.id} value={v.id}>{v.vesselName}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latitude Override</label>
                <input type="number" step="any" value={newLat} onChange={e => setNewLat(e.target.value)} placeholder="e.g. 20.1234" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Longitude Override</label>
                <input type="number" step="any" value={newLng} onChange={e => setNewLng(e.target.value)} placeholder="e.g. 86.1234" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <button type="submit" disabled={isSyncing || !selectedVessel} style={{ padding: '12px', background: (isSyncing || !selectedVessel) ? '#94A3B8' : 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: (isSyncing || !selectedVessel) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: 'var(--shadow-blue)' }}>
              {isSyncing ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</> : <><Send size={16} /> Force AIS Position Sync</>}
            </button>
          </form>
        </div>

        {/* Pipeline Logs */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} color="var(--brand-blue)" /> Pipeline Logs
          </h2>
          <div style={{ background: '#0F172A', borderRadius: '10px', padding: '16px', fontFamily: "'Menlo', 'Courier New', monospace", fontSize: '12px', lineHeight: 1.8, overflowY: 'auto', maxHeight: '300px' }}>
            {LOGS.map((log, i) => (
              <div key={i} style={{ color: log.type === 'warn' ? '#F59E0B' : log.type === 'system' ? '#22D3EE' : '#94A3B8', paddingBottom: '2px' }}>
                {log.text}
              </div>
            ))}
            <div style={{ color: '#22D3EE', animation: 'pulse-dot 1.5s infinite' }}>▋</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
            {[['#22D3EE', 'System'], ['#94A3B8', 'Info'], ['#F59E0B', 'Warning']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }}></span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
