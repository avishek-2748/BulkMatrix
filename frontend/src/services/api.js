import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach stored JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH APIs
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('bm_token', response.data.token);
  }
  return response.data;
};

export const signup = async (data) => {
  const response = await api.post('/auth/signup', data);
  if (response.data.token) {
    localStorage.setItem('bm_token', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem('bm_token');
  return { message: 'Logged out successfully.' };
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

// BUSINESS APIs
export const getKPIs = async () => {
  const response = await api.get('/dashboard/kpis');
  return response.data;
};

export const generateCharterRecommendation = async (data) => {
  const response = await api.post('/charter/recommendation', data);
  return response.data;
};

export const getAllFleet = async () => {
  const response = await api.get('/fleet');
  return response.data;
};

export const getFxAnalytics = async () => {
  const response = await api.get('/analytics/fx');
  return response.data;
};

// MARKET ANALYSIS APIs (Supports Live Feed)
export const getMarketOverview = async (refresh = false) => {
  const response = await api.get('/market-analysis/overview', {
    params: refresh ? { refresh: 'true' } : {},
  });
  return response.data;
};

export const getMarketIndexDetail = async (indexKey, range = '30d', refresh = false) => {
  const response = await api.get(`/market-analysis/${indexKey}`, {
    params: { range, ...(refresh ? { refresh: 'true' } : {}) },
  });
  return response.data;
};


export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const updateAisPosition = async (data) => {
  const response = await api.post('/admin/ais', data);
  return response.data;
};

// OWNER / VESSEL APIs
export const addVessel = async (data) => {
  const response = await api.post('/vessels', data);
  return response.data;
};

export const getMyVessels = async () => {
  const response = await api.get('/vessels');
  return response.data;
};

export const getVesselById = async (id) => {
  const response = await api.get(`/vessels/${id}`);
  return response.data;
};

// CONTRACT APIs (Owner)
export const createContractRequest = async (data) => {
  const response = await api.post('/contracts', data);
  return response.data;
};

export const getIncomingRequests = async () => {
  const response = await api.get('/contracts/requests');
  return response.data;
};

export const getActiveContracts = async () => {
  const response = await api.get('/contracts/active');
  return response.data;
};

export const updateContractStatus = async (contractId, status, vesselId = null) => {
  const response = await api.put(`/contracts/${contractId}/status`, { status, vesselId });
  return response.data;
};

export const getMyCharterContracts = async () => {
  const response = await api.get('/contracts/my-contracts');
  return response.data;
};

export const submitHandoverDetails = async (contractId, data) => {
  const response = await api.put(`/contracts/${contractId}/handover`, data);
  return response.data;
};

// CHAT APIs
export const getChatThreads = async () => {
  const response = await api.get('/chat/threads/all');
  return response.data;
};

export const getChatMessages = async (contractId) => {
  const response = await api.get(`/chat/${contractId}`);
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await api.post('/chat', data);
  return response.data;
};

// AVAILABILITY APIs
export const addAvailability = async (data) => {
  const response = await api.post('/availability', data);
  return response.data;
};

export const getAvailability = async (vesselId) => {
  const response = await api.get(`/availability/${vesselId}`);
  return response.data;
};

// AIS LIVE TRACKER API
export const getLiveFleet = async () => {
  const response = await api.get('/ais/live');
  return response.data;
};

export default api;
