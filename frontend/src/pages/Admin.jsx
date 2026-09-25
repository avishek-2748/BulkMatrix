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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#122F55', letterSpacing: '-0.02em', marginBottom: '4px' }}>System Administration</h1>
          <p style={{ fontSize: '14px', color: '#5F7894' }}>Data pipeline management and simulation controls</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#E8F8EF', border: '1px solid #BBF7D0', borderRadius: '999px' }}>
          <Shield size={14} color="#16A34A" />
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#16A34A' }}>Admin Privileges Active</span>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }}></div>)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {statCards.map(c => (
            <div key={c.label} style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(18, 47, 85, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#7890A8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{c.label}</p>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#122F55' }}>{c.value}</p>
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
        <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(18, 47, 85, 0.06)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#122F55', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#0B82C9" /> Simulated AIS Controls
          </h2>
          <p style={{ fontSize: '13px', color: '#5F7894', marginBottom: '20px', lineHeight: 1.6 }}>
            Manually override vessel positions to test the Live Operations map rendering and alert triggers.
          </p>

          {syncStatus === 'success' && (
            <div style={{ background: '#E8F8EF', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="#16A34A" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>AIS position updated successfully!</span>
            </div>
          )}
          {syncStatus === 'error' && (
            <div style={{ background: '#FEECEC', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} color="#DC2626" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>Failed to update AIS position.</span>
            </div>
          )}

          <form onSubmit={handleUpdateAIS} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Active Vessel</label>
              <select value={selectedVessel} onChange={e => { setSelectedVessel(e.target.value); const v = fleet.find(f => f.id === e.target.value); if (v) { setNewLat(v.latitude); setNewLng(v.longitude); }}} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                {fleet.map(v => <option key={v.id} value={v.id}>{v.vesselName}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latitude Override</label>
                <input type="number" step="any" value={newLat} onChange={e => setNewLat(e.target.value)} placeholder="e.g. 20.1234" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Longitude Override</label>
                <input type="number" step="any" value={newLng} onChange={e => setNewLng(e.target.value)} placeholder="e.g. 86.1234" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSyncing || !selectedVessel}
              style={{
                padding: '11px',
                background: (isSyncing || !selectedVessel) ? '#D9E6EF' : '#FF7426',
                color: (isSyncing || !selectedVessel) ? '#7890A8' : '#FFFFFF',
                border: 'none',
                borderRadius: '11px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: (isSyncing || !selectedVessel) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: (isSyncing || !selectedVessel) ? 'none' : '0 2px 8px rgba(255, 116, 38, 0.28)'
              }}
              onMouseEnter={e => {
                if (!isSyncing && selectedVessel) {
                  e.currentTarget.style.background = '#F5661F';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 116, 38, 0.38)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSyncing && selectedVessel) {
                  e.currentTarget.style.background = '#FF7426';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 116, 38, 0.28)';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
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
