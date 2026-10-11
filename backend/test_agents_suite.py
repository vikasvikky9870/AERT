"""
Automated Test Suite for AERT 3.0 Multi-Agent System (backend/agents.py)
Verifies:
1. Agent Existence & Identity across all 9 operational domains
2. Tool Isolation & Permission Policy Enforcement (SecurityException)
3. Typed Pydantic Input/Output Contract Validation
4. Central AIOrchestrator Execution Pipeline
5. Deterministic Service Layer Decoupling
"""

import unittest
from agents import (
    BaseAgent,
    SecurityException,
    IntakeAgent,
    IncidentAgent,
    GISAgent,
    DispatchAgent,
    HospitalAgent,
    RiskAgent,
    SimulationAgent,
    CommandAgent,
    ReportingAgent,
    AIOrchestrator,
    IntakeInput,
    IncidentInput,
    GISInput,
    DispatchInput,
    HospitalInput,
    RiskInput,
    ReportingInput,
)
from database import init_database, get_incidents, get_ambulances, get_hospitals, get_road_events


class TestMultiAgentSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_database()
        cls.orchestrator = AIOrchestrator()

    def test_01_all_nine_agents_instantiation_and_identity(self):
        """Verify all 9 domain agents exist with explicit metadata and tool registries"""
        agents = [
            self.orchestrator.intake_agent,
            self.orchestrator.incident_agent,
            self.orchestrator.gis_agent,
            self.orchestrator.dispatch_agent,
            self.orchestrator.hospital_agent,
            self.orchestrator.risk_agent,
            self.orchestrator.simulation_agent,
            self.orchestrator.command_agent,
            self.orchestrator.reporting_agent,
        ]

        self.assertEqual(len(agents), 9)
        for agent in agents:
            self.assertIsInstance(agent, BaseAgent)
            self.assertTrue(len(agent.agent_id) > 0)
            self.assertTrue(len(agent.name) > 0)
            self.assertTrue(len(agent.domain) > 0)
            self.assertIsInstance(agent.allowed_tools, set)

    def test_02_tool_isolation_and_security_exception(self):
        """Verify agents are PROHIBITED from accessing tools outside their registry"""
        intake_agent = IntakeAgent()

        # Allowed tool works cleanly
        dist = intake_agent.invoke_tool(
            "haversine_distance", lon1=83.8961, lat1=18.2969, lon2=83.9050, lat2=18.3050
        )
        self.assertGreater(dist, 0.0)

        # Unauthorized tool raises SecurityException
        with self.assertRaises(SecurityException):
            intake_agent.invoke_tool("rank_ambulances", incident_lon=83.89, incident_lat=18.29, ambulances=[])

        with self.assertRaises(SecurityException):
            intake_agent.invoke_tool("detect_conflicts", incidents=[], ambulances=[], hospitals=[])

    def test_03_typed_intake_agent_extraction(self):
        """Test IntakeAgent with typed Pydantic input and structured extraction output"""
        agent = IntakeAgent()
        inp = IntakeInput(
            raw_transcript="Severe collision on NH-16 bypass junction! At least 6 casualties, two unconscious and fuel leaking!",
            caller_name="K. Raman",
            caller_phone="+91 98480 12345"
        )
        out = agent.run(inp)
        self.assertEqual(out.incident_type, "Major Highway Collision")
        self.assertEqual(out.estimated_victims, 6)
        self.assertEqual(out.critical_victims, 2)
        self.assertIn("NH-16", out.location_landmark)
        self.assertEqual(out.confidence, 96)

    def test_04_typed_incident_agent_scoring(self):
        """Test IncidentAgent triage scoring and ALS sizing"""
        agent = IncidentAgent()
        inp = IncidentInput(
            type="Major Highway Collision",
            severity="CRITICAL",
            victims=6,
            critical_victims=2,
            hazard_type="Highway Entrapment / Fuel Spill",
            location="NH-16 Bypass",
            coordinates=[83.9050, 18.3050]
        )
        out = agent.run(inp)
        self.assertGreaterEqual(out.priority_score, 85)
        self.assertTrue(out.requires_als)
        self.assertGreaterEqual(out.required_units, 2)

    def test_05_typed_dispatch_agent_ranking_and_approval_gate(self):
        """Test DispatchAgent candidate ranking and human gate enforcement"""
        agent = DispatchAgent()
        ambulances = get_ambulances()
        inp = DispatchInput(
            incident_coordinates=[83.9050, 18.3050],
            ambulances=ambulances,
            road_events=[],
            requires_als=True
        )
        out = agent.run(inp)
        self.assertIsNotNone(out.recommended_ambulance)
        self.assertTrue(out.requires_human_approval)
        self.assertGreater(len(out.candidate_ranking), 0)

    def test_06_typed_hospital_agent_ranking(self):
        """Test HospitalAgent trauma capacity evaluation"""
        agent = HospitalAgent()
        hospitals = get_hospitals()
        inp = HospitalInput(
            incident_coordinates=[83.9050, 18.3050],
            hospitals=hospitals,
            road_events=[],
            critical_triage=True
        )
        out = agent.run(inp)
        self.assertIsNotNone(out.recommended_hospital)
        self.assertTrue(out.requires_human_approval)

    def test_07_central_orchestrator_pipeline_execution(self):
        """Test complete multi-agent pipeline run with trace recording"""
        incidents = get_incidents()
        ambulances = get_ambulances()
        hospitals = get_hospitals()
        road_events = get_road_events()

        target_inc = incidents[0]
        res = self.orchestrator.analyze_incident_pipeline(
            incident=target_inc,
            ambulances=ambulances,
            hospitals=hospitals,
            road_events=road_events,
            all_incidents=incidents
        )

        self.assertIn("agent_traces", res)
        self.assertEqual(len(res["agent_traces"]), 4)
        self.assertIn("command_plan", res)
        self.assertTrue(res["command_plan"]["human_approval_required"])


if __name__ == "__main__":
    unittest.main()
