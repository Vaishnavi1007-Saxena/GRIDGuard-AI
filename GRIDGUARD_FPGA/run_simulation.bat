@echo off
set CAD_BIN=d:\gridguard\oss-cad-suite\bin
set PATH=%CAD_BIN%;%PATH%

echo =====================================================================
echo    GRIDGUARD AI -- FPGA SIMULATION (IVERILOG + VVP)
echo =====================================================================

%CAD_BIN%\iverilog.exe -g2012 -o d:\gridguard\GRIDGUARD_FPGA\sim\gridguard_sim.vvp ^
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
    echo [ERROR] Verilog Compilation failed!
    pause
    exit /b %errorlevel%
)

echo Simulation binary compiled successfully. Executing VVP runtime...
%CAD_BIN%\vvp.exe d:\gridguard\GRIDGUARD_FPGA\sim\gridguard_sim.vvp

echo.
echo Waveform VCD file generated at d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.vcd
pause
