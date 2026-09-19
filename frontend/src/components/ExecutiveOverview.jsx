import React, { useState } from 'react';
import { Activity, Cpu, BatteryCharging, Shield, ArrowRight, Zap, CheckCircle2, AlertTriangle, Play, RefreshCw } from 'lucide-react';

export default function ExecutiveOverview({ onSwitchTab }) {
  const [activeStage, setActiveStage] = useState('twin');
  const [comparisonMode, setComparisonMode] = useState('gridguard'); // 'traditional' vs 'gridguard'

  const stages = [
    {
      id: 'twin',
      num: '01',
      title: 'Physics-Grounded Twin',
      icon: Activity,
      color: '#38bdf8',
      summary: 'Electromechanical swing equations, RoCoF (df/dt), and voltage dynamics across 7 sectors.',
      liveMetric: { label: 'Active Swing Model', val: '50.00 Hz (df/dt: 0.00 Hz/s)', status: '🟢 Calibrated' }
    },
    {
      id: 'ml',
      num: '02',
      title: 'Predictive Random Forest',
      icon: Cpu,
      color: '#a855f7',
      summary: '<2ms CPU inference classifying faults (96.3%), blackout risk (R²=0.994), and critical buses.',
      liveMetric: { label: 'Inference Latency', val: '1.4 ms (96.3% Acc)', status: '⚡ Sub-2ms' }
    },
    {
      id: 'prescriptive',
      num: '03',
      title: 'Autonomous Mitigation',
      icon: BatteryCharging,
      color: '#34d399',
      summary: 'Automated +18 MW BESS synthetic inertia injection and dynamic EV charger throttling.',
      liveMetric: { label: 'BESS Dynamic Buffer', val: '50 MWh / 20 MW Ready', status: '🛡️ Armed' }
    },
    {
      id: 'safety',
      num: '04',
      title: 'Deterministic Safety Interlocks',
      icon: Shield,
      color: '#c084fc',
      summary: 'Hardware-layer trip inhibition invariant ensuring critical priority feeders are protected from cascading collapse.',
      liveMetric: { label: 'Priority Invariant', val: '0.0% Blackout Risk', status: '🛡️ Protected' }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '30px' }}>
      
      {/* Top Interactive Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 60%, rgba(56, 189, 248, 0.15) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '24px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              INTERACTIVE ARCHITECTURE
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Select any stage below to inspect cyber-physical telemetry
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
            Next-Gen Smart Grid Protection Pipeline
          </h2>
        </div>

        <button
          onClick={() => onSwitchTab('twin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}
        >
          Launch 2. Fault & Digital Twin City <ArrowRight size={16} />
        </button>
      </div>

      {/* ---------------- 1. INTERACTIVE 4-STAGE PIPELINE (CLICKABLE) ---------------- */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
          Interactive Protection Stages (Click to Inspect)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isSelected = activeStage === stg.id;

            return (
              <div
                key={stg.id}
                onClick={() => setActiveStage(stg.id)}
                style={{
                  backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${isSelected ? stg.color : 'rgba(148, 163, 184, 0.15)'}`,
                  borderRadius: '14px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  boxShadow: isSelected ? `0 8px 24px -6px ${stg.color}35` : 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: `${stg.color}18`,
                    border: `1px solid ${stg.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stg.color
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'Fira Code, monospace',
                    fontWeight: '800',
                    color: stg.color
                  }}>
                    STAGE {stg.num}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>
                  {stg.title}
                </h4>

                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: '1.4' }}>
                  {stg.summary}
                </p>

                {/* Live Stage Metric Pill */}
                <div style={{
                  backgroundColor: 'rgba(10, 15, 29, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}>
                  <span style={{ color: '#64748b' }}>{stg.liveMetric.label}:</span>
                  <span style={{ fontWeight: '700', color: stg.color, fontFamily: 'monospace' }}>
                    {stg.liveMetric.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------------- 2. INTERACTIVE BENCHMARK TOGGLE (TRADITIONAL VS GRIDGUARD AI) ---------------- */}
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
              Live Benchmark: Traditional Grid Protection vs. GridGuard AI
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
              Toggle modes to see real-time contrast under sudden EV charging surges (+18 MW step load)
            </p>
          </div>

          {/* Interactive Switch Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setComparisonMode('traditional')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: comparisonMode === 'traditional' ? '#ef4444' : 'transparent',
                color: comparisonMode === 'traditional' ? '#ffffff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⚠️ Traditional Relays
            </button>
            <button
              onClick={() => setComparisonMode('gridguard')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: comparisonMode === 'gridguard' ? '#0284c7' : 'transparent',
                color: comparisonMode === 'gridguard' ? '#ffffff' : '#94a3b8',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ GridGuard AI
            </button>
          </div>
        </div>

        {/* Dynamic Comparison Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {/* Reaction Time */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Response Latency</div>
            <div style={{
              fontSize: '24px',
              fontWeight: '900',
              fontFamily: 'monospace',
              color: comparisonMode === 'gridguard' ? '#38bdf8' : '#ef4444',
              marginTop: '4px'
            }}>
              {comparisonMode === 'gridguard' ? '< 2 ms' : '2.5 - 5.0 s'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {comparisonMode === 'gridguard' ? 'Instant Random Forest inference' : 'Delayed thermal overcurrent trip'}
            </div>
          </div>

          {/* Cascading Risk */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Cascading Blackout Risk</div>
            <div style={{
              fontSize: '24px',
              fontWeight: '900',
              fontFamily: 'monospace',
              color: comparisonMode === 'gridguard' ? '#34d399' : '#ef4444',
              marginTop: '4px'
            }}>
              {comparisonMode === 'gridguard' ? '8.5%' : '88.4%'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {comparisonMode === 'gridguard' ? 'Cushioned by dynamic BESS buffer' : 'Uncontrolled RoCoF frequency trip'}
            </div>
          </div>

          {/* Critical Feeder Protection */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Critical Feeder Priority</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '900',
              fontFamily: 'monospace',
              color: comparisonMode === 'gridguard' ? '#34d399' : '#ef4444',
              marginTop: '6px'
            }}>
              {comparisonMode === 'gridguard' ? 'PRIORITY LOCKED' : 'SHED VULNERABLE'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              {comparisonMode === 'gridguard' ? 'Deterministic PLC priority interlock' : 'Blunt underfrequency load shedding'}
            </div>
          </div>

          {/* Action Resolution */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Resolution Mechanism</div>
            <div style={{
              fontSize: '15px',
              fontWeight: '800',
              color: comparisonMode === 'gridguard' ? '#38bdf8' : '#f87171',
              marginTop: '6px'
            }}>
              {comparisonMode === 'gridguard' ? 'Autonomous Closed-Loop' : 'Manual Dispatch & Outage'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              {comparisonMode === 'gridguard' ? 'Self-healing microgrid stabilization' : 'Operator scramble after breaker trip'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
