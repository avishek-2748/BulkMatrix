import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLiveMarketData } from './liveMarketFeedService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Index configurations and mapping to raw CSV files
const INDEX_CONFIG = {
  fuel: {
    id: 'fuel',
    name: 'Fuel Price Index',
    code: 'BUNKER-HSFO',
    unit: '$/tonne',
    category: 'Energy & Bunkers',
    description: 'Singapore 380 CST HSFO & VLSFO Maritime Bunker Benchmark',
    filename: 'dataset_9_bunker_fuel_prices.csv',
    isFuel: true,
  },
  'usd-inr': {
    id: 'usd-inr',
    name: 'USD-INR Index',
    code: 'USD/INR',
    unit: '₹',
    category: 'Foreign Exchange',
    description: 'US Dollar to Indian Rupee (USD/INR) Spot Exchange Benchmark',
    filename: 'dataset_2_macro_usd_inr_daily.csv',
    isFuel: false,
  },
  dxy: {
    id: 'dxy',
    name: 'DXY-USD Index',
    code: 'DXY',
    unit: 'Points',
    category: 'Macro Currency',
    description: 'US Dollar Currency Index against major international currencies',
    filename: 'dataset_2_macro_dxy_usd_index.csv',
    isFuel: false,
  },
  bdi: {
    id: 'bdi',
    name: 'Baltic Dry Index (BDI)',
    code: 'BDI',
    unit: 'Points',
    category: 'Dry Bulk Freight',
    description: 'Baltic Exchange Global Dry Bulk Shipping Freight Benchmark',
    filename: 'dataset_1_freight_bdi_daily.csv',
    isFuel: false,
  },
  coal: {
    id: 'coal',
    name: 'Coal Price Index',
    code: 'COAL-NC',
    unit: '$/tonne',
    category: 'Dry Bulk Cargo',
    description: 'Newcastle Thermal Coal FOB Spot Export Benchmark',
    filename: 'dataset_2_macro_coal_newcastle_daily.csv',
    isFuel: false,
  },
  'iron-ore': {
    id: 'iron-ore',
    name: 'Iron Ore Price Index',
    code: 'IRON-ORE-62',
    unit: '$/tonne',
    category: 'Dry Bulk Cargo',
    description: 'Iron Ore Fines 62% Fe CFR Spot Benchmark',
    filename: 'dataset_2_macro_iron_ore_daily.csv',
    isFuel: false,
  },
};

// In-memory cache for parsed datasets
const _dataCache = {};

function resolveDataFilePath(filename) {
  const potentialPaths = [
    path.resolve(process.cwd(), 'data/raw', filename),
    path.resolve(process.cwd(), '../data/raw', filename),
    path.resolve(__dirname, '../../data/raw', filename),
    path.resolve(__dirname, '../../../data/raw', filename),
  ];

  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function parseCSV(filePath, isFuel = false) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (isFuel) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const date = parts[0].trim();
        const val = parseFloat(parts[3]);
        if (!isNaN(val) && date) {
          rows.push({ date, value: Math.round(val * 100) / 100 });
        }
      }
    } else {
      const firstComma = line.indexOf(',');
      if (firstComma !== -1) {
        const date = line.substring(0, firstComma).trim();
        const rest = line.substring(firstComma + 1).trim();
        let priceStr = '';
        if (rest.startsWith('"')) {
          const nextQuote = rest.indexOf('"', 1);
          if (nextQuote !== -1) {
            priceStr = rest.substring(1, nextQuote);
          }
        } else {
          const nextComma = rest.indexOf(',');
          priceStr = nextComma !== -1 ? rest.substring(0, nextComma) : rest;
        }

        if (date && priceStr) {
          const cleanPrice = priceStr.replace(/,/g, '').trim();
          const val = parseFloat(cleanPrice);
          if (!isNaN(val)) {
            rows.push({ date, value: Math.round(val * 100) / 100 });
          }
        }
      }
    }
  }

  // Ensure sorting: descending by date (most recent first)
  rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  return rows;
}

function loadDataset(key) {
  if (_dataCache[key]) return _dataCache[key];

  const config = INDEX_CONFIG[key];
  if (!config) return [];

  const filePath = resolveDataFilePath(config.filename);
  if (!filePath) {
    console.warn(`[MarketDataService] CSV file not found for ${key}: ${config.filename}`);
    return [];
  }

  const rows = parseCSV(filePath, config.isFuel);
  _dataCache[key] = rows;
  return rows;
}

