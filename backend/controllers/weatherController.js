/**
 * weatherController.js
 * Handles weather-related API requests.
 */

import INDIAN_PORTS from '../data/indianPorts.js';
import { fetchAllWeatherData } from '../services/weatherService.js';
import { calculateMaritimeRisk } from '../services/riskEngine.js';

/**
 * GET /api/weather/ports
 * Returns the list of all supported Indian ports.
 */
export const getPorts = (req, res) => {
  res.json({
    success: true,
    ports: INDIAN_PORTS.map(({ id, name, city, state, latitude, longitude }) => ({
      id,
      name,
      city,
      state,
      latitude,
      longitude,
    })),
  });
};

/**
 * GET /api/weather/current/:portId
 * Fetches real-time weather + marine data for the selected port,
 * calculates maritime risk, generates dynamic alerts,
 * and returns a combined response.
 */
export const getCurrentWeather = async (req, res) => {
  try {
    const { portId } = req.params;

    // 1. Find the port
    const port = INDIAN_PORTS.find((p) => p.id === portId);

    if (!port) {
      return res.status(404).json({
        success: false,
        message: `Port not found: "${portId}". Use GET /api/weather/ports to see available ports.`,
      });
    }

    // 2. Fetch weather + marine data in parallel
    const { weather, marine } = await fetchAllWeatherData(port.latitude, port.longitude);

    // 3. Calculate risk & generate alerts
    const risk = calculateMaritimeRisk(weather, marine);

    // 4. Return combined response
    res.json({
      success: true,
      location: {
        id: port.id,
        name: port.name,
        city: port.city,
        state: port.state,
        latitude: port.latitude,
        longitude: port.longitude,
      },
      weather,
      marine,
      risk,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('❌ Weather fetch error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch live weather data. Please try again.',
      error: err.message,
    });
  }
};
