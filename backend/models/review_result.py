from typing import List, Optional
from pydantic import BaseModel, Field

class ReviewIssue(BaseModel):
    category: str = Field(..., description="RTL, FPGA Synthesizability, Testbench, Grid Protection, AI Layer, PLC Layer, MATLAB/Simulink")
    description: str = Field(..., description="Specific description of flaw, bug, or missing safety check")
    location: str = Field(..., description="File, module, or section where the issue resides")
    recommendation: str = Field(..., description="Actionable recommendation for the Builder agent")

class ReviewResult(BaseModel):
    approved: bool = Field(..., description="True if design meets all engineering, RTL, and safety standards")
    severity: str = Field(..., description="Overall severity: none, low, medium, high")
    issues: List[ReviewIssue] = Field(default_factory=list, description="List of identified issues")
    suggestions: List[str] = Field(default_factory=list, description="List of engineering enhancements")
    require_revision: bool = Field(..., description="True if revision is required before approval")
    reason: str = Field(..., description="Summary explanation of review determination")
