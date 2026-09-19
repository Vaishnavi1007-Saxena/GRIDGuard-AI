// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: alarm_controller.v
// Description: Manages warning and critical alarm flags and blackout indicators.
// ============================================================================

module alarm_controller (
    input  wire        clk,
    input  wire        reset,
    input  wire [7:0]  gsi,
    input  wire [7:0]  blackout_risk_indicator,
    input  wire        fault_detected,
    output reg         warning_alarm,
    output reg         critical_alarm,
    output reg         emergency_alarm
);

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            warning_alarm   <= 1'b0;
            critical_alarm  <= 1'b0;
            emergency_alarm <= 1'b0;
        end else begin
            // Warning Alarm (GSI >= 50 or fault active)
            warning_alarm   <= (gsi >= 8'd50) || fault_detected;

            // Critical Alarm (GSI >= 75 or high risk)
            critical_alarm  <= (gsi >= 8'd75) || (blackout_risk_indicator >= 8'd75);

            // Emergency Alarm (GSI >= 90 or risk >= 90)
            emergency_alarm <= (gsi >= 8'd90) || (blackout_risk_indicator >= 8'd90);
        end
    end

endmodule
