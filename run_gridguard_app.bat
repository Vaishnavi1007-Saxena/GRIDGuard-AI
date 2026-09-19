@echo off
title GRIDGUARD AI - Smart City Electrical Digital Twin
echo =====================================================================
echo    GRIDGUARD AI -- SMART CITY ELECTRICAL DIGITAL TWIN CONTROL CENTER
echo =====================================================================
echo Checking dependencies...
python -c "import PySide6" 2>NUL
if %errorlevel% neq 0 (
    echo Installing PySide6 and pyqtgraph for modern dark GUI...
    python -m pip install PySide6 pyqtgraph pyinstaller
)

echo Launching GRIDGUARD AI PySide6 Control Center GUI...
python d:\gridguard\gridguard_pyside_app.py
pause
