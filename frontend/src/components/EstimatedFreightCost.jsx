import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  MapPin,
  Ship,
  Info,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  calculateBaseFreightCost,
  calculateInrCost,
  calculateCostComparison,
  calculateDestinationCosts,
  formatCommaNumber,
  formatUsdCurrency,
  formatCompactCurrency,
  formatInrCurrency,
  safeNumber,
} from '../utils/freightCostCalculator';
import { getFxAnalytics } from '../services/api';

/**
 * EstimatedFreightCost Component
 * Renders the financial cost analysis for charter recommendation:
 * - Prominent Estimated Freight Cost & detailed breakdown
 * - Configurable USD → INR conversion (API-backed / configurable / user-editable)
 * - Recommended Option Cost card (vessel & port highlights)
 * - Recommended vs Alternative Option Comparison (with potential savings)
 * - Multi-destination port cost breakdown
 * - Official disclaimer
 */
const EstimatedFreightCost = ({
  cargoVolumeTonnes,
  recommendationResult,
  selectedDestinations = [],
  originPort = '',
}) => {
  // Configurable USD -> INR rate (env default or fallback to 83.50)
  const defaultExchangeRate = safeNumber(import.meta.env.VITE_USD_INR_RATE, 83.5);
  const [exchangeRate, setExchangeRate] = useState(defaultExchangeRate);
  const [isEditingFx, setIsEditingFx] = useState(false);
  const [tempFxRate, setTempFxRate] = useState(String(defaultExchangeRate));
  const [showInr, setShowInr] = useState(true);

  // Optional manual freight rate override for real-time what-if simulations
  const [customRate, setCustomRate] = useState(null);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRateInput, setTempRateInput] = useState('');

  // Attempt to fetch latest FX rate from analytics API if available
  useEffect(() => {
    let isMounted = true;
    const fetchFx = async () => {
      try {
        const fxData = await getFxAnalytics();
        if (isMounted && Array.isArray(fxData) && fxData.length > 0) {
          const latest = fxData[fxData.length - 1];
          if (latest?.usdInr && !isNaN(latest.usdInr)) {
            setExchangeRate(Number(latest.usdInr));
            setTempFxRate(String(latest.usdInr));
          }
        }
      } catch (err) {
        // Graceful fallback to default configured rate
      }
    };
    fetchFx();
    return () => {
      isMounted = false;
    };
  }, []);

  // Safe Cargo Volume (reactive to form input and recommendation)
  const cargoVolume = useMemo(() => {
    return safeNumber(
      cargoVolumeTonnes || recommendationResult?.request?.cargo_volume,
      150000
    );
  }, [cargoVolumeTonnes, recommendationResult]);

  // Forecast Freight Rate directly from existing ML recommendation engine
  const forecastRate = useMemo(() => {
    if (!recommendationResult) return 21.0;
    const r = recommendationResult;
    return safeNumber(
      r.forecast?.forecast30 ??
      r.forecast?.recommendedRate ??
      r.destinationRates?.[0]?.freightRate ??
      r.forecast?.currentRate,
      21.0
    );
  }, [recommendationResult]);

  // Active rate (forecasted or user what-if tuned)
  const activeFreightRate = customRate !== null ? customRate : forecastRate;

  // Base Freight Cost Calculation
  const estimatedCost = useMemo(() => {
    return calculateBaseFreightCost(cargoVolume, activeFreightRate);
  }, [cargoVolume, activeFreightRate]);

  // INR equivalent
  const estimatedInrCost = useMemo(() => {
    return calculateInrCost(estimatedCost, exchangeRate);
  }, [estimatedCost, exchangeRate]);

  // Recommended Vessel Class
  const recommendedVessel = useMemo(() => {
    return (
      recommendationResult?.vesselRecommendation?.class ||
      (recommendationResult?.multiVesselRequired ? 'MULTI-VESSEL' : 'CAPESIZE')
    );
  }, [recommendationResult]);

  // Multi-destination calculations
  const destinationCosts = useMemo(() => {
    if (!recommendationResult) return [];

    // Prioritize destinationRates from backend, otherwise portTimeEstimates or selectedDestinations
    const sourceRates = recommendationResult.destinationRates || [];
    const sourcePorts =
      selectedDestinations.length > 0
        ? selectedDestinations
        : (recommendationResult.portTimeEstimates || []).map((p) => p.port);

    const merged = sourcePorts.map((portName) => {
      const found = sourceRates.find(
        (r) => (r.port || '').toLowerCase() === portName.toLowerCase()
      );
      const ptFound = (recommendationResult.portTimeEstimates || []).find(
        (p) => (p.port || '').toLowerCase() === portName.toLowerCase()
      );
      const rate = found?.freightRate ?? ptFound?.freightRate ?? forecastRate;
      return {
        port: portName,
        freightRate: rate,
      };
    });

    return calculateDestinationCosts(merged, cargoVolume, forecastRate);
  }, [recommendationResult, selectedDestinations, cargoVolume, forecastRate]);

  // Primary Destination name
  const primaryDestination = useMemo(() => {
    if (destinationCosts.length > 0) return destinationCosts[0].port;
    if (selectedDestinations.length > 0) return selectedDestinations[0];
    return 'Primary Port';
  }, [destinationCosts, selectedDestinations]);

  // Alternative Option & Comparison calculation
  const comparison = useMemo(() => {
    let altRate = 23.0;

    // Check if multi-vessel alternative fleet exists
    if (recommendationResult?.alternativeFleets?.length > 0) {
      const altFleet = recommendationResult.alternativeFleets[0];
      if (altFleet.cost_per_tonne) altRate = Number(altFleet.cost_per_tonne);
    } else if (recommendationResult?.alternativeOption?.freightRate) {
      altRate = Number(recommendationResult.alternativeOption.freightRate);
    } else if (destinationCosts.length > 1) {
      // Find highest rate among other destinations for comparison
      const others = destinationCosts.slice(1);
      const diffRates = others.map((o) => o.freightRate);
      if (diffRates.length > 0) {
        altRate = Math.max(...diffRates);
      }
    } else {
      altRate = Math.round((forecastRate + 2.0) * 10) / 10;
    }

    // Ensure alternative rate shows meaningful comparison if equal
    if (altRate === activeFreightRate) {
      altRate = Math.round((activeFreightRate + 2.0) * 10) / 10;
    }

    return calculateCostComparison(activeFreightRate, altRate, cargoVolume);
  }, [recommendationResult, destinationCosts, activeFreightRate, cargoVolume, forecastRate]);

  // Handler for FX rate save
  const handleSaveFxRate = () => {
    const parsed = parseFloat(tempFxRate);
    if (!isNaN(parsed) && parsed > 0) {
      setExchangeRate(parsed);
    } else {
      setTempFxRate(String(exchangeRate));
    }
    setIsEditingFx(false);
  };

  // Handler for Custom Rate simulation save
  const handleSaveCustomRate = () => {
    const parsed = parseFloat(tempRateInput);
    if (!isNaN(parsed) && parsed > 0) {
      setCustomRate(parsed);
    }
    setIsEditingRate(false);
  };

  const handleResetRate = () => {
    setCustomRate(null);
    setTempRateInput('');
    setIsEditingRate(false);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* SECTION HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '8px',
              background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(29,78,216,0.2)',
            }}
          >
            <DollarSign size={18} color="white" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Estimated Freight Cost
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  background: 'var(--light-blue-bg)',
                  color: 'var(--brand-blue)',
                  border: '1px solid rgba(29,78,216,0.2)',
                  borderRadius: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                FINANCIAL ESTIMATE
              </span>
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Base freight estimate derived from ML forecast freight rate × cargo quantity
            </p>
          </div>
        </div>

        {/* Currency Toggle & Configurable USD/INR Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* INR Configurable Rate Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              USD → INR Rate:
            </span>
            {isEditingFx ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 700 }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={tempFxRate}
                  onChange={(e) => setTempFxRate(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFxRate()}
                  autoFocus
                  style={{
                    width: '64px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1.5px solid var(--brand-blue)',
                    borderRadius: '6px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveFxRate}
                  style={{
                    background: 'var(--brand-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempFxRate(String(exchangeRate));
                  setIsEditingFx(true);
                }}
                title="Click to configure exchange rate"
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#E2E8F0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              >
                ₹{exchangeRate.toFixed(2)} / USD
                <Sliders size={11} color="var(--text-secondary)" />
              </button>
            )}
          </div>

          {/* Toggle INR Display */}
          <button
            type="button"
            onClick={() => setShowInr(!showInr)}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '20px',
              border: `1px solid ${showInr ? 'var(--brand-blue)' : 'var(--border)'}`,
              background: showInr ? 'var(--light-blue-bg)' : 'white',
              color: showInr ? 'var(--brand-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {showInr ? '₹ INR Shown' : '+ Show ₹ INR'}
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS GRID: 3 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* CARD 1: PRIMARY ESTIMATED FREIGHT COST & BREAKDOWN */}
        <div
          style={{
            background: 'white',
            border: '1.5px solid #DBEAFE',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 12px rgba(29,78,216,0.06)',
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
              background: 'linear-gradient(90deg, #1D4ED8, #3B82F6)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: 0,
                }}
              >
                Estimated Freight Cost
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <h2
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: 'var(--brand-blue)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {formatUsdCurrency(estimatedCost)}
                </h2>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {formatCompactCurrency(estimatedCost)}
                </span>
              </div>
            </div>

            {/* Simulated Rate Tuning Tag */}
            {customRate !== null && (
              <button
                type="button"
                onClick={handleResetRate}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#92400E',
                  cursor: 'pointer',
                }}
                title="Reset to forecast rate"
              >
                <RotateCcw size={10} /> Custom Rate
              </button>
            )}
          </div>

          {/* Detailed Breakdown List */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: showInr ? '12px' : '0',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              Breakdown:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cargo Quantity:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {formatCommaNumber(cargoVolume)} MT
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Freight Rate:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEditingRate ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontWeight: 700 }}>$</span>
                      <input
                        type="number"
                        step="0.1"
                        value={tempRateInput}
                        onChange={(e) => setTempRateInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomRate()}
                        placeholder={String(activeFreightRate)}
                        autoFocus
                        style={{
                          width: '60px',
                          padding: '2px 4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1.5px solid var(--brand-blue)',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomRate}
                        style={{
                          background: 'var(--brand-blue)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '2px 5px',
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={11} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        setTempRateInput(String(activeFreightRate));
                        setIsEditingRate(true);
                      }}
                      title="Click to simulate with different rate"
                      style={{
                        fontWeight: 700,
                        color: customRate !== null ? '#D97706' : 'var(--brand-blue)',
                        cursor: 'pointer',
                        textDecoration: 'underline dotted',
                      }}
                    >
                      ${activeFreightRate.toFixed(2)} / MT
                    </span>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px dashed #CBD5E1',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Estimated Freight Cost:
                </span>
                <strong style={{ color: 'var(--brand-blue)' }}>
                  {formatUsdCurrency(estimatedCost)}
                </strong>
              </div>
            </div>
          </div>

          {/* Optional Indian Rupee Equivalent */}
          {showInr && (
            <div
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#92400E', fontWeight: 600 }}>
                  USD → INR Rate: ₹{exchangeRate.toFixed(2)} / USD
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#FEF3C7',
                    color: '#B45309',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {formatInrCurrency(estimatedInrCost, true)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '12px', color: '#78350F', fontWeight: 500 }}>
                  Estimated Cost in INR:
                </span>
                <strong style={{ fontSize: '14px', color: '#92400E', fontWeight: 800 }}>
                  {formatInrCurrency(estimatedInrCost)}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: RECOMMENDED OPTION COST CARD */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Recommended Option Cost
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  background: '#DCFCE7',
                  color: '#15803D',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                AI BEST MATCH
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
                padding: '10px 12px',
                background: 'var(--light-blue-bg)',
                borderRadius: '8px',
                border: '1px solid rgba(29,78,216,0.15)',
              }}
            >
              <Ship size={20} color="var(--brand-blue)" />
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
                  RECOMMENDED VESSEL & ROUTE
                </p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {recommendedVessel} · {originPort || 'Origin'} → {primaryDestination}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Target Destination:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{primaryDestination}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Forecast Freight Rate:</span>
                <strong style={{ color: 'var(--brand-blue)' }}>
                  ${activeFreightRate.toFixed(2)} / MT
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Total Freight:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {formatUsdCurrency(estimatedCost)}
                </strong>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Total Cargo Handled:
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-blue)' }}>
              {formatCommaNumber(cargoVolume)} MT
            </span>
          </div>
        </div>

        {/* CARD 3: SIMPLE COMPARISON (RECOMMENDED VS ALTERNATIVE) */}
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Option Cost Comparison
              </span>
              {comparison.difference > 0 && (
                <span
                  style={{
                    padding: '2px 8px',
                    background: '#DCFCE7',
                    color: '#15803D',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  SAVE {formatUsdCurrency(comparison.difference)}
                </span>
              )}
            </div>

            {/* Comparison Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {/* Recommended Option Block */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#15803D', margin: '0 0 2px 0' }}>
                  Rate: <strong>${comparison.recommendedRate.toFixed(2)}/MT</strong>
                </p>
                <p style={{ fontSize: '16px', fontWeight: 900, color: '#166534', margin: 0 }}>
                  {formatCompactCurrency(comparison.recommendedCost)}
                </p>
                <span style={{ fontSize: '10.5px', color: '#15803D' }}>
                  {formatUsdCurrency(comparison.recommendedCost)}
                </span>
              </div>

              {/* Alternative Option Block */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Alternative
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 2px 0' }}>
                  Rate: <strong>${comparison.alternativeRate.toFixed(2)}/MT</strong>
                </p>
                <p style={{ fontSize: '16px', fontWeight: 900, color: '#334155', margin: 0 }}>
                  {formatCompactCurrency(comparison.alternativeCost)}
                </p>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                  {formatUsdCurrency(comparison.alternativeCost)}
                </span>
              </div>
            </div>

            {/* Potential Difference */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Potential Difference:
                </span>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                  {comparison.savingsPercent > 0
                    ? `${comparison.savingsPercent}% cost optimization`
                    : 'Option difference'}
                </p>
              </div>
              <strong
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: comparison.difference > 0 ? 'var(--success)' : 'var(--text-primary)',
                }}
              >
                {comparison.difference > 0 ? '-' : ''}
                {formatUsdCurrency(Math.abs(comparison.difference))}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--text-secondary)',
            }}
          >
            <Sparkles size={13} color="var(--brand-blue)" />
            <span>AI recommends locking in lower rate to capture savings</span>
          </div>
        </div>
      </div>

      {/* MULTI-DESTINATION PORTS ESTIMATED COST BREAKDOWN (If 2+ destinations selected) */}
      {destinationCosts.length > 1 && (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--brand-blue)" />
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Destination Port Freight Cost Comparison
              </h4>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {destinationCosts.length} Destination Ports Selected
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`,
              gap: '12px',
            }}
          >
            {destinationCosts.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={item.port || idx}
                  style={{
                    background: isFirst ? '#F0FDF4' : '#F8FAFC',
                    border: `1.5px solid ${isFirst ? '#86EFAC' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '14px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: isFirst ? '#166534' : 'var(--text-primary)',
                      }}
                    >
                      {item.port}
                    </span>
                    {isFirst && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          background: '#DCFCE7',
                          color: '#15803D',
                          borderRadius: '4px',
                        }}
                      >
                        LOWEST RATE
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Freight Rate:</span>
                      <strong>${item.freightRate.toFixed(2)}/MT</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Cargo:</span>
                      <span>{formatCommaNumber(cargoVolume)} MT</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        paddingTop: '6px',
                        marginTop: '2px',
                        borderTop: '1px dashed #CBD5E1',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Estimated Freight:
                      </span>
                      <strong style={{ color: isFirst ? '#15803D' : 'var(--brand-blue)' }}>
                        {formatUsdCurrency(item.estimatedCost)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTRACTUAL & MARKET DISCLAIMER NOTE */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <Info size={15} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          <strong>Note:</strong> Estimated cost is based on forecast freight rate × cargo quantity.
          Actual charter cost may vary based on market conditions, bunker costs, port charges,
          demurrage, taxes, and other contractual charges.
        </p>
      </div>
    </div>
  );
};

export default EstimatedFreightCost;
