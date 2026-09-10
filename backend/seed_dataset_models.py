import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import pandas as pd
from geo.models import (
    DatasetLocation, DatasetRouting, GroundwaterRecord,
    RuralWageRecord, AsuseEnterpriseRecord, EconomicIndexRecord,
    InfrastructureCoopRecord, MicroEnterpriseSkillRecord, WholesaleArrivalRecord
)
from data.services.data_engine import DataEngine, parse_float, parse_int, normalize_state, normalize_text

def seed_all():
    print("Starting Django Database Seeding from /data/raw...")
    engine = DataEngine.get_instance()
    
    # 1. Seed DatasetLocation & DatasetRouting
    if engine.master_geo_df is not None:
        print("Seeding DatasetLocation & DatasetRouting...")
        df = engine.master_geo_df
        loc_objs = []
        route_objs = []
        
        # Clear existing
        DatasetLocation.objects.all().delete()
        DatasetRouting.objects.all().delete()
        
        for _, row in df.iterrows():
            vcode = parse_int(row['village_code'])
            if not vcode: continue
            
            loc = DatasetLocation(
                village_code=vcode,
                state=row['normalized_state'],
                district=row['normalized_district'],
                taluka_sub_district=row['normalized_block'],
                village=row['normalized_village'],
                area_locality=normalize_text(row.get('area_locality', '')),
                district_code=parse_int(row.get('district_code')),
                state_code=parse_int(row.get('state_code')),
                latitude=float(row['latitude']),
                longitude=float(row['longitude']),
                population=parse_int(row.get('population')) or 1845
            )
            loc_objs.append(loc)
            
            if 'straight_line_distance_km' in row:
                route = DatasetRouting(
                    village_code=vcode,
                    village_name=row['normalized_village'],
                    straight_line_distance_km=parse_float(row.get('straight_line_distance_km')) or 0.0,
                    road_distance_km=parse_float(row.get('road_distance_km')) or 0.0,
                    travel_time_minutes=parse_int(row.get('travel_time_minutes')) or 0,
                    nearest_highway_distance_km=parse_float(row.get('nearest_highway_distance_km')) or 0.0,
                    nearest_mandi_distance_km=parse_float(row.get('nearest_mandi_distance_km')) or 0.0,
                    nearest_railway_station_km=parse_float(row.get('nearest_railway_station_km')) or 0.0,
                    accessibility_rating=normalize_text(row.get('accessibility_rating')) or 'Medium'
                )
                route_objs.append(route)

        DatasetLocation.objects.bulk_create(loc_objs, batch_size=1000)
        DatasetRouting.objects.bulk_create(route_objs, batch_size=1000)
        print(f"Seeded {len(loc_objs)} Locations and {len(route_objs)} Routing records.")

    # 2. Seed GroundwaterRecord
    if engine.groundwater_df is not None:
        print("Seeding GroundwaterRecord...")
        GroundwaterRecord.objects.all().delete()
        gw_objs = []
        for _, row in engine.groundwater_df.iterrows():
            dtwl = row['dtwl']
            lat = row['lat']
            lng = row['lng']
            if dtwl is None or lat is None or lng is None: continue
            
            gw = GroundwaterRecord(
                state_ut=row['normalized_state'],
                district=row['normalized_district'],
                block=row['normalized_block'],
                village=row['normalized_village'],
                latitude=lat,
                longitude=lng,
                date_recorded=normalize_text(row.get('DATE', '')),
                dtwl_meters=dtwl
            )
            gw_objs.append(gw)
        GroundwaterRecord.objects.bulk_create(gw_objs, batch_size=2000)
        print(f"Seeded {len(gw_objs)} Groundwater records.")

    # 3. Seed RuralWageRecord
    if "rural_wages" in engine.raw_dfs and "default" in engine.raw_dfs["rural_wages"]:
        print("Seeding RuralWageRecord...")
        RuralWageRecord.objects.all().delete()
        df = engine.raw_dfs["rural_wages"]["default"]
        rw_objs = []
        for _, row in df.iterrows():
            rw = RuralWageRecord(
                year=normalize_text(row.get('Year', '')),
                month=normalize_text(row.get('Month', '')),
                state=normalize_state(row.get('State', '')),
                occupation=normalize_text(row.get('Occupation', '')),
                item=normalize_text(row.get('Item', '')),
                wage_men=parse_float(row.get('Men')),
                wage_women=parse_float(row.get('Women'))
            )
            rw_objs.append(rw)
        RuralWageRecord.objects.bulk_create(rw_objs, batch_size=1000)
        print(f"Seeded {len(rw_objs)} RuralWage records.")

    # 4. Seed MicroEnterpriseSkillRecord (6. BUSINESSES.csv)
    if "businesses" in engine.raw_dfs and "default" in engine.raw_dfs["businesses"]:
        print("Seeding MicroEnterpriseSkillRecord...")
        MicroEnterpriseSkillRecord.objects.all().delete()
        df = engine.raw_dfs["businesses"]["default"]
        b_objs = []
        for _, row in df.iterrows():
            b = MicroEnterpriseSkillRecord(
                state_ut=normalize_state(row.get('State/UT')),
                candidates_trained=parse_int(row.get('Number of Candidates Skill Trained')) or 0,
                candidates_placed=parse_int(row.get('Number of Skilled Candidates Placed')) or 0,
                beneficiaries_assisted=parse_int(row.get('Number of Beneficiaries assisted for setting up Individual/Group Micro Enterprises')) or 0
            )
            b_objs.append(b)
        MicroEnterpriseSkillRecord.objects.bulk_create(b_objs)
        print(f"Seeded {len(b_objs)} MicroEnterpriseSkill records.")

    # 5. Seed AsuseEnterpriseRecord (asuse_1.xlsx)
    if "asuse" in engine.raw_dfs and "Sheet1" in engine.raw_dfs["asuse"]:
        print("Seeding AsuseEnterpriseRecord...")
        AsuseEnterpriseRecord.objects.all().delete()
        df = engine.raw_dfs["asuse"]["Sheet1"]
        a_objs = []
        for _, row in df.iterrows():
            a = AsuseEnterpriseRecord(
                indicator=normalize_text(row.get('indicator')),
                frequency=normalize_text(row.get('frequency', 'Annually')),
                year=normalize_text(row.get('year', '2025')),
                state_ut=normalize_state(row.get('state/UT')),
                sector=normalize_text(row.get('sector', 'Rural')),
                activity_category=normalize_text(row.get('activity_category')),
                establishment_type=normalize_text(row.get('establishment_type')),
                establishments_count=parse_float(row.get('value')) or 0.0
            )
            a_objs.append(a)
        AsuseEnterpriseRecord.objects.bulk_create(a_objs, batch_size=1000)
        print(f"Seeded {len(a_objs)} AsuseEnterprise records.")

    print("All dataset models successfully seeded in Django DB!")

if __name__ == "__main__":
    seed_all()
