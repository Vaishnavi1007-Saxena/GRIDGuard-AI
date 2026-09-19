using UnityEngine;

namespace GridGuard
{
    public class HUDManager : MonoBehaviour
    {
        public static HUDManager Instance { get; private set; }

        public CameraController cameraController;
        private GUIStyle headerStyle;
        private GUIStyle sectionStyle;
        private GUIStyle labelStyle;
        private GUIStyle valueStyle;
        private GUIStyle buttonStyle;
        private GUIStyle cardStyle;
        private GUIStyle eventBtnStyle;

        private bool showPanels = true;
        private InspectableObject selectedObject = null;

        private void Awake()
        {
            Instance = this;
        }

        public void SelectObject(InspectableObject obj)
        {
            selectedObject = obj;
        }

        private void OnGUI()
        {
            InitStyles();

            GridTelemetryData t = GridManager.Instance != null ? GridManager.Instance.currentTelemetry : new GridTelemetryData();

            // 1. TOP CONTROL ROOM BANNER
            DrawTopBanner(t);

            // 2. LEFT TELEMETRY PANEL (Physical Grid Metrics)
            if (showPanels) DrawLeftMetricsPanel(t);

            // 3. RIGHT INTELLIGENCE PANEL (AI, FPGA What-If, PLC Interlocks)
            if (showPanels) DrawRightIntelligencePanel(t);

            // 4. ON-SCREEN OBJECT INSPECTION PANEL (When user clicks any 3D asset)
            if (selectedObject != null)
            {
                DrawObjectInspectionCard();
            }

            // 5. BOTTOM CONTROL DOCK (Camera Presets & 8 Simulation Event Triggers)
            DrawBottomControls(t);
        }

        private void InitStyles()
        {
            if (headerStyle != null) return;

            headerStyle = new GUIStyle(GUI.skin.label)
            {
                fontStyle = FontStyle.Bold,
                fontSize = 14,
                alignment = TextAnchor.MiddleLeft
            };
            headerStyle.normal.textColor = Color.cyan;

            sectionStyle = new GUIStyle(GUI.skin.label)
            {
                fontStyle = FontStyle.Bold,
                fontSize = 10,
                alignment = TextAnchor.MiddleLeft
            };
            sectionStyle.normal.textColor = new Color(0f, 0.9f, 1f);

            labelStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 10
            };
            labelStyle.normal.textColor = new Color(0.72f, 0.78f, 0.86f);

            valueStyle = new GUIStyle(GUI.skin.label)
            {
                fontStyle = FontStyle.Bold,
                fontSize = 10,
                alignment = TextAnchor.MiddleRight
            };
            valueStyle.normal.textColor = Color.white;

            buttonStyle = new GUIStyle(GUI.skin.button)
            {
                fontSize = 9,
                fontStyle = FontStyle.Bold
            };

            eventBtnStyle = new GUIStyle(GUI.skin.button)
            {
                fontSize = 9,
                fontStyle = FontStyle.Bold
            };

            cardStyle = new GUIStyle(GUI.skin.box);
        }

