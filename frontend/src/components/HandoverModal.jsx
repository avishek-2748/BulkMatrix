import React, { useState } from 'react';
import { X, Ship, Send, Loader2, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { submitHandoverDetails } from '../services/api';

const HandoverModal = ({ contract, vessels = [], onClose, onSuccess }) => {
  if (!contract) return null;

  const [formData, setFormData] = useState({
    vesselId: contract.vesselId?._id || contract.vesselId || (vessels[0]?._id || ''),
    masterName: contract.handoverDetails?.masterName || '',
    norDate: contract.handoverDetails?.norDate ? contract.handoverDetails.norDate.split('T')[0] : new Date().toISOString().split('T')[0],
    bunkersRob: contract.handoverDetails?.bunkersRob || '450',
    speedKnots: contract.handoverDetails?.speedKnots || '12.5',
    remarks: contract.handoverDetails?.remarks || 'Vessel in all respects ready to load bulk cargo under charter terms.',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await submitHandoverDetails(contract._id, formData);
      onSuccess(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit handover details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 overflow-y-auto">
      <div className="bg-[#FEFFFF] w-full max-w-lg rounded-xl shadow-xl border border-[#DADCEB] overflow-hidden my-8 transform transition-all duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#F5FAFE] border-b border-[#DADCEB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#4187AB]" />
            <h3 className="font-bold text-[#133056] text-sm">
              Voyage Handover & Readiness Form
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#586D85] hover:text-[#133056] hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#586D85] leading-relaxed">
            Submit departure and readiness details to confirm delivery of the vessel and transition this charter to <strong className="text-[#133056]">ACTIVE (On Voyage)</strong>.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Assigned Vessel */}
          {vessels.length > 0 && !contract.vesselId && (
            <div>
              <label className="saas-label">
                Select Fleet Vessel
              </label>
              <select
                value={formData.vesselId}
                onChange={e => setFormData({ ...formData, vesselId: e.target.value })}
                className="saas-input"
              >
                {vessels.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.vesselName} ({v.vesselClass} • {v.dwt?.toLocaleString()} DWT)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="saas-label">
                Commanding Master
              </label>
              <input
                type="text"
                required
                value={formData.masterName}
                onChange={e => setFormData({ ...formData, masterName: e.target.value })}
                placeholder="e.g. Capt. D. Vance"
                className="saas-input"
              />
            </div>

            <div>
              <label className="saas-label">
                NOR Tender Date
              </label>
              <input
                type="date"
                required
                value={formData.norDate}
                onChange={e => setFormData({ ...formData, norDate: e.target.value })}
                className="saas-input"
              />
            </div>

            <div>
              <label className="saas-label">
                Bunkers ROB (MT VLSFO)
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.bunkersRob}
                onChange={e => setFormData({ ...formData, bunkersRob: e.target.value })}
                placeholder="450"
                className="saas-input"
              />
            </div>

            <div>
              <label className="saas-label">
                Service Speed (Knots)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.speedKnots}
                onChange={e => setFormData({ ...formData, speedKnots: e.target.value })}
                placeholder="12.5"
                className="saas-input"
              />
            </div>
          </div>

          <div>
            <label className="saas-label">
              Handover Remarks / Delivery Condition
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="saas-input resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#DADCEB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="saas-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="saas-btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Confirm Handover & Start Voyage
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default HandoverModal;
