import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLiveFleet } from '../services/api';
import { Ship, Navigation, Activity, Loader2 } from 'lucide-react';

// Custom vessel icon
const vesselIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically re-center map if needed
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LiveOperations = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);
  
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchLiveFleet();
    
    // Poll every 5 seconds for simulated live movement
    pollIntervalRef.current = setInterval(() => {
      fetchLiveFleet();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const fetchLiveFleet = async () => {
    try {
      const data = await getLiveFleet();
      setFleet(data);
    } catch (error) {
      console.error("Failed to fetch live fleet data", error);
    } finally {
      setLoading(false);
    }
  };

  const centerPosition = fleet.length > 0 
    ? [fleet[0].position.lat, fleet[0].position.lng]
    : [20, 100]; // Default center (roughly Asia-Pacific)

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-medium text-slate-500">Connecting to AIS real-time telemetry stream...</p>
      </div>
    );
  }

  const activeUnderway = fleet.filter(v => v.status === 'ON_CHARTER' || v.speed > 0.5).length;
  const inPort = fleet.length - activeUnderway;

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="saas-title flex items-center gap-2.5">
              <Activity className="text-blue-600" size={24} /> Live Fleet Operations
            </h1>
            <span className="saas-badge saas-badge-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AIS UPLINK LIVE
            </span>
          </div>
          <p className="saas-subtitle">
            Global satellite AIS tracking, situational awareness, and fleet dispatch intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-700">Auto-refresh active</div>
            <div className="text-[11px] text-slate-400">Polling every 5s</div>
          </div>
        </div>
      </div>

      {/* KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Ship size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracked Fleet</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{fleet.length}</div>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Navigation size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Underway</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{activeUnderway}</div>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">At Anchorage / Port</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{inPort}</div>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signal Quality</div>
            <div className="text-2xl font-black text-purple-600 mt-0.5">99.8%</div>
          </div>
        </div>
      </div>

      {/* Main Operations Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[720px]">
        {/* Map Area */}
        <div className="lg:col-span-3 saas-card p-0 overflow-hidden relative border border-slate-200 shadow-sm flex flex-col">
          <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 z-10">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Navigation size={13} className="text-blue-600" /> OpenStreetMap Navigational Telemetry
            </span>
            <span>{selectedVessel ? `Focused: ${selectedVessel.vesselName}` : 'Click any marker to inspect vessel'}</span>
          </div>

          <div className="flex-1 w-full relative z-0">
            <MapContainer 
              center={centerPosition} 
              zoom={4} 
              style={{ height: '100%', width: '100%' }}
            >
              <MapController center={selectedVessel ? [selectedVessel.position.lat, selectedVessel.position.lng] : null} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {fleet.map((vessel) => (
                <Marker 
                  key={vessel._id} 
                  position={[vessel.position.lat, vessel.position.lng]}
                  icon={vesselIcon}
                  eventHandlers={{
                    click: () => setSelectedVessel(vessel)
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[190px]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{vessel.vesselName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {vessel.vesselClass}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-2 font-medium">Owner: {vessel.owner}</div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>Speed: <strong className="text-slate-800">{vessel.speed} kn</strong></div>
                        <div>Heading: <strong className="text-slate-800">{vessel.heading}°</strong></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4 h-full">
          <div className="saas-card p-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Ship size={15} className="text-blue-600" /> Active Vessels ({fleet.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {fleet.map((vessel) => {
                const isSelected = selectedVessel?._id === vessel._id;
                return (
                  <div 
                    key={vessel._id}
                    onClick={() => setSelectedVessel(vessel)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50/70 border-blue-300 shadow-sm' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Ship size={14} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                        {vessel.vesselName}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {vessel.vesselClass}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="text-slate-500">
                        Speed: <span className="font-semibold text-slate-700">{vessel.speed} kn</span>
                      </div>
                      <div className="text-slate-500">
                        Course: <span className="font-semibold text-slate-700">{vessel.heading}°</span>
                      </div>
                      <div className="col-span-2 text-slate-500 truncate">
                        Owner: <span className="font-semibold text-slate-700">{vessel.owner}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {fleet.length === 0 && (
                <div className="text-center text-slate-400 py-12 text-sm">
                  No vessels currently reporting AIS telemetry.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveOperations;
