@echo off
set CAD_PATH=d:\gridguard\oss-cad-suite\bin
set PATH=%CAD_PATH%;%PATH%

echo =====================================================================
echo    GRIDGUARD AI -- YOSYS RTL SYNTHESIS LAUNCHER
echo =====================================================================

call d:\gridguard\GRIDGUARD_FPGA\scripts\synthesize.bat
