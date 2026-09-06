import { useState, useEffect } from 'react';
import {
  getFreightAnalytics, getCongestionAnalytics, getRiskCalendar,
  getCommodityAnalytics, getFxAnalytics, getFuelAnalytics, runScenario
} from '../services/api';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2, AlertTriangle, Play, Info } from 'lucide-react';

const TABS = ['Freight', 'Congestion', 'Commodity', 'FX', 'Fuel', 'Seasonal Risk', 'Scenarios'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const tooltipStyle = {
  contentStyle: { background: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: 'var(--shadow-md)', fontSize: '13px', color: 'var(--text-primary)' }
};

const getRiskStyle = level => {
  if (level === 'High') return { background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' };
  if (level === 'Medium') return { background: 'rgba(217,119,6,0.1)', color: '#D97706', border: '1px solid rgba(217,119,6,0.2)' };
  return { background: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' };
};

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('Freight');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [freightData, setFreightData] = useState([]);
  const [congestionData, setCongestionData] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [commodityData, setCommodityData] = useState([]);
  const [fxData, setFxData] = useState([]);
  const [fuelData, setFuelData] = useState([]);
  const [scenarioParams, setScenarioParams] = useState({ inrChange: 0, fuelChange: 0 });
  const [scenarioResult, setScenarioResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    Promise.all([
      getFreightAnalytics(), getCongestionAnalytics(), getRiskCalendar(),
      getCommodityAnalytics(), getFxAnalytics(), getFuelAnalytics()
    ]).then(([freight, congestion, risk, commodity, fx, fuel]) => {
      setFreightData(freight); setCongestionData(congestion); setRiskData(risk);
      setCommodityData(commodity); setFxData(fx); setFuelData(fuel);
      setLoading(false);
    }).catch(() => { setError('Failed to fetch analytics data.'); setLoading(false); });
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    try { const r = await runScenario(scenarioParams); setScenarioResult(r); }
    catch (err) { console.error(err); }
    finally { setSimulating(false); }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Market Analytics</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Historical data, seasonal trends, and scenario simulation</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ fontSize: '13.5px', color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '9px 16px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === tab ? '2px solid var(--brand-blue)' : '2px solid transparent',
            background: 'transparent',
            color: activeTab === tab ? 'var(--brand-blue)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            marginBottom: '-2px',
          }}
            onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >{tab}</button>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--shadow-sm)', minHeight: '480px' }}>
        {loading ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={32} color="var(--brand-blue)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Aggregating market data...</p>
          </div>
        ) : (
          <>
            {/* FREIGHT */}
            {activeTab === 'Freight' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Baltic Dry Index & Freight Trends</h2>
                <div style={{ height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={freightData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="bdi" name="BDI" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#1D4ED8', strokeWidth: 2 }} />
                      <Line yAxisId="right" type="monotone" dataKey="coalFreight" name="Coal ($/t)" stroke="#16A34A" strokeWidth={2} dot={{ r: 3 }} />
                      <Line yAxisId="right" type="monotone" dataKey="ironOreFreight" name="Iron Ore ($/t)" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CONGESTION */}
            {activeTab === 'Congestion' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Port Congestion & Turnaround (Days)</h2>
                <div style={{ height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={congestionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="port" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#F8FAFC' }} {...tooltipStyle} />
                      <Legend />
                      <Bar dataKey="waitingDays" name="Waiting Days" fill="#DC2626" radius={[4,4,0,0]} fillOpacity={0.85} />
                      <Bar dataKey="turnaroundTime" name="Turnaround Time" fill="#1D4ED8" radius={[4,4,0,0]} fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* COMMODITY */}
            {activeTab === 'Commodity' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Global Commodity Prices ($/t)</h2>
                <div style={{ height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commodityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                      <Line type="monotone" dataKey="coalPrice" name="Thermal Coal" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#7C3AED', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="ironOrePrice" name="Iron Ore" stroke="#DC2626" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#DC2626', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* FX */}
            {activeTab === 'FX' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Foreign Exchange & DXY</h2>
                <div style={{ height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fxData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 1','dataMax + 1']} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 2','dataMax + 2']} />
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="usdInr" name="USD/INR" stroke="#16A34A" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#16A34A', strokeWidth: 2 }} />
                      <Line yAxisId="right" type="monotone" dataKey="dxy" name="US Dollar Index (DXY)" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#1D4ED8', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* FUEL */}
            {activeTab === 'Fuel' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Bunker Fuel Prices (Singapore $/t)</h2>
                <div style={{ height: '380px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fuelData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="vlsfoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="hsfoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D97706" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 50','dataMax + 50']} />
                      <Tooltip {...tooltipStyle} />
                      <Legend />
                      <Area type="monotone" dataKey="vlsfo" name="VLSFO (0.5% S)" stroke="#1D4ED8" strokeWidth={2.5} fill="url(#vlsfoGrad)" />
                      <Area type="monotone" dataKey="hsfo" name="HSFO (380cst)" stroke="#D97706" strokeWidth={2.5} fill="url(#hsfoGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* SEASONAL RISK */}
            {activeTab === 'Seasonal Risk' && (
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Seasonal Weather & Disruption Risk</h2>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: '820px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(12, 1fr)', gap: '4px', marginBottom: '6px' }}>
                      <div></div>
                      {months.map(m => <div key={m} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m}</div>)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {riskData.map((row, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px repeat(12, 1fr)', gap: '4px', alignItems: 'center' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.region}>{row.region}</div>
                          {months.map(m => {
                            const s = getRiskStyle(row[m]);
                            return (
                              <div key={m} style={{ height: '40px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help', transition: 'transform 0.15s', fontSize: '10px', fontWeight: 700, ...s }}
                                title={`${row.region} in ${m}: ${row[m]} Risk`}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                              >
                                {row[m]?.[0]}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                      {[['var(--success)', 'var(--success-bg)', 'Low Risk'], ['var(--warning)', 'var(--warning-bg)', 'Medium Risk'], ['var(--danger)', 'var(--danger-bg)', 'High Risk']].map(([c, bg, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: bg, border: `1.5px solid ${c}` }}></div>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIOS */}
            {activeTab === 'Scenarios' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Market Scenario Simulator</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Adjust macro indicators to simulate impact on chartering costs.</p>
                  <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      { label: 'INR Change (%)', key: 'inrChange', min: -10, max: 10, step: 0.5 },
                      { label: 'Bunker Fuel Change (%)', key: 'fuelChange', min: -30, max: 30, step: 1 },
                    ].map(s => (
                      <div key={s.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</label>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: scenarioParams[s.key] > 0 ? 'var(--success)' : scenarioParams[s.key] < 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                            {scenarioParams[s.key] > 0 ? '+' : ''}{scenarioParams[s.key]}%
                          </span>
                        </div>
                        <input type="range" min={s.min} max={s.max} step={s.step} value={scenarioParams[s.key]}
                          onChange={e => setScenarioParams({ ...scenarioParams, [s.key]: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: 'var(--brand-blue)', height: '4px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{s.min}%</span><span>0%</span><span>+{s.max}%</span>
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={simulating} style={{ padding: '12px', background: simulating ? '#94A3B8' : 'var(--brand-blue)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: simulating ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: 'var(--shadow-blue)' }}>
                      {simulating ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Simulating...</> : <><Play size={16} /> Run Simulation</>}
                    </button>
                  </form>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {scenarioResult ? (
                    <div style={{ background: 'var(--light-blue-bg)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '14px', padding: '24px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>Simulation Results</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {[['Estimated Cost Impact', scenarioResult.estimatedCostImpact], ['Freight Rate Impact', scenarioResult.freightImpact]].map(([l, v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{l}</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: v.startsWith('+') ? 'var(--danger)' : 'var(--success)' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '14px 16px', background: scenarioResult.updatedRecommendation.includes('WAIT') ? 'var(--warning-bg)' : 'var(--success-bg)', border: `1px solid ${scenarioResult.updatedRecommendation.includes('WAIT') ? 'var(--warning-border)' : 'var(--success-border)'}`, borderRadius: '10px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Adjusted ML Strategy</p>
                        <p style={{ fontSize: '20px', fontWeight: 800, color: scenarioResult.updatedRecommendation.includes('WAIT') ? 'var(--warning)' : 'var(--success)' }}>{scenarioResult.updatedRecommendation}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '2px dashed var(--border)', borderRadius: '14px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Info size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                      <p style={{ fontSize: '13.5px', lineHeight: 1.6 }}>Adjust the sliders and run the simulation to see the predicted impact on your logistics strategy.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
