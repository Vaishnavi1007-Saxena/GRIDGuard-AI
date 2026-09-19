using System;
using UnityEngine;

namespace GridGuard
{
    [Serializable]
    public class GridTelemetryData
    {
        public float voltage = 1.0f;              // in per-unit (0.80 - 1.20)
        public float frequency = 50.0f;           // in Hz (48.0 - 52.0)
        public float current = 1250.0f;           // in Amperes
        public float total_power_demand = 64.0f;  // in MW
        public float transformer_loading = 58.0f; // percentage (0 - 140%)
        public float solar_power = 520.0f;        // in kW
        public float ev_demand = 180.0f;          // in kW
        public float battery_soc = 82.0f;         // percentage (0 - 100%)
        public float grid_stress = 12.0f;         // percentage (0 - 100%)
        public float blackout_risk = 4.0f;        // percentage (0 - 100%)
        public float time_to_instability = 999f;  // in seconds
        
        public string status = "NORMAL";          // NORMAL, WARNING, CRITICAL, RECOVERY
        public string cause = "None";
        public string recommended_action = "Maintain Nominal Operation";
        public string plc_action = "All Feeders Connected. Hospital Interlock Active.";
        public string hospital_status = "PROTECTED (100% ONLINE)";
        public int fpga_selected_option = 0;      // 0: None, 1: Eval, 2: BESS, 3: EV, 4: BESS+EV

        public static GridTelemetryData CreateDefault()
        {
            return new GridTelemetryData();
        }
    }
}
