import { useState } from 'react';
import { generateCharterRecommendation } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Anchor, ShieldCheck, TrendingUp, AlertTriangle, Ship, Calendar, MapPin, Package, Clock, Info, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const DESTINATION_PORTS = ['Paradip', 'Vizag', 'Gangavaram', 'Gopalpur', 'Dhamra', 'Sagar–Sandheads', 'Haldia'];
const ORIGIN_PORTS = ['Hay Point', 'Newcastle', 'Gladstone', 'Port Hedland', 'Baltimore', 'Norfolk', 'Maputo', 'Russia', 'Indonesia'];

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  background: 'white',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
};

const onFocus = e => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'; };
const onBlur = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

const SectionCard = ({ title, icon: Icon, iconColor, children }) => (
  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
      <Icon size={16} color={iconColor || 'var(--brand-blue)'} />
      {title}
    </h3>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</label>
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
    try {
      const data = await generateCharterRecommendation({ ...formData, cargo_volume_tonnes: Number(formData.cargo_volume_tonnes) });
      setResult(data);
    } catch (err) {
      setError('Failed to generate recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Current', rate: result.forecast.currentRate },
    { name: '15 Days', rate: result.forecast.forecast15 },
    { name: '30 Days', rate: result.forecast.forecast30 },
    { name: '90 Days', rate: result.forecast.forecast90 },
  ] : [];

  const isBuyNow = result?.marketSignal?.signal === 'BUY NOW';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Charter Planner</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Configure parameters to generate intelligent vessel and route recommendations</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ fontSize: '13.5px', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Cargo Details */}
          <SectionCard title="Cargo Details" icon={Package}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Label>Cargo Volume (tonnes)</Label>
                <input type="number" required min="1000" value={formData.cargo_volume_tonnes} onChange={e => setFormData({...formData, cargo_volume_tonnes: e.target.value})} placeholder="e.g. 150,000" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>Commodity</Label>
                <select value={formData.commodity} onChange={e => setFormData({...formData, commodity: e.target.value})} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  <option value="Coal">Coal</option>
                  <option value="Iron Ore">Iron Ore</option>
                </select>
              </div>
              <div>
                <Label>Contract Type</Label>
                <select value={formData.contract_type} onChange={e => setFormData({...formData, contract_type: e.target.value})} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  <option value="Spot">Spot</option>
                  <option value="Short Term">Short Term</option>
                  <option value="Medium Term">Medium Term</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Route Details */}
          <SectionCard title="Route Details" icon={MapPin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Label>Origin Port</Label>
                <select value={formData.origin_port} onChange={e => setFormData({...formData, origin_port: e.target.value})} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  {ORIGIN_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>Destination Ports</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {DESTINATION_PORTS.map(port => {
                    const checked = formData.destination_ports.includes(port);
                    return (
                      <label key={port} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', borderRadius: '7px', border: `1.5px solid ${checked ? 'var(--brand-blue)' : 'var(--border)'}`, background: checked ? 'var(--light-blue-bg)' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => handleCheckboxChange(port)} />
                        <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: `2px solid ${checked ? 'var(--brand-blue)' : '#CBD5E1'}`, background: checked ? 'var(--brand-blue)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                          {checked && <svg width="8" height="6" fill="none" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: checked ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>{port}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Arrival Window */}
          <SectionCard title="Arrival Window" icon={Calendar}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <Label>Start Date</Label>
                <input type="date" required value={formData.arrival_window_start} onChange={e => setFormData({...formData, arrival_window_start: e.target.value})} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <Label>End Date</Label>
                <input type="date" required value={formData.arrival_window_end} onChange={e => setFormData({...formData, arrival_window_end: e.target.value})} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 'auto', width: '100%', padding: '12px', background: loading ? '#94A3B8' : 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: loading ? 'none' : 'var(--shadow-blue)' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1E40AF'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--brand-blue)'; }}
              >
                <Sparkles size={16} />
                {loading ? 'Analyzing Market...' : 'Generate Recommendation'}
              </button>
            </div>
          </SectionCard>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '32px', animation: 'fadeInUp 0.4s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} color="var(--brand-blue)" /> Recommendation Results
            </h2>
            <span style={{ padding: '4px 12px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.04em' }}>ML ENGINE SYNCED</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Freight Forecast Chart */}
            <div style={{ gridColumn: '1 / 3', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Freight Rate Forecast ($/tonne)</h3>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '13px' }} formatter={v => [`$${v}`, 'Freight Rate']} />
                    <Line type="monotone" dataKey="rate" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 5, fill: 'white', stroke: '#1D4ED8', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Signal */}
            <div style={{ background: isBuyNow ? 'var(--success-bg)' : 'var(--warning-bg)', border: `1px solid ${isBuyNow ? 'var(--success-border)' : 'var(--warning-border)'}`, borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: isBuyNow ? 'var(--success)' : 'var(--warning)' }}></div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: isBuyNow ? 'var(--success)' : 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Market Signal</p>
              <p style={{ fontSize: '36px', fontWeight: 900, color: isBuyNow ? 'var(--success)' : 'var(--warning)', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1 }}>{result.marketSignal.signal}</p>
              <div style={{ background: 'white', borderRadius: '20px', padding: '4px 14px', marginBottom: '12px', display: 'inline-block' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Confidence: {result.marketSignal.confidence}%</span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.marketSignal.reason}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Vessel Recommendation */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Anchor size={15} color="var(--brand-blue)" /> Vessel Recommendation
              </h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--light-blue-bg)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '8px', padding: '8px 14px', marginBottom: '16px' }}>
                <Ship size={18} color="var(--brand-blue)" />
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-blue)' }}>{result.vesselRecommendation.class}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {[['Draft', result.vesselRecommendation.draftCompatible], ['LOA', result.vesselRecommendation.loaCompatible], ['Beam', result.vesselRecommendation.beamCompatible]].map(([label, ok]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: ok ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: '8px' }}>
                    {ok ? <CheckCircle size={15} color="var(--success)" /> : <XCircle size={15} color="var(--danger)" />}
                    <span style={{ fontSize: '13px', fontWeight: 500, color: ok ? 'var(--success)' : 'var(--danger)' }}>{label} Compatible</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 12px', background: '#EFF6FF', border: '1px solid rgba(29,78,216,0.15)', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                <Info size={14} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{result.vesselRecommendation.reason}</p>
              </div>
            </div>

            {/* Port Time Estimates */}
            <div style={{ gridColumn: '2 / 4', background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="var(--brand-blue)" /> Port Time Estimates
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['Port', 'Waiting Days', 'Discharge Days', 'Total Time'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Port' ? 'left' : 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.portTimeEstimates.map((est, idx) => {
                      const isBest = idx === 0;
                      return (
                        <tr key={est.port} style={{ borderBottom: '1px solid var(--border)', background: isBest ? 'var(--light-blue-bg)' : 'transparent' }}>
                          <td style={{ padding: '10px 12px', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--brand-blue)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isBest && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-blue)', flexShrink: 0 }}></span>}
                            {est.port}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{est.waitingDays}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>{est.dischargeDays}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: isBest ? 'var(--brand-blue)' : 'var(--text-primary)' }}>{est.total} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {result.alternatePort && (
                <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--light-blue-bg)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Ship size={16} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alternate Port Recommendation: </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{result.alternatePort.port}</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{result.alternatePort.reason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Alerts */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={15} color="var(--danger)" /> Risk Alerts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.riskAlerts.map((alert, i) => {
                  const isHigh = alert.severity === 'HIGH';
                  const isMed = alert.severity === 'MEDIUM';
                  const c = isHigh ? 'var(--danger)' : isMed ? 'var(--warning)' : 'var(--success)';
                  const bg = isHigh ? 'var(--danger-bg)' : isMed ? 'var(--warning-bg)' : 'var(--success-bg)';
                  return (
                    <div key={i} style={{ background: bg, borderLeft: `3px solid ${c}`, borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{alert.severity} · {alert.type}</p>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500 }}>{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharterPlanner;
