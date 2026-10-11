import unittest
import numpy as np
from quantum_optimization import (
    QAOASimulator,
    QUBOBuilder,
    TrafficMLPredictor,
    run_quantum_dispatch_analysis
)

class TestQuantumOptimizationSuite(unittest.TestCase):

    def test_qaoa_unitary_statevector_convergence(self):
        # 4-qubit diagonal cost Hamiltonian
        cost_diag = np.diag([10.0, 5.0, 2.0, 8.0])
        best_bits, best_energy, meta = QAOASimulator.solve_qaoa(cost_diag)
        
        self.assertEqual(len(best_bits), 4)
        self.assertEqual(int(np.sum(best_bits)), 1)
        # Optimal candidate index is 2 (energy 2.0)
        self.assertEqual(int(np.argmax(best_bits)), 2)
        self.assertEqual(meta["optimal_bitstring"], "|0010>")
        self.assertGreater(meta["ground_state_measurement_probability"], 0.0)

    def test_qubo_builder_one_hot_formulation(self):
        candidate_costs = [12.5, 8.2, 19.4]
        Q, offset = QUBOBuilder.build_selection_qubo(candidate_costs, penalty=500.0)
        
        self.assertEqual(Q.shape, (3, 3))
        # Off-diagonal penalty check: 2 * P
        self.assertEqual(Q[0, 1], 1000.0)
        self.assertEqual(offset, 500.0)

    def test_ml_traffic_predictor(self):
        predictor = TrafficMLPredictor()
        # Test morning peak hour with rain
        delay_peak = predictor.predict_delay_multiplier(hour=9.0, rain_mm=25.0, severity_level=3)
        # Test midnight off-peak clear weather
        delay_offpeak = predictor.predict_delay_multiplier(hour=2.0, rain_mm=0.0, severity_level=1)
        
        self.assertGreater(delay_peak, delay_offpeak)
        self.assertGreaterEqual(delay_peak, 1.0)
        self.assertLessEqual(delay_peak, 5.0)

    def test_quantum_dispatch_e2e_pipeline(self):
        incident = {
            "id": "INC-TEST-01",
            "type": "Cardiac Emergency",
            "severity": "CRITICAL",
            "coordinates": [83.8961, 18.2969]
        }
        ambulances = [
            {"id": "AMB-01", "crew": "Unit 1", "type": "BLS", "status": "AVAILABLE", "coordinates": [83.8990, 18.2990], "fuel_pct": 90},
            {"id": "AMB-02", "crew": "Unit 2", "type": "ALS", "status": "AVAILABLE", "coordinates": [83.9050, 18.3050], "fuel_pct": 95},
        ]
        hospitals = [
            {"id": "HOS-01", "name": "District Hospital", "coordinates": [83.9000, 18.3000], "icu_beds_available": 3, "has_trauma_center": True}
        ]

        result = run_quantum_dispatch_analysis(incident, ambulances, hospitals)
        self.assertEqual(result["status"], "OPTIMAL_CONVERGED")
        self.assertIn("quantum_recommendation", result)
        self.assertIn("qaoa_telemetry", result)
        # ALS ambulance AMB-02 preferred for critical cardiac incident
        self.assertEqual(result["quantum_recommendation"]["selected_ambulance_id"], "AMB-02")

if __name__ == "__main__":
    unittest.main()
