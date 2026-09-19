import asyncio
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from backend.services.workflow_service import workflow_service
from backend.services.logging_service import logging_service
from backend.models.agent_message import AgentMessage

router = APIRouter(prefix="/workflow", tags=["workflow"])

@router.get("/{project_id}/messages", response_model=List[AgentMessage])
async def get_project_messages(project_id: str):
    proj = workflow_service.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return workflow_service.messages.get(project_id, [])

@router.get("/{project_id}/events")
async def stream_project_events(project_id: str):
    """
    Server-Sent Events (SSE) endpoint to stream real-time activity and state updates.
    """
    proj = workflow_service.get_project(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    async def event_generator():
        last_log_count = 0
        while True:
            current_proj = workflow_service.get_project(project_id)
            if not current_proj:
                break

            current_logs = logging_service.get_logs(project_id)
            if len(current_logs) > last_log_count:
                new_logs = current_logs[last_log_count:]
                last_log_count = len(current_logs)
                payload = {
                    "status": current_proj.status,
                    "iteration": current_proj.iteration,
                    "current_task": current_proj.current_task,
                    "decision": current_proj.decision,
                    "new_logs": [log.model_dump() for log in new_logs]
                }
                yield f"data: {json.dumps(payload)}\n\n"

            if current_proj.status in ("approved", "completed", "error"):
                # Send final event and terminate stream
                final_payload = {
                    "status": current_proj.status,
                    "iteration": current_proj.iteration,
                    "current_task": current_proj.current_task,
                    "decision": current_proj.decision,
                    "approval_status": current_proj.approval_status,
                    "final": True
                }
                yield f"data: {json.dumps(final_payload)}\n\n"
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

from typing import Optional, Dict, Any
from pydantic import BaseModel
from backend.services.chatbot_service import chatbot_service

class ChatRequest(BaseModel):
    message: str
    mode: Optional[str] = "copilot"
    live_telemetry: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = "default_session"

@router.post("/{project_id}/chat")
async def chat_with_copilot(project_id: str, req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty")
    return await chatbot_service.answer_query(
        project_id=project_id,
        query=req.message.strip(),
        mode=req.mode or "copilot",
        live_telemetry=req.live_telemetry,
        session_id=req.session_id or "default_session"
    )
