# GRIDGUARD AI — PyInstaller Build Script for Executable Generation
import os
import sys
import PyInstaller.__main__

def build_exe():
    print("=====================================================================")
    print("   GRIDGUARD AI — Packaging PySide6 Digital Twin Executable         ")
    print("=====================================================================")

    base_dir = os.path.abspath(os.path.dirname(__file__))
    script_path = os.path.join(base_dir, "gridguard_pyside_app.py")

    args = [
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name=GRIDGUARD_AI_Digital_Twin",
        f"--add-data={base_dir}/*.m;.",
        script_path
    ]

    print(f"Executing PyInstaller with arguments:\n  {' '.join(args)}\n")
    try:
        PyInstaller.__main__.run(args)
        exe_path = os.path.join(base_dir, "dist", "GRIDGUARD_AI_Digital_Twin", "GRIDGUARD_AI_Digital_Twin.exe")
        print("\n=====================================================================")
        print("  BUILD SUCCESSFUL!")
        print(f"  Executable created at:\n  {exe_path}")
        print("=====================================================================\n")
    except Exception as e:
        print(f"Build encountered error: {e}")

if __name__ == "__main__":
    build_exe()
