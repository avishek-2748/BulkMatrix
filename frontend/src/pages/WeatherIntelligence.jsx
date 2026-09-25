import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CloudRain, Wind, Thermometer, Eye, Droplets, Waves,
  Navigation, AlertTriangle, RefreshCw, MapPin, Cloud,
  Calendar, ChevronLeft, ChevronRight, Sunrise, Sunset,
  Activity, TrendingUp, Info
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { fetchPorts, fetchPortWeather, fetchPortForecast } from '../services/weatherService';

const REFRESH_INTERVAL = 10 * 60 * 1000;

// ─── WMO Weather Code Helpers ─────────────────────────────────────────────────
const WMO_CODE_MAP = {
  0: { label: 'Clear Sky', emoji: '☀️' },
  1: { label: 'Mainly Clear', emoji: '🌤️' },
  2: { label: 'Partly Cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Icy Fog', emoji: '🌫️' },
  51: { label: 'Light Drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy Drizzle', emoji: '🌧️' },
  61: { label: 'Light Rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy Rain', emoji: '🌧️' },
  71: { label: 'Light Snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy Snow', emoji: '❄️' },
  80: { label: 'Rain Showers', emoji: '🌦️' },
  81: { label: 'Rain Showers', emoji: '🌦️' },
  82: { label: 'Heavy Showers', emoji: '⛈️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm + Hail', emoji: '⛈️' },
  99: { label: 'Thunderstorm + Hail', emoji: '⛈️' },
};

const getWeatherInfo = (code) => {
  if (code === undefined || code === null) return { label: 'Unknown', emoji: '❓' };
  if (WMO_CODE_MAP[code]) return WMO_CODE_MAP[code];
  if (code <= 3) return { label: 'Partly Cloudy', emoji: '⛅' };
  if (code <= 48) return { label: 'Fog', emoji: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', emoji: '🌦️' };
  if (code <= 65) return { label: 'Rain', emoji: '🌧️' };
  if (code <= 67) return { label: 'Freezing Rain', emoji: '🌧️' };
  if (code <= 77) return { label: 'Snow', emoji: '❄️' };
  if (code <= 82) return { label: 'Rain Showers', emoji: '🌦️' };
  if (code >= 95) return { label: 'Thunderstorm', emoji: '⛈️' };
  return { label: 'Unknown', emoji: '❓' };
};

// Wind direction degrees → compass label
const degToCompass = (deg) => {
  if (deg === undefined || deg === null) return '--';
  return ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][
    Math.round(deg / 22.5) % 16
  ];
};

// ─── Risk Styles (Strict BulkMatrix Palette) ──────────────────────────────────
const RISK_COLORS = {
  CRITICAL: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  HIGH:     { color: '#D97706', bg: '#FFF8E8', border: '#FDE68A' },
  MEDIUM:   { color: '#D97706', bg: '#FFF8E8', border: '#FDE68A' },
  LOW:      { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

// ─── Reusable Sub-components ─────────────────────────────────────────────────

const MetricBox = ({ icon: Icon, label, value, unit, color, bg, sub }) => (
  <div
    style={{
      background: '#FFFFFF',
      border: '1px solid #D3D3D5',
      borderRadius: '12px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#F7F7F7';
      e.currentTarget.style.borderColor = '#CFE5F2';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#FFFFFF';
      e.currentTarget.style.borderColor = '#D3D3D5';
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: bg || (color + '15'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={18} color={color} />
    </div>
    <div>
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#71859A',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '2px',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '17px',
          fontWeight: 800,
          color: '#153356',
          lineHeight: 1.2,
          margin: '2px 0 0',
        }}
      >
        {value ?? '--'}{' '}
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#334150' }}>{unit}</span>
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: '#71859A', margin: '2px 0 0' }}>{sub}</p>
      )}
    </div>
  </div>
);

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #D3D3D5',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 14px rgba(21, 51, 86, 0.08)',
        fontSize: '13px',
      }}
    >
      <p style={{ fontWeight: 700, color: '#153356', marginBottom: '4px', margin: 0 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 600, margin: '2px 0 0' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}{' '}
          {unit || entry.unit || ''}
        </p>
      ))}
    </div>
  );
};

