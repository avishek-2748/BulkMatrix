import React, { useState, useEffect } from 'react';
import { Plus, Anchor, Loader2, Navigation } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Fleet</h1>
        <Link 
          to="/owner/fleet/add" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Vessel
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500">Loading your fleet...</p>
        </div>
      ) : vessels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Anchor size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No vessels found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't added any vessels to your fleet yet. Start by registering your first vessel to receive charter requests.</p>
          <Link 
            to="/owner/fleet/add" 
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> Register Vessel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vessels.map(vessel => (
            <Link to={`/owner/fleet/${vessel._id}`} key={vessel._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group block" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="p-6 border-b border-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Anchor size={24} />
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    vessel.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    vessel.status === 'ON_CHARTER' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {vessel.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{vessel.vesselName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
                  <Navigation size={14} /> {vessel.vesselClass} • {vessel.flag}
                </p>
              </div>
              <div className="p-6 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5">DWT</p>
                    <p className="font-bold text-gray-900">{vessel.dwt?.toLocaleString() || 'N/A'} t</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">Built</p>
                    <p className="font-bold text-gray-900">{vessel.yearBuilt || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">IMO</p>
                    <p className="font-bold text-gray-900">{vessel.imoNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">Fuel</p>
                    <p className="font-bold text-gray-900">{vessel.fuelType || 'VLSFO'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetList;
