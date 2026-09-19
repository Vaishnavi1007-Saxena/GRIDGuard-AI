# GRIDGUARD AI — FPGA Hardware Protection Subsystem

This folder contains the synthesizable Verilog/SystemVerilog RTL code, testbenches, GTKWave waveform setups, Yosys synthesis scripts, and documentation for the **GRIDGUARD AI Real-Time FPGA Protection & Digital Twin Accelerator**.

---

## Toolchain & OSS CAD Suite Compatibility

This project is built for the open-source **OSS CAD Suite** toolchain:
- **Compiler**: Icarus Verilog (`iverilog`)
- **Simulation Runtime**: `vvp`
- **Waveform Viewer**: `gtkwave`
- **RTL Synthesis**: `yosys`
- **P&R Target**: `nextpnr-ice40` / `nextpnr-ecp5` / `nextpnr-gowin`

---

## Directory Layout

```
d:/gridguard/GRIDGUARD_FPGA/
├── rtl/
│   ├── gridguard_top.v                 # Top-level FPGA wrapper
│   ├── voltage_monitor.v               # Bus voltage monitor
│   ├── frequency_monitor.v             # Grid frequency monitor
│   ├── current_monitor.v               # Feeder current monitor
│   ├── power_monitor.v                 # Active/Reactive power monitor
│   ├── transformer_monitor.v           # Transformer loading monitor
│   ├── solar_monitor.v                 # Solar generation drop detector
│   ├── ev_load_monitor.v               # EV charging surge detector
│   ├── battery_monitor.v               # BESS SOC monitor
│   ├── fault_detector.v                # 4-bit fault code encoder
│   ├── grid_stress_index.v             # Grid Stress Index (GSI 0-100) calculator
│   ├── blackout_risk.v                 # Preliminary risk estimator
│   ├── protection_controller.v         # Recommendation & action engine
│   ├── critical_load_protection.v      # Hospital priority protection
│   └── alarm_controller.v              # Alarm status manager
├── tb/
│   └── gridguard_tb.v                  # 8-Scenario self-checking testbench
├── sim/
│   ├── gridguard.vcd                   # Generated simulation waveform
│   └── gridguard.gtkw                  # GTKWave visualization layout
├── constraints/
│   └── gridguard_pins.pcf              # Physical pin assignment placeholder
├── scripts/
│   ├── simulate.bat                    # Automated iverilog + vvp runner
│   ├── synthesize.bat                  # Automated Yosys synthesis runner
│   ├── synth.ys                        # Yosys synthesis script
│   └── build.bat                       # Master simulation + synthesis script
├── docs/
│   └── FPGA_ARCHITECTURE.md            # Hardware architecture & memory map
└── README.md                           # Project instructions
```

---

## How to Run Simulation & Synthesis

### Option 1: Run Simulation Only
In PowerShell / Command Prompt:
```cmd
cd d:\gridguard\GRIDGUARD_FPGA\scripts
simulate.bat
```

### Option 2: Run Yosys RTL Synthesis
```cmd
cd d:\gridguard\GRIDGUARD_FPGA\scripts
synthesize.bat
```

### Option 3: Run Full Pipeline (Simulate + Synthesize)
```cmd
cd d:\gridguard\GRIDGUARD_FPGA\scripts
build.bat
```

### Option 4: View Waveforms in GTKWave
```cmd
d:\gridguard\oss-cad-suite\bin\gtkwave.exe d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.vcd d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.gtkw
```

---

## Testbench Scenario Verification Summary

| Test Case | Scenario | Expected Behavior | Verification Output |
|---|---|---|---|
| **TEST 1** | Nominal Grid | $\text{GSI} = 0$, $\text{Fault Code} = 0$, Alarms = 0 | **PASSED** |
| **TEST 2** | EV Demand Surge | `ev_surge = 1`, `reduce_ev_load = 1` | **PASSED** |
| **TEST 3** | Solar Drop | `solar_drop = 1`, `activate_battery_support = 1` | **PASSED** |
| **TEST 4** | Transformer Overload | `transformer_overload = 1`, `reduce_noncritical_load = 1` | **PASSED** |
| **TEST 5** | Voltage Sag (0.88 pu) | `voltage_status = 2` (Critical), `fault_detected = 1` | **PASSED** |
| **TEST 6** | Underfrequency Drop | `frequency_status = 2` (Critical), `critical_alarm = 1` | **PASSED** |
| **TEST 7** | **Cascading Disturbance** | `fault_code = 0x8`, $\text{GSI} = 98$, $\text{Risk} = 100$, Hospital Protected (`preserve_critical_load = 1`) | **PASSED** |
| **TEST 8** | System Recovery | Return to nominal, all fault flags cleared | **PASSED** |
