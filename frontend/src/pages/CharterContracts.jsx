import React, { useState, useEffect } from 'react';
import { getMyCharterContracts } from '../services/api';
import { 
  FileText, 
  Loader2, 
  Ship, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Map, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Package,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FixtureNoteModal from '../components/FixtureNoteModal';

const statusBadge = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5"><CheckCircle size={13} /> Accepted</span>;
    case 'ACTIVE':
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5"><Ship size={13} /> On Voyage</span>;
    case 'REJECTED':
      return <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5"><XCircle size={13} /> Declined</span>;
    case 'PENDING':
    default:
      return <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full inline-flex items-center gap-1.5"><Clock size={13} /> Awaiting Owner</span>;
  }
};

const CharterContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [fixtureContract, setFixtureContract] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await getMyCharterContracts();
      setContracts(data);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return c.status === 'PENDING' || c.status === 'NEGOTIATING';
    if (filter === 'CONFIRMED') return c.status === 'ACCEPTED' || c.status === 'ACTIVE';
    return c.status === filter;
  });

  const pendingCount = contracts.filter(c => c.status === 'PENDING').length;
  const confirmedCount = contracts.filter(c => c.status === 'ACCEPTED' || c.status === 'ACTIVE').length;

  const exportContractsCSV = () => {
    if (!contracts || contracts.length === 0) return;
    const headers = ['Contract ID', 'Status', 'Cargo Type', 'Volume (MT)', 'Origin Port', 'Destination Port', 'Target Freight Rate ($/MT)', 'Owner', 'Assigned Vessel', 'Created Date'];
    const rows = contracts.map(c => [
      c._id,
      c.status,
      `"${c.cargoType || ''}"`,
      c.volume || 0,
      `"${c.originPort || ''}"`,
      `"${c.destinationPort || ''}"`,
      c.targetFreightRate || '',
      `"${c.vesselOwnerId?.company || c.vesselOwnerId?.name || ''}"`,
      `"${c.vesselId?.vesselName || 'Unassigned'}"`,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BulkMatrix_Contracts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileText size={24} className="text-blue-600" />
            Charter Contracts & Bookings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your charter requests, owner confirmations, and assigned fleet vessels
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportContractsCSV}
            disabled={contracts.length === 0}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={16} className="text-blue-600" /> Export CSV
          </button>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:border-blue-400"
          >
            <Calculator size={16} className="text-blue-600" /> TCE Calculator
          </Link>
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Charter Request
          </Link>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bookings</p>
            <h3 className="text-3xl font-black text-gray-900">{loading ? '—' : contracts.length}</h3>
            <p className="text-xs text-gray-500 mt-1">All requested voyages</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Confirmed Charters</p>
            <h3 className="text-3xl font-black text-green-600">{loading ? '—' : confirmedCount}</h3>
            <p className="text-xs text-green-600/80 mt-1">Accepted or on voyage</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Owner Review</p>
            <h3 className="text-3xl font-black text-amber-600">{loading ? '—' : pendingCount}</h3>
            <p className="text-xs text-amber-600/80 mt-1">Awaiting owner response</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { key: 'ALL', label: 'All Contracts' },
          { key: 'PENDING', label: 'Pending Response' },
          { key: 'CONFIRMED', label: 'Confirmed / Active' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
          <p className="text-gray-500 font-medium">Loading your contracts...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            {filter === 'ALL'
              ? 'You have not submitted any charter requests yet. Run a calculation in Charter Planner to match and request vessels.'
              : 'No contracts match the selected status filter.'}
          </p>
          {filter === 'ALL' && (
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <Plus size={16} /> Open Charter Planner
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredContracts.map(contract => (
            <div
              key={contract._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                
                <div className="flex-1 w-full space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {statusBadge(contract.status)}
                      <span className="text-xs font-bold text-gray-400">
                        Contract #{contract._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {contract.contractType}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-gray-500">
                      Owner: <span className="text-gray-900">{contract.vesselOwnerId?.company || contract.vesselOwnerId?.name || 'Vessel Owner'}</span>
                    </div>
                  </div>

                  {/* Voyage Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cargo</p>
                        <p className="font-extrabold text-gray-900 text-sm">{contract.cargoType}</p>
                        <p className="text-xs text-gray-500 font-medium">{contract.volume?.toLocaleString()} tonnes</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Route</p>
                        <p className="font-extrabold text-gray-900 text-sm">{contract.originPort}</p>
                        <p className="text-xs text-gray-500 font-medium">to {contract.destinationPort}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Arrival Window</p>
                        <p className="font-extrabold text-gray-900 text-sm">
                          {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString() : 'Immediate'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          to {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Vessel Details (if accepted) */}
                  {contract.vesselId && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 bg-blue-50/40 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                        <Ship size={18} className="text-blue-600" />
                        <span>Assigned Vessel: {contract.vesselId.vesselName}</span>
                      </div>
                      <span className="text-xs text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                        {contract.vesselId.vesselClass}
                      </span>
                      <span className="text-xs text-gray-500">
                        IMO: {contract.vesselId.imoNumber} • {contract.vesselId.dwt?.toLocaleString()} DWT • Flag: {contract.vesselId.flag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-3 w-full lg:w-48 flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                  <Link
                    to="/chat"
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm shadow-blue-500/20"
                  >
                    <MessageSquare size={14} /> Negotiate / Chat
                  </Link>

                  <Link
                    to="/live-tracker"
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    <Map size={14} /> Live AIS Map
                  </Link>

                  <button
                    onClick={() => setFixtureContract(contract)}
                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                  >
                    <FileText size={14} /> Fixture Note Recap
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fixture Note Recap Modal */}
      {fixtureContract && (
        <FixtureNoteModal
          contract={fixtureContract}
          onClose={() => setFixtureContract(null)}
        />
      )}
    </div>
  );
};

export default CharterContracts;
