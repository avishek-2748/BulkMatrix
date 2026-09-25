import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getMe } from '../services/api';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Bell,
  Star,
  Ship,
  Anchor
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phoneNumber: '',
    address: '',
  });

  const [notifications, setNotifications] = useState({
    contractAlerts: true,
    chatMessages: true,
    weatherRisks: true,
    weeklyDigest: false,
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateUserProfile(formData);
      updateUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = {
    VESSEL_OWNER: 'Vessel Owner / Ship Operator',
    LOGISTIC_MANAGER: 'Logistics Manager / Charterer',
    admin: 'System Administrator',
    user: 'Charterer & Logistics Manager',
  }[user?.role] || user?.role;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <User className="text-blue-600" size={24} /> Company & User Profile
          </h1>
          <p className="saas-subtitle">
            Manage your verified commercial identity, company registration, contact points, and notification preferences.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>Profile configuration saved successfully to enterprise registry.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Overview Card */}
      <div className="saas-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-2xl shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'BM'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <span className="saas-badge saas-badge-info">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{roleLabel}</p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {user?.email}
            </p>
          </div>
        </div>

        {user?.role === 'VESSEL_OWNER' && (
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-lg">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                {user?.rating ? user.rating.toFixed(1) : '5.0'}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="font-black text-lg text-emerald-600">Verified</div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Operator</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="saas-card p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" /> Organization & Commercial Coordinates
          </h3>
          <p className="text-xs text-slate-500 mt-1">These details are shown on fixture notes and charter party contracts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="saas-label">
              Full Representative Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="saas-input pl-10"
                placeholder="e.g. Captain Alexander Vance"
              />
            </div>
          </div>

          <div>
            <label className="saas-label">
              Company / Fleet Operator Entity
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="saas-input pl-10"
                placeholder="e.g. Pacific Bulk Shipping Pte Ltd"
              />
            </div>
          </div>

          <div>
            <label className="saas-label">
              Corporate Email (Login ID)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="saas-input pl-10 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Registered account address. Admin support required to modify.</p>
          </div>

          <div>
            <label className="saas-label">
              Operations Hotline / WhatsApp
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="saas-input pl-10"
                placeholder="+65 6789 0123"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="saas-label">
              Corporate Headquarters Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="saas-input pl-10"
                placeholder="e.g. 10 Marina Boulevard, Marina Bay Financial Centre, Singapore 018983"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell size={18} className="text-blue-600" /> Operational Notifications & Dispatch
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Control operational push alerts and voyage event notifications.</p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'contractAlerts', label: 'Contract status updates', desc: 'Instant alert when a charter request is confirmed, counter-offered, or fulfilled' },
              { key: 'chatMessages', label: 'Charter negotiation messages', desc: 'Receive real-time alerts for incoming counterparty inquiries and rate quotes' },
              { key: 'weatherRisks', label: 'Severe weather & route hazards', desc: 'Notify when cyclones or port congestion exceed safe operational margins' },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">{item.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="saas-btn-primary"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Profile Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
