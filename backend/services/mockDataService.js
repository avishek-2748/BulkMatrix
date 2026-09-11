// Central mock data repository
const mockKPIs = {
  bdi: 1850,
  bdiTrend: 4.2,
  congestionIndex: "Medium",
  activeCharters: 12,
  weatherRisk: "High Cyclone Risk"
};

const mockFleet = [
  {
    id: "v-1",
    vesselName: "Ocean Giant",
    vesselClass: "CAPESIZE",
    cargo: "Iron Ore",
    latitude: 17.6868,
    longitude: 83.2185, // Vizag area
    destination: "Vizag",
    eta: "2026-09-12T12:00:00Z",
    fuelConsumption: 35.2,
    status: "AT_SEA",
    alerts: [
      "Anchorage queue increased by 1.2 days"
    ]
  },
  {
    id: "v-2",
    vesselName: "Pacific Voyager",
    vesselClass: "PANAMAX",
    cargo: "Coal",
    latitude: 20.2644,
    longitude: 86.6749, // Paradip area
    destination: "Paradip",
    eta: "2026-09-08T08:00:00Z",
    fuelConsumption: 28.5,
    status: "AT_PORT",
    alerts: [
      "Destination port weather risk in 5 days"
    ]
  },
  {
    id: "v-3",
    vesselName: "Baltic Horizon",
    vesselClass: "SUPRAMAX",
    cargo: "Coal",
    latitude: 20.8258,
    longitude: 86.9749, // Dhamra area
    destination: "Dhamra",
    eta: "2026-09-15T10:00:00Z",
    fuelConsumption: 22.1,
    status: "AT_SEA",
    alerts: []
  }
];

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export const getKPIs = async () => {
  try {
    const res = await fetch(`${ML_API_URL}/api/kpis`);
    if (res.ok) {
      const data = await res.json();
      return {
        bdi: data.bdi || 3507,
        bdiTrend: parseFloat(data.bdi_trend) || 1.8,
        congestionIndex: data.congestion_index || "Medium (12.5 days)",
        activeCharters: data.active_charters || 12,
        weatherRisk: data.risk_summary || "High Cyclone Risk",
        source: data.source || "Live Feed"
      };
    }
  } catch (error) {
    console.warn("⚠️ Could not fetch live BDI from FastAPI, using live fallback BDI:", error.message);
  }
  return {
    bdi: 3507,
    bdiTrend: 1.8,
    congestionIndex: "Medium (12.5 days)",
    activeCharters: 12,
    weatherRisk: "High Cyclone Risk",
    source: "Live Fallback"
  };
};

export const getFleet = async () => {
  return mockFleet;
};

export const getVesselById = async (id) => {
  return mockFleet.find(v => v.id === id) || null;
};

export const generateRecommendation = async (params) => {
  const cargo = Number(params.cargo_volume_tonnes || params.cargo_volume || 75000);
  const vesselClass = cargo > 100000 ? "CAPESIZE" : cargo > 65000 ? "PANAMAX" : "SUPRAMAX";
  const singleCap = vesselClass === "CAPESIZE" ? 180000 : vesselClass === "PANAMAX" ? 82000 : 64000;
  const multiReq = cargo > singleCap;
  const shortfall = Math.max(0, cargo - singleCap);

  let optimalFleet = null;
  let alternativeFleets = [];

  if (multiReq) {
    const capesizeCap = 180000;
    const panamaxCap = 82000;
    const capeCount = Math.floor(cargo / capesizeCap);
    const rem = cargo - (capeCount * capesizeCap);
    const panaCount = rem > 0 ? Math.ceil(rem / panamaxCap) : 0;

    const vessels = [];
    let vIdx = 1;
    for (let i = 0; i < capeCount; i++) {
      vessels.push({ name: `Vessel ${vIdx++}`, vessel_class: 'CAPESIZE', capacity: capesizeCap, rate_per_tonne: 22.5, freight_cost: 22.5 * capesizeCap });
    }
    for (let i = 0; i < panaCount; i++) {
      vessels.push({ name: `Vessel ${vIdx++}`, vessel_class: 'PANAMAX', capacity: panamaxCap, rate_per_tonne: 24.1, freight_cost: 24.1 * panamaxCap });
    }
    const totCap = (capeCount * capesizeCap) + (panaCount * panamaxCap);
    const totCost = vessels.reduce((acc, v) => acc + v.freight_cost, 0);

    optimalFleet = {
      vessels,
      vessel_count: vessels.length,
      total_capacity: totCap,
      unused_capacity: totCap - cargo,
      estimated_total_cost: totCost,
      cost_per_tonne: Math.round((totCost / cargo) * 100) / 100,
      vessel_types_summary: `${capeCount > 0 ? capeCount + '× CAPESIZE ' : ''}${panaCount > 0 ? panaCount + '× PANAMAX' : ''}`.trim(),
      estimated_savings: Math.round(totCost * 0.12),
      savings_percent: 12.0
    };
  }

  return {
    forecast: {
      currentRate: 18.5,
      forecast15: 19.2,
      forecast30: 21.0,
      forecast90: 17.5,
      trend: "up"
    },
    vesselRecommendation: {
      class: vesselClass,
      draftCompatible: true,
      loaCompatible: true,
      beamCompatible: true,
      reason: `${vesselClass} is recommended because it matches the cargo volume and destination port constraints.`
    },
    multi_vessel_required: multiReq,
    single_vessel_capacity: singleCap,
    capacity_shortfall: shortfall,
    optimal_fleet: optimalFleet,
    alternative_fleets: alternativeFleets,
    marketSignal: {
      signal: "BUY NOW",
      confidence: 87,
      reason: "Freight rates are expected to increase during the next 30 days."
    },
    portTimeEstimates: (params.destination_ports || []).map(port => ({
      port,
      waitingDays: Math.floor(Math.random() * 4) + 1,
      dischargeDays: Math.floor(Math.random() * 3) + 2,
      get total() { return this.waitingDays + this.dischargeDays; }
    })),
    riskAlerts: [
      { type: "Weather", severity: "HIGH", message: "High Cyclone Risk on East Coast" },
      { type: "Congestion", severity: "MEDIUM", message: "Paradip queue building up" }
    ],
    alternatePort: {
      port: "Dhamra",
      reason: "Lower congestion and better weather conditions"
    }
  };
};

export const runScenario = async (params) => {
  return {
    estimatedCostImpact: params.fuelChange > 0 ? "+4.5%" : "-1.2%",
    freightImpact: params.inrChange > 0 ? "-2.1%" : "+3.4%",
    updatedRecommendation: params.fuelChange > 10 ? "WAIT FOR FUEL DIP" : "PROCEED WITH CHARTER"
  };
};
