from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

class AgentMessage(BaseModel):
    """
    Standardized communication envelope between all agents and the system broker.
    Format:
    {
      "sender": "orchestrator",
      "receiver": "builder",
      "message_type": "build_request",
      "iteration": 1,
      "timestamp": "2026-09-19T12:00:00Z",
      "payload": { ... }
    }
    """
    sender: str = Field(..., description="Agent sending the message: user, orchestrator, builder, reviewer, system")
    receiver: str = Field(..., description="Target recipient: orchestrator, builder, reviewer, user, system")
    message_type: str = Field(..., description="Type of message: project_init, build_request, build_result, review_request, review_result, revision_request, final_approval, error")
    iteration: int = Field(default=1, description="Current workflow iteration count (1 to 3)")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="ISO timestamp")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Structured message payload")
