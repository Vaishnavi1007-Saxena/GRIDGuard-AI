/**
 * GridGuard AI - Smart City Electrical Physics & Mathematical Model Engine
 * Recomputes 301-second time trajectory according to exact PDF physics formulation:
 * - Generation: Utility (65MW) + Solar diurnal + Wind cyclic
 * - Municipal Demand: 7 sectors (100MW base)
 * - BESS Control: 50MWh, 20MW inverter, deadband & SOC integration
 * - Frequency & Voltage Dynamics: f(t) = 50 + 0.08*ΔP, V(t) = 1.0 + 0.002*ΔP
 * - Line Loading: 70% base + 0.8*excess
 * - Composite Grid Health Index: 100 - Pen_f - Pen_V - Pen_load - Pen_imb
 */

export const SIMULATION_DURATION = 300; // 5 minutes
export const TIME_STEP = 1.0; // 1 second
export const TOTAL_STEPS = 301; // t = 0 to 300

export const BASE_LOADS = {
  residential: 25.0, // Bus 1 Standard
  commercial: 15.0,  // Bus 2 Standard
  industrial: 30.0,  // Bus 3 Interruptible
  hospital: 8.0,     // Bus 1 Priority (Critical Tier 1)
  datacenter: 10.0,  // Bus 2 High Priority
  waterPlant: 5.0,   // Bus 5 Flexible
  evCharging: 7.0    // Bus 4 Dynamic
};

export const INITIAL_FAULTS = {
  ev: false,         // EV Charging Fleet Surge (+18 MW -> 25 MW)
  solar: false,      // Solar Storm / Cloud Cover Drop (-65%)
  wind: false,       // Coastal Wind Stall (-50%)
  industrial: false, // Industrial Heavy Motor Startup (+15 MW -> 45 MW)
  datacenter: false, // AI Data Center GPU Training Surge (+12 MW -> 22 MW)
  battery: false     // BESS Outage / Inverter Trip (forced to 0 MW)
};

export function computeSimulationTrajectory(activeFaults = {}) {
  const faults = { ...INITIAL_FAULTS, ...activeFaults };

  const timeSeries = [];
  let currentSOC = 70.0; // Initial SOC 70%

  for (let t = 0; t <= SIMULATION_DURATION; t++) {
    // 1. Generation Profiles
    const Putil = 65.0; // Utility thermal baseload (constant)

    // Solar PV: 35 MW peak diurnal sine envelope over 300s
    let Psolar = 35.0 * Math.max(0, Math.sin((Math.PI * t) / SIMULATION_DURATION));
    if (faults.solar) {
      Psolar *= 0.35; // 65% drop due to cloud cover
    }

    // Coastal Wind: 20 MW base oscillating between 15 and 25 MW (120s wave)
    let Pwind = Math.max(20.0 + 5.0 * Math.sin((2 * Math.PI * t) / 120), 0);
    if (faults.wind) {
      Pwind *= 0.50; // 50% drop due to meteorological stall
    }

    const Pgen = Putil + Psolar + Pwind;

    // 2. Municipal Sector Demands
    const dRes = BASE_LOADS.residential;
    const dCom = BASE_LOADS.commercial;
    const dInd = faults.industrial ? 45.0 : BASE_LOADS.industrial; // +15 MW on surge
    const dHosp = BASE_LOADS.hospital; // Always immune & protected
    const dData = faults.datacenter ? 22.0 : BASE_LOADS.datacenter; // +12 MW on GPU surge
    const dWater = BASE_LOADS.waterPlant;
    const dEV = faults.ev ? 25.0 : BASE_LOADS.evCharging; // +18 MW on EV fleet surge

    const Pload = dRes + dCom + dInd + dHosp + dData + dWater + dEV;

    // 3. Generation-Demand Error & BESS Response
    const Perror = Pgen - Pload;
    let Pbatt = 0.0; // Positive = discharging, Negative = charging

    if (!faults.battery) {
      if (Perror < -5.0 && currentSOC > 20.0) {
        // Deficit compensation (discharging)
        Pbatt = Math.min(20.0, Math.abs(Perror));
        // Energy integration: SOC decreases
        currentSOC = Math.max(20.0, currentSOC - (Pbatt / 50.0) * (TIME_STEP / 3600) * 100 * 30);
      } else if (Perror > 10.0 && currentSOC < 95.0) {
        // Surplus absorption (charging)
        Pbatt = -Math.min(20.0, Perror);
        currentSOC = Math.min(95.0, currentSOC + (Math.abs(Pbatt) / 50.0) * (TIME_STEP / 3600) * 100 * 30);
      }
    }

    // 4. Net Active Power Imbalance & Frequency / Voltage Dynamics
    const deltaP = Pgen + Pbatt - Pload;

    // Frequency: f(t) = 50.00 + 0.08 * deltaP [Hz]
    const freq = 50.00 + 0.08 * deltaP;

    // Bus Voltage: V(t) = 1.000 + 0.002 * deltaP [pu]
    const volt = 1.000 + 0.002 * deltaP;

    // Transmission Line Loading: Loading(t) = min(70.0 + 0.8 * max(Pload - 100, 0), 120.0)%
    const lineLoading = Math.min(70.0 + 0.8 * Math.max(Pload - 100.0, 0), 120.0);

    // 5. Non-linear Penalties & Grid Health Index
    const Pen_f = Math.min(Math.abs(freq - 50.0) * 15.0, 30.0);
    const Pen_v = Math.min(Math.abs(volt - 1.000) * 150.0, 30.0);
    const Pen_load = Math.max(lineLoading - 80.0, 0) * 0.5;
    const Pen_imb = Math.min(Math.abs(deltaP) * 0.5, 25.0);

    const healthRaw = 100.0 - Pen_f - Pen_v - Pen_load - Pen_imb;
    const health = Math.max(0.0, Math.min(100.0, healthRaw));

    // Status classification
    let status = 'NORMAL';
    if (health < 70.0) status = 'CRITICAL';
    else if (health < 90.0) status = 'WARNING';

    timeSeries.push({
      t,
      Putil,
      Psolar,
      Pwind,
      Pgen,
      Pload,
      Pbatt,
      deltaP,
      currentSOC,
      freq,
      volt,
      lineLoading,
      health,
      status,
      sectors: {
        residential: dRes,
        commercial: dCom,
        industrial: dInd,
        hospital: dHosp,
        datacenter: dData,
        waterPlant: dWater,
        evCharging: dEV
      }
    });
  }

  return timeSeries;
}
