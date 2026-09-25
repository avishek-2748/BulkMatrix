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
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-500" /> Live Operations Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time AIS tracking and fleet monitoring.</p>
        </div>
        <div className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          LIVE CONNECTION ACTIVE
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        {/* Map Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden z-0">
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
                  <div className="p-1 min-w-[170px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-sm text-gray-900">{vessel.vesselName}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {vessel.vesselClass}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">Owner: {vessel.owner}</div>
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100 text-[11px]">
                      <div>Speed: <strong>{vessel.speed} kn</strong></div>
                      <div>Course: <strong>{vessel.heading}°</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Fleet Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-blue-600">{fleet.length}</div>
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mt-1">Tracked</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-black text-green-600">
                  {fleet.filter(v => v.status === 'ON_CHARTER').length}
                </div>
                <div className="text-[10px] font-bold text-green-800 uppercase tracking-widest mt-1">On Voyage</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Active Vessels</h3>
            
            <div className="space-y-3">
              {fleet.map((vessel) => (
                <div 
                  key={vessel._id}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVessel?._id === vessel._id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <Ship size={14} className="text-blue-500" />
                      {vessel.vesselName}
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {vessel.vesselClass}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-gray-500">
                      Speed: <strong className="text-gray-800">{vessel.speed} kn</strong>
                    </div>
                    <div className="text-gray-500">
                      Heading: <strong className="text-gray-800">{vessel.heading}°</strong>
                    </div>
                    <div className="col-span-2 text-gray-500">
                      Owner: <strong className="text-gray-800">{vessel.owner}</strong>
                    </div>
                  </div>
                </div>
              ))}
              
              {fleet.length === 0 && (
                <div className="text-center text-gray-400 py-8 text-sm">
                  No active vessels tracked.
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