// ─── Forecast Data Processing ─────────────────────────────────────────────────

function getHourlyDataForDate(weatherForecast, marineForecast, dateStr) {
  if (!weatherForecast?.time) return [];
  const hours = [];

  weatherForecast.time.forEach((t, i) => {
    if (!t.startsWith(dateStr)) return;
    const hourLabel = t.slice(11, 16); // "HH:MM"
    const marineIdx = marineForecast?.time
      ? marineForecast.time.findIndex((mt) => mt === t)
      : -1;

    hours.push({
      time: hourLabel,
      temp: weatherForecast.temperature_2m?.[i] ?? null,
      feelsLike: weatherForecast.apparent_temperature?.[i] ?? null,
      wind: weatherForecast.wind_speed_10m?.[i] ?? null,
      precip: weatherForecast.precipitation?.[i] ?? null,
      humidity: weatherForecast.relative_humidity_2m?.[i] ?? null,
      cloudCover: weatherForecast.cloud_cover?.[i] ?? null,
      waveHeight: marineIdx >= 0 ? marineForecast.wave_height?.[marineIdx] ?? null : null,
      wavePeriod: marineIdx >= 0 ? marineForecast.wave_period?.[marineIdx] ?? null : null,
    });
  });

  return hours.filter((_, i) => i % 3 === 0);
}

