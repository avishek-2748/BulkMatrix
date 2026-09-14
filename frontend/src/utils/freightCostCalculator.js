/**
 * BulkMatrix Freight Cost Calculator Utility
 * Handles core monetary calculations, currency conversions, multi-destination breakdowns,
 * and safe numeric formatting.
 */

/**
 * Safely parse a value to a non-negative number.
 * @param {number|string} val
 * @param {number} fallback
 * @returns {number}
 */
export const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  return isNaN(num) || num < 0 ? fallback : num;
};

/**
 * Calculate Base Freight Cost = Cargo Volume (tonnes) × Freight Rate ($/tonne)
 * @param {number|string} cargoVolume - In metric tonnes
 * @param {number|string} freightRate - In USD per tonne
 * @returns {number} Base Freight Cost in USD
 */
export const calculateBaseFreightCost = (cargoVolume, freightRate) => {
  const cargo = safeNumber(cargoVolume);
  const rate = safeNumber(freightRate);
  return Math.round(cargo * rate);
};

/**
 * Calculate INR equivalent from USD
 * @param {number|string} usdAmount
 * @param {number|string} exchangeRate - e.g. 83.50
 * @returns {number}
 */
export const calculateInrCost = (usdAmount, exchangeRate) => {
  const usd = safeNumber(usdAmount);
  const rate = safeNumber(exchangeRate, 83.5);
  return Math.round(usd * rate);
};

/**
 * Compare Recommended vs Alternative Option
 * @param {number|string} recommendedRate
 * @param {number|string} alternativeRate
 * @param {number|string} cargoVolume
 * @returns {{
 *   recommendedRate: number,
 *   recommendedCost: number,
 *   alternativeRate: number,
 *   alternativeCost: number,
 *   difference: number,
 *   savingsPercent: number
 * }}
 */
export const calculateCostComparison = (recommendedRate, alternativeRate, cargoVolume) => {
  const cargo = safeNumber(cargoVolume);
  const recRate = safeNumber(recommendedRate);
  const altRate = safeNumber(alternativeRate, recRate > 0 ? recRate + 2 : 23);

  const recommendedCost = Math.round(cargo * recRate);
  const alternativeCost = Math.round(cargo * altRate);
  const difference = alternativeCost - recommendedCost;
  const savingsPercent = alternativeCost > 0
    ? Math.round(((alternativeCost - recommendedCost) / alternativeCost) * 1000) / 10
    : 0;

  return {
    recommendedRate: recRate,
    recommendedCost,
    alternativeRate: altRate,
    alternativeCost,
    difference,
    savingsPercent,
  };
};

/**
 * Calculate freight cost for each destination port
 * @param {Array<{port: string, freightRate?: number}>|string[]} destinations
 * @param {number|string} cargoVolume
 * @param {number|string} defaultRate
 * @returns {Array<{port: string, freightRate: number, estimatedCost: number}>}
 */
export const calculateDestinationCosts = (destinations, cargoVolume, defaultRate = 21.0) => {
  const cargo = safeNumber(cargoVolume);
  const defRate = safeNumber(defaultRate, 21.0);

  if (!Array.isArray(destinations)) return [];

  return destinations.map((item) => {
    let portName = '';
    let rate = defRate;

    if (typeof item === 'string') {
      portName = item;
    } else if (item && typeof item === 'object') {
      portName = item.port || item.port_name || 'Port';
      rate = safeNumber(item.freightRate ?? item.rate_per_tonne ?? item.rate, defRate);
    }

    const estimatedCost = Math.round(cargo * rate);
    return {
      port: portName,
      freightRate: rate,
      estimatedCost,
    };
  });
};

/**
 * Formats a number with comma grouping: e.g. 150000 -> "150,000"
 * @param {number|string} value
 * @returns {string}
 */
export const formatCommaNumber = (value) => {
  const num = safeNumber(value);
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Formats full USD currency with comma grouping: e.g. 3150000 -> "$3,150,000"
 * @param {number|string} value
 * @returns {string}
 */
export const formatUsdCurrency = (value) => {
  const num = safeNumber(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Compact currency representation (e.g. $3.15M, $300,000)
 * Formats values >= 1 million as e.g. "$3.15M"
 * @param {number|string} value
 * @param {string} currency - 'USD' or 'INR'
 * @returns {string}
 */
export const formatCompactCurrency = (value, currency = 'USD') => {
  const num = Number(value);
  if (isNaN(num)) return currency === 'USD' ? '$0' : '₹0';

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const prefix = currency === 'USD' ? '$' : '₹';

  if (abs >= 1_000_000_000) {
    const inBillions = abs / 1_000_000_000;
    const formatted = inBillions.toFixed(2).replace(/\.?0+$/, '');
    return `${sign}${prefix}${formatted}B`;
  }

  if (abs >= 1_000_000) {
    const inMillions = abs / 1_000_000;
    const formatted = inMillions.toFixed(2).replace(/\.?0+$/, '');
    return `${sign}${prefix}${formatted}M`;
  }

  if (abs >= 1_000) {
    return `${sign}${prefix}${new Intl.NumberFormat('en-US').format(Math.round(abs))}`;
  }

  return `${sign}${prefix}${abs.toFixed(2).replace(/\.?0+$/, '')}`;
};

/**
 * Formats Indian Rupee currency with standard Indian numbering system
 * e.g. 263025000 -> "₹26,30,25,000" (or "₹26.30 Cr" in compact mode)
 * @param {number|string} value
 * @param {boolean} compact - If true, formats in Crores/Lakhs
 * @returns {string}
 */
export const formatInrCurrency = (value, compact = false) => {
  const num = safeNumber(value);

  if (compact) {
    if (num >= 10_000_000) {
      // 1 Crore = 10,000,000
      const inCr = (num / 10_000_000).toFixed(2).replace(/\.?0+$/, '');
      return `₹${inCr} Cr`;
    }
    if (num >= 100_000) {
      // 1 Lakh = 100,000
      const inLakh = (num / 100_000).toFixed(2).replace(/\.?0+$/, '');
      return `₹${inLakh} L`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
