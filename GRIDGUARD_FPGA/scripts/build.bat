@echo off
echo =====================================================================
echo    GRIDGUARD AI -- COMPLETE FPGA BUILD (SIMULATION + SYNTHESIS)
echo =====================================================================

call d:\gridguard\GRIDGUARD_FPGA\scripts\simulate.bat
if %errorlevel% neq 0 (
    echo [ERROR] Simulation stage failed!
    exit /b %errorlevel%
)

call d:\gridguard\GRIDGUARD_FPGA\scripts\synthesize.bat
if %errorlevel% neq 0 (
    echo [ERROR] Synthesis stage failed!
    exit /b %errorlevel%
)

echo =====================================================================
echo    GRIDGUARD AI FPGA BUILD COMPLETED SUCCESSFULLY!
echo =====================================================================
