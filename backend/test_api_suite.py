"""
Automated Backend End-to-End Test Suite for AERT 3.0
Verifies database layer and operational contracts.
"""

import unittest
from database import (
    init_database,
    get_incidents,
    get_ambulances,
    get_hospitals,
    create_incident,
    get_analytics_summary,
)

class TestAERTBackendDirect(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_database()

    def test_01_database_get_incidents(self):
        incidents = get_incidents()
        self.assertIsInstance(incidents, list)
        self.assertGreater(len(incidents), 0)
        first = incidents[0]
        self.assertIn("id", first)
        self.assertIn("coordinates", first)
        self.assertEqual(len(first["coordinates"]), 2)

    def test_02_database_get_ambulances(self):
        ambulances = get_ambulances()
        self.assertIsInstance(ambulances, list)
        self.assertGreater(len(ambulances), 0)
        first = ambulances[0]
        self.assertIn("id", first)
        self.assertIn("status", first)

    def test_03_database_get_hospitals(self):
        hospitals = get_hospitals()
        self.assertIsInstance(hospitals, list)
        self.assertGreater(len(hospitals), 0)
        first = hospitals[0]
        self.assertIn("name", first)

    def test_04_database_create_incident(self):
        payload = {
            "type": "Chemical Vapor Leak",
            "location": "Singupuram Industrial Corridor",
            "severity": "CRITICAL",
            "victims": 4,
            "critical_victims": 2,
            "hazard_type": "Toxic Vapor",
            "coordinates": [83.9200, 18.2700],
            "status": "ACTIVE",
            "lifecycle_status": "VERIFIED",
            "location_source": "Automated Sensor Alert",
            "location_confidence": 98,
        }
        created = create_incident(payload)
        self.assertIsNotNone(created)
        self.assertIn("id", created)
        self.assertEqual(created["location"], "Singupuram Industrial Corridor")

    def test_05_database_analytics_summary(self):
        summary = get_analytics_summary()
        self.assertIn("active_incidents", summary)
        self.assertIn("total_ambulances", summary)
        self.assertIn("ambulance_status", summary)
        self.assertIn("AVAILABLE", summary["ambulance_status"])

if __name__ == "__main__":
    unittest.main()
