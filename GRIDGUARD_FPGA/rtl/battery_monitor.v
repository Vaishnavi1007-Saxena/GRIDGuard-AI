// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: battery_monitor.v
// Description: Monitors Battery Energy Storage System (BESS) State of Charge (SOC).
// ============================================================================

module battery_monitor #(
    parameter SOC_AVAIL_MIN = 16'd40, // SOC > 40% -> Battery available
    parameter SOC_LOW_LIMIT = 16'd20  // SOC < 20% -> Critical reserve limit
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] battery_soc, // 0 - 100%
    output reg         battery_available,
    output reg         battery_low,
    output reg         battery_critical,
    output reg         battery_ready_for_support
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            battery_available         <= 1'b1;
            battery_low               <= 1'b0;
            battery_critical          <= 1'b0;
            battery_ready_for_support <= 1'b1;
        end else begin
            if (battery_soc < SOC_LOW_LIMIT) begin
                battery_available         <= 1'b0;
                battery_low               <= 1'b1;
                battery_critical          <= 1'b1;
                battery_ready_for_support <= 1'b0;
            end else if (battery_soc < SOC_AVAIL_MIN) begin
                battery_available         <= 1'b1;
                battery_low               <= 1'b1;
                battery_critical          <= 1'b0;
                battery_ready_for_support <= 1'b0;
            end else begin
                battery_available         <= 1'b1;
                battery_low               <= 1'b0;
                battery_critical          <= 1'b0;
                battery_ready_for_support <= 1'b1;
            end
        end
    end

endmodule
