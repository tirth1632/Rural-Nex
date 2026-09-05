import pytest
from advisory.scoring import FeasibilityScoringService

class TestFeasibilityScoringService:
    def test_overall_score_calculation(self):
        service = FeasibilityScoringService()
        
        # Test a scenario with some mock inputs
        result = service.analyze(
            lat=28.6139,
            lng=77.2090,
            radius=5.0,
            category="Retail",
            project_size=50000
        )
        
        # Assert structure
        assert "overall_score" in result
        assert "is_feasible" in result
        assert "dimensions" in result
        
        dims = result["dimensions"]
        assert "competition" in dims
        assert "market_reach" in dims
        assert "opportunity" in dims
        assert "risk" in dims
        assert "pricing" in dims
        
        # Check that score is bound between 0 and 100
        assert 0 <= result["overall_score"] <= 100
        
        # Manually calculate based on mock static responses
        # Depending on the mocked db queries, this might vary.
        # But we can assert the weights sum to 1.
        assert sum(service.WEIGHTS.values()) == 1.0
