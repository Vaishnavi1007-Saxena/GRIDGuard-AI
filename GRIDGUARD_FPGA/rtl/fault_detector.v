// ============================================================================
// GRIDGUARD AI — Smart City Electrical Digital Twin FPGA Accelerator
// Module: fault_detector.v
// Description: Encodes grid fault state into 4-bit fault code and flags.
// ============================================================================

module fault_detector (
    input  wire       clk,
    input  wire       reset,
    input  wire       voltage_low,
    input  wire       voltage_high,
    input  wire       frequency_critical,
    input  wire       frequency_high,
    input  wire       transformer_overload,
    input  wire       ev_surge,
    input  wire       solar_drop,
    input  wire       fault_injection_sig,
    output reg        fault_detected,
    output reg  [3:0] fault_code
);

    // Fault Code Constants
    localparam FAULT_NONE                 = 4'b0000;
    localparam FAULT_LOW_VOLTAGE          = 4'b0001;
    localparam FAULT_HIGH_VOLTAGE         = 4'b0010;
    localparam FAULT_LOW_FREQUENCY        = 4'b0011;
    localparam FAULT_HIGH_FREQUENCY       = 4'b0100;
    localparam FAULT_TRANSFORMER_OVERLOAD = 4'b0101;
    localparam FAULT_EV_SURGE             = 4'b0110;
    localparam FAULT_SOLAR_DROP           = 4'b0111;
    localparam FAULT_MULTIPLE             = 4'b1000;

    wire [3:0] fault_sum = {3'b0, voltage_low} + {3'b0, voltage_high} + 
                           {3'b0, frequency_critical} + {3'b0, transformer_overload} + 
                           {3'b0, ev_surge} + {3'b0, solar_drop} + {3'b0, fault_injection_sig};

    always @(posedge clk or posedge reset) begin
        if (reset) begin
            fault_detected <= 1'b0;
            fault_code     <= FAULT_NONE;
        end else begin
            if (fault_sum >= 4'd2) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_MULTIPLE;
            end else if (voltage_low || fault_injection_sig) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_LOW_VOLTAGE;
            end else if (voltage_high) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_HIGH_VOLTAGE;
            end else if (frequency_critical) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_LOW_FREQUENCY;
            end else if (frequency_high) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_HIGH_FREQUENCY;
            end else if (transformer_overload) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_TRANSFORMER_OVERLOAD;
            end else if (ev_surge) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_EV_SURGE;
            end else if (solar_drop) begin
                fault_detected <= 1'b1;
                fault_code     <= FAULT_SOLAR_DROP;
            end else begin
                fault_detected <= 1'b0;
                fault_code     <= FAULT_NONE;
            end
        end
    end

endmodule
