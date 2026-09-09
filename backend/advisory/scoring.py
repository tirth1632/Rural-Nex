from typing import Dict, Any, List
from geo.services.dataset_service import DatasetAnalyticsService

class DataDrivenSuitabilityEngine:
    """
    Transparent Data-Driven Suitability & Recommendation Engine.
    Dynamically computes factor weights based on:
    - Business Category / Sector Profile (Agri, Retail, Manufacturing, Services, General)
    - Area Geospatial Context (Remote Rural vs Peri-Urban Density)
    """

    @staticmethod
    def _compute_weights_and_rationale(category: str, road_dist: float, mandi_dist: float, pop: float, dtwl: float = 8.5, wage: float = 420.0, enterprises: int = 350) -> Dict[str, Any]:
        cat_lower = (category or '').lower()
        
        # 1. Determine Base Sector Profile & Weights with Concrete Dataset Metrics
        if any(w in cat_lower for w in ['agri', 'dairy', 'food', 'livestock', 'crop', 'farm', 'fishery', 'poultry', 'grain', 'atta']):
            profile_name = f"Agri-Processing & Resource Intensive ({category})"
            w_demand, w_access, w_labor, w_water, w_comp = 0.20, 0.25, 0.15, 0.25, 0.15
            summary_rationale = f"High weight allocated to Water (25%) and Logistics (25%) because {category} enterprises require significant water resources ({dtwl}m DTWL) and rapid mandi logistics ({mandi_dist}km)."
            rationale_map = {
                "resource_water": f"25% Weight: Critical for crop/livestock processing and washing. Water table is at {dtwl}m depth (groundwater_jan2026.csv).",
                "accessibility": f"25% Weight: Essential for rapid mandi logistics (nearest mandi is {mandi_dist}km away, avg road distance is {road_dist}km from Routing.xlsx).",
                "demand": f"20% Weight: Products target both regional wholesale distributors and {pop:,} residents within radius (Population.xlsx).",
                "labor": f"15% Weight: Seasonal workforce cost calculated against regional daily labor rate of ₹{wage}/day (Rural Wages.csv).",
                "competition": f"15% Weight: Evaluates competitive density against {enterprises} estimated registered sector units in the state (asuse_1.xlsx)."
            }

        elif any(w in cat_lower for w in ['retail', 'general store', 'kirana', 'supermarket', 'pharmacy', 'shop', 'bakery', 'restaurant', 'cafe', 'garment', 'apparel', 'electronics', 'mobile']):
            profile_name = f"Retail & B2C Consumer Store ({category})"
            w_demand, w_access, w_labor, w_water, w_comp = 0.40, 0.20, 0.15, 0.05, 0.20
            summary_rationale = f"High weight allocated to Population Catchment (40%) and Competitor Density (20%) because retail store revenue is directly driven by consumer footfall from {pop:,} local residents."
            rationale_map = {
                "demand": f"40% Weight: Direct customer footfall & revenue depend on the {pop:,} residents living within the spatial radius (Population.xlsx).",
                "competition": f"20% Weight: Prevents store over-saturation against {enterprises} registered retail establishments in the state (asuse_1.xlsx).",
                "accessibility": f"20% Weight: Shopper transit accessibility (average road distance: {road_dist}km from Routing.xlsx).",
                "labor": f"15% Weight: Shop assistant overhead evaluated against regional daily labor wage rate of ₹{wage}/day (Rural Wages.csv).",
                "resource_water": f"5% Weight: Low operational utility water requirement (current water depth: {dtwl}m DTWL)."
            }

        elif any(w in cat_lower for w in ['manufacturing', 'fabrication', 'workshop', 'cement', 'wood', 'textile', 'chemical', 'mill', 'brick', 'metal']):
            profile_name = f"Manufacturing & Production Unit ({category})"
            w_demand, w_access, w_labor, w_water, w_comp = 0.10, 0.25, 0.30, 0.15, 0.20
            summary_rationale = f"High weight allocated to Labor Wage Index (30%) and Heavy Freight Logistics (25%) as production unit profit margins depend heavily on worker wages (₹{wage}/day) and road freight ({road_dist}km)."
            rationale_map = {
                "labor": f"30% Weight: Production unit profit margins depend directly on regional daily labor wages (₹{wage}/day from Rural Wages.csv).",
                "accessibility": f"25% Weight: Heavy freight road access for raw material inflow & product shipping (avg road: {road_dist}km from Routing.xlsx).",
                "competition": f"20% Weight: Regional industrial cluster supply dynamics across {enterprises} registered units (asuse_1.xlsx).",
                "resource_water": f"15% Weight: Industrial process cooling & cleaning requirements (water table: {dtwl}m DTWL).",
                "demand": f"10% Weight: B2B products are distributed across district/state markets, not limited to immediate radius ({pop:,} pop)."
            }

        elif any(w in cat_lower for w in ['it', 'software', 'coaching', 'cyber', 'service', 'repair', 'beauty', 'salon', 'clinic', 'hospital', 'medical']):
            profile_name = f"Skilled Services & Healthcare ({category})"
            w_demand, w_access, w_labor, w_water, w_comp = 0.35, 0.20, 0.25, 0.05, 0.15
            summary_rationale = f"High weight allocated to Client Catchment (35%) and Skilled Workforce (25%) for service provider reach across {pop:,} residents."
            rationale_map = {
                "demand": f"35% Weight: Client catchment base size of {pop:,} residents across local dataset villages (Population.xlsx).",
                "labor": f"25% Weight: Availability of skilled technicians & staff evaluated against daily labor rate of ₹{wage}/day.",
                "accessibility": f"20% Weight: Client transit ease (average road distance: {road_dist}km from Routing.xlsx).",
                "competition": f"15% Weight: Service provider density gap analysis against {enterprises} state units (asuse_1.xlsx).",
                "resource_water": f"5% Weight: Minimal natural resource utility footprint (water table: {dtwl}m DTWL)."
            }

        else:
            profile_name = f"General Commercial Enterprise ({category})"
            w_demand, w_access, w_labor, w_water, w_comp = 0.25, 0.25, 0.20, 0.15, 0.15
            summary_rationale = f"Balanced 5-factor weight matrix applied across {pop:,} population catchment, {road_dist}km road access, and ₹{wage}/day labor rate."
            rationale_map = {
                "demand": f"25% Weight: Population catchment of {pop:,} residents (Population.xlsx).",
                "accessibility": f"25% Weight: Road & market hub proximity (avg road: {road_dist}km, mandi: {mandi_dist}km from Routing.xlsx).",
                "labor": f"20% Weight: Operational staffing costs based on daily labor rate of ₹{wage}/day (Rural Wages.csv).",
                "resource_water": f"15% Weight: Utility water depth of {dtwl}m DTWL (groundwater_jan2026.csv).",
                "competition": f"15% Weight: Enterprise density analysis across {enterprises} state establishments (asuse_1.xlsx)."
            }

        # 2. Dynamic Area-Based Weight Adjustments (Remote Rural vs Dense Catchment)
        if road_dist > 10.0 or mandi_dist > 12.0:
            w_access = round(w_access + 0.05, 2)
            w_demand = round(max(0.05, w_demand - 0.05), 2)
            summary_rationale += f" [Area Shift: +5% Logistics Weight added because road distance ({road_dist}km) or mandi distance ({mandi_dist}km) is high]."
            rationale_map["accessibility"] += f" (+5% Area Shift added due to long distance of {road_dist}km)."

        elif pop > 30000:
            w_demand = round(w_demand + 0.05, 2)
            w_water = round(max(0.05, w_water - 0.05), 2)
            summary_rationale += f" [Area Shift: +5% Population Weight added due to high catchment density of {pop:,} residents]."
            rationale_map["demand"] += f" (+5% Area Shift added for high population density of {pop:,})."

        # Normalize weights so sum strictly equals 1.00
        total_w = w_demand + w_access + w_labor + w_water + w_comp
        w_demand = round(w_demand / total_w, 2)
        w_access = round(w_access / total_w, 2)
        w_labor = round(w_labor / total_w, 2)
        w_water = round(w_water / total_w, 2)
        w_comp = round(1.0 - (w_demand + w_access + w_labor + w_water), 2)

        return {
            "profile_name": profile_name,
            "weights": {
                "demand": w_demand,
                "accessibility": w_access,
                "labor": w_labor,
                "resource_water": w_water,
                "competition": w_comp
            },
            "weight_percents": {
                "demand": int(round(w_demand * 100)),
                "accessibility": int(round(w_access * 100)),
                "labor": int(round(w_labor * 100)),
                "resource_water": int(round(w_water * 100)),
                "competition": int(round(w_comp * 100))
            },
            "rationale": {
                "summary": summary_rationale,
                "factors": rationale_map
            }
        }

    @staticmethod
    def analyze_suitability(lat: float, lng: float, radius: float = 10.0, category: str = "General") -> Dict[str, Any]:
        data_res = DatasetAnalyticsService.radius_search(lat, lng, radius, category)
        summary = data_res.get('summary', {})
        primary_state = data_res.get('primary_state', 'Gujarat')
        primary_district = data_res.get('primary_district', 'Anand')

        pop = summary.get('total_population', 15000)
        road_dist = summary.get('avg_road_distance_km', 10.0)
        mandi_dist = summary.get('nearest_mandi_distance_km', 8.0)
        dtwl = summary.get('groundwater_dtwl_meters', 8.5)
        wage = summary.get('rural_daily_wage_men_rs', 420.0)
        enterprises = summary.get('estimated_enterprises_in_state', 350)

        # 1. Compute Dynamic Factor Sub-Scores (0 to 100)
        demand_score = min(98.0, max(30.0, (pop / 20000.0) * 100))
        access_score = min(95.0, max(25.0, 100.0 - (road_dist * 2.0 + mandi_dist * 2.5)))
        labor_score = min(92.0, max(40.0, 100.0 - ((wage - 300) / 10.0)))

        if any(w in (category or '').lower() for w in ['agri', 'dairy', 'food', 'livestock', 'crop', 'farm']):
            water_score = min(95.0, max(20.0, 100.0 - (dtwl * 4.5)))
        else:
            water_score = 80.0

        comp_score = min(90.0, max(35.0, 85.0 - (enterprises / 500.0)))

        # 2. Compute Dynamic Category & Area-Dependent Weights
        weight_meta = DataDrivenSuitabilityEngine._compute_weights_and_rationale(category, road_dist, mandi_dist, pop, dtwl, wage, enterprises)
        w = weight_meta["weights"]

        # 3. Calculate Overall Weighted Score
        overall_score = round(
            demand_score * w["demand"] +
            access_score * w["accessibility"] +
            labor_score * w["labor"] +
            water_score * w["resource_water"] +
            comp_score * w["competition"],
            2
        )

        is_feasible = overall_score >= 55.0

        reasons = [
            f"Population within {radius}km radius: {pop:,} residents across {summary.get('total_villages', 1)} dataset locations.",
            f"Road accessibility: average road distance {road_dist} km, nearest mandi {mandi_dist} km.",
            f"Groundwater depth to water level (DTWL): {dtwl} meters.",
            f"Regional rural labor wage rate: ₹{wage}/day for agricultural/construction work.",
            f"Estimated industry enterprise presence in {primary_state}: {enterprises} establishments."
        ]

        return {
            "overall_score": overall_score,
            "is_feasible": is_feasible,
            "verdict": "Highly Suitable" if overall_score >= 75 else "Suitable" if overall_score >= 55 else "Risky / Limited Suitability",
            "category": category or "General Enterprise",
            "primary_state": primary_state,
            "primary_district": primary_district,
            "weight_profile": weight_meta,
            "dimensions": {
                "demand": {"score": round(demand_score, 1), "population": pop, "villages": summary.get('total_villages', 1), "weight": w["demand"], "weight_pct": weight_meta["weight_percents"]["demand"]},
                "accessibility": {"score": round(access_score, 1), "avg_road_km": road_dist, "nearest_mandi_km": mandi_dist, "weight": w["accessibility"], "weight_pct": weight_meta["weight_percents"]["accessibility"]},
                "labor": {"score": round(labor_score, 1), "daily_wage_rs": wage, "weight": w["labor"], "weight_pct": weight_meta["weight_percents"]["labor"]},
                "resource_water": {"score": round(water_score, 1), "dtwl_meters": dtwl, "weight": w["resource_water"], "weight_pct": weight_meta["weight_percents"]["resource_water"]},
                "competition": {"score": round(comp_score, 1), "state_enterprises": enterprises, "weight": w["competition"], "weight_pct": weight_meta["weight_percents"]["competition"]}
            },
            "reasons": reasons,
            "data_sources": [
                "Location.xlsx & Population.xlsx",
                "Routing.xlsx",
                "groundwater_jan2026.csv",
                "Rural Wages.csv",
                "asuse_1.xlsx",
                "6. BUSINESSES.csv"
            ]
        }

class FeasibilityScoringService:
    def __init__(self):
        self.engine = DataDrivenSuitabilityEngine()

    def analyze(self, lat: float, lng: float, radius: float, category: str, project_size: float = 100000, simulation_overrides: Dict[str, Any] = None) -> Dict[str, Any]:
        return self.engine.analyze_suitability(lat, lng, radius, category)

