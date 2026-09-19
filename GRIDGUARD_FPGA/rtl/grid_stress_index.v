// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: grid_stress_index.v
// Description: Calculates real-time Grid Stress Index (GSI: 0 - 100).
// Weighting: Voltage (25%), Frequency (20%), Transformer (20%), Load (15%), EV (10%), Solar (10%)
// ============================================================================

module grid_stress_index (
    input  wire        clk,
    input  wire        reset,
    input  wire [1:0]  voltage_severity,   // 0: Normal, 1: Warn, 2: Crit
    input  wire [1:0]  frequency_severity, // 0: Normal, 1: Warn, 2: Crit
    input  wire [15:0] transformer_loading_percent, // 0 - 150%
    input  wire [15:0] total_grid_load,    // kW
    input  wire        ev_surge,
    input  wire        solar_drop,
    input  wire        battery_available,
    output reg  [7:0]  gsi                 // Grid Stress Index (0 - 100)
);

    reg [15:0] v_component;
    reg [15:0] f_component;
    reg [15:0] t_component;
    reg [15:0] l_component;
    reg [15:0] ev_component;
    reg [15:0] solar_component;
    reg [15:0] raw_sum;

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            gsi <= 8'd0;
        end else begin
            // Voltage component (max 25)
            if (voltage_severity == 2'b10)      v_component = 16'd25;
            else if (voltage_severity == 2'b01) v_component = 16'd15;
            else                                v_component = 16'd0;

            // Frequency component (max 20)
            if (frequency_severity == 2'b10)      f_component = 16'd20;
            else if (frequency_severity == 2'b01) f_component = 16'd12;
            else                                  f_component = 16'd0;

            // Transformer component (max 20)
            if (transformer_loading_percent >= 16'd100)      t_component = 16'd20;
            else if (transformer_loading_percent >= 16'd80)  t_component = (transformer_loading_percent - 16'd80); // 0 to 20
            else                                             t_component = 16'd0;

            // Load component (max 15)
            if (total_grid_load >= 16'd15000)      l_component = 16'd15;
            else if (total_grid_load >= 16'd10000) l_component = (total_grid_load - 16'd10000) / 16'd333;
            else                                   l_component = 16'd0;

            // EV component (max 10)
            ev_component = ev_surge ? 16'd10 : 16'd0;

            // Solar component (max 10)
            solar_component = solar_drop ? 16'd10 : 16'd0;

            // Sum and clamp to 100
            raw_sum = v_component + f_component + t_component + l_component + ev_component + solar_component;

            if (!battery_available && raw_sum > 16'd10) begin
                raw_sum = raw_sum + 16'd10; // BESS outage penalty
            end

            if (raw_sum > 16'd100)
                gsi <= 8'd100;
            else
                gsi <= raw_sum[7:0];
        end
    end

endmodule
