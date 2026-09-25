import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { addVessel } from '../../services/api';
import { Anchor, ChevronLeft, Save, Loader2, AlertTriangle, ShieldCheck, Ruler, CheckCircle2 } from 'lucide-react';

const AddVessel = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const headerRef = useRef(null);

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

  useEffect(() => {
    // GSAP Staggered Entry Animation
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, 
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(".form-group", 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)", delay: 0.2 }
      );

      gsap.fromTo(".form-submit-btn",
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.8 }
      );
    }, formRef);

    return () => ctx.revert();
  }, []);

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
      // Data conversions where needed
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
      
      // Success Animation before leaving
      gsap.to(formRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          navigate('/owner/fleet');
        }
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vessel. Please check the inputs.');
      // Shake animation on error
      gsap.fromTo(formRef.current,
        { x: -10 },
        { x: 10, yoyo: true, repeat: 5, duration: 0.08, ease: "power1.inOut", onComplete: () => gsap.set(formRef.current, {x: 0}) }
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-4 pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white hover:border-gray-300";
  const labelClasses = "block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div ref={headerRef} className="flex items-center gap-4 mb-8">
        <Link to="/owner/fleet" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Register New Vessel</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Add a ship to your active fleet for chartering.</p>
        </div>
      </div>

      <div ref={formRef} className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-900/5 p-8 lg:p-10 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-br from-blue-50 to-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Core Details */}
            <div className="col-span-1 md:col-span-2 form-group border-b border-gray-100 pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Anchor className="text-blue-500" size={18} /> Core Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className={labelClasses}>Vessel Name</label>
                  <input type="text" name="vesselName" required value={formData.vesselName} onChange={handleChange} placeholder="e.g. Pacific Voyager" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>IMO Number</label>
                  <input type="text" name="imoNumber" required value={formData.imoNumber} onChange={handleChange} placeholder="e.g. 9123456" className={inputClasses} />
                </div>
                
                <div>
                  <label className={labelClasses}>Vessel Class</label>
                  <select name="vesselClass" required value={formData.vesselClass} onChange={handleChange} className={inputClasses}>
                    <option value="Handysize">Handysize (10,000 - 40,000 DWT)</option>
                    <option value="Supramax">Supramax (40,000 - 60,000 DWT)</option>
                    <option value="Panamax">Panamax (60,000 - 80,000 DWT)</option>
                    <option value="Capesize">Capesize (80,000+ DWT)</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClasses}>Fuel Type</label>
                  <select name="fuelType" required value={formData.fuelType} onChange={handleChange} className={inputClasses}>
                    <option value="VLSFO">VLSFO (Very Low Sulphur Fuel Oil)</option>
                    <option value="HSFO">HSFO (High Sulphur Fuel Oil)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="col-span-1 md:col-span-2 form-group pt-2">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Ruler className="text-blue-500" size={18} /> Dimensions & Capacity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                <div>
                  <label className={labelClasses}>DWT (Tons)</label>
                  <input type="number" name="dwt" required min="1000" value={formData.dwt} onChange={handleChange} placeholder="55000" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Draft (Meters)</label>
                  <input type="number" step="0.1" name="draft" required value={formData.draft} onChange={handleChange} placeholder="11.5" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>LOA (Meters)</label>
                  <input type="number" step="0.1" name="loa" required value={formData.loa} onChange={handleChange} placeholder="190.0" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Beam (Meters)</label>
                  <input type="number" step="0.1" name="beam" required value={formData.beam} onChange={handleChange} placeholder="32.2" className={inputClasses} />
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="col-span-1 md:col-span-2 form-group pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-500" size={18} /> Registration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className={labelClasses}>Year Built</label>
                  <input type="number" name="yearBuilt" required min="1950" max={new Date().getFullYear()} value={formData.yearBuilt} onChange={handleChange} placeholder="2018" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Flag</label>
                  <input type="text" name="flag" required value={formData.flag} onChange={handleChange} placeholder="e.g. Panama" className={inputClasses} />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-6 form-submit-btn">
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2
                ${(loading || success) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Registering Vessel...</>
              ) : success ? (
                <><CheckCircle2 size={18} /> Vessel Added Successfully!</>
              ) : (
                <><Save size={18} /> Add Vessel to Fleet</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddVessel;
