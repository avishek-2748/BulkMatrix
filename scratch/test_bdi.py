import urllib.request
import re
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def fetch_live_bdi():
    # Source 1: TradingEconomics
    try:
        url = "https://tradingeconomics.com/commodity/baltic"
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            price_match = re.search(r'id=["\']stream-value["\'][^>]*>\s*([\d,]+(?:\.\d+)?)', html)
            if not price_match:
                price_match = re.search(r'id=["\']market_last["\'][^>]*>\s*([\d,]+(?:\.\d+)?)', html)
            
            change_match = re.search(r'id=["\']stream-percent["\'][^>]*>\s*([+-]?[\d,]+(?:\.\d+)?%?)', html)
            
            if price_match:
                bdi_val = float(price_match.group(1).replace(',', ''))
                change_val = change_match.group(1).strip() if change_match else "+0.0%"
                print(f"[SUCCESS] Source 1 (TradingEconomics): BDI = {bdi_val}, Change = {change_val}")
                return {"bdi": bdi_val, "bdi_trend": change_val, "source": "TradingEconomics"}
    except Exception as e:
        print(f"[WARNING] Source 1 failed: {e}")

    # Source 2: Yahoo Finance API
    try:
        url = "https://query1.finance.yahoo.com/v8/finance/chart/%5EBDI?interval=1d&range=5d"
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            result = data['chart']['result'][0]
            meta = result['meta']
            regular_market_price = meta.get('regularMarketPrice')
            previous_close = meta.get('chartPreviousClose') or meta.get('previousClose')
            
            if regular_market_price:
                pct_change = 0.0
                if previous_close:
                    pct_change = round(((regular_market_price - previous_close) / previous_close) * 100, 2)
                trend_str = f"{'+' if pct_change >= 0 else ''}{pct_change}%"
                print(f"[SUCCESS] Source 2 (Yahoo Finance): BDI = {regular_market_price}, Change = {trend_str}")
                return {"bdi": regular_market_price, "bdi_trend": trend_str, "source": "Yahoo Finance"}
    except Exception as e:
        print(f"[WARNING] Source 2 failed: {e}")

    return {"bdi": 1420, "bdi_trend": "+0.0%", "source": "Fallback Static"}

if __name__ == "__main__":
    res = fetch_live_bdi()
    print("Final Result:", res)
