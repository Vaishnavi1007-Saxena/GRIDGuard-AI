import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Shield, Box, Layers } from 'lucide-react';
import Spatial3DGrid from '../components/Spatial3DGrid';
import Topology2DMap from '../components/Topology2DMap';
import AssetExplanationPanel from '../components/AssetExplanationPanel';
import DualTrajectoryPlots from '../components/DualTrajectoryPlots';
import ChatbotDrawer from '../components/ChatbotDrawer';
import CoverLandingPage from '../components/CoverLandingPage';
import AIPredictionDashboard from '../components/AIPredictionDashboard';
import TeamDashboard from '../components/TeamDashboard';
import {
  computeSimulationTrajectory,
  INITIAL_FAULTS,
  SIMULATION_DURATION
} from '../services/gridSimulationEngine';

export default function Dashboard() {
  // Simulation State
  const [activeFaults, setActiveFaults] = useState(INITIAL_FAULTS);
  const [activeTab, setActiveTab] = useState('cover'); // 'cover', 'intro', 'twin', 'matrix', 'team'
  const [currentTime, setCurrentTime] = useState(0); // 0 to 300 seconds
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 5x
  const [viewMode, setViewMode] = useState('2d'); // Default to 2D Topology Map as in Image 2
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Recompute 301-step simulation trajectory whenever faults change
  const [trajectory, setTrajectory] = useState(() => computeSimulationTrajectory(INITIAL_FAULTS));

  useEffect(() => {
    const traj = computeSimulationTrajectory(activeFaults);
    setTrajectory(traj);
  }, [activeFaults]);

  // Simulation Clock Tick Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 1000 / speedMultiplier;
    const timer = setInterval(() => {
      setCurrentTime(t => {
        if (t >= SIMULATION_DURATION) {
          return 0; // Loop seamlessly
        }
        return t + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier]);

  const currentPoint = trajectory[currentTime] || trajectory[0];

  // Count active faults
  const activeFaultsCount = Object.values(activeFaults).filter(Boolean).length;

  // Manual Fault Toggles
  const handleToggleFault = (key) => {
    setActiveFaults(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      populateInspectorForFault(key, updated[key]);
      return updated;
    });
  };

  const handleClearAllFaults = () => {
    setActiveFaults(INITIAL_FAULTS);
    // Reset selected asset to nominal BESS
    populateInspectorForFault('battery', false);
  };

  const populateInspectorForFault = (key, isNowActive = true) => {
    const catalog = {
      ev: {
        id: 'ev', faultKey: 'ev', icon: '⚡', name: 'EV Fast-Charging Hub', feeder: 'EV Hub Bus 4 (11 kV)', rating: '7.0 MW -> 25.0 MW',
        rootCause: 'Simultaneous uncoordinated arrival of 60+ commercial delivery fleet vans at 150 kW DC fast chargers during morning departure. Feeder capacity severely stressed.',
        freqImpact: 'Δf: -0.64 Hz (49.36 Hz Dip)', voltImpact: 'ΔV: -0.016 pu (0.984 pu Sag)', loadingImpact: '84.4% (+14.4% Feeder Stress)', bessCompensation: 'Discharging at +18.0 MW max',
        aiActions: [
          'Guard AI dispatches +18 MW emergency battery discharge.',
          'Dynamic demand-response throttles depot chargers by 25%.',
          'Feeder 4 priority protection armed for autonomous fast-trip.'
        ]
      },
      solar: {
        id: 'solar', faultKey: 'solar', icon: '☀️', name: 'Solar Photovoltaic Farm', feeder: 'Renewable Bus 5 (11 kV)', rating: '35.0 MW Peak',
        rootCause: 'A dense convective storm cloud bank sweeps across the 35 MW photovoltaic farm, dropping solar irradiance by 65% within seconds. Sudden scheduled renewable generation loss.',
        freqImpact: 'Δf: -0.55 Hz (49.45 Hz Dip)', voltImpact: 'ΔV: -0.012 pu (0.988 pu Sag)', loadingImpact: '78.2% (Moderate Stress)', bessCompensation: 'Discharging at +15.0 MW',
        aiActions: [
          'Guard AI ramps BESS to +15.0 MW to cushion generation drop.',
          'Spinning reserve dispatched from utility grid interconnect.',
          'Solar inverter smart reactive power injection activated.'
        ]
      },
      wind: {
        id: 'wind', faultKey: 'wind', icon: '💨', name: 'Coastal Wind Turbine Farm', feeder: 'Renewable Bus 6 (11 kV)', rating: '20.0 MW Base',
        rootCause: 'A sudden meteorological air stall causes wind speeds to drop below turbine cut-in and optimal pitch velocity. Active generation drops by half across all turbine nacelles.',
        freqImpact: 'Δf: -0.32 Hz (49.68 Hz)', voltImpact: 'ΔV: -0.008 pu (0.992 pu)', loadingImpact: '74.5% (Nominal Buffer)', bessCompensation: 'Discharging at +8.0 MW',
        aiActions: [
          'Guard AI initiates synthetic inertia discharge via BESS.',
          'Turbine blade pitch control commanded to stall compensation.',
          'Automatic Generation Control (AGC) commands ramp signal.'
        ]
      },
      industrial: {
        id: 'industrial', faultKey: 'industrial', icon: '🏭', name: 'Heavy Industrial Complex', feeder: 'Industrial Feeder Bus 3 (11 kV)', rating: '30.0 MW -> 45.0 MW',
        rootCause: 'Simultaneous startup of multiple megawatt-scale industrial arc furnaces and large induction motors at the steel facility. Massive inrush currents depress local feeder voltage.',
        freqImpact: 'Δf: -0.48 Hz (49.52 Hz Dip)', voltImpact: 'ΔV: -0.024 pu (0.976 pu Sag)', loadingImpact: '82.0% (+12.0% Line Stress)', bessCompensation: 'STATCOM & Reactive Support',
        aiActions: [
          'STATCOM & BESS engaged for rapid reactive power stabilization.',
          'Industrial interruptible tariffs triggered to drop non-critical load.',
          'Substation tap-changer stepped up to support bus voltage.'
        ]
      },
      datacenter: {
        id: 'datacenter', faultKey: 'datacenter', icon: '💻', name: 'Hyperscale AI GPU Data Center', feeder: 'Compute Bus 2 (11 kV)', rating: '10.0 MW -> 22.0 MW',
        rootCause: 'A massive distributed LLM training job initializes simultaneously across 10,000+ liquid-cooled GPUs. Power consumption spikes abruptly by +120%, stressing step-down transformers.',
        freqImpact: 'Δf: -0.38 Hz (49.62 Hz)', voltImpact: 'ΔV: -0.010 pu (0.990 pu)', loadingImpact: '79.6% (Thermal Stress)', bessCompensation: 'Discharging +12.0 MW',
        aiActions: [
          'Dynamic peak shaving dispatched to cushion transformer heating.',
          'AI cluster power telemetry fed to Guard AI optimizer.',
          'Feeder 2 backup cooling circuits prioritized.'
        ]
      },
      battery: {
        id: 'bess', faultKey: 'battery', icon: '🔋', name: 'BESS Central Battery Storage', feeder: 'Storage Bus (11 kV)', rating: 'Capacity: 50 MWh / 20 MW',
        rootCause: isNowActive
          ? 'Thermal runaway protection sensors or high-voltage DC bus inverter breaker trips offline. The grid loses its primary stabilizing buffer, leaving frequency swings unhedged.'
          : 'Battery intelligently buffers deficits and absorbs excess solar/wind generation.',
        freqImpact: 'Severe frequency volatility (Loss of inertia buffer)',
        voltImpact: 'Unmitigated voltage sag during load surges',
        loadingImpact: 'High risk of cascade transmission line overload',
        bessCompensation: isNowActive ? '0.0 MW (LOCKED OUT / OFFLINE)' : '+15.0 MW Dynamic Buffer',
        aiActions: [
          'Guard AI activates emergency load-shedding protocol.',
          'Industrial interruptible tariffs triggered to drop non-critical load.',
          'Substation protection set to fast-trip mode.'
        ]
      }
    };

    if (catalog[key]) {
      setSelectedAsset(catalog[key]);
    }
  };

  const handleSelectAsset = (asset) => {
    if (asset.faultKey) {
      populateInspectorForFault(asset.faultKey, activeFaults[asset.faultKey]);
    } else {
      setSelectedAsset({
        id: asset.id,
        faultKey: null,
        icon: asset.isProtected ? '🏥' : '🏢',
        name: asset.label || asset.name,
        feeder: asset.isProtected ? 'Feeder 1 (Life-Safety Priority Feeder)' : '11 kV Feeder Bus',
        rating: asset.mw || asset.sub || 'Municipal Load',
        rootCause: asset.isProtected
          ? 'Critical life-safety infrastructure protected by deterministic PLC interlocks. 100% immune from shedding or curtailment.'
          : 'Operational load balanced across municipal distribution network.',
        freqImpact: 'Δf: +0.00 Hz (Nominal)',
        voltImpact: 'ΔV: +0.000 pu (Nominal)',
        loadingImpact: `${currentPoint.lineLoading.toFixed(0)}% (Nominal)`,
        bessCompensation: 'Nominal Dynamic Buffer',
        aiActions: [
          'Continuous real-time frequency & voltage supervision active.',
          'Life-safety feeder bypass interlocks engaged and locked.',
          'Dual redundant backup grid interconnect verified healthy.'
        ]
      });
    }
  };

  // Format Clock MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Master Grid Status Badge
  const getStatusBadgeStyle = () => {
    if (currentPoint.status === 'CRITICAL') {
      return {
        bg: 'rgba(239, 68, 68, 0.25)',
        border: '#ef4444',
        text: '#f87171',
        dot: '#ef4444',
        label: 'GRID: CRITICAL'
      };
    } else if (currentPoint.status === 'WARNING') {
      return {
        bg: 'rgba(245, 158, 11, 0.25)',
        border: '#f59e0b',
        text: '#fbbf24',
        dot: '#f59e0b',
        label: 'GRID: WARNING'
      };
    }
    return {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: '#34d399',
      dot: '#10b981',
      label: 'GRID: NORMAL'
    };
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '14px 18px', color: '#f8fafc' }}>
      
      {/* ---------------- STREAMLINED CYBER-PHYSICAL TOP COMMAND BAR ---------------- */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '12px',
        padding: '8px 16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Left: Brand Identity */}
        <div
          onClick={() => setActiveTab('cover')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{
              fontSize: '15px',
              fontWeight: '900',
              letterSpacing: '-0.3px',
              background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GridGuard AI
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Autonomous Grid Defense
            </div>
          </div>
        </div>

        {/* Center: Multi-Dashboard Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          padding: '2px 0'
        }}>
          {[
            { id: 'cover', label: 'GridGuard AI', icon: '⚡' },
            { id: 'twin', label: '1. Fault & Digital Twin City', icon: '🏙️' },
            { id: 'matrix', label: '2. The Matrix', icon: '🧠' },
            { id: 'team', label: '3. Engineering Team', icon: '👥' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Badges & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Grid Status Badge */}
          <div style={{
            backgroundColor: badgeStyle.bg,
            border: `1px solid ${badgeStyle.border}`,
            borderRadius: '16px',
            padding: '3px 10px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: badgeStyle.text,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: badgeStyle.dot }} />
            {badgeStyle.label}
          </div>

          {/* Clock */}
          <div style={{
            fontFamily: 'Fira Code, monospace',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#f8fafc',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '6px',
            padding: '3px 8px'
          }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </header>

      {/* Page 0: Cover / Landing Page with Left-Side Page Pointers */}
      {activeTab === 'cover' && (
        <CoverLandingPage onSelectPage={(pageId) => setActiveTab(pageId)} />
      )}

      {/* Page 2: The Matrix (AI Predictive Risk & Prescriptive Mitigation) */}
      {activeTab === 'matrix' && (
        <AIPredictionDashboard
          currentPoint={currentPoint}
          activeFaults={activeFaults}
          onApplyMitigation={handleClearAllFaults}
        />
      )}

      {/* Page 4: Engineering Team */}
      {activeTab === 'team' && (
        <TeamDashboard />
      )}

      {/* Page 2: Fault and the Digital Twin City */}
      {activeTab === 'twin' && (
        <>
      {/* ---------------- 2. TRANSPORT CONTROLS & SCRUBBER (MATCHING IMAGE 1) ---------------- */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '8px 14px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Play / Pause (Purple/Blue) */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              backgroundColor: isPlaying ? '#4338ca' : '#1e293b',
              backgroundImage: isPlaying ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'none',
              border: 'none',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isPlaying ? '0 2px 10px rgba(79, 70, 229, 0.4)' : 'none'
            }}
          >
            {isPlaying ? <Pause size={12} fill="#ffffff" /> : <Play size={12} fill="#ffffff" />}
            {isPlaying ? 'Play' : 'Play'}
          </button>

          {/* Reset Time */}
          <button
            onClick={() => setCurrentTime(0)}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} /> Reset Time
          </button>

          {/* 1x 2x 5x Speed Multipliers */}
          <div style={{ display: 'flex', backgroundColor: '#070b13', border: '1px solid #334155', borderRadius: '6px', padding: '2px' }}>
            {[1, 2, 5].map(spd => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                style={{
                  backgroundColor: speedMultiplier === spd ? '#1e293b' : 'transparent',
                  color: speedMultiplier === spd ? '#38bdf8' : '#64748b',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 300s Time Slider */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>0s</span>
          <input
            type="range"
            min="0"
            max={SIMULATION_DURATION}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#6366f1', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>300s</span>
          <span style={{
            fontSize: '10px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            backgroundColor: '#070b13',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #1e293b'
          }}>
            {currentTime}s
          </span>
        </div>

        {/* Clear All Active Faults */}
        <button
          onClick={handleClearAllFaults}
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            color: '#cbd5e1',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Shield size={12} color="#38bdf8" />
          Clear All Active Faults
        </button>
      </div>

      {/* ---------------- 3. MANUAL FAULT INJECTION DECK (MATCHING IMAGE 1) ---------------- */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f8fafc', letterSpacing: '0.4px' }}>
              MANUAL FAULT INJECTION DECK
            </span>
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
              (Click any scenario to inject / remove fault)
            </span>
          </div>

          <div style={{
            backgroundColor: activeFaultsCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${activeFaultsCount > 0 ? '#ef4444' : '#10b981'}`,
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: activeFaultsCount > 0 ? '#f87171' : '#34d399'
          }}>
            • {activeFaultsCount} Faults Active ({activeFaultsCount > 0 ? 'Grid Stressed' : 'Nominal Grid'})
          </div>
        </div>

        {/* 6 Fault Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px' }}>
          {[
            { key: 'ev', icon: '⚡', title: 'EV Surge', desc: 'Fleet fast-charge spike (+18 MW)' },
            { key: 'solar', icon: '☁', title: 'Solar Drop', desc: 'Cloud cover shade (-65% Solar)' },
            { key: 'wind', icon: '💨', title: 'Wind Stall', desc: 'Turbine drop (-50% Wind)' },
            { key: 'industrial', icon: '🏭', title: 'Industrial Spike', desc: 'Motor startup surge (+15 MW)' },
            { key: 'datacenter', icon: '💻', title: 'AI Data Spike', desc: 'GPU cluster surge (+12 MW)' },
            { key: 'battery', icon: '🔋', title: 'BESS Outage', desc: 'Inverter trip (0 MW support)' }
          ].map(f => {
            const active = activeFaults[f.key];
            return (
              <button
                key={f.key}
                onClick={() => handleToggleFault(f.key)}
                style={{
                  backgroundColor: active ? '#2d1215' : '#0c1220',
                  border: `1px solid ${active ? '#ef4444' : '#1e293b'}`,
                  borderRadius: '6px',
                  padding: '8px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: active ? '#fca5a5' : '#f8fafc' }}>
                    {f.icon} {f.title}
                  </span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: active ? '#ef4444' : '#334155'
                  }} />
                </div>
                <div style={{ fontSize: '9.5px', color: active ? '#f87171' : '#94a3b8', marginTop: '3px' }}>
                  {f.desc}
                </div>
                <div style={{ fontSize: '8.5px', color: active ? '#ef4444' : '#64748b', marginTop: '2px', fontWeight: 'bold' }}>
                  {active ? 'Active' : 'Inactive'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- 4. SIX KPI CARDS (MATCHING IMAGE 1) ---------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {/* KPI 1: Grid Health */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>GRID HEALTH</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: currentPoint.health < 70 ? '#ef4444' : currentPoint.health < 90 ? '#f59e0b' : '#34d399' }}>
              {currentPoint.health.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>%</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{
              width: `${currentPoint.health}%`,
              height: '100%',
              backgroundColor: currentPoint.health < 70 ? '#ef4444' : currentPoint.health < 90 ? '#f59e0b' : '#10b981'
            }} />
          </div>
        </div>

        {/* KPI 2: Frequency */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>FREQUENCY</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: Math.abs(currentPoint.freq - 50.0) > 0.2 ? '#ef4444' : '#f8fafc' }}>
              {currentPoint.freq.toFixed(2)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Hz</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
            <span>Δ {(currentPoint.freq - 50.0) >= 0 ? `+${(currentPoint.freq - 50.0).toFixed(2)}` : (currentPoint.freq - 50.0).toFixed(2)} Hz</span>
            <span>Nominal: 50.0</span>
          </div>
        </div>

        {/* KPI 3: Voltage */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>VOLTAGE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: currentPoint.volt < 0.96 ? '#ef4444' : '#f8fafc' }}>
              {currentPoint.volt.toFixed(3)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>pu</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
            <span>Δ {(currentPoint.volt - 1.0) >= 0 ? `+${(currentPoint.volt - 1.0).toFixed(3)}` : (currentPoint.volt - 1.0).toFixed(3)} pu</span>
            <span>11 kV Bus</span>
          </div>
        </div>

        {/* KPI 4: Total Load */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>TOTAL LOAD</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#f59e0b' }}>
              {currentPoint.Pload.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>MW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
            <span>Base: 100 MW</span>
            <span>+{(currentPoint.Pload - 100.0).toFixed(1)} MW</span>
          </div>
        </div>

        {/* KPI 5: Generation */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>GENERATION</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>
              {currentPoint.Pgen.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>MW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
            <span>Solar+Wind: {(currentPoint.Psolar + currentPoint.Pwind).toFixed(1)} MW</span>
            <span>Util: 65 MW</span>
          </div>
        </div>

        {/* KPI 6: Battery SOC */}
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>BATTERY SOC</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#818cf8' }}>
              {currentPoint.currentSOC.toFixed(1)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
            <span>P: {currentPoint.Pbatt >= 0 ? `+${currentPoint.Pbatt.toFixed(1)}` : currentPoint.Pbatt.toFixed(1)} MW</span>
            <span>Cap: 50 MWh</span>
          </div>
        </div>
      </div>

      {/* ---------------- 5. MIDDLE SPLIT SECTION (EXACTLY MATCHING IMAGE 2) ---------------- */}
      {/* 50% LEFT: VISUALIZATION CONTAINER | 50% RIGHT: EXPLANATION & FAULT INJECTION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '14px',
        marginBottom: '14px'
      }}>
        {/* LEFT HALF: VISUALIZATION (City Electrical Topology Map / 3D Living City) */}
        <div style={{
          backgroundColor: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          {/* Card Header matching Image 2 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            backgroundColor: '#0c1220',
            borderBottom: '1px solid #1e293b'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00f0ff', display: 'inline-block' }} />
                <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#f8fafc', letterSpacing: '0.4px' }}>
                  City Electrical Topology Map
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748b' }}>
                Click any facility directly on the map to inspect or inject custom loads
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                backgroundColor: '#070b13',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '10px',
                fontFamily: 'monospace',
                color: '#94a3b8'
              }}>
                11 kV Distribution
              </span>

              {/* Seamless 2D / 3D Switcher */}
              <div style={{ display: 'flex', backgroundColor: '#070b13', border: '1px solid #334155', borderRadius: '4px', padding: '1px' }}>
                <button
                  onClick={() => setViewMode('2d')}
                  title="2D Electrical Topology Map"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '9.5px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === '2d' ? '#0284c7' : 'transparent',
                    color: viewMode === '2d' ? '#ffffff' : '#64748b'
                  }}
                >
                  <Layers size={11} /> 2D Map
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  title="3D Living City"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '9.5px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === '3d' ? '#0284c7' : 'transparent',
                    color: viewMode === '3d' ? '#ffffff' : '#64748b'
                  }}
                >
                  <Box size={11} /> 3D City
                </button>
              </div>
            </div>
          </div>

          {/* Viewport content */}
          <div style={{ flex: 1, minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            {viewMode === '2d' ? (
              <Topology2DMap
                activeFaults={activeFaults}
                selectedAssetId={selectedAsset?.id}
                onSelectAsset={handleSelectAsset}
              />
            ) : (
              <Spatial3DGrid
                telemetry={currentPoint}
                activeFaults={activeFaults}
                onSelectNode={handleSelectAsset}
              />
            )}
          </div>
        </div>

        {/* RIGHT HALF: EXPLANATION AND FAULT INJECTION (Matching Image 2) */}
        <div style={{ minHeight: '380px' }}>
          <AssetExplanationPanel
            selectedAsset={selectedAsset}
            activeFaults={activeFaults}
            onToggleFault={handleToggleFault}
            onRestoreNominal={handleClearAllFaults}
          />
        </div>
      </div>

      {/* ---------------- 6. BOTTOM REAL-TIME TRAJECTORY GRAPHS (MATCHING IMAGE 3) ---------------- */}
      <DualTrajectoryPlots
        timeSeries={trajectory}
        currentTime={currentTime}
        onSeek={(t) => setCurrentTime(t)}
      />
        </>
      )}

      {/* GRIDGUARD AI Bot (Unified Copilot, Planner, Tutor, Voice & NL Controller) */}
      <ChatbotDrawer
        projectId="smart-grid-digital-twin"
        telemetry={currentPoint}
        activeFaults={activeFaults}
        onToggleFault={handleToggleFault}
        onClearAllFaults={handleClearAllFaults}
        onResetTime={() => setCurrentTime(0)}
      />
    </div>
  );
}

const kpiCardStyle = {
  backgroundColor: '#0a0f1d',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

const kpiLabelStyle = {
  fontSize: '9.5px',
  fontWeight: 'bold',
  color: '#64748b',
  letterSpacing: '0.4px',
  marginBottom: '2px'
};
