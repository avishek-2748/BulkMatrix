import React, { useState, useEffect } from 'react';
import { getActiveContracts, getMyVessels } from '../../services/api';
import {
  Loader2,
  Activity,
  MapPin,
  Package,
  Calendar,
  MessageSquare,
  Map,
  Ship,
  FileText,
  ShieldCheck,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HandoverModal from '../../components/HandoverModal';
import FixtureNoteModal from '../../components/FixtureNoteModal';

const ActiveContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [handoverContract, setHandoverContract] = useState(null);
  const [fixtureContract, setFixtureContract] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const [contractsData, vesselsData] = await Promise.all([
        getActiveContracts(),
        getMyVessels()
      ]);
      setContracts(contractsData);
      setVessels(vesselsData);
    } catch (error) {
      console.error("Failed to fetch contracts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHandoverSuccess = (updatedContract) => {
    setContracts(prev => prev.map(c => c._id === updatedContract._id ? { ...c, ...updatedContract, status: 'ACTIVE' } : c));
    setHandoverContract(null);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <FileCheck size={24} className="text-emerald-600" />
            Active Contracts & Voyage Handovers
          </h1>
          <p className="saas-subtitle">
            Manage ongoing charters, execute voyage handovers, and coordinate live vessel operations.
          </p>
        </div>

        <Link
          to="/chat"
          className="saas-btn-secondary"
        >
          <MessageSquare size={15} /> Open Negotiations
        </Link>
      </div>
      
      {loading ? (
        <div className="saas-card p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-sky-500 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">Loading active contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="saas-card p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <FileCheck size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No active contracts</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            You don't have any confirmed or active charters right now. Inbound requests will appear under Contract Requests.
          </p>
          <Link
            to="/owner/requests"
            className="saas-btn-primary mt-4"
          >
            Check Inbound Requests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map(contract => (
            <div key={contract._id} className="saas-card p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Ship size={17} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {contract.vesselId?.vesselName || 'Pending Vessel Assignment'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        #{contract._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span className={`saas-badge ${
                    contract.status === 'ACTIVE' ? 'saas-badge-info' : 'saas-badge-success'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {contract.status === 'ACTIVE' ? 'On Voyage' : 'Owner Accepted'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Charterer</span>
                    <span className="font-bold text-slate-900">
                      {contract.logisticManagerId?.company || contract.logisticManagerId?.name || 'Charterer'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Voyage Route</span>
                    <span className="font-semibold text-slate-800">
                      {contract.originPort} → {contract.destinationPort}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Cargo Volume</span>
                    <span className="font-semibold text-slate-800">
                      {contract.volume?.toLocaleString()} MT ({contract.cargoType})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-slate-50">
                    <span className="text-slate-500 font-medium">Arrival Window</span>
                    <span className="font-semibold text-slate-800">
                      {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString() : 'Immediate'} – {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString() : 'Flexible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {contract.status === 'ACCEPTED' && (
                  <button
                    onClick={() => setHandoverContract(contract)}
                    className="saas-btn-primary w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-xs py-2 h-auto"
                  >
                    <ShieldCheck size={15} /> Handover & Commence Voyage
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/chat"
                    className="saas-btn-secondary text-xs py-2 h-auto text-sky-700 hover:text-sky-800 bg-sky-50/50 hover:bg-sky-50 border-sky-200"
                  >
                    <MessageSquare size={14} /> Negotiate
                  </Link>
                  <Link
                    to="/live-tracker"
                    className="saas-btn-secondary text-xs py-2 h-auto"
                  >
                    <Map size={14} /> Live AIS Map
                  </Link>
                </div>

                <button
                  onClick={() => setFixtureContract(contract)}
                  className="saas-btn-secondary w-full text-xs py-2 h-auto text-slate-700"
                >
                  <FileText size={14} /> Fixture Note Recap
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Handover Modal */}
      {handoverContract && (
        <HandoverModal
          contract={handoverContract}
          vessels={vessels}
          onClose={() => setHandoverContract(null)}
          onSuccess={handleHandoverSuccess}
        />
      )}

      {/* Fixture Note Recap Modal */}
      {fixtureContract && (
        <FixtureNoteModal
          contract={fixtureContract}
          onClose={() => setFixtureContract(null)}
        />
      )}
    </div>
  );
};

export default ActiveContracts;
