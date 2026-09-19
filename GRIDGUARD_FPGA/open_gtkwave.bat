@echo off
set CAD_BIN=d:\gridguard\oss-cad-suite\bin
set PATH=%CAD_BIN%;%PATH%

echo =====================================================================
echo    GRIDGUARD AI -- LAUNCHING GTKWAVE WAVEFORM VISUALIZER
echo =====================================================================

if not exist "d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.vcd" (
    echo [NOTE] Waveform file gridguard.vcd not found. Running simulation first...
    call d:\gridguard\GRIDGUARD_FPGA\run_simulation.bat
)

echo Opening GTKWave with gridguard.vcd and gridguard.gtkw layout...
%CAD_BIN%\gtkwave.exe d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.vcd d:\gridguard\GRIDGUARD_FPGA\sim\gridguard.gtkw
