// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: transformer_monitor.v
// Description: Monitors primary substation transformer loading percentage.
// ============================================================================

module transformer_monitor #(
    parameter WARN_PERCENT = 16'd80, // 80% loading
    parameter CRIT_PERCENT = 16'd95, // 95% loading
    parameter OVERLOAD_PCT = 16'd100 // 100% loading limit
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] transformer_loading_percent, // 0 - 150%
    output reg         transformer_normal,
    output reg         transformer_warning,
    output reg         transformer_critical,
    output reg         transformer_overload
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            transformer_normal   <= 1'b1;
            transformer_warning  <= 1'b0;
            transformer_critical <= 1'b0;
            transformer_overload <= 1'b0;
        end else begin
            if (transformer_loading_percent >= OVERLOAD_PCT) begin
                transformer_normal   <= 1'b0;
                transformer_warning  <= 1'b0;
                transformer_critical <= 1'b1;
                transformer_overload <= 1'b1;
            end else if (transformer_loading_percent >= CRIT_PERCENT) begin
                transformer_normal   <= 1'b0;
                transformer_warning  <= 1'b0;
                transformer_critical <= 1'b1;
                transformer_overload <= 1'b0;
            end else if (transformer_loading_percent >= WARN_PERCENT) begin
                transformer_normal   <= 1'b0;
                transformer_warning  <= 1'b1;
                transformer_critical <= 1'b0;
                transformer_overload <= 1'b0;
            end else begin
                transformer_normal   <= 1'b1;
                transformer_warning  <= 1'b0;
                transformer_critical <= 1'b0;
                transformer_overload <= 1'b0;
            end
        end
    end

endmodule
