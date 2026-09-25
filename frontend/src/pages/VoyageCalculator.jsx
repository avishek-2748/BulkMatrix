import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Ship,
  DollarSign,
  Clock,
  TrendingUp,
  Fuel,
  Anchor,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Scale,
  Calendar,
  Layers
} from 'lucide-react';

const VESSEL_PRESETS = {
  capesize: {
    name: 'Capesize (180,000 DWT)',
    dwt: 180000,
    cargo: 160000,
    freightRate: 14.50,
    speed: 12.5,
    consumptionSea: 42,
    consumptionPort: 3.5,
    portDays: 6,
    portDues: 110000,
    canalDues: 0,
    marketTce: 24500,
    commissionPct: 3.75,
    demurrageRate: 28000
  },
  panamax: {
    name: 'Kamsarmax / Panamax (82,000 DWT)',
    dwt: 82000,
    cargo: 75000,
    freightRate: 17.80,
    speed: 13.0,
    consumptionSea: 28,
    consumptionPort: 2.5,
    portDays: 5,
    portDues: 65000,
    canalDues: 0,
    marketTce: 15200,
    commissionPct: 3.75,
    demurrageRate: 18500
  },
  supramax: {
    name: 'Ultramax / Supramax (64,000 DWT)',
    dwt: 64000,
    cargo: 58000,
    freightRate: 21.20,
    speed: 13.5,
    consumptionSea: 24,
    consumptionPort: 2.0,
    portDays: 5,
    portDues: 52000,
    canalDues: 0,
    marketTce: 13800,
    commissionPct: 3.75,
    demurrageRate: 15000
  },
  handysize: {
    name: 'Handysize (38,000 DWT)',
    dwt: 38000,
    cargo: 34000,
    freightRate: 26.50,
    speed: 13.0,
    consumptionSea: 18,
    consumptionPort: 1.8,
    portDays: 4,
    portDues: 38000,
    canalDues: 0,
    marketTce: 11200,
    commissionPct: 3.75,
    demurrageRate: 12000
  }
};

