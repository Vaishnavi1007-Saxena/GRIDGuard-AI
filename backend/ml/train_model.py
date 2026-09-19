import os
import json
import time
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, classification_report, r2_score, mean_squared_error

DATASET_PATH = "backend/data/grid_telemetry_dataset.csv"
MODEL_OUTPUT_PATH = "backend/data/gridguard_ml_model.joblib"
METRICS_OUTPUT_PATH = "backend/data/model_evaluation_metrics.json"

FEATURE_COLUMNS = [
    "frequency_hz",
    "rocof_hz_s",
    "voltage_pu",
    "total_demand_mw",
    "total_gen_mw",
    "net_power_deficit_mw",
    "line_loading_pct",
    "solar_gen_mw",
    "wind_gen_mw",
    "battery_soc_pct",
    "ev_load_mw",
    "industrial_load_mw",
    "datacenter_load_mw"
]

def train_gridguard_ml():
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Run generate_dataset.py first.")
        
    print(f"Loading dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df)} samples with {len(df.columns)} columns.")
    
    X = df[FEATURE_COLUMNS]
    y_fault = df["fault_type"]
    y_risk = df["blackout_risk_pct"]
    y_sector = df["highest_risk_sector"]
    
    # 80/20 Train-Test Split
    X_train, X_test, y_fault_train, y_fault_test, y_risk_train, y_risk_test, y_sector_train, y_sector_test = train_test_split(
        X, y_fault, y_risk, y_sector, test_size=0.2, random_state=42, stratify=y_fault
    )
    
    print("\n--- Training Model 1: Fault Classifier (Random Forest) ---")
    t0 = time.time()
    clf_fault = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    clf_fault.fit(X_train, y_fault_train)
    fault_train_time = time.time() - t0
    y_fault_pred = clf_fault.predict(X_test)
    fault_acc = accuracy_score(y_fault_test, y_fault_pred)
    print(f"Fault Classification Accuracy: {fault_acc * 100:.2f}% (Trained in {fault_train_time:.2f}s)")
    
    print("\n--- Training Model 2: Blackout Risk Regressor (Random Forest) ---")
    t0 = time.time()
    reg_risk = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    reg_risk.fit(X_train, y_risk_train)
    risk_train_time = time.time() - t0
    y_risk_pred = reg_risk.predict(X_test)
    risk_r2 = r2_score(y_risk_test, y_risk_pred)
    risk_rmse = np.sqrt(mean_squared_error(y_risk_test, y_risk_pred))
    print(f"Blackout Risk Regressor R^2: {risk_r2:.4f}, RMSE: {risk_rmse:.2f}% (Trained in {risk_train_time:.2f}s)")
    
    print("\n--- Training Model 3: Spatial Highest-Risk Sector Classifier ---")
    t0 = time.time()
    clf_sector = RandomForestClassifier(n_estimators=40, max_depth=8, random_state=42, n_jobs=-1)
    clf_sector.fit(X_train, y_sector_train)
    sector_train_time = time.time() - t0
    y_sector_pred = clf_sector.predict(X_test)
    sector_acc = accuracy_score(y_sector_test, y_sector_pred)
    print(f"Sector Risk Identification Accuracy: {sector_acc * 100:.2f}% (Trained in {sector_train_time:.2f}s)")
    
    # Feature Importance Extraction
    importances = clf_fault.feature_importances_
    feat_imp = sorted(zip(FEATURE_COLUMNS, [round(float(v) * 100, 2) for v in importances]), key=lambda x: x[1], reverse=True)
    print("\n--- Feature Importance Breakdown ---")
    for feat, imp in feat_imp:
        print(f"  • {feat:<24}: {imp:>6.2f}%")
        
    # Benchmarking Inference Latency
    single_sample = X_test.iloc[[0]]
    t_start = time.perf_counter()
    for _ in range(100):
        _ = clf_fault.predict(single_sample)
        _ = reg_risk.predict(single_sample)
        _ = clf_sector.predict(single_sample)
    avg_latency_ms = ((time.perf_counter() - t_start) / 100) * 1000.0
    print(f"\nAverage Real-Time Inference Latency: {avg_latency_ms:.2f} ms")
    
    # Bundle Models and Metadata
    bundle = {
        "model_type": "RandomForest_MultiTarget_Ensemble",
        "feature_columns": FEATURE_COLUMNS,
        "fault_classifier": clf_fault,
        "risk_regressor": reg_risk,
        "sector_classifier": clf_sector,
        "classes_fault": list(clf_fault.classes_),
        "classes_sector": list(clf_sector.classes_),
        "feature_importances": dict(feat_imp),
        "metrics": {
            "fault_accuracy_pct": round(fault_acc * 100, 2),
            "risk_r2_score": round(risk_r2, 4),
            "risk_rmse_pct": round(risk_rmse, 2),
            "sector_accuracy_pct": round(sector_acc * 100, 2),
            "inference_latency_ms": round(avg_latency_ms, 2),
            "total_samples": len(df)
        }
    }
    
    joblib.dump(bundle, MODEL_OUTPUT_PATH)
    print(f"\nTrained Model Bundle saved to {MODEL_OUTPUT_PATH}")
    
    with open(METRICS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(bundle["metrics"], f, indent=2)
    print(f"Evaluation Metrics saved to {METRICS_OUTPUT_PATH}")
    
    return bundle

if __name__ == "__main__":
    train_gridguard_ml()
