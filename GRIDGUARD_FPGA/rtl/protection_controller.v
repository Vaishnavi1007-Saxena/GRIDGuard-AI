// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: protection_controller.v
// Description: Evaluates GSI and fault conditions to generate logical
//              protection recommendations (EV throttling, BESS dispatch, load shedding).
// ============================================================================

module protection_controller (
    input  wire        clk,
    input  wire        reset,
    input  wire [7:0]  gsi,
    input  wire        transformer_overload,
    input  wire        ev_surge,
    input  wire        solar_drop,
    input  wire        battery_available,
    output reg         reduce_ev_load,
    output reg         activate_battery_support,
    output reg         reduce_noncritical_load,
    output reg         protection_action_active
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            reduce_ev_load           <= 1'b0;
            activate_battery_support <= 1'b0;
            reduce_noncritical_load  <= 1'b0;
            protection_action_active <= 1'b0;
        end else begin
            // 1. Reduce EV Charging Demand if overload OR EV surge occurs
            if (transformer_overload || ev_surge || gsi >= 8'd50) begin
                reduce_ev_load <= 1'b1;
            end else begin
                reduce_ev_load <= 1'b0;
            end

            // 2. Activate Battery Storage Support if GSI > 50 AND battery available
            if ((gsi >= 8'd50 || solar_drop || transformer_overload) && battery_available) begin
                activate_battery_support <= 1'b1;
            end else begin
                activate_battery_support <= 1'b0;
            end

            // 3. Reduce Non-Critical Industrial/Commercial Loads if GSI > 75
            if (gsi >= 8'd75 || transformer_overload) begin
                reduce_noncritical_load <= 1'b1;
            end else begin
                reduce_noncritical_load <= 1'b0;
            end

            // Flag overall active protective recommendation
            protection_action_active <= reduce_ev_load | activate_battery_support | reduce_noncritical_load;
        end
    end

endmodule
