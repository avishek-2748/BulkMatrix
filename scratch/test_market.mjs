import fs from 'fs';
import path from 'path';

function parseCSV(filePath, isFuel = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (isFuel) {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const date = parts[0].trim();
        const val = parseFloat(parts[3]);
        if (!isNaN(val)) {
          rows.push({ date, value: Math.round(val * 100) / 100 });
        }
      }
    } else {
      // Date is first col, price is second col
      // line could be: 2026-08-28,"3,186.00",... or 2026-09-04,94.49,...
      let date = '';
      let priceStr = '';
      if (line.startsWith('"')) {
        // unlikely for date
      } else {
        const firstComma = line.indexOf(',');
        if (firstComma !== -1) {
          date = line.substring(0, firstComma).trim();
          const rest = line.substring(firstComma + 1).trim();
          if (rest.startsWith('"')) {
            const nextQuote = rest.indexOf('"', 1);
            if (nextQuote !== -1) {
              priceStr = rest.substring(1, nextQuote);
            }
          } else {
            const nextComma = rest.indexOf(',');
            priceStr = nextComma !== -1 ? rest.substring(0, nextComma) : rest;
          }
        }
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
  return rows;
}

const files = {
  fuel: { path: 'data/raw/dataset_9_bunker_fuel_prices.csv', isFuel: true },
  'usd-inr': { path: 'data/raw/dataset_2_macro_usd_inr_daily.csv', isFuel: false },
  dxy: { path: 'data/raw/dataset_2_macro_dxy_usd_index.csv', isFuel: false },
  bdi: { path: 'data/raw/dataset_1_freight_bdi_daily.csv', isFuel: false },
  coal: { path: 'data/raw/dataset_2_macro_coal_newcastle_daily.csv', isFuel: false },
  'iron-ore': { path: 'data/raw/dataset_2_macro_iron_ore_daily.csv', isFuel: false }
};

for (const [key, info] of Object.entries(files)) {
  const rows = parseCSV(info.path, info.isFuel);
  console.log(key, 'parsed count:', rows.length, 'latest:', rows[0], 'oldest:', rows[rows.length - 1]);
}
