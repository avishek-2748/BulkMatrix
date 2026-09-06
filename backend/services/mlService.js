import * as mockDataService from './mockDataService.js';

/**
 * Abstraction layer for ML integration.
 * Currently proxies requests to the mockDataService.
 * Future: Will use Axios to communicate with External ML API (Python).
 */

export const getForecast = async (params) => {
  // Future: return axios.post(ML_API_URL, params)
  const recommendation = await mockDataService.generateRecommendation(params);
  return recommendation.forecast;
};

export const getCharterRecommendation = async (params) => {
  // Future: proxy to real ML inference logic
  return await mockDataService.generateRecommendation(params);
};

export const simulateScenario = async (params) => {
  // Future: send to ML model for recalculation
  return await mockDataService.runScenario(params);
};
