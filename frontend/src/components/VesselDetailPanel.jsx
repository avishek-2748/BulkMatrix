import { X, Ship, MapPin, Navigation, Clock, Flame, AlertTriangle, Route } from 'lucide-react';

const VesselDetailPanel = ({ vessel, onClose }) => {
  if (!vessel) return null;

  const isAtSea = vessel.status === 'AT_SEA';
  const hasAlerts = vessel.alerts && vessel.alerts.length > 0;

  const statusStyle = hasAlerts
    ? { bg: '#FEECEC', text: '#DC2626', border: '#FECACA', dot: '#DC2626' }
    : isAtSea
    ? { bg: '#EAF6FC', text: '#0B82C9', border: '#CFE7F5', dot: '#0B82C9' }
    : { bg: '#FFF1E8', text: '#FF7426', border: '#FFD8C2', dot: '#FF7426' };

  const statusLabel = hasAlerts ? 'Alert' : isAtSea ? 'At Sea' : 'At Port';

  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        bottom: '20px',
        width: '340px',
        background: '#FFFFFF',
        border: '1px solid #D9E6EF',
        borderRadius: '16px',
        boxShadow: '0 12px 36px rgba(18, 47, 85, 0.12)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'pageEnter 200ms ease-out forwards',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #D9E6EF',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EAF6FC',
                border: '1px solid #CFE7F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ship size={16} color="#0B82C9" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', margin: 0, lineHeight: 1.2 }}>
                {vessel.vesselName}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 9px',
                background: '#EAF6FC',
                color: '#0B82C9',
                border: '1px solid #CFE7F5',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {vessel.vesselClass}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 9px',
                background: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`,
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: statusStyle.dot,
                  display: 'inline-block',
                  animation: hasAlerts ? 'pulse-dot 1.5s infinite' : 'none',
                }}
              />
              {statusLabel}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid #D9E6EF',
            background: '#FFFFFF',
            cursor: 'pointer',
            color: '#5F7894',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEECEC'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#5F7894'; e.currentTarget.style.borderColor = '#D9E6EF'; }}
        >
          <X size={17} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Voyage Details */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #D9E6EF',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#5F7894',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Route size={13} color="#0B82C9" /> Voyage Details
          </div>

          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div
              style={{
                position: 'absolute',
                left: '9px',
                top: '14px',
                bottom: '14px',
                width: '1.5px',
                background: '#D9E6EF',
              }}
            />

            {/* Current Position */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '2px solid #0B82C9',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              />
              <div>
                <p style={{ fontSize: '11px', color: '#7890A8', fontWeight: 600, marginBottom: '2px' }}>Current Position</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#122F55', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <MapPin size={12} color="#7890A8" />
                  {vessel.latitude.toFixed(4)}° N, {vessel.longitude.toFixed(4)}° E
                </p>
              </div>
            </div>

            {/* Destination */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#E8F8EF',
                  border: '2px solid #16A34A',
                  flexShrink: 0,
                  marginTop: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#16A34A',
                    animation: 'pulse-dot 2s infinite',
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#7890A8', fontWeight: 600, marginBottom: '2px' }}>Destination Port</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#122F55', margin: '0 0 3px 0' }}>{vessel.destination}</p>
                <p style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <Clock size={11} />
                  ETA: {new Date(vessel.eta).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{
              background: '#EAF6FC',
              border: '1px solid #CFE7F5',
              borderRadius: '10px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <Navigation size={13} color="#0B82C9" />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#5F7894', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cargo</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#122F55', margin: 0 }}>{vessel.cargo}</p>
          </div>
          <div
            style={{
              background: '#FFF1E8',
              border: '1px solid #FFD8C2',
              borderRadius: '10px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
              <Flame size={13} color="#FF7426" />
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#5F7894', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fuel Burn</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#122F55', margin: 0 }}>
              {vessel.fuelConsumption} <span style={{ fontSize: '11px', color: '#5F7894', fontWeight: 500 }}>t/day</span>
            </p>
          </div>
        </div>

        {/* Voyage Progress */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #D9E6EF',
            borderRadius: '10px',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#5F7894' }}>Voyage Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B82C9' }}>78%</span>
          </div>
          <div style={{ width: '100%', background: '#F4FAFD', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
            <div
              style={{
                width: '78%',
                height: '100%',
                background: 'linear-gradient(90deg, #122F55 0%, #0B82C9 100%)',
                borderRadius: '6px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Alerts */}
        {hasAlerts && (
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#DC2626',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={13} color="#DC2626" /> Active Alerts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {vessel.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#FEECEC',
                    border: '1px solid #FECACA',
                    borderLeft: '3px solid #DC2626',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#DC2626',
                      marginTop: '5px',
                      flexShrink: 0,
                      animation: 'pulse-dot 1.5s infinite',
                    }}
                  />
                  <p style={{ fontSize: '13px', color: '#122F55', margin: 0, lineHeight: 1.4 }}>{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselDetailPanel;
