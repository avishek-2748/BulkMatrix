import React from 'react';
import { X, Printer, ShieldCheck, Ship, Anchor, FileText, CheckCircle, Calendar, MapPin, Package } from 'lucide-react';

const FixtureNoteModal = ({ contract, onClose }) => {
  if (!contract) return null;

  const handlePrint = () => {
    window.print();
  };

  const fixtureRef = `BM-FIX-${contract._id?.slice(-8).toUpperCase()}`;
  const vessel = contract.vesselId || {};
  const owner = contract.vesselOwnerId || {};
  const charterer = contract.logisticManagerId || {};
  const handover = contract.handoverDetails || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        
        {/* Top Modal Controls (Hidden during print) */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <FileText size={16} className="text-blue-600" />
            Charter Party Fixture Recap
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="p-8 sm:p-10 space-y-8 font-sans print:p-0">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-black text-2xl tracking-tight">
                <Anchor size={24} className="stroke-[2.5]" />
                BulkMatrix
              </div>
              <p className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase mt-0.5">
                MARITIME INTELLIGENCE & FREIGHT PLATFORM
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-mono text-xs font-black rounded uppercase tracking-wider mb-1">
                FIXTURE CONFIRMED
              </span>
              <p className="font-mono text-xs font-bold text-gray-700">Ref: {fixtureRef}</p>
              <p className="text-[11px] text-gray-400">Date: {new Date(contract.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Parties Section */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Charterers</span>
              <h4 className="font-bold text-gray-900 text-sm">{charterer.company || charterer.name || 'Chartering Corporation'}</h4>
              <p className="text-gray-500 mt-0.5">{charterer.email || 'chartering@bulkmatrix.internal'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">Owners / Disponent Owners</span>
              <h4 className="font-bold text-gray-900 text-sm">{owner.company || owner.name || 'Ship Operating Ltd'}</h4>
              <p className="text-gray-500 mt-0.5">{owner.email || 'operations@bulkmatrix.internal'}</p>
            </div>
          </div>

          {/* Vessel Particulars */}
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Ship size={14} className="text-blue-600" /> 1. Vessel Particulars
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Vessel Name</span>
                <span className="font-bold text-gray-900 text-sm">{vessel.vesselName || 'TBN (To Be Nominated)'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">IMO Number</span>
                <span className="font-mono font-bold text-gray-900">{vessel.imoNumber || 'Pending'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Class & DWT</span>
                <span className="font-bold text-gray-900">{vessel.vesselClass || 'Panamax'} • {vessel.dwt ? `${vessel.dwt.toLocaleString()} t` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Flag / Built</span>
                <span className="font-bold text-gray-900">{vessel.flag || 'Panama'} {vessel.yearBuilt ? `(${vessel.yearBuilt})` : ''}</span>
              </div>
            </div>
          </div>

          {/* Voyage & Cargo Terms */}
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Package size={14} className="text-blue-600" /> 2. Cargo & Voyage Conditions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Cargo Description</span>
                <span className="font-bold text-gray-900 text-sm">{contract.cargoType} in Bulk</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Quantity (MT)</span>
                <span className="font-bold text-gray-900 text-sm">{contract.volume?.toLocaleString()} MT 5% MOLOO</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Charter Type</span>
                <span className="font-bold text-gray-900 text-sm uppercase">{contract.contractType || 'Voyage Charter'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Load Port (1 Safe Berth)</span>
                <span className="font-bold text-gray-900">{contract.originPort}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Discharge Port (1 Safe Berth)</span>
                <span className="font-bold text-gray-900">{contract.destinationPort}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold mb-0.5">Laycan Window</span>
                <span className="font-bold text-gray-900">
                  {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString('en-GB') : 'Immediate'} - {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString('en-GB') : 'TBD'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Handover Particulars (if active) */}
          {(handover.masterName || handover.norDate || contract.status === 'ACTIVE') && (
            <div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-600" /> 3. Delivery & Handover Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">Commanding Master</span>
                  <span className="font-bold text-gray-900">{handover.masterName || 'Capt. Assigned'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">NOR Tendered</span>
                  <span className="font-bold text-gray-900">{handover.norDate ? new Date(handover.norDate).toLocaleDateString('en-GB') : 'On Arrival'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">Bunkers on Delivery</span>
                  <span className="font-bold text-gray-900">{handover.bunkersRob ? `${handover.bunkersRob} MT VLSFO` : 'As per log'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-0.5">Service Speed</span>
                  <span className="font-bold text-gray-900">{handover.speedKnots ? `${handover.speedKnots} knots` : '12.5 knots'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer & Governing Clause */}
          <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 space-y-2">
            <p>
              <strong>Governing Terms:</strong> GENCON 1994 / BIMCO standard dry cargo voyage charter party terms apply. All terms, clauses, and arbitration as mutually agreed between Charterer and Owner via BulkMatrix negotiation channel.
            </p>
            <div className="flex justify-between items-center pt-4 text-[10px] text-gray-400 font-mono">
              <span>Electronic Recap · Certified by BulkMatrix Intelligent Dispatch</span>
              <span>Doc ID: {contract._id}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FixtureNoteModal;
