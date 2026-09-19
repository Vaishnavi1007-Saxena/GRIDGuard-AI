import os
from pathlib import Path
import joblib
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = str(BASE_DIR / "data" / "gridguard_ml_model.joblib")

class MLPredictionService:
    def __init__(self):
        self.bundle = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.bundle = joblib.load(MODEL_PATH)
                print(f"[ML Service] Loaded trained model bundle from {MODEL_PATH}")
            except Exception as e:
                print(f"[ML Service] Error loading model: {e}")
                self.bundle = None
        else:
            print(f"[ML Service] Model bundle not found at {MODEL_PATH}")

    def predict(self, telemetry: dict) -> dict:
        """
        Runs real-time inference on incoming grid telemetry.
        Returns:
        - predicted_fault: String
        - confidence_pct: Float
        - blackout_risk_pct: Float
        - highest_risk_sector: String
        - time_to_trip_sec: Float
        - prescriptive_action: Dict with prevention steps and risk reduction
        """
        # Default nominal fallback if model bundle is not loaded
        if not self.bundle:
            return {
                "model_status": "offline",
                "predicted_fault": "NOMINAL",
                "confidence_pct": 95.0,
                "blackout_risk_pct": 12.0,
                "highest_risk_sector": "NONE",
                "time_to_trip_sec": 999.0,
                "prescriptive_action": {
                    "primary_action": "Maintain nominal supervisory monitoring.",
                    "projected_risk_after": 10.0,
                    "hospital_safety": "Hospital Feeder 100% immune."
                }
            }

        # Extract features matching FEATURE_COLUMNS
        cols = self.bundle["feature_columns"]
        
        freq = float(telemetry.get("frequency", telemetry.get("frequency_hz", 50.0)))
        rocof = float(telemetry.get("rocof", telemetry.get("rocof_hz_s", (freq - 50.0) * 1.5)))
        volt = float(telemetry.get("voltage", telemetry.get("voltage_pu", 1.0)))
        demand = float(telemetry.get("Pload", telemetry.get("total_demand_mw", 100.0)))
        gen = float(telemetry.get("Pgen", telemetry.get("total_gen_mw", 85.0)))
        deficit = demand - gen
        loading = float(telemetry.get("lineLoading", telemetry.get("line_loading_pct", 71.4)))
        solar = float(telemetry.get("Psolar", telemetry.get("solar_gen_mw", 20.0)))
        wind = float(telemetry.get("Pwind", telemetry.get("wind_gen_mw", 15.0)))
        soc = float(telemetry.get("currentSOC", telemetry.get("battery_soc_pct", 70.0)))
        
        # Sector-specific estimate from telemetry
        active_faults = telemetry.get("activeFaults", {})
        ev_load = 25.0 if active_faults.get("ev") else 7.0
        ind_load = 45.0 if active_faults.get("industrial") else 30.0
        dc_load = 22.0 if active_faults.get("datacenter") else 10.0
        
        input_data = {
            "frequency_hz": [freq],
            "rocof_hz_s": [rocof],
            "voltage_pu": [volt],
            "total_demand_mw": [demand],
            "total_gen_mw": [gen],
            "net_power_deficit_mw": [deficit],
            "line_loading_pct": [loading],
            "solar_gen_mw": [solar],
            "wind_gen_mw": [wind],
            "battery_soc_pct": [soc],
            "ev_load_mw": [ev_load],
            "industrial_load_mw": [ind_load],
            "datacenter_load_mw": [dc_load]
        }
        
        df_input = pd.DataFrame(input_data)[cols]
        
        # 1. Predict Fault Type
        clf_fault = self.bundle["fault_classifier"]
        pred_fault = clf_fault.predict(df_input)[0]
        probs = clf_fault.predict_proba(df_input)[0]
        confidence = float(np.max(probs) * 100)
        
        # 2. Predict Blackout Risk
        reg_risk = self.bundle["risk_regressor"]
        pred_risk = float(reg_risk.predict(df_input)[0])
        pred_risk = max(5.0, min(99.0, pred_risk))
        
        # 3. Predict Spatial Highest Risk Sector
        clf_sector = self.bundle["sector_classifier"]
        pred_sector = clf_sector.predict(df_input)[0]
        
        # Friendly sector names
        sector_map = {
            "EV_PLAZA": "Bus 4: EV Fast-Charging Plaza",
            "INDUSTRIAL": "Bus 3: Heavy Industrial Complex",
            "AI_DATACENTER": "Bus 2: Hyperscale AI Data Center",
            "SOLAR_FARM": "Bus 5: Solar PV Renewable Field",
            "WIND_FARM": "Bus 6: Coastal Wind Turbine Farm",
            "BESS_STATION": "Substation Storage Bus: BESS Central Inverter",
            "NONE": "All Sectors Balanced (Nominal)"
        }
        friendly_sector = sector_map.get(pred_sector, pred_sector)
        
        # Time-to-Trip Estimation
        time_to_trip = 12.4 if pred_risk > 75 else 45.0 if pred_risk > 45 else 999.0
        
        # 4. Generate Prescriptive Preventive Action
        prescriptive = self._generate_prescriptive_plan(pred_fault, pred_sector, pred_risk)
        
        return {
            "model_status": "active_inference",
            "model_type": self.bundle["model_type"],
            "predicted_fault": pred_fault,
            "confidence_pct": round(confidence, 1),
            "blackout_risk_pct": round(pred_risk, 1),
            "highest_risk_sector": friendly_sector,
            "raw_sector_key": pred_sector,
            "time_to_trip_sec": time_to_trip,
            "feature_importances": self.bundle["feature_importances"],
            "prescriptive_mitigation": prescriptive,
            "model_metrics": self.bundle["metrics"]
        }

    def _generate_prescriptive_plan(self, fault: str, sector: str, risk: float) -> dict:
        if risk < 30.0:
            return {
                "summary": "Grid operating in nominal green zone. No active load shedding required.",
                "actions": [
                    "Maintain continuous AGC frequency supervision.",
                    "Verify spinning reserve margin at Substation bus tie.",
                    "Verify priority critical feeder protection interlocks active."
                ],
                "projected_risk_after": round(max(5.0, risk * 0.8), 1),
                "risk_reduction_pct": 0.0,
                "urgency": "LOW"
            }

        actions = []
        if fault == "EV_SURGE" or sector == "EV_PLAZA":
            actions = [
                "Dispatch 50 MWh BESS battery inverter to discharge +18.0 MW synthetic inertia.",
                "Execute dynamic demand-response: throttle EV Plaza DC fast-chargers by 25%.",
                "Step up Substation tap-changer to mitigate localized feeder voltage sag.",
                "Verify priority critical feeder protection interlocks active."
            ]
        elif fault == "SOLAR_DROP" or sector == "SOLAR_FARM":
            actions = [
                "Ramp BESS discharge to +15.0 MW to cushion convective cloud cover drop.",
                "Signal utility interconnect spinning reserves across 11 kV tie.",
                "Command PV inverter smart reactive power injection for bus support.",
                "Verify priority critical feeder protection interlocks active."
            ]
        elif fault == "WIND_STALL" or sector == "WIND_FARM":
            actions = [
                "Engage BESS synthetic inertia injection at +8.0 MW.",
                "Command wind turbine blade pitch compensation for aerodynamic stall.",
                "Verify priority critical feeder protection interlocks active."
            ]
        elif fault == "INDUSTRIAL_INRUSH" or sector == "INDUSTRIAL":
            actions = [
                "Activate STATCOM reactive voltage support for arc furnace inrush.",
                "Trigger Tier 1 interruptible industrial tariff to drop non-critical auxiliary load by 10 MW.",
                "Verify priority critical feeder protection interlocks active."
            ]
        elif fault == "DATACENTER_SPIKE" or sector == "AI_DATACENTER":
            actions = [
                "Signal GPU cluster management to engage dynamic compute power cap.",
                "Dispatch localized peak-shaving support from BESS.",
                "Verify priority critical feeder protection interlocks active."
            ]
        elif fault == "BESS_OUTAGE" or sector == "BESS_STATION":
            actions = [
                "BESS OFFLINE: Activate emergency demand-response shedding on commercial sectors.",
                "Arm Substation fast-trip circuit protection relays.",
                "Verify priority critical feeder protection interlocks active."
            ]
        else:
            actions = [
                "Inject +10 MW reserve from central BESS.",
                "Throttle non-essential commercial loads by 15%.",
                "Verify priority critical feeder protection interlocks active."
            ]

        projected_risk = round(max(8.0, risk * 0.15), 1)
        reduction = round(risk - projected_risk, 1)

        return {
            "summary": f"Preventive mitigation for {fault.replace('_', ' ')} at {sector.replace('_', ' ')}.",
            "actions": actions,
            "projected_risk_after": projected_risk,
            "risk_reduction_pct": reduction,
            "urgency": "CRITICAL" if risk > 75 else "MODERATE"
        }

ml_service = MLPredictionService()
