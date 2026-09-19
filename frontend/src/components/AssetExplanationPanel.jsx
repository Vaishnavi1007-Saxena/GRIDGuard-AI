import React from 'react';
import { Search, Zap, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AssetExplanationPanel({
  selectedAsset,
  activeFaults,
  onToggleFault,
  onRestoreNominal
}) {
  // Default fallback to BESS if nothing explicitly selected
  const asset = selectedAsset || {
    id: 'bess',
    faultKey: 'battery',
    icon: '🔋',
    name: 'BESS Central Battery Storage',
    feeder: 'Storage Bus (11 kV)',
    rating: 'Capacity: 50 MWh / 20 MW',
    rootCause: 'Battery intelligently buffers deficits and absorbs excess solar/wind generation.',
    freqImpact: 'Severe frequency volatility (Loss of inertia buffer)',
    voltImpact: 'Unmitigated voltage sag during load surges',
    loadingImpact: 'High risk of cascade transmission line overload',
    bessCompensation: '0.0 MW (LOCKED OUT / OFFLINE)',
    aiActions: [
      'Guard AI activates emergency load-shedding protocol.',
      'Industrial interruptible tariffs triggered to drop non-critical load.',
      'Substation protection set to fast-trip mode.'
    ]
  };

  const isHospital = asset.id === 'hospital' || asset.isProtected;
  const isFaulted = asset.faultKey ? (activeFaults && activeFaults[asset.faultKey]) : false;

  return (
    <div style={{
      backgroundColor: '#090e17',
      border: `1px solid ${isHospital ? '#a855f7' : isFaulted ? '#ef4444' : '#1e293b'}`,
      borderRadius: '8px',
      padding: '16px 20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      boxShadow: isHospital
        ? '0 8px 30px rgba(168, 85, 247, 0.3)'
        : isFaulted
        ? '0 8px 30px rgba(239, 68, 68, 0.3)'
        : '0 8px 30px rgba(0,0,0,0.5)'
    }}>
      {/* 1. Header: Asset Title & Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: '12px',
        borderBottom: '1px solid #141f32'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{asset.icon || '⚡'}</span>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: isHospital ? '#e9d5ff' : '#f8fafc' }}>
              {asset.name}
            </h3>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
            {asset.feeder} • {asset.rating}
          </p>
        </div>

        {/* Status Badge */}
        {isHospital ? (
          <div style={{
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid #a855f7',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '10.5px',
            fontWeight: '900',
            color: '#d8b4fe',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Shield size={12} color="#a855f7" />
            CRITICAL LIFE-SAFETY (IMMUNE)
          </div>
        ) : (
          <div style={{
            backgroundColor: isFaulted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${isFaulted ? '#ef4444' : '#10b981'}`,
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '10.5px',
            fontWeight: 'bold',
            color: isFaulted ? '#f87171' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isFaulted ? 'FAULT ACTIVE (STRESSED)' : 'NOMINAL (NORMAL)'}
          </div>
        )}
      </div>

      {/* 2. SECTION 1: WHY IS IT HAPPENING? (ROOT CAUSE) */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Search size={13} color="#38bdf8" />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '0.4px' }}>
            WHY IS IT HAPPENING? (ROOT CAUSE)
          </span>
        </div>
        <div style={{
          backgroundColor: '#0c1220',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '10px 12px',
          fontSize: '11px',
          lineHeight: '1.45',
          color: '#cbd5e1'
        }}>
          {isHospital ? (
            'The hospital represents the highest priority life-safety node on the digital twin. It is locked behind deterministic hardware-layer interlocks and dual redundant substation ties to guarantee zero interruption under any city disturbance.'
          ) : isFaulted ? (
            asset.faultKey === 'ev' ? 'Simultaneous uncoordinated arrival of 60+ commercial delivery fleet vans at 150 kW DC fast chargers during morning departure. Feeder capacity severely stressed.' :
            asset.faultKey === 'solar' ? 'Dense storm clouds swept across the 35 MW photovoltaic field, causing sudden 65% drop in scheduled renewable generation within seconds.' :
            asset.faultKey === 'wind' ? 'Meteorological air stall dropped local wind velocity below turbine cut-in speed, halving coastal active generation.' :
            asset.faultKey === 'industrial' ? 'Simultaneous inrush startup of heavy industrial arc furnaces and large induction motors drawing massive reactive current.' :
            asset.faultKey === 'datacenter' ? 'Massive distributed AI model training job triggered simultaneously across 10,000+ liquid-cooled GPUs, causing +120% power surge.' :
            asset.faultKey === 'battery' ? 'Thermal safety trip or DC-bus inverter breaker disconnected the 50 MWh BESS system, eliminating the grid synthetic inertia buffer.' :
            asset.rootCause
          ) : asset.rootCause}
        </div>
      </div>

      {/* 3. SECTION 2: ELECTRICAL PHYSICAL IMPACT (2x2 Grid) */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Zap size={13} color="#f59e0b" />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '0.4px' }}>
            ELECTRICAL PHYSICAL IMPACT
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
          {/* Card 1: Frequency */}
          <div style={impactCardStyle}>
            <span style={impactLabelStyle}>Frequency Impact</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: isHospital ? '#a855f7' : isFaulted ? '#f87171' : '#34d399' }}>
              {isHospital ? 'Immune (50.00 Hz Lock)' : isFaulted ? (asset.freqImpact || 'Severe frequency volatility') : 'Δf = +0.00 Hz (Stable 50.00 Hz)'}
            </span>
          </div>

          {/* Card 2: Voltage */}
          <div style={impactCardStyle}>
            <span style={impactLabelStyle}>Voltage Sag</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: isHospital ? '#a855f7' : isFaulted ? '#fb923c' : '#38bdf8' }}>
              {isHospital ? 'Regulated 1.000 pu' : isFaulted ? (asset.voltImpact || 'Unmitigated voltage sag') : 'ΔV = +0.000 pu (Nominal 1.000 pu)'}
            </span>
          </div>

          {/* Card 3: Line Loading */}
          <div style={impactCardStyle}>
            <span style={impactLabelStyle}>Line Loading</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: isHospital ? '#34d399' : isFaulted ? '#facc15' : '#a7f3d0' }}>
              {isHospital ? '48% (Dedicated Feeder)' : isFaulted ? (asset.loadingImpact || 'High line stress') : '71.4% (Nominal Capacity)'}
            </span>
          </div>

          {/* Card 4: BESS Compensation */}
          <div style={impactCardStyle}>
            <span style={impactLabelStyle}>BESS Compensation</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: isFaulted && asset.faultKey === 'battery' ? '#f87171' : '#34d399' }}>
              {isHospital ? 'Priority Feeder Lock' : isFaulted ? (asset.bessCompensation || (asset.faultKey === 'battery' ? '0.0 MW (LOCKED OUT / OFFLINE)' : 'Discharging +18.0 MW Peak')) : '+15.0 MW Dynamic Buffer'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. SECTION 3: GUARD AI AUTOMATED ACTION */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Shield size={13} color="#00f0ff" />
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#00f0ff', letterSpacing: '0.4px' }}>
            GUARD AI AUTOMATED ACTION
          </span>
        </div>

        <div style={{
          backgroundColor: '#0c1220',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '11px',
          lineHeight: '1.5',
          color: '#cbd5e1'
        }}>
          {(asset.aiActions || [
            'Guard AI activates emergency load-shedding protocol.',
            'Industrial interruptible tariffs triggered to drop non-critical load.',
            'Substation protection set to fast-trip mode.'
          ]).map((action, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00f0ff', display: 'inline-block' }} />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. BOTTOM ACTION BUTTONS */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid #141f32'
      }}>
        {asset.faultKey ? (
          <button
            onClick={() => onToggleFault(asset.faultKey)}
            style={{
              flex: 2,
              backgroundColor: isFaulted ? '#b91c1c' : '#ea580c',
              backgroundImage: isFaulted
                ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '9px 14px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: isFaulted ? '0 4px 15px rgba(220, 38, 38, 0.4)' : '0 4px 15px rgba(234, 88, 12, 0.35)'
            }}
          >
            <Zap size={14} fill="#ffffff" />
            {isFaulted ? 'Deactivate Fault on This Asset' : 'Inject Fault on This Asset'}
          </button>
        ) : (
          <div style={{
            flex: 2,
            backgroundColor: isHospital ? 'rgba(168, 85, 247, 0.15)' : '#0f172a',
            border: `1px solid ${isHospital ? '#a855f7' : '#334155'}`,
            borderRadius: '6px',
            padding: '9px 14px',
            fontSize: '11px',
            color: isHospital ? '#e9d5ff' : '#94a3b8',
            fontWeight: isHospital ? 'bold' : 'normal',
            textAlign: 'center'
          }}>
            {isHospital ? '🛡️ Hospital 100% Protected — Shedding Immune' : 'Asset Protected / No Manual Fault'}
          </div>
        )}

        <button
          onClick={onRestoreNominal}
          style={{
            flex: 1,
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#cbd5e1',
            padding: '9px 14px',
            fontSize: '11.5px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          Restore Nominal
        </button>
      </div>
    </div>
  );
}

const impactCardStyle = {
  backgroundColor: '#070b14',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '3px'
};

const impactLabelStyle = {
  fontSize: '9.5px',
  color: '#64748b',
  fontWeight: '600'
};
