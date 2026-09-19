@echo off
set CAD_PATH=d:\gridguard\oss-cad-suite\bin
set PATH=%CAD_PATH%;%PATH%

echo =====================================================================
echo    GRIDGUARD AI -- OSS CAD SUITE SIMULATION (IVERILOG + VVP)
echo =====================================================================

echo Compiling Verilog RTL Modules...
%CAD_PATH%\iverilog.exe -o d:\gridguard\GRIDGUARD_FPGA\sim\gridguard_sim.vvp ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\voltage_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\frequency_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\current_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\power_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\transformer_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\solar_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\ev_load_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\battery_monitor.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\fault_detector.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\grid_stress_index.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\blackout_risk.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\protection_controller.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\critical_load_protection.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\alarm_controller.v ^
    d:\gridguard\GRIDGUARD_FPGA\rtl\gridguard_top.v ^
    d:\gridguard\GRIDGUARD_FPGA\tb\gridguard_tb.v

if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed!
    exit /b %errorlevel%
)

echo Running Simulation VVP Runtime...
%CAD_PATH%\vvp.exe d:\gridguard\GRIDGUARD_FPGA\sim\gridguard_sim.vvp

echo Simulation Completed. Waveform VCD generated at d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.vcd
