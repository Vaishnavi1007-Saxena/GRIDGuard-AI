% GRIDGUARD AI — Smart City Electrical Digital Twin
% Control Room Dashboard & Interactive GUI: gridguard_dashboard.m
%
% Implements the top-level digital twin engineering GUI in MATLAB, featuring
% dynamic city map layout, live signal-driven power flow visualization,
% zone inspection panel, real-time strip plots, fault injection panel,
% and automated cascading failure demonstration trigger.

function fig = gridguard_dashboard(sim_results)
    
    if nargin < 1
        % Load default parameters and generate sample dynamic run if not provided
        params = gridguard_params();
        sim_results = run_gridguard_simulation(params, 10); % Run cascading demo
    end

    % Create Main Control Room Figure
    fig = figure('Name', 'GRIDGUARD AI — Smart City Electrical Digital Twin', ...
        'NumberTitle', 'off', ...
        'Color', [0.08, 0.10, 0.14], ...
        'Position', [50, 50, 1400, 850]);

    %% 1. HEADER PANEL
    pnl_header = uipanel('Parent', fig, ...
        'Position', [0.01, 0.92, 0.98, 0.07], ...
        'BackgroundColor', [0.12, 0.15, 0.22], ...
        'HighlightColor', [0.2, 0.3, 0.5]);

    uicontrol('Parent', pnl_header, 'Style', 'text', ...
        'String', 'GRIDGUARD AI — SMART CITY ELECTRICAL DIGITAL TWIN CONTROL CENTER', ...
        'FontName', 'Segoe UI', 'FontSize', 14, 'FontWeight', 'bold', ...
        'ForegroundColor', [0.2, 0.8, 1.0], 'BackgroundColor', [0.12, 0.15, 0.22], ...
        'Position', [20, 10, 700, 30], 'HorizontalAlignment', 'left');

    % Status Gauge & Grid Health Text
    lbl_ghi = uicontrol('Parent', pnl_header, 'Style', 'text', ...
        'String', sprintf('GRID HEALTH INDEX: %.1f%%  [%s]', sim_results.ghi_pct(end), sim_results.ghi_state{end}), ...
        'FontName', 'Segoe UI', 'FontSize', 12, 'FontWeight', 'bold', ...
        'ForegroundColor', get_status_color(sim_results.ghi_state{end}), ...
        'BackgroundColor', [0.12, 0.15, 0.22], ...
        'Position', [800, 10, 400, 30], 'HorizontalAlignment', 'right');

    %% 2. CITY DIGITAL TWIN MAP PANEL (LEFT - 55% width)
    pnl_map = uipanel('Parent', fig, 'Title', 'CITY DIGITAL TWIN VISUAL LAYOUT (LIVE POWER FLOW & HEALTH)', ...
        'FontName', 'Segoe UI', 'FontSize', 10, 'FontWeight', 'bold', ...
        'ForegroundColor', [0.7, 0.85, 1.0], 'BackgroundColor', [0.10, 0.12, 0.18], ...
        'Position', [0.01, 0.35, 0.55, 0.56]);

    ax_map = axes('Parent', pnl_map, 'Position', [0.02, 0.02, 0.96, 0.94], ...
        'Color', [0.06, 0.08, 0.12], 'XColor', 'none', 'YColor', 'none');
    hold(ax_map, 'on');
    xlim(ax_map, [0, 100]); ylim(ax_map, [0, 100]);

    % Define 11 City Zone Coordinates on Visual Map
    % Zone: [x, y, width, height, name, icon_type]
    zone_coords = [ ...
        42, 80, 16, 12; % 1: Substation
        10, 50, 15, 12; % 2: Residential
        30, 50, 15, 12; % 3: Commercial
        50, 50, 15, 12; % 4: Industrial
        72, 65, 15, 12; % 5: Hospital (Critical)
        72, 45, 15, 12; % 6: Data Center (Critical)
        72, 25, 15, 12; % 7: Water Plant (Critical)
        30, 20, 15, 12; % 8: EV Hub
        10, 80, 15, 12; % 9: Solar Farm
        72, 80, 15, 12; % 10: Wind Farm
        50, 20, 15, 12; % 11: Battery Storage
    ];

    % Draw Live Power Lines (Connections between Substation & Buses & Zones)
    lines_conn = [
        1, 2; 1, 3; 1, 4; 1, 5; 1, 6; 1, 7; 1, 8; 9, 1; 10, 1; 11, 1
    ];

    for c = 1:size(lines_conn, 1)
        z1 = lines_conn(c, 1); z2 = lines_conn(c, 2);
        x_pts = [zone_coords(z1,1)+8, zone_coords(z2,1)+8];
        y_pts = [zone_coords(z1,2)+6, zone_coords(z2,2)+6];
        
        % Power flow magnitude drives line thickness and glow
        line_pwr = sim_results.p_gen_mw(end) / 10.0;
        plot(ax_map, x_pts, y_pts, 'Color', [0.1, 0.7, 0.9, 0.6], ...
            'LineWidth', max(1.5, min(4.5, line_pwr)), 'LineStyle', '-');
    end

    % Draw 11 City Zone Nodes
    z_patches = zeros(1, 11);
    for z = 1:11
        xc = zone_coords(z,1); yc = zone_coords(z,2);
        w = zone_coords(z,3); h = zone_coords(z,4);
        
        % Determine color from health state
        st = sim_results.zone_states{end}{z};
        clr = get_status_color(st);

        z_patches(z) = rectangle(ax_map, 'Position', [xc, yc, w, h], ...
            'Curvature', 0.2, 'FaceColor', clr, 'EdgeColor', [0.8, 0.9, 1.0], 'LineWidth', 1.5);
        
        text(ax_map, xc+w/2, yc+h/2, sim_results.zone_names{z}, ...
            'Color', [0, 0, 0], 'FontName', 'Segoe UI', 'FontSize', 8, ...
            'FontWeight', 'bold', 'HorizontalAlignment', 'center', 'VerticalAlignment', 'middle');
    end

    %% 3. ZONE INSPECTION PANEL (BOTTOM LEFT - 55% width)
    pnl_inspect = uipanel('Parent', fig, 'Title', 'ZONE INSPECTION & LIVE METRICS PANEL', ...
        'FontName', 'Segoe UI', 'FontSize', 10, 'FontWeight', 'bold', ...
        'ForegroundColor', [0.7, 0.85, 1.0], 'BackgroundColor', [0.10, 0.12, 0.18], ...
        'Position', [0.01, 0.01, 0.55, 0.33]);

    % Zone Selector Buttons
    uicontrol('Parent', pnl_inspect, 'Style', 'text', 'String', 'Select Zone:', ...
        'Position', [15, 160, 80, 20], 'ForegroundColor', [0.8, 0.9, 1.0], ...
        'BackgroundColor', [0.10, 0.12, 0.18], 'FontWeight', 'bold');

    % Zone Metric Labels
    lbl_metrics = uicontrol('Parent', pnl_inspect, 'Style', 'text', ...
        'Position', [15, 10, 700, 140], 'HorizontalAlignment', 'left', ...
        'FontName', 'Consolas', 'FontSize', 10, 'ForegroundColor', [0.3, 0.9, 0.5], ...
        'BackgroundColor', [0.06, 0.08, 0.12]);

    h_pop = uicontrol('Parent', pnl_inspect, 'Style', 'popupmenu', ...
        'String', sim_results.zone_names, 'Position', [100, 160, 180, 25], ...
        'BackgroundColor', [0.15, 0.2, 0.3], 'ForegroundColor', [1, 1, 1], ...
        'Callback', @(src, ~) update_zone_details(src.Value, sim_results, lbl_metrics));

    % Initialize Zone Inspector with Zone 5 (Hospital)
    h_pop.Value = 5;
    update_zone_details(5, sim_results, lbl_metrics);

    %% 4. REAL-TIME STRIP PLOTS (RIGHT TOP - 43% width)
    pnl_plots = uipanel('Parent', fig, 'Title', 'REAL-TIME DIGITAL TWIN MONITORING PLOTS', ...
        'FontName', 'Segoe UI', 'FontSize', 10, 'FontWeight', 'bold', ...
        'ForegroundColor', [0.7, 0.85, 1.0], 'BackgroundColor', [0.10, 0.12, 0.18], ...
        'Position', [0.57, 0.25, 0.42, 0.66]);

    % Subplot 1: Power Generation vs Demand
    ax1 = subplot(3, 1, 1, 'Parent', pnl_plots);
    plot(ax1, sim_results.time, sim_results.p_gen_mw, 'g-', 'LineWidth', 1.8); hold(ax1, 'on');
    plot(ax1, sim_results.time, sim_results.p_load_mw, 'r--', 'LineWidth', 1.8);
    grid(ax1, 'on'); legend(ax1, 'Total Gen (MW)', 'Total Load (MW)', 'TextColor', [1,1,1]);
    title(ax1, 'Power Generation vs Total Load Demand', 'Color', [0.8, 0.9, 1.0]);
    set(ax1, 'Color', [0.06, 0.08, 0.12], 'XColor', [0.6,0.7,0.8], 'YColor', [0.6,0.7,0.8]);

    % Subplot 2: Grid Voltage & Frequency
    ax2 = subplot(3, 1, 2, 'Parent', pnl_plots);
    plot(ax2, sim_results.time, sim_results.v_grid_pu, 'b-', 'LineWidth', 1.8); hold(ax2, 'on');
    plot(ax2, sim_results.time, sim_results.freq_hz / 60.0, 'm-.', 'LineWidth', 1.5);
    grid(ax2, 'on'); legend(ax2, 'Voltage (p.u.)', 'Freq (p.u.)', 'TextColor', [1,1,1]);
    title(ax2, 'Grid Voltage & Frequency Stability Profile', 'Color', [0.8, 0.9, 1.0]);
    set(ax2, 'Color', [0.06, 0.08, 0.12], 'XColor', [0.6,0.7,0.8], 'YColor', [0.6,0.7,0.8]);

    % Subplot 3: Battery SOC & Grid Health Index
    ax3 = subplot(3, 1, 3, 'Parent', pnl_plots);
    plot(ax3, sim_results.time, sim_results.bess_soc_pct, 'c-', 'LineWidth', 1.8); hold(ax3, 'on');
    plot(ax3, sim_results.time, sim_results.ghi_pct, 'y-', 'LineWidth', 2.0);
    grid(ax3, 'on'); legend(ax3, 'BESS SOC (%)', 'Grid Health Index (%)', 'TextColor', [1,1,1]);
    title(ax3, 'Battery State of Charge & Grid Health Index (%)', 'Color', [0.8, 0.9, 1.0]);
    set(ax3, 'Color', [0.06, 0.08, 0.12], 'XColor', [0.6,0.7,0.8], 'YColor', [0.6,0.7,0.8]);

    %% 5. INTERACTIVE FAULT INJECTION & DEMO PANEL (RIGHT BOTTOM - 43% width)
    pnl_faults = uipanel('Parent', fig, 'Title', 'INTERACTIVE FAULT INJECTION & CASCADING DEMO CONTROL', ...
        'FontName', 'Segoe UI', 'FontSize', 10, 'FontWeight', 'bold', ...
        'ForegroundColor', [0.7, 0.85, 1.0], 'BackgroundColor', [0.10, 0.12, 0.18], ...
        'Position', [0.57, 0.01, 0.42, 0.23]);

    % Cascading Failure Demo Button (Highlighted)
    uicontrol('Parent', pnl_faults, 'Style', 'pushbutton', ...
        'String', 'RUN AUTOMATED CASCADING FAILURE DEMO', ...
        'FontName', 'Segoe UI', 'FontSize', 10, 'FontWeight', 'bold', ...
        'BackgroundColor', [0.8, 0.2, 0.2], 'ForegroundColor', [1, 1, 1], ...
        'Position', [15, 110, 550, 35], ...
        'Callback', @(~, ~) run_demo_callback(fig));

    % Individual Fault Buttons
    fault_names = { ...
        '1: EV Surge', '2: Ind Surge', '3: Solar Drop', '4: Line Fault', ...
        '5: Bus Sag', '6: BESS Outage', '7: Wind Drop', '8: Res Surge' ...
    };

    fx = 15; fy = 65;
    for k = 1:4
        uicontrol('Parent', pnl_faults, 'Style', 'pushbutton', 'String', fault_names{k}, ...
            'Position', [fx, fy, 130, 30], 'BackgroundColor', [0.2, 0.3, 0.45], ...
            'ForegroundColor', [1, 1, 1], 'Callback', @(~, ~) trigger_fault_callback(k, fig));
        fx = fx + 140;
    end

    fx = 15; fy = 20;
    for k = 5:8
        uicontrol('Parent', pnl_faults, 'Style', 'pushbutton', 'String', fault_names{k}, ...
            'Position', [fx, fy, 130, 30], 'BackgroundColor', [0.2, 0.3, 0.45], ...
            'ForegroundColor', [1, 1, 1], 'Callback', @(~, ~) trigger_fault_callback(k, fig));
        fx = fx + 140;
    end

