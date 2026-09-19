# GRIDGUARD AI — Multi-Agent GenAI Smart Grid Project Builder

A complete software-only multi-agent GenAI application for designing, simulating, reviewing, and iteratively improving smart-city electrical grid protection systems.

GRIDGUARD AI coordinates **3 autonomous AI agents**:
1. **ORCHESTRATOR AGENT**: Ingests natural-language smart grid requirements, formulates formal engineering problem statements and objectives, decomposes projects into structured builder tasks, manages agent communications, inspects Reviewer audits, and strictly enforces iteration limits (up to 3 iterations).
2. **BUILDER AGENT**: Generates the complete technical engineering solution:
   - Smart-Grid Architecture & Bus Topology
   - MATLAB / Simscape Electrical Model Specifications & Runnable Simulation Scripts
   - Explainable AI Grid Prediction Logic (LightGBM/XGBoost inference pipeline)
   - FPGA SystemVerilog RTL Modules (`grid_controller.sv`, `fsm_controller.sv`, `stress_detector.sv`)
   - Comprehensive 6-Scenario RTL Testbench (`grid_controller_tb.sv`)
   - IEC 61131-3 Structured Text PLC Safety Logic with fail-safe interlocks
3. **REVIEWER AGENT**: Independently audits the Builder's deliverables across 7 distinct engineering categories (RTL Synthesizability, FSM recovery, timing, testbench assertions, critical load priority, and PLC interlocks), generating structured severity ratings, actionable issue descriptions, and recommendations.

---

## Architecture Overview

```
                      USER REQUIREMENT
                             ↓
              ┌─────────────────────────────┐
              │     ORCHESTRATOR AGENT      │
              │ (Plan, Task Decomposition,  │
              │  Iteration Control, State)  │
              └──────────────┬──────────────┘
                             │  Structured Build Request
                             ▼
              ┌─────────────────────────────┐
              │        BUILDER AGENT        │
              │ (Architecture, Simulink,    │
              │  AI Model, RTL, TB, PLC)    │
              └──────────────┬──────────────┘
                             │  Generated Engineering Deliverables
                             ▼
              ┌─────────────────────────────┐
              │       REVIEWER AGENT        │
              │ (Synthesizability, FSM,     │
              │  Timing, Interlocks, Grid)  │
              └──────────────┬──────────────┘
                             │  Structured Audit Report (Approved / Issues)
                             ▼
              ┌─────────────────────────────┐
              │     ORCHESTRATOR AGENT      │
              └──────────────┬──────────────┘
                  │                     │
     [Approved / Max Iter]     [Issues & Iter < 3]
                  │                     │
                  ▼                     ▼
          FINAL APPROVED         REVISION REQUEST
              PROJECT            (back to Builder)
```

---

## Prerequisites

- **Python**: 3.10 to 3.13 (Tested on Python 3.13.5)
- **Node.js**: 18.x or higher (Tested on Node v26.2.0)
- **npm**: 9.x or higher (Tested on npm 11.13.0)
- **Modern Web Browser**: Chrome, Edge, Firefox, or Brave

> [!NOTE]
> This application is **100% software-based**. No physical FPGA board, physical PLC, physical relays, EV chargers, solar inverters, or battery hardware are required. External software toolboxes (MATLAB/Simulink, Vivado, Siemens TIA Portal) are optional integration targets; generated specifications are completely standalone.

---

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:
```env
# LLM Provider: gemini, openai, anthropic, or mock (for offline fallback)
LLM_PROVIDER=gemini
LLM_API_KEY=your_api_key_here
LLM_MODEL=gemini-2.0-flash

# Server Configuration
HOST=127.0.0.1
PORT=8000
```

> [!TIP]
> If `LLM_API_KEY` is not provided, the system automatically runs in a high-fidelity **domain-expert fallback mode** simulating realistic multi-agent critique, iteration 1 rejection, iteration 2 revision, and final validation.

---

## Installation

### Backend Setup
```bash
# From project root
cd d:/gridguard

# Install Python backend dependencies
python -m pip install -r backend/requirements.txt
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd d:/gridguard/frontend

# Install frontend dependencies
npm install
```

---

## How to Run

### Step 1: Start the Backend
Open a terminal in `d:/gridguard`:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will be active at `http://127.0.0.1:8000`.
Interactive API docs are available at `http://127.0.0.1:8000/docs`.

### Step 2: Start the Frontend
Open a second terminal in `d:/gridguard/frontend`:
```bash
npm run dev
```
The modern engineering control-room dashboard will launch at `http://localhost:5173`.

---

## How to Use the Application

