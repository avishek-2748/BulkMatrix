import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getMarketOverview } from '../services/api';
import MarketMetricCard from '../components/market/MarketMetricCard';

const OVERVIEW_INDICES = ['bdi', 'fuel', 'usd-inr', 'dxy', 'coal', 'iron-ore'];

// Official BulkMatrix Maritime Enterprise Chart Colors
const CHART_COLORS = {
  bdi:        '#0B82C9', // Primary Ocean Blue
  fuel:       '#FF7426', // Energy / Orange
  'usd-inr':  '#0B82C9', // Blue
  dxy:        '#168FD0', // Bright Blue
  coal:       '#FF7426', // Orange
  'iron-ore': '#0B82C9', // Blue
};

const MiniOverviewChart = ({ index }) => {
  const [hovered, setHovered] = useState(false);
  if (!index?.sparkline?.length) return null;
  const color = CHART_COLORS[index.id] || '#0B82C9';
  const isUp = index.changePercent >= 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${hovered ? '#0B82C9' : '#D9E6EF'}`,
        borderRadius: '14px',
        padding: '16px',
        boxShadow: hovered
          ? '0 6px 20px rgba(18, 47, 85, 0.08)'
          : '0 2px 8px rgba(18, 47, 85, 0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#7890A8', marginBottom: '2px', letterSpacing: '0.04em' }}>
            {index.code}
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#122F55' }}>
            {index.name.replace(' Index', '').replace(' (BDI)', '')}
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: isUp ? '#16A34A' : '#DC2626',
          background: isUp ? '#E8F8EF' : '#FEECEC',
          border: `1px solid ${isUp ? '#BBF7D0' : '#FECACA'}`,
          borderRadius: '999px', padding: '2px 8px',
          display: 'flex', alignItems: 'center', gap: '3px',
        }}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {index.changePercent >= 0 ? '+' : ''}{index.changePercent?.toFixed(2)}%
        </span>
      </div>
      <div style={{ height: '56px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={index.sparkline}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MarketAnalysis = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    getMarketOverview(forceRefresh)
      .then(data => {
        setOverview(data);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        setError(err?.response?.data?.error || err.message || 'Failed to load market overview.');
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOverview(false);
  }, []);

  // Filter to get ordered indices
  const getOrderedIndices = () => {
    if (!overview?.indices) return [];
    const indexMap = {};
    for (const idx of overview.indices) indexMap[idx.id] = idx;
    return OVERVIEW_INDICES.map(id => indexMap[id]).filter(Boolean);
  };

  const indices = getOrderedIndices();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#122F55', letterSpacing: '-0.02em', margin: 0 }}>
              Market Analysis
            </h1>
            {overview?.isLive && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#E8F8EF',
                color: '#16A34A',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid #BBF7D0',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  animation: 'pulse-dot 1.5s infinite',
                }} />
                LIVE API FEED
              </span>
            )}
          </div>
          <p style={{ fontSize: '14px', color: '#5F7894', margin: 0 }}>
            Real-time bulk cargo market indicators — BDI, fuel, FX, and commodity benchmarks
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '11.5px',
            color: '#5F7894',
            textAlign: 'right',
            lineHeight: 1.3,
          }}>
            <div>TradingEconomics & Yahoo Finance</div>
            <div style={{ color: '#16A34A', fontWeight: 600 }}>● Live Stream Synced</div>
          </div>
          <button
            id="refresh-market-btn"
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              background: refreshing ? '#D9E6EF' : '#FF7426',
              border: 'none',
              borderRadius: '11px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
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
            <RefreshCw
              size={14}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            {refreshing ? 'Updating...' : 'Refresh Live'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#FEECEC',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertTriangle size={15} color="#DC2626" />
          <span style={{ fontSize: '13.5px', color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* === MARKET CONDITIONS SUMMARY === */}
      {!loading && overview?.marketConditions?.length > 0 && (
        <div style={{
          background: '#EAF6FC',
          border: '1px solid #CFE7F5',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(11, 130, 201, 0.04)',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#0B82C9',
            marginBottom: '4px',
          }}>
            Market Conditions Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {overview.marketConditions.map((cond, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: '#23466B', lineHeight: 1.5 }}>
                <span style={{ color: '#0B82C9', fontWeight: 700, flexShrink: 0 }}>·</span>
                {cond}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#7890A8', marginTop: '4px' }}>
            Based on real historical data from your datasets. Last updated: {overview.lastUpdated}
          </div>
        </div>
      )}

      {/* === 6 METRIC CARDS === */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#122F55', margin: 0 }}>
            Key Market Indicators
          </h2>
          <span style={{ fontSize: '12px', color: '#7890A8' }}>
            Click any card to view detailed analysis
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <MarketMetricCard key={i} loading={true} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {indices.map(idx => (
              <MarketMetricCard key={idx.id} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* === COMPACT OVERVIEW TREND CHARTS === */}
      {!loading && indices.length > 0 && (
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#122F55', marginBottom: '14px', margin: '0 0 14px 0' }}>
            14-Day Trend Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {indices.map(idx => (
              <MiniOverviewChart key={idx.id} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;
