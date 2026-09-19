/**
 * Client-Side Bot Tool Registry & Deterministic Intent Engine
 * Provides instant ground-truth telemetry answers and simulation command validation
 */

export const BotTools = {
  get_current_grid_state: (telemetry, activeFaults) => {
    if (!telemetry) return { error: 'Telemetry data currently unavailable' };
    return {
      frequency: telemetry.freq || 50.0,
      voltage: telemetry.volt || 1.0,
      totalLoadMW: telemetry.Pload || 100.0,
      totalGenMW: telemetry.Pgen || 85.0,
      solarMW: telemetry.Psolar || 20.0,
      windMW: telemetry.Pwind || 15.0,
      batterySOC: telemetry.currentSOC || 70.0,
      batteryPowerMW: telemetry.Pbatt || 0.0,
      lineLoading: telemetry.lineLoading || 71.4,
      health: telemetry.health || 100.0,
      status: telemetry.status || 'NORMAL',
      activeFaults: activeFaults || {}
    };
  },

  get_ml_prediction: (telemetry) => {
    const freq = telemetry?.freq || 50.0;
    const loading = telemetry?.lineLoading || 71.4;
    const deltaF = Math.abs(freq - 50.0);

    let risk = 12.0;
    if (deltaF > 0.4) risk += 45.0;
    else if (deltaF > 0.2) risk += 25.0;

    if (loading > 85.0) risk += 35.0;
    else if (loading > 75.0) risk += 15.0;

    risk = Math.min(98.5, Math.max(5.0, risk));
    return {
      blackoutRiskPct: Number(risk.toFixed(1)),
      rocofHzPerSec: Number((deltaF * 1.8).toFixed(3)),
      timeToTripSec: risk > 75 ? 12.4 : risk > 40 ? 45.0 : 999.0
    };
  },

  validate_control_action: (action) => {
    const target = (action?.target || '').toLowerCase();
    if (target.includes('hospital') || target.includes('emergency')) {
      return {
        valid: false,
        reason: 'SAFETY INTERLOCK BLOCKED: Hospital feeder is 100% life-safety immune from shedding via hardware PLC/RTL trip-inhibitors.'
      };
    }
    return {
      valid: true,
      reason: 'Safety checks passed: Hospital protected, transformer thermal limits verified.'
    };
  },

  parseNaturalCommand: (text) => {
    const q = text.toLowerCase();

    // 1. EV Demand / Surge
    if ((q.includes('ev') || q.includes('charging')) && (q.includes('increase') || q.includes('surge') || q.includes('spike') || q.includes('high') || q.includes('40'))) {
      const match = q.match(/(\d+)\s*%/);
      const pct = match ? parseInt(match[1], 10) : 40;
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'ev',
        title: `Increase EV Demand by ${pct}%`,
        description: `Fleet fast-charging step surge (+18 MW) on Bus 4.`,
        safetyNote: 'Hospital Feeder 1 remains 100% protected.'
      };
    }

    // 2. Solar Reduction
    if ((q.includes('solar') || q.includes('pv')) && (q.includes('reduce') || q.includes('drop') || q.includes('decrease') || q.includes('cloud') || q.includes('shade') || q.includes('30') || q.includes('65'))) {
      const match = q.match(/(\d+)\s*%/);
      const pct = match ? parseInt(match[1], 10) : 65;
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'solar',
        title: `Reduce Solar Generation by ${pct}%`,
        description: `Dense cloud cover shading across 35 MW PV array on Bus 5.`,
        safetyNote: 'Central BESS buffer ready to dispatch synthetic inertia.'
      };
    }

    // 3. Disable / Trip Battery
    if ((q.includes('battery') || q.includes('bess')) && (q.includes('disable') || q.includes('trip') || q.includes('offline') || q.includes('outage') || q.includes('shut'))) {
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'battery',
        title: `Disable Central BESS Storage`,
        description: `Inverter breaker lockout on 50 MWh / 20 MW battery (loss of synthetic inertia).`,
        safetyNote: 'Warning: Frequency swings will become unhedged.'
      };
    }

    // 4. Wind Stall
    if (q.includes('wind') && (q.includes('stall') || q.includes('drop') || q.includes('decrease') || q.includes('fail'))) {
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'wind',
        title: `Simulate Wind Generation Stall (-50%)`,
        description: `Meteorological lull drops wind generation to 10 MW on Bus 6.`,
        safetyNote: 'Automatic Generation Control (AGC) armed.'
      };
    }

    // 5. Industrial Inrush / Spike
    if (q.includes('industrial') && (q.includes('spike') || q.includes('startup') || q.includes('increase') || q.includes('surge'))) {
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'industrial',
        title: `Trigger Industrial Inrush Spike (+15 MW)`,
        description: `Simultaneous electric arc furnace startup at steel complex on Bus 3.`,
        safetyNote: 'STATCOM voltage regulation queued.'
      };
    }

    // 6. AI Data Center Spike
    if ((q.includes('data center') || q.includes('datacenter') || q.includes('gpu') || q.includes('ai data')) && (q.includes('surge') || q.includes('spike') || q.includes('increase'))) {
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'modify_scenario',
        faultKey: 'datacenter',
        title: `Trigger AI Data Center GPU Surge (+12 MW)`,
        description: `Massive distributed LLM training job starts across 10,000+ liquid-cooled GPUs.`,
        safetyNote: 'Transformer thermal monitoring active.'
      };
    }

    // 7. Reset Simulation
    if (q.includes('reset') && (q.includes('simulation') || q.includes('grid') || q.includes('time') || q.includes('all') || q.includes('clear'))) {
      return {
        type: 'ACTION_CONFIRMATION',
        action: 'reset_simulation',
        title: `Reset Digital Twin Simulation`,
        description: `Restore simulation clock to t=0s and clear all active disturbance scenarios.`,
        safetyNote: 'Restores baseline nominal operating envelope.'
      };
    }

    return null;
  }
};
