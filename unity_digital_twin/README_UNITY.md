# GRIDGUARD AI — 3D Smart City Digital Twin (Unity)

Welcome to the **GRIDGUARD AI 3D Interactive Smart City Digital Twin**.
This Unity application provides the real-time **3D visual and interaction layer** representing the physical electrical grid, power transmission, substation, solar PV farm, battery energy storage (BESS), EV charging plaza, industrial zone, residential district, and critical hospital infrastructure.

---

## 1. Quick Start Guide (How to Run in Unity)

### Step 1: Open in Unity Hub
1. Launch **Unity Hub**.
2. Click the **"Add"** button (top right) $\rightarrow$ **"Add project from disk"**.
3. Select the folder: `d:\gridguard\unity_digital_twin`.
4. Open the project with any Unity 2021 LTS, 2022 LTS, or 2023 version.

### Step 2: Set Up the Scene (1-Minute Automatic Setup)
1. In the **Project** window at the bottom, right-click `Assets` $\rightarrow$ **Create** $\rightarrow$ **Scene**, and name it `SmartCityDigitalTwin`.
2. Double-click to open `SmartCityDigitalTwin`.
3. In the **Hierarchy** window:
   - Click `+` $\rightarrow$ **Create Empty** $\rightarrow$ Rename it to `GridGuard_Manager`.
   - Add these scripts to `GridGuard_Manager` using **Add Component**:
     - `GridManager`
     - `SmartCityBuilder`
     - `CommunicationManager`
     - `HUDManager`
4. Select `Main Camera` in Hierarchy:
   - Add component `CameraController`.
   - In `GridGuard_Manager`, drag `Main Camera` into the `HUDManager`'s **Camera Controller** slot.
5. In the Inspector of `SmartCityBuilder`, right-click or click the three dots $\rightarrow$ **"Build Smart City"** (or simply press **Play ▶**).

The entire 3D city, buildings, hospital with illuminated red cross, solar panels, battery banks, EV charging plaza, substation transformers, and animated power lines will automatically generate instantly!

---

## 2. Interactive Features & Controls

### Live On-Screen Engineering HUD
- **Top Banner**: Live Grid Status (`NORMAL`, `WARNING`, `CRITICAL BLACKOUT RISK`, `AUTOMATED MITIGATION ACTIVE`).
- **Left Telemetry HUD**: Live meters for Voltage ($pu$), Frequency ($Hz$), Transformer Loading ($\%$), Solar ($kW$), EV Demand ($kW$), Battery SOC ($\%$) and Blackout Risk ($\%$).
- **Right AI Prediction Box**: Displays real-time blackout risk, probable disturbance cause, and recommended actions.
- **Right FPGA Accelerator Box**: Displays the 4-option What-If analysis, showing Option 4 selected in sub-microseconds.
- **Right PLC Safety Box**: Confirms deterministic safety interlocks: Hospital protection PASS, Battery SOC SAFE, Transformer limit SAFE.
- **Floating 3D Billboards**: Real-time readouts floating above components (`Transformer T1: 87%`, `Hospital: PROTECTED`, `Solar Farm: 420 kW`, `BESS: 82%`).

### Interactive Disturbance Controls (Bottom Bar)
- **▶ START 7-STAGE DEMO**: Automates the full end-to-end blackout prevention sequence:
  `Normal -> Solar Drop -> EV Surge -> Grid Stress -> AI Warning -> FPGA Evaluation -> PLC Safety Action -> Battery Injection -> Hospital Safe -> Stabilized!`
- **EV Surge (+150%)**: Triggers sudden fleet charging spike.
- **Solar Drop (-75%)**: Triggers cloud transient / solar collapse.
- **Compound (EV + Solar)**: Triggers simultaneous compound disturbance.
- **Transformer Overload**: Triggers $122\%$ thermal overload.
- **Reset Normal**: Restores nominal balance.

### Camera Viewpoints
- **Free Camera**: `W/A/S/D` to fly, `Q/E` for elevation, `Right Mouse Button` to look, `Scroll Wheel` to zoom.
- **F1**: City Overview View
- **F2**: Substation & Transformer View
- **F3**: Hospital Priority Feeder View
- **F4**: Solar PV Farm & BESS Storage View
- **F5**: EV Fast Charging Plaza View

---

## 3. Connecting to the FastAPI Backend

By default, Unity runs in **Standalone Simulation Mode**, so it works $100\%$ offline without requiring the Python server.
To stream live telemetry from the GRIDGUARD AI Python backend:
1. Ensure the backend is running (`python -m uvicorn backend.main:app --port 8000`).
2. In the `CommunicationManager` component in Unity:
   - Check **Connect To Live Backend** = `true`.
   - Set **Active Project Id** to your active project ID (e.g. `proj_1789807176601`).
3. Unity will poll live digital twin parameters directly from `http://127.0.0.1:8000/api/projects/{id}/telemetry` in real time!
