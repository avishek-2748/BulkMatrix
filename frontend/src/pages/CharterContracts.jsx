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
  Package,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FixtureNoteModal from '../components/FixtureNoteModal';

const statusBadge = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return (
        <span className="saas-badge saas-badge-success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Owner Accepted
        </span>
      );
    case 'ACTIVE':
      return (
        <span className="saas-badge saas-badge-info">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> On Voyage
        </span>
      );
    case 'REJECTED':
      return (
        <span className="saas-badge saas-badge-danger">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Declined
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className="saas-badge saas-badge-warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Awaiting Owner
        </span>
      );
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
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <FileText size={24} className="text-sky-600" />
            Charter Bookings & Contracts
          </h1>
          <p className="saas-subtitle">
            Manage charter fixture inquiries, owner confirmations, and assigned bulk carrier vessels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportContractsCSV}
            disabled={contracts.length === 0}
            className="saas-btn-secondary"
          >
            <FileSpreadsheet size={15} className="text-sky-600" /> Export CSV
          </button>
          <Link
            to="/calculator"
            className="saas-btn-secondary"
          >
            <Calculator size={15} className="text-sky-600" /> TCE Calculator
          </Link>
          <Link
            to="/planner"
            className="saas-btn-primary"
          >
            <Plus size={16} /> New Charter Request
          </Link>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Bookings</span>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '—' : contracts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <FileText size={20} />
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">All submitted charter requests</span>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Confirmed Charters</span>
              <div className="text-3xl font-bold text-emerald-700 tracking-tight">{loading ? '—' : confirmedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} />
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Accepted or currently on voyage</span>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">Pending Owner Review</span>
              <div className="text-3xl font-bold text-amber-700 tracking-tight">{loading ? '—' : pendingCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Awaiting owner response</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/60">
        {[
          { key: 'ALL', label: `All Contracts (${contracts.length})` },
          { key: 'PENDING', label: `Pending Response (${pendingCount})` },
          { key: 'CONFIRMED', label: `Confirmed & Active (${confirmedCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border-none cursor-pointer ${
              filter === tab.key
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="saas-card p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="animate-spin text-sky-500 mb-3" size={32} />
          <p className="text-sm font-medium text-slate-500">Loading your contracts...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="saas-card p-16 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100">
            <FileText size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No contracts found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {filter === 'ALL'
              ? 'You have not submitted any charter requests yet. Run a match in Charter Planner to find vessels.'
              : 'No contracts match the selected status filter.'}
          </p>
          {filter === 'ALL' && (
            <Link
              to="/planner"
              className="saas-btn-primary"
            >
              <Plus size={16} /> Open Charter Planner
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map(contract => (
            <div
              key={contract._id}
              className="saas-card p-6 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                
                <div className="flex-1 w-full space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {statusBadge(contract.status)}
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{contract._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {contract.contractType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Owner: <span className="font-semibold text-slate-800">{contract.vesselOwnerId?.company || contract.vesselOwnerId?.name || 'Vessel Owner'}</span>
                    </div>
                  </div>

                  {/* Voyage Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                        <Package size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Cargo Volume</span>
                        <div className="font-bold text-slate-900 text-sm">{contract.cargoType}</div>
                        <div className="text-xs text-slate-500">{contract.volume?.toLocaleString()} MT</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <MapPin size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Voyage Route</span>
                        <div className="font-bold text-slate-900 text-sm">{contract.originPort}</div>
                        <div className="text-xs text-slate-500">to {contract.destinationPort}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Calendar size={17} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Arrival Window</span>
                        <div className="font-bold text-slate-900 text-sm">
                          {contract.arrivalWindowStart ? new Date(contract.arrivalWindowStart).toLocaleDateString() : 'Immediate'}
                        </div>
                        <div className="text-xs text-slate-500">
                          to {contract.arrivalWindowEnd ? new Date(contract.arrivalWindowEnd).toLocaleDateString() : 'Flexible'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Vessel Details */}
                  {contract.vesselId && (
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/60 p-3 rounded-xl text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Ship size={15} className="text-sky-600" />
                        <span>Assigned Vessel: {contract.vesselId.vesselName}</span>
                      </div>
                      <span className="saas-badge saas-badge-info text-[11px]">
                        {contract.vesselId.vesselClass}
                      </span>
                      <span className="text-slate-400">
                        IMO: {contract.vesselId.imoNumber} • {contract.vesselId.dwt?.toLocaleString()} DWT • Flag: {contract.vesselId.flag || 'Global'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2.5 w-full lg:w-48 flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <Link
                    to="/chat"
                    className="saas-btn-primary text-xs py-2 h-auto flex-1 lg:flex-none"
                  >
                    <MessageSquare size={14} /> Negotiate / Chat
                  </Link>

                  <Link
                    to="/live-tracker"
                    className="saas-btn-secondary text-xs py-2 h-auto flex-1 lg:flex-none"
                  >
                    <Map size={14} /> Live AIS Map
                  </Link>

                  <button
                    onClick={() => setFixtureContract(contract)}
                    className="saas-btn-secondary text-xs py-2 h-auto flex-1 lg:flex-none"
                  >
                    <FileText size={14} /> Fixture Recap
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
