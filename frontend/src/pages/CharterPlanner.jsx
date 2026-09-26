import { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateCharterRecommendation, createContractRequest } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Anchor, ShieldCheck, TrendingUp, AlertTriangle, Ship, Calendar, MapPin, Package, Clock, Info, Sparkles, CheckCircle, XCircle, Layers, Award, Loader2, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import EstimatedFreightCost from '../components/EstimatedFreightCost';

const DESTINATION_PORTS = ['Paradip', 'Vizag', 'Gangavaram', 'Gopalpur', 'Dhamra', 'Sagar–Sandheads', 'Haldia'];
const ORIGIN_PORTS = ['Hay Point', 'Newcastle', 'Gladstone', 'Port Hedland', 'Baltimore', 'Norfolk', 'Maputo', 'Russia', 'Indonesia'];

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="saas-card p-6">
    <h3 className="text-sm font-bold flex items-center gap-2 pb-4 mb-4 border-b border-slate-100" style={{ color: '#133056' }}>
      <Icon size={16} className="text-blue-600" />
      {title}
    </h3>
    {children}
  </div>
);

const CharterPlanner = () => {
  const [formData, setFormData] = useState({
    cargo_volume_tonnes: '',
    commodity: 'Coal',
    origin_port: 'Newcastle',
    destination_ports: [],
    contract_type: 'Spot',
    arrival_window_start: '',
    arrival_window_end: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [requestingOwnerId, setRequestingOwnerId] = useState(null);
  const [requestedOwners, setRequestedOwners] = useState(new Set());
  const [requestStatus, setRequestStatus] = useState(null);

  const handleCheckboxChange = (port) => {
    setFormData(prev => ({
      ...prev,
      destination_ports: prev.destination_ports.includes(port)
        ? prev.destination_ports.filter(p => p !== port)
        : [...prev.destination_ports, port]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.destination_ports.length === 0) { setError('Please select at least one destination port.'); return; }
    setLoading(true);
    setError(null);
    setRequestStatus(null);
    try {
      const data = await generateCharterRecommendation({ ...formData, cargo_volume_tonnes: Number(formData.cargo_volume_tonnes) });
      setResult(data);
    } catch (err) {
      setError('Failed to generate recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result?.forecast ? [
    { name: 'Current', rate: result.forecast.currentRate ?? 22.5 },
    { name: '15 Days', rate: result.forecast.forecast15 ?? 23.1 },
    { name: '30 Days', rate: result.forecast.forecast30 ?? 24.5 },
    { name: '90 Days', rate: result.forecast.forecast90 ?? 22.0 },
  ] : [];

  const isBuyNow = result?.marketSignal?.signal === 'BUY NOW';

  const handleRequestContract = async (owner) => {
    setRequestingOwnerId(owner.ownerId);
    setRequestStatus(null);
    try {
      await createContractRequest({
        vesselOwnerId: owner.ownerId,
        cargoType: formData.commodity,
        volume: Number(formData.cargo_volume_tonnes),
        originPort: formData.origin_port,
        destinationPort: formData.destination_ports[0],
        arrivalWindowStart: formData.arrival_window_start,
        arrivalWindowEnd: formData.arrival_window_end,
        contractType: formData.contract_type
      });
      setRequestedOwners(prev => new Set([...prev, owner.ownerId]));
      setRequestStatus({
        type: 'success',
        message: `Charter request sent to ${owner.company || owner.name}! They have been alerted in their owner portal.`
      });
    } catch (error) {
      setRequestStatus({
        type: 'error',
        message: 'Failed to send contract request. Please try again.'
      });
      console.error(error);
    } finally {
      setRequestingOwnerId(null);
    }
  };


  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* SaaS Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="saas-title flex items-center gap-2.5">
              <Sparkles className="text-blue-600" size={24} /> AI Charter Party & Route Planner
            </h1>
            <span className="saas-badge saas-badge-info">
              PREDICTIVE ML OPTIMIZATION
            </span>
          </div>
          <p className="saas-subtitle">
            Configure parcel volume and delivery windows to generate optimal single or multi-vessel fleet fixtures with freight cost projections.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Cargo Details */}
          <SectionCard title="Cargo Details" icon={Package}>
            <div className="space-y-4">
              <div>
                <label className="saas-label">Cargo Volume (tonnes)</label>
                <input type="number" required min="1000" value={formData.cargo_volume_tonnes} onChange={e => setFormData({...formData, cargo_volume_tonnes: e.target.value})} placeholder="e.g. 150,000" className="saas-input" />
              </div>
              <div>
                <label className="saas-label">Commodity</label>
                <select value={formData.commodity} onChange={e => setFormData({...formData, commodity: e.target.value})} className="saas-input">
                  <option value="Coal">Coal</option>
                  <option value="Iron Ore">Iron Ore</option>
                </select>
              </div>
              <div>
                <label className="saas-label">Contract Type</label>
                <select value={formData.contract_type} onChange={e => setFormData({...formData, contract_type: e.target.value})} className="saas-input">
                  <option value="Spot">Spot</option>
                  <option value="Short Term">Short Term</option>
                  <option value="Medium Term">Medium Term</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Route Details */}
          <SectionCard title="Route Details" icon={MapPin}>
            <div className="space-y-4">
              <div>
                <label className="saas-label">Origin Port</label>
                <select value={formData.origin_port} onChange={e => setFormData({...formData, origin_port: e.target.value})} className="saas-input">
                  {ORIGIN_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="saas-label">Destination Ports</label>
                <div className="grid grid-cols-2 gap-2">
                  {DESTINATION_PORTS.map(port => {
                    const checked = formData.destination_ports.includes(port);
                    return (
                      <label key={port} className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${checked ? 'border-blue-500 bg-blue-50/60 text-blue-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => handleCheckboxChange(port)} />
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                          {checked && <svg width="8" height="6" fill="none" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="truncate">{port}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Arrival Window */}
          <SectionCard title="Arrival Window" icon={Calendar}>
            <div className="flex flex-col gap-4 h-full justify-between">
              <div>
                <label className="saas-label">Start Date</label>
                <input type="date" required value={formData.arrival_window_start} onChange={e => setFormData({...formData, arrival_window_start: e.target.value})} className="saas-input" />
              </div>
              <div>
                <label className="saas-label">End Date</label>
                <input type="date" required value={formData.arrival_window_end} onChange={e => setFormData({...formData, arrival_window_end: e.target.value})} className="saas-input" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="saas-btn-primary w-full justify-center py-3 mt-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{loading ? 'Evaluating Market Freight...' : 'Generate Recommendation'}</span>
              </button>
            </div>
          </SectionCard>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '32px', animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #D9E6EF' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="#0B82C9" /> Recommendation Results
            </h2>
            <span style={{ padding: '4px 12px', background: '#E8F8EF', border: '1px solid #BBF7D0', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, color: '#16A34A', letterSpacing: '0.04em' }}>ML ENGINE SYNCED</span>
          </div>

          {/* Multi-Vessel Banner / Single Vessel Banner */}
          {result.multiVesselRequired ? (
            <div className="flex items-start gap-4 p-5 rounded-xl border mb-6" style={{ background: '#FFFBEB', borderColor: '#FCD34D' }}>
              <div className="p-3 rounded-xl shrink-0" style={{ background: '#FEF3C7' }}>
                <AlertTriangle size={22} className="text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1.5">
                  <h3 className="text-base font-bold" style={{ color: '#92400E' }}>MULTI-VESSEL FLEET REQUIRED</h3>
                  <span className="saas-badge" style={{ background: '#F59E0B', color: 'white', border: 'none' }}>AUTOMATIC FLEET OPTIMIZATION</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#B45309' }}>
                  Required cargo <strong>({formatNumber(Number(formData.cargo_volume_tonnes || 0))} MT)</strong> exceeds max single vessel capacity <strong>({formatNumber(result.singleVesselCapacity || 0)} MT)</strong> by <strong>{formatNumber(result.capacityShortfall || 0)} MT</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-xl border mb-6" style={{ background: '#F0FDF4', borderColor: '#86EFAC' }}>
              <div className="p-2.5 rounded-xl shrink-0" style={{ background: '#DCFCE7' }}>
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-0.5" style={{ color: '#166534' }}>SINGLE VESSEL IS SUFFICIENT</h3>
                <p className="text-sm" style={{ color: '#15803D' }}>
                  Required cargo ({formatNumber(Number(formData.cargo_volume_tonnes || 0))} MT) fits within standard {result.vesselRecommendation?.class || 'Capesize'} vessel capacity ({formatNumber(result.singleVesselCapacity || 0)} MT).
                </p>
              </div>
            </div>
          )}

          {/* AI OPTIMAL FLEET RECOMMENDATION CARD */}
          {result.multiVesselRequired && result.optimalFleet && (
            <div className="saas-card p-6 mb-6 border-2" style={{ borderColor: '#133056' }}>
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Award size={20} className="text-blue-600" />
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#133056' }}>AI OPTIMAL FLEET RECOMMENDATION</h3>
                    <span className="text-xs" style={{ color: '#586D85' }}>Ranked #1 for Lowest Freight Cost & Port Feasibility</span>
                  </div>
                </div>
                {result.optimalFleet.savings_percent > 0 && (
                  <span className="saas-badge saas-badge-success text-xs">
                    {result.optimalFleet.savings_percent}% SAVINGS · {formatCurrency(result.optimalFleet.estimated_savings || 0)}
                  </span>
                )}
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Freight Cost', value: formatCurrency(result.optimalFleet.estimated_total_cost || result.optimalFleet.total_cost || 0), sub: `$${result.optimalFleet.cost_per_tonne || 0} / MT`, color: '#133056' },
                  { label: 'Fleet Composition', value: result.optimalFleet.vessel_types_summary, sub: `${result.optimalFleet.vessel_count || result.optimalFleet.vessels?.length || 0} Vessels Total`, color: '#133056' },
                  { label: 'Total Capacity', value: `${formatNumber(result.optimalFleet.total_capacity)} MT`, sub: `Covering ${formatNumber(formData.cargo_volume_tonnes)} MT`, color: '#133056' },
                  { label: 'Unused Capacity', value: `${formatNumber(result.optimalFleet.unused_capacity)} MT`, sub: 'Minimizes buffer waste', color: '#D97706' },
                ].map(k => (
                  <div key={k.label} className="bg-white p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#586D85' }}>{k.label}</p>
                    <p className="text-base font-black" style={{ color: k.color }}>{k.value}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#8295AB' }}>{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* Vessel Breakdown Cards */}
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#586D85' }}>Allocated Fleet Breakdown</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(result.optimalFleet.vessels?.length || 1, 4)}, 1fr)` }}>
                {(result.optimalFleet.vessels || []).map((v, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: '#133056' }}>{v.name || `Vessel ${i+1}`}</span>
                      <span className="saas-badge saas-badge-info text-[10px] py-0.5">{v.vessel_class || v.class}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span style={{ color: '#586D85' }}>Payload:</span>
                        <strong style={{ color: '#133056' }}>{formatNumber(v.capacity)} MT</strong>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#586D85' }}>Est. Rate:</span>
                        <strong style={{ color: '#133056' }}>${v.rate_per_tonne || v.rate_per_ton}/MT</strong>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-100">
                        <span style={{ color: '#586D85' }}>Total Freight:</span>
                        <strong className="text-blue-700">{formatCurrency(v.freight_cost || v.cost || 0)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALTERNATIVE FLEET OPTIONS */}
          {result.multiVesselRequired && result.alternativeFleets && result.alternativeFleets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#133056' }}>
                <Layers size={16} className="text-blue-600" /> Alternative Fleet Combinations
              </h3>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {result.alternativeFleets.map((alt, idx) => (
                  <div key={idx} className="saas-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold" style={{ color: '#133056' }}>Option {alt.option_number || idx + 2}</span>
                      <span className="saas-badge saas-badge-neutral">{alt.vessel_count} Vessels</span>
                    </div>
                    <p className="text-sm font-bold mb-3 text-blue-700">{alt.vessel_types_summary}</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span style={{ color: '#586D85' }}>Total Capacity:</span><strong style={{ color: '#133056' }}>{formatNumber(alt.total_capacity)} MT</strong></div>
                      <div className="flex justify-between"><span style={{ color: '#586D85' }}>Unused Buffer:</span><strong style={{ color: '#133056' }}>{formatNumber(alt.unused_capacity)} MT</strong></div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-100">
                        <span style={{ color: '#586D85' }}>Est. Total Cost:</span>
                        <strong style={{ color: '#133056' }}>{formatCurrency(alt.estimated_total_cost || 0)} (${alt.cost_per_tonne}/MT)</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Freight Cost Section */}
          <EstimatedFreightCost
            cargoVolumeTonnes={formData.cargo_volume_tonnes}
            recommendationResult={result}
            selectedDestinations={formData.destination_ports}
            originPort={formData.origin_port}
          />

          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
            {/* Freight Forecast Chart */}
            <div className="saas-card p-6">
              <h3 className="text-sm font-bold mb-5" style={{ color: '#133056' }}>Freight Rate Forecast ($/tonne)</h3>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7EFF5" vertical={false} />
                    <XAxis dataKey="name" stroke="#7890A8" tick={{ fill: '#7890A8', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#7890A8" tick={{ fill: '#7890A8', fontSize: 11.5 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #DADCEB', borderRadius: '10px', boxShadow: '0 6px 20px rgba(18, 47, 85, 0.08)', fontSize: '13px', color: '#133056' }} formatter={v => [`$${v}`, 'Freight Rate']} />
                    <Line type="monotone" dataKey="rate" stroke="#0B82C9" strokeWidth={3} dot={{ r: 5, fill: 'white', stroke: '#0B82C9', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Signal */}
            <div className="saas-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
              style={{ background: isBuyNow ? '#F0FDF4' : '#FFF5EF', borderColor: isBuyNow ? '#BBF7D0' : '#FFD8C2' }}>
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: isBuyNow ? '#16A34A' : '#F3752F' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: isBuyNow ? '#16A34A' : '#F3752F' }}>Market Signal</p>
              <p className="font-black mb-3" style={{ fontSize: '32px', lineHeight: 1, color: isBuyNow ? '#16A34A' : '#F3752F' }}>{result.marketSignal?.signal ?? 'BUY NOW'}</p>
              <span className="saas-badge mb-3" style={{ background: 'white', color: '#133056', border: '1px solid #DADCEB' }}>
                Confidence: {result.marketSignal?.confidence ?? 85}%
              </span>
              <p className="text-xs leading-relaxed" style={{ color: '#586D85' }}>{result.marketSignal?.reason ?? 'Freight rates expected to increase.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Vessel Recommendation */}
            <div className="saas-card p-6">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#133056' }}>
                <Anchor size={15} className="text-blue-600" /> Vessel Recommendation
              </h3>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl mb-4" style={{ background: '#FFF5EF', border: '1px solid #FFD8C2' }}>
                <Ship size={16} style={{ color: '#F3752F' }} />
                <span className="text-base font-black" style={{ color: '#133056' }}>{result.vesselRecommendation?.class ?? 'PANAMAX'}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: '#F3752F', background: '#fff', border: '1px solid #FFD8C2' }}>RECOMMENDED</span>
              </div>
              <div className="space-y-2 mb-4">
                {[['Draft', result.vesselRecommendation?.draftCompatible ?? true], ['LOA', result.vesselRecommendation?.loaCompatible ?? true], ['Beam', result.vesselRecommendation?.beamCompatible ?? true]].map(([label, ok]) => (
                  <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: ok ? '#F0FDF4' : '#FEF2F2' }}>
                    {ok ? <CheckCircle size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-rose-600" />}
                    <span className="text-xs font-semibold" style={{ color: ok ? '#16A34A' : '#DC2626' }}>{label} Compatible</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-3 rounded-lg" style={{ background: '#EAF6FC', border: '1px solid #CFE7F5' }}>
                <Info size={13} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed m-0" style={{ color: '#586D85' }}>{result.vesselRecommendation?.reason ?? 'Recommended vessel matches port draft restrictions.'}</p>
              </div>
            </div>

            {/* Port Time Estimates */}
            <div className="saas-card p-6 lg:col-span-2">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#133056' }}>
                <Clock size={15} className="text-blue-600" /> Port Time Estimates
              </h3>
              <div className="overflow-x-auto">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Port</th>
                      <th style={{ textAlign: 'right' }}>Waiting Days</th>
                      <th style={{ textAlign: 'right' }}>Discharge Days</th>
                      <th style={{ textAlign: 'right' }}>Total Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.portTimeEstimates || []).map((est, idx) => {
                      const isBest = idx === 0;
                      return (
                        <tr key={est.port || idx} style={{ background: isBest ? '#EAF6FC' : undefined }}>
                          <td className="font-medium flex items-center gap-1.5" style={{ color: isBest ? '#0B82C9' : '#133056', fontWeight: isBest ? 700 : 500 }}>
                            {isBest && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                            {est.port}
                          </td>
                          <td style={{ textAlign: 'right', color: '#586D85' }}>{est.waitingDays}</td>
                          <td style={{ textAlign: 'right', color: '#586D85' }}>{est.dischargeDays}</td>
                          <td className="font-bold" style={{ textAlign: 'right', color: isBest ? '#0B82C9' : '#133056' }}>{est.total} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {result.alternatePort && (
                <div className="mt-4 flex gap-2.5 items-start p-3.5 rounded-xl" style={{ background: '#EAF6FC', border: '1px solid #CFE7F5' }}>
                  <Ship size={15} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Alternate Port: </span>
                    <span className="text-xs font-bold" style={{ color: '#133056' }}>{result.alternatePort.port}</span>
                    <p className="text-xs mt-0.5" style={{ color: '#586D85' }}>{result.alternatePort.reason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Alerts */}
            <div className="saas-card p-6 lg:col-span-3">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#133056' }}>
                <AlertTriangle size={15} className="text-rose-500" /> Risk Alerts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(result.riskAlerts || []).map((alert, i) => {
                  const isHigh = alert.severity === 'HIGH';
                  const isMed = alert.severity === 'MEDIUM';
                  const c = isHigh ? '#DC2626' : isMed ? '#F3752F' : '#16A34A';
                  const bg = isHigh ? '#FEF2F2' : isMed ? '#FFF5EF' : '#F0FDF4';
                  const bc = isHigh ? '#FECACA' : isMed ? '#FFD8C2' : '#BBF7D0';
                  return (
                    <div key={i} className="px-4 py-3 rounded-xl border-l-4" style={{ background: bg, borderLeftColor: c, borderTop: `1px solid ${bc}`, borderRight: `1px solid ${bc}`, borderBottom: `1px solid ${bc}` }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: c }}>{alert.severity} · {alert.type}</p>
                      <p className="text-xs font-medium" style={{ color: '#133056' }}>{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Matched Owners Section */}
          {result.suitableOwners && result.suitableOwners.length > 0 && (
            <div className="saas-card p-6 mt-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#133056' }}>
                  <Anchor size={18} className="text-blue-600" /> Top Matched Vessel Owners
                </h3>
                <span className="text-xs font-semibold" style={{ color: '#586D85' }}>AI Match Algorithm Ranking</span>
              </div>

              {requestStatus && (
                <div className={`flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl mb-5 text-sm font-semibold ${
                  requestStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {requestStatus.type === 'success'
                      ? <CheckCircle size={16} className="text-emerald-600" />
                      : <AlertTriangle size={16} className="text-rose-600" />}
                    <span>{requestStatus.message}</span>
                  </div>
                  {requestStatus.type === 'success' && (
                    <div className="flex items-center gap-2">
                      <Link to="/contracts" className="saas-btn-sm" style={{ background: '#166534', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                        Track in Bookings <ArrowRight size={13} />
                      </Link>
                      <Link to="/chat" className="saas-btn-sm" style={{ background: '#fff', color: '#166534', border: '1px solid #BBF7D0', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                        Open Chat
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {result.suitableOwners.map((owner, idx) => {
                  const isRequested = requestedOwners.has(owner.ownerId);
                  const isCurrentRequesting = requestingOwnerId === owner.ownerId;
                  return (
                    <div key={owner.ownerId} className={`flex items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                      idx === 0 ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white hover:bg-slate-50/60'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0" style={{ background: '#EAF6FC', color: '#0B82C9' }}>
                          {owner.company ? owner.company.charAt(0) : owner.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-0.5">
                            <h4 className="text-base font-bold" style={{ color: '#133056' }}>{owner.company || owner.name}</h4>
                            {idx === 0 && <span className="saas-badge saas-badge-success text-[10px]">BEST MATCH</span>}
                          </div>
                          <p className="text-xs" style={{ color: '#586D85' }}>
                            Match Score: <strong className="text-blue-700">{owner.score} / 100</strong> · {owner.fleetAvailable} Available {result.vesselRecommendation?.class}s
                          </p>
                        </div>
                      </div>

                      {isRequested ? (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 shrink-0">
                          <CheckCircle size={15} /> Request Sent
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestContract(owner)}
                          disabled={isCurrentRequesting || requestingOwnerId !== null}
                          className="saas-btn-primary shrink-0"
                        >
                          {isCurrentRequesting ? (
                            <><Loader2 size={15} className="animate-spin" /> Sending...</>
                          ) : 'Request Charter'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharterPlanner;
