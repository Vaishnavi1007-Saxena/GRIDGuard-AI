% GRIDGUARD AI — Smart City Electrical Digital Twin
% Grid Health Index & Zone State Evaluation: grid_health_index.m
%
% Computes real-time Grid Health Index (0-100%) and 11 Zone Health States
% derived strictly from simulated electrical measurements (V, I, P, f, SOC).

function [ghi_pct, ghi_state, zone_states, zone_colors, details] = grid_health_index(v_bus_pu, freq_hz, line_loading_pu, P_gen_mw, P_load_mw, bess_soc_pct, zone_loads_mw, zone_voltages_pu)

    %% 1. FREQUENCY DEVIATION PENALTY
    % Nominal 60 Hz. Acceptable +/- 0.5 Hz
    freq_dev = abs(freq_hz - 60.0);
    if freq_dev <= 0.2
        f_score = 100.0;
    elseif freq_dev <= 0.5
        f_score = 100.0 - (freq_dev - 0.2) * 100.0; % 100 -> 70
    elseif freq_dev <= 1.5
        f_score = max(0, 70.0 - (freq_dev - 0.5) * 50.0); % 70 -> 20
    else
        f_score = 0.0;
    end

    %% 2. VOLTAGE DEVIATION PENALTY
    % Nominal 1.0 p.u. Acceptable 0.95 - 1.05 p.u.
    v_dev = max(0, max(0.95 - min(zone_voltages_pu), max(zone_voltages_pu) - 1.05));
    if v_dev == 0
        v_score = 100.0;
    elseif v_dev <= 0.05
        v_score = 100.0 - v_dev * 400.0; % 100 -> 80
    elseif v_dev <= 0.15
        v_score = max(0, 80.0 - (v_dev - 0.05) * 600.0); % 80 -> 20
    else
        v_score = 0.0;
    end

    %% 3. LINE LOADING & OVERLOAD PENALTY
    max_loading = max(line_loading_pu);
    if max_loading <= 0.85
        l_score = 100.0;
    elseif max_loading <= 1.0
        l_score = 100.0 - (max_loading - 0.85) * 200.0; % 100 -> 70
    elseif max_loading <= 1.3
        l_score = max(0, 70.0 - (max_loading - 1.0) * 200.0); % 70 -> 10
    else
        l_score = 0.0;
    end

    %% 4. GENERATION - DEMAND BALANCE SCORE
    imbalance = (P_load_mw - P_gen_mw) / max(1.0, P_load_mw);
    if imbalance <= 0.0
        b_score = 100.0; % Generation exceeds load
    elseif imbalance <= 0.1
        b_score = 100.0 - imbalance * 300.0; % 100 -> 70
    else
        b_score = max(0, 70.0 - (imbalance - 0.1) * 350.0);
    end

    %% 5. COMBINED GRID HEALTH INDEX (GHI)
    % Weighted formula: Voltage (35%), Frequency (30%), Line Loading (20%), Supply Balance (15%)
    ghi_pct = 0.35 * v_score + 0.30 * f_score + 0.20 * l_score + 0.15 * b_score;
    ghi_pct = min(100.0, max(0.0, ghi_pct));

    % Determine Overall Category
    if ghi_pct >= 90.0
        ghi_state = 'NORMAL';
    elseif ghi_pct >= 70.0
        ghi_state = 'WARNING';
    else
        ghi_state = 'CRITICAL';
    end

    %% 6. INDIVIDUAL 11 ZONE HEALTH STATES
    % 1: Substation, 2: Res, 3: Com, 4: Ind, 5: Hosp, 6: Data, 7: Water, 8: EV, 9: Solar, 10: Wind, 11: BESS
    num_zones = 11;
    zone_states = cell(1, num_zones);
    zone_colors = zeros(num_zones, 3); % RGB matrix

    for i = 1:num_zones
        v_z = zone_voltages_pu(i);
        p_z = zone_loads_mw(i);

        if v_z < 0.20 || (i <= 8 && p_z == 0 && v_z < 0.5)
            zone_states{i} = 'OFFLINE';
            zone_colors(i, :) = [0.35, 0.35, 0.35]; % Dark Gray
        elseif v_z < 0.88 || v_z > 1.12 || (i == 4 && max_loading > 1.25) || (i == 8 && max_loading > 1.2)
            zone_states{i} = 'CRITICAL';
            zone_colors(i, :) = [0.90, 0.15, 0.15]; % Vivid Red
        elseif v_z < 0.95 || v_z > 1.05 || max_loading > 0.95 || (i == 8 && p_z > 2.0)
            zone_states{i} = 'WARNING';
            zone_colors(i, :) = [0.95, 0.70, 0.10]; % Amber / Yellow
        else
            zone_states{i} = 'NORMAL';
            zone_colors(i, :) = [0.10, 0.75, 0.30]; % Vibrant Green
        end
    end

    %% 7. EXPORT DIAGNOSTIC DETAILS
    details.v_score = v_score;
    details.f_score = f_score;
    details.l_score = l_score;
    details.b_score = b_score;
    details.imbalance_mw = P_load_mw - P_gen_mw;
end
