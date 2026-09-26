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
  bdi:        '#4187AB', // Primary Ocean Blue
  fuel:       '#F3752F', // Energy / Orange
  'usd-inr':  '#4187AB', // Blue
  dxy:        '#A7DAF1', // Light Blue
  coal:       '#F3752F', // Orange
  'iron-ore': '#4187AB', // Blue
};

const MiniOverviewChart = ({ index }) => {
  const [hovered, setHovered] = useState(false);
  if (!index?.sparkline?.length) return null;
  const color = CHART_COLORS[index.id] || '#4187AB';
  const isUp = index.changePercent >= 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FEFFFF',
        border: `1px solid ${hovered ? '#4187AB' : '#DADCEB'}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: hovered
          ? '0 6px 20px rgba(19, 48, 86, 0.08)'
          : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#586D85', marginBottom: '2px', letterSpacing: '0.04em' }}>
            {index.code}
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#133056' }}>
            {index.name.replace(' Index', '').replace(' (BDI)', '')}
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: isUp ? '#16A34A' : '#DC2626',
          background: isUp ? '#F0FDF4' : '#FEF2F2',
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="saas-page-header">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="saas-title">
              Market Analysis
            </h1>
            {overview?.isLive && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE API FEED
              </span>
            )}
          </div>
          <p className="saas-subtitle">
            Real-time bulk cargo market indicators — BDI, fuel, FX, and commodity benchmarks.
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex items-center gap-4">
          <div className="text-right text-xs text-[#586D85] hidden sm:block">
            <div>TradingEconomics & Yahoo Finance</div>
            <div className="text-emerald-600 font-semibold">● Live Stream Synced</div>
          </div>
          <button
            id="refresh-market-btn"
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            className="saas-btn-primary"
          >
            <RefreshCw
              size={14}
              className={refreshing ? 'animate-spin' : ''}
            />
            {refreshing ? 'Updating...' : 'Refresh Live'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-red-700">
          <AlertTriangle size={15} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* === MARKET CONDITIONS SUMMARY === */}
      {!loading && overview?.marketConditions?.length > 0 && (
        <div className="saas-section-alt rounded-2xl p-6 border border-[#DADCEB] space-y-2">
          <div className="text-[11px] font-bold text-[#4187AB] uppercase tracking-wider mb-2">
            Market Conditions Summary
          </div>
          <div className="space-y-1.5">
            {overview.marketConditions.map((cond, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#133056] leading-relaxed">
                <span className="text-[#4187AB] font-bold">•</span>
                <span>{cond}</span>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-[#586D85] pt-2">
            Based on historical datasets. Last updated: {overview.lastUpdated}
          </div>
        </div>
      )}

      {/* === 6 METRIC CARDS === */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-[#133056]">
            Key Market Indicators
          </h2>
          <span className="text-xs text-[#586D85]">
            Click any card to view detailed analysis
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <MarketMetricCard key={i} loading={true} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {indices.map(idx => (
              <MarketMetricCard key={idx.id} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* === COMPACT OVERVIEW TREND CHARTS === */}
      {!loading && indices.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DADCEB]">
          <h2 className="text-base font-bold text-[#133056]">
            14-Day Trend Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
