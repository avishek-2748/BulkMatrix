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

export const getFreightAnalytics = async () => {
  const response = await api.get('/analytics/freight');
  return response.data;
};

export const getCongestionAnalytics = async () => {
  const response = await api.get('/analytics/congestion');
  return response.data;
};

export const getRiskCalendar = async () => {
  const response = await api.get('/analytics/risk-calendar');
  return response.data;
};

export const getCommodityAnalytics = async () => {
  const response = await api.get('/analytics/commodity');
  return response.data;
};

export const getFxAnalytics = async () => {
  const response = await api.get('/analytics/fx');
  return response.data;
};

export const getFuelAnalytics = async () => {
  const response = await api.get('/analytics/fuel');
  return response.data;
};

export const runScenario = async (data) => {
  const response = await api.post('/analytics/scenario', data);
  return response.data;
};

export const getModelPerformance = async () => {
  const response = await api.get('/analytics/model-performance');
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

export default api;