1. Open `http://localhost:5173` in your browser.
2. Enter your smart-grid design challenge into the prompt box, or click one of the quick preset buttons:
   - **EV Surge + Solar Drop**:
     *"Design a system that detects potential blackouts caused by EV charging surges and solar generation drops, predicts grid instability, and automatically protects critical loads such as hospitals."*
   - **Hospital Feeder Priority**:
     *"Build a smart-city grid protection controller that prioritizes hospital critical load bus during sudden generation loss, executes automated EV fleet throttling, and dispatches battery storage."*
   - **Transformer Thermal Overload**:
     *"Create an FPGA and PLC protection system that monitors substation transformer winding temperature and loading, prevents cascade thermal tripping, and sheds non-critical industrial feeders."*
3. Click **BUILD PROJECT**.
4. Observe the 3 AI Agents collaborating in real-time:
   - **Orchestrator Panel**: Watch task checklist transition from pending (`○`) to in-progress (`→`) to completed (`✓`), tracking active iterations (`1 / 3` -> `2 / 3`).
   - **Builder Panel**: Inspect generated SystemVerilog RTL code (`grid_controller.sv`, `fsm_controller.sv`, `stress_detector.sv`), 6-scenario testbench, IEC 61131-3 PLC Structured Text, AI prediction model, and MATLAB/Simulink specifications with one-click copy.
   - **Reviewer Panel**: See independent audit results. In Iteration 1, the Reviewer flags genuine edge cases (e.g. FSM default recovery state, missing testbench hospital assertion). In Iteration 2, it verifies the fixes and marks `APPROVED: YES (SEVERITY: NONE)`.
   - **Live Activity Log**: Real-time stream of timestamped backend events (`[11:42:01] Orchestrator → Builder`, etc.).
   - **Virtual Grid Visualizer**: Watch single-line topology with live indicators for Bus Voltage (pu), Frequency (Hz), Grid Load %, EV Fleet Demand %, Solar %, Transformer %, and Blackout Risk %.
   - **Blackout Demo Walkthrough**: Interactive step-by-step walkthrough showing the 7 stages from steady-state through compound disturbance to stabilization.
5. Click **EXPORT DOSSIER (.JSON)** to download the complete approved engineering package.

---

## Agent Workflow & Iteration Behavior

The workflow follows a strict, finite state machine:
```
USER REQUIREMENT
       ↓
ORCHESTRATOR (Creates plan & tasks)
       ↓
BUILDER (Generates Version 1 deliverables)
       ↓
REVIEWER (Audits Version 1: Flags 3 issues, severity: MEDIUM)
       ↓
ORCHESTRATOR (Evaluates audit: Iteration 1 < 3 -> Decision: REVISION REQUIRED)
       ↓
BUILDER (Generates Version 2 addressing all feedback)
       ↓
REVIEWER (Audits Version 2: All issues resolved -> APPROVED)
       ↓
ORCHESTRATOR (Decision: APPROVED)
       ↓
FINAL APPROVED PROJECT DOSSIER
```

### Maximum Iteration Enforcement
- The workflow allows a maximum of **3 iterations**.
- If after 3 iterations the design still contains unresolved observations, the Orchestrator stops cleanly with `status = "completed"` and `approval_status = "not_approved_after_max_iterations"`.
- Under no circumstances can the agents enter an infinite loop.

---

## Running the Automated Test Suite

GRIDGUARD AI includes 10 comprehensive automated end-to-end and unit tests:
1. `test_1_normal_smart_grid_requirement`: Normal prompt decomposition.
2. `test_2_ev_surge_and_solar_drop`: Disturbance task formulation.
3. `test_3_transformer_overload`: Substation transformer PLC logic.
4. `test_4_hospital_critical_load_protection`: Hardware and PLC lockouts for critical hospital feeder.
5. `test_5_reviewer_rejects_builder_output_iteration_1`: Independent audit issue detection.
6. `test_6_builder_produces_revision_addressing_issues`: Builder incorporating feedback.
7. `test_7_reviewer_approves_revision`: Validation of hardened design.
8. `test_8_maximum_3_iterations_reached`: Strict termination at 3 iterations.
9. `test_9_llm_failure_fallback`: Graceful recovery on invalid API key or network fault.
10. `test_10_malformed_agent_json`: Resilient JSON cleaning and extraction.

To run the test suite:
```bash
python -m pytest backend/tests/test_workflow_e2e.py -v -o asyncio_mode=auto
```

