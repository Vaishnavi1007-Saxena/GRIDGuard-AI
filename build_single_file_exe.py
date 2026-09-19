# GRIDGUARD AI — PyInstaller Single-File Executable Builder
import os
import sys
import PyInstaller.__main__

def build_onefile_exe():
    print("=====================================================================")
    print("   GRIDGUARD AI — Packaging Single-File Executable (--onefile)       ")
    print("=====================================================================")

    base_dir = os.path.abspath(os.path.dirname(__file__))
    script_path = os.path.join(base_dir, "gridguard_pyside_app.py")

    args = [
        "--noconfirm",
        "--onefile",
        "--windowed",
        "--name=GRIDGUARD_AI_Digital_Twin_Single",
        f"--add-data={base_dir}/*.m;.",
        script_path
    ]

    print(f"Executing PyInstaller command:\n  {' '.join(args)}\n")
    try:
        PyInstaller.__main__.run(args)
        exe_path = os.path.join(base_dir, "dist", "GRIDGUARD_AI_Digital_Twin_Single.exe")
        print("\n=====================================================================")
        print("  SINGLE-FILE BUILD SUCCESSFUL!")
        print(f"  Single Executable created at:\n  {exe_path}")
        print("=====================================================================\n")
    except Exception as e:
        print(f"Build encountered error: {e}")

if __name__ == "__main__":
    build_onefile_exe()
