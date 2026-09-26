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
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          to="/owner/fleet"
          className="inline-flex items-center gap-2 text-xs font-semibold hover:underline mb-4 no-underline"
          style={{ color: '#4187AB' }}
        >
          <ChevronLeft size={14} /> Back to Fleet Registry
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="saas-title">Register New Vessel</h1>
            <p className="saas-subtitle">
              Add technical specifications and classification parameters to list your ship for dry bulk chartering.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: '#F5FAFE',
                color: '#4187AB',
                border: '1px solid #DADCEB'
              }}
            >
              <Ship size={13} /> Fleet Registry System
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 shadow-sm">
          <AlertTriangle className="flex-shrink-0 mt-0.5 text-rose-600" size={18} />
          <div className="text-sm font-semibold">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 shadow-sm">
          <CheckCircle2 className="flex-shrink-0 mt-0.5 text-emerald-600" size={18} />
          <div className="text-sm font-semibold">Vessel registered successfully! Redirecting to fleet list...</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: CORE SPECIFICATIONS */}
        <div className="saas-card">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b" style={{ borderColor: '#DADCEB' }}>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                <Anchor size={18} style={{ color: '#4187AB' }} /> CORE SPECIFICATIONS
              </h2>
              <p className="text-xs mt-1" style={{ color: '#586D85' }}>Official identification, IMO certification, and classification.</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#586D85' }}>Step 1 of 3</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Full registered commercial ship name</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>7-digit International Maritime Organization ID</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Standard bulk carrier class category</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Primary propulsion bunker specification</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: DIMENSIONS & CAPACITY */}
        <div className="saas-card">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b" style={{ borderColor: '#DADCEB' }}>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                <Ruler size={18} style={{ color: '#4187AB' }} /> DIMENSIONS & CAPACITY
              </h2>
              <p className="text-xs mt-1" style={{ color: '#586D85' }}>Physical draft constraints, deadweight tonnage, and hull limits.</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#586D85' }}>Step 2 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Deadweight Tonnage (DWT) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold" style={{ color: '#586D85' }}>Metric Tonnes</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Total cargo-carrying capacity</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Draft <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold" style={{ color: '#586D85' }}>Meters</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Maximum laden summer draft</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Length Overall (LOA) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold" style={{ color: '#586D85' }}>Meters</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Total vessel hull length</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="saas-label mb-0">
                  Beam (Width) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold" style={{ color: '#586D85' }}>Meters</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Extreme vessel breadth / beam width</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: REGISTRATION */}
        <div className="saas-card">
          <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b" style={{ borderColor: '#DADCEB' }}>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                <ShieldCheck size={18} style={{ color: '#4187AB' }} /> REGISTRATION
              </h2>
              <p className="text-xs mt-1" style={{ color: '#586D85' }}>Year of build commissioning and maritime flag state.</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#586D85' }}>Step 3 of 3</span>
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
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Delivery shipyard commissioning year</span>
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
                placeholder="e.g. Panama, Marshall Islands, Singapore"
                className="saas-input"
              />
              <span className="text-[11px] mt-1.5 block" style={{ color: '#586D85' }}>Vessel registry flag authority</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/owner/fleet"
            className="saas-btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="saas-btn-primary min-w-[170px]"
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
