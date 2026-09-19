// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: solar_monitor.v
// Description: Detects sudden loss/drop in solar PV generation (cloud cover).
// ============================================================================

module solar_monitor #(
    parameter DROP_THRESHOLD_KW = 16'd800, // Drop > 800 kW in single clock interval
    parameter CRIT_DROP_KW     = 16'd1500  // Critical drop > 1500 kW
)(
    input  wire        clk,
    input  wire        reset,
    input  wire [15:0] solar_generation, // Current Solar Generation (kW)
    output reg         solar_normal,
    output reg         solar_drop,
    output reg         solar_critical_drop
);

    reg [15:0] prev_solar_gen;

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            prev_solar_gen      <= 16'd2500;
            solar_normal        <= 1'b1;
            solar_drop          <= 1'b0;
            solar_critical_drop <= 1'b0;
        end else begin
            if (solar_generation <= 16'd1000 || (prev_solar_gen > solar_generation && (prev_solar_gen - solar_generation) >= DROP_THRESHOLD_KW)) begin
                solar_normal        <= 1'b0;
                solar_drop          <= 1'b1;
                solar_critical_drop <= (solar_generation <= 16'd800) || (prev_solar_gen > solar_generation && (prev_solar_gen - solar_generation) >= CRIT_DROP_KW);
            end else begin
                solar_normal        <= 1'b1;
                solar_drop          <= 1'b0;
                solar_critical_drop <= 1'b0;
            end
            prev_solar_gen <= solar_generation;
        end
    end

endmodule
