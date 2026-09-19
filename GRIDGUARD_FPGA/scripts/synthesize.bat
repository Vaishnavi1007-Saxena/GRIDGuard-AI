@echo off
set CAD_PATH=d:\gridguard\oss-cad-suite\bin
set PATH=%CAD_PATH%;%PATH%

echo =====================================================================
echo    GRIDGUARD AI -- YOSYS RTL SYNTHESIS
echo =====================================================================

%CAD_PATH%\yosys.exe -s d:\gridguard\GRIDGUARD_FPGA\scripts\synth.ys

if %errorlevel% neq 0 (
    echo [ERROR] Yosys Synthesis failed!
    pause
    exit /b %errorlevel%
)

echo.
echo =====================================================================
echo    YOSYS SYNTHESIS COMPLETED SUCCESSFULLY!
echo    Gate-level netlist written to d:\gridguard\GRIDGUARD_FPGA\sim\gridguard_synth.v
echo =====================================================================
pause
