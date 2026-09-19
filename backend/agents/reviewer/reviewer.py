import logging
from typing import Dict, Any, List
from backend.services.llm_service import LLMService
from backend.agents.reviewer.prompts import REVIEWER_SYSTEM_PROMPT
from backend.models.review_result import ReviewResult, ReviewIssue
from backend.models.builder_output import BuilderOutput

logger = logging.getLogger(__name__)

class ReviewerAgent:
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service

    async def review_design(self, builder_output: BuilderOutput, iteration: int = 1) -> ReviewResult:
        """
        Conducts rigorous independent audit of the Builder's deliverables.
        """
        user_prompt = f"""Conduct an engineering review of the following Builder deliverables for Iteration {iteration}:
Project Title: {builder_output.project_title}
Architecture:
{builder_output.architecture}

MATLAB Model:
{builder_output.matlab_model}

AI Module:
{builder_output.ai_architecture}

SystemVerilog RTL Code:
{builder_output.rtl_code}

Testbench:
{builder_output.testbench}

PLC Safety Logic:
{builder_output.plc_logic}

Assumptions:
{builder_output.assumptions}
"""

        context = {
            "role": "reviewer",
            "iteration": iteration,
            "builder_output": builder_output.model_dump()
        }

        res = await self.llm.generate_json(REVIEWER_SYSTEM_PROMPT, user_prompt, context)

        issues = []
        for item in res.get("issues", []):
            issues.append(ReviewIssue(
                category=item.get("category", "General"),
                description=item.get("description", "Issue identified"),
                location=item.get("location", "Unknown"),
                recommendation=item.get("recommendation", "Review and fix")
            ))

        return ReviewResult(
            approved=res.get("approved", False),
            severity=res.get("severity", "medium" if issues else "none"),
            issues=issues,
            suggestions=res.get("suggestions", []),
            require_revision=res.get("require_revision", not res.get("approved", False)),
            reason=res.get("reason", "Review completed.")
        )
