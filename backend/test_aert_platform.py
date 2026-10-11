"""
AERT Automated Test Suite
Verifies Geographic Consistency, Intelligence Scoring, Resource Conflict Detection,
Lifecycle Transitions, Operator Overrides, Hospital Pre-Alerts, Copilot Queries, and Demo Scenarios.
"""
import unittest
from database import (
    init_database,
    get_incidents,
    get_incident,
    create_incident,
    update_incident_lifecycle,
    record_operator_override,
    get_ambulances,
    get_hospitals,
    get_road_events,
    create_hospital_pre_alert,
    get_hospital_pre_alerts,
    get_audit_logs,
    get_analytics_summary,
    reset_demo_scenario,
)
from intelligence import (
    haversine_km,
    score_severity,
    estimate_fleet_requirement,
    rank_ambulances,
    rank_hospitals,
    build_recommendation,
    detect_resource_conflicts,
    copilot_query_reasoning,
)


class TestAERTPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_database()
        reset_demo_scenario("nh16_collision")

    def test_01_srikakulam_geographic_boundaries(self):
        """Verify all seeded resources fall within Srikakulam district bounding box"""
        # Srikakulam District Demo Region: Longitude [83.70, 84.15], Latitude [18.15, 18.50]
        incidents = get_incidents()
        ambulances = get_ambulances()
        hospitals = get_hospitals()
        road_events = get_road_events()

        for inc in incidents:
            lon, lat = inc["coordinates"]
            self.assertTrue(83.70 <= lon <= 84.15, f"Incident {inc['id']} longitude {lon} out of Srikakulam bounds")
            self.assertTrue(18.15 <= lat <= 18.50, f"Incident {inc['id']} latitude {lat} out of Srikakulam bounds")

        for amb in ambulances:
            lon, lat = amb["coordinates"]
            self.assertTrue(83.70 <= lon <= 84.15, f"Ambulance {amb['id']} longitude {lon} out of bounds")
            self.assertTrue(18.15 <= lat <= 18.50, f"Ambulance {amb['id']} latitude {lat} out of bounds")

        for hos in hospitals:
            lon, lat = hos["coordinates"]
            self.assertTrue(83.70 <= lon <= 84.15, f"Hospital {hos['id']} longitude {lon} out of bounds")
            self.assertTrue(18.15 <= lat <= 18.50, f"Hospital {hos['id']} latitude {lat} out of bounds")

        for rd in road_events:
            lon, lat = rd["coordinates"]
            self.assertTrue(83.70 <= lon <= 84.15, f"Road event {rd['id']} longitude {lon} out of bounds")
            self.assertTrue(18.15 <= lat <= 18.50, f"Road event {rd['id']} latitude {lat} out of bounds")

    def test_02_severity_scoring_algorithm(self):
        """Test multi-criteria transparent scoring formula"""
        score, breakdown, label = score_severity("CRITICAL", victims=8, critical_victims=2, incident_type="Major Highway Collision")
        self.assertGreaterEqual(score, 85)
        self.assertEqual(label, "CRITICAL PRIORITY")
        self.assertEqual(breakdown["base_points"], 85)
        self.assertEqual(breakdown["victim_count_points"], 10)
        self.assertEqual(breakdown["critical_casualty_points"], 10)
        self.assertEqual(breakdown["hazard_type_points"], 7)

    def test_03_fleet_requirement_and_als_matching(self):
        """Test ALS vs BLS sizing based on critical casualties"""
        req_als = estimate_fleet_requirement(priority_score=90, victims=8, critical_victims=2, incident_type="Collision")
        self.assertTrue(req_als["requires_als"])
        self.assertGreaterEqual(req_als["required_units"], 3)

        req_bls = estimate_fleet_requirement(priority_score=40, victims=1, critical_victims=0, incident_type="Minor Fall")
        self.assertFalse(req_bls["requires_als"])
        self.assertEqual(req_bls["required_units"], 1)

    def test_04_resource_conflict_and_shortage_detection(self):
        """Test sector shortage detection when critical calls exceed available units"""
        # Load shortage scenario
        res = reset_demo_scenario("resource_shortage_crisis")
        self.assertTrue(res["success"])

        incs = get_incidents()
        ambs = get_ambulances()
        hosps = get_hospitals()

        conflicts = detect_resource_conflicts(incs, ambs, hosps)
        self.assertTrue(conflicts["has_shortage"])
        self.assertGreater(conflicts["resource_gap"], 0)
        self.assertGreater(len(conflicts["recommended_actions"]), 0)

        # Reset back
        reset_demo_scenario("nh16_collision")

    def test_05_10_stage_lifecycle_progression(self):
        """Test transitioning incident through operational lifecycle stages"""
        inc = create_incident({
            "type": "Highway Crash",
            "location": "NH-16 Srikakulam Bypass Km 44",
            "severity": "HIGH",
            "victims": 2,
            "coordinates": [83.9050, 18.3050],
        })
        inc_id = inc["id"]

        # Progression: VERIFIED -> DISPATCHED -> EN_ROUTE -> ON_SCENE -> TRANSPORTING -> ARRIVED_HOSPITAL -> RESOLVED
        stages = ["DISPATCHED", "EN_ROUTE", "ON_SCENE", "TRANSPORTING", "ARRIVED_HOSPITAL", "RESOLVED"]
        for st in stages:
            updated = update_incident_lifecycle(inc_id, st, ambulance_id="AMB-001", hospital_id="HOS-001")
            self.assertEqual(updated["lifecycle_status"], st)

        resolved = get_incident(inc_id)
        self.assertEqual(resolved["status"], "RESOLVED")
        self.assertIsNotNone(resolved["resolved_at"])

    def test_06_operator_override_and_audit_trail(self):
        """Test recording operator override with audit entry"""
        incs = get_incidents()
        target = incs[0]

        override_res = record_operator_override(
            incident_id=target["id"],
            selected_ambulance_id="AMB-004",
            selected_hospital_id="HOS-002",
            ai_recommended_ambulance_id="AMB-001",
            ai_recommended_hospital_id="HOS-001",
            override_reason="Commander local route familiarity & medical director consultation.",
        )
        self.assertTrue(override_res["success"])

        # Check audit trail
        logs = get_audit_logs(limit=10, override_only=True)
        self.assertGreater(len(logs), 0)
        self.assertEqual(logs[0]["override_flag"], 1)
        self.assertIn("OVERRIDE", logs[0]["action"])

    def test_07_hospital_pre_alert(self):
        """Test hospital pre-alert generation and retrieval"""
        pre_alert = create_hospital_pre_alert(
            incident_id="INC-001",
            hospital_id="HOS-001",
            ambulance_id="AMB-001",
            severity="CRITICAL",
            patient_summary="2 polytrauma victims, conscious.",
            estimated_eta_mins=8,
            trauma_requirements="Level 1 Trauma Bay Prepared",
        )
        self.assertEqual(pre_alert["status"], "TRANSMITTED")

        alerts = get_hospital_pre_alerts()
        self.assertGreater(len(alerts), 0)
        self.assertEqual(alerts[0]["hospital_id"], "HOS-001")

    def test_08_operations_copilot_reasoning(self):
        """Test copilot grounded answers over active state"""
        incs = get_incidents()
        ambs = get_ambulances()
        hosps = get_hospitals()
        roads = get_road_events()

        # Query 1: Priority
        res1 = copilot_query_reasoning("which incident needs attention first", incs, ambs, hosps, roads)
        self.assertIn("INC-", res1["answer"])
        self.assertGreater(len(res1["highlight_entities"]), 0)

        # Query 2: Shortages
        res2 = copilot_query_reasoning("check for resource shortages in sector", incs, ambs, hosps, roads)
        self.assertIn("RESOURCE", res2["answer"].upper())

    def test_09_all_seven_demo_scenarios(self):
        """Test activating all 7 demonstration scenarios"""
        scenarios = [
            "nh16_collision",
            "palakonda_rollover",
            "cardiac_emergency",
            "industrial_fire",
            "resource_shortage_crisis",
            "hospital_saturation",
            "road_closure_reroute",
        ]
        for sc in scenarios:
            res = reset_demo_scenario(sc)
            self.assertTrue(res["success"], f"Failed to reset scenario: {sc}")
            self.assertIsNotNone(res["scenario_name"])


if __name__ == "__main__":
    unittest.main()
