import logging
from typing import Dict, Any, List
from backend.services.llm_service import LLMService
from backend.agents.orchestrator.prompts import ORCHESTRATOR_SYSTEM_PROMPT, ORCHESTRATOR_DECISION_PROMPT
from backend.agents.orchestrator.schemas import PlanOutput, OrchestratorDecision
from backend.models.project_state import TaskItem

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service

    async def create_plan(self, requirement: str) -> PlanOutput:
        """
        Receives user natural-language requirement and decomposes it into structured tasks.
        """
        user_prompt = f"Decompose the following smart grid requirement into formal engineering tasks:\n{requirement}"
        context = {
            "role": "orchestrator_plan",
            "requirement": requirement
        }
        res = await self.llm.generate_json(ORCHESTRATOR_SYSTEM_PROMPT, user_prompt, context)
        
        # Validate tasks
        tasks = []
        for t in res.get("tasks", []):
            tasks.append(TaskItem(
                id=t.get("id", "task-1"),
                title=t.get("title", "Engineering Task"),
                description=t.get("description", ""),
                status="pending",
                agent="builder"
            ))

        return PlanOutput(
            project_title=res.get("project_title", "GRIDGUARD AI — Smart Grid Project"),
            problem_statement=res.get("problem_statement", requirement),
            objectives=res.get("objectives", []),
            tasks=tasks
        )

    async def evaluate_review(self, review_data: Dict[str, Any], iteration: int) -> OrchestratorDecision:
        """
        Analyzes the Reviewer's evaluation and decides whether to approve, request revision, or complete.
        """
        user_prompt = f"Analyze review result for iteration {iteration}:\n{review_data}"
        context = {
            "role": "orchestrator_decision",
            "iteration": iteration,
            "review": review_data
        }
        res = await self.llm.generate_json(ORCHESTRATOR_DECISION_PROMPT, user_prompt, context)
        
        decision_str = res.get("decision", "revision_required" if not review_data.get("approved") else "approved")
        
        # Enforce max 3 iterations rule
        if iteration >= 3 and decision_str != "approved":
            decision_str = "completed"
            reason = "Maximum allowed iterations (3) reached. Design finalized with active reviewer audit notes."
            next_action = "report_max_iterations_reached"
        else:
            reason = res.get("reason", "Decision based on reviewer report.")
            next_action = res.get("next_action", "proceed")

        return OrchestratorDecision(
            decision=decision_str,
            reason=reason,
            next_action=next_action
        )
