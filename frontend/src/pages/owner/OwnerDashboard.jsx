import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyVessels, getIncomingRequests, getActiveContracts } from '../../services/api';
import { Anchor, Activity, Clock, Plus, Ship, TrendingUp, Navigation, ChevronRight, Map, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, bg, delta }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-black text-gray-800">{value}</h3>
      {delta && <p className="text-xs text-gray-400 mt-1">{delta}</p>}
    </div>
    <div className="p-4 rounded-xl" style={{ backgroundColor: bg, color }}>
      <Icon size={24} />
    </div>
  </div>
);

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ vessels: 0, contracts: 0, requests: 0 });
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vesselData, requestData, contractData] = await Promise.all([
          getMyVessels(),
          getIncomingRequests(),
          getActiveContracts()
        ]);
        setVessels(vesselData.slice(0, 3));
        setStats({
          vessels: vesselData.length,
          requests: requestData.length,
          contracts: contractData.length
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.company ? `${user.company} • ` : ''}Vessel Owner Dashboard
          </p>
        </div>
        <Link
          to="/owner/fleet/add"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <Plus size={18} /> Add Vessel
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Vessels"
          value={loading ? '—' : stats.vessels}
          icon={Anchor}
          color="#0B82C9"
          bg="#EAF6FC"
          delta="Registered in your fleet"
        />
        <StatCard
          title="Active Contracts"
          value={loading ? '—' : stats.contracts}
          icon={Activity}
          color="#16A34A"
          bg="#DCFCE7"
          delta="Currently on charter"
        />
        <StatCard
          title="Pending Requests"
          value={loading ? '—' : stats.requests}
          icon={Clock}
          color="#D97706"
          bg="#FEF3C7"
          delta="Awaiting your response"
        />
      </div>

      {/* Fleet Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-extrabold text-gray-900 flex items-center gap-2">
            <Ship className="text-blue-500" size={20} /> My Fleet
          </h2>
          <Link to="/owner/fleet" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading fleet...</div>
        ) : vessels.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Anchor size={28} />
            </div>
            <p className="text-gray-600 font-semibold mb-2">No vessels registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Add your first vessel to start receiving charter requests from Logistic Managers.</p>
            <Link to="/owner/fleet/add" className="inline-flex items-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors text-sm">
              <Plus size={16} /> Register First Vessel
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vessels.map((vessel) => (
              <Link
                key={vessel._id}
                to={`/owner/fleet/${vessel._id}`}
                className="px-8 py-5 flex items-center justify-between hover:bg-blue-50/40 transition-colors group text-inherit no-underline"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{vessel.vesselName}</h3>
                    <p className="text-sm text-gray-500">{vessel.vesselClass} • {vessel.dwt?.toLocaleString()} DWT • {vessel.flag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    vessel.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    vessel.status === 'ON_CHARTER' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {vessel.status}
                  </span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/live-tracker"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between group text-inherit no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Map size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Global AIS Live Map</h3>
              <p className="text-xs text-gray-500 mt-0.5">Track your vessels in real-time with simulated coordinates and speed</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/chat"
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center justify-between group text-inherit no-underline"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Charter Messages</h3>
              <p className="text-xs text-gray-500 mt-0.5">Direct chat with logistics managers for rate negotiations & voyage terms</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Pending Requests Banner */}
      {!loading && stats.requests > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">
                You have {stats.requests} pending contract request{stats.requests > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-700 mt-0.5">Review and respond to charter requests from logistic managers.</p>
            </div>
          </div>
          <Link to="/owner/requests" className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
            Review Requests
          </Link>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
