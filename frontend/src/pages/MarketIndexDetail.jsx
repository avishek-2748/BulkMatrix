import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { getMarketIndexDetail } from '../services/api';

const RANGE_OPTIONS = [
  { label: '7D',  value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M',  value: '3m' },
  { label: '6M',  value: '6m' },
  { label: '1Y',  value: '1y' },
  { label: 'MAX', value: 'max' },
];

const ROWS_PER_PAGE = 20;

// Official BulkMatrix Category Colors
const CATEGORY_COLORS = {
  'Energy & Bunkers': '#D97706',
  'Foreign Exchange':  '#075CA2',
  'Macro Currency':    '#1591DC',
  'Dry Bulk Freight':  '#0368B8',
  'Dry Bulk Cargo':    '#DC2626',
};

function getAccentColor(category) {
  return CATEGORY_COLORS[category] || '#0368B8';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function formatValue(value, unit) {
  if (value === undefined || value === null || isNaN(Number(value))) return '—';
  const num = Number(value);
  if (unit === 'Points') return Math.round(num).toLocaleString();
  if (unit === '₹') return num.toFixed(2);
  if (unit?.includes('tonne')) return `$${num.toFixed(2)}`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #D3D3D5',
      borderRadius: '8px',
      padding: '10px 14px',
      boxShadow: '0 4px 14px rgba(21, 51, 86, 0.08)',
      fontSize: '13px',
    }}>
      <div style={{ color: '#71859A', marginBottom: '4px', fontSize: '11px' }}>{formatDate(label)}</div>
      <div style={{ fontWeight: 800, color: '#153356', fontSize: '15px' }}>
        {formatValue(payload[0].value, unit)}
        <span style={{ fontSize: '11px', fontWeight: 500, color: '#71859A', marginLeft: '4px' }}>{unit}</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit, highlight }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: highlight ? '#EAF2F6' : '#FFFFFF',
        border: `1px solid ${highlight ? '#CFE5F2' : hovered ? '#CFE5F2' : '#D3D3D5'}`,
        borderRadius: '10px',
        padding: '14px 16px',
        transform: hovered ? 'translateY(-1.5px)' : 'none',
        boxShadow: hovered ? '0 4px 12px rgba(21, 51, 86, 0.05)' : 'none',
        transition: 'all 0.18s ease',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#71859A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: highlight ? '#0368B8' : '#153356', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {value !== undefined && value !== null ? formatValue(value, unit) : '—'}
      </div>
      {unit && (
        <div style={{ fontSize: '11px', color: '#71859A', marginTop: '2px' }}>{unit}</div>
      )}
    </div>
  );
};

