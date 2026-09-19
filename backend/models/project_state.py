from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class TaskItem(BaseModel):
    id: str
    title: str
    description: str
    status: str = "pending"  # pending, in_progress, completed, failed
    agent: str = "builder"

class IterationRecord(BaseModel):
    iteration: int
    builder_summary: str
    review_status: str  # approved, revision_required, completed
    severity: str
    issues_count: int
    issues: List[Dict[str, Any]] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ActivityLogItem(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("[%H:%M:%S]"))
    sender: str
    receiver: str
    action: str
    details: Optional[str] = ""

class ProjectState(BaseModel):
    project_id: str = Field(default_factory=lambda: f"proj_{int(datetime.now().timestamp()*1000)}")
    project_requirement: str = ""
    project_title: str = ""
    problem_statement: str = ""
    objectives: List[str] = Field(default_factory=list)
    tasks: List[TaskItem] = Field(default_factory=list)
    current_task: Optional[str] = ""
    builder_output: Optional[Dict[str, Any]] = None
    review: Optional[Dict[str, Any]] = None
    iteration: int = 0
    status: str = "planning"  # planning, building, reviewing, revision_required, approved, completed, error
    decision: str = ""
    approval_status: Optional[str] = None  # approved, not_approved_after_max_iterations
    error_message: Optional[str] = None
    activity_log: List[ActivityLogItem] = Field(default_factory=list)
    iteration_history: List[IterationRecord] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
