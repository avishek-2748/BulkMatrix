import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS = {
  'Energy & Bunkers':   { border: '#FF7426', accent: '#FF7426', bg: '#FFF1E8' },
  'Foreign Exchange':   { border: '#0B82C9', accent: '#0B82C9', bg: '#EAF6FC' },
  'Macro Currency':     { border: '#168FD0', accent: '#168FD0', bg: '#EAF6FC' },
  'Dry Bulk Freight':   { border: '#0B82C9', accent: '#0B82C9', bg: '#EAF6FC' },
  'Dry Bulk Cargo':     { border: '#FF7426', accent: '#FF7426', bg: '#FFF1E8' },
};

function getColor(category) {
  return CATEGORY_COLORS[category] || { border: '#0B82C9', accent: '#0B82C9', bg: '#EAF6FC' };
}

function formatValue(value, unit) {
  if (!value && value !== 0) return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';

  if (unit === '₹' || unit?.includes('INR')) {
    return num.toFixed(2);
  }
  if (unit === 'Points') {
    return Math.round(num).toLocaleString();
  }
  if (unit?.includes('tonne')) {
    return `$${num.toFixed(2)}`;
  }
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

const SparklineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #D9E6EF',
        borderRadius: '8px',
        padding: '4px 8px',
        fontSize: '11px',
        color: '#122F55',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(18, 47, 85, 0.08)',
      }}>
        {payload[0].value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    );
  }
  return null;
};

const MarketMetricCard = ({ index, loading = false }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #D9E6EF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(18, 47, 85, 0.04)',
        minHeight: '180px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[60, 40, 80, 50].map((w, i) => (
            <div key={i} style={{
              height: '14px',
              width: `${w}%`,
              background: 'linear-gradient(90deg, #F4FAFD 25%, #EAF6FC 50%, #F4FAFD 75%)',
              backgroundSize: '200% 100%',
              borderRadius: '6px',
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
          <div style={{ height: '50px', background: 'linear-gradient(90deg, #F4FAFD 25%, #EAF6FC 50%, #F4FAFD 75%)', backgroundSize: '200% 100%', borderRadius: '8px', animation: 'shimmer 1.4s infinite' }} />
        </div>
      </div>
    );
  }

  if (!index) return null;

  const color = getColor(index.category);
  const isUp = index.changePercent > 0;
  const isDown = index.changePercent < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? '#16A34A' : isDown ? '#DC2626' : '#7890A8';
  const trendBg   = isUp ? '#E8F8EF' : isDown ? '#FEECEC' : '#F4FAFD';
  const lineStroke = isUp ? '#16A34A' : isDown ? '#DC2626' : '#0B82C9';

  return (
    <div
      id={`market-card-${index.id}`}
      onClick={() => navigate(`/market-analysis/${index.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${isHovered ? '#0B82C9' : '#D9E6EF'}`,
        borderLeft: `4px solid ${color.border}`,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: isHovered
          ? '0 8px 26px rgba(18, 47, 85, 0.09)'
          : '0 4px 20px rgba(18, 47, 85, 0.04)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '80px', height: '80px',
        background: color.bg,
        borderRadius: '0 16px 0 80px',
        pointerEvents: 'none',
        opacity: isHovered ? 0.9 : 0.5,
        transition: 'opacity 200ms ease',
      }} />

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: color.accent,
            }}>
              {index.category}
            </span>
            {index.isLive && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: '#E8F8EF',
                color: '#16A34A',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1.5px 6px',
                borderRadius: '10px',
                letterSpacing: '0.04em',
                border: '1px solid #BBF7D0',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  boxShadow: '0 0 0 2px rgba(22,163,74,0.25)',
                  animation: 'pulse-dot 1.5s infinite',
                }} />
                LIVE
              </span>
            )}
          </div>
          <div style={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#122F55',
            lineHeight: 1.3,
          }}>
            {index.name}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: trendBg,
          borderRadius: '999px',
          padding: '3px 8px 3px 6px',
          flexShrink: 0,
          border: `1px solid ${isUp ? '#BBF7D0' : isDown ? '#FECACA' : '#D9E6EF'}`,
        }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: trendColor }}>
            {index.changePercent >= 0 ? '+' : ''}{index.changePercent?.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#122F55',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatValue(index.currentValue, index.unit)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <span style={{ fontSize: '12px', color: '#5F7894' }}>
            {index.unit}
          </span>
          <span style={{ fontSize: '12px', color: '#D9E6EF' }}>·</span>
          <span style={{ fontSize: '12px', color: trendColor, fontWeight: 600 }}>
            {index.change >= 0 ? '+' : ''}{index.change?.toFixed(2)} today
          </span>
        </div>
      </div>

      {/* Sparkline */}
      {index.sparkline && index.sparkline.length > 1 && (
        <div style={{ height: '44px', margin: '0 -4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={index.sparkline}>
              <Tooltip content={<SparklineTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineStroke}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: lineStroke, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '8px',
        borderTop: '1px solid #D9E6EF',
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {index.isLive ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#16A34A',
              fontWeight: 600,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              {index.lastUpdated}
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: '#7890A8' }}>
              Updated {index.lastUpdated}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: isHovered ? '#0B82C9' : '#0B82C9',
          fontSize: '11.5px',
          fontWeight: 700,
          transition: 'transform 150ms ease',
          transform: isHovered ? 'translateX(2px)' : 'none',
        }}>
          View Analysis <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
};

export default MarketMetricCard;