        private void DrawTopBanner(GridTelemetryData t)
        {
            GUILayout.BeginArea(new Rect(10, 8, Screen.width - 20, 42), GUI.skin.box);
            GUILayout.BeginHorizontal();

            GUILayout.Label("⚡ GRIDGUARD AI — SMART CITY POWER GRID DIGITAL TWIN", headerStyle, GUILayout.Width(480));

            GUILayout.FlexibleSpace();

            // Status Indicator Badge
            Color statusBg = Color.green;
            string statusTxt = "GRID STATUS: NOMINAL (HEALTHY)";
            if (t.status == "CRITICAL" || t.blackout_risk > 75f)
            {
                statusBg = Color.red;
                statusTxt = "GRID STATUS: CRITICAL BLACKOUT RISK";
            }
            else if (t.status == "WARNING" || t.blackout_risk > 40f)
            {
                statusBg = new Color(1f, 0.6f, 0f);
                statusTxt = "GRID STATUS: WARNING (DISTURBANCE)";
            }
            else if (t.status == "RECOVERY")
            {
                statusBg = Color.cyan;
                statusTxt = "GRID STATUS: AUTONOMOUS MITIGATION ACTIVE";
            }

            GUI.color = statusBg;
            GUILayout.Box(statusTxt, GUILayout.Height(26), GUILayout.Width(290));
            GUI.color = Color.white;

            GUILayout.Space(8);

            // Hospital Protection Pill
            GUI.color = new Color(0.1f, 0.8f, 0.4f);
            GUILayout.Box("🏥 HOSPITAL: PROTECTED (100% ONLINE)", GUILayout.Height(26), GUILayout.Width(260));
            GUI.color = Color.white;

            GUILayout.Space(8);
            if (GUILayout.Button(showPanels ? "Hide HUD" : "Show HUD", GUILayout.Width(80), GUILayout.Height(26)))
            {
                showPanels = !showPanels;
            }

            GUILayout.EndHorizontal();
            GUILayout.EndArea();
        }

        private void DrawLeftMetricsPanel(GridTelemetryData t)
        {
            float panelWidth = 245;
            GUILayout.BeginArea(new Rect(10, 54, panelWidth, 385), GUI.skin.box);
            GUILayout.Label("PHYSICAL GRID TELEMETRY", sectionStyle);
            GUILayout.Space(2);

            DrawMetricRow("Bulk Transmission", "220.8 kV", Color.cyan);
            DrawMetricRow("Substation Bus (11kV)", $"{t.voltage:F2} pu", t.voltage < 0.95f ? Color.red : Color.green);
            DrawMetricRow("Frequency", $"{t.frequency:F2} Hz", t.frequency < 49.5f ? Color.red : Color.green);
            DrawMetricRow("Total Urban Load", $"{t.total_power_demand:F1} MW", Color.white);
            DrawMetricRow("Transformer T1 Loading", $"{t.transformer_loading:F0}%", t.transformer_loading > 90f ? Color.red : Color.white);
            DrawMetricRow("Solar Farm Output", $"{t.solar_power:F0} kW", t.solar_power < 200f ? Color.yellow : Color.white);
            DrawMetricRow("EV Charging Demand", $"{t.ev_demand:F0} kW", t.ev_demand > 350f ? Color.red : Color.white);
            DrawMetricRow("BESS Battery Reserve", $"{t.battery_soc:F0}%", t.battery_soc < 25f ? Color.red : Color.green);
            DrawMetricRow("Grid Stress Index", $"{t.grid_stress:F0}%", t.grid_stress > 70f ? Color.red : Color.white);
            DrawMetricRow("Blackout Risk", $"{t.blackout_risk:F0}%", t.blackout_risk > 60f ? Color.red : Color.cyan);

            GUILayout.Space(4);
            GUILayout.Label("FEEDER CIRCUITS (11 kV)", sectionStyle);
            DrawMetricRow("F1 Hospital (Critical)", "IMMUNE (100%)", Color.green);
            DrawMetricRow("F2 Pharmacy / Commercial", "ONLINE (11 kV)", Color.white);
            DrawMetricRow("F3 Residential District", "STABLE (240V)", Color.white);
            DrawMetricRow("F4 Industrial Heavy", "ACTIVE (480V)", Color.white);
            DrawMetricRow("F5 EV Charging Plaza", $"{t.ev_demand:F0} kW", t.ev_demand > 350f ? Color.red : Color.cyan);

            GUILayout.EndArea();
        }

