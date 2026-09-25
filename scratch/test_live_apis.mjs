import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  return fetchPage(url).then(raw => {
    const json = JSON.parse(raw);
    const meta = json.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose || meta.previousClose;
    const change = price - prev;
    const changePercent = prev ? ((change / prev) * 100) : 0;
    return {
      price,
      previousClose: prev,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString()
    };
  });
}

async function fetchTradingEconomics(commodityPath) {
  const html = await fetchPage(`https://tradingeconomics.com/commodity/${commodityPath}`);
  const priceMatch = html.match(/id=["'](?:stream-value|market_last)["'][^>]*>\s*([\d,]+(?:\.\d+)?)/i);
  const changeMatch = html.match(/id=["']stream-change["'][^>]*>\s*([+-]?[\d,]+(?:\.\d+)?)/i);
  const pctMatch = html.match(/id=["']stream-percent["'][^>]*>\s*([+-]?[\d,]+(?:\.\d+)?)/i);
  
  if (priceMatch) {
    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    const change = changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0;
    const changePercent = pctMatch ? parseFloat(pctMatch[1].replace(/,/g, '')) : 0;
    return {
      price,
      change,
      changePercent,
      timestamp: new Date().toISOString()
    };
  }
  throw new Error(`Could not parse price for ${commodityPath}`);
}

async function inspectHtml(path) {
  const html = await fetchPage(`https://tradingeconomics.com/commodity/${path}`);
  const match = html.match(/id=["']market_last["'][^>]*>([^<]+)/i);
  const title = html.match(/<title>([^<]+)<\/title>/i);
  // look for change in the table or headers
  const tablePart = html.match(/<table id=["']markets["'][\s\S]*?<\/table>/i) || html.match(/class=["'][^"']*table[\s\S]*?<\/table>/i);
  return { path, title: title?.[1], marketLast: match?.[1], hasTable: !!tablePart };
}

async function testAll() {
  console.log(await inspectHtml('baltic'));
  console.log(await inspectHtml('coal'));
}

testAll();
