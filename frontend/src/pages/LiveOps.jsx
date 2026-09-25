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

const statusColors = { AT_SEA: '#0B82C9', AT_PORT: '#FF7426', HIGH_RISK: '#DC2626' };
const statusLabels = { AT_SEA: 'At Sea', AT_PORT: 'At Port' };
const statusBg = { AT_SEA: '#EAF6FC', AT_PORT: '#FFF1E8' };
const statusText = { AT_SEA: '#0B82C9', AT_PORT: '#FF7426' };

const LiveOps = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVessel, setActiveVessel] = useState(null);

  useEffect(() => {
    getAllFleet().then(d => { setFleet(d); setLoading(false); }).catch(() => { setError('Failed to fetch fleet data.'); setLoading(false); });
  }, []);

  const getColor = v => v.alerts.length > 0 ? statusColors.HIGH_RISK : statusColors[v.status] || '#7890A8';

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <Ship className="text-blue-600" size={24} /> Live Fleet & Port Operations
          </h1>
          <p className="saas-subtitle">Real-time AIS positioning, transit velocity, and port congestion telemetry.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          {[
            { color: '#0B82C9', label: 'Underway' },
            { color: '#FF7426', label: 'At Port' },
            { color: '#DC2626', label: 'Congestion / Risk' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }}></span>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-semibold">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="saas-card p-0 overflow-hidden relative border border-slate-200 shadow-sm h-[520px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[2000] flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">Establishing Satellite Uplink...</p>
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
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', marginBottom: '4px' }}>{vessel.vesselName}</p>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>{vessel.vesselClass} · {vessel.cargo}</p>
                  <p style={{ fontSize: '11px', color: '#0B82C9', marginTop: '6px', fontWeight: 600 }}>Click marker to inspect vessel details →</p>
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
        <div className="saas-card p-0 overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ship size={16} className="text-blue-600" />
              <span className="font-bold text-slate-900 text-sm">Active Tracked Fleet ({fleet.length} Vessels)</span>
            </div>
            <span className="text-xs text-slate-400">Click row to focus vessel telemetry</span>
          </div>
          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  {['Vessel Name', 'Class', 'Cargo', 'Destination', 'ETA', 'Operational Status', 'Risk & Alerts'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleet.map(v => (
                  <tr key={v.id} onClick={() => setActiveVessel(v)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                    <td className="font-bold text-slate-900">{v.vesselName}</td>
                    <td className="text-slate-600">{v.vesselClass}</td>
                    <td className="text-slate-600 font-medium">{v.cargo}</td>
                    <td className="text-slate-600 font-medium">{v.destination}</td>
                    <td className="text-slate-600">{new Date(v.eta).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                    <td>
                      <span className={`saas-badge ${v.alerts.length > 0 ? 'saas-badge-danger' : v.status === 'AT_SEA' ? 'saas-badge-info' : 'saas-badge-warning'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {v.alerts.length > 0 ? 'Alert' : statusLabels[v.status] || v.status}
                      </span>
                    </td>
                    <td className="text-xs font-semibold">
                      {v.alerts.length > 0 ? (
                        <span className="text-rose-600 flex items-center gap-1.5">
                          <AlertTriangle size={13} /> {v.alerts[0]}
                        </span>
                      ) : (
                        <span className="text-slate-400">Normal passage</span>
                      )}
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
