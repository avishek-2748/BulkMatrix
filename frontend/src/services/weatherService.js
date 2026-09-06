/**
 * weatherService.js
 * Frontend service for Weather Intelligence — calls the backend API.
 * All weather/marine fetching and risk calculation happens server-side.
 */

import api from './api';

/**
 * Fetch the list of all supported Indian ports.
 * @returns {Promise<Array>} Array of port objects
 */
export const fetchPorts = async () => {
  const response = await api.get('/weather/ports');
  return response.data.ports;
};

/**
 * Fetch real-time weather + marine data for a specific port.
 * @param {string} portId - e.g. 'paradip', 'mumbai'
 * @returns {Promise<Object>} Combined weather, marine, risk, and location data
 */
export const fetchPortWeather = async (portId) => {
  const response = await api.get(`/weather/current/${portId}`);
  return response.data;
};