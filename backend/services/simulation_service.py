import random
from typing import Dict, Any, List
from pydantic import BaseModel

class GridTelemetry(BaseModel):
    voltage_pu: float
    frequency_hz: float
    grid_load_pct: float
    ev_load_pct: float
    solar_output_pct: float
    transformer_pct: float
    battery_soc_pct: float
    grid_stress: str  # NOMINAL, ELEVATED, HIGH, CRITICAL
    blackout_risk_pct: float
    hospital_online: bool
    status_summary: str

class SimulationService:
    """
    Virtual Smart Grid Digital Twin Telemetry Generator.
    Supports real-time status reporting and step-by-step blackout prevention demonstration.
    """
    def __init__(self):
        self.demo_stages = [
            {
                "stage": 1,
                "name": "NORMAL GRID STEADY-STATE",
                "description": "Grid operating within nominal IEEE 1547 parameters. Generation balances demand.",
                "telemetry": GridTelemetry(
                    voltage_pu=1.00,
                    frequency_hz=50.00,
                    grid_load_pct=55.0,
                    ev_load_pct=12.0,
                    solar_output_pct=85.0,
                    transformer_pct=58.0,
                    battery_soc_pct=82.0,
                    grid_stress="NOMINAL",
                    blackout_risk_pct=4.0,
                    hospital_online=True,
                    status_summary="Grid Nominal. All feeders balanced."
                )
            },
            {
                "stage": 2,
                "name": "COMPOUND DISTURBANCE: EV SURGE + SOLAR DROP",
                "description": "200 EV fast chargers connect simultaneously (+18 MW) while storm front cuts solar generation by 75%.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.94,
                    frequency_hz=49.42,
                    grid_load_pct=88.0,
                    ev_load_pct=36.0,
                    solar_output_pct=22.0,
                    transformer_pct=96.0,
                    battery_soc_pct=82.0,
                    grid_stress="HIGH",
                    blackout_risk_pct=72.0,
                    hospital_online=True,
                    status_summary="Frequency sag and severe voltage drop detected at Substation Bus."
                )
            },
            {
                "stage": 3,
                "name": "AI DETECTS HIGH BLACKOUT RISK",
                "description": "Multi-variable ML model predicts imminent cascading blackout within 2.8 seconds.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.92,
                    frequency_hz=49.28,
                    grid_load_pct=94.0,
                    ev_load_pct=38.0,
                    solar_output_pct=18.0,
                    transformer_pct=108.0,
                    battery_soc_pct=82.0,
                    grid_stress="CRITICAL",
                    blackout_risk_pct=89.0,
                    hospital_online=True,
                    status_summary="AI Advisory: BLACKOUT IMMINENT. Advise EV throttle and emergency BESS injection."
                )
            },
            {
                "stage": 4,
                "name": "FPGA RTL DETECTS THRESHOLD VIOLATION",
                "description": "Hardware fsm_controller.sv transitions from MONITOR -> DETECT -> ANALYZE -> PROTECT in 40ns.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.91,
                    frequency_hz=49.20,
                    grid_load_pct=95.0,
                    ev_load_pct=38.0,
                    solar_output_pct=16.0,
                    transformer_pct=112.0,
                    battery_soc_pct=82.0,
                    grid_stress="CRITICAL",
                    blackout_risk_pct=92.0,
                    hospital_online=True,
                    status_summary="Hardware FSM active. Asserting ev_throttle_cmd and hospital_isolate_lock."
                )
            },
            {
                "stage": 5,
                "name": "PLC VALIDATES SAFETY & INTERLOCKS",
                "description": "Deterministic Structured Text validates transformer temperature, battery SOC >= 20%, and locks hospital feeder.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.93,
                    frequency_hz=49.35,
                    grid_load_pct=91.0,
                    ev_load_pct=25.0,
                    solar_output_pct=16.0,
                    transformer_pct=102.0,
                    battery_soc_pct=80.0,
                    grid_stress="HIGH",
                    blackout_risk_pct=65.0,
                    hospital_online=True,
                    status_summary="PLC validates safety limits. EV contactor tripped. BESS discharge authorized."
                )
            },
            {
                "stage": 6,
                "name": "EV SHED + BESS INJECTION ACTIVE",
                "description": "Non-critical commercial EV charging curtailed by 70%. BESS injects 15 MW instantaneous active power.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.97,
                    frequency_hz=49.80,
                    grid_load_pct=72.0,
                    ev_load_pct=10.0,
                    solar_output_pct=16.0,
                    transformer_pct=79.0,
                    battery_soc_pct=75.0,
                    grid_stress="MODERATE",
                    blackout_risk_pct=28.0,
                    hospital_online=True,
                    status_summary="Power balance restored. Frequency recovering toward 50.0 Hz."
                )
            },
            {
                "stage": 7,
                "name": "GRID STABILIZED — BLACKOUT PREVENTED",
                "description": "System returns to steady-state monitoring. Critical hospital load maintained without a millisecond of interruption.",
                "telemetry": GridTelemetry(
                    voltage_pu=0.99,
                    frequency_hz=49.98,
                    grid_load_pct=64.0,
                    ev_load_pct=12.0,
                    solar_output_pct=20.0,
                    transformer_pct=71.0,
                    battery_soc_pct=73.0,
                    grid_stress="NOMINAL",
                    blackout_risk_pct=5.0,
                    hospital_online=True,
                    status_summary="🟢 GRID STABLE. BLACKOUT PREVENTED. HOSPITAL PROTECTED."
                )
            }
        ]

    def get_telemetry_for_state(self, status: str, iteration: int) -> GridTelemetry:
        """
        Returns realistic telemetry matching current workflow status.
        """
        if status in ("approved", "completed"):
            return self.demo_stages[-1]["telemetry"]
        elif status == "building":
            return self.demo_stages[1]["telemetry"]
        elif status == "reviewing":
            return self.demo_stages[2]["telemetry"]
        elif status == "revision_required":
            return self.demo_stages[3]["telemetry"]
        else:
            return self.demo_stages[0]["telemetry"]

    def get_demo_stages(self) -> List[Dict[str, Any]]:
        return self.demo_stages

simulation_service = SimulationService()
