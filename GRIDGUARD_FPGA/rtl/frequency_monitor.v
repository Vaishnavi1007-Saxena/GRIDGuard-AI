// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: frequency_monitor.v
// Description: Monitors grid frequency (50.00 Hz nominal = 5000 fixed-point).
// ============================================================================

module frequency_monitor #(
    parameter NOMINAL_FREQ = 16'd5000, // 50.00 Hz
    parameter F_HIGH_WARN  = 16'd5050, // 50.50 Hz
    parameter F_LOW_WARN   = 16'd4980, // 49.80 Hz
    parameter F_LOW_CRIT   = 16'd4950  // 49.50 Hz
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] frequency,         // Fixed-point: 5000 = 50.00 Hz
    output reg         frequency_normal,
    output reg         frequency_warning,
    output reg         frequency_critical,
    output reg         frequency_high,
    output reg  [1:0]  frequency_severity // 0: Normal, 1: Warning, 2: Critical
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            frequency_normal   <= 1'b1;
            frequency_warning  <= 1'b0;
            frequency_critical <= 1'b0;
            frequency_high     <= 1'b0;
            frequency_severity <= 2'b00;
        end else begin
            if (frequency < F_LOW_CRIT) begin
                frequency_normal   <= 1'b0;
                frequency_warning  <= 1'b0;
                frequency_critical <= 1'b1;
                frequency_high     <= 1'b0;
                frequency_severity <= 2'b10; // Critical
            end else if (frequency < F_LOW_WARN) begin
                frequency_normal   <= 1'b0;
                frequency_warning  <= 1'b1;
                frequency_critical <= 1'b0;
                frequency_high     <= 1'b0;
                frequency_severity <= 2'b01; // Warning
            end else if (frequency > F_HIGH_WARN) begin
                frequency_normal   <= 1'b0;
                frequency_warning  <= 1'b1;
                frequency_critical <= 1'b0;
                frequency_high     <= 1'b1;
                frequency_severity <= 2'b01; // Warning
            end else begin
                frequency_normal   <= 1'b1;
                frequency_warning  <= 1'b0;
                frequency_critical <= 1'b0;
                frequency_high     <= 1'b0;
                frequency_severity <= 2'b00; // Normal
            end
        end
    end

endmodule
