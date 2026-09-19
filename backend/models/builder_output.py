from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

class RTLModule(BaseModel):
    filename: str = Field(..., description="E.g., grid_controller.sv, fsm_controller.sv")
    description: str = Field(..., description="Module purpose and architectural role")
    code: str = Field(..., description="SystemVerilog/Verilog code")

class BuilderOutput(BaseModel):
    project_title: str = Field(..., description="Title of the smart grid engineering project")
    architecture: str = Field(..., description="Smart-grid architecture & subsystem topology description")
    matlab_model: str = Field(..., description="MATLAB/Simulink-oriented model specification and signal mapping")
    matlab_script: Optional[str] = Field(default="", description="MATLAB construction or simulation script")
    ai_architecture: str = Field(..., description="AI grid prediction model, feature inputs, risk levels, and explainability")
    ai_code_snippet: Optional[str] = Field(default="", description="Python scikit-learn / XGBoost inference pipeline code")
    rtl_code: Dict[str, str] = Field(default_factory=dict, description="Dictionary of filename -> SystemVerilog code")
    testbench: Dict[str, str] = Field(default_factory=dict, description="Dictionary of filename -> SystemVerilog testbench code")
    plc_logic: str = Field(..., description="PLC safety logic, Structured Text, and safety interlocks")
    assumptions: List[str] = Field(default_factory=list, description="Engineering and simulation assumptions")
    explanation: str = Field(..., description="Comprehensive engineering rationale")
