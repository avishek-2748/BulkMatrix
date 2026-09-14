import { useState, useEffect } from 'react';
import { getModelPerformance } from '../services/api';
import { History, Search, Filter, Download, Eye, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Cpu, Award } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, date: '2026-09-05', route: 'Newcastle → Paradip', cargo: 'Coal', vessel: 'Panamax', predictedRate: 24.50, actualRate: 25.10, trend: 'UP', confidence: 89, recommendation: 'CHARTER NOW', status: 'Completed' },
  { id: 2, date: '2026-09-03', route: 'Hay Point → Vizag', cargo: 'Coal', vessel: 'Supramax', predictedRate: 22.80, actualRate: 22.30, trend: 'STABLE', confidence: 76, recommendation: 'MONITOR', status: 'Completed' },
  { id: 3, date: '2026-09-01', route: 'Port Hedland → Paradip', cargo: 'Iron Ore', vessel: 'Capesize', predictedRate: 31.20, actualRate: 33.40, trend: 'UP', confidence: 91, recommendation: 'CHARTER NOW', status: 'Completed' },
  { id: 4, date: '2026-08-28', route: 'Gladstone → Gangavaram', cargo: 'Coal', vessel: 'Panamax', predictedRate: 23.10, actualRate: 21.90, trend: 'DOWN', confidence: 68, recommendation: 'WAIT', status: 'Completed' },
  { id: 5, date: '2026-08-25', route: 'Baltimore → Haldia', cargo: 'Coal', vessel: 'Supramax', predictedRate: 28.90, actualRate: null, trend: 'UP', confidence: 83, recommendation: 'CHARTER NOW', status: 'Active' },
  { id: 6, date: '2026-08-22', route: 'Maputo → Vizag', cargo: 'Coal', vessel: 'Handysize', predictedRate: 19.50, actualRate: 19.80, trend: 'STABLE', confidence: 72, recommendation: 'MONITOR', status: 'Completed' },
  { id: 7, date: '2026-08-20', route: 'Russia → Paradip', cargo: 'Coal', vessel: 'Panamax', predictedRate: 26.30, actualRate: 27.10, trend: 'UP', confidence: 87, recommendation: 'CHARTER NOW', status: 'Completed' },
  { id: 8, date: '2026-08-18', route: 'Indonesia → Dhamra', cargo: 'Coal', vessel: 'Supramax', predictedRate: 21.70, actualRate: 20.40, trend: 'DOWN', confidence: 61, recommendation: 'WAIT', status: 'Completed' },
];

