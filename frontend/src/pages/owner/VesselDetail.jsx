import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getVesselById, addAvailability, getAvailability } from '../../services/api';
import api from '../../services/api';
import { Anchor, ChevronLeft, Save, Loader2, Plus, Trash2, Calendar, MapPin } from 'lucide-react';

const VesselDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vessel, setVessel] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Availability form state
  const [availForm, setAvailForm] = useState({ busyFrom: '', busyTo: '', reason: '', location: '' });
  const [addingAvail, setAddingAvail] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vesselData, availData] = await Promise.all([
          getVesselById(id),
          getAvailability(id)
        ]);
        setVessel(vesselData);
        setEditForm(vesselData);
        setAvailability(availData);
      } catch (e) {
        console.error('Failed to load vessel', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/vessels/${id}`, editForm);
      setVessel(res.data);
      setEditMode(false);
    } catch (e) {
      console.error('Failed to update vessel', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    setAddingAvail(true);
    try {
      const newRecord = await addAvailability({ vesselId: id, ...availForm });
      setAvailability(prev => [...prev, newRecord]);
      setAvailForm({ busyFrom: '', busyTo: '', reason: '', location: '' });
    } catch (e) {
      console.error('Failed to add availability', e);
    } finally {
      setAddingAvail(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-800 bg-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-gray-300";
  const labelCls = "block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide";

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );
  if (!vessel) return <div className="text-center p-12 text-gray-500">Vessel not found.</div>;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div className="flex items-center gap-4">
          <Link 
            to="/owner/fleet" 
            className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="saas-title">{vessel.vesselName}</h1>
              <span className={`saas-badge ${
                vessel.status === 'AVAILABLE' ? 'saas-badge-success' :
                vessel.status === 'ON_CHARTER' ? 'saas-badge-info' :
                'saas-badge-danger'
              }`}>
                {vessel.status}
              </span>
            </div>
            <p className="saas-subtitle">
              {vessel.vesselClass} • IMO {vessel.imoNumber} • Flag: {vessel.flag || 'Marshall Islands'} • Registered Fleet Asset
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'details' && (
            <button
              onClick={() => editMode ? handleSaveEdit() : setEditMode(true)}
              disabled={saving}
              className={editMode ? 'saas-btn-primary' : 'saas-btn-secondary'}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{editMode ? (saving ? 'Saving Specs...' : 'Save Specifications') : 'Edit Specifications'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-xl w-fit border border-slate-200/60">
        {[
          { id: 'details', label: 'Technical Specifications' },
          { id: 'availability', label: 'Availability & Dry Dock Schedule' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="saas-card p-0 overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Vessel Particulars & Class Survey</h2>
              <p className="text-xs text-slate-400 mt-0.5">Official dimensional parameters and load line deadweight capacity.</p>
            </div>
            {editMode && (
              <span className="saas-badge saas-badge-warning text-[10px]">Editing Active</span>
            )}
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Vessel Commercial Name', key: 'vesselName' },
              { label: 'IMO Identification Number', key: 'imoNumber' },
              { label: 'Flag State Administration', key: 'flag' },
              { label: 'Year Built / Commissioned', key: 'yearBuilt', type: 'number' },
              { label: 'Deadweight Tonnage (DWT)', key: 'dwt', type: 'number', unit: 'MT' },
              { label: 'Summer Draft (m)', key: 'draft', type: 'number', unit: 'm' },
              { label: 'Length Overall (LOA)', key: 'loa', type: 'number', unit: 'm' },
              { label: 'Extreme Beam (m)', key: 'beam', type: 'number', unit: 'm' },
            ].map(({ label, key, type = 'text', unit }) => (
              <div key={key}>
                <label className="saas-label">{label}</label>
                {editMode ? (
                  <input
                    type={type}
                    value={editForm[key] || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="saas-input"
                  />
                ) : (
                  <div className="text-sm font-semibold text-slate-800 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    {vessel[key] ? `${vessel[key]} ${unit ? unit : ''}` : '—'}
                  </div>
                )}
              </div>
            ))}

            <div>
              <label className="saas-label">Vessel Class Category</label>
              {editMode ? (
                <select 
                  value={editForm.vesselClass || ''} 
                  onChange={e => setEditForm(prev => ({ ...prev, vesselClass: e.target.value }))} 
                  className="saas-input"
                >
                  {['Handysize', 'Supramax', 'Panamax', 'Capesize'].map(c => <option key={c}>{c}</option>)}
                </select>
              ) : (
                <div className="text-sm font-semibold text-slate-800 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  {vessel.vesselClass || '—'}
                </div>
              )}
            </div>

            <div>
              <label className="saas-label">Primary Bunker Fuel Specification</label>
              {editMode ? (
                <select 
                  value={editForm.fuelType || ''} 
                  onChange={e => setEditForm(prev => ({ ...prev, fuelType: e.target.value }))} 
                  className="saas-input"
                >
                  <option value="VLSFO">VLSFO (Very Low Sulfur)</option>
                  <option value="HSFO">HSFO (Scrubber Fitted)</option>
                </select>
              ) : (
                <div className="text-sm font-semibold text-slate-800 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  {vessel.fuelType || '—'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* Add Availability Form */}
          <div className="saas-card p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-blue-600" /> Log Scheduled Maintenance or Off-Hire Period
              </h3>
              <p className="text-xs text-slate-500 mt-1">Prevent automatic charter matching while the vessel is in dry dock or committed.</p>
            </div>

            <form onSubmit={handleAddAvailability} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="saas-label">Unavailable From Date</label>
                <input 
                  type="date" 
                  required 
                  value={availForm.busyFrom} 
                  onChange={e => setAvailForm(p => ({ ...p, busyFrom: e.target.value }))} 
                  className="saas-input" 
                />
              </div>
              <div>
                <label className="saas-label">Unavailable Until Date</label>
                <input 
                  type="date" 
                  required 
                  value={availForm.busyTo} 
                  onChange={e => setAvailForm(p => ({ ...p, busyTo: e.target.value }))} 
                  className="saas-input" 
                />
              </div>
              <div>
                <label className="saas-label">Reason / Off-Hire Nature</label>
                <input 
                  type="text" 
                  placeholder="e.g. Special Survey Drydock, Engine Overhaul" 
                  value={availForm.reason} 
                  onChange={e => setAvailForm(p => ({ ...p, reason: e.target.value }))} 
                  className="saas-input" 
                />
              </div>
              <div>
                <label className="saas-label">Shipyard or Port Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sembcorp Marine, Singapore" 
                  value={availForm.location} 
                  onChange={e => setAvailForm(p => ({ ...p, location: e.target.value }))} 
                  className="saas-input" 
                />
              </div>
              <div className="col-span-1 sm:col-span-2 pt-2">
                <button 
                  type="submit" 
                  disabled={addingAvail} 
                  className="saas-btn-primary"
                >
                  {addingAvail ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  <span>Add Scheduled Block</span>
                </button>
              </div>
            </form>
          </div>

          {/* Availability History */}
          <div className="saas-card p-0 overflow-hidden border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Scheduled Off-Hire Records</h3>
            </div>
            {availability.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Calendar size={36} className="mx-auto mb-2.5 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No scheduled off-hire periods</p>
                <p className="text-xs text-slate-400 mt-1">This vessel is fully available for open spot and contract charters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {availability.map(rec => (
                  <div key={rec._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{rec.reason || 'Off-Hire / Dry Dock'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(rec.busyFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → {new Date(rec.busyTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {rec.location && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {rec.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="saas-badge saas-badge-danger">OFF-HIRE</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VesselDetail;
