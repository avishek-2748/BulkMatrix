import React, { useState, useEffect } from 'react';
import { getActiveContracts, getMyVessels } from '../../services/api';
import { Loader2, Activity, MapPin, Package, Calendar, MessageSquare, Map, Ship, FileText, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Contracts</h1>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <MessageSquare size={15} /> Open Messages
        </Link>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500">Loading active contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-16 text-center">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No active contracts</h3>
          <p className="text-gray-500">You don't have any active charters right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map(contract => (
            <div key={contract._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Ship size={18} className="text-blue-600" />
                    <span className="font-bold text-gray-900">{contract.vesselId?.vesselName || 'Pending Vessel Assignment'}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">{contract.status}</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Charterer:</span>
                    <span className="font-bold text-gray-900">{contract.logisticManagerId?.company || contract.logisticManagerId?.name || 'Charterer'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Route:</span>
                    <span className="font-semibold text-gray-900">{contract.originPort} → {contract.destinationPort}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Cargo:</span>
                    <span className="font-semibold text-gray-900">{contract.volume?.toLocaleString()}t {contract.cargoType}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Arrival Window:</span>
                    <span className="font-semibold text-gray-900">
                      {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString() : 'Immediate'} - {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2 border-t border-gray-50 mt-2">
                {contract.status === 'ACCEPTED' && (
                  <button
                    onClick={() => setHandoverContract(contract)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    <ShieldCheck size={15} /> Handover & Commence Voyage
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/chat"
                    className="inline-flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors no-underline"
                  >
                    <MessageSquare size={14} /> Chat
                  </Link>
                  <Link
                    to="/live-tracker"
                    className="inline-flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl text-xs transition-colors no-underline"
                  >
                    <Map size={14} /> Track AIS
                  </Link>
                </div>

                <button
                  onClick={() => setFixtureContract(contract)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                >
                  <FileText size={14} /> View Fixture Note Recap
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
