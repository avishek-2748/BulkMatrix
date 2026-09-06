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

export const getKPIs = async () => {
  return mockKPIs;
};

export const getFleet = async () => {
  return mockFleet;
};

export const getVesselById = async (id) => {
  return mockFleet.find(v => v.id === id) || null;
};

export const generateRecommendation = async (params) => {
  // Return realistic mock recommendation based on input
  return {
    forecast: {
      currentRate: 18.5,
      forecast15: 19.2,
      forecast30: 21.0,
      forecast90: 17.5,
      trend: "up"
    },
    vesselRecommendation: {
      class: params.cargo_volume_tonnes > 100000 ? "CAPESIZE" : "PANAMAX",
      draftCompatible: true,
      loaCompatible: true,
      beamCompatible: true,
      reason: `${params.cargo_volume_tonnes > 100000 ? "Capesize" : "Panamax"} is recommended because it matches the cargo volume and destination port constraints.`
    },
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
