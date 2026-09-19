// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Top Level Module: gridguard_top.v
// ============================================================================

module gridguard_top (
    input  wire        clock,
    input  wire        reset,

    // 11 Grid Parameters (Fixed-point Inputs)
    input  wire [15:0] voltage,                     // 1000 = 1.00 pu
    input  wire [15:0] current,                     // Amperes
    input  wire [15:0] active_power,                // kW
    input  wire [15:0] reactive_power,              // kVAR
    input  wire [15:0] frequency,                   // 5000 = 50.00 Hz
    input  wire [15:0] transformer_loading_percent, // 0 - 150%
    input  wire [15:0] solar_generation,            // kW
    input  wire [15:0] ev_charging_load,            // kW
    input  wire [15:0] battery_soc,                 // 0 - 100%
    input  wire [15:0] total_grid_load,             // kW
    input  wire        fault_injection_sig,         // Test fault injection

    // Primary FPGA Digital Twin Outputs
    output wire [1:0]  voltage_status,              // 0: Normal, 1: Warn, 2: Crit
    output wire [1:0]  frequency_status,            // 0: Normal, 1: Warn, 2: Crit
    output wire        overload_status,
    output wire        solar_drop_status,
    output wire        ev_surge_status,
    output wire        battery_status,
    output wire        fault_detected,
    output wire [3:0]  fault_code,
    output wire [7:0]  grid_stress_index,           // GSI (0 - 100)
    output wire [7:0]  blackout_risk_indicator,     // Risk (0 - 100)
    output wire        warning_alarm,
    output wire        critical_alarm,
    output wire        emergency_alarm,

    // Protection Recommendations
    output wire        reduce_ev_load,
    output wire        activate_battery_support,
    output wire        reduce_noncritical_load,
    output wire        preserve_critical_load
);

    // Internal Signal Wires
    wire v_norm, v_low, v_high, v_crit;
    wire f_norm, f_warn, f_crit, f_high;
    wire i_norm, i_warn, i_over;
    wire p_norm, p_high, p_overload;
    wire t_norm, t_warn, t_crit, t_overload;
    wire s_norm, s_drop, s_crit_drop;
    wire ev_norm, ev_high, ev_surge_flag;
    wire b_avail, b_low, b_crit, b_ready;
    wire prot_active;

    // 1. Voltage Monitor
    voltage_monitor inst_v_mon (
        .clk(clock), .reset(reset), .voltage(voltage),
        .voltage_normal(v_norm), .voltage_low(v_low), .voltage_high(v_high),
        .voltage_critical(v_crit), .voltage_severity(voltage_status)
    );

    // 2. Frequency Monitor
    frequency_monitor inst_f_mon (
        .clk(clock), .reset(reset), .frequency(frequency),
        .frequency_normal(f_norm), .frequency_warning(f_warn), .frequency_critical(f_crit),
        .frequency_high(f_high), .frequency_severity(frequency_status)
    );

    // 3. Current Monitor
    current_monitor inst_i_mon (
        .clk(clock), .reset(reset), .current(current),
        .current_normal(i_norm), .current_warning(i_warn), .overcurrent_flag(i_over)
    );

    // 4. Power Monitor
    power_monitor inst_p_mon (
        .clk(clock), .reset(reset), .active_power(active_power), .reactive_power(reactive_power),
        .power_normal(p_norm), .power_high(p_high), .power_overload(p_overload)
    );

    // 5. Transformer Monitor
    transformer_monitor inst_t_mon (
        .clk(clock), .reset(reset), .transformer_loading_percent(transformer_loading_percent),
        .transformer_normal(t_norm), .transformer_warning(t_warn), .transformer_critical(t_crit),
        .transformer_overload(t_overload)
    );

    // 6. Solar Monitor
    solar_monitor inst_s_mon (
        .clk(clock), .reset(reset), .solar_generation(solar_generation),
        .solar_normal(s_norm), .solar_drop(s_drop), .solar_critical_drop(s_crit_drop)
    );

    // 7. EV Load Monitor
    ev_load_monitor inst_ev_mon (
        .clk(clock), .reset(reset), .ev_charging_load(ev_charging_load),
        .ev_normal(ev_norm), .ev_high(ev_high), .ev_surge(ev_surge_flag)
    );

    // 8. Battery Monitor
    battery_monitor inst_b_mon (
        .clk(clock), .reset(reset), .battery_soc(battery_soc),
        .battery_available(b_avail), .battery_low(b_low), .battery_critical(b_crit),
        .battery_ready_for_support(b_ready)
    );

    // 9. Fault Detector
    fault_detector inst_fault_det (
        .clk(clock), .reset(reset),
        .voltage_low(v_low), .voltage_high(v_high),
        .frequency_critical(f_crit), .frequency_high(f_high),
        .transformer_overload(t_overload), .ev_surge(ev_surge_flag), .solar_drop(s_drop),
        .fault_injection_sig(fault_injection_sig),
        .fault_detected(fault_detected), .fault_code(fault_code)
    );

    // 10. Grid Stress Index Calculator
    grid_stress_index inst_gsi (
        .clk(clock), .reset(reset),
        .voltage_severity(voltage_status), .frequency_severity(frequency_status),
        .transformer_loading_percent(transformer_loading_percent),
        .total_grid_load(total_grid_load),
        .ev_surge(ev_surge_flag), .solar_drop(s_drop), .battery_available(b_avail),
        .gsi(grid_stress_index)
    );

    // 11. Blackout Risk Estimator
    blackout_risk inst_risk (
        .clk(clock), .reset(reset), .gsi(grid_stress_index),
        .voltage_critical(v_crit), .frequency_critical(f_crit), .transformer_overload(t_overload),
        .ev_surge(ev_surge_flag), .solar_drop(s_drop), .battery_available(b_avail),
        .blackout_risk_indicator(blackout_risk_indicator)
    );

    // 12. Protection Controller
    protection_controller inst_prot (
        .clk(clock), .reset(reset), .gsi(grid_stress_index),
        .transformer_overload(t_overload), .ev_surge(ev_surge_flag), .solar_drop(s_drop),
        .battery_available(b_avail),
        .reduce_ev_load(reduce_ev_load),
        .activate_battery_support(activate_battery_support),
        .reduce_noncritical_load(reduce_noncritical_load),
        .protection_action_active(prot_active)
    );

    // 13. Critical Load Protection
    critical_load_protection inst_crit_prot (
        .clk(clock), .reset(reset), .gsi(grid_stress_index),
        .reduce_noncritical_load(reduce_noncritical_load),
        .preserve_critical_load(preserve_critical_load),
        .hospital_feeder_status(), .water_plant_feeder_status(), .datacenter_feeder_status()
    );

    // 14. Alarm Controller
    alarm_controller inst_alarm (
        .clk(clock), .reset(reset), .gsi(grid_stress_index),
        .blackout_risk_indicator(blackout_risk_indicator), .fault_detected(fault_detected),
        .warning_alarm(warning_alarm), .critical_alarm(critical_alarm), .emergency_alarm(emergency_alarm)
    );

    // Assign Top Level Output Aliases
    assign overload_status   = t_overload;
    assign solar_drop_status = s_drop;
    assign ev_surge_status   = ev_surge_flag;
    assign battery_status    = b_avail;

endmodule