end

%% HELPER FUNCTIONS
function clr = get_status_color(state)
    switch upper(state)
        case 'NORMAL'
            clr = [0.10, 0.75, 0.30]; % Green
        case 'WARNING'
            clr = [0.95, 0.70, 0.10]; % Amber/Yellow
        case 'CRITICAL'
            clr = [0.90, 0.15, 0.15]; % Red
        otherwise
            clr = [0.40, 0.40, 0.40]; % Gray
    end
end

function update_zone_details(z_idx, sim_results, lbl_handle)
    name = sim_results.zone_names{z_idx};
    mw = sim_results.zone_mw(end, z_idx);
    mvar = sim_results.zone_mvar(end, z_idx);
    v_pu = sim_results.zone_voltages(end, z_idx);
    st = sim_results.zone_states{end}{z_idx};

    txt = sprintf([ ...
        '===========================================================\n' ...
        ' SELECTED ZONE: %s (Zone ID: %d)\n' ...
        '===========================================================\n' ...
        '   Active Power Demand / Gen  : %.2f MW\n' ...
        '   Reactive Power Demand      : %.2f MVAR\n' ...
        '   Bus Voltage                : %.3f p.u. (%.2f kV)\n' ...
        '   Feeder Current             : %.2f kA\n' ...
        '   System Frequency           : %.2f Hz\n' ...
        '   Power Factor               : %.2f\n' ...
        '   Zone Health State          : %s\n' ...
        '   AI Risk Assessment         : %s (Anomaly Score: %.2f)\n' ...
        '===========================================================' ...
    ], name, z_idx, mw, mvar, v_pu, v_pu*11.0, mw/(sqrt(3)*11.0*v_pu*0.95+0.01), ...
    sim_results.freq_hz(end), 0.95, st, sim_results.ai_risk{end}, sim_results.anomaly_score(end));

    set(lbl_handle, 'String', txt);
end

function run_demo_callback(fig)
    fprintf('Executing Automated Cascading Failure Demo in GUI...\n');
    params = gridguard_params();
    sim_results = run_gridguard_simulation(params, 10);
    close(fig);
    gridguard_dashboard(sim_results);
end

function trigger_fault_callback(fault_code, fig)
    fprintf('Injecting Fault Scenario Code %d...\n', fault_code);
    params = gridguard_params();
    sim_results = run_gridguard_simulation(params, fault_code);
    close(fig);
    gridguard_dashboard(sim_results);
end
