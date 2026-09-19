import csv
import math
import random
import os

def generate_telemetry_dataset(num_samples=3000, output_path="backend/data/grid_telemetry_dataset.csv"):
    """
    Generates synthetic high-fidelity smart city power grid telemetry dataset
    grounded in the IEEE physical droop equations and municipal load profiles.
    
    Features:
    - frequency_hz: System AC frequency (nominal 50.00 Hz)
    - rocof_hz_s: Rate of Change of Frequency (df/dt)
    - voltage_pu: Substation 11 kV bus voltage (nominal 1.000 pu)
    - total_demand_mw: Total city load across 7 sectors (nominal 100 MW)
    - total_gen_mw: Total active power supply (utility + solar + wind)
    - net_power_deficit_mw: P_load - P_gen
    - line_loading_pct: Main transformer line loading (71.4% nominal)
    - solar_gen_mw: Solar PV generation (0 - 35 MW)
    - wind_gen_mw: Wind farm generation (10 - 20 MW)
    - battery_soc_pct: 50 MWh BESS state of charge (20 - 90%)
    - ev_load_mw: EV Charging Hub demand (7 - 25 MW)
    - industrial_load_mw: Industrial Complex demand (30 - 45 MW)
    - datacenter_load_mw: Hyperscale AI Data Center demand (10 - 22 MW)
    - hospital_load_mw: Hospital Protected Priority Feeder (8.0 MW fixed)
    
    Targets:
    - fault_type: [NOMINAL, EV_SURGE, SOLAR_DROP, WIND_STALL, INDUSTRIAL_INRUSH, DATACENTER_SPIKE, BESS_OUTAGE]
    - blackout_risk_pct: Continuous risk score (0.0 to 100.0%)
    - highest_risk_sector: [NONE, EV_PLAZA, INDUSTRIAL, AI_DATACENTER, SOLAR_FARM, WIND_FARM, BESS_STATION]
    - recommended_prevention: Prescriptive mitigation strategy
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    fieldnames = [
        "frequency_hz",
        "rocof_hz_s",
        "voltage_pu",
        "total_demand_mw",
        "total_gen_mw",
        "net_power_deficit_mw",
        "line_loading_pct",
        "solar_gen_mw",
        "wind_gen_mw",
        "battery_soc_pct",
        "ev_load_mw",
        "industrial_load_mw",
        "datacenter_load_mw",
        "hospital_load_mw",
        "fault_type",
        "blackout_risk_pct",
        "highest_risk_sector",
        "recommended_prevention"
    ]
    
    fault_scenarios = [
        "NOMINAL",
        "EV_SURGE",
        "SOLAR_DROP",
        "WIND_STALL",
        "INDUSTRIAL_INRUSH",
        "DATACENTER_SPIKE",
        "BESS_OUTAGE"
    ]
    
    rows = []
    
    for i in range(num_samples):
        # 1. Base simulation time (0 to 300s)
        t = random.uniform(0, 300)
        
        # 2. Generation Curves
        # Utility base import: 65 MW
        p_util = 65.0
        # Solar diurnal sine curve (peak 35 MW at noon t=150)
        p_solar_base = 35.0 * math.sin((math.pi * t) / 300.0)
        p_solar_base = max(0.0, p_solar_base)
        # Wind cyclic wave (15 MW baseline, 5 MW sine wave)
        p_wind_base = 15.0 + 5.0 * math.sin((2 * math.pi * t) / 120.0)
        
        # 3. Baseline Loads (100 MW total nominal)
        p_res = 25.0 + random.gauss(0, 0.8)
        p_com = 15.0 + random.gauss(0, 0.5)
        p_ind_base = 30.0 + random.gauss(0, 1.0)
        p_hosp = 8.0  # Hospital priority load is 100% stable
        p_dc_base = 10.0 + random.gauss(0, 0.4)
        p_water = 5.0 + random.gauss(0, 0.2)
        p_ev_base = 7.0 + random.gauss(0, 0.3)
        
        # Random BESS SOC (40% - 85%)
        battery_soc = random.uniform(40.0, 85.0)
        bess_available = True
        
        # 4. Scenario Injection (Weighted: 40% NOMINAL, 60% DISTURBANCES)
        scenario = random.choices(
            fault_scenarios,
            weights=[0.35, 0.15, 0.12, 0.10, 0.12, 0.10, 0.06]
        )[0]
        
        p_solar = p_solar_base
        p_wind = p_wind_base
        p_ev = p_ev_base
        p_ind = p_ind_base
        p_dc = p_dc_base
        
        highest_risk_sector = "NONE"
        rec_prevention = "Continue autonomous monitoring"
        
        if scenario == "NOMINAL":
            highest_risk_sector = "NONE"
            rec_prevention = "Nominal operating envelope. Spinning reserves active."
            
        elif scenario == "EV_SURGE":
            # Fleet fast-charging spike (+10 to +22 MW)
            ev_spike = random.uniform(12.0, 22.0)
            p_ev += ev_spike
            highest_risk_sector = "EV_PLAZA"
            rec_prevention = "Dispatch BESS +18MW & Throttle EV Plaza chargers by 25%. Hospital locked immune."
            
        elif scenario == "SOLAR_DROP":
            # Convective cloud cover drops solar by 50% - 85%
            drop_factor = random.uniform(0.50, 0.85)
            p_solar *= (1.0 - drop_factor)
            highest_risk_sector = "SOLAR_FARM"
            rec_prevention = "Inject BESS synthetic inertia +15MW & ramp utility interconnect spinning reserve."
            
        elif scenario == "WIND_STALL":
            # Meteorological lull drops wind by 40% - 60%
            drop_factor = random.uniform(0.40, 0.60)
            p_wind *= (1.0 - drop_factor)
            highest_risk_sector = "WIND_FARM"
            rec_prevention = "Command turbine blade pitch compensation & AGC governor reserve ramp."
            
        elif scenario == "INDUSTRIAL_INRUSH":
            # Arc furnaces & induction motors startup (+10 to +18 MW)
            ind_spike = random.uniform(10.0, 18.0)
            p_ind += ind_spike
            highest_risk_sector = "INDUSTRIAL"
            rec_prevention = "Activate STATCOM reactive voltage support & engage interruptible tariff shedding."
            
        elif scenario == "DATACENTER_SPIKE":
            # GPU cluster distributed training surge (+8 to +15 MW)
            dc_spike = random.uniform(8.0, 15.0)
            p_dc += dc_spike
            highest_risk_sector = "AI_DATACENTER"
            rec_prevention = "AI cluster compute power cap & BESS localized peak shaving."
            
        elif scenario == "BESS_OUTAGE":
            # Inverter trip, battery unavailable
            bess_available = False
            battery_soc = random.uniform(20.0, 40.0)
            highest_risk_sector = "BESS_STATION"
            rec_prevention = "Emergency demand-response load curtailment. Fast-trip substation feeder protection armed."

        # 5. Calculate Physical Net Balance
        total_demand = p_res + p_com + p_ind + p_hosp + p_dc + p_water + p_ev
        total_gen = p_util + p_solar + p_wind
        net_deficit = total_demand - total_gen
        
        # BESS buffering response (if online)
        bess_power = 0.0
        if bess_available:
            if net_deficit > 2.0:
                bess_power = min(20.0, net_deficit * 0.75) # Discharge up to 20 MW
            elif net_deficit < -2.0:
                bess_power = max(-20.0, net_deficit * 0.6) # Charge
        
        # Unbuffered net deficit
        effective_deficit = net_deficit - bess_power
        
        # 6. Physical Droop Dynamics
        # Nominal 50.00 Hz, droop slope: -0.08 Hz per MW unbuffered deficit
        delta_f = -0.08 * (effective_deficit / 2.5)
        frequency = 50.00 + delta_f + random.gauss(0, 0.02)
        
        # RoCoF (Rate of Change of Frequency): proportional to acceleration of deficit
        rocof = (delta_f * random.uniform(1.2, 2.2))
        
        # Voltage Sag: nominal 1.000 pu, droop slope: -0.002 pu per MW deficit
        delta_v = -0.002 * (effective_deficit / 2.0)
        voltage = 1.000 + delta_v + random.gauss(0, 0.003)
        
        # Main Line Loading: nominal 71.4% at 100 MW
        line_loading = 71.4 + (total_demand - 100.0) * 0.75 + random.gauss(0, 0.5)
        line_loading = max(45.0, line_loading)
        
        # 7. Ground-Truth Blackout Risk Calculation (Physics-Grounded Formula)
        # Risk is driven by: Frequency sag (40%), Line overload (35%), Voltage sag (25%)
        freq_penalty = max(0.0, (50.00 - frequency) / 1.5) * 50.0
        loading_penalty = max(0.0, (line_loading - 75.0) / 25.0) * 35.0
        volt_penalty = max(0.0, (1.000 - voltage) / 0.04) * 25.0
        
        raw_risk = freq_penalty + loading_penalty + volt_penalty
        if not bess_available:
            raw_risk += 25.0 # Inverter outage penalty
            
        blackout_risk = min(98.8, max(5.0, raw_risk))
        if scenario == "NOMINAL":
            blackout_risk = min(22.0, max(5.0, blackout_risk * 0.3))

        rows.append({
            "frequency_hz": round(frequency, 3),
            "rocof_hz_s": round(rocof, 4),
            "voltage_pu": round(voltage, 4),
            "total_demand_mw": round(total_demand, 2),
            "total_gen_mw": round(total_gen, 2),
            "net_power_deficit_mw": round(net_deficit, 2),
            "line_loading_pct": round(line_loading, 2),
            "solar_gen_mw": round(p_solar, 2),
            "wind_gen_mw": round(p_wind, 2),
            "battery_soc_pct": round(battery_soc, 1),
            "ev_load_mw": round(p_ev, 2),
            "industrial_load_mw": round(p_ind, 2),
            "datacenter_load_mw": round(p_dc, 2),
            "hospital_load_mw": round(p_hosp, 1),
            "fault_type": scenario,
            "blackout_risk_pct": round(blackout_risk, 1),
            "highest_risk_sector": highest_risk_sector,
            "recommended_prevention": rec_prevention
        })
        
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Dataset generated successfully: {len(rows)} samples saved to {output_path}")

if __name__ == "__main__":
    generate_telemetry_dataset()
