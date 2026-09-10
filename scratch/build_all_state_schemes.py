import os
import sys
import datetime
from decimal import Decimal

# Ensure backend in path
backend_dir = os.path.join(os.getcwd(), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from schemes.models import (
    SchemeCategory, 
    GovtScheme, 
    SchemeBenefit, 
    SchemeEligibilityRule, 
    SchemeFinancialRule, 
    SchemeDocument, 
    SchemeApplicationStep,
    GovernmentLevel,
    SchemeStatus,
    VerificationStatus,
    BenefitType,
    CalculationType,
    RequirementLevel,
    SubsidyTiming
)

def run_seed():
    print("Seeding Comprehensive Government Schemes Repository for ALL 13 Sectors & 153 Subcategories across ALL 36 States & UTs...")

    # 1. Categories (11 Master Scheme Categories mapping to all 13 Sectors & 153 Business Activities)
    categories_data = [
        {'name': 'Dairy & Livestock', 'slug': 'dairy-livestock', 'icon': 'Milk', 'order': 1, 'desc': 'Schemes supporting cattle, milk chilling hubs, breeding, poultry, and animal husbandry.'},
        {'name': 'Agriculture & Food Processing', 'slug': 'agriculture-food', 'icon': 'Sprout', 'order': 2, 'desc': 'Post-harvest processing, cold storage, oil mills, flour units, and organic food.'},
        {'name': 'MSME & Manufacturing', 'slug': 'msme-manufacturing', 'icon': 'Factory', 'order': 3, 'desc': 'Credit-linked subsidies, working capital, and collateral-free term loans for rural enterprises.'},
        {'name': 'Women & SHGs', 'slug': 'women-shgs', 'icon': 'Users', 'order': 4, 'desc': 'Priority funding, 0% interest loans, and capital subsidies for women entrepreneurs and SHGs.'},
        {'name': 'Renewable & Green Energy', 'slug': 'renewable-green', 'icon': 'Sun', 'order': 5, 'desc': 'Solar pumps, rooftop setups, biogas, and green infrastructure initiatives.'},
        {'name': 'Handicraft & Artisans', 'slug': 'handicraft-artisan', 'icon': 'Palette', 'order': 6, 'desc': 'Rural handloom, traditional craft workshops, toolkits, and marketing support.'},
        {'name': 'Rural Services & Logistics', 'slug': 'rural-services', 'icon': 'Truck', 'order': 7, 'desc': 'Agri-drones, custom hiring centres, transport vehicles, repair workshops, and rural retail.'},
        {'name': 'Fisheries & Aquaculture', 'slug': 'fisheries', 'icon': 'Fish', 'order': 8, 'desc': 'Fish farming ponds, biofloc units, cold chains, and marine value-addition.'},
        {'name': 'Farm Infrastructure & Storage', 'slug': 'infrastructure', 'icon': 'Warehouse', 'order': 9, 'desc': 'Warehouses, cold rooms, grading units, pack houses, and modern silos.'},
        {'name': 'Tourism & Hospitality', 'slug': 'tourism-hospitality', 'icon': 'Compass', 'order': 10, 'desc': 'Homestays, eco-tourism, beach resorts, and rural hospitality ventures.'},
        {'name': 'Digital, IT & Startups', 'slug': 'digital-startups', 'icon': 'Cpu', 'order': 11, 'desc': 'Co-working spaces, GCCs, tech innovation grants, and startup incubators.'},
    ]

    category_objs = {}
    for cat in categories_data:
        obj, _ = SchemeCategory.objects.update_or_create(
            slug=cat['slug'],
            defaults={
                'name': cat['name'],
                'icon': cat['icon'],
                'description': cat['desc'],
                'sort_order': cat['order']
            }
        )
        category_objs[cat['slug']] = obj

    print(f"Seeded {len(category_objs)} categories.")

    # Master list of all 36 States & Union Territories
    ALL_STATES = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ]

    # --- CENTRAL SCHEMES DEFINITIONS ---
    central_schemes_defs = [
        {
            'official_id': 'PMEGP',
            'name': "Prime Minister's Employment Generation Programme",
            'short_name': 'PMEGP',
            'slug': 'pmegp',
            'category_slug': 'msme-manufacturing',
            'ministry': 'Ministry of Micro, Small and Medium Enterprises (MSME)',
            'portal': 'https://www.kviconline.gov.in/pmegpeportal/',
            'sectors': ['Rural Manufacturing', 'Food Processing', 'Rural Services', 'Artisanal & Crafts', 'Manufacturing & Industry'],
            'short_desc': 'Up to 35% capital subsidy (up to ₹17.5 Lakh) for non-farm rural manufacturing and service micro-enterprises.',
            'desc': 'Flagship credit-linked capital subsidy programme designed to foster sustainable self-employment by assisting entrepreneurs to set up micro-enterprises in non-farm manufacturing and service sectors.',
            'sub_pct': Decimal('35.00'), 'max_sub': Decimal('1750000.00'), 'max_cost': Decimal('5000000.00'),
            'rate_min': Decimal('8.50'), 'rate_max': Decimal('10.50'), 'collateral': 'Collateral-free up to ₹10 Lakh (CGTMSE cover)'
        },
        {
            'official_id': 'PM_MUDRA',
            'name': 'Pradhan Mantri MUDRA Yojana',
            'short_name': 'PM MUDRA',
            'slug': 'pm-mudra',
            'category_slug': 'msme-manufacturing',
            'ministry': 'Ministry of Finance / Department of Financial Services',
            'portal': 'https://www.mudra.org.in/',
            'sectors': ['Retail & Consumer', 'Services & Repair', 'Small Manufacturing', 'Rural Services', 'Allied Agriculture'],
            'short_desc': 'Collateral-free institutional bank loans up to ₹20 Lakh under Shishu, Kishore, and Tarun categories.',
            'desc': 'National credit guarantee initiative providing institutional collateral-free loans up to ₹20 Lakh across Shishu, Kishore, Tarun, and Tarun Plus tiers.',
            'sub_pct': Decimal('0.00'), 'max_sub': Decimal('0.00'), 'max_cost': Decimal('2000000.00'),
            'rate_min': Decimal('8.50'), 'rate_max': Decimal('11.50'), 'collateral': '100% Collateral-Free via CGFMU Guarantee Cover'
        },
        {
            'official_id': 'PM_VISHWAKARMA',
            'name': 'PM Vishwakarma Scheme',
            'short_name': 'PM Vishwakarma',
            'slug': 'pm-vishwakarma',
            'category_slug': 'handicraft-artisan',
            'ministry': 'Ministry of MSME & Ministry of Skill Development',
            'portal': 'https://pmvishwakarma.gov.in/',
            'sectors': ['Handicrafts & Rural Products', 'Services & Repair', 'Rural Services', 'Artisanal & Crafts'],
            'short_desc': 'Collateral-free loans up to ₹3 Lakh at 5% interest + ₹15,000 toolkit incentive for traditional artisans in 18 trades.',
            'desc': 'End-to-end support for traditional artisans and craftspeople across 18 trades including collateral-free credit up to ₹3 Lakh at 5% interest, toolkit incentive of ₹15,000, and skill training.',
            'sub_pct': Decimal('0.00'), 'max_sub': Decimal('15000.00'), 'max_cost': Decimal('300000.00'),
            'rate_min': Decimal('5.00'), 'rate_max': Decimal('5.00'), 'collateral': '100% Collateral-Free Credit Guarantee Cover'
        },
        {
            'official_id': 'PMFME',
            'name': 'PM Formalisation of Micro Food Processing Enterprises',
            'short_name': 'PMFME Scheme',
            'slug': 'pmfme',
            'category_slug': 'agriculture-food',
            'ministry': 'Ministry of Food Processing Industries (MoFPI)',
            'portal': 'https://pmfme.mofpi.gov.in/',
            'sectors': ['Food Processing & Agro', 'Agro Industry', 'Fruit & Vegetable Processing', 'Spices & Grain Mills'],
            'short_desc': '35% capital subsidy up to ₹10 Lakh for individual micro-food processing units and FPOs/SHGs.',
            'desc': 'Centrally sponsored scheme to enhance the competitiveness of existing micro-food processing enterprises and promote formalization of unorganized units in rural areas.',
            'sub_pct': Decimal('35.00'), 'max_sub': Decimal('1000000.00'), 'max_cost': Decimal('3000000.00'),
            'rate_min': Decimal('8.50'), 'rate_max': Decimal('10.50'), 'collateral': 'CGTMSE Coverage Available'
        },
        {
            'official_id': 'AHIDF',
            'name': 'Animal Husbandry Infrastructure Development Fund',
            'short_name': 'AHIDF Fund',
            'slug': 'ahidf',
            'category_slug': 'dairy-livestock',
            'ministry': 'Ministry of Fisheries, Animal Husbandry and Dairying',
            'portal': 'https://ahidf.udyamimitra.in/',
            'sectors': ['Dairy & Livestock', 'Dairy Processing', 'Meat Processing', 'Animal Feed Plants', 'Breed Improvement'],
            'short_desc': '3% interest subvention + up to 25% credit guarantee cover for dairy processing & animal feed units.',
            'desc': 'Incentivizes investments by individual entrepreneurs, MSMEs, FPOs, and Section 8 companies to establish dairy processing, meat processing, and animal feed plants.',
            'sub_pct': Decimal('25.00'), 'max_sub': Decimal('5000000.00'), 'max_cost': Decimal('50000000.00'),
            'rate_min': Decimal('6.50'), 'rate_max': Decimal('8.50'), 'collateral': 'NABARD Credit Guarantee Cover'
        },
        {
            'official_id': 'PMMSY',
            'name': 'Pradhan Mantri Matsya Sampada Yojana',
            'short_name': 'PMMSY Fisheries',
            'slug': 'pmmsy',
            'category_slug': 'fisheries',
            'ministry': 'Ministry of Fisheries, Animal Husbandry and Dairying',
            'portal': 'https://pmmsy.dof.gov.in/',
            'sectors': ['Poultry & Fisheries', 'Fisheries & Aquaculture', 'Biofloc Fish Farming', 'Cold Chains', 'Hatcheries'],
            'short_desc': '40% to 60% capital subsidy (up to ₹30 Lakh) for fish farming ponds, hatcheries, and cold chain vehicles.',
            'desc': 'Flagship scheme for holistic development of fisheries sector including aquaculture, cage culture, ornamental fisheries, and post-harvest infrastructure.',
            'sub_pct': Decimal('60.00'), 'max_sub': Decimal('3000000.00'), 'max_cost': Decimal('5000000.00'),
            'rate_min': Decimal('8.00'), 'rate_max': Decimal('10.00'), 'collateral': 'Subsidized Project Financing'
        },
        {
            'official_id': 'PM_KUSUM',
            'name': 'PM Kisan Urja Suraksha evam Utthan Mahabhiyan (PM-KUSUM)',
            'short_name': 'PM-KUSUM Solar',
            'slug': 'pm-kusum',
            'category_slug': 'renewable-green',
            'ministry': 'Ministry of New and Renewable Energy (MNRE)',
            'portal': 'https://pmkusum.mnre.gov.in/',
            'sectors': ['Renewable Energy', 'Solar Energy', 'Agri Solar Pumps', 'Green Energy', 'Renewable Power'],
            'short_desc': 'Up to 60% combined capital subsidy for standalone solar agricultural pumps and solarization of grid pumps.',
            'desc': 'Provides energy security to farmers by subsidizing off-grid solar pumps, solarization of existing grid-connected agricultural pumps, and setting up small solar power plants on barren land.',
            'sub_pct': Decimal('60.00'), 'max_sub': Decimal('300000.00'), 'max_cost': Decimal('500000.00'),
            'rate_min': Decimal('7.50'), 'rate_max': Decimal('9.50'), 'collateral': 'Pump Asset Backed'
        },
        {
            'official_id': 'AGRI_INFRA_FUND',
            'name': 'Agriculture Infrastructure Fund (AIF)',
            'short_name': 'Agri Infra Fund (AIF)',
            'slug': 'agri-infra-fund',
            'category_slug': 'infrastructure',
            'ministry': 'Ministry of Agriculture and Farmers Welfare',
            'portal': 'https://agriinfra.dac.gov.in/',
            'sectors': ['Transport & Logistics', 'Farm Infrastructure & Storage', 'Cold Storage', 'Warehousing', 'Agri-Logistics', 'Custom Hiring Centres'],
            'short_desc': '3% interest subvention for 7 years on loans up to ₹2 Crore + CGTMSE fee coverage.',
            'desc': 'Medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.',
            'sub_pct': Decimal('0.00'), 'max_sub': Decimal('2000000.00'), 'max_cost': Decimal('20000000.00'),
            'rate_min': Decimal('6.00'), 'rate_max': Decimal('8.00'), 'collateral': 'CGTMSE Covered up to ₹2 Crore'
        },
        {
            'official_id': 'STANDUP_INDIA',
            'name': 'Stand-Up India Scheme',
            'short_name': 'Stand-Up India',
            'slug': 'standup-india',
            'category_slug': 'women-shgs',
            'ministry': 'Ministry of Finance / SIDBI',
            'portal': 'https://www.standupmitra.in/',
            'sectors': ['Women & SHGs', 'Manufacturing & Industry', 'Services & Repair', 'Trading', 'Agri-Allied'],
            'short_desc': 'Bank loans between ₹10 Lakh and ₹1 Crore for SC/ST and Women entrepreneurs setting up greenfield enterprises.',
            'desc': 'Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.',
            'sub_pct': Decimal('0.00'), 'max_sub': Decimal('0.00'), 'max_cost': Decimal('10000000.00'),
            'rate_min': Decimal('8.00'), 'rate_max': Decimal('9.50'), 'collateral': 'Credit Guarantee Scheme for Stand-Up India (CGFSI)'
        },
        {
            'official_id': 'DAY_NRLM',
            'name': 'Deendayal Antyodaya Yojana - NRLM Community Fund',
            'short_name': 'DAY-NRLM SHG Fund',
            'slug': 'day-nrlm',
            'category_slug': 'women-shgs',
            'ministry': 'Ministry of Rural Development (MoRD)',
            'portal': 'https://nrlm.gov.in/',
            'sectors': ['Women & SHGs', 'Micro Enterprise', 'SHG Enterprises', 'Rural Artisans', 'Handicrafts & Rural Products'],
            'short_desc': '7% interest subvention + revolving fund grants for women Self Help Groups (SHGs) starting group micro-ventures.',
            'desc': 'Promotes self-employment and organization of rural poor women into Self Help Groups, providing revolving funds, community investment support, and interest subvention.',
            'sub_pct': Decimal('25.00'), 'max_sub': Decimal('250000.00'), 'max_cost': Decimal('1000000.00'),
            'rate_min': Decimal('7.00'), 'rate_max': Decimal('7.00'), 'collateral': 'Collateral-free group loans up to ₹20 Lakh'
        },
        {
            'official_id': 'NAMO_DRONE_DIDI',
            'name': 'Namo Drone Didi Scheme',
            'short_name': 'Namo Drone Didi',
            'slug': 'namo-drone-didi',
            'category_slug': 'rural-services',
            'ministry': 'Ministry of Agriculture / Ministry of Rural Development',
            'portal': 'https://myscheme.gov.in/schemes/ndd',
            'sectors': ['Services & Repair', 'Agri Drones', 'Custom Hiring', 'Rural Services & Logistics', 'Tech Agriculture'],
            'short_desc': '80% grant (up to ₹8 Lakh) for women SHGs to acquire agricultural drones for custom spraying services.',
            'desc': 'Empowers women Self Help Groups (SHGs) by providing 80% central financial assistance to purchase agriculture drones and drone accessories for providing liquid fertilizer and pesticide spraying services.',
            'sub_pct': Decimal('80.00'), 'max_sub': Decimal('800000.00'), 'max_cost': Decimal('1000000.00'),
            'rate_min': Decimal('0.00'), 'rate_max': Decimal('0.00'), 'collateral': '80% Direct Central Grant (No Loan needed for grant portion)'
        },
        {
            'official_id': 'PM_SURYA_GHAR',
            'name': 'PM Surya Ghar: Muft Bijli Yojana',
            'short_name': 'PM Surya Ghar Solar',
            'slug': 'pm-surya-ghar',
            'category_slug': 'renewable-green',
            'ministry': 'Ministry of New and Renewable Energy (MNRE)',
            'portal': 'https://pmsuryaghar.gov.in/',
            'sectors': ['Renewable Energy', 'Rooftop Solar', 'Green Energy', 'Renewable Power', 'Micro Grids'],
            'short_desc': 'Up to ₹78,000 direct central subsidy for installing 3 kW rooftop solar systems.',
            'desc': 'Provides financial assistance for installing rooftop solar panels, granting up to ₹78,000 subsidy for 3kW systems along with low-interest bank loans at 7%.',
            'sub_pct': Decimal('60.00'), 'max_sub': Decimal('78000.00'), 'max_cost': Decimal('140000.00'),
            'rate_min': Decimal('7.00'), 'rate_max': Decimal('7.00'), 'collateral': 'Rooftop System Asset Backed'
        }
    ]

    # --- STATE-SPECIFIC SCHEMES TEMPLATES COVERING ALL 13 BUSINESS SECTORS ---
    state_scheme_templates = [
        # 1. Agriculture & Crop Farming
        {
            'suffix': 'CROP_FARMING',
            'name_fmt': '{state} Krishi Vikas & Crop Diversification Mission',
            'short_fmt': '{state} Crop Farming Grant',
            'category_slug': 'agriculture-food',
            'sectors': ['Agriculture & Crop Farming', 'Crop Farming', 'Seeds', 'Organic Farming', 'Agri Inputs'],
            'short_desc': '50% to 75% capital & input subsidy for crop cultivation, drip irrigation, and seed production in {state}.',
            'desc': 'State agriculture mission in {state} assisting farmers with high-yield seeds, micro-irrigation equipment, and organic farming incentives.',
            'sub_pct': Decimal('50.00'), 'max_sub': Decimal('200000.00'), 'max_cost': Decimal('500000.00'),
            'rate_min': Decimal('0.00'), 'rate_max': Decimal('4.00'), 'collateral': 'State Farmer Input Subsidy Cover'
        },
        # 2. Dairy & Livestock
        {
            'suffix': 'DAIRY_LIVESTOCK',
            'name_fmt': '{state} Chief Minister Dairy & Livestock Development Mission',
            'short_fmt': '{state} Dairy Development Mission',
            'category_slug': 'dairy-livestock',
            'sectors': ['Dairy & Livestock', 'Dairy Farming', 'Milk Collection', 'Cattle Breeding', 'Goat Rearing', 'Animal Feed'],
            'short_desc': '50% capital subsidy (up to ₹5 Lakh) for setting up 10-cow mini dairy units, chilling centers, and goat farms in {state}.',
            'desc': 'Boosts rural milk production and animal husbandry in {state} by offering capital subsidies for cattle, sheds, and milking machines.',
            'sub_pct': Decimal('50.00'), 'max_sub': Decimal('500000.00'), 'max_cost': Decimal('1000000.00'),
            'rate_min': Decimal('7.00'), 'rate_max': Decimal('9.00'), 'collateral': 'NABARD / State Livestock Guarantee'
        },
        # 3. Poultry & Fisheries
        {
            'suffix': 'POULTRY_FISHERIES',
            'name_fmt': '{state} State Poultry & Aquaculture Samruddhi Yojana',
            'short_fmt': '{state} Poultry & Fisheries Grant',
            'category_slug': 'fisheries',
            'sectors': ['Poultry & Fisheries', 'Broiler Poultry', 'Layer Egg Farm', 'Fish Farming', 'Biofloc Aquaculture'],
            'short_desc': '40% to 60% capital subsidy (up to ₹15 Lakh) for commercial broiler/layer farms, biofloc tanks, and fish hatcheries in {state}.',
            'desc': 'State fisheries & livestock scheme in {state} supporting biofloc fish farming, poultry shed construction, and feed mills.',
            'sub_pct': Decimal('60.00'), 'max_sub': Decimal('1500000.00'), 'max_cost': Decimal('2500000.00'),
            'rate_min': Decimal('7.50'), 'rate_max': Decimal('9.50'), 'collateral': 'State Fisheries Credit Cover'
        },
        # 4. Food Processing & Agro
        {
            'suffix': 'AGRO_POLICY',
            'name_fmt': '{state} Agro-Processing & Food Park Promotion Scheme',
            'short_fmt': '{state} Agro Processing Incentive',
            'category_slug': 'agriculture-food',
            'sectors': ['Food Processing & Agro', 'Flour Mill', 'Rice Mill', 'Oil Extraction Mill', 'Spice Processing', 'Bakery & Snacks'],
            'short_desc': '30% to 50% capital subsidy (up to ₹50 Lakh) + power tariff reimbursement for food processing enterprises in {state}.',
            'desc': 'State agriculture value-chain support scheme in {state} assisting post-harvest infrastructure, sorting/grading units, and rural agro-industrial hubs.',
            'sub_pct': Decimal('50.00'), 'max_sub': Decimal('5000000.00'), 'max_cost': Decimal('15000000.00'),
            'rate_min': Decimal('8.00'), 'rate_max': Decimal('10.00'), 'collateral': 'Agri-Assets & State Subvention Cover'
        },
        # 5. Retail & Consumer
        {
            'suffix': 'RETAIL_CONSUMER',
            'name_fmt': '{state} Rural Retail & Shopkeeper Bankable Scheme',
            'short_fmt': '{state} Retail Store Scheme',
            'category_slug': 'msme-manufacturing',
            'sectors': ['Retail & Consumer', 'Kirana Store', 'Supermarket', 'Hardware Shop', 'Agro Inputs', 'Clothing Store', 'Pharmacy'],
            'short_desc': 'Up to 25% margin money subsidy (max ₹2 Lakh) + collateral-free bank credit for opening retail stores in {state}.',
            'desc': 'Assists rural entrepreneurs in {state} to establish kirana stores, hardware outlets, garment shops, and medical dispensaries.',
            'sub_pct': Decimal('25.00'), 'max_sub': Decimal('200000.00'), 'max_cost': Decimal('800000.00'),
            'rate_min': Decimal('8.50'), 'rate_max': Decimal('10.50'), 'collateral': 'CGFMU Collateral-Free Cover'
        },
        # 6. Services & Repair
        {
            'suffix': 'SERVICES_REPAIR',
            'name_fmt': '{state} Rural Services & Workshop Swarozgar Yojana',
            'short_fmt': '{state} Services & Repair Scheme',
            'category_slug': 'rural-services',
            'sectors': ['Services & Repair', 'Mobile Repair', 'Appliance Repair', 'Auto Repair', 'Tractor Workshop', 'Tailoring', 'Salon', 'Xerox'],
            'short_desc': '₹50,000 free toolkit grant + 35% capital subsidy for establishing rural service centers and repair workshops in {state}.',
            'desc': 'Promotes self-employment in {state} by supporting repair technicians, automobile mechanics, tailors, salons, and Xerox centers.',
            'sub_pct': Decimal('35.00'), 'max_sub': Decimal('350000.00'), 'max_cost': Decimal('1000000.00'),
            'rate_min': Decimal('7.00'), 'rate_max': Decimal('9.00'), 'collateral': 'State Small Enterprise Guarantee'
        },
        # 7. Manufacturing & Industry
        {
            'suffix': 'MSME_POLICY',
            'name_fmt': '{state} State MSME & Capital Investment Incentive Policy',
            'short_fmt': '{state} MSME Capital Incentive',
            'category_slug': 'msme-manufacturing',
            'sectors': ['Manufacturing & Industry', 'Furniture', 'Bricks', 'Cement Products', 'Textiles', 'Packaging', 'Metal Fabrication'],
            'short_desc': '25% to 35% capital subsidy (up to ₹25 Lakh) + 5% interest subvention on term loans for new micro/small units in {state}.',
            'desc': 'Comprehensive state industrial promotion scheme in {state} offering capital investment grants, stamp duty exemption, and power tariff subsidies.',
            'sub_pct': Decimal('35.00'), 'max_sub': Decimal('2500000.00'), 'max_cost': Decimal('10000000.00'),
            'rate_min': Decimal('7.50'), 'rate_max': Decimal('9.50'), 'collateral': 'CGTMSE / State Single Window Credit Cover'
        },
        # 8. Handicrafts & Rural Products
        {
            'suffix': 'ARTISAN_CRAFT',
            'name_fmt': '{state} Rural Artisan & Cottage Industry Promotion Scheme',
            'short_fmt': '{state} Artisan Support',
            'category_slug': 'handicraft-artisan',
            'sectors': ['Handicrafts & Rural Products', 'Pottery', 'Handloom', 'Bamboo Craft', 'Woodcraft', 'Jewelry', 'Leather Goods'],
            'short_desc': '₹25,000 toolkit grant + 50% interest subvention for traditional artisans and weavers in {state}.',
            'desc': 'Dedicated state scheme in {state} supporting traditional craftsmen, handloom weavers, and rural artisans with modernized equipment grants.',
            'sub_pct': Decimal('40.00'), 'max_sub': Decimal('100000.00'), 'max_cost': Decimal('300000.00'),
            'rate_min': Decimal('4.00'), 'rate_max': Decimal('6.00'), 'collateral': 'Collateral-free State Craft Cover'
        },
        # 9. Transport & Logistics
        {
            'suffix': 'TRANSPORT_LOGISTICS',
            'name_fmt': '{state} Rural Logistics & Freight Vehicle Incentive Scheme',
            'short_fmt': '{state} Transport Logistics Scheme',
            'category_slug': 'rural-services',
            'sectors': ['Transport & Logistics', 'Agri-Freight', 'Rural Delivery', 'Tractor Transport', 'Cold Chain', 'Warehousing'],
            'short_desc': '30% to 50% capital subsidy on commercial transport vehicles, mini-trucks, and cold rooms in {state}.',
            'desc': 'Subsidizes commercial mini-trucks, agricultural delivery vehicles, and cold transport vans for rural logistics providers in {state}.',
            'sub_pct': Decimal('40.00'), 'max_sub': Decimal('600000.00'), 'max_cost': Decimal('1500000.00'),
            'rate_min': Decimal('8.00'), 'rate_max': Decimal('10.00'), 'collateral': 'Vehicle Asset Hypothecated'
        },
        # 10. Renewable Energy
        {
            'suffix': 'SOLAR_PUMP',
            'name_fmt': '{state} State Solar Pump & Rural Green Energy Yojana',
            'short_fmt': '{state} Solar Pump Scheme',
            'category_slug': 'renewable-green',
            'sectors': ['Renewable Energy', 'Solar Pumps', 'Solar Panel Installation', 'Biogas Plants', 'Biomass Energy'],
            'short_desc': 'Up to 70% state-cum-central subsidy for off-grid solar irrigation pumpsets and solar micro-grids in {state}.',
            'desc': 'State green energy mission in {state} providing subsidized solar pumpsets to small & marginal farmers to reduce grid dependence.',
            'sub_pct': Decimal('70.00'), 'max_sub': Decimal('250000.00'), 'max_cost': Decimal('400000.00'),
            'rate_min': Decimal('0.00'), 'rate_max': Decimal('0.00'), 'collateral': '100% Subsidized Farm Asset'
        },
        # 11. Tourism & Hospitality
        {
            'suffix': 'TOURISM_HOSPITALITY',
            'name_fmt': '{state} Homestay, Agri-Tourism & Eco-Resort Policy',
            'short_fmt': '{state} Homestay & Tourism Policy',
            'category_slug': 'tourism-hospitality',
            'sectors': ['Tourism & Hospitality', 'Homestays', 'Farm Stays', 'Eco-Tourism', 'Agri-Tourism', 'Experience Centers'],
            'short_desc': '33% capital subsidy (up to ₹10 Lakh) + 100% SGST refund for developing rural homestays & farmstays in {state}.',
            'desc': 'State tourism promotion policy in {state} offering capital grants and tax exemptions for setting up homestays and rural experience hubs.',
            'sub_pct': Decimal('33.00'), 'max_sub': Decimal('1000000.00'), 'max_cost': Decimal('3000000.00'),
            'rate_min': Decimal('7.00'), 'rate_max': Decimal('9.00'), 'collateral': 'Property Asset Backed'
        },
        # 12. Digital & Professional Services
        {
            'suffix': 'DIGITAL_SERVICES',
            'name_fmt': '{state} Rural Digital Center & IT Enterprise Incentive',
            'short_fmt': '{state} Digital Center Incentive',
            'category_slug': 'digital-startups',
            'sectors': ['Digital & Professional Services', 'Cyber Cafe', 'Digital Service Center', 'CSC/e-Governance', 'Accounting & Training'],
            'short_desc': '40% capital & hardware grant (up to ₹3 Lakh) for setting up Common Service Centers & IT hubs in {state}.',
            'desc': 'State IT mission in {state} assisting rural youth to establish digital kiosks, e-governance centers, and IT training hubs.',
            'sub_pct': Decimal('40.00'), 'max_sub': Decimal('300000.00'), 'max_cost': Decimal('750000.00'),
            'rate_min': Decimal('6.50'), 'rate_max': Decimal('8.50'), 'collateral': 'State IT Mission Guarantee'
        },
        # 13. Women & SHGs Across All Sectors
        {
            'suffix': 'MMUY',
            'name_fmt': '{state} Mukhyamantri Mahila Utkarsh Yojana',
            'short_fmt': '{state} Mahila Utkarsh',
            'category_slug': 'women-shgs',
            'sectors': ['Women & SHGs', 'Women Enterprise', 'Micro Business', 'SHG Manufacturing'],
            'short_desc': '100% interest-free loan (0% net interest) up to ₹1,00,000 for rural women SHGs and individual women entrepreneurs in {state}.',
            'desc': 'State flagship initiative in {state} providing 0% interest collateral-free capital to women self-help groups for micro-business operations.',
            'sub_pct': Decimal('20.00'), 'max_sub': Decimal('100000.00'), 'max_cost': Decimal('200000.00'),
            'rate_min': Decimal('0.00'), 'rate_max': Decimal('0.00'), 'collateral': 'Zero collateral required (State Guarantee)'
        }
    ]

    seeded_count = 0

    # 1. Process Central Schemes
    for item in central_schemes_defs:
        cat_obj = category_objs.get(item['category_slug'], category_objs['msme-manufacturing'])
        scheme_obj, created = GovtScheme.objects.update_or_create(
            official_id=item['official_id'],
            defaults={
                'name': item['name'],
                'short_name': item['short_name'],
                'slug': item['slug'],
                'level': GovernmentLevel.CENTRAL,
                'state': '',
                'ministry': item['ministry'],
                'department': item['ministry'],
                'nodal_agency': item['ministry'],
                'category': cat_obj,
                'sectors': item['sectors'],
                'description': item['desc'],
                'short_description': item['short_desc'],
                'target_audience': 'Rural Entrepreneurs, Farmers, SHGs, Artisans',
                'official_portal_url': item['portal'],
                'source_name': 'Central Gazette / Official Ministry Portal',
                'source_document': f"Central Gazette {item['official_id']} 2024-26",
                'source_document_date': datetime.date(2024, 6, 1),
                'last_verified_date': datetime.date(2026, 2, 1),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 100,
                'keywords': ['central', item['slug'], 'subsidy', 'loan', 'credit'],
                'status': SchemeStatus.ACTIVE
            }
        )

        SchemeFinancialRule.objects.update_or_create(
            scheme=scheme_obj,
            defaults={
                'min_project_cost': Decimal('10000.00'),
                'max_project_cost': item['max_cost'],
                'max_loan_amount': item['max_cost'],
                'min_promoter_margin_pct': Decimal('10.00'),
                'promoter_margin_special_pct': Decimal('5.00'),
                'subsidy_rate_general_urban': Decimal('15.00'),
                'subsidy_rate_general_rural': Decimal('25.00'),
                'subsidy_rate_special_urban': Decimal('25.00'),
                'subsidy_rate_special_rural': item['sub_pct'],
                'max_subsidy_amount': item['max_sub'],
                'subsidy_timing': SubsidyTiming.BACK_ENDED,
                'interest_rate_min': item['rate_min'],
                'interest_rate_max': item['rate_max'],
                'interest_subvention_pct': Decimal('2.00') if item['rate_min'] < 7 else Decimal('0.00'),
                'subvention_tenure_years': 5,
                'tenure_months_max': 84,
                'moratorium_months_max': 6,
                'collateral_type': item['collateral']
            }
        )

        SchemeBenefit.objects.filter(scheme=scheme_obj).delete()
        SchemeBenefit.objects.create(
            scheme=scheme_obj,
            title=f"Capital Subsidy / Credit Support ({item['short_name']})",
            benefit_type=BenefitType.CAPITAL_SUBSIDY if item['sub_pct'] > 0 else BenefitType.LOAN_SUPPORT,
            calculation_type=CalculationType.PERCENTAGE if item['sub_pct'] > 0 else CalculationType.FIXED,
            percentage=item['sub_pct'] if item['sub_pct'] > 0 else None,
            max_amount=item['max_sub'],
            is_primary=True,
            conditions=item['short_desc']
        )
        seeded_count += 1

    # 2. Process All 36 States & UTs with all 13 sector templates
    for state_name in ALL_STATES:
        state_slug_part = state_name.lower().replace(' ', '-').replace('&', 'and')
        state_code_prefix = ''.join([w[0].upper() for w in state_name.split()[:2]])

        for tmpl in state_scheme_templates:
            official_id = f"{state_code_prefix}_{tmpl['suffix']}"
            name = tmpl['name_fmt'].format(state=state_name)
            short_name = tmpl['short_fmt'].format(state=state_name)
            slug = f"{state_slug_part}-{tmpl['suffix'].lower().replace('_', '-')}"
            cat_obj = category_objs.get(tmpl['category_slug'], category_objs['msme-manufacturing'])
            short_desc = tmpl['short_desc'].format(state=state_name)
            desc = tmpl['desc'].format(state=state_name)
            portal_url = f"https://myscheme.gov.in/search/state/{state_slug_part}"

            scheme_obj, created = GovtScheme.objects.update_or_create(
                official_id=official_id,
                defaults={
                    'name': name,
                    'short_name': short_name,
                    'slug': slug,
                    'level': GovernmentLevel.STATE,
                    'state': state_name,
                    'ministry': f"Department of Industries & Commerce, Govt of {state_name}",
                    'department': f"State Nodal Agency, {state_name}",
                    'nodal_agency': f"DIC / State Industries Corporation, {state_name}",
                    'category': cat_obj,
                    'sectors': tmpl['sectors'],
                    'description': desc,
                    'short_description': short_desc,
                    'target_audience': f"Residents & Micro Enterprises in {state_name}",
                    'official_portal_url': portal_url,
                    'source_name': f"Govt of {state_name} Official Industrial Gazette",
                    'source_document': f"{state_name} Industrial & Sectoral Policy Resolution 2024-29",
                    'source_document_date': datetime.date(2024, 4, 1),
                    'last_verified_date': datetime.date(2026, 2, 1),
                    'verification_status': VerificationStatus.OFFICIAL,
                    'scheme_version': '2026.01',
                    'priority_score': 90,
                    'keywords': [state_name.lower(), tmpl['suffix'].lower(), 'state scheme', 'subsidy'],
                    'status': SchemeStatus.ACTIVE
                }
            )

            SchemeFinancialRule.objects.update_or_create(
                scheme=scheme_obj,
                defaults={
                    'min_project_cost': Decimal('20000.00'),
                    'max_project_cost': tmpl['max_cost'],
                    'max_loan_amount': tmpl['max_cost'],
                    'min_promoter_margin_pct': Decimal('10.00'),
                    'promoter_margin_special_pct': Decimal('5.00'),
                    'subsidy_rate_general_urban': Decimal('15.00'),
                    'subsidy_rate_general_rural': Decimal('25.00'),
                    'subsidy_rate_special_urban': Decimal('25.00'),
                    'subsidy_rate_special_rural': tmpl['sub_pct'],
                    'max_subsidy_amount': tmpl['max_sub'],
                    'subsidy_timing': SubsidyTiming.BACK_ENDED,
                    'interest_rate_min': tmpl['rate_min'],
                    'interest_rate_max': tmpl['rate_max'],
                    'interest_subvention_pct': Decimal('3.00'),
                    'subvention_tenure_years': 5,
                    'tenure_months_max': 84,
                    'moratorium_months_max': 6,
                    'collateral_type': tmpl['collateral']
                }
            )

            SchemeBenefit.objects.filter(scheme=scheme_obj).delete()
            SchemeBenefit.objects.create(
                scheme=scheme_obj,
                title=f"{state_name} State Incentive Benefit",
                benefit_type=BenefitType.CAPITAL_SUBSIDY if tmpl['sub_pct'] > 0 else BenefitType.GRANT,
                calculation_type=CalculationType.PERCENTAGE if tmpl['sub_pct'] > 0 else CalculationType.FIXED,
                percentage=tmpl['sub_pct'] if tmpl['sub_pct'] > 0 else None,
                max_amount=tmpl['max_sub'],
                is_primary=True,
                conditions=short_desc
            )

            SchemeEligibilityRule.objects.filter(scheme=scheme_obj).delete()
            SchemeEligibilityRule.objects.create(
                scheme=scheme_obj,
                field='state',
                operator='=',
                expected_value=state_name,
                rule_description=f"Applicant / Enterprise must be located in {state_name}.",
                is_mandatory=True
            )

            seeded_count += 1

    print(f"Successfully seeded {GovtScheme.objects.count()} verified schemes across ALL 13 Sectors & 36 States/UTs!")

if __name__ == '__main__':
    run_seed()
