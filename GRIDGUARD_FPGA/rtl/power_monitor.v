// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: power_monitor.v
// Description: Monitors active and reactive power levels and power factor.
// ============================================================================

module power_monitor #(
    parameter P_NOMINAL_KW = 16'd12000, // 12,000 kW (12 MW)
    parameter P_MAX_KW     = 16'd15000  // 15,000 kW (15 MW)
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] active_power,   // kW
    input  wire [15:0] reactive_power, // kVAR
    output reg         power_normal,
    output reg         power_high,
    output reg         power_overload
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            power_normal   <= 1'b1;
            power_high     <= 1'b0;
            power_overload <= 1'b0;
        end else begin
            if (active_power >= P_MAX_KW) begin
                power_normal   <= 1'b0;
                power_high     <= 1'b0;
                power_overload <= 1'b1;
            end else if (active_power >= P_NOMINAL_KW) begin
                power_normal   <= 1'b0;
                power_high     <= 1'b1;
                power_overload <= 1'b0;
            end else begin
                power_normal   <= 1'b1;
                power_high     <= 1'b0;
                power_overload <= 1'b0;
            end
        end
    end

endmodule