        private void DrawRightIntelligencePanel(GridTelemetryData t)
        {
            float panelWidth = 315;
            GUILayout.BeginArea(new Rect(Screen.width - panelWidth - 10, 54, panelWidth, 420), GUI.skin.box);

            // 1. AI PREDICTION
            GUILayout.Label("🧠 AI PREDICTIVE LAYER (LightGBM/XGBoost)", sectionStyle);
            GUILayout.BeginVertical(GUI.skin.box);
            GUILayout.Label($"Blackout Probability: <b>{t.blackout_risk:F0}%</b>", labelStyle);
            GUILayout.Label($"Diagnosis: <color=orange>{t.cause}</color>", labelStyle);
            GUILayout.Label($"Prescription: <color=cyan>{t.recommended_action}</color>", labelStyle);
            GUILayout.EndVertical();

            GUILayout.Space(4);

            // 2. FPGA WHAT-IF EVALUATOR
            GUILayout.Label("⚡ FPGA HARDWARE ACCELERATOR (WHAT-IF)", sectionStyle);
            GUILayout.BeginVertical(GUI.skin.box);
            DrawFPGAOption(1, "Option 1: No Action", "Grid Blackout ❌", t.fpga_selected_option == 1);
            DrawFPGAOption(2, "Option 2: BESS Discharge", "Improved ⚠️", t.fpga_selected_option == 2);
            DrawFPGAOption(3, "Option 3: Throttle EV Load", "Improved ⚠️", t.fpga_selected_option == 3);
            DrawFPGAOption(4, "Option 4: BESS + EV Throttle", "GRID STABLE ✅", t.fpga_selected_option == 4 || t.status == "RECOVERY" || t.status == "CRITICAL");
            GUILayout.EndVertical();

            GUILayout.Space(4);

            // 3. PLC DETERMINISTIC SAFETY INTERLOCKS
            GUILayout.Label("🛡️ PLC SAFETY & INTERLOCKS (IEC 61131-3)", sectionStyle);
            GUILayout.BeginVertical(GUI.skin.box);
            GUILayout.Label("• Hospital Shedding Lock: <color=green>IMMUNE (ALWAYS ON)</color>", labelStyle);
            GUILayout.Label($"• Battery Reserve >= 20%: {(t.battery_soc >= 20 ? "<color=green>PASS</color>" : "<color=red>TRIPPED</color>")}", labelStyle);
            GUILayout.Label($"• Transformer Limit < 120%: {(t.transformer_loading < 120 ? "<color=green>SAFE</color>" : "<color=red>OVERLOAD TRIP ARMED</color>")}", labelStyle);
            GUILayout.Label($"• Active Safety Action: <color=yellow>{t.plc_action}</color>", labelStyle);
            GUILayout.EndVertical();

            GUILayout.EndArea();
        }

        private void DrawObjectInspectionCard()
        {
            float width = 290;
            float height = 215;
            float x = 265;
            float y = 54;

            GUILayout.BeginArea(new Rect(x, y, width, height), GUI.skin.box);
            GUILayout.BeginHorizontal();
            GUILayout.Label($"🔍 INSPECTOR: <b>{selectedObject.objectName}</b>", sectionStyle);
            if (GUILayout.Button("✕", GUILayout.Width(20), GUILayout.Height(18)))
            {
                selectedObject = null;
                GUILayout.EndHorizontal();
                GUILayout.EndArea();
                return;
            }
            GUILayout.EndHorizontal();

            GUILayout.Space(3);
            DrawMetricRow("Zone / Domain", selectedObject.zoneType, Color.cyan);
            DrawMetricRow("Voltage Class", selectedObject.voltageLevel, Color.white);
            DrawMetricRow("Capacity / Rating", selectedObject.powerRating, Color.white);
            DrawMetricRow("Feeder Route", selectedObject.feederCircuit, Color.yellow);
            DrawMetricRow("Operating Temp", $"{selectedObject.operatingTemp:F1} °C", selectedObject.operatingTemp > 75 ? Color.red : Color.green);
            DrawMetricRow("Operational State", selectedObject.operationalStatus, Color.green);

            GUILayout.Space(4);
            GUILayout.Label($"<i>{selectedObject.description}</i>", labelStyle);

            GUILayout.EndArea();
        }

