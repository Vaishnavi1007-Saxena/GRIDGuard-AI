% GRIDGUARD AI — Smart City Electrical Digital Twin
% Simulation Engine: run_gridguard_simulation.m
%
% Executes the multi-physics electrical simulation for 11 city zones under
% nominal operation or any of the 10 fault scenarios including the complete
% Cascading Failure Demonstration sequence.

function sim_results = run_gridguard_simulation(params, fault_scenario_id)

    if nargin < 1
        params = gridguard_params();
    end
    if nargin < 2
        fault_scenario_id = 10; % Default to Cascading Failure Demo
    end

    fprintf('=====================================================\n');
    fprintf('  GRIDGUARD AI: Running Electrical Simulation...     \n');
    fprintf('  Fault Scenario ID: %d                              \n', fault_scenario_id);
    fprintf('=====================================================\n');

    %% 1. TIME VECTOR INITIALIZATION
    t_start = 0.0; t_end = 30.0; dt = 0.1;
    time = (t_start:dt:t_end)';
    N = length(time);

    zone_names = {params.zones.name};
    num_zones = length(zone_names);

    %% 2. ALLOCATE TIME-SERIES ARRAYS
    v_grid_pu = ones(N, 1);
    freq_hz = 60.0 * ones(N, 1);
    p_gen_mw = zeros(N, 1);
    p_load_mw = zeros(N, 1);
    p_solar_mw = 2.5 * ones(N, 1);
    p_wind_mw = 3.0 * ones(N, 1);
    bess_soc_pct = 75.0 * ones(N, 1);
    bess_power_mw = zeros(N, 1);
    ev_demand_mw = 1.8 * ones(N, 1);
    ghi_pct = 95.0 * ones(N, 1);
    anomaly_score = 0.05 * ones(N, 1);
    
    zone_mw = zeros(N, num_zones);
    zone_mvar = zeros(N, num_zones);
    zone_voltages = ones(N, num_zones);
    zone_states = cell(N, 1);
    ghi_state = cell(N, 1);
    ctrl_state = cell(N, 1);
    ai_risk = cell(N, 1);
    ai_class = cell(N, 1);
    fault_code = fault_scenario_id * ones(N, 1);

    % Baseline active loads for all 11 zones
    base_loads = [params.zones.base_mw];
    base_mvars = [params.zones.base_mvar];

    current_soc = 75.0;

    %% 3. SIMULATION DYNAMICS LOOP
    for k = 1:N
        t = time(k);

        % Set default profile values
        active_loads = base_loads;
        active_mvars = base_mvars;
        solar_gen = 2.5;
        wind_gen = 3.0;
        fault_active = false;

        % -----------------------------------------------------------------
        % APPLY FAULT / DISTURBANCE DYNAMICS BASED ON SCENARIO
        % -----------------------------------------------------------------
        if fault_scenario_id == 10 % CASCADING FAILURE DEMO
            if t >= 5.0 && t < 15.0
                % EV Surge + Solar Drop
                active_loads(8) = 3.5; % EV Surge to 3.5 MW
                solar_gen = 0.8;       % Solar drop 68%
                fault_active = true;
            end
        elseif fault_scenario_id == 1 % EV SURGE
            if t >= 5.0
                active_loads(8) = 4.0;
                fault_active = true;
            end
        elseif fault_scenario_id == 2 % INDUSTRIAL SURGE
            if t >= 5.0
                active_loads(4) = 6.0;
                fault_active = true;
            end
        elseif fault_scenario_id == 3 % SOLAR REDUCTION
            if t >= 5.0
                solar_gen = 0.3;
                fault_active = true;
            end
        elseif fault_scenario_id == 4 % LINE FAULT
            if t >= 5.0 && t < 12.0
                active_loads(2) = 0.0; % Line disconnect to Residential
                fault_active = true;
            end
        end

        % Compute total raw demand and renewable generation
        p_solar_mw(k) = solar_gen;
        p_wind_mw(k) = wind_gen;
        ev_demand_mw(k) = active_loads(8);

        raw_total_load = sum(active_loads(2:8));
        raw_ren_gen = solar_gen + wind_gen;

        % -----------------------------------------------------------------
        % EVALUATE SMART GRID CONTROLLER INTERVENTION
        % -----------------------------------------------------------------
        % Estimate grid frequency and min voltage before controller action
        min_v_est = max(0.85, 1.00 - (raw_total_load - raw_ren_gen - 5.0) * 0.02);
        freq_est = 60.0 - (raw_total_load - raw_ren_gen - 5.0) * 0.08;
        line_load_est = (raw_total_load) / 12.0;

        [bess_cmd_mw, ev_curtail_pct, ind_shed_pct, com_shed_pct, res_shed_pct, c_st, ~] = ...
            smart_grid_controller(min_v_est, freq_est, raw_total_load, raw_ren_gen + 5.0, current_soc, line_load_est, fault_active);

        ctrl_state{k} = c_st;
        bess_power_mw(k) = bess_cmd_mw;

        % Update BESS SOC Dynamics
        current_soc = current_soc - (bess_cmd_mw * (dt / 3600.0) / params.bess.capacity_mwh) * 100.0;
        current_soc = min(98.0, max(10.0, current_soc));
        bess_soc_pct(k) = current_soc;

        % Apply Controller Curtailment & Load Shedding
        active_loads(8) = active_loads(8) * (1.0 - ev_curtail_pct / 100.0);
        active_loads(4) = active_loads(4) * (1.0 - ind_shed_pct / 100.0);
        active_loads(3) = active_loads(3) * (1.0 - com_shed_pct / 100.0);
        active_loads(2) = active_loads(2) * (1.0 - res_shed_pct / 100.0);

        % Hospital (5), Data Center (6), Water Plant (7) remain 100% protected
        total_controlled_load = sum(active_loads(2:8));
        p_load_mw(k) = total_controlled_load;

        % Total Generation = Utility Grid (slack) + Renewables + BESS
        utility_import = max(2.0, total_controlled_load - raw_ren_gen - bess_cmd_mw);
        p_gen_mw(k) = utility_import + raw_ren_gen + max(0, bess_cmd_mw);

        % Electrical Network Solution (Voltage drops & Frequency response)
        v_grid_pu(k) = max(0.86, min(1.05, 1.00 - (total_controlled_load - 10.0) * 0.015 + (bess_cmd_mw * 0.01)));
        freq_hz(k) = max(58.8, min(60.2, 60.0 - (total_controlled_load - (raw_ren_gen + utility_import + bess_cmd_mw)) * 0.05));

        % Compute 11 Zone Voltages
        for z = 1:num_zones
            if z == 1
                zone_voltages(k, z) = v_grid_pu(k);
            elseif z == 5 || z == 6 || z == 7 % Critical infrastructure double feeder
                zone_voltages(k, z) = max(0.98, v_grid_pu(k));
            else
                zone_voltages(k, z) = max(0.85, v_grid_pu(k) - (active_loads(z) / 10.0) * 0.03);
            end
            zone_mw(k, z) = active_loads(z);
            zone_mvar(k, z) = active_mvars(z);
        end

        % -----------------------------------------------------------------
        % EVALUATE GRID HEALTH INDEX & AI ANALYZER
        % -----------------------------------------------------------------
        line_loading_pu = [line_load_est, line_load_est*0.9, line_load_est*1.1];
        [ghi, g_st, z_sts, ~, ~] = grid_health_index(v_grid_pu(k), freq_hz(k), line_loading_pu, ...
            p_gen_mw(k), p_load_mw(k), current_soc, active_loads, zone_voltages(k, :));

        ghi_pct(k) = ghi;
        ghi_state{k} = g_st;
        zone_states{k} = z_sts;

        [score, risk, class, ~] = ai_grid_analyzer(zone_voltages(k, :), freq_hz(k), line_loading_pu, ...
            p_load_mw(k), p_gen_mw(k), current_soc, fault_scenario_id);

        anomaly_score(k) = score;
        ai_risk{k} = risk;
        ai_class{k} = class;
    end

    %% 4. PACKAGE SIMULATION RESULTS
    sim_results.time = time;
    sim_results.v_grid_pu = v_grid_pu;
    sim_results.freq_hz = freq_hz;
    sim_results.p_gen_mw = p_gen_mw;
    sim_results.p_load_mw = p_load_mw;
    sim_results.p_solar_mw = p_solar_mw;
    sim_results.p_wind_mw = p_wind_mw;
    sim_results.bess_soc_pct = bess_soc_pct;
    sim_results.bess_power_mw = bess_power_mw;
    sim_results.ev_demand_mw = ev_demand_mw;
    sim_results.ghi_pct = ghi_pct;
    sim_results.ghi_state = ghi_state;
    sim_results.zone_states = zone_states;
    sim_results.zone_names = zone_names;
    sim_results.zone_mw = zone_mw;
    sim_results.zone_mvar = zone_mvar;
    sim_results.zone_voltages = zone_voltages;
    sim_results.ctrl_state = ctrl_state;
    sim_results.fault_code = fault_code;
    sim_results.anomaly_score = anomaly_score;
    sim_results.ai_risk = ai_risk;
    sim_results.ai_class = ai_class;

    fprintf('  Simulation completed successfully (%d time steps).\n', N);
    fprintf('  Final Grid Health Index: %.1f%% (%s)\n', ghi_pct(end), ghi_state{end});
    fprintf('  Final Controller State: %s\n', ctrl_state{end});
    fprintf('=====================================================\n\n');

end
