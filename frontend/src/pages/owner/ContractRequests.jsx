import React, { useState, useEffect } from 'react';
import { getIncomingRequests, updateContractStatus, getMyVessels } from '../../services/api';
import { Check, X, Loader2, Package, MapPin, Calendar, Ship, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContractRequests = () => {
  const [requests, setRequests] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedVessels, setSelectedVessels] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [reqData, vesselData] = await Promise.all([
        getIncomingRequests(),
        getMyVessels()
      ]);
      setRequests(reqData);
      setVessels(vesselData);

      // Pre-select first available vessel for each request if available
      if (vesselData.length > 0) {
        const initialMap = {};
        reqData.forEach(r => {
          initialMap[r._id] = vesselData[0]._id;
        });
        setSelectedVessels(initialMap);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    setActionMsg(null);
    try {
      const vesselId = selectedVessels[id] || (vessels[0]?._id);
      await updateContractStatus(id, status, vesselId);
      setRequests(prev => prev.filter(req => req._id !== id));
      setActionMsg({
        type: 'success',
        text: `Contract ${status === 'ACCEPTED' ? 'accepted successfully' : 'declined'}.`
      });
    } catch (error) {
      console.error("Action failed", error);
      setActionMsg({
        type: 'error',
        text: 'Action failed. Please try again.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contract Requests</h1>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <MessageSquare size={15} /> Open Messages
        </Link>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between flex-wrap gap-3 ${
          actionMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
            <span>{actionMsg.text}</span>
          </div>
          {actionMsg.type === 'success' && (
            <Link
              to="/owner/contracts"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Go to Active Contracts & Handover <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No pending requests</h3>
          <p className="text-gray-500">You don't have any incoming charter requests at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map(req => (
            <div key={req._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">{req.contractType}</span>
                    <span className="text-sm font-semibold text-gray-500">Requested by: <span className="text-gray-800 font-bold">{req.logisticManagerId?.company || req.logisticManagerId?.name || 'Charterer'}</span></span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <Package className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Cargo</p>
                        <p className="font-semibold text-gray-900">{req.cargoType}</p>
                        <p className="text-sm text-gray-600">{req.volume?.toLocaleString()} t</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Route</p>
                        <p className="font-semibold text-gray-900">{req.originPort}</p>
                        <p className="text-sm text-gray-600">to {req.destinationPort}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-gray-400 mt-1" size={18} />
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Window</p>
                        <p className="font-semibold text-gray-900">{req.arrivalWindowStart ? new Date(req.arrivalWindowStart).toLocaleDateString() : 'Immediate'}</p>
                        <p className="text-sm text-gray-600">{req.arrivalWindowEnd ? new Date(req.arrivalWindowEnd).toLocaleDateString() : 'TBD'}</p>
                      </div>
                    </div>
                  </div>

                  {vessels.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                        <Ship size={14} className="text-blue-500" /> Assign Vessel:
                      </span>
                      <select
                        value={selectedVessels[req._id] || vessels[0]?._id}
                        onChange={(e) => setSelectedVessels({ ...selectedVessels, [req._id]: e.target.value })}
                        className="text-xs font-bold px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                      >
                        {vessels.map(v => (
                          <option key={v._id} value={v._id}>
                            {v.vesselName} ({v.vesselClass} • {v.dwt?.toLocaleString()} DWT)
                          </option>
                        ))}
                      </select>
                      <Link
                        to="/chat"
                        className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        <MessageSquare size={13} /> Chat with Manager
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
                  <button 
                    onClick={() => handleAction(req._id, 'ACCEPTED')}
                    disabled={actionLoading === req._id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow disabled:opacity-50"
                  >
                    {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, 'REJECTED')}
                    disabled={actionLoading === req._id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {actionLoading === req._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                    Decline
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractRequests;
