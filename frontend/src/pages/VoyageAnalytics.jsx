import { useState, useEffect } from "react";
import { getMyCharterContracts } from "../services/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Ship, Package, TrendingUp, Activity,
  CheckCircle, Anchor, ArrowRight, BarChart2,
  FileSpreadsheet, Calculator
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_LABELS = {
  PENDING: "Awaiting Owner",
  ACCEPTED: "Owner Accepted",
  ACTIVE: "On Voyage",
  REJECTED: "Declined",
};

const PIE_COLORS = ["#0284C7", "#F97316", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-700">
        <div className="text-slate-400 font-medium mb-1">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="text-slate-300">{entry.name}:</span>
            <strong className="text-white font-bold">{entry.value?.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const VoyageAnalytics = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCharterContracts()
      .then(data => { setContracts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalVoyages = contracts.length;
  const confirmedVoyages = contracts.filter(c => c.status === "ACCEPTED" || c.status === "ACTIVE").length;
  const totalCargo = contracts.reduce((sum, c) => sum + (c.volume || 0), 0);
  const rejectedCount = contracts.filter(c => c.status === "REJECTED").length;
  const successRate = totalVoyages > 0 ? Math.round((confirmedVoyages / totalVoyages) * 100) : 0;

  const statusFunnel = Object.entries(
    contracts.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ name: STATUS_LABELS[status] || status, count, status }));

  const commodityMap = contracts.reduce((acc, c) => {
    const key = c.cargoType || "Other";
    acc[key] = (acc[key] || 0) + (c.volume || 0);
    return acc;
  }, {});
  const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value }));

  const portMap = contracts.reduce((acc, c) => {
    const key = c.originPort || "Unknown";
    acc[key] = (acc[key] || 0) + (c.volume || 0);
    return acc;
  }, {});
  const portData = Object.entries(portMap)
    .map(([port, tonnes]) => ({ port: port.length > 12 ? port.slice(0, 12) + "..." : port, tonnes }))
    .sort((a, b) => b.tonnes - a.tonnes)
    .slice(0, 8);

  const now = new Date();
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const refDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = refDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const slice = contracts.filter(c => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
    });
    return { label, tonnes: slice.reduce((s, c) => s + (c.volume || 0), 0), contracts: slice.length };
  });

  const exportAnalyticsCSV = () => {
    if (!contracts || contracts.length === 0) return;
    const headers = ['Voyage ID', 'Status', 'Commodity', 'Tonnage (MT)', 'Load Port', 'Discharge Port', 'Rate ($/MT)', 'Owner', 'Vessel', 'Date'];
    const rows = contracts.map(c => [
      c._id,
      c.status,
      `"${c.cargoType || 'Bulk'}"`,
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
    link.download = `BulkMatrix_Voyage_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <h1 className="saas-title flex items-center gap-2.5">
            <BarChart2 size={24} className="text-sky-600" />
            Voyage & Cargo Analytics
          </h1>
          <p className="saas-subtitle">
            Fleet cargo throughput trends, booking conversion funnel, and load port geographic breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportAnalyticsCSV}
            disabled={contracts.length === 0}
            className="saas-btn-secondary"
          >
            <FileSpreadsheet size={15} className="text-sky-600" /> Export CSV
          </button>
          <Link
            to="/calculator"
            className="saas-btn-secondary"
          >
            <Calculator size={15} className="text-orange-500" /> TCE Calculator
          </Link>
          <Link
            to="/contracts"
            className="saas-btn-primary"
          >
            View Bookings <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Voyages</span>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">{loading ? '—' : totalVoyages}</div>
          <span className="text-xs text-slate-400 mt-2 block">All requested charters</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Confirmed & Active</span>
          <div className="text-3xl font-bold text-emerald-700 tracking-tight">{loading ? '—' : confirmedVoyages}</div>
          <span className="text-xs text-slate-400 mt-2 block">Accepted or on water</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider block mb-1">Aggregated Tonnage</span>
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {loading ? '—' : `${(totalCargo / 1000).toFixed(1)}k`} <span className="text-sm font-normal text-slate-500">MT</span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">Across all voyages</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block mb-1">Booking Success Rate</span>
          <div className="text-3xl font-bold text-sky-700 tracking-tight">{loading ? '—' : `${successRate}%`}</div>
          <span className="text-xs text-slate-400 mt-2 block">{rejectedCount} inquiries declined</span>
        </div>
      </div>

      {/* Row 1: Monthly Trend + Status Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Monthly Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Throughput Trajectory</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Cargo Volume (MT) vs Charter Bookings</h2>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Loading chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gTonnes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gContracts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tonnes" name="Cargo Volume (MT)" stroke="#0284C7" strokeWidth={2} fill="url(#gTonnes)" dot={{ r: 3.5, fill: "#0284C7" }} />
                <Area type="monotone" dataKey="contracts" name="Total Contracts" stroke="#F97316" strokeWidth={2} fill="url(#gContracts)" dot={{ r: 3.5, fill: "#F97316" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Contract Funnel (1 Col) */}
        <div className="saas-card p-6">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Conversion Pipeline</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Status Funnel</h2>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Loading funnel...</div>
          ) : statusFunnel.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <Ship size={32} className="text-slate-300 mb-2" />
              <p>No contracts in funnel yet</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {statusFunnel.map(item => {
                const pct = totalVoyages > 0 ? Math.round((item.count / totalVoyages) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      <span className="font-mono font-bold text-slate-600">{item.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === 'ACCEPTED' ? 'bg-emerald-500' :
                          item.status === 'ACTIVE' ? 'bg-sky-500' :
                          item.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Origin Port Bar + Commodity Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Origin Port Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Port Traffic</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Cargo Volume by Load Port</h2>
          </div>

          {loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Loading port distribution...</div>
          ) : portData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <Anchor size={32} className="text-slate-300 mb-2" />
              <p>No port activity recorded yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={portData} barCategoryGap="28%">
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="port" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tonnes" name="Cargo (MT)" radius={[4, 4, 0, 0]}>
                  {portData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#0284C7" : i === 1 ? "#0369A1" : "#38BDF8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Commodity Distribution (1 Col) */}
        <div className="saas-card p-6">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cargo Composition</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Commodity Mix</h2>
          </div>

          {loading ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">Loading commodities...</div>
          ) : commodityData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <Package size={32} className="text-slate-300 mb-2" />
              <p>No commodity data</p>
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={commodityData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                    {commodityData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => [`${v?.toLocaleString()} MT`, "Volume"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                {commodityData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-medium">{item.value?.toLocaleString()} MT</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="saas-card p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Audited Records</span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Voyage Transaction Log</h2>
          </div>
          <Link to="/contracts" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            View all bookings <ArrowRight size={13} />
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No voyage transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Contract ID</th>
                  <th className="py-2.5 px-3">Cargo / Volume</th>
                  <th className="py-2.5 px-3">Voyage Route</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Laycan</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contracts.slice(0, 8).map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      #{c._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{c.cargoType}</div>
                      <div className="text-[11px] text-slate-400">{c.volume?.toLocaleString()} MT</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{c.originPort}</span>
                      <span className="text-slate-400"> → {c.destinationPort}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.vesselOwnerId?.company || c.vesselOwnerId?.name || 'Vessel Owner'}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {c.arrivalWindowStart ? new Date(c.arrivalWindowStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Immediate'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`saas-badge ${
                        c.status === 'ACCEPTED' ? 'saas-badge-success' :
                        c.status === 'ACTIVE' ? 'saas-badge-info' :
                        c.status === 'REJECTED' ? 'saas-badge-danger' : 'saas-badge-warning'
                      }`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default VoyageAnalytics;
