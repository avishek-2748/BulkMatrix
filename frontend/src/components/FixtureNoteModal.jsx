import React from 'react';
import { X, Printer, ShieldCheck, Ship, Anchor, FileText, Calendar, MapPin, Package } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 overflow-y-auto">
      <div className="bg-[#FEFFFF] w-full max-w-3xl rounded-xl shadow-xl border border-[#DADCEB] overflow-hidden my-8 print:m-0 print:border-none print:shadow-none transform transition-all duration-200">
        
        {/* Top Modal Controls (Hidden during print) */}
        <div className="px-6 py-4 bg-[#F5FAFE] border-b border-[#DADCEB] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-[#586D85] uppercase tracking-wider">
            <FileText size={16} className="text-[#4187AB]" />
            Charter Party Fixture Recap
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="saas-btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#586D85] hover:text-[#133056] hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="p-8 sm:p-10 space-y-8 font-sans print:p-0">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-[#133056] pb-6">
            <div>
              <div className="flex items-center gap-2 text-[#133056] font-extrabold text-2xl tracking-tight">
                <Anchor size={24} className="stroke-[2.5] text-[#4187AB]" />
                BulkMatrix
              </div>
              <p className="text-[10px] font-bold tracking-widest text-[#586D85] uppercase mt-0.5">
                MARITIME INTELLIGENCE & FREIGHT PLATFORM
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold rounded uppercase tracking-wider mb-1">
                FIXTURE CONFIRMED
              </span>
              <p className="font-mono text-xs font-bold text-[#133056]">Ref: {fixtureRef}</p>
              <p className="text-[11px] text-[#586D85]">Date: {new Date(contract.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Parties Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#F5FAFE] rounded-xl border border-[#DADCEB]">
              <span className="font-bold text-[#586D85] uppercase tracking-widest block mb-1">Charterers</span>
              <h4 className="font-bold text-[#133056] text-sm">{charterer.company || charterer.name || 'Chartering Corporation'}</h4>
              <p className="text-[#586D85] mt-0.5">{charterer.email || 'chartering@bulkmatrix.internal'}</p>
            </div>
            <div className="p-4 bg-[#F5FAFE] rounded-xl border border-[#DADCEB]">
              <span className="font-bold text-[#586D85] uppercase tracking-widest block mb-1">Owners / Disponent Owners</span>
              <h4 className="font-bold text-[#133056] text-sm">{owner.company || owner.name || 'Ship Operating Ltd'}</h4>
              <p className="text-[#586D85] mt-0.5">{owner.email || 'operations@bulkmatrix.internal'}</p>
            </div>
          </div>

          {/* Vessel Particulars */}
          <div>
            <h4 className="text-xs font-bold text-[#133056] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Ship size={14} className="text-[#4187AB]" /> 1. Vessel Particulars
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-[#DADCEB] rounded-xl text-xs">
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Vessel Name</span>
                <span className="font-bold text-[#133056] text-sm">{vessel.vesselName || 'TBN (To Be Nominated)'}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">IMO Number</span>
                <span className="font-mono font-bold text-[#133056]">{vessel.imoNumber || 'Pending'}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Class & DWT</span>
                <span className="font-bold text-[#133056]">{vessel.vesselClass || 'Panamax'} • {vessel.dwt ? `${vessel.dwt.toLocaleString()} t` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Flag / Built</span>
                <span className="font-bold text-[#133056]">{vessel.flag || 'Panama'} {vessel.yearBuilt ? `(${vessel.yearBuilt})` : ''}</span>
              </div>
            </div>
          </div>

          {/* Voyage & Cargo Terms */}
          <div>
            <h4 className="text-xs font-bold text-[#133056] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Package size={14} className="text-[#4187AB]" /> 2. Cargo & Voyage Conditions
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 border border-[#DADCEB] rounded-xl text-xs">
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Cargo Description</span>
                <span className="font-bold text-[#133056] text-sm">{contract.cargoType} in Bulk</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Quantity (MT)</span>
                <span className="font-bold text-[#133056] text-sm">{contract.volume?.toLocaleString()} MT 5% MOLOO</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Charter Type</span>
                <span className="font-bold text-[#133056] text-sm uppercase">{contract.contractType || 'Voyage Charter'}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Load Port (1 Safe Berth)</span>
                <span className="font-bold text-[#133056]">{contract.originPort}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Discharge Port (1 Safe Berth)</span>
                <span className="font-bold text-[#133056]">{contract.destinationPort}</span>
              </div>
              <div>
                <span className="text-[#586D85] block font-semibold mb-0.5">Laycan Window</span>
                <span className="font-bold text-[#133056]">
                  {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString('en-GB') : 'Immediate'} - {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString('en-GB') : 'TBD'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Handover Particulars (if active) */}
          {(handover.masterName || handover.norDate || contract.status === 'ACTIVE') && (
            <div>
              <h4 className="text-xs font-bold text-[#133056] uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#4187AB]" /> 3. Delivery & Handover Status
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F5FAFE] border border-[#DADCEB] rounded-xl text-xs">
                <div>
                  <span className="text-[#586D85] block font-semibold mb-0.5">Commanding Master</span>
                  <span className="font-bold text-[#133056]">{handover.masterName || 'Capt. Assigned'}</span>
                </div>
                <div>
                  <span className="text-[#586D85] block font-semibold mb-0.5">NOR Tendered</span>
                  <span className="font-bold text-[#133056]">{handover.norDate ? new Date(handover.norDate).toLocaleDateString('en-GB') : 'On Arrival'}</span>
                </div>
                <div>
                  <span className="text-[#586D85] block font-semibold mb-0.5">Bunkers on Delivery</span>
                  <span className="font-bold text-[#133056]">{handover.bunkersRob ? `${handover.bunkersRob} MT VLSFO` : 'As per log'}</span>
                </div>
                <div>
                  <span className="text-[#586D85] block font-semibold mb-0.5">Service Speed</span>
                  <span className="font-bold text-[#133056]">{handover.speedKnots ? `${handover.speedKnots} knots` : '12.5 knots'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer & Governing Clause */}
          <div className="pt-6 border-t border-[#DADCEB] text-[11px] text-[#586D85] space-y-2">
            <p>
              <strong className="text-[#133056]">Governing Terms:</strong> GENCON 1994 / BIMCO standard dry cargo voyage charter party terms apply. All terms, clauses, and arbitration as mutually agreed between Charterer and Owner via BulkMatrix negotiation channel.
            </p>
            <div className="flex justify-between items-center pt-4 text-[10px] text-[#586D85] font-mono">
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
