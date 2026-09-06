/**
 * weatherService.js
 * Fetches real-time weather and marine data from Open-Meteo APIs.
 * Both APIs are free, open-source, and require no API key.
 */

/**
 * Fetch current weather conditions from Open-Meteo Weather Forecast API.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Parsed weather data
 */
export async function fetchWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    precipitation: current.precipitation,
    weatherCode: current.weather_code,
    cloudCover: current.cloud_cover,
  };
}

/**
 * Fetch current marine/wave conditions from Open-Meteo Marine API.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Parsed marine data
 */
export async function fetchMarineData(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'wave_height',
      'wave_direction',
      'wave_period',
      'sea_surface_temperature',
    ].join(','),
    timezone: 'auto',
  });

  const url = `https://marine-api.open-meteo.com/v1/marine?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    // Marine API may not have data for inland ports — return null gracefully
    if (response.status === 400) {
      return {
        waveHeight: null,
        waveDirection: null,
        wavePeriod: null,
        seaTemperature: null,
      };
    }
    throw new Error(`Open-Meteo Marine API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;

  return {
    waveHeight: current.wave_height ?? null,
    waveDirection: current.wave_direction ?? null,
    wavePeriod: current.wave_period ?? null,
    seaTemperature: current.sea_surface_temperature ?? null,
  };
}

/**
 * Fetch both weather and marine data in parallel for a given location.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{weather: Object, marine: Object}>}
 */
export async function fetchAllWeatherData(latitude, longitude) {
  const [weather, marine] = await Promise.all([
    fetchWeatherData(latitude, longitude),
    fetchMarineData(latitude, longitude),
  ]);

  return { weather, marine };
}
