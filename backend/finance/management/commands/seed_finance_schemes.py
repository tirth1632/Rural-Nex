from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from finance.models import (
    BusinessActivity, 
    ActivityDriverTemplate, 
    SchemeMaster, 
    SchemeRule, 
    VerificationStatus, 
    SubsidyTiming, 
    BusinessSector,
    MoratoriumPolicy
)

class Command(BaseCommand):
    help = 'Seeds official government schemes, rule versions, and dynamic business activities with driver templates.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding dynamic Business Activities and Driver Templates...")
        self.seed_activities()
        self.stdout.write("Seeding official Government Schemes and Rule Versions...")
        self.seed_schemes()
        self.stdout.write(self.style.SUCCESS("Successfully seeded financial engine master data!"))

    def seed_activities(self):
        activities_data = [
            {
                "code": "dairy_farming",
                "name": "Dairy Farming & Milk Chilling",
                "sector": BusinessSector.AGRI_ALLIED,
                "icon": "Milk",
                "unit": "Litre of Milk",
                "desc": "Commercial dairy farm setup with high-yield milch animals, automated milking, and chilling infrastructure.",
                "sort": 1,
                "template": {
                    "base_capacity": Decimal('6200.00'),
                    "price": Decimal('62.00'),
                    "var_cost": Decimal('34.00'),
                    "days": 30,
                    "fixed_costs": [
                        {"name": "Caretaker & Milking Labor", "monthly_amount": 18000},
                        {"name": "Chiller & BMC Commercial Electricity", "monthly_amount": 7500},
                        {"name": "Veterinary & Medicine Allowance", "monthly_amount": 4500},
                        {"name": "Shed Sanitization & Maintenance", "monthly_amount": 3000},
                        {"name": "Insurance & Transport Logistics", "monthly_amount": 5000}
                    ],
                    "variable_costs": [
                        {"name": "High Protein Cattle Feed Pellets", "unit_cost": 22.0},
                        {"name": "Green Fodder & Silage", "unit_cost": 8.0},
                        {"name": "Testing Reagents & Consumables", "unit_cost": 4.0}
                    ],
                    "seasonal": [0.95, 0.98, 1.05, 1.08, 1.10, 1.05, 0.95, 0.90, 0.92, 0.96, 1.02, 1.05],
                    "capex": [
                        {"category": "productive_assets", "name": "High-Yield Milking Animals (HF / Murrah)", "quantity": 10, "unit_cost": 75000, "specification": "Lactating certified animals with insurance"},
                        {"category": "building_civil", "name": "Ventilated Cattle Shed & Concrete Flooring", "quantity": 1, "unit_cost": 250000, "specification": "1,200 sq.ft covered shed with slurry drainage"},
                        {"category": "plant_machinery", "name": "Automatic Milking Machine (2-Bucket)", "quantity": 1, "unit_cost": 65000, "specification": "Pneumatic pulsator SS clusters"},
                        {"category": "plant_machinery", "name": "Bulk Milk Cooler (BMC 500L Rapid Chiller)", "quantity": 1, "unit_cost": 160000, "specification": "Copeland compressor 4°C chilling"},
                        {"category": "plant_machinery", "name": "Motorized Chaff Cutter (3 HP)", "quantity": 1, "unit_cost": 35000, "specification": "Heavy duty commercial cutter"},
                        {"category": "plant_machinery", "name": "SS Milk Cans (40L) & Testing Kit", "quantity": 8, "unit_cost": 5000, "specification": "Food grade SS 304 cans"},
                        {"category": "pre_operative", "name": "FSSAI Dairy License & Panchayat NOC", "quantity": 1, "unit_cost": 25000, "specification": "Statutory registrations & EDP training"},
                        {"category": "working_capital", "name": "Initial Feed & Operating Reserve", "quantity": 1, "unit_cost": 75000, "specification": "1-month feed inventory buffer"}
                    ]
                }
            },
            {
                "code": "poultry_farming",
                "name": "Poultry Farming (Broiler & Layer)",
                "sector": BusinessSector.AGRI_ALLIED,
                "icon": "Egg",
                "unit": "Birds / Batch",
                "desc": "Environmentally controlled poultry shed with automatic feeding and drinking systems for high-protein meat/egg production.",
                "sort": 2,
                "template": {
                    "base_capacity": Decimal('4000.00'),
                    "price": Decimal('145.00'),
                    "var_cost": Decimal('92.00'),
                    "days": 30,
                    "fixed_costs": [
                        {"name": "Shed Supervisor & Labor", "monthly_amount": 16000},
                        {"name": "Ventilation & Heating Power", "monthly_amount": 8000},
                        {"name": "Biosecurity & Vaccine Disinfection", "monthly_amount": 4000},
                        {"name": "Bedding Litter Maintenance", "monthly_amount": 3000}
                    ],
                    "variable_costs": [
                        {"name": "Day-Old Chicks (DOC)", "unit_cost": 38.0},
                        {"name": "Broiler Starter & Finisher Mash", "unit_cost": 48.0},
                        {"name": "Medicines & Electrolytes", "unit_cost": 6.0}
                    ],
                    "seasonal": [1.0, 1.0, 1.1, 1.15, 0.85, 0.9, 0.95, 1.05, 1.1, 1.15, 1.2, 1.1],
                    "capex": [
                        {"category": "building_civil", "name": "Deep Litter Poultry Shed with Side Curtains", "quantity": 1, "unit_cost": 320000, "specification": "3,000 sq.ft biosecure shed"},
                        {"category": "plant_machinery", "name": "Automated Nipple Drinking & Feeder Lines", "quantity": 1, "unit_cost": 120000, "specification": "Pressure regulated water line"},
                        {"category": "plant_machinery", "name": "Foggers & Exhaust Ventilation Fans", "quantity": 4, "unit_cost": 15000, "specification": "Industrial exhaust fans for cooling"},
                        {"category": "productive_assets", "name": "Initial Batch Day-Old Chicks (DOC)", "quantity": 4000, "unit_cost": 36, "specification": "Commercial Cobb/Hubbard strain"},
                        {"category": "pre_operative", "name": "Pollution NOC & Vet Health Clearance", "quantity": 1, "unit_cost": 20000, "specification": "Clearances and registration"},
                        {"category": "working_capital", "name": "Feed Reserve (Starter/Finisher)", "quantity": 1, "unit_cost": 90000, "specification": "45-day cycle feed buffer"}
                    ]
                }
            },
            {
                "code": "food_processing",
                "name": "Food Processing & Agro Mills",
                "sector": BusinessSector.MANUFACTURING,
                "icon": "Factory",
                "unit": "Quintals of Flour/Oil",
                "desc": "Mini flour mill, mustard oil expeller, and spice pulverizing unit packaging value-added rural produce.",
                "sort": 3,
                "template": {
                    "base_capacity": Decimal('250.00'),
                    "price": Decimal('4200.00'),
                    "var_cost": Decimal('2900.00'),
                    "days": 26,
                    "fixed_costs": [
                        {"name": "Mill Operators (2 Technicians)", "monthly_amount": 24000},
                        {"name": "Commercial 3-Phase Electric Load", "monthly_amount": 14000},
                        {"name": "Rent / Shed Lease", "monthly_amount": 10000},
                        {"name": "Packaging Material & Pouches", "monthly_amount": 8000},
                        {"name": "Marketing & Local Van Delivery", "monthly_amount": 6000}
                    ],
                    "variable_costs": [
                        {"name": "Raw Wheat / Mustard Seed / Spices", "unit_cost": 2700.0},
                        {"name": "Processing Consumables & Bagging", "unit_cost": 200.0}
                    ],
                    "seasonal": [1.1, 1.15, 1.2, 0.9, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2],
                    "capex": [
                        {"category": "plant_machinery", "name": "Commercial Chakki Flour Mill (20 HP)", "quantity": 1, "unit_cost": 180000, "specification": "Stone chakki with cyclone dust collector"},
                        {"category": "plant_machinery", "name": "Mustard Oil Expeller (6-Bolt Unit)", "quantity": 1, "unit_cost": 220000, "specification": "Cold-press technology with filter press"},
                        {"category": "plant_machinery", "name": "Rotary Spice Pulverizer & Sifter", "quantity": 1, "unit_cost": 95000, "specification": "SS 304 food-grade contact parts"},
                        {"category": "plant_machinery", "name": "Automatic Form-Fill-Seal (FFS) Pouch Packer", "quantity": 1, "unit_cost": 140000, "specification": "Nitrogen-flushed heat sealer"},
                        {"category": "building_civil", "name": "Processing Shed Flooring & Hygienic Tiles", "quantity": 1, "unit_cost": 110000, "specification": "Epoxy floor & pest-proof wire mesh"},
                        {"category": "pre_operative", "name": "FSSAI Manufacturing License & Agmark NOC", "quantity": 1, "unit_cost": 35000, "specification": "Audit and compliance certification"},
                        {"category": "working_capital", "name": "Raw Grain & Seed Procurement Working Capital", "quantity": 1, "unit_cost": 150000, "specification": "Harvest season bulk buying"}
                    ]
                }
            },
            {
                "code": "cold_storage",
                "name": "Solar Micro Cold Storage & Warehousing",
                "sector": BusinessSector.MANUFACTURING,
                "icon": "Sun",
                "unit": "Tonne-Months Stored",
                "desc": "5–10 MT solar-powered micro cold room for farmgate horticulture produce preservation (tomatoes, potatoes, fruits).",
                "sort": 4,
                "template": {
                    "base_capacity": Decimal('120.00'),
                    "price": Decimal('2800.00'),
                    "var_cost": Decimal('650.00'),
                    "days": 30,
                    "fixed_costs": [
                        {"name": "Technical Caretaker", "monthly_amount": 14000},
                        {"name": "Solar Inverter & Battery Maintenance", "monthly_amount": 5000},
                        {"name": "Refrigerant & Filter Service", "monthly_amount": 3500},
                        {"name": "Crop Loss Insurance", "monthly_amount": 6000}
                    ],
                    "variable_costs": [
                        {"name": "Pre-cooling Trays & Handling Crates", "unit_cost": 450.0},
                        {"name": "Grid Backup Power Consumption", "unit_cost": 200.0}
                    ],
                    "seasonal": [0.8, 0.9, 1.2, 1.3, 1.4, 1.1, 0.8, 0.7, 0.8, 0.9, 1.1, 1.2],
                    "capex": [
                        {"category": "plant_machinery", "name": "10 MT Solar Cold Storage Room (PUF Panels)", "quantity": 1, "unit_cost": 750000, "specification": "100mm PUF insulation, hermetic condensing unit"},
                        {"category": "plant_machinery", "name": "Solar Rooftop Array (7.5 kW) with Hybrid Inverter", "quantity": 1, "unit_cost": 380000, "specification": "Monocrystalline panels with thermal storage backup"},
                        {"category": "building_civil", "name": "Civil Foundation, Plinth & Loading Bay", "quantity": 1, "unit_cost": 120000, "specification": "Weather-proof shed cover"},
                        {"category": "furniture_office", "name": "Plastic Crates & Multi-Tier Shelving Racks", "quantity": 1, "unit_cost": 70000, "specification": "Heavy duty perforated crates"},
                        {"category": "pre_operative", "name": "Solar Subvention Documentation & DIC NOC", "quantity": 1, "unit_cost": 30000, "specification": "Subsidy claim file processing"},
                        {"category": "working_capital", "name": "Handling & Initial Cash Buffer", "quantity": 1, "unit_cost": 50000, "specification": "Working buffer"}
                    ]
                }
            },
            {
                "code": "rural_retail",
                "name": "Rural Retail & Kirana Supermarket",
                "sector": BusinessSector.RETAIL,
                "icon": "ShoppingCart",
                "unit": "Footfalls / Transactions",
                "desc": "Organized self-service general store carrying grocery, FMCG, farm inputs, and daily household essentials.",
                "sort": 5,
                "template": {
                    "base_capacity": Decimal('2400.00'),
                    "price": Decimal('480.00'),
                    "var_cost": Decimal('380.00'),
                    "days": 28,
                    "fixed_costs": [
                        {"name": "Store Assistants (2 Staff)", "monthly_amount": 20000},
                        {"name": "Shop Rent", "monthly_amount": 12000},
                        {"name": "Lighting & Refrigerator Power", "monthly_amount": 7000},
                        {"name": "POS Software & Broadband", "monthly_amount": 2500},
                        {"name": "Losses, Pilferage & Wastage", "monthly_amount": 3500}
                    ],
                    "variable_costs": [
                        {"name": "Wholesale Stock Acquisition", "unit_cost": 365.0},
                        {"name": "Bagging & Customer Receipts", "unit_cost": 15.0}
                    ],
                    "seasonal": [0.95, 0.95, 1.05, 1.1, 0.95, 0.9, 0.95, 1.05, 1.15, 1.2, 1.1, 1.0],
                    "capex": [
                        {"category": "building_civil", "name": "Store False Ceiling, Lighting & Flooring", "quantity": 1, "unit_cost": 120000, "specification": "LED commercial fixtures and vitrified tiles"},
                        {"category": "furniture_office", "name": "Heavy-Duty Powder Coated Display Shelving Racks", "quantity": 1, "unit_cost": 140000, "specification": "Wall units and center gondolas"},
                        {"category": "plant_machinery", "name": "Commercial Deep Freezer & Display Visi-Cooler", "quantity": 2, "unit_cost": 45000, "specification": "For dairy, ice-cream and cold beverages"},
                        {"category": "furniture_office", "name": "POS Billing Terminal, Barcode Scanner & Cash Drawer", "quantity": 1, "unit_cost": 48000, "specification": "Thermal receipt printer and touch screen POS"},
                        {"category": "plant_machinery", "name": "CCTV Security Surveillance (4 HD Cameras)", "quantity": 1, "unit_cost": 28000, "specification": "With 1TB DVR and mobile viewing"},
                        {"category": "pre_operative", "name": "Shop & Establishment Registration & GST Setup", "quantity": 1, "unit_cost": 15000, "specification": "Legal compliance fees"},
                        {"category": "working_capital", "name": "Initial Inventory Stock (Grocery, FMCG, Cosmetics)", "quantity": 1, "unit_cost": 350000, "specification": "Direct distributor stock purchase"}
                    ]
                }
            },
            {
                "code": "custom_hiring_center",
                "name": "Agricultural Services & Custom Hiring Center",
                "sector": BusinessSector.SERVICE,
                "icon": "Tractor",
                "unit": "Machine Operating Hours",
                "desc": "Modern farm machinery rental hub (tractors, rotavators, laser levellers, drone spraying) for smallholder farmers.",
                "sort": 6,
                "template": {
                    "base_capacity": Decimal('180.00'),
                    "price": Decimal('1250.00'),
                    "var_cost": Decimal('520.00'),
                    "days": 25,
                    "fixed_costs": [
                        {"name": "Driver / Drone Pilot Retainer", "monthly_amount": 22000},
                        {"name": "Implement Garage Rent & Watchman", "monthly_amount": 8000},
                        {"name": "Comprehensive Machinery Insurance", "monthly_amount": 7500},
                        {"name": "Periodic Greasing & Maintenance", "monthly_amount": 4500}
                    ],
                    "variable_costs": [
                        {"name": "High Speed Diesel (HSD)", "unit_cost": 420.0},
                        {"name": "Wear & Tear Replacement Blades", "unit_cost": 100.0}
                    ],
                    "seasonal": [0.6, 0.7, 1.4, 1.5, 0.7, 0.5, 1.3, 1.4, 0.9, 1.2, 1.3, 0.8],
                    "capex": [
                        {"category": "plant_machinery", "name": "4WD 50 HP Agricultural Tractor", "quantity": 1, "unit_cost": 720000, "specification": "Power steering with dual clutch"},
                        {"category": "plant_machinery", "name": "Heavy Duty 7-Feet Rotavator", "quantity": 1, "unit_cost": 115000, "specification": "Boron steel multi-speed blades"},
                        {"category": "plant_machinery", "name": "Precision Laser Land Leveller", "quantity": 1, "unit_cost": 240000, "specification": "Dual transmitter system"},
                        {"category": "plant_machinery", "name": "Agricultural Drone Sprayer (10L Tank)", "quantity": 1, "unit_cost": 390000, "specification": "DGCA type-certified drone"},
                        {"category": "building_civil", "name": "Machinery Parking Shed & Workshop Pit", "quantity": 1, "unit_cost": 80000, "specification": "GI sheet roofing"},
                        {"category": "pre_operative", "name": "SMAM Scheme Registration & Insurance Cover", "quantity": 1, "unit_cost": 25000, "specification": "Portal registration"},
                        {"category": "working_capital", "name": "Fuel & Operating Reserve", "quantity": 1, "unit_cost": 60000, "specification": "Initial fuel fund"}
                    ]
                }
            }
        ]

        for item in activities_data:
            act, _ = BusinessActivity.objects.update_or_create(
                code=item["code"],
                defaults={
                    "name": item["name"],
                    "sector": item["sector"],
                    "icon": item["icon"],
                    "unit_of_measurement": item["unit"],
                    "description": item["desc"],
                    "sort_order": item["sort"],
                    "is_active": True
                }
            )

            tmpl = item["template"]
            ActivityDriverTemplate.objects.update_or_create(
                activity=act,
                defaults={
                    "base_capacity_monthly": tmpl["base_capacity"],
                    "default_selling_price": tmpl["price"],
                    "default_variable_cost_per_unit": tmpl["var_cost"],
                    "default_operating_days": tmpl["days"],
                    "default_fixed_costs": tmpl["fixed_costs"],
                    "default_variable_costs": tmpl["variable_costs"],
                    "seasonal_factors": tmpl["seasonal"],
                    "default_capex_breakdown": tmpl["capex"]
                }
            )

    def seed_schemes(self):
        schemes_data = [
            {
                "code": "PMEGP",
                "name": "Prime Minister's Employment Generation Programme (PMEGP)",
                "ministry": "Ministry of Micro, Small and Medium Enterprises (MoMSME) / KVIC",
                "url": "https://www.kviconline.gov.in/pmegp/",
                "type": "Back-Ended Capital Subsidy (TDR)",
                "desc": "Flagship credit-linked subsidy program providing 15% to 35% margin money subsidy for establishing new micro-enterprises.",
                "rule": {
                    "rule_version": "2026.01",
                    "effective_from": date(2024, 4, 1),
                    "verification_status": VerificationStatus.OFFICIAL,
                    "last_verified_date": date(2026, 1, 15),
                    "source_document": "KVIC Operational Guidelines for PMEGP (Ref: PMEGP/Policy/2024/72)",
                    "min_cost": Decimal('100000.00'),
                    "max_cost": Decimal('5000000.00'),
                    "max_loan": Decimal('4750000.00'),
                    "allowed_sectors": ["AGRI_ALLIED", "MANUFACTURING", "SERVICE"],
                    "allowed_locations": ["rural", "urban"],
                    "allowed_stages": ["new", "expansion"],
                    "min_age": 18,
                    "max_age": 65,
                    "min_education": "8th Pass (Mandatory for projects > ₹10 Lakh in manufacturing or > ₹5 Lakh in service)",
                    "promoter_contrib": {
                        "general": 10.0,
                        "special": 5.0,
                        "default": 10.0
                    },
                    "subsidy_matrix": {
                        "general_urban": 15.0,
                        "general_rural": 25.0,
                        "special_urban": 25.0,
                        "special_rural": 35.0,
                        "default": 25.0
                    },
                    "max_subsidy_cap": Decimal('1750000.00'),
                    "subsidy_timing": SubsidyTiming.BACK_ENDED,
                    "interest_rate": Decimal('8.50'),
                    "interest_subvention": Decimal('0.00'),
                    "tenure_months": 84,
                    "moratorium_months": 6,
                    "moratorium_policy": MoratoriumPolicy.PAY_INTEREST_ONLY,
                    "collateral_support": "CGTMSE coverage up to ₹2 Crore (100% collateral-free bank financing)",
                    "required_documents": [
                        "Promoter Aadhaar & PAN Card",
                        "Passport size photograph (3 copies)",
                        "Social Category / Caste Certificate (SC/ST/OBC/Minority/Divyang)",
                        "Rural Area Certificate from Gram Panchayat / BDO",
                        "Detailed Project Report (DPR) with machine quotations",
                        "Education Qualification Certificate (8th Pass marksheet minimum)",
                        "Rent / Lease deed or Land ownership record"
                    ]
                }
            },
            {
                "code": "MUDRA",
                "name": "Pradhan Mantri MUDRA Yojana (PMMY - Kishore & Tarun)",
                "ministry": "Department of Financial Services (DFS), Ministry of Finance",
                "url": "https://www.mudra.org.in/",
                "type": "Credit Guarantee Loan",
                "desc": "Refinanced institutional loans up to ₹20 Lakh for non-corporate micro enterprises without physical collateral.",
                "rule": {
                    "rule_version": "2026.01",
                    "effective_from": date(2024, 4, 1),
                    "verification_status": VerificationStatus.OFFICIAL,
                    "last_verified_date": date(2026, 1, 15),
                    "source_document": "DFS Circular Ref: MUDRA/2024-Tarun-Plus",
                    "min_cost": Decimal('50000.00'),
                    "max_cost": Decimal('2000000.00'),
                    "max_loan": Decimal('2000000.00'),
                    "allowed_sectors": ["AGRI_ALLIED", "MANUFACTURING", "SERVICE", "RETAIL"],
                    "allowed_locations": ["rural", "urban"],
                    "allowed_stages": ["new", "existing", "expansion", "modernization"],
                    "min_age": 18,
                    "max_age": 70,
                    "promoter_contrib": {
                        "general": 10.0,
                        "special": 10.0,
                        "default": 10.0
                    },
                    "subsidy_matrix": {
                        "default": 0.0
                    },
                    "max_subsidy_cap": Decimal('0.00'),
                    "subsidy_timing": SubsidyTiming.INTEREST_SUBVENTION,
                    "interest_rate": Decimal('9.00'),
                    "interest_subvention": Decimal('2.00'),
                    "tenure_months": 60,
                    "moratorium_months": 3,
                    "moratorium_policy": MoratoriumPolicy.PAY_INTEREST_ONLY,
                    "collateral_support": "Credit Guarantee Fund for Micro Units (CGFMU) Guarantee",
                    "required_documents": [
                        "Identity & Address Proof (Aadhaar / Voter ID)",
                        "Proof of Business Registration / Udyam Certificate",
                        "Quotations of machinery to be purchased",
                        "Bank statement for past 6 months"
                    ]
                }
            },
            {
                "code": "PMFME",
                "name": "PM Formalisation of Micro food processing Enterprises (PMFME)",
                "ministry": "Ministry of Food Processing Industries (MoFPI)",
                "url": "https://pmfme.mofpi.gov.in/",
                "type": "Credit-Linked Capital Subsidy",
                "desc": "Provides 35% credit-linked capital subsidy up to ₹10 Lakh for upgrading micro food processing units.",
                "rule": {
                    "rule_version": "2026.01",
                    "effective_from": date(2024, 4, 1),
                    "verification_status": VerificationStatus.OFFICIAL,
                    "last_verified_date": date(2026, 1, 15),
                    "source_document": "MoFPI PMFME Scheme Guidelines 2024",
                    "min_cost": Decimal('100000.00'),
                    "max_cost": Decimal('3000000.00'),
                    "max_loan": Decimal('2700000.00'),
                    "allowed_sectors": ["MANUFACTURING", "AGRI_ALLIED"],
                    "allowed_locations": ["rural", "urban"],
                    "allowed_stages": ["new", "existing", "expansion"],
                    "min_age": 18,
                    "promoter_contrib": {
                        "general": 10.0,
                        "special": 10.0,
                        "default": 10.0
                    },
                    "subsidy_matrix": {
                        "general_urban": 35.0,
                        "general_rural": 35.0,
                        "special_urban": 35.0,
                        "special_rural": 35.0,
                        "default": 35.0
                    },
                    "max_subsidy_cap": Decimal('1000000.00'),
                    "subsidy_timing": SubsidyTiming.CAPITAL_SUBSIDY,
                    "interest_rate": Decimal('8.75'),
                    "interest_subvention": Decimal('0.00'),
                    "tenure_months": 84,
                    "moratorium_months": 12,
                    "moratorium_policy": MoratoriumPolicy.PAY_INTEREST_ONLY,
                    "collateral_support": "CGTMSE coverage",
                    "required_documents": [
                        "Aadhaar, PAN, and Bank details",
                        "Food processing experience declaration",
                        "Machine quotations and FSSAI plan",
                        "Land possession / rental agreement"
                    ]
                }
            },
            {
                "code": "AIF",
                "name": "Agriculture Infrastructure Fund (AIF)",
                "ministry": "Ministry of Agriculture & Farmers Welfare",
                "url": "https://agriinfra.dac.gov.in/",
                "type": "Interest Subvention & Credit Guarantee",
                "desc": "Medium-long term debt financing for post-harvest management infrastructure and community farming assets with 3% interest subvention.",
                "rule": {
                    "rule_version": "2026.01",
                    "effective_from": date(2024, 4, 1),
                    "verification_status": VerificationStatus.OFFICIAL,
                    "last_verified_date": date(2026, 1, 15),
                    "source_document": "DA&FW Circular No. 1-1/2024-AIF",
                    "min_cost": Decimal('500000.00'),
                    "max_cost": Decimal('20000000.00'),
                    "max_loan": Decimal('18000000.00'),
                    "allowed_sectors": ["AGRI_ALLIED", "MANUFACTURING"],
                    "allowed_locations": ["rural", "urban"],
                    "allowed_stages": ["new", "expansion"],
                    "min_age": 18,
                    "promoter_contrib": {
                        "general": 10.0,
                        "special": 10.0,
                        "default": 10.0
                    },
                    "subsidy_matrix": {
                        "default": 0.0
                    },
                    "max_subsidy_cap": Decimal('0.00'),
                    "subsidy_timing": SubsidyTiming.INTEREST_SUBVENTION,
                    "interest_rate": Decimal('9.00'),
                    "interest_subvention": Decimal('3.00'),
                    "tenure_months": 84,
                    "moratorium_months": 12,
                    "moratorium_policy": MoratoriumPolicy.PAY_INTEREST_ONLY,
                    "collateral_support": "CGTMSE coverage with annual fee paid by Govt of India",
                    "required_documents": [
                        "Detailed DPR with civil blueprints and equipment quotes",
                        "Land title documents / 10-year lease",
                        "PAN, Aadhaar and GST registration",
                        "Audited financials if existing firm"
                    ]
                }
            },
            {
                "code": "STAND_UP_INDIA",
                "name": "Stand-Up India Scheme",
                "ministry": "Department of Financial Services, Ministry of Finance",
                "url": "https://www.standupmitra.in/",
                "type": "Composite Term & Working Capital Debt",
                "desc": "Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST and at least one Woman borrower per bank branch.",
                "rule": {
                    "rule_version": "2026.01",
                    "effective_from": date(2024, 4, 1),
                    "verification_status": VerificationStatus.OFFICIAL,
                    "last_verified_date": date(2026, 1, 15),
                    "source_document": "DFS Stand-Up India Notification 2024-25",
                    "min_cost": Decimal('1000000.00'),
                    "max_cost": Decimal('10000000.00'),
                    "max_loan": Decimal('8500000.00'),
                    "allowed_sectors": ["AGRI_ALLIED", "MANUFACTURING", "SERVICE", "RETAIL"],
                    "allowed_locations": ["rural", "urban"],
                    "allowed_stages": ["new"],
                    "min_age": 18,
                    "promoter_contrib": {
                        "general": 15.0,
                        "special": 10.0,
                        "default": 15.0
                    },
                    "subsidy_matrix": {
                        "default": 0.0
                    },
                    "max_subsidy_cap": Decimal('0.00'),
                    "subsidy_timing": SubsidyTiming.BACK_ENDED,
                    "interest_rate": Decimal('8.50'),
                    "interest_subvention": Decimal('0.00'),
                    "tenure_months": 84,
                    "moratorium_months": 18,
                    "moratorium_policy": MoratoriumPolicy.PAY_INTEREST_ONLY,
                    "collateral_support": "National Credit Guarantee Trustee Company (NCGTC) coverage",
                    "required_documents": [
                        "SC/ST Certificate or Female Gender verification",
                        "Project DPR with complete quotations",
                        "Bank statements and IT returns (if any)",
                        "Greenfield venture declaration"
                    ]
                }
            }
        ]

        for s_data in schemes_data:
            master, _ = SchemeMaster.objects.update_or_create(
                code=s_data["code"],
                defaults={
                    "name": s_data["name"],
                    "ministry": s_data["ministry"],
                    "official_portal_url": s_data["url"],
                    "scheme_type": s_data["type"],
                    "description": s_data["desc"],
                    "is_active": True
                }
            )

            r_data = s_data["rule"]
            SchemeRule.objects.update_or_create(
                scheme=master,
                rule_version=r_data["rule_version"],
                defaults={
                    "effective_from": r_data["effective_from"],
                    "verification_status": r_data["verification_status"],
                    "last_verified_date": r_data["last_verified_date"],
                    "source_document": r_data["source_document"],
                    "min_project_cost": r_data["min_cost"],
                    "max_project_cost": r_data["max_cost"],
                    "max_loan_amount": r_data["max_loan"],
                    "allowed_sectors": r_data["allowed_sectors"],
                    "allowed_locations": r_data["allowed_locations"],
                    "allowed_stages": r_data["allowed_stages"],
                    "min_promoter_age": r_data.get("min_age", 18),
                    "max_promoter_age": r_data.get("max_age"),
                    "min_education": r_data.get("min_education", ""),
                    "promoter_contribution_matrix": r_data["promoter_contrib"],
                    "subsidy_rate_matrix": r_data["subsidy_matrix"],
                    "max_subsidy_cap": r_data["max_subsidy_cap"],
                    "subsidy_timing": r_data["subsidy_timing"],
                    "interest_rate_annual": r_data["interest_rate"],
                    "interest_subvention_pct": r_data["interest_subvention"],
                    "tenure_months": r_data["tenure_months"],
                    "moratorium_months": r_data["moratorium_months"],
                    "moratorium_policy": r_data["moratorium_policy"],
                    "collateral_support": r_data["collateral_support"],
                    "required_documents": r_data["required_documents"]
                }
            )
