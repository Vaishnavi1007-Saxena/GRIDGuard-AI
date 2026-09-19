// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: voltage_monitor.v
// Description: Monitors grid bus voltage (1.00 pu nominal = 1000 fixed-point).
// ============================================================================

module voltage_monitor #(
    parameter NOMINAL_V    = 16'd1000, // 1.00 pu
    parameter V_HIGH_WARN  = 16'd1050, // 1.05 pu
    parameter V_LOW_WARN   = 16'd950,  // 0.95 pu
    parameter V_LOW_CRIT   = 16'd900   // 0.90 pu
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] voltage,        // Fixed-point: 1000 = 1.00 pu
    output reg         voltage_normal,
    output reg         voltage_low,
    output reg         voltage_high,
    output reg         voltage_critical,
    output reg  [1:0]  voltage_severity// 0: Normal, 1: Warning, 2: Critical
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            voltage_normal   <= 1'b1;
            voltage_low      <= 1'b0;
            voltage_high     <= 1'b0;
            voltage_critical <= 1'b0;
            voltage_severity <= 2'b00;
        end else begin
            if (voltage < V_LOW_CRIT) begin
                voltage_normal   <= 1'b0;
                voltage_low      <= 1'b1;
                voltage_high     <= 1'b0;
                voltage_critical <= 1'b1;
                voltage_severity <= 2'b10; // Critical (2)
            end else if (voltage < V_LOW_WARN) begin
                voltage_normal   <= 1'b0;
                voltage_low      <= 1'b1;
                voltage_high     <= 1'b0;
                voltage_critical <= 1'b0;
                voltage_severity <= 2'b01; // Warning (1)
            end else if (voltage > V_HIGH_WARN) begin
                voltage_normal   <= 1'b0;
                voltage_low      <= 1'b0;
                voltage_high     <= 1'b1;
                voltage_critical <= 1'b0;
                voltage_severity <= 2'b01; // Warning (1)
            end else begin
                voltage_normal   <= 1'b1;
                voltage_low      <= 1'b0;
                voltage_high     <= 1'b0;
                voltage_critical <= 1'b0;
                voltage_severity <= 2'b00; // Normal (0)
            end
        end
    end

endmodule