const VoyageCalculator = () => {
  const [activeTab, setActiveTab] = useState('tce');
  const [selectedPreset, setSelectedPreset] = useState('supramax');

  // TCE State
  const [cargoQty, setCargoQty] = useState(58000);
  const [freightRate, setFreightRate] = useState(21.20);
  const [ladenDistance, setLadenDistance] = useState(4800);
  const [ballastDistance, setBallastDistance] = useState(1200);
  const [speed, setSpeed] = useState(13.5);
  const [portDays, setPortDays] = useState(5);
  const [vlsfoPrice, setVlsfoPrice] = useState(620);
  const [mgoPrice, setMgoPrice] = useState(840);
  const [vlsfoConsumptionSea, setVlsfoConsumptionSea] = useState(24);
  const [mgoConsumptionPort, setMgoConsumptionPort] = useState(2.0);
  const [portDues, setPortDues] = useState(52000);
  const [canalTolls, setCanalTolls] = useState(0);
  const [otherExpenses, setOtherExpenses] = useState(8000);
  const [commissionPct, setCommissionPct] = useState(3.75);
  const [marketBenchmark, setMarketBenchmark] = useState(13800);

  // Laytime & Demurrage State
  const [laytimeCargo, setLaytimeCargo] = useState(55000);
  const [loadingRate, setLoadingRate] = useState(10000);
  const [laytimeType, setLaytimeType] = useState('SHINC');
  const [demurrageDaily, setDemurrageDaily] = useState(16000);
  const [despatchDaily, setDespatchDaily] = useState(8000);
  const [turnTimeHours, setTurnTimeHours] = useState(12);
  const [actualHoursUsed, setActualHoursUsed] = useState(168);
  const [weatherExclusionHours, setWeatherExclusionHours] = useState(18);

  const handleApplyPreset = (key) => {
    setSelectedPreset(key);
    const p = VESSEL_PRESETS[key];
    if (!p) return;
    setCargoQty(p.cargo);
    setFreightRate(p.freightRate);
    setSpeed(p.speed);
    setVlsfoConsumptionSea(p.consumptionSea);
    setMgoConsumptionPort(p.consumptionPort);
    setPortDays(p.portDays);
    setPortDues(p.portDues);
    setCanalTolls(p.canalDues);
    setCommissionPct(p.commissionPct);
    setMarketBenchmark(p.marketTce);
    setDemurrageDaily(p.demurrageRate);
    setDespatchDaily(Math.round(p.demurrageRate / 2));
  };

  const tceResults = useMemo(() => {
    const totalDistance = (Number(ladenDistance) || 0) + (Number(ballastDistance) || 0);
    const seaDays = (Number(speed) > 0) ? (totalDistance / (Number(speed) * 24)) : 0;
    const ladenSeaDays = (Number(speed) > 0) ? (Number(ladenDistance) / (Number(speed) * 24)) : 0;
    const ballastSeaDays = (Number(speed) > 0) ? (Number(ballastDistance) / (Number(speed) * 24)) : 0;
    const totalVoyageDays = seaDays + (Number(portDays) || 0);

    const grossRevenue = (Number(cargoQty) || 0) * (Number(freightRate) || 0);
    const commissionCost = grossRevenue * ((Number(commissionPct) || 0) / 100);

    const vlsfoTotalMT = seaDays * (Number(vlsfoConsumptionSea) || 0);
    const vlsfoCost = vlsfoTotalMT * (Number(vlsfoPrice) || 0);
    const mgoTotalMT = (Number(portDays) || 0) * (Number(mgoConsumptionPort) || 0);
    const mgoCost = mgoTotalMT * (Number(mgoPrice) || 0);
    const totalBunkerCost = vlsfoCost + mgoCost;

    const totalPortAndCanal = (Number(portDues) || 0) + (Number(canalTolls) || 0) + (Number(otherExpenses) || 0);
    const totalExpenses = commissionCost + totalBunkerCost + totalPortAndCanal;
    const netRevenue = grossRevenue - totalExpenses;
    const dailyTCE = totalVoyageDays > 0 ? (netRevenue / totalVoyageDays) : 0;
    const tceDiff = dailyTCE - (Number(marketBenchmark) || 0);
    const tceDiffPct = marketBenchmark > 0 ? ((tceDiff / marketBenchmark) * 100) : 0;

    return {
      seaDays: seaDays.toFixed(1),
      ladenSeaDays: ladenSeaDays.toFixed(1),
      ballastSeaDays: ballastSeaDays.toFixed(1),
      totalVoyageDays: totalVoyageDays.toFixed(1),
      grossRevenue: Math.round(grossRevenue),
      commissionCost: Math.round(commissionCost),
      vlsfoTotalMT: Math.round(vlsfoTotalMT),
      vlsfoCost: Math.round(vlsfoCost),
      mgoTotalMT: Math.round(mgoTotalMT),
      mgoCost: Math.round(mgoCost),
      totalBunkerCost: Math.round(totalBunkerCost),
      totalPortAndCanal: Math.round(totalPortAndCanal),
      totalExpenses: Math.round(totalExpenses),
      netRevenue: Math.round(netRevenue),
      dailyTCE: Math.round(dailyTCE),
      tceDiff: Math.round(tceDiff),
      tceDiffPct: tceDiffPct.toFixed(1),
      bunkerPct: totalExpenses > 0 ? Math.round((totalBunkerCost / totalExpenses) * 100) : 0,
      portPct: totalExpenses > 0 ? Math.round((totalPortAndCanal / totalExpenses) * 100) : 0,
      commPct: totalExpenses > 0 ? Math.round((commissionCost / totalExpenses) * 100) : 0,
      netMarginPct: grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100).toFixed(1) : 0
    };
  }, [
    cargoQty, freightRate, ladenDistance, ballastDistance, speed, portDays,
    vlsfoPrice, mgoPrice, vlsfoConsumptionSea, mgoConsumptionPort,
    portDues, canalTolls, otherExpenses, commissionPct, marketBenchmark
  ]);

  const laytimeResults = useMemo(() => {
    const cargo = Number(laytimeCargo) || 0;
    const rate = Number(loadingRate) || 1;
    const allowedDays = cargo / rate;
    const allowedHours = allowedDays * 24;

    const rawUsed = Number(actualHoursUsed) || 0;
    const weatherDeduction = Number(weatherExclusionHours) || 0;
    const turnDeduction = Number(turnTimeHours) || 0;
    
    const netUsedHours = Math.max(0, rawUsed - weatherDeduction - turnDeduction);
    const varianceHours = netUsedHours - allowedHours;
    const varianceDays = varianceHours / 24;

    const isDemurrage = varianceHours > 0;
    const isDespatch = varianceHours < 0;

    const amount = isDemurrage
      ? Math.round(varianceDays * (Number(demurrageDaily) || 0))
      : isDespatch
      ? Math.round(Math.abs(varianceDays) * (Number(despatchDaily) || 0))
      : 0;

    return {
      allowedDays: allowedDays.toFixed(2),
      allowedHours: Math.round(allowedHours),
      rawUsedHours: rawUsed,
      weatherDeduction,
      turnDeduction,
      netUsedHours: Math.round(netUsedHours),
      netUsedDays: (netUsedHours / 24).toFixed(2),
      varianceHours: Math.abs(Math.round(varianceHours)),
      varianceDays: Math.abs(varianceDays).toFixed(2),
      isDemurrage,
      isDespatch,
      amount
    };
  }, [laytimeCargo, loadingRate, actualHoursUsed, weatherExclusionHours, turnTimeHours, demurrageDaily, despatchDaily]);

  const handleExportCSV = () => {
    if (activeTab === 'tce') {
      const csv = [
        ['Parameter', 'Value', 'Unit'],
        ['Vessel Preset', VESSEL_PRESETS[selectedPreset]?.name || 'Custom', ''],
        ['Cargo Volume', cargoQty, 'MT'],
        ['Freight Rate', freightRate, 'USD/MT'],
        ['Gross Freight Revenue', tceResults.grossRevenue, 'USD'],
        ['Laden Distance', ladenDistance, 'NM'],
        ['Ballast Distance', ballastDistance, 'NM'],
        ['Vessel Speed', speed, 'Knots'],
        ['Total Sea Days', tceResults.seaDays, 'Days'],
        ['Port Days', portDays, 'Days'],
        ['Total Voyage Days', tceResults.totalVoyageDays, 'Days'],
        ['Total Bunker Cost', tceResults.totalBunkerCost, 'USD'],
        ['Port & Canal Dues', tceResults.totalPortAndCanal, 'USD'],
        ['Commissions', tceResults.commissionCost, 'USD'],
        ['Total Voyage Expenses', tceResults.totalExpenses, 'USD'],
        ['Net Voyage Revenue', tceResults.netRevenue, 'USD'],
        ['Daily Net TCE', tceResults.dailyTCE, 'USD/Day'],
        ['Baltic Benchmark TCE', marketBenchmark, 'USD/Day'],
        ['Variance vs Benchmark', tceResults.tceDiffPct + '%', '']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BulkMatrix_TCE_Calculation_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } else {
      const csv = [
        ['Parameter', 'Value', 'Unit'],
        ['Cargo Quantity', laytimeCargo, 'MT'],
        ['Agreed Loading Rate', loadingRate, 'MT/day'],
        ['Terms', laytimeType, ''],
        ['Laytime Allowed', `${laytimeResults.allowedDays} days (${laytimeResults.allowedHours} hrs)`, ''],
        ['Turn Time Deduction', `${laytimeResults.turnDeduction} hrs`, ''],
        ['Weather / Stoppage Exclusions', `${laytimeResults.weatherDeduction} hrs`, ''],
        ['Net Laytime Used', `${laytimeResults.netUsedDays} days (${laytimeResults.netUsedHours} hrs)`, ''],
        ['Outcome', laytimeResults.isDemurrage ? 'DEMURRAGE INCURRED' : laytimeResults.isDespatch ? 'DESPATCH EARNED' : 'ON TIME', ''],
        ['Net Financial Balance', `$${laytimeResults.amount.toLocaleString()}`, 'USD']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BulkMatrix_Laytime_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#122F55', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 6px 0' }}>
            <Calculator size={30} color="#0B82C9" /> Voyage & Laytime Calculator
          </h1>
          <p style={{ fontSize: '14px', color: '#5F7894', margin: 0 }}>
            Precision financial modeling for Time Charter Equivalent (TCE), bunker costs, and laytime / demurrage settlement
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              color: '#122F55',
              border: '1px solid #D9E6EF',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(18,47,85,0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            <FileSpreadsheet size={16} color="#0B82C9" /> Export Breakdown (.CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', padding: '6px', background: '#EAF3F8', borderRadius: '16px', width: 'fit-content', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('tce')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'tce' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'tce' ? '#122F55' : '#5F7894',
            boxShadow: activeTab === 'tce' ? '0 2px 10px rgba(18,47,85,0.08)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <TrendingUp size={17} color={activeTab === 'tce' ? '#0B82C9' : '#5F7894'} />
          TCE & Voyage Estimator
        </button>

        <button
          onClick={() => setActiveTab('laytime')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'laytime' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'laytime' ? '#122F55' : '#5F7894',
            boxShadow: activeTab === 'laytime' ? '0 2px 10px rgba(18,47,85,0.08)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={17} color={activeTab === 'laytime' ? '#FF7426' : '#5F7894'} />
          Laytime & Demurrage Settlement
        </button>
      </div>

      {activeTab === 'tce' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Vessel Preset Selector */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#5F7894', letterSpacing: '0.06em' }}>
                  Quick Vessel Presets
                </span>
                <span style={{ fontSize: '12px', color: '#0B82C9', fontWeight: 600 }}>Standard Dry Bulk Specifications</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {Object.entries(VESSEL_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: selectedPreset === key ? '2px solid #0B82C9' : '1px solid #D9E6EF',
                      background: selectedPreset === key ? '#EAF6FC' : '#F9FCFE',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 700, color: selectedPreset === key ? '#0B82C9' : '#122F55' }}>
                      {preset.name.split(' (')[0]}
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#5F7894' }}>
                      {(preset.dwt / 1000).toFixed(0)}k DWT • {preset.speed} kts
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Cargo & Freight Revenue */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0' }}>
                <DollarSign size={18} color="#16A34A" /> Cargo & Freight Revenue
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Cargo Quantity (Metric Tonnes)
                  </label>
                  <input
                    type="number"
                    value={cargoQty}
                    onChange={e => setCargoQty(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Agreed Freight Rate ($/MT)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={freightRate}
                    onChange={e => setFreightRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Total Commission % (Address + Brokerage)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={commissionPct}
                    onChange={e => setCommissionPct(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Baltic Benchmark ($/day)
                  </label>
                  <input
                    type="number"
                    value={marketBenchmark}
                    onChange={e => setMarketBenchmark(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Voyage Distance & Speed */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0' }}>
                <Anchor size={18} color="#0B82C9" /> Route & Speed Profile
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Laden Distance (Nautical Miles)
                  </label>
                  <input
                    type="number"
                    value={ladenDistance}
                    onChange={e => setLadenDistance(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Ballast Distance (Nautical Miles)
                  </label>
                  <input
                    type="number"
                    value={ballastDistance}
                    onChange={e => setBallastDistance(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Average Speed (Knots)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={speed}
                    onChange={e => setSpeed(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Total Port Days (Load + Discharge)
                  </label>
                  <input
                    type="number"
                    value={portDays}
                    onChange={e => setPortDays(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Fuel Consumption & Port Expenses */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0' }}>
                <Fuel size={18} color="#FF7426" /> Bunkers & Port Expenses
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    VLSFO Sea Consumption (MT/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={vlsfoConsumptionSea}
                    onChange={e => setVlsfoConsumptionSea(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    VLSFO Bunker Price ($/MT)
                  </label>
                  <input
                    type="number"
                    value={vlsfoPrice}
                    onChange={e => setVlsfoPrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Port Dues (Load + Discharge Port) ($)
                  </label>
                  <input
                    type="number"
                    value={portDues}
                    onChange={e => setPortDues(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Canal Tolls / Passages ($)
                  </label>
                  <input
                    type="number"
                    value={canalTolls}
                    onChange={e => setCanalTolls(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Output & TCE Dashboard */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Primary Net TCE Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #122F55 0%, #0A1C33 100%)',
                borderRadius: '24px',
                padding: '28px',
                color: '#FFFFFF',
                boxShadow: '0 12px 36px rgba(18,47,85,0.18)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7EC8F4' }}>
                  Daily Net Time Charter Equivalent (TCE)
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: tceResults.tceDiff >= 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)',
                    color: tceResults.tceDiff >= 0 ? '#4ADE80' : '#F87171',
                    border: `1px solid ${tceResults.tceDiff >= 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`
                  }}
                >
                  {tceResults.tceDiff >= 0 ? `+${tceResults.tceDiffPct}% vs Market` : `${tceResults.tceDiffPct}% vs Market`}
                </span>
              </div>

              <div style={{ fontSize: '46px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '12px', color: '#FFFFFF' }}>
                ${tceResults.dailyTCE.toLocaleString()}<span style={{ fontSize: '20px', fontWeight: 600, color: '#94A3B8' }}>/day</span>
              </div>

              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '0 0 20px 0' }}>
                Baltic Benchmark: <strong style={{ color: '#FFFFFF' }}>${marketBenchmark.toLocaleString()}/day</strong> • Spread: <strong style={{ color: tceResults.tceDiff >= 0 ? '#4ADE80' : '#F87171' }}>{tceResults.tceDiff >= 0 ? '+' : ''}${tceResults.tceDiff.toLocaleString()}/day</strong>
              </p>

              <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${Math.min(100, Math.max(0, tceResults.netMarginPct))}%`, height: '100%', background: '#0B82C9', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
                <span>Net Voyage Margin: <strong style={{ color: '#FFFFFF' }}>{tceResults.netMarginPct}%</strong></span>
                <span>Total Duration: <strong style={{ color: '#FFFFFF' }}>{tceResults.totalVoyageDays} days</strong></span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', margin: '0 0 16px 0' }}>
                Voyage P&L Statement
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Gross Freight Revenue ({cargoQty.toLocaleString()} MT @ ${freightRate}/MT)</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A' }}>+${tceResults.grossRevenue.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Commissions ({commissionPct}% Address + Broker)</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>-${tceResults.commissionCost.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Bunker Fuel ({tceResults.vlsfoTotalMT} MT VLSFO + {tceResults.mgoTotalMT} MT MGO)</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>-${tceResults.totalBunkerCost.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Port & Canal Tolls (Load/Disch + Canal)</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>-${tceResults.totalPortAndCanal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#122F55' }}>Net Voyage Profit</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#0B82C9' }}>${tceResults.netRevenue.toLocaleString()}</span>
                </div>
              </div>

              {/* Expense Allocation Distribution */}
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#5F7894', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Expense Distribution (% of Total Outlay)
                </p>
                <div style={{ height: '10px', borderRadius: '6px', overflow: 'hidden', display: 'flex', background: '#E2E8F0' }}>
                  <div style={{ width: `${tceResults.bunkerPct}%`, background: '#FF7426' }} title={`Bunkers ${tceResults.bunkerPct}%`} />
                  <div style={{ width: `${tceResults.portPct}%`, background: '#0B82C9' }} title={`Ports ${tceResults.portPct}%`} />
                  <div style={{ width: `${tceResults.commPct}%`, background: '#8B5CF6' }} title={`Commissions ${tceResults.commPct}%`} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5F7894', marginTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#FF7426' }} /> Fuel {tceResults.bunkerPct}%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#0B82C9' }} /> Ports {tceResults.portPct}%</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#8B5CF6' }} /> Comm {tceResults.commPct}%</span>
                </div>
              </div>
            </div>

            {/* Time Breakdown Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '20px', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#5F7894', margin: '0 0 4px 0', fontWeight: 600 }}>Laden Sea</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#122F55', margin: 0 }}>{tceResults.ladenSeaDays}d</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#5F7894', margin: '0 0 4px 0', fontWeight: 600 }}>Ballast Sea</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#122F55', margin: 0 }}>{tceResults.ballastSeaDays}d</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#5F7894', margin: '0 0 4px 0', fontWeight: 600 }}>Port Ops</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#122F55', margin: 0 }}>{portDays}d</p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0' }}>
                <Scale size={18} color="#0B82C9" /> Charterparty Laytime Clauses
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Cargo Quantity (Metric Tonnes)
                  </label>
                  <input
                    type="number"
                    value={laytimeCargo}
                    onChange={e => setLaytimeCargo(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Agreed Load/Discharge Rate (MT/day)
                  </label>
                  <input
                    type="number"
                    value={loadingRate}
                    onChange={e => setLoadingRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Laytime Terms
                  </label>
                  <select
                    value={laytimeType}
                    onChange={e => setLaytimeType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box', background: '#FFFFFF' }}
                  >
                    <option value="SHINC">SHINC (Sundays & Holidays Included)</option>
                    <option value="SSHEX">SSHEX (Sat/Sun/Holidays Excluded)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Agreed Demurrage Rate ($/day)
                  </label>
                  <input
                    type="number"
                    value={demurrageDaily}
                    onChange={e => setDemurrageDaily(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Despatch Rate ($/day) [Normally 50% Demurrage]
                  </label>
                  <input
                    type="number"
                    value={despatchDaily}
                    onChange={e => setDespatchDaily(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    NOR Turn Time (Hours)
                  </label>
                  <input
                    type="number"
                    value={turnTimeHours}
                    onChange={e => setTurnTimeHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Statement of Facts & Delays */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0' }}>
                <Clock size={18} color="#FF7426" /> Statement of Facts (Actual Time Log)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Total Port Stoppage / Elapsed Time (Hours)
                  </label>
                  <input
                    type="number"
                    value={actualHoursUsed}
                    onChange={e => setActualHoursUsed(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: '#5F7894', marginTop: '4px', display: 'block' }}>
                    {(actualHoursUsed / 24).toFixed(1)} calendar days total
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#5F7894', marginBottom: '6px' }}>
                    Weather / Rain / Stoppage Deduction (Hours)
                  </label>
                  <input
                    type="number"
                    value={weatherExclusionHours}
                    onChange={e => setWeatherExclusionHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D9E6EF', fontSize: '14px', fontWeight: 600, color: '#122F55', boxSizing: 'border-box' }}
                  />
                  <span style={{ fontSize: '11px', color: '#5F7894', marginTop: '4px', display: 'block' }}>
                    Deducted from time counted per charterparty
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Laytime Settlement Card */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div
              style={{
                background: laytimeResults.isDemurrage
                  ? 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)'
                  : laytimeResults.isDespatch
                  ? 'linear-gradient(135deg, #14532D 0%, #052E16 100%)'
                  : 'linear-gradient(135deg, #122F55 0%, #0A1C33 100%)',
                borderRadius: '24px',
                padding: '28px',
                color: '#FFFFFF',
                boxShadow: '0 12px 36px rgba(18,47,85,0.18)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                  Laytime Settlement Result
                </span>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF'
                  }}
                >
                  {laytimeResults.isDemurrage ? 'DEMURRAGE INCURRED' : laytimeResults.isDespatch ? 'DESPATCH EARNED' : 'ON SCHEDULE'}
                </span>
              </div>

              <div style={{ fontSize: '44px', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '12px' }}>
                ${laytimeResults.amount.toLocaleString()}
              </div>

              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                {laytimeResults.isDemurrage ? (
                  <>Vessel exceeded laytime by <strong>{laytimeResults.varianceDays} days</strong> ({laytimeResults.varianceHours} hrs). Charterer owes shipowner demurrage.</>
                ) : laytimeResults.isDespatch ? (
                  <>Vessel finished <strong>{laytimeResults.varianceDays} days</strong> ({laytimeResults.varianceHours} hrs) ahead of laytime. Shipowner pays charterer despatch.</>
                ) : (
                  <>Operations completed exactly within permitted laytime.</>
                )}
              </p>
            </div>

            {/* Time Accounting Breakdown */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D9E6EF', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(18,47,85,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#122F55', margin: '0 0 16px 0' }}>
                Laytime Time Sheet
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Permitted Laytime Allowed ({laytimeCargo.toLocaleString()} MT / {loadingRate} MT/day)</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#122F55' }}>{laytimeResults.allowedDays} days ({laytimeResults.allowedHours}h)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Total Gross Elapsed Time in Port</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#122F55' }}>{laytimeResults.rawUsedHours} hours</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Less NOR Turn Time</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>-{laytimeResults.turnDeduction} hours</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F0F7FC' }}>
                  <span style={{ fontSize: '13px', color: '#5F7894' }}>Less Weather / Stoppage Deduction</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A' }}>-{laytimeResults.weatherDeduction} hours</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#122F55' }}>Net Laytime Counted</span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: laytimeResults.isDemurrage ? '#DC2626' : '#16A34A' }}>
                    {laytimeResults.netUsedDays} days ({laytimeResults.netUsedHours}h)
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default VoyageCalculator;
