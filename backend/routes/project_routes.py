from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.services.workflow_service import workflow_service
from backend.services.simulation_service import simulation_service
from backend.models.project_state import ProjectState

router = APIRouter(prefix="/projects", tags=["projects"])

class CreateProjectRequest(BaseModel):
    requirement: str

@router.post("", response_model=ProjectState)
async def create_project(req: CreateProjectRequest):
    if not req.requirement or not req.requirement.strip():
        raise HTTPException(status_code=400, detail="Project requirement cannot be empty")
    proj = await workflow_service.start_project(req.requirement.strip())
    return proj

@router.get("", response_model=List[ProjectState])
async def list_projects():
    return workflow_service.list_projects()

@router.get("/{project_id}", response_model=ProjectState)
async def get_project(project_id: str):
    proj = workflow_service.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.get("/{project_id}/telemetry")
async def get_project_telemetry(project_id: str):
    proj = workflow_service.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    telemetry = simulation_service.get_telemetry_for_state(proj.status, proj.iteration)
    return telemetry.model_dump()

@router.get("/{project_id}/demo-stages")
async def get_demo_stages(project_id: str):
    proj = workflow_service.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return simulation_service.get_demo_stages()
