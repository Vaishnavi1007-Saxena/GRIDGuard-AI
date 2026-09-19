using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace GridGuard
{
    public class GridManager : MonoBehaviour
    {
        public static GridManager Instance { get; private set; }

        public GridTelemetryData currentTelemetry = new GridTelemetryData();

        [Header("Zone Controllers")]
        public TransformerController mainTransformer;
        public SolarController solarFarm;
        public BatteryController bessBattery;
        public EVController evPlaza;
        public HospitalController hospital;

        [Header("Power Flow Lines")]
        public List<PowerFlowVisualizer> powerLines = new List<PowerFlowVisualizer>();

        public bool isRunningDemoScenario = false;
        private Coroutine demoCoroutine;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            ApplyTelemetry(GridTelemetryData.CreateDefault());
        }

        public void ApplyTelemetry(GridTelemetryData data)
        {
            currentTelemetry = data;

            // Update 3D Component Controllers
            if (mainTransformer != null)
                mainTransformer.UpdateLoading(data.transformer_loading);

            if (solarFarm != null)
                solarFarm.UpdateGeneration(data.solar_power);

            if (bessBattery != null)
                bessBattery.UpdateBattery(data.battery_soc, data.plc_action.Contains("Battery ON") || data.plc_action.Contains("Discharge"));

            if (evPlaza != null)
                evPlaza.UpdateEVPlaza(data.ev_demand, data.plc_action.Contains("EV reduction ON") || data.plc_action.Contains("Throttled"));

            if (hospital != null)
                hospital.UpdateStatus(data.hospital_status.Contains("PROTECTED") || data.hospital_status.Contains("100%"));

            // Update Power Flow Line Visualizers
            PowerFlowVisualizer.FlowState lineState = PowerFlowVisualizer.FlowState.Normal;
            if (data.status == "CRITICAL" || data.blackout_risk > 75f)
                lineState = PowerFlowVisualizer.FlowState.Critical;
            else if (data.status == "WARNING" || data.blackout_risk > 40f)
                lineState = PowerFlowVisualizer.FlowState.Warning;
            else if (data.status == "FAULT")
                lineState = PowerFlowVisualizer.FlowState.Fault;

            foreach (var line in powerLines)
            {
                if (line != null) line.SetFlowState(lineState);
            }
        }

        // ==========================================
        // 8 USER-REQUESTED SIMULATION EVENT TRIGGERS
        // ==========================================

        // 1. EV SURGE (+150%)
        public void TriggerEVSurge()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.94f,
                frequency = 49.45f,
                transformer_loading = 98f,
                solar_power = 480f,
                ev_demand = 450f, // Massive EV surge
                battery_soc = 80f,
                grid_stress = 78f,
                blackout_risk = 68f,
                status = "WARNING",
                cause = "Sudden EV Fast-Charging Fleet Surge (+150% Peak)",
                recommended_action = "Throttle Commercial EV Fast-Chargers & Arm BESS",
                plc_action = "Safety Check: Transformer thermal monitoring armed",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 3
            });
        }

        // 2. SOLAR DROP (-75%)
        public void TriggerSolarDrop()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.95f,
                frequency = 49.50f,
                transformer_loading = 82f,
                solar_power = 110f, // 75% drop
                ev_demand = 180f,
                battery_soc = 80f,
                grid_stress = 65f,
                blackout_risk = 54f,
                status = "WARNING",
                cause = "Dense Cloud Cover Solar Irradiance Sag (-75%)",
                recommended_action = "Inject BESS Active Power to Counter Frequency Sag",
                plc_action = "BESS Fast-Injection Ready. Hospital Feeder locked.",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 2
            });
        }

        // 3. RESIDENTIAL LOAD INCREASE (+80%)
        public void TriggerResidentialLoadIncrease()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.94f,
                frequency = 49.60f,
                transformer_loading = 88f,
                solar_power = 400f,
                ev_demand = 220f,
                battery_soc = 78f,
                grid_stress = 72f,
                blackout_risk = 58f,
                status = "WARNING",
                cause = "Residential Evening Heatwave Surge: Air Conditioning Load +80%",
                recommended_action = "Activate Peak Shaving via BESS & Industrial Shedding Tier 1",
                plc_action = "PLC Enforcing Feeder Balance (Residential Priority Maintained)",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 2
            });
        }

        // 4. INDUSTRIAL LOAD INCREASE (+100%)
        public void TriggerIndustrialLoadIncrease()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.92f,
                frequency = 49.38f,
                transformer_loading = 104f,
                solar_power = 380f,
                ev_demand = 250f,
                battery_soc = 76f,
                grid_stress = 85f,
                blackout_risk = 76f,
                status = "CRITICAL",
                cause = "Heavy Industrial Induction Motors In-Rush Surge (+100% Load)",
                recommended_action = "Curtail Non-Critical Industrial Lines & Engage Power Factor Caps",
                plc_action = "PLC Industrial Interlock: Ready to shed non-essential factory feeder",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 3
            });
        }

        // 5. TRANSFORMER OVERLOAD (125% RATING)
        public void TriggerTransformerOverload()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.91f,
                frequency = 49.25f,
                transformer_loading = 125f, // Severe thermal threshold
                solar_power = 220f,
                ev_demand = 480f,
                battery_soc = 74f,
                grid_stress = 94f,
                blackout_risk = 92f,
                status = "CRITICAL",
                cause = "Main Substation Transformer T1 Severe Thermal Overload (125%)",
                recommended_action = "Emergency BESS Discharge + Throttle EV Hub to 25%",
                plc_action = "PLC OVERLOAD TIMER ACTIVE (T-12s before hardware trip)",
                hospital_status = "PROTECTED (100% ONLINE - ATS READY)",
                fpga_selected_option = 4
            });
        }

        // 6. GENERATOR FAILURE (Loss of 400 MW Unit)
        public void TriggerGeneratorFailure()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.89f,
                frequency = 48.95f, // Underfrequency trip threat
                transformer_loading = 115f,
                solar_power = 350f,
                ev_demand = 350f,
                battery_soc = 78f,
                grid_stress = 98f,
                blackout_risk = 96f,
                status = "CRITICAL",
                cause = "Bulk Generation Trip: Main CCGT Unit 2 Tripped (Loss of 400 MW)",
                recommended_action = "Full BESS Fast-Frequency Injection (FFR) + Islanding Prep",
                plc_action = "PLC Under-Frequency Relay 81U Armed; Hospital Feeder Isolated & Safe",
                hospital_status = "PROTECTED (100% ONLINE - STANDALONE BACKUP ACTIVE)",
                fpga_selected_option = 4
            });
        }

        // 7. BATTERY UNAVAILABLE (Fault / Maintenance)
        public void TriggerBatteryUnavailable()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.93f,
                frequency = 49.40f,
                transformer_loading = 96f,
                solar_power = 280f,
                ev_demand = 390f,
                battery_soc = 0f, // Depleted / Tripped
                grid_stress = 82f,
                blackout_risk = 79f,
                status = "WARNING",
                cause = "BESS Battery Storage Breaker Tripped / Unavailable (SOC 0%)",
                recommended_action = "BESS Unavailable: Must Curtail EV Chargers & Industrial Feeder directly",
                plc_action = "PLC Fallback Mode: Direct Load Shedding Rule Active",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 3
            });
        }

        // 8. AUTOMATED RECOVERY / RESET TO NORMAL
        public void ResetToNormal()
        {
            StopActiveDemo();
            ApplyTelemetry(GridTelemetryData.CreateDefault());
        }

        public void TriggerAutomatedRecovery()
        {
            StopActiveDemo();
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.99f,
                frequency = 49.98f,
                transformer_loading = 62f,
                solar_power = 520f,
                ev_demand = 220f,
                battery_soc = 76f,
                grid_stress = 10f,
                blackout_risk = 5f,
                status = "RECOVERY",
                cause = "AI/FPGA/PLC Autonomous Mitigation Complete — Grid Stabilized",
                recommended_action = "🟢 NORMAL STEADY-STATE SUPERVISION (ZERO BLACKOUTS)",
                plc_action = "All 5 Feeders Nominal. Hospital 100% Online.",
                hospital_status = "PROTECTED (100% ONLINE)",
                fpga_selected_option = 0
            });
        }

        // 7-Stage End-to-End Demonstration Sequence
        public void StartDemoScenario()
        {
            StopActiveDemo();
            demoCoroutine = StartCoroutine(RunDemoSequence());
        }

        private void StopActiveDemo()
        {
            if (demoCoroutine != null)
            {
                StopCoroutine(demoCoroutine);
                demoCoroutine = null;
            }
            isRunningDemoScenario = false;
        }

        private IEnumerator RunDemoSequence()
        {
            isRunningDemoScenario = true;

            // Stage 1: Nominal
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 1.0f, frequency = 50.0f, transformer_loading = 58f, solar_power = 520f, ev_demand = 180f,
                battery_soc = 82f, grid_stress = 10f, blackout_risk = 4f, status = "NORMAL",
                cause = "Normal Steady-State (IEEE 1547 compliant)",
                recommended_action = "Nominal Monitoring", plc_action = "All Feeders Balanced",
                hospital_status = "PROTECTED (100% ONLINE)", fpga_selected_option = 0
            });
            yield return new WaitForSeconds(3.5f);

            // Stage 2: EV Surge occurs
            TriggerEVSurge();
            yield return new WaitForSeconds(3.5f);

            // Stage 3: Solar drops simultaneously (Dual Surge)
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.91f, frequency = 49.18f, transformer_loading = 112f, solar_power = 110f, ev_demand = 480f,
                battery_soc = 80f, grid_stress = 94f, blackout_risk = 91f, status = "CRITICAL",
                cause = "Compound Dual-Surge: EV Fleet Surge AND Solar Collapse",
                recommended_action = "AI Dual-Surge Detected. Blackout imminent within 45s.",
                plc_action = "FPGA Hardware Matrix Running 4 Parallel Options...",
                hospital_status = "PROTECTED (100% ONLINE)", fpga_selected_option = 4
            });
            yield return new WaitForSeconds(4.0f);

            // Stage 4: FPGA evaluates options & PLC commands mitigation
            ApplyTelemetry(new GridTelemetryData
            {
                voltage = 0.96f, frequency = 49.75f, transformer_loading = 78f, solar_power = 110f, ev_demand = 180f,
                battery_soc = 75f, grid_stress = 42f, blackout_risk = 28f, status = "RECOVERY",
                cause = "Mitigation Active: BESS Discharging 15 MW, EV Hub Throttled 60%",
                recommended_action = "Option 4 Active: Power Balance Restored. System Recovering.",
                plc_action = "PLC ACTION: Battery ON, EV Throttled, Hospital LOCKED",
                hospital_status = "PROTECTED (100% ONLINE)", fpga_selected_option = 4
            });
            yield return new WaitForSeconds(4.0f);

            // Stage 5: Full recovery
            TriggerAutomatedRecovery();
            isRunningDemoScenario = false;
            demoCoroutine = null;
        }
    }
}
