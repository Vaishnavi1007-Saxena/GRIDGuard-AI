# GRIDGUARD AI — FPGA Hardware Protection Architecture

## System Overview & Boundary

```
MATLAB / Simulink Smart Grid Engine
             │
             │ (Scaled Grid Parameters: V, I, P, Q, f, SOC, EV, Solar)
             ▼
+-------------------------------------------------------------------+
|               GRIDGUARD FPGA PROTECTION ACCELERATOR               |
|                                                                   |
|   +-------------------+    +--------------------+                 |
|   | 8 Grid Monitors   |--->| Fault Detector     |                 |
|   | (V, I, f, Load...) |    | (Fault Encoding)   |                 |
|   +---------+---------+    +---------+----------+                 |
|             │                        │                            |
|             ▼                        ▼                            |
|   +-------------------+    +--------------------+                 |
|   | Grid Stress Index |--->| Blackout Risk      |                 |
|   | (GSI 0 - 100)     |    | (0 - 100 Estimator)|                 |
|   +---------+---------+    +---------+----------+                 |
|             │                        │                            |
|             ▼                        ▼                            |
|   +--------------------------------------------+                  |
|   | Protection & Critical Load Controller      |                  |
|   | (Prioritizes Hospital > Flexible Loads)    |                  |
|   +--------------------------------------------+                  |
+------------------------------------+------------------------------+
                                     │
                                     │ (GSI, Fault Codes, Alarms, Actions)
                                     ▼
                     AI Prediction & PLC Control Layer
```

---

## Fixed-Point Hardware Scaling Table

| Grid Parameter | Physical Nominal | Fixed-Point Scale Factor | Nominal Binary Value |
|---|---|---|---|
| **Bus Voltage ($V$)** | 1.00 p.u. | $1000 \times \text{p.u.}$ | `16'd1000` ($1.00\text{ p.u.}$) |
| **Grid Frequency ($f$)** | 50.00 Hz | $100 \times \text{Hz}$ | `16'd5000` ($50.00\text{ Hz}$) |
| **Feeder Current ($I$)** | 250 A | $1 \times \text{Amperes}$ | `16'd250` |
| **Active Power ($P$)** | 8000 kW | $1 \times \text{kW}$ | `16'd8000` |
| **Reactive Power ($Q$)**| 1500 kVAR | $1 \times \text{kVAR}$ | `16'd1500` |
| **Transformer Load** | 65% | $1 \times \text{Percentage}$ | `16'd65` |
| **Solar Generation**| 2500 kW | $1 \times \text{kW}$ | `16'd2500` |
| **EV Charging Load** | 1200 kW | $1 \times \text{kW}$ | `16'd1200` |
| **Battery SOC** | 80% | $1 \times \text{Percentage}$ | `16'd80` |

---

## Fault Code Encoding Table

| Fault Code | State Symbol | Triggers & Description |
|---|---|---|
| `4'b0000` | `FAULT_NONE` | Grid operating within nominal thresholds |
| `4'b0001` | `FAULT_LOW_VOLTAGE` | Voltage sag below critical threshold ($< 0.90\text{ p.u.}$) |
| `4'b0010` | `FAULT_HIGH_VOLTAGE` | Overvoltage warning ($> 1.05\text{ p.u.}$) |
| `4'b0011` | `FAULT_LOW_FREQUENCY` | Underfrequency drop ($< 49.50\text{ Hz}$) |
| `4'b0100` | `FAULT_HIGH_FREQUENCY` | Overfrequency surge ($> 50.50\text{ Hz}$) |
| `4'b0101` | `FAULT_TRANSFORMER_OVERLOAD` | Substation transformer loading $\ge 100\%$ |
| `4'b0110` | `FAULT_EV_SURGE` | Rapid EV charging rate-of-increase surge |
| `4'b0111` | `FAULT_SOLAR_DROP` | Cloud cover / sudden solar generation loss |
| `4'b1000` | `FAULT_MULTIPLE` | **Concurrent Multi-Fault Disturbance Scenario** |

---

## Synthesis Resource Utilization Report (Yosys OSS CAD Suite)

- **Target Architecture**: Generic FPGA Cell Mapping (iCE40 / ECP5 / Gowin compatible)
- **Top Level Module**: `gridguard_top`
- **Total Logic Cells**: 1,056 cells
- **Registers ($\text{DFF}$)**: 80 DFF bits
- **Synthesis Errors**: 0
- **Synthesis Warnings**: 0