Expected output:
```
backend/tests/test_workflow_e2e.py::test_1_normal_smart_grid_requirement PASSED
backend/tests/test_workflow_e2e.py::test_2_ev_surge_and_solar_drop PASSED
backend/tests/test_workflow_e2e.py::test_3_transformer_overload PASSED
backend/tests/test_workflow_e2e.py::test_4_hospital_critical_load_protection PASSED
backend/tests/test_workflow_e2e.py::test_5_reviewer_rejects_builder_output_iteration_1 PASSED
backend/tests/test_workflow_e2e.py::test_6_builder_produces_revision_addressing_issues PASSED
backend/tests/test_workflow_e2e.py::test_7_reviewer_approves_revision PASSED
backend/tests/test_workflow_e2e.py::test_8_maximum_3_iterations_reached PASSED
backend/tests/test_workflow_e2e.py::test_9_llm_failure_fallback PASSED
backend/tests/test_workflow_e2e.py::test_10_malformed_agent_json PASSED

============================= 10 passed in 2.22s ==============================
```

---

## Project File Structure

```
d:/gridguard/
├── backend/
│   ├── agents/
│   │   ├── orchestrator/
│   │   │   ├── orchestrator.py    # Orchestrator agent logic
│   │   │   ├── prompts.py         # System & decision prompts
│   │   │   └── schemas.py         # Plan & decision schemas
│   │   ├── builder/
│   │   │   ├── builder.py         # Builder agent generator
│   │   │   ├── prompts.py         # Technical generation prompts
│   │   │   └── schemas.py         # Builder output schemas
│   │   └── reviewer/
│   │       ├── reviewer.py        # Reviewer agent audit logic
│   │       ├── prompts.py         # Independent audit criteria
│   │       └── schemas.py         # Review result & issue schemas
│   ├── config.py                  # App configuration & env reader
│   ├── main.py                    # FastAPI entry point
│   ├── models/
│   │   ├── agent_message.py       # Structured message envelope
│   │   ├── builder_output.py      # Technical deliverables model
│   │   ├── project_state.py       # Project state & iteration record
│   │   └── review_result.py       # Audit issues & recommendations
│   ├── requirements.txt           # Python dependencies
│   ├── routes/
│   │   ├── project_routes.py      # /api/projects CRUD & simulation endpoints
│   │   └── workflow_routes.py     # /api/workflow messages & SSE stream
│   ├── services/
│   │   ├── llm_service.py         # Multi-provider LLM & offline fallback
│   │   ├── logging_service.py     # Real-time backend event tracker
│   │   ├── simulation_service.py  # Digital twin telemetry & demo stages
│   │   └── workflow_service.py    # Multi-agent iteration state machine
│   └── tests/
│       └── test_workflow_e2e.py   # 10 integration and unit tests
├── frontend/
│   ├── index.html                 # HTML shell with Google fonts
│   ├── package.json               # React, Vite, Lucide dependencies
│   ├── src/
│   │   ├── App.jsx                # Root React component
│   │   ├── components/
│   │   │   ├── ActivityLog.jsx    # Real-time event log viewer
│   │   │   ├── BlackoutDemo.jsx   # 7-stage blackout demonstration
│   │   │   ├── BuilderPanel.jsx   # Tabbed code & architecture viewer
│   │   │   ├── FinalOutput.jsx    # Project summary & export
│   │   │   ├── GridStatus.jsx     # Virtual single-line diagram & telemetry
│   │   │   ├── IterationTimeline.jsx # Visual iteration nodes
│   │   │   ├── OrchestratorPanel.jsx # Task checklist & iteration counter
│   │   │   ├── RequirementInput.jsx  # Prompt box with presets
│   │   │   └── ReviewerPanel.jsx  # Independent audit & issue breakdown
│   │   ├── index.css              # Control room dark theme & typography
│   │   ├── main.jsx               # React DOM mount
│   │   ├── pages/
│   │   │   └── Dashboard.jsx      # Control room layout coordinator
│   │   └── services/
│   │       └── api.js             # REST & SSE communication client
│   └── vite.config.js             # Vite config with backend proxy
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
└── README.md                      # Comprehensive documentation
```

---

## Troubleshooting

- **CORS or Network Connection Errors**:
  Ensure the backend is running on `127.0.0.1:8000` before submitting a requirement. Vite is configured to proxy `/api` requests directly to `http://127.0.0.1:8000`.
- **LLM Rate Limit or Quota Exceeded**:
  Set `LLM_PROVIDER=mock` or leave `LLM_API_KEY=""` in `.env`. The system will seamlessly utilize the built-in deterministic domain generator without any interruption in features or functionality.
- **Port Conflicts**:
  If port 8000 or 5173 is already in use, modify `PORT` in `.env` or pass `--port <new_port>` to `uvicorn` and `vite`.
