from typing import Dict, Any, List
from market.services import MarketIntelligenceService

class BaseScoringService:
    """Base class for all scoring services."""
    def format_result(self, score: float, factors: Dict[str, Any], data_sources: List[str], explanation: str, confidence: float) -> Dict[str, Any]:
        return {
            "score": round(max(0, min(100, score)), 2),
            "factors": factors,
            "data_sources": data_sources,
            "explanation": explanation,
            "confidence": round(confidence, 2)
        }

class MarketReachService(BaseScoringService):
    def calculate(self, lat: float, lng: float, radius: float, estimated_project_size: float) -> Dict[str, Any]:
        # Mock calculation: In reality, we'd query demographic data.
        # Assume a base population density of 500 per sq km for now.
        area = 3.14159 * (radius ** 2)
        estimated_population = area * 500 
        
        # Determine if the market reach is sufficient for the project size
        # Very rough heuristic: Project needs 10x its size in local population to be highly feasible.
        ratio = estimated_population / (estimated_project_size or 1)
        
        if ratio > 100:
            score = 95.0
            explanation = "Excellent market reach. The accessible population greatly exceeds project requirements."
        elif ratio > 10:
            score = 75.0
            explanation = "Good market reach. The accessible population is sufficient to sustain the project."
        else:
            score = 40.0
            explanation = "Limited market reach. The local population may not be large enough to support the business."
            
        return self.format_result(
            score=score,
            factors={"estimated_population": estimated_population, "project_size": estimated_project_size},
            data_sources=["Deterministic Estimation (Radius based)"],
            explanation=explanation,
            confidence=0.7
        )

class CompetitionService(BaseScoringService):
    def calculate(self, lat: float, lng: float, radius: float, category: str) -> Dict[str, Any]:
        density_data = MarketIntelligenceService.calculate_competitor_density(lat, lng, radius, category)
        count = density_data['competitor_count']
        density = density_data['density_per_sq_km']
        
        if count == 0:
            score = 90.0
            explanation = "No direct competitors found in the selected radius. High opportunity, but could indicate lack of established market."
        elif density < 0.5:
            score = 75.0
            explanation = "Low competition density. Favorable environment for new entrants."
        elif density < 2.0:
            score = 50.0
            explanation = "Moderate competition. The market has established players, differentiation will be necessary."
        else:
            score = 30.0
            explanation = "High competition density. The market is saturated. Significant risk for new entrants."

        return self.format_result(
            score=score,
            factors={"competitor_count": count, "density_per_sq_km": density},
            data_sources=["Hyper-Local Market Aggregation"],
            explanation=explanation,
            confidence=0.9
        )

class OpportunityService(BaseScoringService):
    def calculate(self, lat: float, lng: float, category: str) -> Dict[str, Any]:
        # Mock calculation: A more advanced version would pull from 'service_business_gap' in MarketAnalysis
        score = 65.0
        return self.format_result(
            score=score,
            factors={"supply_demand_gap_estimate": "moderate"},
            data_sources=["Macro-economic heuristics"],
            explanation="Moderate opportunity based on regional supply-demand heuristics.",
            confidence=0.6
        )

class RiskService(BaseScoringService):
    def calculate(self, category: str) -> Dict[str, Any]:
        # Look up generic risks for the category.
        # For MVP, we use static deductions based on category.
        high_risk_categories = ['Agriculture', 'Livestock'] # e.g. climate dependent
        medium_risk_categories = ['Manufacturing', 'Food Processing']
        
        if category in high_risk_categories:
            score = 40.0 # High risk = lower score
            explanation = f"High operational risk profile for {category} due to external dependencies (e.g., climate, supply chain)."
        elif category in medium_risk_categories:
            score = 65.0
            explanation = f"Medium operational risk profile for {category}. Requires strict quality control."
        else:
            score = 85.0
            explanation = f"Lower relative operational risk for {category}."
            
        return self.format_result(
            score=score,
            factors={"category_risk_tier": "HIGH" if score==40 else "MEDIUM" if score==65 else "LOW"},
            data_sources=["Domain Expert Heuristics"],
            explanation=explanation,
            confidence=0.8
        )

class PricingService(BaseScoringService):
    def calculate(self, category: str, assumed_price: float = None) -> Dict[str, Any]:
        score = 70.0
        explanation = "Pricing alignment check is deferred until specific product SKUs are provided."
        return self.format_result(
            score=score,
            factors={"assumed_price": assumed_price},
            data_sources=["Pricing API"],
            explanation=explanation,
            confidence=0.5
        )

class FeasibilityScoringService:
    # Defined Weights
    WEIGHTS = {
        'competition': 0.30,
        'market_reach': 0.25,
        'opportunity': 0.20,
        'risk': 0.15,
        'pricing': 0.10
    }

    def __init__(self):
        self.competition_service = CompetitionService()
        self.market_reach_service = MarketReachService()
        self.opportunity_service = OpportunityService()
        self.risk_service = RiskService()
        self.pricing_service = PricingService()

    def analyze(self, lat: float, lng: float, radius: float, category: str, project_size: float = 100000, simulation_overrides: Dict[str, Any] = None) -> Dict[str, Any]:
        """Orchestrates all scoring services and calculates the weighted overall feasibility."""
        
        sim_price = None
        if simulation_overrides:
            sim_price = simulation_overrides.get('selling_price')
            
        comp_result = self.competition_service.calculate(lat, lng, radius, category)
        reach_result = self.market_reach_service.calculate(lat, lng, radius, project_size)
        opp_result = self.opportunity_service.calculate(lat, lng, category)
        risk_result = self.risk_service.calculate(category)
        price_result = self.pricing_service.calculate(category, assumed_price=sim_price)

        overall_score = (
            comp_result['score'] * self.WEIGHTS['competition'] +
            reach_result['score'] * self.WEIGHTS['market_reach'] +
            opp_result['score'] * self.WEIGHTS['opportunity'] +
            risk_result['score'] * self.WEIGHTS['risk'] +
            price_result['score'] * self.WEIGHTS['pricing']
        )
        
        is_feasible = overall_score >= 60.0

        return {
            "overall_score": round(overall_score, 2),
            "is_feasible": is_feasible,
            "verdict": "Feasible" if is_feasible else "Not Feasible",
            "dimensions": {
                "competition": comp_result,
                "market_reach": reach_result,
                "opportunity": opp_result,
                "risk": risk_result,
                "pricing": price_result
            },
            "weights": self.WEIGHTS
        }
