// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: blackout_risk.v
// Description: PRELIMINARY HARDWARE RISK ESTIMATOR
//              Calculates deterministic preliminary blackout risk score (0-100).
//              Note: The Python AI model will later replace/augment this block.
// ============================================================================

module blackout_risk (
    input  wire        clk,
    input  wire        reset,
    input  wire [7:0]  gsi,
    input  wire        voltage_critical,
    input  wire        frequency_critical,
    input  wire        transformer_overload,
    input  wire        ev_surge,
    input  wire        solar_drop,
    input  wire        battery_available,
    output reg  [7:0]  blackout_risk_indicator // 0 - 100
);

    reg [15:0] risk_calc;
    wire [2:0] crit_count = {2'b0, voltage_critical} + {2'b0, frequency_critical} + 
                            {2'b0, transformer_overload} + {2'b0, ~battery_available};

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            blackout_risk_indicator <= 8'd0;
        end else begin
            // Base risk starts from GSI
            risk_calc = {8'b0, gsi};

            // Multiplier escalation on concurrent critical faults
            if (crit_count >= 3'd3) begin
                risk_calc = risk_calc + 16'd35;
            end else if (crit_count >= 3'd2) begin
                risk_calc = risk_calc + 16'd20;
            end else if (crit_count == 3'd1) begin
                risk_calc = risk_calc + 16'd10;
            end

            // Compound surge + drop penalty
            if (ev_surge && solar_drop) begin
                risk_calc = risk_calc + 16'd15;
            end

            // Clamp to 100
            if (risk_calc > 16'd100)
                blackout_risk_indicator <= 8'd100;
            else
                blackout_risk_indicator <= risk_calc[7:0];
        end
    end

endmodule
