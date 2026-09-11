import * as mockDataService from './mockDataService.js';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

/**
 * Abstraction layer for ML integration.
 * Proxies requests to Python FastAPI server (http://localhost:8000),
 * with automatic fallback to mockDataService if the Python server is offline.
 */

export const getForecast = async (params) => {
  try {
    const res = await fetch(`${ML_API_URL}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('⚠️ ML API offline, using mock forecast fallback:', error.message);
  }
  const recommendation = await mockDataService.generateRecommendation(params);
  return recommendation.forecast;
};

const normalizeRecommendation = (data, params) => {
  if (!data) data = {};
  
  // Extract forecast rates
  let currentRate = 22.5;
  let forecast15 = 23.1;
  let forecast30 = 24.5;
  let forecast90 = 22.0;

  if (data.forecasts && Array.isArray(data.forecasts)) {
    const f15 = data.forecasts.find(f => f.horizon === 15);
    const f30 = data.forecasts.find(f => f.horizon === 30);
    const f90 = data.forecasts.find(f => f.horizon === 90);
    if (f15?.prediction) forecast15 = f15.prediction;
    if (f30?.prediction) forecast30 = f30.prediction;
    if (f90?.prediction) forecast90 = f90.prediction;
    if (f15?.lower_bound) currentRate = f15.lower_bound;
  } else if (data.forecast) {
    currentRate = data.forecast.currentRate ?? currentRate;
    forecast15 = data.forecast.forecast15 ?? forecast15;
    forecast30 = data.forecast.forecast30 ?? forecast30;
    forecast90 = data.forecast.forecast90 ?? forecast90;
  }

  // Vessel recommendation
  const vRec = data.vessel_recommendation || data.vesselRecommendation || {};
  const vesselClass = vRec.class || vRec.recommended_class || (Number(params.cargo_volume_tonnes || params.cargo_volume || 75000) > 100000 ? "CAPESIZE" : "PANAMAX");

  // Market signal
  const mSig = data.buy_hold_signal || data.marketSignal || {};
  const rawSig = mSig.signal || "BUY NOW";
  const signalText = rawSig === "BUY" ? "BUY NOW" : rawSig === "HOLD" ? "WAIT" : rawSig;
  const rawConf = mSig.confidence ?? 0.85;
  const confidenceVal = Math.round(rawConf <= 1 ? rawConf * 100 : rawConf);

  // Port times
  const rawPorts = data.port_times || data.portTimeEstimates || [];
  const portsList = (Array.isArray(params.destination_ports) && params.destination_ports.length > 0)
    ? params.destination_ports
    : [params.destination_ports || "Paradip"];

  const portTimeEstimates = portsList.map(portName => {
    const found = rawPorts.find(p => (p.port || p.port_name || '').toLowerCase().includes(String(portName).toLowerCase()));
    const waitingDays = found ? (found.waiting_days || found.waitingDays || 2) : 2;
    const dischargeDays = found ? (found.discharge_days || found.dischargeDays || 3) : 3;
    return {
      port: String(portName),
      waitingDays,
      dischargeDays,
      total: waitingDays + dischargeDays
    };
  });

  // Risk alerts
  const riskAlerts = (data.risk_alerts || data.riskAlerts || []).map(r => ({
    type: r.type || 'Weather Risk',
    severity: r.severity || 'HIGH',
    message: r.message || r.description || 'Monsoon/Cyclone risk observed for East Coast ports'
  }));
  if (riskAlerts.length === 0) {
    riskAlerts.push({ type: 'Congestion', severity: 'MEDIUM', message: 'Moderate waiting queue observed at destination berth.' });
  }

  // Multi-Vessel Fleet Optimization properties
  const reqCargo = Number(params.cargo_volume_tonnes || params.cargo_volume || 75000);
  let singleCap = Number(data.single_vessel_capacity || data.singleVesselCapacity || 0);
  if (!singleCap) {
    if (vesselClass === "CAPESIZE") singleCap = 180000;
    else if (vesselClass === "PANAMAX") singleCap = 82000;
    else if (vesselClass === "SUPRAMAX") singleCap = 64000;
    else singleCap = 40000;
  }
  const multiReq = (data.multi_vessel_required !== undefined) ? data.multi_vessel_required : (reqCargo > singleCap);
  const capShortfall = (data.capacity_shortfall !== undefined) ? data.capacity_shortfall : Math.max(0, reqCargo - singleCap);

  return {
    forecast: {
      currentRate,
      forecast15,
      forecast30,
      forecast90,
      trend: forecast30 > currentRate ? 'up' : 'down'
    },
    vesselRecommendation: {
      class: vesselClass,
      draftCompatible: vRec.draftCompatible ?? true,
      loaCompatible: vRec.loaCompatible ?? true,
      beamCompatible: vRec.beamCompatible ?? true,
      reason: vRec.reason || `${vesselClass} is recommended for optimal draft compatibility and payload efficiency.`
    },
    multiVesselRequired: multiReq,
    singleVesselCapacity: singleCap,
    capacityShortfall: capShortfall,
    optimalFleet: data.optimal_fleet || data.optimalFleet || null,
    alternativeFleets: data.alternative_fleets || data.alternativeFleets || [],
    marketSignal: {
      signal: signalText,
      confidence: confidenceVal,
      reason: mSig.reason || "Freight rates are forecasted to rise over the next 30 days."
    },

    portTimeEstimates,
    riskAlerts,
    alternatePort: data.alternatePort || null
  };
};

export const getCharterRecommendation = async (params) => {
  try {
    const pyPayload = {
      cargo_volume: Number(params.cargo_volume_tonnes || params.cargo_volume || 75000),
      commodity: params.commodity || 'Coal',
      origin: params.origin_port || params.origin || 'Hay Point',
      destinations: Array.isArray(params.destination_ports) ? params.destination_ports : [params.destination_ports || 'Paradip'],
      contract_type: params.contract_type || 'Spot',
      arrival_window: params.arrival_window_start ? [params.arrival_window_start, params.arrival_window_end] : null,
    };

    const res = await fetch(`${ML_API_URL}/api/charter_recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pyPayload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Received live ML recommendation from FastAPI');
      return normalizeRecommendation(data, params);
    }
  } catch (error) {
    console.warn('⚠️ ML API offline, using mock recommendation fallback:', error.message);
  }
  const mockResult = await mockDataService.generateRecommendation(params);
  return normalizeRecommendation(mockResult, params);
};


export const simulateScenario = async (params) => {
  try {
    const res = await fetch(`${ML_API_URL}/api/analytics/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('⚠️ ML API offline, using mock scenario fallback:', error.message);
  }
  return await mockDataService.runScenario(params);
};

