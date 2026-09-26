import React, { useState, useEffect } from 'react';
import { getIncomingRequests, updateContractStatus, getMyVessels } from '../../services/api';
import {
  Check,
  X,
  Loader2,
  Package,
  MapPin,
  Calendar,
  Ship,
  MessageSquare,
  ArrowRight,
  Inbox,
  Clock,
  CheckCircle2
} from 'lucide-react';
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
        text: `Fixture inquiry ${status === 'ACCEPTED' ? 'accepted and assigned to vessel' : 'declined'}.`
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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <Inbox size={24} className="text-[#4187AB]" />
            Inbound Contract Requests
          </h1>
          <p className="saas-subtitle">
            Review fixture inquiries from charterers, assign fleet vessels, and negotiate dry bulk terms.
          </p>
        </div>

        <Link
          to="/chat"
          className="saas-btn-secondary"
        >
          <MessageSquare size={15} className="text-[#4187AB]" /> Open Negotiations
        </Link>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between flex-wrap gap-3 ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <CheckCircle2 size={17} className="text-emerald-600" /> : <X size={17} />}
            <span>{actionMsg.text}</span>
          </div>
          {actionMsg.type === 'success' && (
            <Link
              to="/owner/contracts"
              className="saas-btn-primary text-xs py-1.5 px-3"
            >
              Go to Active Contracts & Handover <ArrowRight size={13} />
            </Link>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="saas-card p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-[#4187AB] mb-3" size={32} />
          <p className="text-sm font-medium text-[#586D85]">Loading incoming requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="saas-card p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-[#F5FAFE] text-[#4187AB] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#DADCEB]">
            <Inbox size={26} />
          </div>
          <h3 className="text-base font-bold text-[#133056] mb-1">No pending requests</h3>
          <p className="text-sm text-[#586D85] leading-relaxed">
            You don't have any incoming charter requests at the moment. As logistics managers generate recommendations, inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="saas-card p-6 hover:border-[#4187AB]/50 transition-all">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                
                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="saas-badge saas-badge-warning">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending Review
                      </span>
                      <span className="text-xs font-mono font-bold text-[#586D85]">
                        #{req._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-[#F5FAFE] text-[#133056] border border-[#DADCEB] rounded-md">
                        {req.contractType}
                      </span>
                    </div>

                    <div className="text-xs text-[#586D85]">
                      Charterer: <span className="font-semibold text-[#133056]">{req.logisticManagerId?.company || req.logisticManagerId?.name || 'Charterer'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F5FAFE] text-[#4187AB] border border-[#DADCEB] flex items-center justify-center flex-shrink-0">
                        <Package size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#586D85] uppercase tracking-wider block">Cargo Volume</span>
                        <div className="font-bold text-[#133056] text-sm">{req.cargoType}</div>
                        <div className="text-xs text-[#586D85]">{req.volume?.toLocaleString()} MT</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F5FAFE] text-[#4187AB] border border-[#DADCEB] flex items-center justify-center flex-shrink-0">
                        <MapPin size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#586D85] uppercase tracking-wider block">Route</span>
                        <div className="font-bold text-[#133056] text-sm">{req.originPort}</div>
                        <div className="text-xs text-[#586D85]">to {req.destinationPort}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F5FAFE] text-[#4187AB] border border-[#DADCEB] flex items-center justify-center flex-shrink-0">
                        <Calendar size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#586D85] uppercase tracking-wider block">Window</span>
                        <div className="font-bold text-[#133056] text-sm">
                          {req.arrivalWindowStart ? new Date(req.arrivalWindowStart).toLocaleDateString() : 'Immediate'}
                        </div>
                        <div className="text-xs text-[#586D85]">
                          to {req.arrivalWindowEnd ? new Date(req.arrivalWindowEnd).toLocaleDateString() : 'Flexible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {vessels.length > 0 && (
                    <div className="pt-3 border-t border-[#DADCEB] flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-[#133056] flex items-center gap-1.5">
                        <Ship size={14} className="text-[#4187AB]" /> Assign Vessel:
                      </span>
                      <select
                        value={selectedVessels[req._id] || vessels[0]?._id}
                        onChange={(e) => setSelectedVessels({ ...selectedVessels, [req._id]: e.target.value })}
                        className="saas-input text-xs py-1.5 px-3 w-auto"
                      >
                        {vessels.map(v => (
                          <option key={v._id} value={v._id}>
                            {v.vesselName} ({v.vesselClass} • {v.dwt?.toLocaleString()} DWT)
                          </option>
                        ))}
                      </select>

                      <Link
                        to="/chat"
                        className="ml-auto text-xs font-semibold text-[#4187AB] hover:text-[#133056] flex items-center gap-1"
                      >
                        <MessageSquare size={13} /> Chat with Manager
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2.5 w-full lg:w-44 flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#DADCEB]">
                  <button 
                    onClick={() => handleAction(req._id, 'ACCEPTED')}
                    disabled={actionLoading === req._id}
                    className="saas-btn-primary text-xs py-2 h-auto flex-1 lg:flex-none justify-center"
                  >
                    {actionLoading === req._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Accept Fixture
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, 'REJECTED')}
                    disabled={actionLoading === req._id}
                    className="saas-btn-secondary text-xs py-2 h-auto flex-1 lg:flex-none justify-center"
                  >
                    {actionLoading === req._id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
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