function buildDailySummaries(daily) {
  if (!daily?.time) return [];
  return daily.time.map((dateStr, i) => ({
    date: dateStr,
    tempMax: daily.temperature_2m_max?.[i] ?? null,
    tempMin: daily.temperature_2m_min?.[i] ?? null,
    precipSum: daily.precipitation_sum?.[i] ?? null,
    weatherCode: daily.weather_code?.[i] ?? null,
    windMax: daily.wind_speed_10m_max?.[i] ?? null,
    windGusts: daily.wind_gusts_10m_max?.[i] ?? null,
    sunrise: daily.sunrise?.[i] ?? null,
    sunset: daily.sunset?.[i] ?? null,
  }));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const WeatherIntelligence = () => {
  const [ports, setPorts] = useState([]);
  const [selectedPortId, setSelectedPortId] = useState('paradip');

  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('temperature');
  const [calendarOffset, setCalendarOffset] = useState(0);

  useEffect(() => {
    fetchPorts().then(setPorts).catch(console.error);
  }, []);

  const loadCurrentWeather = useCallback(async () => {
    setLoadingCurrent(true);
    setError(null);
    try {
      const result = await fetchPortWeather(selectedPortId);
      setCurrentData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to fetch live weather data.');
      console.error(err);
    } finally {
      setLoadingCurrent(false);
    }
  }, [selectedPortId]);

  const loadForecast = useCallback(async () => {
    setLoadingForecast(true);
    try {
      const result = await fetchPortForecast(selectedPortId);
      setForecastData(result);
      if (result?.weatherForecast?.daily?.time?.[0]) {
        setSelectedDate(result.weatherForecast.daily.time[0]);
      }
    } catch (err) {
      console.error('Forecast fetch error:', err);
    } finally {
      setLoadingForecast(false);
    }
  }, [selectedPortId]);

  useEffect(() => {
    setCurrentData(null);
    setForecastData(null);
    setCalendarOffset(0);
    loadCurrentWeather();
    loadForecast();
    const interval = setInterval(loadCurrentWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadCurrentWeather, loadForecast]);

  const weather = currentData?.weather;
  const marine = currentData?.marine;
  const risk = currentData?.risk;
  const location = currentData?.location;
  const riskStyle = risk ? RISK_COLORS[risk.level] || RISK_COLORS.LOW : null;

  const dailySummaries = useMemo(
    () => buildDailySummaries(forecastData?.weatherForecast?.daily),
    [forecastData]
  );

  const hourlyData = useMemo(
    () =>
      selectedDate
        ? getHourlyDataForDate(
            forecastData?.weatherForecast?.hourly,
            forecastData?.marineForecast,
            selectedDate
          )
        : [],
    [selectedDate, forecastData]
  );

  const hasMarine = hourlyData.some((h) => h.waveHeight !== null);

  const calendarDays = dailySummaries.slice(calendarOffset, calendarOffset + 7);
  const windDirLabel = degToCompass(weather?.windDirection);

  const CHART_TABS = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'wind', label: 'Wind', icon: Wind },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    ...(hasMarine ? [{ id: 'wave', label: 'Wave', icon: Waves }] : []),
  ];

  const selectedDay = dailySummaries.find((d) => d.date === selectedDate);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '48px' }}>
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#122F55',
              letterSpacing: '-0.02em',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0,
            }}
          >
            <CloudRain size={24} color="#0B82C9" /> Weather Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: '#5F7894', margin: '4px 0 0' }}>
            Live conditions · 16-day forecast · Marine data · Risk assessment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedPortId}
            onChange={(e) => setSelectedPortId(e.target.value)}
            style={{
              padding: '9px 14px',
              border: '1.5px solid #D9E6EF',
              borderRadius: '10px',
              fontSize: '13.5px',
              color: '#122F55',
              background: '#FFFFFF',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
              boxShadow: '0 1px 3px rgba(18, 47, 85, 0.04)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#0B82C9')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D9E6EF')}
          >
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              loadCurrentWeather();
              loadForecast();
            }}
            disabled={loadingCurrent || loadingForecast}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              background: loadingCurrent || loadingForecast ? '#D9E6EF' : '#FF7426',
              color: loadingCurrent || loadingForecast ? '#7890A8' : '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: loadingCurrent || loadingForecast ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: loadingCurrent || loadingForecast ? 'none' : '0 2px 8px rgba(255, 116, 38, 0.28)',
            }}
            onMouseEnter={(e) => {
              if (!loadingCurrent && !loadingForecast) {
                e.currentTarget.style.background = '#F5661F';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 116, 38, 0.38)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingCurrent && !loadingForecast) {
                e.currentTarget.style.background = '#FF7426';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 116, 38, 0.28)';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            <RefreshCw
              size={14}
              style={loadingCurrent || loadingForecast ? { animation: 'spin 1s linear infinite' } : {}}
            />
            {loadingCurrent || loadingForecast ? 'Loading...' : 'Refresh'}
          </button>
          {lastUpdated && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#71859A',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  display: 'inline-block',
                }}
              />
              Live · {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Error Banner ───────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={16} color="#DC2626" />
          <span style={{ fontSize: '13.5px', color: '#DC2626' }}>{error}</span>
          <button
            onClick={loadCurrentWeather}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Loading State ──────────────────────────────────────────────── */}
      {loadingCurrent && !currentData && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '280px',
            gap: '14px',
          }}
        >
          <RefreshCw size={32} color="#0368B8" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: '#334150', fontWeight: 500 }}>
            Loading live weather data...
          </p>
        </div>
      )}

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      {weather && (
        <>
          {/* ROW 1: Risk Score + Current Conditions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Risk Score Card */}
            {risk && riskStyle && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D9E6EF',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(18, 47, 85, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: risk.score > 60 ? '#FF7426' : risk.score > 30 ? '#0B82C9' : '#16A34A',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    marginBottom: '12px',
                  }}
                >
                  <MapPin size={13} color="#0B82C9" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#5F7894' }}>
                    {location?.name || selectedPortId}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '60px',
                    fontWeight: 900,
                    color: '#122F55',
                    lineHeight: 1,
                    marginBottom: '6px',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {risk.score}
                </div>
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#7890A8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '10px',
                  }}
                >
                  Risk Score
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    background: risk.score > 60 ? '#FFF1E8' : risk.score > 30 ? '#EAF6FC' : '#E8F8EF',
                    color: risk.score > 60 ? '#FF7426' : risk.score > 30 ? '#0B82C9' : '#16A34A',
                    border: `1px solid ${risk.score > 60 ? '#FFD8C2' : risk.score > 30 ? '#CFE7F5' : '#BBF7D0'}`,
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                  }}
                >
                  {risk.level}
                </div>
                {location?.city && (
                  <div style={{ fontSize: '11px', color: '#71859A', marginTop: '10px' }}>
                    {location.city}, {location.state}
                  </div>
                )}
              </div>
            )}

            {/* Weather Metrics Grid */}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#153356',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '10px',
                }}
              >
                Live Atmospheric Conditions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <MetricBox
                  icon={Thermometer}
                  label="Temperature"
                  value={weather.temperature != null ? Math.round(weather.temperature) : '--'}
                  unit="°C"
                  color="#DC2626"
                  bg="#FEF2F2"
                />
                <MetricBox
                  icon={Wind}
                  label="Wind Speed"
                  value={weather.windSpeed != null ? Math.round(weather.windSpeed) : '--'}
                  unit="km/h"
                  color="#0368B8"
                  bg="#D5E9F8"
                  sub={`Direction: ${windDirLabel}`}
                />
                <MetricBox
                  icon={CloudRain}
                  label="Precipitation"
                  value={weather.precipitation != null ? weather.precipitation.toFixed(1) : '--'}
                  unit="mm"
                  color="#1591DC"
                  bg="#DDF3F6"
                />
                <MetricBox
                  icon={Droplets}
                  label="Humidity"
                  value={weather.humidity ?? '--'}
                  unit="%"
                  color="#1591DC"
                  bg="#DDF3F6"
                />
                <MetricBox
                  icon={Cloud}
                  label="Cloud Cover"
                  value={weather.cloudCover ?? '--'}
                  unit="%"
                  color="#71859A"
                  bg="#EAF2F6"
                />
                <MetricBox
                  icon={Eye}
                  label="Condition"
                  value={getWeatherInfo(weather.weatherCode).emoji}
                  unit={getWeatherInfo(weather.weatherCode).label}
                  color="#0368B8"
                  bg="#D5E9F8"
                />
              </div>
            </div>
          </div>

          {/* ROW 2: Marine Conditions */}
          {marine && (marine.waveHeight !== null || marine.seaTemperature !== null) && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#153356',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '10px',
                }}
              >
                Marine Conditions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <MetricBox
                  icon={Waves}
                  label="Wave Height"
                  value={marine.waveHeight ?? '--'}
                  unit="m"
                  color="#1591DC"
                  bg="#DDF3F6"
                />
                <MetricBox
                  icon={Navigation}
                  label="Wave Direction"
                  value={marine.waveDirection != null ? degToCompass(marine.waveDirection) : '--'}
                  unit={marine.waveDirection != null ? `${Math.round(marine.waveDirection)}°` : ''}
                  color="#0368B8"
                  bg="#D5E9F8"
                />
                <MetricBox
                  icon={Activity}
                  label="Wave Period"
                  value={marine.wavePeriod ?? '--'}
                  unit="sec"
                  color="#60C5DE"
                  bg="#DDF3F6"
                />
                <MetricBox
                  icon={Thermometer}
                  label="Sea Temp"
                  value={marine.seaTemperature ?? '--'}
                  unit="°C"
                  color="#DC2626"
                  bg="#FEF2F2"
                />
              </div>
            </div>
          )}

          {/* ROW 3: Active Alerts */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#153356',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '10px',
              }}
            >
              Active Alerts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {risk?.alerts?.length > 0 ? (
                risk.alerts.map((alert, i) => {
                  const aStyle = RISK_COLORS[alert.level] || RISK_COLORS.LOW;
                  return (
                    <div
                      key={i}
                      style={{
                        background: aStyle.bg,
                        border: `1px solid ${aStyle.border}`,
                        borderLeft: `4px solid ${aStyle.color}`,
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          border: `1px solid ${aStyle.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        <AlertTriangle size={17} color={aStyle.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: aStyle.color,
                              textTransform: 'uppercase',
                              letterSpacing: '0.07em',
                              padding: '2px 8px',
                              background: '#FFFFFF',
                              border: `1px solid ${aStyle.border}`,
                              borderRadius: '20px',
                            }}
                          >
                            {alert.level}
                          </span>
                          <span
                            style={{ fontSize: '13.5px', fontWeight: 700, color: '#153356' }}
                          >
                            {alert.title}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#334150',
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '18px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#16A34A', fontWeight: 600, margin: 0 }}>
                    ✓ No active weather alerts
                  </p>
                  <p style={{ fontSize: '12px', color: '#15803D', marginTop: '4px', margin: 0 }}>
                    All conditions are within safe operating parameters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── FORECAST SECTION ─────────────────────────────────────────────── */}
      {!loadingForecast && forecastData && dailySummaries.length > 0 && (
        <div>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#0368B8" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#153356' }}>
                {dailySummaries.length}-Day Forecast
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#075CA2',
                  padding: '2px 8px',
                  background: '#EAF2F6',
                  borderRadius: '20px',
                  fontWeight: 600,
                }}
              >
                Open-Meteo · Free Tier
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#71859A' }}>
              Click a day to view hourly charts
            </div>
          </div>

          {/* Calendar Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <button
              disabled={calendarOffset === 0}
              onClick={() => setCalendarOffset((o) => Math.max(0, o - 7))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #D3D3D5',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: calendarOffset === 0 ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                opacity: calendarOffset === 0 ? 0.4 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (calendarOffset !== 0) e.currentTarget.style.background = '#EAF2F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <ChevronLeft size={16} color="#0368B8" />
            </button>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${calendarDays.length}, 1fr)`,
                gap: '8px',
                flex: 1,
              }}
            >
              {calendarDays.map((day) => {
                const info = getWeatherInfo(day.weatherCode);
                const isSelected = day.date === selectedDate;
                const todayDay = isToday(day.date);
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setActiveChartTab('temperature');
                    }}
                    style={{
                      border: isSelected ? '2px solid #0368B8' : '1px solid #D3D3D5',
                      borderRadius: '12px',
                      padding: '12px 8px',
                      background: isSelected ? '#EAF2F6' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected
                        ? '0 2px 8px rgba(3, 104, 184, 0.12)'
                        : '0 1px 3px rgba(21, 51, 86, 0.04)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#F7F7F7';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: todayDay ? '#0368B8' : '#71859A',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '4px',
                      }}
                    >
                      {todayDay
                        ? 'Today'
                        : new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', {
                            weekday: 'short',
                          })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#71859A', marginBottom: '6px' }}>
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{info.emoji}</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626' }}>
                      {day.tempMax != null ? `${Math.round(day.tempMax)}°` : '--'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0368B8' }}>
                      {day.tempMin != null ? `${Math.round(day.tempMin)}°` : '--'}
                    </div>
                    {day.precipSum > 0 && (
                      <div style={{ fontSize: '10px', color: '#075CA2', marginTop: '4px' }}>
                        {day.precipSum.toFixed(1)} mm
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              disabled={calendarOffset + 7 >= dailySummaries.length}
              onClick={() => setCalendarOffset((o) => Math.min(dailySummaries.length - 7, o + 7))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #D3D3D5',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: calendarOffset + 7 >= dailySummaries.length ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                opacity: calendarOffset + 7 >= dailySummaries.length ? 0.4 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (calendarOffset + 7 < dailySummaries.length)
                  e.currentTarget.style.background = '#EAF2F6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <ChevronRight size={16} color="#0368B8" />
            </button>
          </div>

          {/* Selected Day Summary Bar */}
          {selectedDay && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #D3D3D5',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#71859A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  {isToday(selectedDay.date) ? 'Today' : formatDate(selectedDay.date)}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#153356',
                    marginTop: '2px',
                  }}
                >
                  {getWeatherInfo(selectedDay.weatherCode).emoji}{' '}
                  {getWeatherInfo(selectedDay.weatherCode).label}
                </div>
              </div>
              <div style={{ height: '40px', width: '1px', background: '#D3D3D5' }} />
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#71859A', fontWeight: 600 }}>High / Low</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#153356' }}>
                    <span style={{ color: '#DC2626' }}>
                      {selectedDay.tempMax != null ? `${Math.round(selectedDay.tempMax)}°` : '--'}
                    </span>
                    {' / '}
                    <span style={{ color: '#0368B8' }}>
                      {selectedDay.tempMin != null ? `${Math.round(selectedDay.tempMin)}°` : '--'}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#71859A', fontWeight: 600 }}>Max Wind</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0368B8' }}>
                    {selectedDay.windMax != null ? `${Math.round(selectedDay.windMax)} km/h` : '--'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#71859A', fontWeight: 600 }}>Rain Total</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#075CA2' }}>
                    {selectedDay.precipSum != null
                      ? `${selectedDay.precipSum.toFixed(1)} mm`
                      : '--'}
                  </div>
                </div>
                {selectedDay.sunrise && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sunrise size={14} color="#D97706" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#71859A', fontWeight: 600 }}>Sunrise</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#D97706' }}>
                        {selectedDay.sunrise.slice(11, 16)}
                      </div>
                    </div>
                  </div>
                )}
                {selectedDay.sunset && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sunset size={14} color="#FF7628" />
                    <div>
                      <div style={{ fontSize: '11px', color: '#71859A', fontWeight: 600 }}>Sunset</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FF7628' }}>
                        {selectedDay.sunset.slice(11, 16)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hourly Chart Section */}
          {hourlyData.length > 0 && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #D3D3D5',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(21, 51, 86, 0.04)',
              }}
            >
              {/* Chart Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#153356' }}>
                  Hourly Forecast — {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {CHART_TABS.map((tab) => {
                    const isActive = activeChartTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChartTab(tab.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isActive ? '1.5px solid #0368B8' : '1px solid #D3D3D5',
                          background: isActive ? '#EAF2F6' : '#FFFFFF',
                          color: isActive ? '#0368B8' : '#334150',
                          fontSize: '12px',
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = '#F7F7F7';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = '#FFFFFF';
                        }}
                      >
                        <tab.icon size={13} color={isActive ? '#0368B8' : '#71859A'} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Temperature Chart */}
              {activeChartTab === 'temperature' && (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7628" stopOpacity={0.10} />
                        <stop offset="95%" stopColor="#FF7628" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAF2F6" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" />
                    <YAxis tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" unit="°C" width={48} />
                    <Tooltip content={<CustomTooltip unit="°C" />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#334150' }} />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      name="Temperature"
                      stroke="#DC2626"
                      strokeWidth={2.5}
                      fill="url(#tempGrad)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="feelsLike"
                      name="Feels Like"
                      stroke="#FF7628"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      fill="url(#feelsGrad)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Wind Chart */}
              {activeChartTab === 'wind' && (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0368B8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0368B8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAF2F6" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" />
                    <YAxis tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" unit=" km/h" width={60} />
                    <Tooltip content={<CustomTooltip unit="km/h" />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#334150' }} />
                    <Area
                      type="monotone"
                      dataKey="wind"
                      name="Wind Speed"
                      stroke="#0368B8"
                      strokeWidth={2.5}
                      fill="url(#windGrad)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Rain Chart */}
              {activeChartTab === 'rain' && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAF2F6" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" />
                    <YAxis tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" unit=" mm" width={52} />
                    <Tooltip content={<CustomTooltip unit="mm" />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#334150' }} />
                    <Bar dataKey="precip" name="Precipitation" fill="#075CA2" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Wave Chart */}
              {activeChartTab === 'wave' && (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0368B8" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#0368B8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAF2F6" />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" />
                    <YAxis tick={{ fontSize: 12, fill: '#71859A' }} stroke="#D3D3D5" unit=" m" width={44} />
                    <Tooltip content={<CustomTooltip unit="m" />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#334150' }} />
                    <Area
                      type="monotone"
                      dataKey="waveHeight"
                      name="Wave Height"
                      stroke="#0368B8"
                      strokeWidth={2.5}
                      fill="url(#waveGrad)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wavePeriod"
                      name="Wave Period (s)"
                      stroke="#60C5DE"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      fill="none"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {/* Chart info note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
                <Info size={12} color="#71859A" />
                <span style={{ fontSize: '11px', color: '#71859A' }}>
                  Hourly data sampled every 3 hours · Source: Open-Meteo forecast API · Free & open-source
                </span>
              </div>
            </div>
          )}

          {/* Forecast loading state */}
          {loadingForecast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                gap: '12px',
              }}
            >
              <RefreshCw size={20} color="#0368B8" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px', color: '#334150', fontWeight: 500 }}>
                Loading forecast data...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherIntelligence;
