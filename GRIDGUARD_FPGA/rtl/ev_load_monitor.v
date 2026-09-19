// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: ev_load_monitor.v
// Description: Detects rapid demand surge at EV Charging Hub.
// ============================================================================

module ev_load_monitor #(
    parameter WARN_EV_KW     = 16'd2000, // 2000 kW EV demand
    parameter SURGE_DELTA_KW = 16'd800  // Rate of increase > 800 kW
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] ev_charging_load, // Current EV charging demand (kW)
    output reg         ev_normal,
    output reg         ev_high,
    output reg         ev_surge
);

    reg [15:0] prev_ev_load;

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            prev_ev_load <= 16'd1200;
            ev_normal    <= 1'b1;
            ev_high      <= 1'b0;
            ev_surge     <= 1'b0;
        end else begin
            if (ev_charging_load >= WARN_EV_KW || (ev_charging_load > prev_ev_load && (ev_charging_load - prev_ev_load) >= SURGE_DELTA_KW)) begin
                ev_normal <= 1'b0;
                ev_high   <= 1'b1;
                ev_surge  <= 1'b1;
            end else begin
                ev_normal <= 1'b1;
                ev_high   <= 1'b0;
                ev_surge  <= 1'b0;
            end
            prev_ev_load <= ev_charging_load;
        end
    end

endmodule
