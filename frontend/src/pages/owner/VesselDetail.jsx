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
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/owner/fleet" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{vessel.vesselName}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">{vessel.vesselClass} · IMO {vessel.imoNumber} · {vessel.flag}</p>
        </div>
        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${
          vessel.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
          vessel.status === 'ON_CHARTER' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>{vessel.status}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
        {['details', 'availability'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'availability' ? 'Availability Calendar' : 'Vessel Details'}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Technical Specifications</h2>
            <button
              onClick={() => editMode ? handleSaveEdit() : setEditMode(true)}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: editMode ? '#0B82C9' : '#F4F7FB', color: editMode ? 'white' : '#122F55' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editMode ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Vessel'}
            </button>
          </div>

          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Vessel Name', key: 'vesselName' },
              { label: 'IMO Number', key: 'imoNumber' },
              { label: 'Flag', key: 'flag' },
              { label: 'Year Built', key: 'yearBuilt', type: 'number' },
              { label: 'DWT (Tonnes)', key: 'dwt', type: 'number' },
              { label: 'Draft (m)', key: 'draft', type: 'number' },
              { label: 'LOA (m)', key: 'loa', type: 'number' },
              { label: 'Beam (m)', key: 'beam', type: 'number' },
            ].map(({ label, key, type = 'text' }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                {editMode ? (
                  <input
                    type={type}
                    value={editForm[key] || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className={inputCls}
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-xl">{vessel[key] || '—'}</p>
                )}
              </div>
            ))}

            <div>
              <label className={labelCls}>Vessel Class</label>
              {editMode ? (
                <select value={editForm.vesselClass || ''} onChange={e => setEditForm(prev => ({ ...prev, vesselClass: e.target.value }))} className={inputCls}>
                  {['Handysize', 'Supramax', 'Panamax', 'Capesize'].map(c => <option key={c}>{c}</option>)}
                </select>
              ) : (
                <p className="text-base font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-xl">{vessel.vesselClass || '—'}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Fuel Type</label>
              {editMode ? (
                <select value={editForm.fuelType || ''} onChange={e => setEditForm(prev => ({ ...prev, fuelType: e.target.value }))} className={inputCls}>
                  <option value="VLSFO">VLSFO</option>
                  <option value="HSFO">HSFO</option>
                </select>
              ) : (
                <p className="text-base font-semibold text-gray-800 py-3 px-4 bg-gray-50 rounded-xl">{vessel.fuelType || '—'}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          {/* Add Availability Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={18} className="text-blue-500" /> Mark Vessel as Busy
            </h3>
            <form onSubmit={handleAddAvailability} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Busy From</label>
                <input type="date" required value={availForm.busyFrom} onChange={e => setAvailForm(p => ({ ...p, busyFrom: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Busy Until</label>
                <input type="date" required value={availForm.busyTo} onChange={e => setAvailForm(p => ({ ...p, busyTo: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Reason</label>
                <input type="text" placeholder="e.g. On Charter, Dry Dock, Maintenance" value={availForm.reason} onChange={e => setAvailForm(p => ({ ...p, reason: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" placeholder="e.g. Singapore, Port Klang" value={availForm.location} onChange={e => setAvailForm(p => ({ ...p, location: e.target.value }))} className={inputCls} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <button type="submit" disabled={addingAvail} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                  {addingAvail ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  Add Unavailable Period
                </button>
              </div>
            </form>
          </div>

          {/* Availability History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">Scheduled Unavailability</h3>
            </div>
            {availability.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Calendar size={40} className="mx-auto mb-3 text-gray-200" />
                <p>No unavailability periods scheduled. The vessel is available by default.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {availability.map(rec => (
                  <div key={rec._id} className="px-8 py-5 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-red-50 text-red-500 rounded-lg mt-0.5">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{rec.reason || 'Unavailable'}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(rec.busyFrom).toLocaleDateString()} → {new Date(rec.busyTo).toLocaleDateString()}
                        </p>
                        {rec.location && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {rec.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">BUSY</span>
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
