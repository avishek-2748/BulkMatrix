/**
 * riskEngine.js
 * Rule-based maritime risk scoring and dynamic alert generation.
 *
 * Risk Score: 0–100
 * Levels: LOW (0–25), MEDIUM (26–50), HIGH (51–75), CRITICAL (76–100)
 *
 * Alerts are generated dynamically from real data — never hardcoded.
 */

/**
 * Calculate a maritime risk score and generate alerts.
 * @param {Object} weather - Parsed weather data
 * @param {Object} marine  - Parsed marine data
 * @returns {{ score: number, level: string, alerts: Array }}
 */
export function calculateMaritimeRisk(weather, marine) {
  let score = 0;
  const alerts = [];

  // ─── Wave Height Risk ─────────────────────────────
  const waveHeight = marine?.waveHeight ?? 0;

  if (waveHeight >= 6) {
    score += 35;
    alerts.push({
      level: 'CRITICAL',
      title: 'EXTREME WAVE ALERT',
      description: `Wave height at ${waveHeight}m — extremely dangerous for all vessel classes. Port operations may be suspended.`,
    });
  } else if (waveHeight >= 4) {
    score += 25;
    alerts.push({
      level: 'HIGH',
      title: 'HIGH WAVE ALERT',
      description: `Wave height at ${waveHeight}m — hazardous conditions for smaller vessels. Exercise extreme caution.`,
    });
  } else if (waveHeight >= 2.5) {
    score += 15;
    alerts.push({
      level: 'MEDIUM',
      title: 'MODERATE WAVE WARNING',
      description: `Wave height at ${waveHeight}m — moderate swell expected. Monitor conditions closely.`,
    });
  } else if (waveHeight >= 1.5) {
    score += 5;
  }

  // ─── Wind Speed Risk ──────────────────────────────
  const windSpeed = weather?.windSpeed ?? 0;

  if (windSpeed >= 75) {
    score += 35;
    alerts.push({
      level: 'CRITICAL',
      title: 'SEVERE WIND WARNING',
      description: `Wind speed at ${windSpeed} km/h — storm-force winds. All port operations should cease immediately.`,
    });
  } else if (windSpeed >= 50) {
    score += 25;
    alerts.push({
      level: 'HIGH',
      title: 'HIGH WIND WARNING',
      description: `Wind speed at ${windSpeed} km/h — strong gale conditions. Berthing and cargo operations at risk.`,
    });
  } else if (windSpeed >= 35) {
    score += 15;
    alerts.push({
      level: 'MEDIUM',
      title: 'WIND ADVISORY',
      description: `Wind speed at ${windSpeed} km/h — moderate to strong winds. Minor delays possible.`,
    });
  } else if (windSpeed >= 20) {
    score += 5;
  }

  // ─── Precipitation Risk ───────────────────────────
  const precipitation = weather?.precipitation ?? 0;

  if (precipitation >= 10) {
    score += 20;
    alerts.push({
      level: 'HIGH',
      title: 'HEAVY RAIN ALERT',
      description: `Precipitation at ${precipitation} mm/h — heavy rainfall. Visibility severely reduced; cargo loading may be suspended.`,
    });
  } else if (precipitation >= 5) {
    score += 12;
    alerts.push({
      level: 'MEDIUM',
      title: 'RAIN WARNING',
      description: `Precipitation at ${precipitation} mm/h — moderate to heavy rain. Reduced visibility expected.`,
    });
  } else if (precipitation >= 1) {
    score += 5;
    alerts.push({
      level: 'LOW',
      title: 'LIGHT RAIN NOTICE',
      description: `Light precipitation (${precipitation} mm/h) detected. Generally safe for operations.`,
    });
  }

  // ─── Dangerous Weather Code Check ─────────────────
  // Open-Meteo WMO weather codes: 95, 96, 99 = thunderstorm variants
  const weatherCode = weather?.weatherCode ?? 0;

  if (weatherCode >= 95) {
    score += 15;
    alerts.push({
      level: 'HIGH',
      title: 'THUNDERSTORM WARNING',
      description: 'Active thunderstorm conditions detected. Lightning risk — suspend deck operations.',
    });
  }

  // ─── Clamp & Determine Level ──────────────────────
  score = Math.min(Math.max(score, 0), 100);

  let level;
  if (score >= 76) level = 'CRITICAL';
  else if (score >= 51) level = 'HIGH';
  else if (score >= 26) level = 'MEDIUM';
  else level = 'LOW';

  // Sort alerts by severity: CRITICAL first
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  alerts.sort((a, b) => (severityOrder[a.level] ?? 4) - (severityOrder[b.level] ?? 4));

  return { score, level, alerts };
}