const MarketIndexDetail = () => {
  const { indexKey } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [tablePage, setTablePage] = useState(1);

  const fetchData = useCallback(async (range, forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setTablePage(1);
    try {
      const result = await getMarketIndexDetail(indexKey, range, forceRefresh);
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load market data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [indexKey]);

  useEffect(() => {
    fetchData(selectedRange, false);
  }, [fetchData, selectedRange]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  const accentColor = data ? getAccentColor(data.category) : '#0368B8';
  const isUp = data?.changePercent > 0;
  const isDown = data?.changePercent < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? '#16A34A' : isDown ? '#DC2626' : '#71859A';
  const trendBg = isUp ? '#DCFCE7' : isDown ? '#FEF2F2' : '#F7F7F7';

  // Pagination for historical table
  const totalRows = data?.data?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const pagedRows = data?.data?.slice((tablePage - 1) * ROWS_PER_PAGE, tablePage * ROWS_PER_PAGE) || [];

  // Dynamic Y-axis scale calculation
  const yAxisScale = (() => {
    if (!data?.chartData?.length) return { domain: ['auto', 'auto'], ticks: undefined };
    const values = data.chartData.map((d) => d.value).filter((v) => typeof v === 'number' && !isNaN(v));
    if (values.length === 0) return { domain: ['auto', 'auto'], ticks: undefined };

    let min = Math.min(...values);
    let max = Math.max(...values);

    if (min === max) {
      const pad = min !== 0 ? Math.abs(min) * 0.1 : 5;
      min -= pad;
      max += pad;
    }

    const span = max - min;
    const pad = span * 0.07;
    let targetMin = min - pad;
    let targetMax = max + pad;

    if (min >= 0 && targetMin < 0) {
      targetMin = 0;
    }

    const targetSpan = targetMax - targetMin;
    const idealStep = targetSpan / 7.5;

    const exp = Math.floor(Math.log10(idealStep));
    const factor = Math.pow(10, exp);

    const multipliers = [1, 2, 2.5, 5, 10];
    let best = null;

    for (const m of multipliers) {
      const step = parseFloat((m * factor).toPrecision(6));
      let start = Math.floor(targetMin / step) * step;
      let end = Math.ceil(targetMax / step) * step;

      if (min >= 0 && start < 0) {
        start = 0;
      }

      while (start > min) {
        if (min >= 0 && start - step < 0) {
          start = 0;
          break;
        }
        start -= step;
      }
      while (end < max) {
        end += step;
      }

      start = parseFloat(start.toFixed(6));
      end = parseFloat(end.toFixed(6));

      const count = Math.round((end - start) / step) + 1;

      let score = 0;
      if (count === 8) score = 0;
      else if (count === 7 || count === 9) score = 1;
      else if (count === 6) score = 3;
      else if (count === 10) score = 5;
      else score = Math.abs(count - 8) * 4;

      if (!best || score < best.score) {
        const ticks = [];
        for (let v = start; v <= end + (step * 0.01); v += step) {
          ticks.push(parseFloat(v.toFixed(4)));
        }
        best = {
          domain: [ticks[0], ticks[ticks.length - 1]],
          ticks,
          step,
          count: ticks.length,
          score,
        };
      }
    }

    return best || { domain: ['auto', 'auto'], ticks: undefined };
  })();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Breadcrumb & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71859A' }}>
          <Link to="/market-analysis" style={{ color: '#71859A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#0368B8'}
            onMouseLeave={e => e.currentTarget.style.color = '#71859A'}
          >
            <BarChart2 size={13} /> Market Analysis
          </Link>
          <span>/</span>
          <span style={{ color: '#153356', fontWeight: 600 }}>
            {data?.name || indexKey?.toUpperCase()}
          </span>
        </div>

        <button
          id="refresh-index-btn"
          onClick={() => fetchData(selectedRange, true)}
          disabled={loading || refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: refreshing ? '#D9E6EF' : '#FF7426',
            border: 'none',
            borderRadius: '9px', padding: '7px 14px',
            fontSize: '12.5px', fontWeight: 700,
            color: refreshing ? '#7890A8' : '#FFFFFF',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            boxShadow: refreshing ? 'none' : '0 2px 8px rgba(255, 116, 38, 0.28)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            if (!refreshing) {
              e.currentTarget.style.background = '#F5661F';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 116, 38, 0.38)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            if (!refreshing) {
              e.currentTarget.style.background = '#FF7426';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 116, 38, 0.28)';
              e.currentTarget.style.transform = 'none';
            }
          }}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Updating Feed...' : 'Refresh Live Feed'}
        </button>
      </div>

      {/* Back button */}
      <button
        id="market-detail-back-btn"
        onClick={() => navigate('/market-analysis')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#FFFFFF', border: '1px solid #D9E6EF',
          borderRadius: '10px', padding: '8px 14px',
          fontSize: '13px', fontWeight: 600, color: '#122F55',
          cursor: 'pointer', marginBottom: '20px', transition: 'all 0.15s ease',
          boxShadow: '0 1px 3px rgba(18, 47, 85, 0.04)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#F0F8FC';
          e.currentTarget.style.color = '#0B82C9';
          e.currentTarget.style.borderColor = '#0B82C9';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.color = '#122F55';
          e.currentTarget.style.borderColor = '#D9E6EF';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <ArrowLeft size={14} /> Back to Market Analysis
      </button>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={15} color="#DC2626" />
          <span style={{ fontSize: '13.5px', color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* Header Card */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #D3D3D5',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '14px',
        padding: '24px 28px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)',
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334150' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading market data...</span>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: accentColor }}>
                  {data.category} · {data.code}
                </span>
                {data.isLive && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#DCFCE7',
                    color: '#16A34A',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    border: '1px solid #BBF7D0',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#16A34A',
                      animation: 'pulse-dot 1.5s infinite',
                    }} />
                    LIVE FEED
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#153356', margin: 0, letterSpacing: '-0.02em' }}>
                {data.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#334150', margin: '6px 0 0' }}>
                {data.description}
              </p>
              {data.source && (
                <div style={{ fontSize: '11.5px', color: data.isLive ? '#16A34A' : '#71859A', fontWeight: 500, marginTop: '6px' }}>
                  {data.isLive ? '● Source: ' : 'Source: '}{data.source}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: '#153356', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {formatValue(data.currentValue, data.unit)}
                </span>
                <span style={{ fontSize: '14px', color: '#71859A' }}>{data.unit}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trendBg, border: `1px solid ${isUp ? '#BBF7D0' : isDown ? '#FECACA' : '#EAF2F6'}`, borderRadius: '20px', padding: '4px 10px' }}>
                  <TrendIcon size={13} color={trendColor} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: trendColor }}>
                    {data.changePercent >= 0 ? '+' : ''}{data.changePercent?.toFixed(2)}%
                    <span style={{ fontWeight: 500, marginLeft: '4px' }}>over period</span>
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#71859A', marginTop: '6px' }}>
                Last updated: {data.isLive ? 'Live Real-time' : formatDate(data.lastUpdated)}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Chart + Time Range */}
      <div style={{ background: '#FFFFFF', border: '1px solid #D3D3D5', borderRadius: '14px', padding: '24px 28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)' }}>
        {/* Time Range Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#153356', margin: 0 }}>
            Historical Trend
          </h2>
          <div style={{ display: 'flex', gap: '4px', background: '#EAF2F6', borderRadius: '9px', padding: '3px' }}>
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                id={`range-${opt.value}`}
                onClick={() => handleRangeChange(opt.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: selectedRange === opt.value ? '#FFFFFF' : 'transparent',
                  color: selectedRange === opt.value ? accentColor : '#71859A',
                  boxShadow: selectedRange === opt.value ? '0 1px 3px rgba(21, 51, 86, 0.08)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#334150' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '14px' }}>Loading chart...</span>
          </div>
        ) : data?.chartData?.length ? (
          <div style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={accentColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAF2F6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateShort}
                  stroke="#D3D3D5"
                  tick={{ fill: '#71859A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={60}
                />
                <YAxis
                  domain={yAxisScale.domain}
                  ticks={yAxisScale.ticks}
                  stroke="#D3D3D5"
                  tick={{ fill: '#71859A', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (data.unit === 'Points') return Math.round(v).toLocaleString();
                    if (v >= 1000) return v.toLocaleString();
                    if (Number.isInteger(v)) return v.toString();
                    return v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
                  }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip unit={data.unit} />} />
                <ReferenceLine y={data.average} stroke={accentColor} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Avg', position: 'right', fontSize: 10, fill: accentColor }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: accentColor, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71859A', fontSize: '14px' }}>
            No chart data available for this period.
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {data && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#153356', marginBottom: '14px' }}>
            Period Statistics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            <StatCard label="Current" value={data.currentValue} unit={data.unit} highlight={true} />
            <StatCard label="Period Start" value={data.periodStartValue} unit={data.unit} />
            <StatCard label="Highest" value={data.highest} unit={data.unit} />
            <StatCard label="Lowest" value={data.lowest} unit={data.unit} />
            <StatCard label="Average" value={data.average} unit={data.unit} />
            <div style={{ background: trendBg, border: `1px solid ${isUp ? '#BBF7D0' : isDown ? '#FECACA' : '#D3D3D5'}`, borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#71859A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Change %</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: trendColor, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendIcon size={18} />
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent?.toFixed(2)}%
              </div>
              <div style={{ fontSize: '11px', color: '#71859A', marginTop: '2px' }}>over selected period</div>
            </div>
            {data.volatility !== undefined && (
              <div style={{ background: '#FFF8E8', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#71859A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Volatility</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#D97706', letterSpacing: '-0.02em' }}>{data.volatility?.toFixed(2)}%</div>
                <div style={{ fontSize: '11px', color: '#71859A', marginTop: '2px' }}>coefficient of variation</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Data Table */}
      {data?.data?.length > 0 && (
        <div style={{ background: '#FFFFFF', border: '1px solid #D3D3D5', borderRadius: '14px', boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #D3D3D5' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#153356', margin: 0 }}>
              Historical Data
            </h2>
            <span style={{ fontSize: '12px', color: '#71859A' }}>{totalRows.toLocaleString()} records</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7F7F7' }}>
                  {['Date', 'Value', 'Change', 'Change %'].map(h => (
                    <th key={h} style={{
                      padding: '10px 20px', fontSize: '11px', fontWeight: 700,
                      color: '#71859A', textTransform: 'uppercase',
                      letterSpacing: '0.06em', textAlign: h === 'Date' ? 'left' : 'right',
                      borderBottom: '1px solid #D3D3D5',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, idx) => {
                  const rowIsUp = row.change > 0;
                  const rowIsDown = row.change < 0;
                  const rowColor = rowIsUp ? '#16A34A' : rowIsDown ? '#DC2626' : '#71859A';
                  return (
                    <tr
                      key={row.date}
                      style={{
                        borderBottom: idx < pagedRows.length - 1 ? '1px solid #EAF2F6' : 'none',
                        background: row.isLive ? '#F0FDF4' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = row.isLive ? '#DCFCE7' : '#F7F7F7'}
                      onMouseLeave={e => e.currentTarget.style.background = row.isLive ? '#F0FDF4' : 'transparent'}
                    >
                      <td style={{ padding: '10px 20px', fontSize: '13px', color: '#153356', fontWeight: row.isLive ? 700 : 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {row.isLive && (
                            <span style={{
                              background: '#DCFCE7',
                              color: '#16A34A',
                              fontSize: '9.5px',
                              fontWeight: 800,
                              padding: '1.5px 6px',
                              borderRadius: '10px',
                              border: '1px solid #BBF7D0',
                            }}>
                              ● LIVE
                            </span>
                          )}
                          <span>{formatDate(row.date)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, color: '#153356', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {formatValue(row.value, data.unit)} <span style={{ fontWeight: 400, fontSize: '11px', color: '#71859A' }}>{data.unit}</span>
                      </td>
                      <td style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: rowColor, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {row.change >= 0 ? '+' : ''}{row.change?.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 20px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          fontSize: '12px', fontWeight: 700, color: rowColor,
                          background: rowIsUp ? '#DCFCE7' : rowIsDown ? '#FEF2F2' : '#F7F7F7',
                          borderRadius: '20px', padding: '2px 8px',
                          border: `1px solid ${rowIsUp ? '#BBF7D0' : rowIsDown ? '#FECACA' : '#EAF2F6'}`,
                        }}>
                          {row.changePercent >= 0 ? '+' : ''}{row.changePercent?.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid #D3D3D5' }}>
              <span style={{ fontSize: '12px', color: '#71859A' }}>
                Page {tablePage} of {totalPages} · {totalRows.toLocaleString()} records
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setTablePage(p => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  style={{
                    padding: '5px 10px', borderRadius: '7px', border: '1px solid #D3D3D5',
                    background: tablePage === 1 ? '#F7F7F7' : '#FFFFFF',
                    cursor: tablePage === 1 ? 'not-allowed' : 'pointer',
                    color: tablePage === 1 ? '#71859A' : '#153356',
                    display: 'flex', alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (tablePage !== 1) e.currentTarget.style.background = '#EAF2F6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = tablePage === 1 ? '#F7F7F7' : '#FFFFFF'; }}
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = Math.max(1, Math.min(tablePage - 2, totalPages - 4)) + i;
                  if (pg > totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setTablePage(pg)}
                      style={{
                        padding: '5px 10px', borderRadius: '7px', border: `1px solid ${tablePage === pg ? accentColor : '#D3D3D5'}`,
                        background: tablePage === pg ? accentColor : '#FFFFFF',
                        color: tablePage === pg ? '#FFFFFF' : '#153356',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 600, minWidth: '34px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { if (tablePage !== pg) e.currentTarget.style.background = '#EAF2F6'; }}
                      onMouseLeave={e => { if (tablePage !== pg) e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                  disabled={tablePage === totalPages}
                  style={{
                    padding: '5px 10px', borderRadius: '7px', border: '1px solid #D3D3D5',
                    background: tablePage === totalPages ? '#F7F7F7' : '#FFFFFF',
                    cursor: tablePage === totalPages ? 'not-allowed' : 'pointer',
                    color: tablePage === totalPages ? '#71859A' : '#153356',
                    display: 'flex', alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (tablePage !== totalPages) e.currentTarget.style.background = '#EAF2F6'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = tablePage === totalPages ? '#F7F7F7' : '#FFFFFF'; }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketIndexDetail;
