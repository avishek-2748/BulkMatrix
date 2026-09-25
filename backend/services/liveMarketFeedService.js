import https from 'https';

// Cache for live market quotes (TTL: 2 minutes)
const _liveCache = {
  data: {},
  timestamp: 0,
};
const CACHE_TTL_MS = 120 * 1000; // 2 minutes

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
          ...headers,
        },
        timeout: 6000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(body));
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

/**
 * Fetch Yahoo Finance chart metadata
 */
async function fetchYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?interval=1d&range=5d`;
  const raw = await fetchUrl(url);
  const json = JSON.parse(raw);
  const result = json?.chart?.result?.[0];
  if (!result || !result.meta) {
    throw new Error(`Invalid Yahoo response for ${symbol}`);
  }
  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose || meta.previousClose || price;
  const change = Math.round((price - prev) * 100) / 100;
  const changePercent =
    prev !== 0 ? Math.round(((price - prev) / prev) * 10000) / 100 : 0;

  return {
    price,
    previousClose: prev,
    change,
    changePercent,
    timestamp: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    source: 'Yahoo Finance Real-time Feed',
  };
}

/**
 * Fetch TradingEconomics commodity page
 */
async function fetchTradingEconomicsQuote(commodityPath) {
  const url = `https://tradingeconomics.com/commodity/${commodityPath}`;
  const html = await fetchUrl(url);

  // Extract price
  const priceMatch = html.match(
    /id=["'](?:market_last|stream-value)["'][^>]*>\s*([\d,]+(?:\.\d+)?)/i
  );
  if (!priceMatch) {
    throw new Error(`No price found for ${commodityPath}`);
  }

  const price = parseFloat(priceMatch[1].replace(/,/g, ''));
  const changeMatch = html.match(
    /id=["']stream-change["'][^>]*>\s*([+-]?[\d,]+(?:\.\d+)?)/i
  );
  const pctMatch = html.match(
    /id=["']stream-percent["'][^>]*>\s*([+-]?[\d,]+(?:\.\d+)?)/i
  );

  const change = changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0;
  const changePercent = pctMatch ? parseFloat(pctMatch[1].replace(/,/g, '')) : 0;

  return {
    price,
    change,
    changePercent,
    timestamp: new Date().toISOString(),
    source: 'TradingEconomics Live Feed',
  };
}

/**
 * Fetch all 6 live indicators with individual try/catch
 */
export async function fetchLiveMarketData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _liveCache.timestamp && now - _liveCache.timestamp < CACHE_TTL_MS) {
    return _liveCache.data;
  }

  const results = {};

  // 1. Baltic Dry Index (BDI)
  try {
    const bdi = await fetchTradingEconomicsQuote('baltic');
    results.bdi = {
      price: Math.round(bdi.price),
      change: bdi.change,
      changePercent: bdi.changePercent,
      timestamp: bdi.timestamp,
      source: bdi.source,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] BDI fetch error:', err.message);
  }

  // 2. Coal (Newcastle)
  try {
    const coal = await fetchTradingEconomicsQuote('coal');
    results.coal = {
      price: Math.round(coal.price * 100) / 100,
      change: coal.change,
      changePercent: coal.changePercent,
      timestamp: coal.timestamp,
      source: coal.source,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] Coal fetch error:', err.message);
  }

  // 3. Iron Ore 62%
  try {
    const iron = await fetchTradingEconomicsQuote('iron-ore');
    results['iron-ore'] = {
      price: Math.round(iron.price * 100) / 100,
      change: iron.change,
      changePercent: iron.changePercent,
      timestamp: iron.timestamp,
      source: iron.source,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] Iron Ore fetch error:', err.message);
  }

  // 4. USD to INR
  try {
    const usdinr = await fetchYahooQuote('INR=X');
    results['usd-inr'] = {
      price: Math.round(usdinr.price * 100) / 100,
      change: usdinr.change,
      changePercent: usdinr.changePercent,
      timestamp: usdinr.timestamp,
      source: usdinr.source,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] USD/INR fetch error:', err.message);
  }

  // 5. US Dollar Index (DXY)
  try {
    const dxy = await fetchYahooQuote('DX-Y.NYB');
    results.dxy = {
      price: Math.round(dxy.price * 100) / 100,
      change: dxy.change,
      changePercent: dxy.changePercent,
      timestamp: dxy.timestamp,
      source: dxy.source,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] DXY fetch error:', err.message);
  }

  // 6. Fuel Price Index (Singapore HSFO calibrated to Live Brent Crude BZ=F)
  try {
    const brent = await fetchYahooQuote('BZ=F');
    // Singapore HSFO 380 CST is historically calibrated at ~4.65x Brent per barrel ($/tonne)
    const bunkerPrice = Math.round(brent.price * 4.65 * 100) / 100;
    const bunkerChange = Math.round(brent.change * 4.65 * 100) / 100;
    results.fuel = {
      price: bunkerPrice,
      change: bunkerChange,
      changePercent: brent.changePercent,
      timestamp: brent.timestamp,
      source: `Live Brent Crude ($${brent.price}/bbl) → Bunker HSFO Proxy`,
      isLive: true,
    };
  } catch (err) {
    console.warn('[LiveFeed] Fuel fetch error:', err.message);
  }

  _liveCache.data = results;
  _liveCache.timestamp = Date.now();
  return results;
}

export default {
  fetchLiveMarketData,
};