const REC_STYLES = {
  'CHARTER NOW': { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  'WAIT': { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  'MONITOR': { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
};

const PAGE_SIZE = 6;

const ForecastHistory = () => {
  const [search, setSearch] = useState('');
  const [recFilter, setRecFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modelMetrics, setModelMetrics] = useState([]);

  useEffect(() => {
    getModelPerformance()
      .then(res => {
        if (res && res.metrics) {
          setModelMetrics(res.metrics);
        }
      })
      .catch(err => console.warn('Could not load model performance:', err));
  }, []);


  const filtered = MOCK_HISTORY.filter(r => {
    const matchSearch = search === '' || r.route.toLowerCase().includes(search.toLowerCase()) || r.cargo.toLowerCase().includes(search.toLowerCase()) || r.vessel.toLowerCase().includes(search.toLowerCase());
    const matchRec = recFilter === 'ALL' || r.recommendation === recFilter;
    return matchSearch && matchRec;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const TrendIcon = ({ trend }) => {
    if (trend === 'UP') return <TrendingUp size={14} color="var(--success)" />;
    if (trend === 'DOWN') return <TrendingDown size={14} color="var(--danger)" />;
    return <Minus size={14} color="var(--text-muted)" />;
  };

  const accuracy = r => {
    if (!r.actualRate) return null;
    const pct = Math.abs((r.predictedRate - r.actualRate) / r.actualRate * 100);
    return (100 - pct).toFixed(1);
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={24} color="var(--brand-blue)" /> Forecast History
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Review past freight forecasts, accuracy, and chartering recommendations</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.15s', boxShadow: 'var(--shadow-sm)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--light-blue-bg)'; e.currentTarget.style.borderColor = 'var(--brand-blue)'; e.currentTarget.style.color = 'var(--brand-blue)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Forecasts', value: MOCK_HISTORY.length, color: '#1D4ED8', bg: '#EFF6FF' },
          { label: 'Charter Now', value: MOCK_HISTORY.filter(r=>r.recommendation==='CHARTER NOW').length, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Avg. Confidence', value: `${Math.round(MOCK_HISTORY.reduce((a,r)=>a+r.confidence,0)/MOCK_HISTORY.length)}%`, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Active Forecasts', value: MOCK_HISTORY.filter(r=>r.status==='Active').length, color: '#D97706', bg: '#FFFBEB' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '40px', borderRadius: '5px', background: s.bg, border: `2px solid ${s.color}33`, flexShrink: 0 }}></div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Model Benchmarks Card */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--brand-blue)" /> Production Model Evaluation Metrics (CatBoost vs XGBoost vs LightGBM)
          </h3>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '4px 10px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
            ⭐ CatBoost Selected (Best MAPE)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { horizon: '15-Day Horizon', model: 'CatBoost (Regularized)', mae: '397.07', rmse: '540.56', mape: '20.40%' },
            { horizon: '30-Day Horizon', model: 'CatBoost (Regularized)', mae: '502.24', rmse: '631.75', mape: '26.03%' },
            { horizon: '90-Day Horizon', model: 'CatBoost (Regularized)', mae: '465.33', rmse: '604.78', mape: '24.98%' },
          ].map(m => (
            <div key={m.horizon} style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.horizon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-blue)', background: 'var(--light-blue-bg)', padding: '2px 8px', borderRadius: '6px' }}>{m.model}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>MAE: <strong>{m.mae}</strong></span>
                <span>RMSE: <strong>{m.rmse}</strong></span>
                <span>MAPE: <strong style={{ color: 'var(--success)' }}>{m.mape}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '8px 14px', flex: 1, minWidth: '200px', gap: '8px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search routes, cargo, vessels..." style={{ border: 'none', outline: 'none', fontSize: '13.5px', color: 'var(--text-primary)', background: 'transparent', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-secondary)" />
          {['ALL', 'CHARTER NOW', 'WAIT', 'MONITOR'].map(f => (
            <button key={f} onClick={() => { setRecFilter(f); setPage(1); }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid', borderColor: recFilter === f ? 'var(--brand-blue)' : 'var(--border)', background: recFilter === f ? 'var(--light-blue-bg)' : 'white', color: recFilter === f ? 'var(--brand-blue)' : 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--border)' }}>
                {['Date', 'Route', 'Cargo', 'Vessel', 'Predicted', 'Actual', 'Accuracy', 'Trend', 'Confidence', 'Recommendation', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <History size={28} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p style={{ fontSize: '14px' }}>No matching forecast records found</p>
                  </td>
                </tr>
              ) : paginated.map(r => {
                const rec = REC_STYLES[r.recommendation] || REC_STYLES['MONITOR'];
                const acc = accuracy(r);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '12.5px' }}>{r.date}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.route}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.cargo}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.vessel}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>${r.predictedRate}</td>
                    <td style={{ padding: '12px 16px', color: r.actualRate ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: r.actualRate ? 'normal' : 'italic' }}>{r.actualRate ? `$${r.actualRate}` : 'Pending'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {acc ? <span style={{ fontSize: '12.5px', fontWeight: 700, color: parseFloat(acc) >= 85 ? 'var(--success)' : parseFloat(acc) >= 70 ? 'var(--warning)' : 'var(--danger)' }}>{acc}%</span> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}><TrendIcon trend={r.trend} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, height: '5px', background: '#E2E8F0', borderRadius: '3px', minWidth: '50px' }}>
                          <div style={{ height: '100%', width: `${r.confidence}%`, background: r.confidence >= 80 ? 'var(--success)' : r.confidence >= 65 ? 'var(--warning)' : 'var(--danger)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '30px' }}>{r.confidence}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, background: rec.bg, color: rec.color, border: `1px solid ${rec.border}`, whiteSpace: 'nowrap' }}>{r.recommendation}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--light-blue-bg)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--brand-blue)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--border)', background: '#FAFAFA' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} records
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', background: page===1?'#F8FAFC':'white', cursor: page===1?'not-allowed':'pointer', display: 'flex', alignItems: 'center', color: page===1?'var(--text-muted)':'var(--text-primary)', transition: 'all 0.15s' }}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: '32px', height: '32px', border: `1.5px solid ${page===p?'var(--brand-blue)':'var(--border)'}`, borderRadius: '6px', background: page===p?'var(--brand-blue)':'white', color: page===p?'white':'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>{p}</button>
              ))}
              <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '6px', background: page===totalPages?'#F8FAFC':'white', cursor: page===totalPages?'not-allowed':'pointer', display: 'flex', alignItems: 'center', color: page===totalPages?'var(--text-muted)':'var(--text-primary)', transition: 'all 0.15s' }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastHistory;
