import React, { useState } from 'react';
import { Sun, BatteryCharging, Factory, Home, Building2, Zap, ShieldCheck, AlertOctagon, Box, Layers } from 'lucide-react';
import Spatial3DGrid from './Spatial3DGrid';

export default function GridStatus({ telemetry }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  const t = telemetry || {
    voltage_pu: 0.96,
    frequency_hz: 49.40,
    grid_load_pct: 82.0,
    ev_load_pct: 31.0,
    solar_output_pct: 42.0,
    transformer_pct: 88.0,
    battery_soc_pct: 74.0,
    grid_stress: "HIGH",
    blackout_risk_pct: 87.0,
    hospital_online: true,
    status_summary: "Grid telemetry from backend simulation"
  };

  const getStressBadge = (stress) => {
    switch (stress) {
      case 'CRITICAL': return { color: '#ef4444', bg: '#ef444420' };
      case 'HIGH': return { color: '#f59e0b', bg: '#f59e0b20' };
      case 'MODERATE': return { color: '#38bdf8', bg: '#38bdf820' };
      default: return { color: '#10b981', bg: '#10b98120' };
    }
  };

  const stressInfo = getStressBadge(t.grid_stress);

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#00f0ff" />
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              VIRTUAL SMART-GRID DIGITAL TWIN
            </h3>
          </div>

          {/* 3D vs 2D Toggle Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#080c14',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === '3d' ? '#0284c7' : 'transparent',
                color: viewMode === '3d' ? '#ffffff' : '#94a3b8'
              }}
            >
              <Box size={13} /> 3D SPATIAL VIEW
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === '2d' ? '#0284c7' : 'transparent',
                color: viewMode === '2d' ? '#ffffff' : '#94a3b8'
              }}
            >
              <Layers size={13} /> 2D SCADA DIAGRAM
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Simulated Telemetry:</span>
          <span style={{
            backgroundColor: stressInfo.bg,
            border: `1px solid ${stressInfo.color}`,
            color: stressInfo.color,
            fontSize: '11px',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            STRESS: {t.grid_stress}
          </span>
        </div>
      </div>

      {/* Render 3D Spatial Canvas or 2D Single-Line Topology */}
      {viewMode === '3d' ? (
        <Spatial3DGrid telemetry={t} />
      ) : (
        <div style={{
        backgroundColor: '#080c14',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Top: Solar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid #eab308',
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#facc15',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <Sun size={15} color="#facc15" />
            Solar Generation ({t.solar_output_pct}%)
          </div>
          <div style={{ width: '2px', height: '14px', backgroundColor: '#eab308' }} />
          <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #eab308' }} />
        </div>

        {/* Middle Bus Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          position: 'relative',
          padding: '8px 0'
        }}>
          {/* Left: Generator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid #38bdf8',
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#38bdf8',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <Zap size={15} color="#38bdf8" />
            Grid Generator
          </div>

          {/* Central Bus Line */}
          <div style={{
            flex: 1,
            height: '4px',
            backgroundColor: '#00f0ff',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
            margin: '0 12px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <span style={{
              position: 'absolute',
              top: '-18px',
              backgroundColor: '#00f0ff20',
              border: '1px solid #00f0ff',
              color: '#00f0ff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '1px 6px',
              borderRadius: '3px'
            }}>
              11 kV MEDIUM VOLTAGE GRID BUS
            </span>
          </div>

          {/* Right: Battery */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#1e293b',
            border: '1px solid #10b981',
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#10b981',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <BatteryCharging size={15} color="#10b981" />
            BESS ({t.battery_soc_pct}% SOC)
          </div>
        </div>

        {/* Drops down to Loads */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          width: '90%',
          marginTop: '12px'
        }}>
          {/* Residential */}
          <div style={{
            backgroundColor: '#131d33',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Home size={16} color="#94a3b8" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#f8fafc' }}>Residential</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Baseline Load</div>
            </div>
          </div>

          {/* EV Charging */}
          <div style={{
            backgroundColor: t.ev_load_pct > 25 ? '#7f1d1d20' : '#131d33',
            border: `1px solid ${t.ev_load_pct > 25 ? '#ef4444' : '#334155'}`,
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} color={t.ev_load_pct > 25 ? '#ef4444' : '#38bdf8'} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: t.ev_load_pct > 25 ? '#f87171' : '#f8fafc' }}>
                EV Charging Plaza
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {t.ev_load_pct}% Demand {t.ev_load_pct > 25 ? '(Surging)' : ''}
              </div>
            </div>
          </div>

          {/* Industrial */}
          <div style={{
            backgroundColor: '#131d33',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Factory size={16} color="#94a3b8" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#f8fafc' }}>Industrial</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Curtailable L2</div>
            </div>
          </div>

          {/* Hospital Priority */}
          <div style={{
            backgroundColor: '#064e3b30',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
          }}>
            <Building2 size={16} color="#10b981" />
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#34d399' }}>
                Hospital Feeder
              </div>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '600' }}>
                ✓ PROTECTED (ONLINE)
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Telemetry Gauge Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px'
      }}>
        {[
          { label: 'BUS VOLTAGE', value: `${t.voltage_pu.toFixed(2)} pu`, alert: t.voltage_pu < 0.95 },
          { label: 'FREQUENCY', value: `${t.frequency_hz.toFixed(2)} Hz`, alert: t.frequency_hz < 49.5 },
          { label: 'TOTAL GRID LOAD', value: `${t.grid_load_pct.toFixed(0)}%`, alert: t.grid_load_pct > 85 },
          { label: 'EV FLEET DEMAND', value: `${t.ev_load_pct.toFixed(0)}%`, alert: t.ev_load_pct > 30 },
          { label: 'SOLAR OUTPUT', value: `${t.solar_output_pct.toFixed(0)}%`, alert: t.solar_output_pct < 25 },
          { label: 'TRANSFORMER', value: `${t.transformer_pct.toFixed(0)}%`, alert: t.transformer_pct > 90 },
          { label: 'BATTERY SOC', value: `${t.battery_soc_pct.toFixed(0)}%`, alert: t.battery_soc_pct < 25 },
          { label: 'BLACKOUT RISK', value: `${t.blackout_risk_pct.toFixed(0)}%`, alert: t.blackout_risk_pct > 60 }
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: m.alert ? '#7f1d1d20' : '#080c14',
              border: `1px solid ${m.alert ? '#ef4444' : '#1e293b'}`,
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>
              {m.label}
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: '800',
              fontFamily: 'Fira Code, monospace',
              color: m.alert ? '#f87171' : '#f8fafc'
            }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
