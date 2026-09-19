% GRIDGUARD AI — Smart City Electrical Digital Twin
% Parameter Initialization Script: gridguard_params.m
% 
% Defines system parameters, 11 Smart City Zones, baseline loads,
% generation ratings, battery specs, grid thresholds, and controller rules.

function params = gridguard_params()
    fprintf('=====================================================\n');
    fprintf('  GRIDGUARD AI: Smart City Electrical Digital Twin   \n');
    fprintf('  Initializing System Parameters & Zone Database... \n');
    fprintf('=====================================================\n');

    %% 1. ELECTRICAL NETWORK BASE PARAMETERS
    params.grid.V_nominal_kV = 33.0;      % Primary Substation Voltage (kV)
    params.grid.V_dist_kV = 11.0;         % Distribution Voltage (kV)
    params.grid.V_low_kV = 0.415;         % Low Voltage Feeder (kV)
    params.grid.frequency_hz = 60.0;      % System Nominal Frequency (Hz)
    params.grid.S_base_mva = 15.0;        % Base Apparent Power (MVA)
    params.grid.Z_line_pu = 0.02 + 0.05j; % Line Impedance (p.u.)

    %% 2. SMART CITY ZONES DATABASE (11 ZONES)
    % Zone Structure: Name, Type, Base MW, Base MVAR, Priority (1=Highest), Controllable (bool)
    zones = struct();

    % Zone 1: Substation
    zones(1).id = 1;
    zones(1).name = 'Central Substation';
    zones(1).type = 'Substation';
    zones(1).base_mw = 0.0;
    zones(1).base_mvar = 0.0;
    zones(1).priority = 0; % Infrastructure
    zones(1).controllable = false;

    % Zone 2: Residential District
    zones(2).id = 2;
    zones(2).name = 'Residential District';
    zones(2).type = 'Load';
    zones(2).base_mw = 2.5;
    zones(2).base_mvar = 0.6;
    zones(2).priority = 5;
    zones(2).controllable = true; % Flexible HVAC / Water heating

    % Zone 3: Commercial District
    zones(3).id = 3;
    zones(3).name = 'Commercial District';
    zones(3).type = 'Load';
    zones(3).base_mw = 2.0;
    zones(3).base_mvar = 0.5;
    zones(3).priority = 6;
    zones(3).controllable = true;

    % Zone 4: Industrial District
    zones(4).id = 4;
    zones(4).name = 'Industrial District';
    zones(4).type = 'Load';
    zones(4).base_mw = 3.5;
    zones(4).base_mvar = 1.1;
    zones(4).priority = 8; % Non-critical flexible loads shed first
    zones(4).controllable = true;

    % Zone 5: Hospital
    zones(5).id = 5;
    zones(5).name = 'Hospital';
    zones(5).type = 'Critical Load';
    zones(5).base_mw = 1.2;
    zones(5).base_mvar = 0.3;
    zones(5).priority = 1; % Highest Priority - Protected
    zones(5).controllable = false;

    % Zone 6: Data Center
    zones(6).id = 6;
    zones(6).name = 'Data Center';
    zones(6).type = 'Critical Load';
    zones(6).base_mw = 1.5;
    zones(6).base_mvar = 0.4;
    zones(6).priority = 4;
    zones(6).controllable = false;

    % Zone 7: Water Treatment Plant
    zones(7).id = 7;
    zones(7).name = 'Water Treatment Plant';
    zones(7).type = 'Critical Load';
    zones(7).base_mw = 1.0;
    zones(7).base_mvar = 0.25;
    zones(7).priority = 3;
    zones(7).controllable = false;

    % Zone 8: EV Charging Hub
    zones(8).id = 8;
    zones(8).name = 'EV Charging Hub';
    zones(8).type = 'Flexible Load';
    zones(8).base_mw = 1.8;
    zones(8).base_mvar = 0.2;
    zones(8).priority = 7; % Rapid curtailment target
    zones(8).controllable = true;

    % Zone 9: Solar Farm
    zones(9).id = 9;
    zones(9).name = 'Solar Farm';
    zones(9).type = 'Renewable Gen';
    zones(9).base_mw = 2.5; % Peak Capacity
    zones(9).base_mvar = 0.0;
    zones(9).priority = 0;
    zones(9).controllable = false;

    % Zone 10: Wind Farm
    zones(10).id = 10;
    zones(10).name = 'Wind Farm';
    zones(10).type = 'Renewable Gen';
    zones(10).base_mw = 3.0; % Peak Capacity
    zones(10).base_mvar = 0.0;
    zones(10).priority = 0;
    zones(10).controllable = false;

    % Zone 11: Battery Energy Storage System (BESS)
    zones(11).id = 11;
    zones(11).name = 'Battery Energy Storage';
    zones(11).type = 'Storage';
    zones(11).base_mw = 2.5; % Max Charge/Discharge Rate
    zones(11).base_mvar = 0.0;
    zones(11).priority = 0;
    zones(11).controllable = true;

    params.zones = zones;

    %% 3. BATTERY STORAGE PARAMETERS (BESS)
    params.bess.capacity_mwh = 5.0;      % Total Storage Energy (MWh)
    params.bess.max_power_mw = 2.5;      % Max Discharging/Charging Power (MW)
    params.bess.initial_soc_pct = 75.0;  % Initial State of Charge (%)
    params.bess.min_soc_pct = 15.0;      % Minimum Safe SOC (%)
    params.bess.max_soc_pct = 95.0;      % Maximum Safe SOC (%)
    params.bess.efficiency = 0.94;       % Round-trip efficiency

    %% 4. THRESHOLDS & OPERATIONAL CRITERIA
    params.thresholds.v_min_normal = 0.95;  % p.u.
    params.thresholds.v_max_normal = 1.05;  % p.u.
    params.thresholds.v_min_warning = 0.90; % p.u.
    params.thresholds.v_max_warning = 1.10; % p.u.
    params.thresholds.freq_min_hz = 59.5;   % Hz
    params.thresholds.freq_max_hz = 60.5;   % Hz
    params.thresholds.line_loading_max = 1.0; % 100% capacity

    %% 5. GRID HEALTH INDEX WEIGHTS
    params.ghi_weights.voltage = 0.35;
    params.ghi_weights.frequency = 0.30;
    params.ghi_weights.loading = 0.20;
    params.ghi_weights.bess_reserve = 0.15;

    %% 6. SIMULATION TIME SETTINGS
    params.sim.t_start = 0.0;
    params.sim.t_end = 30.0;  % Seconds
    params.sim.dt = 0.01;     % Step size (s)

    fprintf('  Total System Capacity: Utility Grid + %.1f MW Renewables\n', ...
        zones(9).base_mw + zones(10).base_mw);
    fprintf('  Total Baseline City Demand: %.2f MW / %.2f MVAR\n', ...
        sum([zones.base_mw]), sum([zones.base_mvar]));
    fprintf('  Battery Reserve: %.1f MWh / %.1f MW (Initial SOC: %.0f%%)\n', ...
        params.bess.capacity_mwh, params.bess.max_power_mw, params.bess.initial_soc_pct);
    fprintf('Parameters successfully loaded.\n\n');
end
