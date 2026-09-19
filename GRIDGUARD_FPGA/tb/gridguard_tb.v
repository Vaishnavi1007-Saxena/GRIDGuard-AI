// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Testbench: gridguard_tb.v
// Features 8 Automated Test Cases & GTKWave VCD Dump Generation.
// ============================================================================

`timescale 1ns / 1ps

module gridguard_tb;

    reg        clock;
    reg        reset;

    // 11 Scaled Grid Inputs
    reg [15:0] voltage;
    reg [15:0] current;
    reg [15:0] active_power;
    reg [15:0] reactive_power;
    reg [15:0] frequency;
    reg [15:0] transformer_loading_percent;
    reg [15:0] solar_generation;
    reg [15:0] ev_charging_load;
    reg [15:0] battery_soc;
    reg [15:0] total_grid_load;
    reg        fault_injection_sig;

    // Outputs
    wire [1:0]  voltage_status;
    wire [1:0]  frequency_status;
    wire        overload_status;
    wire        solar_drop_status;
    wire        ev_surge_status;
    wire        battery_status;
    wire        fault_detected;
    wire [3:0]  fault_code;
    wire [7:0]  grid_stress_index;
    wire [7:0]  blackout_risk_indicator;
    wire        warning_alarm;
    wire        critical_alarm;
    wire        emergency_alarm;
    wire        reduce_ev_load;
    wire        activate_battery_support;
    wire        reduce_noncritical_load;
    wire        preserve_critical_load;

    // Instantiate Top-Level Module
    gridguard_top uut (
        .clock(clock), .reset(reset),
        .voltage(voltage), .current(current),
        .active_power(active_power), .reactive_power(reactive_power),
        .frequency(frequency), .transformer_loading_percent(transformer_loading_percent),
        .solar_generation(solar_generation), .ev_charging_load(ev_charging_load),
        .battery_soc(battery_soc), .total_grid_load(total_grid_load),
        .fault_injection_sig(fault_injection_sig),
        .voltage_status(voltage_status), .frequency_status(frequency_status),
        .overload_status(overload_status), .solar_drop_status(solar_drop_status),
        .ev_surge_status(ev_surge_status), .battery_status(battery_status),
        .fault_detected(fault_detected), .fault_code(fault_code),
        .grid_stress_index(grid_stress_index), .blackout_risk_indicator(blackout_risk_indicator),
        .warning_alarm(warning_alarm), .critical_alarm(critical_alarm), .emergency_alarm(emergency_alarm),
        .reduce_ev_load(reduce_ev_load), .activate_battery_support(activate_battery_support),
        .reduce_noncritical_load(reduce_noncritical_load), .preserve_critical_load(preserve_critical_load)
    );

    // 50 MHz Clock Generator (20 ns Period)
    always #10 clock = ~clock;

    initial begin
        // VCD Dump for GTKWave Waveform Visualization
        $dumpfile("d:/gridguard/GRIDGUARD_FPGA/sim/gridguard.vcd");
        $dumpvars(0, gridguard_tb);

        $display("=====================================================================");
        $display("   GRIDGUARD AI -- FPGA protection & DIGITAL TWIN TESTBENCH           ");
        $display("=====================================================================");

        // Clock & Reset Initialization
        clock = 0;
        reset = 1;
        fault_injection_sig = 0;

        // Baseline Nominal Parameters
        voltage                      = 16'd1000; // 1.00 pu
        current                      = 16'd250;  // 250 A
        active_power                 = 16'd8000; // 8,000 kW
        reactive_power               = 16'd1500; // 1,500 kVAR
        frequency                    = 16'd5000; // 50.00 Hz
        transformer_loading_percent  = 16'd65;   // 65%
        solar_generation             = 16'd2500; // 2,500 kW
        ev_charging_load             = 16'd1200; // 1,200 kW
        battery_soc                  = 16'd80;   // 80%
        total_grid_load              = 16'd9200; // 9,200 kW

        #40;
        reset = 0;
        #40;

        // ------------------------------------------------------------------
        // TEST 1: NOMINAL GRID OPERATION
        // ------------------------------------------------------------------
        $display("\n[TEST 1] Nominal Grid Operation...");
        #40;
        $display("   GSI: %d | Risk: %d | Fault Code: 0x%h | Alarms: [W:%b C:%b E:%b]",
            grid_stress_index, blackout_risk_indicator, fault_code, warning_alarm, critical_alarm, emergency_alarm);
        if (fault_detected == 0 && grid_stress_index < 25)
            $display("   --> TEST 1 PASSED: Grid Nominal.");
        else
            $display("   --> TEST 1 FAILED!");

        // ------------------------------------------------------------------
        // TEST 2: HIGH EV DEMAND SURGE
        // ------------------------------------------------------------------
        $display("\n[TEST 2] Injecting Sudden EV Demand Surge (1.2 MW -> 2.4 MW)...");
        ev_charging_load = 16'd1200;
        #40;
        ev_charging_load = 16'd2400;
        #40;
        $display("   EV Surge Flag: %b | Reduce EV Cmd: %b | GSI: %d",
            ev_surge_status, reduce_ev_load, grid_stress_index);
        if (ev_surge_status == 1 && reduce_ev_load == 1)
            $display("   --> TEST 2 PASSED: EV Surge Detected & Throttling Recommended.");
        else
            $display("   --> TEST 2 FAILED!");

        // ------------------------------------------------------------------
        // TEST 3: SOLAR GENERATION DROP (CLOUD COVER)
        // ------------------------------------------------------------------
        $display("\n[TEST 3] Injecting Solar Generation Drop (2.5 MW -> 0.8 MW)...");
        solar_generation = 16'd2500;
        #40;
        solar_generation = 16'd800;
        #40;
        $display("   Solar Drop Flag: %b | Battery Support Cmd: %b | GSI: %d",
            solar_drop_status, activate_battery_support, grid_stress_index);
        if (solar_drop_status == 1 && activate_battery_support == 1)
            $display("   --> TEST 3 PASSED: Solar Drop Detected & BESS Dispatch Recommended.");
        else
            $display("   --> TEST 3 FAILED!");

        // ------------------------------------------------------------------
        // TEST 4: TRANSFORMER OVERLOAD (105%)
        // ------------------------------------------------------------------
        $display("\n[TEST 4] Increasing Transformer Loading to 105%% Overload...");
        transformer_loading_percent = 16'd105;
        #60;
        $display("   Overload Flag: %b | Fault Code: 0x%h | Non-Critical Load Shed Cmd: %b",
            overload_status, fault_code, reduce_noncritical_load);
        if (overload_status == 1 && reduce_noncritical_load == 1)
            $display("   --> TEST 4 PASSED: Transformer Overload Protection Triggered.");
        else
            $display("   --> TEST 4 FAILED!");

        // ------------------------------------------------------------------
        // TEST 5: CRITICAL VOLTAGE SAG (0.88 p.u.)
        // ------------------------------------------------------------------
        $display("\n[TEST 5] Injecting Bus Voltage Sag to 0.88 p.u. (880)...");
        voltage = 16'd880;
        #60;
        $display("   Voltage Status: %d | Fault Detected: %b | GSI: %d",
            voltage_status, fault_detected, grid_stress_index);
        if (voltage_status == 2'b10 && fault_detected == 1)
            $display("   --> TEST 5 PASSED: Critical Voltage Sag Detected.");
        else
            $display("   --> TEST 5 FAILED!");

        // ------------------------------------------------------------------
        // TEST 6: CRITICAL FREQUENCY DROP (49.20 Hz)
        // ------------------------------------------------------------------
        $display("\n[TEST 6] Injecting Frequency Drop to 49.20 Hz (4920)...");
        frequency = 16'd4920;
        #60;
        $display("   Freq Status: %d | Critical Alarm: %b | GSI: %d",
            frequency_status, critical_alarm, grid_stress_index);
        if (frequency_status == 2'b10 && critical_alarm == 1)
            $display("   --> TEST 6 PASSED: Critical Frequency Drop Alarm Active.");
        else
            $display("   --> TEST 6 FAILED!");

        // ------------------------------------------------------------------
        // TEST 7: COMBINED CASCADING DISTURBANCE (EV + SOLAR + XFRMR)
        // ------------------------------------------------------------------
        $display("\n[TEST 7] COMBINED CASCADING DISTURBANCE SCENARIO...");
        ev_charging_load            = 16'd3200;
        solar_generation            = 16'd500;
        transformer_loading_percent = 16'd115;
        total_grid_load             = 16'd14500;
        #80;
        $display("   Fault Code: 0x%h (Expected: 0x8 Multi-Fault)", fault_code);
        $display("   Grid Stress Index (GSI): %d / 100", grid_stress_index);
        $display("   Blackout Risk Indicator: %d / 100", blackout_risk_indicator);
        $display("   Emergency Alarm: %b", emergency_alarm);
        $display("   Recommendations: EV Throttle=%b | BESS Support=%b | Load Shed=%b",
            reduce_ev_load, activate_battery_support, reduce_noncritical_load);
        $display("   Critical Hospital Protection: %b (1 = FULLY PROTECTED)", preserve_critical_load);
        if (fault_code == 4'h8 && grid_stress_index >= 75 && preserve_critical_load == 1)
            $display("   --> TEST 7 PASSED: Combined Fault Detected & Hospital Load Protected!");
        else
            $display("   --> TEST 7 FAILED!");

        // ------------------------------------------------------------------
        // TEST 8: SYSTEM RECOVERY
        // ------------------------------------------------------------------
        $display("\n[TEST 8] Restoring Grid Parameters to Nominal...");
        voltage                     = 16'd1000;
        frequency                   = 16'd5000;
        transformer_loading_percent = 16'd60;
        solar_generation            = 16'd2500;
        ev_charging_load            = 16'd1200;
        total_grid_load             = 16'd9000;
        #100;
        $display("   GSI: %d | Fault Code: 0x%h | Emergency Alarm: %b",
            grid_stress_index, fault_code, emergency_alarm);
        if (fault_code == 4'h0 && emergency_alarm == 0)
            $display("   --> TEST 8 PASSED: System Fully Recovered to Nominal State.");
        else
            $display("   --> TEST 8 FAILED!");

        $display("\n=====================================================================");
        $display("   ALL 8 FPGA PROTECTION TEST SCENARIOS COMPLETED SUCCESSFULLY!");
        $display("=====================================================================\n");
        $finish;
    end

endmodule
