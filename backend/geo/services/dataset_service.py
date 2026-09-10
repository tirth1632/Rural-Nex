import math
import sys
import os
from typing import Dict, Any, List
from django.db.models import Avg, Sum, Count

# Ensure root dir is in sys.path for data package imports
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from geo.models import (

    DatasetLocation, DatasetRouting, GroundwaterRecord,
    RuralWageRecord, AsuseEnterpriseRecord, EconomicIndexRecord,
    InfrastructureCoopRecord, MicroEnterpriseSkillRecord, WholesaleArrivalRecord
)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth in kilometers."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class DatasetAnalyticsService:
    @staticmethod
    def get_dynamic_hierarchy() -> Dict[str, Any]:
        """Returns dynamic hierarchical location tree derived from DB or DataEngine."""
        states = list(DatasetLocation.objects.values_list('state', flat=True).distinct().order_by('state'))
        states = [s for s in states if s]
        hierarchy = {}

        if not states:
            from data.services.data_engine import DataEngine
            engine = DataEngine.get_instance()
            states = engine.get_states()
            for st in states:
                hierarchy[st] = engine.get_districts(st)
        else:
            for st in states:
                districts = list(DatasetLocation.objects.filter(state=st).values_list('district', flat=True).distinct().order_by('district'))
                hierarchy[st] = [d for d in districts if d]

        return {
            "states": states,
            "hierarchy": hierarchy
        }

    @staticmethod
    def get_districts_for_state(state_name: str) -> List[Dict[str, Any]]:
        """Returns districts for a given state with lat/lng centroid."""
        qs = DatasetLocation.objects.filter(state__iexact=state_name)
        districts = qs.values('district').annotate(
            avg_lat=Avg('latitude'),
            avg_lng=Avg('longitude'),
            count=Count('id')
        ).order_by('district')
        
        result = [
            {
                "name": d['district'],
                "lat": round(d['avg_lat'], 5) if d['avg_lat'] else None,
                "lng": round(d['avg_lng'], 5) if d['avg_lng'] else None,
                "village_count": d['count']
            }
            for d in districts if d['district']
        ]

        if not result:
            from data.services.data_engine import DataEngine
            engine = DataEngine.get_instance()
            d_names = engine.get_districts(state_name)
            result = [
                {
                    "name": d,
                    "lat": None,
                    "lng": None,
                    "village_count": len(engine.get_villages(state_name, d))
                }
                for d in d_names
            ]

        return result

    @staticmethod
    def get_blocks_for_district(state_name: str, district_name: str) -> List[str]:
        """Returns blocks/talukas for a state & district."""
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        return engine.get_blocks(state_name, district_name)

    @staticmethod
    def get_villages_for_district(state_name: str, district_name: str, block_name: str = None) -> List[Dict[str, Any]]:
        """Returns villages/localities for a state, district, and optional block."""
        qs = DatasetLocation.objects.filter(state__iexact=state_name, district__iexact=district_name)
        if block_name:
            qs = qs.filter(taluka_sub_district__iexact=block_name)

        result = [
            {
                "village_code": v.village_code,
                "village": v.village,
                "taluka": v.taluka_sub_district,
                "area_locality": v.area_locality,
                "lat": v.latitude,
                "lng": v.longitude,
                "population": v.population
            }
            for v in qs[:100]
        ]

        if not result:
            from data.services.data_engine import DataEngine
            engine = DataEngine.get_instance()
            geo_items = engine.filter_master_geo(state=state_name, district=district_name, block=block_name)
            result = [
                {
                    "village_code": item.get("village_code") or idx + 1,
                    "village": item.get("normalized_village") or item.get("village") or "Village",
                    "taluka": item.get("normalized_block") or item.get("taluka_sub_district") or "Block",
                    "area_locality": item.get("area_locality") or "",
                    "lat": item.get("latitude"),
                    "lng": item.get("longitude"),
                    "population": item.get("population") or 1845
                }
                for idx, item in enumerate(geo_items[:100])
            ]

        return result


    @staticmethod
    def radius_search(center_lat: float, center_lng: float, radius_km: float = 10.0, category: str = None) -> Dict[str, Any]:
        """Performs dynamic spatial radius search across all dataset models."""
        radius_km = max(10.0, float(radius_km)) # Minimum 10km radius as per specification
        
        # 1. Spatial filter on DatasetLocation
        # Bounding box initial filter for performance
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(0.2, math.cos(math.radians(center_lat))))
        
        candidates = DatasetLocation.objects.filter(
            latitude__gte=center_lat - lat_delta,
            latitude__lte=center_lat + lat_delta,
            longitude__gte=center_lng - lng_delta,
            longitude__lte=center_lng + lng_delta
        )

        in_radius_locations = []
        village_codes = []
        total_population = 0
        state_names = set()
        district_names = set()

        for loc in candidates:
            dist = haversine_distance(center_lat, center_lng, loc.latitude, loc.longitude)
            if dist <= radius_km:
                village_codes.append(loc.village_code)
                total_population += loc.population
                state_names.add(loc.state)
                district_names.add(loc.district)
                in_radius_locations.append({
                    "village_code": loc.village_code,
                    "state": loc.state,
                    "district": loc.district,
                    "village": loc.village,
                    "area_locality": loc.area_locality,
                    "lat": loc.latitude,
                    "lng": loc.longitude,
                    "distance_km": round(dist, 2),
                    "population": loc.population
                })

        in_radius_locations.sort(key=lambda x: x['distance_km'])

        primary_state = list(state_names)[0] if state_names else "Gujarat"
        primary_district = list(district_names)[0] if district_names else "Anand"

        # 2. Fetch Routing / Accessibility data for these villages
        routings = DatasetRouting.objects.filter(village_code__in=village_codes)
        avg_road_dist = routings.aggregate(Avg('road_distance_km'))['road_distance_km__avg'] or 12.4
        avg_travel_time = routings.aggregate(Avg('travel_time_minutes'))['travel_time_minutes__avg'] or 28
        min_highway_dist = routings.aggregate(Avg('nearest_highway_distance_km'))['nearest_highway_distance_km__avg'] or 5.2
        min_mandi_dist = routings.aggregate(Avg('nearest_mandi_distance_km'))['nearest_mandi_distance_km__avg'] or 7.8
        min_railway_dist = routings.aggregate(Avg('nearest_railway_station_km'))['nearest_railway_station_km__avg'] or 6.1

        # 3. Fetch Groundwater DTWL (Depth to water level in meters)
        gw_candidates = GroundwaterRecord.objects.filter(
            latitude__gte=center_lat - lat_delta,
            latitude__lte=center_lat + lat_delta,
            longitude__gte=center_lng - lng_delta,
            longitude__lte=center_lng + lng_delta
        )
        near_gw = [
            gw.dtwl_meters for gw in gw_candidates
            if haversine_distance(center_lat, center_lng, gw.latitude, gw.longitude) <= radius_km
        ]
        avg_dtwl_meters = round(sum(near_gw) / len(near_gw), 2) if near_gw else 8.50

        # 4. Fetch Rural Wages for Primary State
        wages = RuralWageRecord.objects.filter(state__iexact=primary_state)
        agri_wages = wages.filter(occupation__icontains='Agri')
        avg_wage_men = agri_wages.aggregate(Avg('wage_men'))['wage_men__avg'] or 420.0
        avg_wage_women = agri_wages.aggregate(Avg('wage_women'))['wage_women__avg'] or 340.0

        # 5. Fetch ASUSE Enterprise statistics
        asuse_qs = AsuseEnterpriseRecord.objects.filter(state_ut__iexact=primary_state)
        if category:
            asuse_qs = asuse_qs.filter(activity_category__icontains=category)
        enterprise_count = int(asuse_qs.aggregate(Sum('establishments_count'))['establishments_count__sum'] or 350)

        # 6. Fetch Micro-Enterprise Skill & Training Metrics
        micro_skill = MicroEnterpriseSkillRecord.objects.filter(state_ut__iexact=primary_state).first()
        candidates_trained = micro_skill.candidates_trained if micro_skill else 4500
        beneficiaries_assisted = micro_skill.beneficiaries_assisted if micro_skill else 1200

        # 7. Wholesale Market Arrivals (Telangana/Regional)
        wholesale_market = WholesaleArrivalRecord.objects.first()
        market_arrivals_mt = wholesale_market.arrival_current_mt if wholesale_market else 185.0

        return {
            "center": {"lat": center_lat, "lng": center_lng},
            "radius_km": radius_km,
            "primary_state": primary_state,
            "primary_district": primary_district,
            "summary": {
                "total_villages": len(in_radius_locations),
                "total_population": total_population,
                "density_per_sq_km": round(total_population / (3.14159 * (radius_km ** 2)), 1),
                "avg_road_distance_km": round(avg_road_dist, 2),
                "avg_travel_time_minutes": round(avg_travel_time, 1),
                "nearest_highway_distance_km": round(min_highway_dist, 2),
                "nearest_mandi_distance_km": round(min_mandi_dist, 2),
                "nearest_railway_station_km": round(min_railway_dist, 2),
                "groundwater_dtwl_meters": avg_dtwl_meters,
                "rural_daily_wage_men_rs": round(avg_wage_men, 2),
                "rural_daily_wage_women_rs": round(avg_wage_women, 2),
                "estimated_enterprises_in_state": enterprise_count,
                "skilled_candidates_trained_state": candidates_trained,
                "micro_enterprises_assisted_state": beneficiaries_assisted,
                "wholesale_market_arrival_mt": market_arrivals_mt
            },
            "locations": in_radius_locations[:250]
        }

    @staticmethod
    def get_available_business_categories() -> List[str]:
        """Returns unique enterprise categories dynamically from ASUSE dataset."""
        cats = list(AsuseEnterpriseRecord.objects.values_list('activity_category', flat=True).distinct())
        clean_cats = sorted(list(set([c for c in cats if c])))
        if not clean_cats:
            clean_cats = [
                'Food Processing & Agribusiness',
                'Retail Trade & General Store',
                'Dairy & Livestock Support',
                'Handloom & Handicrafts',
                'Farm Equipment & Repair Services',
                'Textile & Garment Manufacturing'
            ]
        return clean_cats
