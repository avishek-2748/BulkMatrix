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
  'Energy & Bunkers':   { border: '#F3752F', accent: '#F3752F', bg: 'rgba(243, 117, 47, 0.08)' },
  'Foreign Exchange':   { border: '#4187AB', accent: '#4187AB', bg: 'rgba(65, 135, 171, 0.08)' },
  'Macro Currency':     { border: '#A7DAF1', accent: '#4187AB', bg: 'rgba(65, 135, 171, 0.08)' },
  'Dry Bulk Freight':   { border: '#4187AB', accent: '#4187AB', bg: 'rgba(65, 135, 171, 0.08)' },
  'Dry Bulk Cargo':     { border: '#F3752F', accent: '#F3752F', bg: 'rgba(243, 117, 47, 0.08)' },
};

function getColor(category) {
  return CATEGORY_COLORS[category] || { border: '#4187AB', accent: '#4187AB', bg: 'rgba(65, 135, 171, 0.08)' };
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
        background: '#133056',
        border: '1px solid #DADCEB',
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '11px',
        color: '#FEFFFF',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(19, 48, 86, 0.1)',
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
        background: '#FEFFFF',
        border: '1px solid #DADCEB',
        borderRadius: '12px',
        padding: '20px',
        minHeight: '170px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[60, 40, 80, 50].map((w, i) => (
            <div key={i} style={{
              height: '14px',
              width: `${w}%`,
              background: '#F5FAFE',
              borderRadius: '6px',
            }} />
          ))}
          <div style={{ height: '45px', background: '#F5FAFE', borderRadius: '8px' }} />
        </div>
      </div>
    );
  }

  if (!index) return null;

  const color = getColor(index.category);
  const isUp = index.changePercent > 0;
  const isDown = index.changePercent < 0;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? '#16A34A' : isDown ? '#DC2626' : '#586D85';
  const trendBg   = isUp ? '#F0FDF4' : isDown ? '#FEF2F2' : '#F5FAFE';
  const lineStroke = isUp ? '#16A34A' : isDown ? '#DC2626' : '#4187AB';

  return (
    <div
      id={`market-card-${index.id}`}
      onClick={() => navigate(`/market-analysis/${index.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#FEFFFF',
        border: `1px solid ${isHovered ? '#4187AB' : '#DADCEB'}`,
        borderLeft: `4px solid ${color.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isHovered
          ? '0 6px 20px rgba(19, 48, 86, 0.08)'
          : 'none',
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
        borderRadius: '0 12px 0 80px',
        pointerEvents: 'none',
        opacity: isHovered ? 0.9 : 0.4,
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
                background: '#F0FDF4',
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
                }} />
                LIVE
              </span>
            )}
          </div>
          <div style={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#133056',
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
          border: `1px solid ${isUp ? '#BBF7D0' : isDown ? '#FECACA' : '#DADCEB'}`,
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
          fontSize: '26px',
          fontWeight: 800,
          color: '#133056',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatValue(index.currentValue, index.unit)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <span style={{ fontSize: '12px', color: '#586D85' }}>
            {index.unit}
          </span>
          <span style={{ fontSize: '12px', color: '#DADCEB' }}>·</span>
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
        borderTop: '1px solid #DADCEB',
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
            <span style={{ fontSize: '11px', color: '#586D85' }}>
              Updated {index.lastUpdated}
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#4187AB',
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
