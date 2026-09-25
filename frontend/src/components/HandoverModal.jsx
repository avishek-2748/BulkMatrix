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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-600" />
            <h3 className="font-extrabold text-gray-900 text-sm">
              Voyage Handover & Readiness Form
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-gray-500">
            Submit departure and readiness details to confirm delivery of the vessel and transition this charter to <strong>ACTIVE (On Voyage)</strong>.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-600" />
              {error}
            </div>
          )}

          {/* Assigned Vessel */}
          {vessels.length > 0 && !contract.vesselId && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Select Fleet Vessel
              </label>
              <select
                value={formData.vesselId}
                onChange={e => setFormData({ ...formData, vesselId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
              >
                {vessels.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.vesselName} ({v.vesselClass} • {v.dwt?.toLocaleString()} DWT)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Commanding Master
              </label>
              <input
                type="text"
                required
                value={formData.masterName}
                onChange={e => setFormData({ ...formData, masterName: e.target.value })}
                placeholder="e.g. Capt. D. Vance"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                NOR Tender Date
              </label>
              <input
                type="date"
                required
                value={formData.norDate}
                onChange={e => setFormData({ ...formData, norDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Bunkers ROB (MT VLSFO)
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.bunkersRob}
                onChange={e => setFormData({ ...formData, bunkersRob: e.target.value })}
                placeholder="450"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Service Speed (Knots)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.speedKnots}
                onChange={e => setFormData({ ...formData, speedKnots: e.target.value })}
                placeholder="12.5"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Handover Remarks / Delivery Condition
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
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