        private void DrawBottomControls(GridTelemetryData t)
        {
            float boxWidth = Screen.width - 20;
            GUILayout.BeginArea(new Rect(10, Screen.height - 118, boxWidth, 110), GUI.skin.box);

            // ROW 1: CAMERA VIEWPOINTS PRESETS
            GUILayout.BeginHorizontal();
            GUILayout.Label("📹 CAMERA VIEWS:", sectionStyle, GUILayout.Width(105));
            if (GUILayout.Button("Overview [1]", buttonStyle)) cameraController?.SetViewByName("overview");
            if (GUILayout.Button("Substation [2]", buttonStyle)) cameraController?.SetViewByName("substation");
            if (GUILayout.Button("Xfmr T1 [3]", buttonStyle)) cameraController?.SetViewByName("transformer");
            if (GUILayout.Button("Residential [4]", buttonStyle)) cameraController?.SetViewByName("residential");
            if (GUILayout.Button("Industrial [5]", buttonStyle)) cameraController?.SetViewByName("industrial");
            if (GUILayout.Button("Hospital [6]", buttonStyle)) cameraController?.SetViewByName("hospital");
            if (GUILayout.Button("Pharmacy [7]", buttonStyle)) cameraController?.SetViewByName("pharmacy");
            if (GUILayout.Button("EV Plaza [8]", buttonStyle)) cameraController?.SetViewByName("ev");
            if (GUILayout.Button("Solar Farm [9]", buttonStyle)) cameraController?.SetViewByName("solar");
            if (GUILayout.Button("BESS Battery [0]", buttonStyle)) cameraController?.SetViewByName("bess");
            if (GUILayout.Button("🚶 Street Walk [V]", buttonStyle)) cameraController?.SetViewByName("street");
            GUILayout.EndHorizontal();

            GUILayout.Space(3);

            // ROW 2: ALL 8 USER-REQUESTED SIMULATION EVENT TRIGGERS
            GUILayout.BeginHorizontal();
            GUI.color = new Color(0f, 0.85f, 1f);
            if (GUILayout.Button("▶ 7-STAGE DEMO (Surge -> AI -> FPGA -> Safe Recovery)", GUILayout.Width(280), GUILayout.Height(30)))
            {
                GridManager.Instance?.StartDemoScenario();
            }
            GUI.color = Color.white;

            GUILayout.Space(4);

            // 8 Individual Fault / Disturbance Triggers
            if (GUILayout.Button("⚡ EV Surge\n(+150%)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerEVSurge();
            if (GUILayout.Button("☀ Solar Drop\n(-75%)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerSolarDrop();
            if (GUILayout.Button("🏡 Res. Load\n(+80%)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerResidentialLoadIncrease();
            if (GUILayout.Button("🏭 Ind. Load\n(+100%)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerIndustrialLoadIncrease();
            if (GUILayout.Button("⚠️ Xfmr Overload\n(125%)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerTransformerOverload();
            if (GUILayout.Button("💥 Gen Failure\n(-400 MW)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerGeneratorFailure();
            if (GUILayout.Button("🔋 Battery Unavail\n(Fault)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.TriggerBatteryUnavailable();

            GUI.color = new Color(0.2f, 0.9f, 0.4f);
            if (GUILayout.Button("✅ Reset / Recovery\n(Nominal)", eventBtnStyle, GUILayout.Height(30))) GridManager.Instance?.ResetToNormal();
            GUI.color = Color.white;

            GUILayout.EndHorizontal();

            GUILayout.EndArea();
        }

        private void DrawMetricRow(string label, string value, Color valColor)
        {
            GUILayout.BeginHorizontal();
            GUILayout.Label(label, labelStyle);
            valueStyle.normal.textColor = valColor;
            GUILayout.Label(value, valueStyle);
            GUILayout.EndHorizontal();
        }

        private void DrawFPGAOption(int optNum, string optName, string result, bool isSelected)
        {
            GUILayout.BeginHorizontal();
            string prefix = isSelected ? "▶ <b>" : "  ";
            string suffix = isSelected ? "</b>" : "";
            Color c = isSelected ? Color.cyan : Color.gray;
            GUI.color = c;
            GUILayout.Label($"{prefix}{optName}: {result}{suffix}", labelStyle);
            GUI.color = Color.white;
            GUILayout.EndHorizontal();
        }
    }
}
