import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

from backend.models.project_state import ProjectState, TaskItem, IterationRecord, ActivityLogItem
from backend.models.agent_message import AgentMessage
from backend.models.builder_output import BuilderOutput
from backend.models.review_result import ReviewResult
from backend.agents.orchestrator.orchestrator import OrchestratorAgent
from backend.agents.builder.builder import BuilderAgent
from backend.agents.reviewer.reviewer import ReviewerAgent
from backend.services.llm_service import LLMService
from backend.services.logging_service import logging_service
from backend.services.simulation_service import simulation_service
from backend.config import settings

logger = logging.getLogger(__name__)

class WorkflowService:
    def __init__(self):
        self.llm_service = LLMService()
        self.orchestrator = OrchestratorAgent(self.llm_service)
        self.builder = BuilderAgent(self.llm_service)
        self.reviewer = ReviewerAgent(self.llm_service)
        
        # Project storage in-memory
        self.projects: Dict[str, ProjectState] = {}
        self.messages: Dict[str, List[AgentMessage]] = {}

    def get_project(self, project_id: str) -> Optional[ProjectState]:
        return self.projects.get(project_id)

    def list_projects(self) -> List[ProjectState]:
        return list(self.projects.values())

    def record_message(self, project_id: str, sender: str, receiver: str, msg_type: str, iteration: int, payload: Dict[str, Any]) -> AgentMessage:
        msg = AgentMessage(
            sender=sender,
            receiver=receiver,
            message_type=msg_type,
            iteration=iteration,
            payload=payload
        )
        if project_id not in self.messages:
            self.messages[project_id] = []
        self.messages[project_id].append(msg)
        return msg

    async def start_project(self, requirement: str) -> ProjectState:
        """
        Initializes a new project and triggers the background multi-agent engineering workflow.
        """
        proj = ProjectState(
            project_requirement=requirement,
            status="planning",
            iteration=0,
            decision="Formulating Engineering Plan"
        )
        self.projects[proj.project_id] = proj

        # Initial logs & message
        self.record_message(proj.project_id, "user", "orchestrator", "project_init", 0, {"requirement": requirement})
        log_item = logging_service.log(proj.project_id, "User", "Orchestrator", "Submitted smart-grid requirement", requirement[:60] + "...")
        proj.activity_log.append(log_item)

        # Launch workflow asynchronously
        asyncio.create_task(self._run_workflow(proj.project_id))
        return proj

    async def _run_workflow(self, project_id: str):
        proj = self.projects.get(project_id)
        if not proj:
            return

        try:
            # PHASE 1: ORCHESTRATOR PLANNING
            proj.status = "planning"
            proj.current_task = "Analyzing requirement and formulating engineering plan"
            log_item = logging_service.log(project_id, "Orchestrator", "System", "Formulating project plan & engineering tasks")
            proj.activity_log.append(log_item)

            plan = await self.orchestrator.create_plan(proj.project_requirement)
            proj.project_title = plan.project_title
            proj.problem_statement = plan.problem_statement
            proj.objectives = plan.objectives
            proj.tasks = plan.tasks
            
            self.record_message(project_id, "orchestrator", "system", "plan_created", 0, plan.model_dump())
            log_item = logging_service.log(project_id, "Orchestrator", "Builder", f"Created engineering plan with {len(proj.tasks)} tasks")
            proj.activity_log.append(log_item)

            # ITERATION LOOP (MAX 3 ITERATIONS)
            review_feedback = None
            
            for iter_idx in range(1, settings.MAX_ITERATIONS + 1):
                proj.iteration = iter_idx
                proj.status = "building"
                proj.decision = f"Building Technical Deliverables (Iteration {iter_idx})"
                
                # Mark tasks in progress
                for t in proj.tasks:
                    t.status = "in_progress"

                # Step A: Orchestrator -> Builder
                self.record_message(
                    project_id, "orchestrator", "builder", "build_request", iter_idx,
                    {"tasks": [t.model_dump() for t in proj.tasks], "iteration": iter_idx}
                )
                log_item = logging_service.log(project_id, "Orchestrator", "Builder", f"Delegated tasks for Iteration {iter_idx}")
                proj.activity_log.append(log_item)

                # Step B: Builder Generates Solutions
                proj.current_task = f"Generating Smart Grid Architecture, RTL & PLC Logic (v{iter_idx})"
                builder_output = await self.builder.generate_solution(
                    tasks=[t.model_dump() for t in proj.tasks],
                    iteration=iter_idx,
                    review_feedback=review_feedback
                )
                proj.builder_output = builder_output.model_dump()
                
                # Mark tasks completed
                for t in proj.tasks:
                    t.status = "completed"

                self.record_message(project_id, "builder", "orchestrator", "build_result", iter_idx, {"title": builder_output.project_title})
                log_item = logging_service.log(project_id, "Builder", "Orchestrator", f"Generated Version {iter_idx} technical deliverables")
                proj.activity_log.append(log_item)

                # Step C: Orchestrator -> Reviewer
                proj.status = "reviewing"
                proj.current_task = f"Independent Engineering Audit of Iteration {iter_idx}"
                self.record_message(project_id, "orchestrator", "reviewer", "review_request", iter_idx, {"iteration": iter_idx})
                log_item = logging_service.log(project_id, "Orchestrator", "Reviewer", f"Submitted Iteration {iter_idx} for independent review")
                proj.activity_log.append(log_item)

                # Step D: Reviewer Audits Deliverables
                review_result = await self.reviewer.review_design(builder_output, iter_idx)
                proj.review = review_result.model_dump()
                review_feedback = proj.review

                self.record_message(project_id, "reviewer", "orchestrator", "review_result", iter_idx, review_result.model_dump())
                issues_cnt = len(review_result.issues)
                log_item = logging_service.log(
                    project_id, "Reviewer", "Orchestrator",
                    f"Audit completed: {'APPROVED' if review_result.approved else 'REVISION REQUIRED'} ({issues_cnt} issues, severity: {review_result.severity})"
                )
                proj.activity_log.append(log_item)

                # Record Iteration History
                proj.iteration_history.append(IterationRecord(
                    iteration=iter_idx,
                    builder_summary=f"Version {iter_idx} generated: {len(builder_output.rtl_code)} RTL modules, TB, PLC logic",
                    review_status="approved" if review_result.approved else "revision_required",
                    severity=review_result.severity,
                    issues_count=issues_cnt,
                    issues=[i.model_dump() for i in review_result.issues],
                    suggestions=review_result.suggestions
                ))

                # Step E: Orchestrator Evaluates Review
                decision = await self.orchestrator.evaluate_review(review_result.model_dump(), iter_idx)
                proj.decision = decision.reason

                if decision.decision == "approved" or review_result.approved:
                    proj.status = "approved"
                    proj.approval_status = "approved"
                    proj.current_task = "All engineering requirements validated. Project ready for deployment."
                    log_item = logging_service.log(project_id, "Orchestrator", "User", "Project approved! High-reliability design validated.")
                    proj.activity_log.append(log_item)
                    break
                elif iter_idx < settings.MAX_ITERATIONS:
                    proj.status = "revision_required"
                    log_item = logging_service.log(
                        project_id, "Orchestrator", "Builder",
                        f"Requested revision {iter_idx + 1} addressing {issues_cnt} issues"
                    )
                    proj.activity_log.append(log_item)
                else:
                    # Max iterations reached without approval
                    proj.status = "completed"
                    proj.approval_status = "not_approved_after_max_iterations"
                    proj.current_task = "Reached maximum 3 iterations. Work finished with outstanding reviewer observations."
                    log_item = logging_service.log(project_id, "Orchestrator", "User", "Completed: maximum 3 iterations reached.")
                    proj.activity_log.append(log_item)
                    break

            proj.updated_at = datetime.now().isoformat()

        except Exception as e:
            logger.error(f"Workflow execution error: {e}", exc_info=True)
            proj.status = "error"
            proj.error_message = str(e)
            log_item = logging_service.log(project_id, "System", "User", "Workflow encountered an error", str(e))
            proj.activity_log.append(log_item)

workflow_service = WorkflowService()
