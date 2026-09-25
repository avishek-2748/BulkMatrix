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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <User size={24} className="text-blue-600" />
          Company & User Profile
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your identity, corporate entity, contact coordinates, and system preferences
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={18} className="text-green-600" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-600" />
          {error}
        </div>
      )}

      {/* Account Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-black text-2xl shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'BM'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{roleLabel}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {user?.email}
            </p>
          </div>
        </div>

        {user?.role === 'VESSEL_OWNER' && (
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-lg">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                {user?.rating ? user.rating.toFixed(1) : '5.0'}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Rating</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-center">
              <div className="font-black text-lg text-gray-800">Verified</div>
              <span className="text-[10px] font-bold text-green-600 uppercase">Operator</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" /> Organization & Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Captain Alexander"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Company / Fleet Operator
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Evergreen Marine Corp"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Address (Account ID)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Contact system admin to change verified email.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Direct Phone / WhatsApp
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="+1 (555) 019-2834"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Corporate Headquarters Address
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="e.g. Marina Bay Financial Centre, Singapore"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" /> Operational Notifications & Dispatch
          </h3>

          <div className="space-y-3">
            {[
              { key: 'contractAlerts', label: 'Contract status updates', desc: 'Instant alert when a charter request is accepted or updated' },
              { key: 'chatMessages', label: 'Charter negotiation messages', desc: 'Receive real-time alerts for incoming direct messages' },
              { key: 'weatherRisks', label: 'Severe weather & route hazards', desc: 'Notify when cyclones or port congestion exceed safe limits' },
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={e => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
