import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.ml_prediction_service import ml_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ml", tags=["machine_learning"])

class TelemetryPayload(BaseModel):
    frequency: Optional[float] = 50.0
    voltage: Optional[float] = 1.0
    Pload: Optional[float] = 100.0
    Pgen: Optional[float] = 85.0
    Psolar: Optional[float] = 20.0
    Pwind: Optional[float] = 15.0
    currentSOC: Optional[float] = 70.0
    lineLoading: Optional[float] = 71.4
    activeFaults: Optional[Dict[str, bool]] = None
    health: Optional[float] = 100.0

@router.post("/predict")
async def predict_grid_risk(payload: TelemetryPayload):
    """
    Real-time Random Forest inference endpoint.
    Predicts:
    1. Disturbance/Fault Type
    2. Continuous Blackout Risk Score (0-100%)
    3. Spatial Highest-Risk Municipal Feeder / Sector
    4. Estimated Time-to-Trip
    5. Prescriptive Preventive Action (with projected risk reduction)
    """
    try:
        telemetry_dict = payload.model_dump()
        result = ml_service.predict(telemetry_dict)
        return {
            "status": "success",
            "prediction": result
        }
    except Exception as e:
        logger.error(f"Error running ML inference: {e}")
        raise HTTPException(status_code=500, detail=f"ML inference error: {str(e)}")

@router.get("/metrics")
async def get_model_metrics():
    """
    Returns trained Random Forest model metrics, accuracy, R2 scores,
    and feature importance rankings.
    """
    if not ml_service.bundle:
        return {
            "status": "warning",
            "message": "ML model bundle not yet loaded.",
            "metrics": None
        }

    return {
        "status": "success",
        "model_type": ml_service.bundle.get("model_type", "Random Forest Multi-Task Ensemble"),
        "metrics": ml_service.bundle.get("metrics", {}),
        "feature_importances": ml_service.bundle.get("feature_importances", {}),
        "feature_columns": ml_service.bundle.get("feature_columns", [])
    }
