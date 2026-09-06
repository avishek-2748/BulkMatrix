import { useState, useEffect } from 'react';
import { getAllFleet } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import VesselDetailPanel from '../components/VesselDetailPanel';
import { Loader2, AlertTriangle, Ship, MapPin, Navigation, Clock, Fuel } from 'lucide-react';

const createShipIcon = (color, isActive) => divIcon({
  className: 'custom-ship-icon',
  html: `<div style="background-color:${color};width:${isActive?24:18}px;height:${isActive?24:18}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2),0 0 0 1px ${color}33;transition:all 0.2s;"></div>`,
  iconSize: [isActive ? 24 : 18, isActive ? 24 : 18],
  iconAnchor: [isActive ? 12 : 9, isActive ? 12 : 9],
});

const statusColors = { AT_SEA: '#1D4ED8', AT_PORT: '#D97706', HIGH_RISK: '#DC2626' };
const statusLabels = { AT_SEA: 'At Sea', AT_PORT: 'At Port' };
const statusBg = { AT_SEA: '#EFF6FF', AT_PORT: '#FFFBEB' };
const statusText = { AT_SEA: '#1D4ED8', AT_PORT: '#D97706' };

const LiveOps = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVessel, setActiveVessel] = useState(null);

  useEffect(() => {
    getAllFleet().then(d => { setFleet(d); setLoading(false); }).catch(() => { setError('Failed to fetch fleet data.'); setLoading(false); });
  }, []);

  const getColor = v => v.alerts.length > 0 ? statusColors.HIGH_RISK : statusColors[v.status] || '#64748B';

  return (
    <div style={{ height: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '3px' }}>Live Operations</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Real-time fleet tracking and port congestion monitoring</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {[
            { color: '#1D4ED8', label: 'At Sea' },
            { color: '#D97706', label: 'At Port' },
            { color: '#DC2626', label: 'Alert' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color, border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}></span>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ fontSize: '13.5px', color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', position: 'relative', minHeight: '300px' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', backdropFilter: 'blur(4px)' }}>
            <Loader2 size={32} color="var(--brand-blue)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Establishing Satellite Uplink...</p>
          </div>
        )}
        <MapContainer center={[18.5, 85.0]} zoom={5} zoomControl={false} style={{ width: '100%', height: '100%' }}>
          {/* Light CartoDB tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ZoomControl position="bottomright" />
          {fleet.map(vessel => (
            <Marker
              key={vessel.id}
              position={[vessel.latitude, vessel.longitude]}
              icon={createShipIcon(getColor(vessel), activeVessel?.id === vessel.id)}
              eventHandlers={{ click: () => setActiveVessel(vessel) }}
            >
              <Popup>
                <div style={{ fontFamily: "'Inter', sans-serif", minWidth: '160px' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{vessel.vesselName}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{vessel.vesselClass} · {vessel.cargo}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Click for full details</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {activeVessel && (
          <VesselDetailPanel vessel={activeVessel} onClose={() => setActiveVessel(null)} />
        )}
      </div>

      {/* Fleet Table */}
      {!loading && fleet.length > 0 && (
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ship size={15} color="var(--brand-blue)" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Active Fleet ({fleet.length})</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                  {['Vessel', 'Class', 'Cargo', 'Destination', 'ETA', 'Status', 'Alerts'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map(v => (
                  <tr key={v.id} onClick={() => setActiveVessel(v)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.vesselName}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{v.vesselClass}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{v.cargo}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{v.destination}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{new Date(v.eta).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 600, background: v.alerts.length > 0 ? 'var(--danger-bg)' : statusBg[v.status], color: v.alerts.length > 0 ? 'var(--danger)' : statusText[v.status] }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }}></span>
                        {v.alerts.length > 0 ? 'Alert' : statusLabels[v.status]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: v.alerts.length > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '12px' }}>
                      {v.alerts.length > 0 ? v.alerts[0] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOps;
