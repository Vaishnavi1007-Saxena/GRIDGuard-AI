from typing import List, Optional
from pydantic import BaseModel, Field
from backend.models.project_state import TaskItem

class PlanOutput(BaseModel):
    project_title: str = Field(..., description="Technical title of project")
    problem_statement: str = Field(..., description="Decomposed formal engineering problem statement")
    objectives: List[str] = Field(..., description="List of engineering objectives")
    tasks: List[TaskItem] = Field(..., description="List of structured tasks assigned to Builder agent")

class OrchestratorDecision(BaseModel):
    decision: str = Field(..., description="approved, revision_required, completed, error")
    reason: str = Field(..., description="Reasoning behind orchestrator decision")
    next_action: str = Field(..., description="Next step in workflow")
