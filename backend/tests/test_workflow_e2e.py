import pytest
import asyncio
from backend.services.workflow_service import WorkflowService
from backend.services.llm_service import LLMService
from backend.agents.orchestrator.orchestrator import OrchestratorAgent
from backend.agents.builder.builder import BuilderAgent
from backend.agents.reviewer.reviewer import ReviewerAgent
from backend.models.project_state import TaskItem
from backend.models.builder_output import BuilderOutput

@pytest.mark.asyncio
async def test_1_normal_smart_grid_requirement():
    """Test 1: Normal smart-grid requirement produces valid tasks and decomposition."""
    workflow = WorkflowService()
    proj = await workflow.start_project("Design a stable smart grid with solar and battery support.")
    assert proj.status in ("planning", "building", "reviewing", "approved", "completed")
    assert proj.project_id.startswith("proj_")

@pytest.mark.asyncio
async def test_2_ev_surge_and_solar_drop():
    """Test 2: EV surge + solar drop scenario decomposes into appropriate disturbance mitigation."""
    llm = LLMService()
    orchestrator = OrchestratorAgent(llm)
    plan = await orchestrator.create_plan("Detect blackout risk during EV surge and solar drop.")
    assert len(plan.tasks) >= 5
    assert any("EV" in t.title or "disturbance" in t.title.lower() or "grid" in t.title.lower() for t in plan.tasks)

@pytest.mark.asyncio
async def test_3_transformer_overload():
    """Test 3: Builder generates PLC logic that guards against transformer overload."""
    llm = LLMService()
    builder = BuilderAgent(llm)
    output = await builder.generate_solution([
        {"id": "t1", "title": "Prevent transformer thermal overload", "description": "Ensure PLC sheds EV if transformer > 115%"}
    ], iteration=2)
    assert "XFMR_OVERLOAD_LIMIT" in output.plc_logic or "transformer" in output.plc_logic.lower()

@pytest.mark.asyncio
async def test_4_hospital_critical_load_protection():
    """Test 4: Builder guarantees hospital load protection in both RTL and PLC logic."""
    llm = LLMService()
    builder = BuilderAgent(llm)
    output = await builder.generate_solution([
        {"id": "t1", "title": "Hospital Critical Load Preservation", "description": "Hospital feeder must never be tripped"}
    ], iteration=2)
    assert "hospital_isolate_lock" in output.rtl_code.get("fsm_controller.sv", "")
    assert "hospital_trip_inhibit" in output.plc_logic

@pytest.mark.asyncio
async def test_5_reviewer_rejects_builder_output_iteration_1():
    """Test 5: Reviewer independently audits and rejects initial Builder output with actionable issues."""
    llm = LLMService()
    builder = BuilderAgent(llm)
    reviewer = ReviewerAgent(llm)
    
    # Generate Iteration 1 output (which has unhardened FSM)
    out_v1 = await builder.generate_solution([{"id": "t1", "title": "Architecture", "description": ""}], iteration=1)
    review_v1 = await reviewer.review_design(out_v1, iteration=1)
    
    assert review_v1.approved is False
    assert review_v1.require_revision is True
    assert len(review_v1.issues) > 0
    assert any(i.category == "RTL" for i in review_v1.issues)

@pytest.mark.asyncio
async def test_6_builder_produces_revision_addressing_issues():
    """Test 6: Builder incorporates Reviewer feedback into Iteration 2."""
    llm = LLMService()
    builder = BuilderAgent(llm)
    
    feedback = {
        "issues": [
            {
                "category": "RTL",
                "description": "FSM lacks default case recovery",
                "recommendation": "Add default: next_state = STATE_IDLE;"
            }
        ]
    }
    out_v2 = await builder.generate_solution([{"id": "t1", "title": "Architecture", "description": ""}], iteration=2, review_feedback=feedback)
    assert "default: begin" in out_v2.rtl_code.get("fsm_controller.sv", "")

@pytest.mark.asyncio
async def test_7_reviewer_approves_revision():
    """Test 7: Reviewer audits Iteration 2 and approves the hardened design."""
    llm = LLMService()
    builder = BuilderAgent(llm)
    reviewer = ReviewerAgent(llm)
    
    out_v2 = await builder.generate_solution([{"id": "t1", "title": "Architecture", "description": ""}], iteration=2)
    review_v2 = await reviewer.review_design(out_v2, iteration=2)
    
    assert review_v2.approved is True
    assert review_v2.require_revision is False
    assert review_v2.severity == "none"

@pytest.mark.asyncio
async def test_8_maximum_3_iterations_reached():
    """Test 8: Orchestrator strictly stops after maximum 3 iterations without an infinite loop."""
    llm = LLMService()
    orchestrator = OrchestratorAgent(llm)
    
    # Review with approved=False at iteration 3
    fake_review = {
        "approved": False,
        "severity": "high",
        "issues": [{"category": "RTL", "description": "Persistent issue"}],
        "require_revision": True
    }
    decision = await orchestrator.evaluate_review(fake_review, iteration=3)
    assert decision.decision == "completed"
    assert "Maximum" in decision.reason or "maximum" in decision.reason

@pytest.mark.asyncio
async def test_9_llm_failure_fallback():
    """Test 9: System handles LLM API connection failure or missing key gracefully via domain generator."""
    llm = LLMService()
    llm.api_key = "invalid_fake_key"
    llm.provider = "gemini"
    # generate_json will catch the error and return high-fidelity domain fallback
    result = await llm.generate_json("System prompt", "User prompt", {"role": "orchestrator_plan", "requirement": "Test Fallback"})
    assert "project_title" in result
    assert len(result.get("tasks", [])) > 0

@pytest.mark.asyncio
async def test_10_malformed_agent_json():
    """Test 10: JSON cleaning and parsing handles markdown code blocks and whitespace."""
    llm = LLMService()
    raw_markdown = "```json\n{\"test_key\": \"test_val\"}\n```"
    cleaned = llm._clean_json(raw_markdown)
    assert cleaned == '{"test_key": "test_val"}'
