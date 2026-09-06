import { useState, useEffect, useCallback } from 'react';
import { CloudRain, Wind, Thermometer, Eye, Droplets, Waves, Navigation, AlertTriangle, RefreshCw, MapPin, Cloud } from 'lucide-react';
import { fetchPorts, fetchPortWeather } from '../services/weatherService';

const REFRESH_INTERVAL = 10 * 60 * 1000;

// WMO weather code → human-readable condition
const getWeatherCondition = (code) => {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 57) return 'Drizzle';
  if (code <= 65) return 'Rain';
  if (code <= 67) return 'Freezing Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};

// Risk level → color mapping
const RISK_COLORS = {
  CRITICAL: { color: '#DC2626', bgColor: '#FEF2F2' },
  HIGH:     { color: '#D97706', bgColor: '#FFFBEB' },
  MEDIUM:   { color: '#CA8A04', bgColor: '#FEFCE8' },
  LOW:      { color: '#16A34A', bgColor: '#F0FDF4' },
};

// Alert level → styling
const ALERT_STYLES = {
  CRITICAL: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  HIGH:     { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  MEDIUM:   { color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A' },
  LOW:      { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

const MetricBox = ({ icon: Icon, label, value, unit, color }) => (
  <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value ?? '--'} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{unit}</span></p>
    </div>
  </div>
);

const WeatherIntelligence = () => {
  const [ports, setPorts] = useState([]);
  const [selectedPortId, setSelectedPortId] = useState('paradip');
  const [data, setData] = useState(null);       // full API response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load ports on mount
  useEffect(() => {
    const loadPorts = async () => {
      try {
        const portList = await fetchPorts();
        setPorts(portList);
      } catch (err) {
        console.error('Failed to load ports:', err);
      }
    };
    loadPorts();
  }, []);

  // Fetch weather for the selected port
  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPortWeather(selectedPortId);
      setData(result);
      setLastUpdated(new Date(result.updatedAt));
    } catch (err) {
      setError('Unable to fetch live weather data. Please try again.');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPortId]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Destructure data for rendering
  const weather = data?.weather;
  const marine = data?.marine;
  const risk = data?.risk;
  const location = data?.location;

  const riskStyle = risk ? RISK_COLORS[risk.level] || RISK_COLORS.LOW : null;

  // Wind direction → compass label
  const windDir = weather?.windDirection;
  const windDirLabel = windDir !== undefined && windDir !== null
    ? ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(windDir / 45) % 8]
    : '--';

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CloudRain size={24} color="var(--brand-blue)" /> Weather Intelligence
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Live marine weather conditions, wave data, and risk monitoring</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={selectedPortId}
            onChange={e => setSelectedPortId(e.target.value)}
            style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13.5px', color: 'var(--text-primary)', background: 'white', outline: 'none', cursor: 'pointer' }}
          >
            {ports.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={fetchWeather}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              background: loading ? '#93C5FD' : 'var(--brand-blue)', color: 'white', border: 'none',
              borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ fontSize: '13.5px', color: 'var(--danger)' }}>{error}</span>
          <button onClick={fetchWeather} style={{ marginLeft: 'auto', padding: '4px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {loading && !data ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '14px' }}>
          <RefreshCw size={32} color="var(--brand-blue)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Loading live weather data...</p>
        </div>
      ) : weather && (
        <>
          {/* Risk Score + Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
            {/* Risk Score Card */}
            {risk && riskStyle && (
              <div style={{ background: riskStyle.bgColor, border: `2px solid ${riskStyle.color}33`, borderRadius: '14px', padding: '28px', textAlign: 'center', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: riskStyle.color }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                  <MapPin size={14} color={riskStyle.color} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: riskStyle.color }}>{location?.name || selectedPortId}</span>
                </div>
                <div style={{ fontSize: '64px', fontWeight: 900, color: riskStyle.color, lineHeight: 1, marginBottom: '8px' }}>{risk.score}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: riskStyle.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Risk Score</div>
                <div style={{ display: 'inline-block', padding: '4px 16px', background: riskStyle.color, color: 'white', borderRadius: '20px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em' }}>{risk.level}</div>
                {location?.state && (
                  <div style={{ fontSize: '11px', color: riskStyle.color, marginTop: '10px', opacity: 0.7 }}>{location.city}, {location.state}</div>
                )}
              </div>
            )}

            {/* Weather Metrics */}
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Atmospheric Conditions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <MetricBox icon={Thermometer} label="Temperature" value={weather.temperature != null ? Math.round(weather.temperature) : '--'} unit="°C" color="#DC2626" />
                <MetricBox icon={Wind} label="Wind Speed" value={weather.windSpeed != null ? Math.round(weather.windSpeed) : '--'} unit="km/h" color="#1D4ED8" />
                <MetricBox icon={Navigation} label="Wind Direction" value={windDirLabel} unit={weather.windDirection != null ? `${Math.round(weather.windDirection)}°` : ''} color="#7C3AED" />
                <MetricBox icon={Droplets} label="Humidity" value={weather.humidity ?? '--'} unit="%" color="#0EA5E9" />
                <MetricBox icon={Cloud} label="Cloud Cover" value={weather.cloudCover ?? '--'} unit="%" color="#64748B" />
                <MetricBox icon={CloudRain} label="Precipitation" value={weather.precipitation != null ? weather.precipitation.toFixed(1) : '--'} unit="mm" color="#6366F1" />
              </div>
              {/* Weather Condition Tag */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={14} color="var(--text-muted)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', padding: '3px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
                  Condition: {getWeatherCondition(weather.weatherCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Marine Data */}
          {marine && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Marine Conditions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <MetricBox icon={Waves} label="Wave Height" value={marine.waveHeight ?? '--'} unit="m" color="#0EA5E9" />
                <MetricBox icon={Navigation} label="Wave Direction" value={marine.waveDirection != null ? Math.round(marine.waveDirection) : '--'} unit="°" color="#7C3AED" />
                <MetricBox icon={RefreshCw} label="Wave Period" value={marine.wavePeriod ?? '--'} unit="sec" color="#1D4ED8" />
                <MetricBox icon={Thermometer} label="Sea Temp" value={marine.seaTemperature ?? '--'} unit="°C" color="#DC2626" />
              </div>
            </div>
          )}

          {/* Dynamic Alerts */}
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Active Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {risk?.alerts?.length > 0 ? (
                risk.alerts.map((alert, i) => {
                  const style = ALERT_STYLES[alert.level] || ALERT_STYLES.LOW;
                  return (
                    <div key={i} style={{ background: style.bg, border: `1px solid ${style.border}`, borderLeft: `4px solid ${style.color}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: style.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <AlertTriangle size={18} color={style.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: style.color, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', background: style.color + '20', borderRadius: '20px' }}>{alert.level}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{alert.title}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                          <MapPin size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>{location?.name || selectedPortId}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.description}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#16A34A', fontWeight: 600 }}>✓ No active weather alerts</p>
                  <p style={{ fontSize: '12px', color: '#22C55E', marginTop: '4px' }}>All conditions are within safe operating parameters.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherIntelligence;
