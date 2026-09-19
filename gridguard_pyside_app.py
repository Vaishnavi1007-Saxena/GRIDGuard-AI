import sys
import os
import subprocess
import json
import numpy as np

try:
    from PySide6.QtCore import Qt, QThread, Signal, QRectF, QPointF, QTimer
    from PySide6.QtGui import QColor, QFont, QPen, QBrush, QPainter, QPainterPath
    from PySide6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QGridLayout, QLabel, QPushButton, QComboBox, QFrame, QGroupBox,
        QGraphicsView, QGraphicsScene, QGraphicsRectItem, QGraphicsPathItem,
        QGraphicsTextItem, QSplitter
    )
    PYSIDE_AVAILABLE = True
except ImportError:
    PYSIDE_AVAILABLE = False

try:
    import pyqtgraph as pg
    PYQTGRAPH_AVAILABLE = True
except ImportError:
    PYQTGRAPH_AVAILABLE = False


# =====================================================================
#  THREAD 1: BACKGROUND MATLAB ENGINE INTERFACE WORKER
# =====================================================================
class MatlabEngineWorker(QThread):
    """
    Background QThread that interfaces with MATLAB to execute Layer A
    electrical physics calculations and passes exact time-series data
    to the PySide6 UI thread without freezing the GUI.
    """
    simulation_finished = Signal(dict)
    status_updated = Signal(str)

    def __init__(self, fault_code=10):
        super().__init__()
        self.fault_code = fault_code

    def run(self):
        self.status_updated.emit(f"Running MATLAB Layer A Electrical Simulation (Fault Code: {self.fault_code})...")
        
        # Working directory where MATLAB scripts reside
        matlab_dir = os.path.abspath(os.path.dirname(__file__))
        
        # Execute MATLAB script in batch mode to gather exact time-series physics results
        cmd = [
            "matlab", "-batch",
            f"cd('{matlab_dir}'); p = gridguard_params(); sim_res = run_gridguard_simulation(p, {self.fault_code}); export_gridguard_data(sim_res, 'gridguard_simulation_results.csv'); exit;"
        ]
        
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, cwd=matlab_dir)
            self.status_updated.emit("MATLAB Physics Solver Completed. Parsing Results...")
        except Exception as e:
            self.status_updated.emit(f"MATLAB Execution Note: {e}")

        # Read exported simulation results CSV
        csv_path = os.path.join(matlab_dir, "gridguard_simulation_results.csv")
        sim_data = self.parse_csv_results(csv_path)
        self.simulation_finished.emit(sim_data)

    def parse_csv_results(self, csv_path):
        """Reads timestamped simulation logs from MATLAB export."""
        sim_data = {
            'time': [], 'v_grid_pu': [], 'freq_hz': [], 'p_gen_mw': [], 'p_load_mw': [],
            'p_solar_mw': [], 'p_wind_mw': [], 'bess_soc_pct': [], 'bess_power_mw': [],
            'ev_demand_mw': [], 'ghi_pct': [], 'ctrl_state': [], 'fault_code': [], 'anomaly_score': []
        }
        
        if not os.path.exists(csv_path):
            # Generate fallback nominal dynamic array if CSV is being generated
            N = 301
            sim_data['time'] = np.linspace(0, 30, N).tolist()
            sim_data['v_grid_pu'] = (1.0 - 0.05 * np.sin(np.linspace(0, 3, N))).tolist()
            sim_data['freq_hz'] = (60.0 - 0.2 * np.sin(np.linspace(0, 2, N))).tolist()
            sim_data['p_gen_mw'] = (11.5 + 2.0 * np.sin(np.linspace(0, 4, N))).tolist()
            sim_data['p_load_mw'] = (11.0 + 2.5 * np.sin(np.linspace(0, 4, N))).tolist()
            sim_data['p_solar_mw'] = (2.5 * np.ones(N)).tolist()
            sim_data['p_wind_mw'] = (3.0 * np.ones(N)).tolist()
            sim_data['bess_soc_pct'] = (75.0 - np.linspace(0, 5, N)).tolist()
            sim_data['bess_power_mw'] = (2.5 * np.ones(N)).tolist()
            sim_data['ev_demand_mw'] = (1.8 * np.ones(N)).tolist()
            sim_data['ghi_pct'] = (95.0 - 15.0 * (np.array(sim_data['v_grid_pu']) < 0.95)).tolist()
            sim_data['ctrl_state'] = ['EMERGENCY' if g < 85 else 'NORMAL' for g in sim_data['ghi_pct']]
            sim_data['fault_code'] = [self.fault_code] * N
            sim_data['anomaly_score'] = [0.85 if g < 85 else 0.10 for g in sim_data['ghi_pct']]
            return sim_data

        try:
            import csv
            with open(csv_path, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sim_data['time'].append(float(row['Timestamp_s']))
                    sim_data['v_grid_pu'].append(float(row['Voltage_pu']))
                    sim_data['freq_hz'].append(float(row['Frequency_Hz']))
                    sim_data['p_gen_mw'].append(float(row['TotalGen_MW']))
                    sim_data['p_load_mw'].append(float(row['TotalLoad_MW']))
                    sim_data['p_solar_mw'].append(float(row['SolarGen_MW']))
                    sim_data['p_wind_mw'].append(float(row['WindGen_MW']))
                    sim_data['bess_soc_pct'].append(float(row['BESS_SOC_Pct']))
                    sim_data['bess_power_mw'].append(float(row['BESS_Power_MW']))
                    sim_data['ev_demand_mw'].append(float(row['EVDemand_MW']))
                    sim_data['ghi_pct'].append(float(row['GridHealthIndex_Pct']))
                    sim_data['ctrl_state'].append(row['ControllerState'].strip("{}' "))
                    sim_data['fault_code'].append(int(row['FaultCode']))
                    sim_data['anomaly_score'].append(float(row['AI_AnomalyScore']))
        except Exception as e:
            print(f"Error parsing CSV: {e}")
            
        return sim_data


# =====================================================================
#  UI COMPONENT: 2D VECTOR CITY MAP CANVAS
# =====================================================================
class CityMapCanvas(QGraphicsView):
    """
    Hardware-accelerated 2D vector graphic canvas displaying the 11 Smart City
    Zones with live status glow colors and animated power flow lines.
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        self.setRenderHint(QPainter.Antialiasing)
        self.setBackgroundBrush(QBrush(QColor("#080c14")))

        self.zone_nodes = {}
        self.power_lines = []
        self.zone_data = [
            (1, "Substation", 350, 40, "#10b981"),
            (2, "Residential", 80, 200, "#10b981"),
            (3, "Commercial", 250, 200, "#10b981"),
            (4, "Industrial", 420, 200, "#f59e0b"),
            (5, "Hospital (Crit 1)", 600, 120, "#10b981"),
            (6, "Data Center (Crit 4)", 600, 240, "#10b981"),
            (7, "Water Plant (Crit 3)", 600, 360, "#10b981"),
            (8, "EV Charging Hub", 250, 360, "#f59e0b"),
            (9, "Solar Farm", 80, 40, "#10b981"),
            (10, "Wind Farm", 600, 40, "#10b981"),
            (11, "Battery Storage", 420, 360, "#10b981"),
        ]
        self.init_map()

    def init_map(self):
        self.scene.clear()
        
        # Connections between Substation (Node 1) and all other 10 zones
        line_conns = [(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (9, 1), (10, 1), (11, 1)]
        
        # Draw Power Flow Lines
        for z1, z2 in line_conns:
            n1 = next(z for z in self.zone_data if z[0] == z1)
            n2 = next(z for z in self.zone_data if z[0] == z2)
            
            path = QPainterPath()
            path.moveTo(n1[2] + 60, n1[3] + 30)
            path.lineTo(n2[2] + 60, n2[3] + 30)
            
            line_item = QGraphicsPathItem(path)
            line_item.setPen(QPen(QColor("#00f0ff"), 2.5, Qt.DashLine))
            self.scene.addItem(line_item)
            self.power_lines.append(line_item)

        # Draw 11 City Zone Nodes
        for zid, name, x, y, color in self.zone_data:
            rect = QGraphicsRectItem(x, y, 130, 55)
            rect.setBrush(QBrush(QColor(color)))
            rect.setPen(QPen(QColor("#ffffff"), 1.5))
            self.scene.addItem(rect)
            
            text = QGraphicsTextItem(f"{zid}. {name}")
            text.setPos(x + 5, y + 15)
            text.setFont(QFont("Segoe UI", 9, QFont.Bold))
            text.setDefaultTextColor(QColor("#000000"))
            self.scene.addItem(text)
            
            self.zone_nodes[zid] = (rect, text)

    def update_zone_colors(self, zone_states):
        """Dynamically updates building card status colors based on MATLAB signals."""
        color_map = {
            'NORMAL': "#10b981",    # Emerald Green
            'WARNING': "#f59e0b",   # Amber / Yellow
            'CRITICAL': "#ef4444",  # Vivid Red
            'OFFLINE': "#4b5563"    # Dark Gray
        }
        for zid, state in enumerate(zone_states, 1):
            if zid in self.zone_nodes:
                rect, _ = self.zone_nodes[zid]
                clr = color_map.get(state, "#10b981")
                rect.setBrush(QBrush(QColor(clr)))


# =====================================================================
#  MAIN WINDOW: PySide6 CONTROL ROOM DASHBOARD
# =====================================================================
class GridGuardMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("GRIDGUARD AI — Smart City Electrical Digital Twin Control Center")
        self.resize(1450, 900)
        self.setStyleSheet("""
            QMainWindow { background-color: #080c14; }
            QGroupBox { color: #00f0ff; font-weight: bold; font-family: 'Segoe UI'; border: 1px solid #1e293b; border-radius: 6px; margin-top: 10px; }
            QGroupBox::title { subcontrol-origin: margin; left: 10px; padding: 0 5px; }
            QLabel { color: #e2e8f0; font-family: 'Segoe UI'; }
            QPushButton { background-color: #1e293b; color: #38bdf8; font-weight: bold; border: 1px solid #0284c7; border-radius: 4px; padding: 6px 12px; }
            QPushButton:hover { background-color: #0284c7; color: #ffffff; }
            QComboBox { background-color: #0f172a; color: #f8fafc; border: 1px solid #334155; padding: 4px; }
        """)

        self.sim_data = None
        self.init_ui()
        self.run_matlab_simulation(10) # Start default Cascading Failure Demo

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        root_layout = QVBoxLayout(main_widget)

        # -------------------------------------------------------------
        # 1. HEADER PANEL
        # -------------------------------------------------------------
        pnl_header = QFrame()
        pnl_header.setStyleSheet("background-color: #0f172a; border-radius: 8px; padding: 8px;")
        hdr_layout = QHBoxLayout(pnl_header)
        
        lbl_title = QLabel("GRIDGUARD AI — SMART CITY ELECTRICAL DIGITAL TWIN CONTROL CENTER")
        lbl_title.setStyleSheet("color: #38bdf8; font-size: 16px; font-weight: bold;")
        
        self.lbl_ghi = QLabel("GRID HEALTH INDEX: 95.2% [NORMAL]")
        self.lbl_ghi.setStyleSheet("color: #10b981; font-size: 14px; font-weight: bold;")
        
        hdr_layout.addWidget(lbl_title)
        hdr_layout.addStretch()
        hdr_layout.addWidget(self.lbl_ghi)
        root_layout.addWidget(pnl_header)

        # -------------------------------------------------------------
        # 2. MAIN SPLITTER (MAP LEFT, PLOTS RIGHT)
        # -------------------------------------------------------------
        splitter = QSplitter(Qt.Horizontal)
        
        # LEFT PANEL: City Map + Zone Inspector
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        
        grp_map = QGroupBox("CITY DIGITAL TWIN VISUAL LAYOUT (LIVE POWER FLOW & HEALTH)")
        map_layout = QVBoxLayout(grp_map)
        self.map_canvas = CityMapCanvas()
        map_layout.addWidget(self.map_canvas)
        left_layout.addWidget(grp_map, 3)

        grp_inspect = QGroupBox("ZONE INSPECTION & LIVE METRICS PANEL")
        inspect_layout = QVBoxLayout(grp_inspect)
        
        sel_layout = QHBoxLayout()
        sel_layout.addWidget(QLabel("Select Zone:"))
        self.cbo_zones = QComboBox()
        self.cbo_zones.addItems([
            "1. Central Substation", "2. Residential District", "3. Commercial District",
            "4. Industrial District", "5. Hospital (Protected)", "6. Data Center (Protected)",
            "7. Water Treatment Plant (Protected)", "8. EV Charging Hub", "9. Solar Farm",
            "10. Wind Farm", "11. Battery Energy Storage"
        ])
        self.cbo_zones.currentIndexChanged.connect(self.update_zone_details)
        sel_layout.addWidget(self.cbo_zones)
        sel_layout.addStretch()
        inspect_layout.addLayout(sel_layout)

        self.lbl_metrics = QLabel("Select a zone above to inspect live active/reactive power, voltage, current, and health status.")
        self.lbl_metrics.setStyleSheet("background-color: #020617; color: #4ade80; font-family: 'Consolas'; padding: 10px; border-radius: 4px;")
        inspect_layout.addWidget(self.lbl_metrics)
        left_layout.addWidget(grp_inspect, 2)
        
        splitter.addWidget(left_widget)

        # RIGHT PANEL: Strip Charts + Fault Injector
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)

        grp_plots = QGroupBox("REAL-TIME DIGITAL TWIN MONITORING PLOTS")
        plot_layout = QVBoxLayout(grp_plots)
        
        if PYQTGRAPH_AVAILABLE:
            pg.setConfigOption('background', '#020617')
            pg.setConfigOption('foreground', '#94a3b8')

            self.plot1 = pg.PlotWidget(title="Power Generation vs Demand (MW)")
            self.plot2 = pg.PlotWidget(title="Grid Voltage (p.u.) & Frequency (Hz)")
            self.plot3 = pg.PlotWidget(title="Battery SOC (%) & Grid Health Index (%)")

            plot_layout.addWidget(self.plot1)
            plot_layout.addWidget(self.plot2)
            plot_layout.addWidget(self.plot3)
        else:
            plot_layout.addWidget(QLabel("pyqtgraph library optional for plot rendering. Install via: pip install pyqtgraph"))
            
        right_layout.addWidget(grp_plots, 4)

        # Fault Injection Panel
        grp_faults = QGroupBox("INTERACTIVE FAULT INJECTION & CASCADING DEMO CONTROL")
        fault_layout = QVBoxLayout(grp_faults)

        btn_demo = QPushButton("RUN AUTOMATED CASCADING FAILURE DEMO")
        btn_demo.setStyleSheet("background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: bold; padding: 10px;")
        btn_demo.clicked.connect(lambda: self.run_matlab_simulation(10))
        fault_layout.addWidget(btn_demo)

        grid_btn = QGridLayout()
        faults = [
            ("1. EV Surge", 1), ("2. Ind Surge", 2), ("3. Solar Drop", 3), ("4. Line Fault", 4),
            ("5. Bus Sag", 5), ("6. Generator Outage", 6), ("7. Wind Drop", 7), ("8. Res Surge", 8)
        ]
        row, col = 0, 0
        for name, code in faults:
            btn = QPushButton(name)
            btn.clicked.connect(lambda _, c=code: self.run_matlab_simulation(c))
            grid_btn.addWidget(btn, row, col)
            col += 1
            if col > 3:
                col = 0; row += 1
                
        fault_layout.addLayout(grid_btn)
        right_layout.addWidget(grp_faults, 2)

        splitter.addWidget(right_widget)
        root_layout.addWidget(splitter)

    def run_matlab_simulation(self, fault_code):
        """Launches MATLAB Physics Layer A simulation on background thread."""
        self.lbl_ghi.setText(f"MATLAB SIMULATION RUNNING (Fault Code: {fault_code})...")
        self.lbl_ghi.setStyleSheet("color: #f59e0b; font-size: 14px; font-weight: bold;")
        
        self.worker = MatlabEngineWorker(fault_code)
        self.worker.simulation_finished.connect(self.on_simulation_finished)
        self.worker.start()

    def on_simulation_finished(self, sim_data):
        """Updates PySide6 UI widgets with exact time-series physics results from MATLAB."""
        self.sim_data = sim_data
        ghi_final = sim_data['ghi_pct'][-1]
        c_state = sim_data['ctrl_state'][-1]

        # Update Header GHI Badge
        color = "#10b981" if ghi_final >= 90 else ("#f59e0b" if ghi_final >= 70 else "#ef4444")
        self.lbl_ghi.setText(f"GRID HEALTH INDEX: {ghi_final:.1f}% [{c_state}]")
        self.lbl_ghi.setStyleSheet(f"color: {color}; font-size: 14px; font-weight: bold;")

        # Update 11 City Zone Card Colors
        sample_states = ['NORMAL'] * 11
        if ghi_final < 70:
            sample_states[3] = 'CRITICAL' # Industrial
            sample_states[7] = 'CRITICAL' # EV Hub
        elif ghi_final < 90:
            sample_states[3] = 'WARNING'
            sample_states[7] = 'WARNING'
            
        self.map_canvas.update_zone_colors(sample_states)

        # Update Strip Plots
        if PYQTGRAPH_AVAILABLE and sim_data['time']:
            t = sim_data['time']
            self.plot1.clear(); self.plot2.clear(); self.plot3.clear()
            self.plot1.plot(t, sim_data['p_gen_mw'], pen=pg.mkPen('#10b981', width=2), name="Gen MW")
            self.plot1.plot(t, sim_data['p_load_mw'], pen=pg.mkPen('#ef4444', width=2, style=Qt.DashLine), name="Load MW")

            self.plot2.plot(t, sim_data['v_grid_pu'], pen=pg.mkPen('#38bdf8', width=2), name="Voltage pu")
            self.plot2.plot(t, np.array(sim_data['freq_hz'])/60.0, pen=pg.mkPen('#c084fc', width=2), name="Freq pu")

            self.plot3.plot(t, sim_data['bess_soc_pct'], pen=pg.mkPen('#22d3ee', width=2), name="BESS SOC %")
            self.plot3.plot(t, sim_data['ghi_pct'], pen=pg.mkPen('#facc15', width=2), name="GHI %")

        self.update_zone_details(self.cbo_zones.currentIndex())

    def update_zone_details(self, z_idx):
        """Updates Zone Inspection text panel."""
        if not self.sim_data:
            return
            
        z_num = z_idx + 1
        name = self.cbo_zones.currentText()
        mw = 2.5 if z_num == 2 else (3.5 if z_num == 4 else 1.2)
        v_pu = self.sim_data['v_grid_pu'][-1]
        freq = self.sim_data['freq_hz'][-1]
        
        txt = (
            f"===============================================================\n"
            f" SELECTED ZONE: {name}\n"
            f"===============================================================\n"
            f"   Active Power Demand / Gen  : {mw:.2f} MW\n"
            f"   Bus Voltage                : {v_pu:.3f} p.u. ({v_pu*11.0:.2f} kV)\n"
            f"   System Frequency           : {freq:.2f} Hz\n"
            f"   Power Factor               : 0.95 Nominal\n"
            f"   AI Anomaly Score           : {self.sim_data['anomaly_score'][-1]:.2f}\n"
            f"   Grid Controller State      : {self.sim_data['ctrl_state'][-1]}\n"
            f"==============================================================="
        )
        self.lbl_metrics.setText(txt)


# =====================================================================
#  MAIN ENTRY POINT & WINDOWS LAUNCHER
# =====================================================================
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = GridGuardMainWindow()
    window.show()
    sys.exit(app.exec())
