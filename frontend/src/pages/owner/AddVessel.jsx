import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addVessel } from '../../services/api';
import {
  Anchor,
  ChevronLeft,
  Save,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Ruler,
  CheckCircle2,
  Info,
  Ship
} from 'lucide-react';

const AddVessel = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    vesselName: '',
    imoNumber: '',
    vesselClass: 'Supramax',
    dwt: '',
    draft: '',
    loa: '',
    beam: '',
    yearBuilt: '',
    flag: '',
    fuelType: 'VLSFO'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dwt: Number(formData.dwt),
        draft: Number(formData.draft),
        loa: Number(formData.loa),
        beam: Number(formData.beam),
        yearBuilt: Number(formData.yearBuilt)
      };

      await addVessel(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/owner/fleet');
      }, 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vessel. Please verify your specifications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link
          to="/owner/fleet"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors mb-3"
        >
          <ChevronLeft size={14} /> Back to Fleet Registry
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Register New Vessel</h1>
            <p className="text-sm text-slate-500 mt-1">
              Add technical specifications and classification to list your ship for dry bulk chartering.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              <Ship size={13} /> Fleet Onboarding
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
          <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={18} />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800">
          <CheckCircle2 className="flex-shrink-0 mt-0.5 text-emerald-600" size={18} />
          <div className="text-sm font-medium">Vessel successfully registered! Redirecting to fleet list...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: CORE SPECIFICATIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Anchor size={17} className="text-sky-600" /> Core Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Official identification, IMO certification, and classification.</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Step 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="saas-label">
                Vessel Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="vesselName"
                required
                value={formData.vesselName}
                onChange={handleChange}
                placeholder="e.g. Pacific Voyager"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Full registered commercial ship name</span>
            </div>

            <div>
              <label className="saas-label">
                IMO Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="imoNumber"
                required
                value={formData.imoNumber}
                onChange={handleChange}
                placeholder="e.g. 9123456"
                className="saas-input font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">7-digit International Maritime Organization ID</span>
            </div>

            <div>
              <label className="saas-label">
                Vessel Class <span className="text-rose-500">*</span>
              </label>
              <select
                name="vesselClass"
                required
                value={formData.vesselClass}
                onChange={handleChange}
                className="saas-input bg-white cursor-pointer"
              >
                <option value="Handysize">Handysize (10,000 – 40,000 DWT)</option>
                <option value="Supramax">Supramax (40,000 – 60,000 DWT)</option>
                <option value="Panamax">Panamax / Kamsarmax (60,000 – 80,000 DWT)</option>
                <option value="Capesize">Capesize (80,000+ DWT)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Standard bulk carrier class category</span>
            </div>

            <div>
              <label className="saas-label">
                Fuel Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="fuelType"
                required
                value={formData.fuelType}
                onChange={handleChange}
                className="saas-input bg-white cursor-pointer"
              >
                <option value="VLSFO">VLSFO (Very Low Sulphur Fuel Oil)</option>
                <option value="HSFO">HSFO (High Sulphur Fuel Oil with Scrubber)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Primary propulsion bunker specification</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: DIMENSIONS & CAPACITY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ruler size={17} className="text-sky-600" /> Dimensions & Capacity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Physical draft constraints, deadweight tonnage, and hull limits.</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Step 2 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Deadweight Tonnage (DWT) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Metric Tonnes</span>
              </div>
              <input
                type="number"
                name="dwt"
                required
                min="1000"
                value={formData.dwt}
                onChange={handleChange}
                placeholder="e.g. 58000"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Total cargo-carrying capacity</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Maximum Draft <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Meters</span>
              </div>
              <input
                type="number"
                step="0.1"
                name="draft"
                required
                value={formData.draft}
                onChange={handleChange}
                placeholder="e.g. 11.8"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Maximum laden freshwater / summer draft</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Length Overall (LOA) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Meters</span>
              </div>
              <input
                type="number"
                step="0.1"
                name="loa"
                required
                value={formData.loa}
                onChange={handleChange}
                placeholder="e.g. 189.9"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Total vessel hull length</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Beam (Width) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Meters</span>
              </div>
              <input
                type="number"
                step="0.1"
                name="beam"
                required
                value={formData.beam}
                onChange={handleChange}
                placeholder="e.g. 32.2"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Extreme vessel breadth / beam width</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: REGISTRATION & FLAG */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={17} className="text-sky-600" /> Registry & Jurisdiction
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Year of build commissioning and maritime flag state.</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Step 3 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="saas-label">
                Year Built <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="yearBuilt"
                required
                min="1950"
                max={new Date().getFullYear() + 1}
                value={formData.yearBuilt}
                onChange={handleChange}
                placeholder="e.g. 2019"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Delivery shipyard commissioning year</span>
            </div>

            <div>
              <label className="saas-label">
                Flag State <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="flag"
                required
                value={formData.flag}
                onChange={handleChange}
                placeholder="e.g. Panama, Marshall Islands, Liberia"
                className="saas-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Vessel registry flag authority</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/owner/fleet"
            className="saas-btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="saas-btn-primary min-w-[160px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Registering...
              </>
            ) : success ? (
              <>
                <CheckCircle2 size={16} /> Added!
              </>
            ) : (
              <>
                <Save size={16} /> Register Vessel
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddVessel;
