% GRIDGUARD AI — Smart City Electrical Digital Twin
% AI Grid Analyzer Interface: ai_grid_analyzer.m
%
% Real-time AI anomaly detection, risk prediction, disturbance classification,
% and mitigation recommendations. Designed with explicit extension hooks for
% replacing the rule engine with a trained MATLAB ML/DL model (e.g. SVM, XGBoost, ONNX).

function [anomaly_score, risk_level, disturbance_class, recommendation] = ai_grid_analyzer(v_bus_pu, freq_hz, line_loading_pu, P_load_mw, P_gen_mw, bess_soc_pct, fault_code)

    %% 1. FEATURE VECTOR CONSTRUCTION
    % In a full ML implementation, this feature vector is passed to model.predict(X)
    X_features = [ ...
        min(v_bus_pu), ...              % Minimum bus voltage
        mean(v_bus_pu), ...             % Average bus voltage
        abs(freq_hz - 60.0), ...        % Frequency deviation
        max(line_loading_pu), ...       % Maximum feeder loading
        (P_load_mw - P_gen_mw), ...     % Net power deficit
        bess_soc_pct, ...               % Battery State of Charge
        double(fault_code > 0) ...      % Fault flag
    ];

    %% 2. MODEL EXTENSION HOOK (PLACEHOLDER & ML INTEGRATION POINT)
    % To replace with a trained ML model:
    % persistent ml_model;
    % if isempty(ml_model)
    %     ml_model = load('trained_grid_model.mat');
    % end
    % [anomaly_score, disturbance_class] = predict_ml_model(ml_model, X_features);

    %% 3. HEURISTIC AI RULE ENGINE (CURRENT ACTIVE MODEL)
    v_min = X_features(1);
    f_dev = X_features(3);
    l_max = X_features(4);
    p_def = X_features(5);

    % Calculate Anomaly Score (0.00 to 1.00)
    score_v = max(0, min(1.0, (0.95 - v_min) / 0.15));
    score_f = max(0, min(1.0, f_dev / 1.5));
    score_l = max(0, min(1.0, (l_max - 0.85) / 0.45));
    score_p = max(0, min(1.0, max(0, p_def) / 5.0));

    anomaly_score = 0.35 * score_v + 0.25 * score_f + 0.25 * score_l + 0.15 * score_p;
    if fault_code > 0
        anomaly_score = max(anomaly_score, 0.85);
    end
    anomaly_score = round(anomaly_score, 2);

    %% 4. RISK LEVEL & CLASSIFICATION
    if anomaly_score < 0.25
        risk_level = 'LOW';
    elseif anomaly_score < 0.55
        risk_level = 'MEDIUM';
    elseif anomaly_score < 0.80
        risk_level = 'HIGH';
    else
        risk_level = 'SEVERE';
    end

    % Disturbance Classification
    if fault_code == 1 || (p_def > 2.0 && l_max > 1.0)
        disturbance_class = 'EV_LOAD_SURGE';
    elseif fault_code == 2 || (p_def > 2.5 && l_max > 1.1)
        disturbance_class = 'INDUSTRIAL_SURGE';
    elseif fault_code == 4 || fault_code == 5 || (p_def > 1.5 && v_min >= 0.94)
        disturbance_class = 'RENEWABLE_DROP';
    elseif fault_code == 8 || l_max > 1.25
        disturbance_class = 'FEEDER_LINE_OVERLOAD';
    elseif fault_code == 9 || v_min < 0.88
        disturbance_class = 'BUS_VOLTAGE_SAG';
    elseif fault_code == 10
        disturbance_class = 'COMBINED_CASCADING_DISTURBANCE';
    elseif anomaly_score > 0.30
        disturbance_class = 'MINOR_GRID_UNBALANCE';
    else
        disturbance_class = 'NOMINAL_OPERATION';
    end

    %% 5. RECOMMENDED ACTIONS
    switch disturbance_class
        case 'EV_LOAD_SURGE'
            recommendation = 'Throttle EV Charging Hub demand by 60% and dispatch BESS discharge support.';
        case 'INDUSTRIAL_SURGE'
            recommendation = 'Curtail non-critical industrial feeder loads and engage battery storage.';
        case 'RENEWABLE_DROP'
            recommendation = 'Ramp up grid import and utilize BESS reserve to smooth renewable fluctuation.';
        case 'FEEDER_LINE_OVERLOAD'
            recommendation = 'Re-route distribution topology and activate priority load shedding on Bus 2.';
        case 'BUS_VOLTAGE_SAG'
            recommendation = 'Inject reactive power support, discharge BESS, and shed tier-2 commercial loads.';
        case 'COMBINED_CASCADING_DISTURBANCE'
            recommendation = 'CRITICAL: Execute Smart Grid Controller emergency sequence. Shed all non-critical loads, protect Hospital and Water Plant.';
        otherwise
            recommendation = 'Continue continuous monitoring. All grid metrics within nominal thresholds.';
    end

end