// Helper to filter dates relative to the latest available record
function filterByRange(rows, range = '30d') {
  if (!rows || rows.length === 0) return [];
  const latestDate = new Date(rows[0].date);
  let cutoffDate = new Date(latestDate);

  const lowerRange = (range || '30d').toLowerCase();
  switch (lowerRange) {
    case '7d':
      cutoffDate.setDate(latestDate.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(latestDate.getDate() - 30);
      break;
    case '3m':
      cutoffDate.setMonth(latestDate.getMonth() - 3);
      break;
    case '6m':
      cutoffDate.setMonth(latestDate.getMonth() - 6);
      break;
    case '1y':
      cutoffDate.setFullYear(latestDate.getFullYear() - 1);
      break;
    case 'max':
      return rows;
    default:
      cutoffDate.setDate(latestDate.getDate() - 30);
  }

  const filtered = rows.filter((r) => new Date(r.date) >= cutoffDate);
  // If too few items match (e.g. 7d had weekend gap), ensure at least 5 points
  if (filtered.length < 5 && rows.length >= 5) {
    return rows.slice(0, 5);
  }
  return filtered;
}

function calculateVolatility(values) {
  if (!values || values.length < 2) return 0;
  const n = values.length;
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  // Relative volatility in percentage
  const relVol = mean > 0 ? (stdDev / mean) * 100 : 0;
  return Math.round(relVol * 100) / 100;
}

export const getMarketOverviewData = async (forceRefresh = false) => {
  // Attempt to fetch real-time live quotes (cached for 2 minutes)
  let liveQuotes = {};
  try {
    liveQuotes = await fetchLiveMarketData(forceRefresh);
  } catch (e) {
    console.warn('[MarketDataService] Live fetch failed, using CSV fallback:', e.message);
  }

  const indicesList = [];
  const conditions = [];

  for (const [key, cfg] of Object.entries(INDEX_CONFIG)) {
    const rawData = loadDataset(key);
    const live = liveQuotes[key];

    if (!rawData || rawData.length === 0) {
      indicesList.push({
        id: cfg.id,
        name: cfg.name,
        code: cfg.code,
        unit: cfg.unit,
        category: cfg.category,
        currentValue: live ? live.price : 0,
        previousValue: 0,
        change: live ? live.change : 0,
        changePercent: live ? live.changePercent : 0,
        trend: 'neutral',
        lastUpdated: live ? 'Live Feed' : 'N/A',
        isLive: !!live,
        source: live ? live.source : 'None',
        sparkline: [],
        description: cfg.description,
      });
      continue;
    }

    let current = rawData[0].value;
    let prev = rawData.length > 1 ? rawData[1].value : current;
    let change = Math.round((current - prev) * 100) / 100;
    let changePercent = prev !== 0 ? Math.round(((current - prev) / prev) * 10000) / 100 : 0;
    let lastUpdated = rawData[0].date;
    let isLive = false;
    let source = 'Historical Dataset';

    // If live API returned data for this index, override current value with live data
    if (live && typeof live.price === 'number') {
      current = live.price;
      prev = rawData[0].value; // Previous trading day close from dataset
      if (live.change !== 0) {
        change = live.change;
        changePercent = live.changePercent;
      } else {
        change = Math.round((current - prev) * 100) / 100;
        changePercent = prev !== 0 ? Math.round(((current - prev) / prev) * 10000) / 100 : 0;
      }
      isLive = true;
      source = live.source;
      lastUpdated = 'Live Feed (' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ')';
    }

    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    // 14-day sparkline (chronological order for line chart)
    const sparklineRows = rawData.slice(0, 14).reverse();
    const sparkline = sparklineRows.map((r) => ({
      date: r.date,
      value: r.value,
    }));
    // If live, add live tick at end of sparkline
    if (isLive) {
      sparkline.push({
        date: 'Live',
        value: current,
      });
    }

    indicesList.push({
      id: cfg.id,
      name: cfg.name,
      code: cfg.code,
      unit: cfg.unit,
      category: cfg.category,
      currentValue: current,
      previousValue: prev,
      change,
      changePercent,
      trend,
      lastUpdated,
      isLive,
      source,
      sparkline,
      description: cfg.description,
    });

    const dirWord = changePercent >= 0 ? 'gained' : 'declined';
    const absPct = Math.abs(changePercent).toFixed(2);
    const liveTag = isLive ? ' [LIVE]' : '';
    conditions.push(`${cfg.name}${liveTag} ${dirWord} ${absPct}% to ${current.toLocaleString()} ${cfg.unit} (${source}).`);
  }

  const anyLive = indicesList.some((idx) => idx.isLive);

  return {
    indices: indicesList,
    marketConditions: conditions,
    summary: anyLive
      ? 'Live market indicators synchronized with real-time trading feeds (TradingEconomics & Yahoo Finance).'
      : 'Market conditions reflect real-world spot commodity & dry bulk shipping indicators.',
    isLive: anyLive,
    lastUpdated: anyLive ? 'Real-Time Live Feed' : indicesList[0]?.lastUpdated || new Date().toISOString().split('T')[0],
  };
};

export const getMarketIndexDetailData = async (indexKey, range = '30d', forceRefresh = false) => {
  const config = INDEX_CONFIG[indexKey];
  if (!config) {
    throw new Error(`Unknown market indicator: ${indexKey}`);
  }

  // Attempt live quote
  let liveQuote = null;
  try {
    const liveQuotes = await fetchLiveMarketData(forceRefresh);
    liveQuote = liveQuotes[indexKey] || null;
  } catch (e) {
    console.warn(`[MarketDataService] Live quote fetch failed for ${indexKey}:`, e.message);
  }

  const rawRows = loadDataset(indexKey);
  let allRows = [...rawRows];

  // If live data exists, inject as the latest point
  if (liveQuote && typeof liveQuote.price === 'number') {
    const todayStr = new Date().toISOString().split('T')[0];
    const prevClose = allRows.length > 0 ? allRows[0].value : liveQuote.price;
    const diff = Math.round((liveQuote.price - prevClose) * 100) / 100;
    const diffPct = prevClose !== 0 ? Math.round(((liveQuote.price - prevClose) / prevClose) * 10000) / 100 : 0;

    allRows.unshift({
      date: `${todayStr} (Live)`,
      value: liveQuote.price,
      isLive: true,
      liveSource: liveQuote.source,
      change: liveQuote.change !== 0 ? liveQuote.change : diff,
      changePercent: liveQuote.changePercent !== 0 ? liveQuote.changePercent : diffPct,
    });
  }

  if (!allRows || allRows.length === 0) {
    return {
      id: config.id,
      name: config.name,
      code: config.code,
      unit: config.unit,
      category: config.category,
      description: config.description,
      range,
      currentValue: 0,
      previousValue: 0,
      change: 0,
      changePercent: 0,
      highest: 0,
      lowest: 0,
      average: 0,
      volatility: 0,
      lastUpdated: 'N/A',
      isLive: false,
      data: [],
      chartData: [],
    };
  }

  const filteredRows = filterByRange(allRows, range);
  const values = filteredRows.map((r) => r.value);
  const currentValue = filteredRows[0].value;
  const previousValue = filteredRows.length > 1 ? filteredRows[1].value : currentValue;

  // Comparison over the entire selected period
  const periodStartValue = filteredRows[filteredRows.length - 1].value;
  const change = Math.round((currentValue - periodStartValue) * 100) / 100;
  const changePercent = periodStartValue !== 0 ? Math.round(((currentValue - periodStartValue) / periodStartValue) * 10000) / 100 : 0;

  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const average = Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100;
  const volatility = calculateVolatility(values);

  // Build historical table rows with row-by-row daily changes
  const data = [];
  for (let i = 0; i < filteredRows.length; i++) {
    const row = filteredRows[i];
    const prevRow = i < filteredRows.length - 1 ? filteredRows[i + 1] : row;
    const rowChange = row.change !== undefined ? row.change : Math.round((row.value - prevRow.value) * 100) / 100;
    const rowChangePercent = row.changePercent !== undefined ? row.changePercent : (prevRow.value !== 0 ? Math.round(((row.value - prevRow.value) / prevRow.value) * 10000) / 100 : 0);

    data.push({
      date: row.date,
      value: row.value,
      change: rowChange,
      changePercent: rowChangePercent,
      isLive: !!row.isLive,
    });
  }

  // Chart data: chronological (oldest to newest)
  let chartRows = [...filteredRows].reverse();
  if (chartRows.length > 300) {
    const step = Math.ceil(chartRows.length / 300);
    const sampled = [];
    for (let i = 0; i < chartRows.length; i += step) {
      sampled.push(chartRows[i]);
    }
    // Always include latest
    if (sampled[sampled.length - 1] !== chartRows[chartRows.length - 1]) {
      sampled.push(chartRows[chartRows.length - 1]);
    }
    chartRows = sampled;
  }

  const chartData = chartRows.map((r) => ({
    date: r.date,
    value: r.value,
    isLive: !!r.isLive,
  }));

  return {
    id: config.id,
    name: config.name,
    code: config.code,
    unit: config.unit,
    category: config.category,
    description: config.description,
    range,
    currentValue,
    previousValue,
    periodStartValue,
    change,
    changePercent,
    highest,
    lowest,
    average,
    volatility,
    lastUpdated: filteredRows[0].date,
    isLive: !!liveQuote,
    source: liveQuote ? liveQuote.source : 'Historical Benchmark Data',
    data,
    chartData,
  };
};

export default {
  INDEX_CONFIG,
  getMarketOverviewData,
  getMarketIndexDetailData,
};
