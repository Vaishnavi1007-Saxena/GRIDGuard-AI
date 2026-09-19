import logging
from typing import Dict, Any, List, Optional
from backend.services.llm_service import LLMService
from backend.agents.builder.prompts import BUILDER_SYSTEM_PROMPT
from backend.agents.orchestrator.orchestrator import OrchestratorAgent
from backend.models.builder_output import BuilderOutput
from backend.models.project_state import TaskItem

logger = logging.getLogger(__name__)

class BuilderAgent:
    """
    Unified Builder & Orchestrator Agent.
    Implements orchestration logic directly within the Builder backend,
    analyzing smart-grid requirements, decomposing engineering tasks,
    and synthesizing complete RTL, AI, Simulink, and PLC deliverables.
    """
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service
        self.orchestrator = OrchestratorAgent(llm_service)

    async def plan_and_orchestrate(self, requirement: str):
        """
        Orchestrator sub-routine inside Builder: analyzes requirements and creates engineering plan.
        """
        logger.info("[Builder:Orchestrator] Orchestrating requirement into technical tasks...")
        return await self.orchestrator.create_plan(requirement)

    async def orchestrate_and_build(
        self,
        requirement: str,
        iteration: int = 1,
        review_feedback: Optional[Dict[str, Any]] = None
    ) -> BuilderOutput:
        """
        Single unified backend pipeline: Orchestrates the requirement then builds the engineering solution.
        """
        plan = await self.plan_and_orchestrate(requirement)
        return await self.generate_solution(plan.tasks, iteration, review_feedback)

    async def generate_solution(
        self,
        tasks: List[Any],
        iteration: int = 1,
        review_feedback: Optional[Dict[str, Any]] = None
    ) -> BuilderOutput:
        """
        Generates full engineering project deliverables, incorporating review feedback on revisions.
        """
        user_prompt = f"Iteration: {iteration}\nEngineering Tasks to fulfill:\n"
        for t in tasks:
            title = t.get("title") if isinstance(t, dict) else getattr(t, "title", str(t))
            desc = t.get("description") if isinstance(t, dict) else getattr(t, "description", "")
            user_prompt += f"- {title}: {desc}\n"

        if review_feedback and review_feedback.get("issues"):
            user_prompt += f"\nCRITICAL REVIEW FEEDBACK FROM ITERATION {iteration - 1}:\n"
            for issue in review_feedback.get("issues", []):
                user_prompt += f"* [{issue.get('category')}] {issue.get('description')} -> Recommendation: {issue.get('recommendation')}\n"

        context = {
            "role": "builder",
            "iteration": iteration,
            "review_feedback": review_feedback
        }

        res = await self.llm.generate_json(BUILDER_SYSTEM_PROMPT, user_prompt, context)

        return BuilderOutput(
            project_title=res.get("project_title", "GRIDGUARD AI Engineering Solution"),
            architecture=res.get("architecture", ""),
            matlab_model=res.get("matlab_model", ""),
            matlab_script=res.get("matlab_script", ""),
            ai_architecture=res.get("ai_architecture", ""),
            ai_code_snippet=res.get("ai_code_snippet", ""),
            rtl_code=res.get("rtl_code", {}),
            testbench=res.get("testbench", {}),
            plc_logic=res.get("plc_logic", ""),
            assumptions=res.get("assumptions", []),
            explanation=res.get("explanation", "")
        )
