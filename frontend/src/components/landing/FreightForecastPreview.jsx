import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

gsap.registerPlugin(ScrollTrigger);

const CHART_DATA = [
  { month: 'Apr', current: 14.2, forecast: 14.5 },
  { month: 'May', current: 13.8, forecast: 14.1 },
  { month: 'Jun', current: 15.1, forecast: 15.4 },
  { month: 'Jul', current: 16.3, forecast: 16.0 },
  { month: 'Aug', current: 15.7, forecast: 15.9 },
  { month: 'Sep', current: 14.9, forecast: 15.2 },
  { month: 'Oct', current: null, forecast: 15.8 },
  { month: 'Nov', current: null, forecast: 16.4 },
  { month: 'Dec', current: null, forecast: 16.1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #CFE0EA',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 14px rgba(19,43,79,0.10)',
      }}
    >
      <div style={{ color: '#132B4F', marginBottom: '6px', fontWeight: 700 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ${p.value?.toFixed(1)}/t
        </div>
      ))}
    </div>
  );
};

const FreightForecastPreview = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const chartRef = useRef(null);
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setChartVisible(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current?.children || [], {
        opacity: 0,
        y: 25,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 80%', once: true },
      });

      ScrollTrigger.create({
        trigger: chartRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => setChartVisible(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="intelligence"
      ref={sectionRef}
      style={{
        background: '#FFFFFF',
        padding: '96px 0',
        borderBottom: '1px solid #D9E5EC',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '56px',
            alignItems: 'center',
          }}
        >
          {/* Left: Text */}
          <div ref={headingRef}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 14px',
                borderRadius: '999px',
                background: '#EAF6FC',
                border: '1px solid #CFE7F5',
                color: '#0B82C9',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '14px',
              }}
            >
              ● MARKET INTELLIGENCE
            </div>
            <h2
              style={{
                fontSize: 'clamp(28px, 3.2vw, 40px)',
                fontWeight: 800,
                color: '#122F55',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              Freight Forecasting & <br />
              <span style={{ color: '#0B82C9' }}>Decision Timing</span>
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#23466B',
                lineHeight: 1.65,
                marginBottom: '26px',
              }}
            >
              Compare current freight spot conditions against multi-week forward curves.
              Identify optimal chartering windows before committing to high-value bulk voyages.
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '3px', background: '#0B82C9', borderRadius: '2px' }} />
                <span style={{ fontSize: '13px', color: '#23466B', fontWeight: 600 }}>Current Rate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '3px', background: '#FF7426', borderRadius: '2px', borderTop: '1px dashed #FF7426' }} />
                <span style={{ fontSize: '13px', color: '#23466B', fontWeight: 600 }}>Forecast</span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#F8FAFC',
                border: '1px solid #D9E6EF',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#5F7894',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B82C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Benchmark freight data from major bulk trade corridors
            </div>
          </div>

          {/* Right: Chart Card */}
          <div
            ref={chartRef}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D9E6EF',
              borderRadius: '16px',
              padding: '28px 24px 20px',
              boxShadow: '0 4px 20px rgba(18,47,85,0.06)',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7890A8', marginBottom: '4px', fontWeight: 700, letterSpacing: '0.06em' }}>
                  INDICATIVE COAL & ORE FREIGHT RATE
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#122F55' }}>
                  $14.9
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#7890A8', marginLeft: '4px' }}>/ tonne</span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EAF6FC',
                  border: '1px solid #CFE7F5',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0B82C9',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Forecast: ↑ Firming
              </div>
            </div>

            {chartVisible && (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B82C9" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0B82C9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7426" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#FF7426" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7EFF5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#7890A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[12, 18]} tick={{ fill: '#7890A8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x="Sep" stroke="#FF7426" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Today', fill: '#FF7426', fontSize: 10, fontWeight: 700 }} />
                  <Area
                    type="monotone"
                    dataKey="current"
                    name="Current Rate"
                    stroke="#0B82C9"
                    strokeWidth={2.5}
                    fill="url(#currentGrad)"
                    connectNulls={false}
                    dot={false}
                    activeDot={{ r: 5, fill: '#0B82C9', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="Forecast"
                    stroke="#FF7426"
                    strokeWidth={2}
                    fill="url(#forecastGrad)"
                    strokeDasharray="5 3"
                    dot={false}
                    activeDot={{ r: 5, fill: '#FF7426', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            <div
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: '#7890A8',
                textAlign: 'center',
              }}
            >
              Australia → India Capesize / Panamax freight model
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreightForecastPreview;
