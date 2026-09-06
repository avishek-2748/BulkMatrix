import { X, Ship, MapPin, Navigation, Clock, Flame, AlertTriangle, Route } from 'lucide-react';

const VesselDetailPanel = ({ vessel, onClose }) => {
  if (!vessel) return null;

  return (
    <div className="absolute right-6 top-6 bottom-6 w-96 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-right-8">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-start bg-slate-800/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Ship className="w-5 h-5 mr-2 text-cyan-400" />
            {vessel.vesselName}
          </h2>
          <div className="flex items-center mt-2 space-x-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
              {vessel.vesselClass}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              vessel.status === 'AT_SEA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {vessel.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Route Info */}
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
            <Route className="w-4 h-4 mr-2" /> Voyage Details
          </h3>
          <div className="relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-700"></div>
            
            <div className="flex items-start mb-6 relative z-10">
              <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-cyan-400 mr-4 flex-shrink-0 mt-0.5"></div>
              <div>
                <p className="text-xs text-slate-400">Current Position</p>
                <p className="text-sm font-medium text-slate-200 mt-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                  {vessel.latitude.toFixed(4)}° N, {vessel.longitude.toFixed(4)}° E
                </p>
              </div>
            </div>

            <div className="flex items-start relative z-10">
              <div className="w-5 h-5 rounded-full bg-slate-800 border-2 border-emerald-400 mr-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Destination Port</p>
                <p className="text-lg font-bold text-slate-100 mt-1">{vessel.destination}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  ETA: {new Date(vessel.eta).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center text-slate-400 mb-2">
              <Navigation className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium uppercase tracking-wider">Cargo</span>
            </div>
            <p className="text-lg font-semibold text-slate-200">{vessel.cargo}</p>
          </div>
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <div className="flex items-center text-slate-400 mb-2">
              <Flame className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium uppercase tracking-wider">Fuel Burn</span>
            </div>
            <p className="text-lg font-semibold text-slate-200">{vessel.fuelConsumption} <span className="text-xs text-slate-500">t/day</span></p>
          </div>
        </div>

        {/* Voyage Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Voyage Progress</span>
            <span className="text-cyan-400 font-bold">78%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full relative" style={{ width: '78%' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {vessel.alerts && vessel.alerts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> Active Alerts
            </h3>
            <div className="space-y-2">
              {vessel.alerts.map((alert, idx) => (
                <div key={idx} className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-2 flex-shrink-0 animate-pulse"></div>
                  <p className="text-sm text-slate-200">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VesselDetailPanel;
