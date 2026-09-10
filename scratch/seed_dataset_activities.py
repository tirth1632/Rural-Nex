import os
import sys
import json
import pandas as pd

# Add backend directory to sys.path
backend_dir = os.path.join(os.getcwd(), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from finance.models import BusinessActivity, ActivityDriverTemplate, BusinessSector
from django.core.management import call_command

# Seed standard financial engine schemes first
call_command('seed_finance_schemes')

# Load raw datasets
df_asuse = pd.read_excel('data/raw/asuse_1.xlsx')
df_live = pd.read_csv('data/raw/LIVESTOCK.csv')
df_biz = pd.read_csv('data/raw/6. BUSINESSES.csv')
df_infra = pd.read_csv('data/raw/INFRASTRUCTURE.csv')

asuse_cats = [c for c in df_asuse['activity_category'].unique() if c != 'All']

def map_icon(name, sector):
    nl = name.lower()
    if 'dairy' in nl or 'milk' in nl: return 'Milk'
    if 'poultry' in nl or 'egg' in nl or 'bird' in nl or 'chick' in nl: return 'Egg'
    if 'animal' in nl or 'livestock' in nl or 'swine' in nl or 'horse' in nl or 'sheep' in nl or 'goat' in nl: return 'Cat'
    if 'feed' in nl or 'fodder' in nl or 'residue' in nl: return 'Wheat'
    if 'meat' in nl or 'offal' in nl: return 'Beef'
    if 'food' in nl or 'beverage' in nl: return 'Utensils'
    if 'textile' in nl or 'wearing' in nl or 'apparel' in nl or 'cotton' in nl or 'wool' in nl or 'yarn' in nl: return 'Scissors'
    if 'leather' in nl or 'footwear' in nl or 'hide' in nl or 'skin' in nl: return 'ShoppingBag'
    if 'wood' in nl or 'paper' in nl or 'printing' in nl or 'furniture' in nl: return 'Package'
    if 'metal' in nl or 'machinery' in nl or 'equipment' in nl or 'repair' in nl: return 'Wrench'
    if 'computer' in nl or 'electronic' in nl or 'electrical' in nl or 'information' in nl: return 'Cpu'
    if 'motor' in nl or 'transport' in nl or 'land' in nl or 'water' in nl or 'warehousing' in nl: return 'Truck'
    if 'retail' in nl or 'trade' in nl or 'wholesale' in nl: return 'Store'
    if 'accommodation' in nl or 'hotel' in nl: return 'Building'
    if 'health' in nl or 'medical' in nl: return 'HeartPulse'
    if 'education' in nl: return 'GraduationCap'
    if 'financial' in nl or 'real estate' in nl or 'pacs' in nl or 'credit' in nl or 'society' in nl: return 'Landmark'
    if sector == BusinessSector.MANUFACTURING or sector == 'MANUFACTURING': return 'Factory'
    if sector == BusinessSector.RETAIL or sector == 'RETAIL': return 'ShoppingCart'
    if sector == BusinessSector.SERVICE or sector == 'SERVICE': return 'Briefcase'
    return 'Building2'

activities_master = []
sort_order = 10

# 1. ASUSE Categories
for cat in asuse_cats:
    cat_l = cat.lower()
    if any(k in cat_l for k in ['cotton', 'food products', 'beverages', 'tobacco', 'textile', 'wearing apparel', 'leather', 'wood', 'paper', 'printing', 'coke', 'chemical', 'pharmaceutical', 'rubber', 'non-metallic', 'metal', 'computer', 'electrical', 'machinery', 'motor vehicles', 'transport equipment', 'furniture', 'manufacturing']):
        sector_enum = BusinessSector.MANUFACTURING
        sector_disp = 'Manufacturing & Processing'
    elif any(k in cat_l for k in ['trade', 'motor cycles', 'wholesale', 'retail', 'trading']):
        sector_enum = BusinessSector.RETAIL
        sector_disp = 'Wholesale & Retail Trade'
    else:
        sector_enum = BusinessSector.SERVICE
        sector_disp = 'Services & Logistics'

    sub_r = df_asuse[(df_asuse['activity_category'] == cat) & (df_asuse['establishments'] == 'Estimated No. of Establishments') & (df_asuse['state/UT'] == 'All India') & (df_asuse['sector'] == 'Rural') & (df_asuse['establishment_type'] == 'All Establishments(All)')]
    r_val = int(sub_r['value'].sum()) if len(sub_r) > 0 else 0

    code = f'asuse_{sort_order:03d}'

    rel_ds = ['Population', 'Rural Wages', 'Infrastructure']
    if sector_enum == BusinessSector.MANUFACTURING:
        rel_ds.extend(['Groundwater', 'Marketwise Wholesale Arrivals'])
    elif sector_enum == BusinessSector.RETAIL:
        rel_ds.extend(['Routing', 'GIS Location'])
    elif sector_enum == BusinessSector.SERVICE:
        rel_ds.extend(['Routing', 'GIS Location'])

    act_obj = {
        'id': sort_order,
        'code': code,
        'name': cat,
        'category': sector_disp,
        'sector': sector_enum,
        'icon': map_icon(cat, sector_enum),
        'unit_of_measurement': 'Units / Batches' if sector_enum == BusinessSector.MANUFACTURING else ('Transactions' if sector_enum == BusinessSector.RETAIL else 'Service Orders'),
        'description': f'Official GoI ASUSE enterprise classification with {r_val:,} estimated rural establishments in India.',
        'source_dataset': 'ASUSE (Annual Survey of Unincorporated Sector Enterprises)',
        'national_rural_establishments': r_val,
        'relevant_datasets': rel_ds,
        'sort_order': sort_order
    }
    activities_master.append(act_obj)

    # Upsert into Django DB
    act_db, _ = BusinessActivity.objects.update_or_create(
        code=code,
        defaults={
            'name': cat,
            'sector': sector_enum,
            'icon': act_obj['icon'],
            'unit_of_measurement': act_obj['unit_of_measurement'],
            'description': act_obj['description'],
            'sort_order': sort_order,
            'is_active': True
        }
    )

    if not hasattr(act_db, 'driver_template'):
        ActivityDriverTemplate.objects.create(
            activity=act_db,
            base_capacity_monthly=1000,
            default_selling_price=500,
            default_variable_cost_per_unit=300,
            default_operating_days=26,
            default_capex_breakdown=[
                {'category': 'building_civil', 'name': 'Workstation / Premises Infrastructure', 'quantity': 1, 'unit_cost': 150000, 'specification': 'Standard enterprise workspace'},
                {'category': 'plant_machinery', 'name': 'Primary Activity Machinery & Tools', 'quantity': 1, 'unit_cost': 200000, 'specification': 'Equipment for activity'},
                {'category': 'working_capital', 'name': 'Initial Raw Material & Inventory Buffer', 'quantity': 1, 'unit_cost': 100000, 'specification': '1-month operating reserve'}
            ],
            default_fixed_costs=[
                {'name': 'Operating Staff / Workers', 'monthly_amount': 15000},
                {'name': 'Commercial Electricity & Utilities', 'monthly_amount': 6000}
            ],
            default_variable_costs=[
                {'name': 'Raw Material Consumables', 'unit_cost': 250.0}
            ],
            seasonal_factors=[1.0]*12
        )

    sort_order += 1

# 2. LIVESTOCK
live_cats = df_live['Commodity'].unique()
headers_to_skip = [
    'Live Animals (in numbers)',
    'Meat and Edible Meat Offal (in kgs)',
    "Dairy Produce; Birds' Eggs; Natural Honey; Edible Prod. of Animal Origin, Not Elsewhere Spec. or Included (in kgs)",
    'Residues and Waste from the Food Industries; Prepared Animal Fodder (in kgs)',
    'Raw Hides and Skins (Other than Fur skins) and Leather (in kgs)',
    'Wool, Fine or Coarse Animal Hair, Horsehair Yarn And Woven Fabric (in kgs)'
]

for comm in live_cats:
    if comm in headers_to_skip:
        continue

    comm_str = str(comm)
    comm_l = comm_str.lower()
    code = f'live_{sort_order:03d}'

    cat_name = 'Livestock & Animal Husbandry'
    sector_enum = BusinessSector.AGRI_ALLIED
    if any(k in comm_l for k in ['dairy', 'milk', 'butter', 'cheese', 'curd', 'honey', 'egg']):
        cat_name = 'Dairy & Allied Produce'
    elif any(k in comm_l for k in ['meat', 'swine', 'offal']):
        cat_name = 'Meat Processing & Trade'
    elif any(k in comm_l for k in ['feed', 'fodder', 'oil-cake', 'residue', 'bran']):
        cat_name = 'Animal Feed & Fodder Processing'
        sector_enum = BusinessSector.MANUFACTURING
    elif any(k in comm_l for k in ['hide', 'skin', 'leather']):
        cat_name = 'Leather & Allied Processing'
        sector_enum = BusinessSector.MANUFACTURING
    elif any(k in comm_l for k in ['wool', 'hair', 'yarn', 'fabric']):
        cat_name = 'Wool & Fibre Textiles'
        sector_enum = BusinessSector.MANUFACTURING

    rel_ds = ['Livestock', 'Rural Wages', 'Population', 'Infrastructure', 'Marketwise Wholesale Arrivals']

    act_obj = {
        'id': sort_order,
        'code': code,
        'name': comm_str,
        'category': cat_name,
        'sector': sector_enum,
        'icon': map_icon(comm_str, sector_enum),
        'unit_of_measurement': 'Kg / Litres / Head Count',
        'description': f'Official GoI Livestock & Allied Commodity Trade classification.',
        'source_dataset': 'GoI Livestock & Allied Trade Dataset',
        'national_rural_establishments': 0,
        'relevant_datasets': rel_ds,
        'sort_order': sort_order
    }
    activities_master.append(act_obj)

    act_db, _ = BusinessActivity.objects.update_or_create(
        code=code,
        defaults={
            'name': comm_str,
            'sector': sector_enum,
            'icon': act_obj['icon'],
            'unit_of_measurement': act_obj['unit_of_measurement'],
            'description': act_obj['description'],
            'sort_order': sort_order,
            'is_active': True
        }
    )

    if not hasattr(act_db, 'driver_template'):
        ActivityDriverTemplate.objects.create(
            activity=act_db,
            base_capacity_monthly=1000,
            default_selling_price=500,
            default_variable_cost_per_unit=300,
            default_operating_days=26,
            default_capex_breakdown=[
                {'category': 'building_civil', 'name': 'Processing Shed / Animal Shelter', 'quantity': 1, 'unit_cost': 180000, 'specification': 'Protected shelter premises'},
                {'category': 'productive_assets', 'name': 'Productive Animals / Commodity Stock', 'quantity': 10, 'unit_cost': 40000, 'specification': 'High quality stock'},
                {'category': 'working_capital', 'name': 'Feed & Medicine Buffer', 'quantity': 1, 'unit_cost': 50000, 'specification': 'Operational buffer'}
            ],
            default_fixed_costs=[
                {'name': 'Labor & Caretaker', 'monthly_amount': 14000},
                {'name': 'Utilities & Vet Expenses', 'monthly_amount': 5000}
            ],
            default_variable_costs=[
                {'name': 'Feed / Raw Material Input', 'unit_cost': 200.0}
            ],
            seasonal_factors=[1.0]*12
        )

    sort_order += 1

# 3. INFRASTRUCTURE & PACS
code = f'infra_{sort_order:03d}'
infra_act = {
    'id': sort_order,
    'code': code,
    'name': 'Primary Agricultural Credit Society (PACS) & Cooperative Services',
    'category': 'Infrastructure & Financial Cooperatives',
    'sector': BusinessSector.SERVICE,
    'icon': 'Landmark',
    'unit_of_measurement': 'Member Loans / Accounts',
    'description': 'Primary Agricultural Credit Society providing micro-credit, seed/fertilizer distribution, and agricultural input services.',
    'source_dataset': 'INFRASTRUCTURE (PACS Financial & Operational Dataset)',
    'national_rural_establishments': 95000,
    'relevant_datasets': ['Infrastructure', 'Population', 'Rural Wages', 'Marketwise Wholesale Arrivals'],
    'sort_order': sort_order
}
activities_master.append(infra_act)

act_db, _ = BusinessActivity.objects.update_or_create(
    code=code,
    defaults={
        'name': infra_act['name'],
        'sector': BusinessSector.SERVICE,
        'icon': infra_act['icon'],
        'unit_of_measurement': infra_act['unit_of_measurement'],
        'description': infra_act['description'],
        'sort_order': sort_order,
        'is_active': True
    }
)
if not hasattr(act_db, 'driver_template'):
    ActivityDriverTemplate.objects.create(
        activity=act_db,
        base_capacity_monthly=1000,
        default_selling_price=500,
        default_variable_cost_per_unit=300,
        default_operating_days=26,
        default_capex_breakdown=[],
        default_fixed_costs=[],
        default_variable_costs=[],
        seasonal_factors=[1.0]*12
    )

# Include seeded featured activities in JSON master
db_activities = BusinessActivity.objects.filter(is_active=True)
all_json_list = []
for a in db_activities:
    # Determine source dataset & category
    rel_ds = ['Population', 'Rural Wages', 'Infrastructure']
    cat_disp = a.get_sector_display()
    src_ds = 'ASUSE Enterprise Dataset'

    if a.code.startswith('live_'):
        src_ds = 'GoI Livestock & Allied Trade Dataset'
        rel_ds.extend(['Livestock', 'Marketwise Wholesale Arrivals'])
        cat_disp = 'Livestock & Agri-Allied'
    elif a.code.startswith('infra_'):
        src_ds = 'PACS Infrastructure Dataset'
        rel_ds.extend(['Infrastructure'])
        cat_disp = 'Infrastructure & Cooperatives'
    elif a.sector == BusinessSector.AGRI_ALLIED:
        src_ds = 'GoI Agri-Allied Enterprise Dataset'
        rel_ds.extend(['Livestock', 'Marketwise Wholesale Arrivals'])
        cat_disp = 'Agriculture & Allied'
    elif a.sector == BusinessSector.MANUFACTURING:
        rel_ds.extend(['Groundwater', 'Marketwise Wholesale Arrivals'])
        cat_disp = 'Manufacturing & Processing'
    elif a.sector == BusinessSector.RETAIL:
        rel_ds.extend(['Routing', 'GIS Location'])
        cat_disp = 'Wholesale & Retail Trade'
    elif a.sector == BusinessSector.SERVICE:
        rel_ds.extend(['Routing', 'GIS Location'])
        cat_disp = 'Services & Logistics'

    all_json_list.append({
        'id': a.id,
        'code': a.code,
        'name': a.name,
        'category': cat_disp,
        'sector': a.sector,
        'icon': a.icon,
        'unit_of_measurement': a.unit_of_measurement,
        'description': a.description or f'Dataset-driven activity record under {cat_disp}.',
        'source_dataset': src_ds,
        'relevant_datasets': rel_ds,
        'sort_order': a.sort_order
    })

# Write JSON file into frontend/src/data/
frontend_data_dir = os.path.join(os.getcwd(), 'frontend', 'src', 'data')
os.makedirs(frontend_data_dir, exist_ok=True)
json_path = os.path.join(frontend_data_dir, 'business_activities_dataset.json')

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(all_json_list, f, indent=2)

print(f'Successfully seeded {BusinessActivity.objects.count()} total activities in Django DB.')
print(f'Successfully generated dataset JSON at {json_path} with {len(all_json_list)} items.')
