% GRIDGUARD AI — Smart City Electrical Digital Twin
% Smart Grid Controller: smart_grid_controller.m
%
% Implements priority-aware real-time grid stabilization, battery energy storage
% management, EV demand curtailment, and selective load shedding.
%
% Priority Order (Explicit Project Assumption):
% 1. Hospital (Protected)
% 2. Water Treatment Plant (Protected)
% 3. Data Center (Protected)
% 4. Residential District (Tier 1 Load)
% 5. Commercial District (Tier 2 Load)
% 6. EV Charging Hub (Flexible Demand - Throttled First)
% 7. Industrial District (Non-Critical Heavy Load - Shed First)

function [bess_cmd_mw, ev_curtail_pct, ind_shed_pct, com_shed_pct, res_shed_pct, ctrl_state, action_desc] = smart_grid_controller(v_min_pu, freq_hz, p_load_mw, p_gen_mw, bess_soc_pct, line_load_pu, fault_active)

    %% 1. DEFAULT CONTROL OUTPUTS (NOMINAL STATE)
    bess_cmd_mw = 0.0;
    ev_curtail_pct = 0.0;
    ind_shed_pct = 0.0;
    com_shed_pct = 0.0;
    res_shed_pct = 0.0;
    ctrl_state = 'NORMAL';
    action_desc = 'Grid operating in equilibrium. Nominal control active.';

    %% 2. CALCULATE POWER DEFICIT & DEVIATIONS
    power_deficit_mw = p_load_mw - p_gen_mw;
    v_dev = 1.0 - v_min_pu;
    f_dev = 60.0 - freq_hz;

    %% 3. STATE MACHINE EVALUATION & CONTROLLER LOGIC
    if fault_active || v_min_pu < 0.88 || freq_hz < 59.3 || line_load_pu > 1.20
        % -----------------------------------------------------------------
        % STATE: EMERGENCY / CASCADING FAILURE PREVENTION
        % -----------------------------------------------------------------
        ctrl_state = 'EMERGENCY';

        % Step 1: Maximum Battery Discharge Support (if SOC > 15%)
        if bess_soc_pct > 15.0
            bess_cmd_mw = 2.5; % Max 2.5 MW discharge
        else
            bess_cmd_mw = 0.0;
        end

        % Step 2: Throttles EV Charging completely (100% curtailment)
        ev_curtail_pct = 100.0;

        % Step 3: Shed non-critical heavy industrial load (80% shed)
        ind_shed_pct = 80.0;

        % Step 4: Shed non-critical commercial load (40% shed)
        com_shed_pct = 40.0;

        % Hospital, Water Treatment, and Data Center remain 100% protected (0% shed)
        res_shed_pct = 0.0;

        action_desc = 'EMERGENCY: Max BESS discharge active. EV 100% curtailed. Industrial shed 80%. Critical loads protected.';

    elseif v_min_pu < 0.94 || freq_hz < 59.7 || line_load_pu > 0.98 || power_deficit_mw > 1.5
        % -----------------------------------------------------------------
        % STATE: DISTURBANCE / OVERLOAD MITIGATION
        % -----------------------------------------------------------------
        ctrl_state = 'DISTURBANCE';

        % Discharge BESS proportionally to power deficit
        if bess_soc_pct > 20.0
            bess_cmd_mw = min(2.5, max(0.5, power_deficit_mw + 0.5));
        else
            bess_cmd_mw = 0.0;
        end

        % Throttling flexible EV demand by 60%
        ev_curtail_pct = 60.0;

        % Shed non-critical industrial load by 30%
        ind_shed_pct = 30.0;

        action_desc = 'DISTURBANCE: BESS supporting grid. EV charging throttled 60%. Industrial demand reduced 30%.';

    elseif v_min_pu < 0.96 || line_load_pu > 0.90 || power_deficit_mw > 0.5
        % -----------------------------------------------------------------
        % STATE: WARNING / PREVENTIVE STABILIZATION
        % -----------------------------------------------------------------
        ctrl_state = 'WARNING';

        if bess_soc_pct > 30.0
            bess_cmd_mw = min(1.5, power_deficit_mw);
        end

        ev_curtail_pct = 25.0; % Mild EV throttling
        action_desc = 'WARNING: Mild power deficit. BESS engaged. EV demand reduced 25%.';

    elseif power_deficit_mw < -1.5 && bess_soc_pct < 95.0
        % -----------------------------------------------------------------
        % STATE: STABILIZATION / RENEWABLE SURPLUS CHARGING
        % -----------------------------------------------------------------
        ctrl_state = 'STABILIZATION';

        % Absorbing excess renewable generation into BESS
        bess_cmd_mw = max(-2.5, power_deficit_mw); % Negative = Charge
        action_desc = sprintf('STABILIZATION: Excess renewable generation (%.2f MW). BESS charging at %.2f MW.', ...
            abs(power_deficit_mw), abs(bess_cmd_mw));

    else
        % -----------------------------------------------------------------
        % STATE: NORMAL OPERATION
        % -----------------------------------------------------------------
        ctrl_state = 'NORMAL';
        if bess_soc_pct < 60.0 && power_deficit_mw <= 0
            bess_cmd_mw = -0.5; % Trickle charging
        end
        action_desc = 'NORMAL: Grid stable. Nominal operation.';
    end

end
