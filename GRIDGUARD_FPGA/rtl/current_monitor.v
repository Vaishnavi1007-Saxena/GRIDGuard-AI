// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: current_monitor.v
// Description: Monitors feeder current (amperes fixed-point).
// ============================================================================

module current_monitor #(
    parameter I_WARN_LIMIT = 16'd400, // 400 A
    parameter I_CRIT_LIMIT = 16'd480  // 480 A
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] current,       // Amperes
    output reg         current_normal,
    output reg         current_warning,
    output reg         overcurrent_flag
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            current_normal   <= 1'b1;
            current_warning  <= 1'b0;
            overcurrent_flag <= 1'b0;
        end else begin
            if (current >= I_CRIT_LIMIT) begin
                current_normal   <= 1'b0;
                current_warning  <= 1'b0;
                overcurrent_flag <= 1'b1;
            end else if (current >= I_WARN_LIMIT) begin
                current_normal   <= 1'b0;
                current_warning  <= 1'b1;
                overcurrent_flag <= 1'b0;
            end else begin
                current_normal   <= 1'b1;
                current_warning  <= 1'b0;
                overcurrent_flag <= 1'b0;
            end
        end
    end

endmodule
