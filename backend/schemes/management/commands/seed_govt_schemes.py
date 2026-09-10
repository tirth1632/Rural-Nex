import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
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


class Command(BaseCommand):
    help = 'Seeds verified Central and State Government Schemes, categories, rules, and documents.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding dynamic government schemes repository..."))

        # -------------------------------------------------------------
        # 1. Scheme Categories
        # -------------------------------------------------------------
        categories_data = [
            {'name': 'Dairy & Livestock', 'slug': 'dairy-livestock', 'icon': 'Milk', 'order': 1, 'desc': 'Schemes supporting cattle, milk chilling hubs, breeding and animal husbandry.'},
            {'name': 'Agriculture & Food Processing', 'slug': 'agriculture-food', 'icon': 'Sprout', 'order': 2, 'desc': 'Post-harvest processing, cold storage, oil mills, flour units and organic food.'},
            {'name': 'MSME & Manufacturing', 'slug': 'msme-manufacturing', 'icon': 'Factory', 'order': 3, 'desc': 'Credit-linked subsidies, working capital and collateral-free term loans for rural enterprises.'},
            {'name': 'Women & SHGs', 'slug': 'women-shgs', 'icon': 'Users', 'order': 4, 'desc': 'Priority funding, 0% interest and high capital subsidies for women entrepreneurs.'},
            {'name': 'Renewable & Green Energy', 'slug': 'renewable-green', 'icon': 'Sun', 'order': 5, 'desc': 'Solar pumps, rooftop setups, biogas, and green infrastructure initiatives.'},
            {'name': 'Handicraft & Artisans', 'slug': 'handicraft-artisan', 'icon': 'Palette', 'order': 6, 'desc': 'Rural handloom, traditional craft workshops, toolkits and marketing support.'},
            {'name': 'Rural Services & Logistics', 'slug': 'rural-services', 'icon': 'Truck', 'order': 7, 'desc': 'Agri-drones, custom hiring centres, transport vehicles, repair workshops and rural retail.'},
            {'name': 'Fisheries & Aquaculture', 'slug': 'fisheries', 'icon': 'Fish', 'order': 8, 'desc': 'Fish farming ponds, biofloc, cold chains and marine value-addition.'},
            {'name': 'Farm Infrastructure & Storage', 'slug': 'infrastructure', 'icon': 'Warehouse', 'order': 9, 'desc': 'Warehouses, cold rooms, grading units, pack houses and modern silos.'},
            {'name': 'Tourism & Hospitality', 'slug': 'tourism-hospitality', 'icon': 'Compass', 'order': 10, 'desc': 'Homestays, eco-tourism, beach resorts and rural hospitality ventures.'},
            {'name': 'Digital, IT & Startups', 'slug': 'digital-startups', 'icon': 'Cpu', 'order': 11, 'desc': 'Co-working spaces, GCCs, tech innovation grants and startup incubators.'},
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

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(category_objs)} categories."))

        # -------------------------------------------------------------
        # 2. Central & State Schemes Master Data
        # -------------------------------------------------------------
        schemes_data = [
            # --- CENTRAL SCHEMES ---
            {
                'official_id': 'PMEGP',
                'name': "Prime Minister's Employment Generation Programme",
                'short_name': 'PMEGP',
                'slug': 'pmegp',
                'level': GovernmentLevel.CENTRAL,
                'state': '',
                'ministry': 'Ministry of Micro, Small and Medium Enterprises (MSME)',
                'department': 'Department of MSME',
                'nodal_agency': 'Khadi and Village Industries Commission (KVIC) & DIC',
                'category': category_objs['msme-manufacturing'],
                'sectors': ['Rural Manufacturing', 'Food Processing', 'Rural Services', 'Artisanal & Crafts'],
                'description': 'Flagship credit-linked capital subsidy programme designed to foster sustainable self-employment by assisting entrepreneurs to set up micro-enterprises in non-farm manufacturing and service sectors.',
                'short_description': 'Up to 35% capital subsidy (up to ₹17.5 Lakh) for non-farm rural manufacturing and service micro-enterprises.',
                'target_audience': 'Rural Individuals, SHGs, Co-operatives, Artisans (Age 18+, min 8th pass for >₹10L)',
                'official_portal_url': 'https://www.kviconline.gov.in/pmegpeportal/',
                'source_name': 'KVIC / Ministry of MSME Operational Guidelines',
                'source_document': 'MoMSME Circular No. PMEGP/Policy/2022-26',
                'source_document_date': datetime.date(2022, 6, 1),
                'last_verified_date': datetime.date(2026, 1, 15),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 100,
                'keywords': ['subsidy', 'manufacturing', 'service', 'kvic', 'pmegp', 'loan', 'capital subsidy'],
                'fin': {
                    'min_cost': Decimal('50000.00'),
                    'max_cost': Decimal('5000000.00'),
                    'max_loan': Decimal('4750000.00'),
                    'margin_gen': Decimal('10.00'),
                    'margin_spec': Decimal('5.00'),
                    'sub_gen_urb': Decimal('15.00'),
                    'sub_gen_rur': Decimal('25.00'),
                    'sub_spec_urb': Decimal('25.00'),
                    'sub_spec_rur': Decimal('35.00'),
                    'max_sub': Decimal('1750000.00'),
                    'timing': SubsidyTiming.BACK_ENDED,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('10.50'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 84,
                    'moratorium': 6,
                    'collateral': 'Collateral-free up to ₹10 Lakh (CGTMSE covered)',
                },
                'benefits': [
                    {'title': 'Capital Subsidy up to 35%', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('35.00'), 'max': Decimal('1750000.00'), 'primary': True, 'desc': '25% in urban, 35% in rural for special categories (Women, SC/ST/OBC/Minority/Divyang).'},
                    {'title': 'Low Promoter Margin (5% to 10%)', 'type': BenefitType.LOAN_SUPPORT, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('95.00'), 'desc': 'Banks finance 90% to 95% of total project outlay.'},
                    {'title': 'Collateral-Free Credit', 'type': BenefitType.COLLATERAL_FREE, 'calc': CalculationType.FIXED, 'fixed': Decimal('1000000.00'), 'desc': 'No third party guarantee or collateral security required up to ₹10 Lakh.'},
                ],
                'rules': [
                    {'field': 'age', 'op': '>=', 'val': 18, 'desc': 'Applicant must be at least 18 years of age.'},
                    {'field': 'business_stage', 'op': 'IN', 'val': ['new'], 'desc': 'Applicable only to new venture units.'},
                ],
                'docs': [
                    {'name': 'Aadhaar Card & PAN Card', 'req': RequirementLevel.REQUIRED, 'desc': 'Proof of identity and PAN.'},
                    {'name': 'Detailed Project Report (DPR)', 'req': RequirementLevel.REQUIRED, 'desc': 'Comprehensive technical and financial report.'},
                    {'name': 'Rural Area Certificate', 'req': RequirementLevel.REQUIRED, 'desc': 'Issued by Gram Panchayat / BDO.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Online Registration', 'desc': 'Submit application on KVIC e-portal.', 'portal': 'https://www.kviconline.gov.in/pmegpeportal/'},
                    {'step': 2, 'title': 'DPR Upload & Agency Forwarding', 'desc': 'Upload DPR and KYC documents.'},
                ]
            },

            {
                'official_id': 'PM_MUDRA',
                'name': 'Pradhan Mantri MUDRA Yojana',
                'short_name': 'PM MUDRA',
                'slug': 'pm-mudra',
                'level': GovernmentLevel.CENTRAL,
                'state': '',
                'ministry': 'Ministry of Finance / Department of Financial Services',
                'department': 'Department of Financial Services',
                'nodal_agency': 'MUDRA Ltd / Commercial Banks, RRBs & SFBs',
                'category': category_objs['msme-manufacturing'],
                'sectors': ['Rural Retail & Trading', 'Small Manufacturing', 'Rural Services', 'Allied Agriculture'],
                'description': 'National credit guarantee initiative providing institutional collateral-free loans up to ₹20 Lakh across Shishu, Kishore, Tarun, and Tarun Plus tiers.',
                'short_description': 'Collateral-free institutional bank loans up to ₹20 Lakh under Shishu, Kishore, and Tarun categories.',
                'target_audience': 'Shopkeepers, vendors, small manufacturers, rural repair workshops, transport operators',
                'official_portal_url': 'https://www.mudra.org.in/',
                'source_name': 'MUDRA / Department of Financial Services Portal',
                'source_document': 'DFS Guidelines on MUDRA Yojana 2024 Revision',
                'source_document_date': datetime.date(2024, 7, 23),
                'last_verified_date': datetime.date(2026, 1, 10),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['mudra', 'loan', 'collateral-free', 'shishu', 'kishore', 'tarun'],
                'fin': {
                    'min_cost': Decimal('10000.00'),
                    'max_cost': Decimal('2000000.00'),
                    'max_loan': Decimal('2000000.00'),
                    'margin_gen': Decimal('10.00'),
                    'margin_spec': Decimal('5.00'),
                    'sub_gen_urb': Decimal('0.00'),
                    'sub_gen_rur': Decimal('0.00'),
                    'sub_spec_urb': Decimal('0.00'),
                    'sub_spec_rur': Decimal('0.00'),
                    'max_sub': Decimal('0.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('11.50'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 60,
                    'moratorium': 6,
                    'collateral': '100% Collateral-Free via CGFMU Guarantee Cover',
                },
                'benefits': [
                    {'title': 'Collateral-Free Credit Guarantee', 'type': BenefitType.COLLATERAL_FREE, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('100.00'), 'primary': True, 'desc': 'Guaranteed by Credit Guarantee Fund for Micro Units (CGFMU).'},
                    {'title': 'Loans up to ₹20 Lakh', 'type': BenefitType.LOAN_SUPPORT, 'calc': CalculationType.FIXED, 'max': Decimal('2000000.00'), 'desc': 'Shishu, Kishore, Tarun, and Tarun Plus loan options.'},
                ],
                'rules': [
                    {'field': 'age', 'op': '>=', 'val': 18, 'desc': 'Minimum age 18 years.'},
                ],
                'docs': [
                    {'name': 'Aadhaar Card / Voter ID', 'req': RequirementLevel.REQUIRED, 'desc': 'Valid KYC proof.'},
                    {'name': 'Udyam Registration Certificate', 'req': RequirementLevel.REQUIRED, 'desc': 'MSME registration.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Apply on JanSamarth Portal', 'desc': 'Submit application online at www.jansamarth.in', 'portal': 'https://www.jansamarth.in/'},
                ]
            },

            {
                'official_id': 'PM_VISHWAKARMA',
                'name': 'PM Vishwakarma Scheme',
                'short_name': 'PM Vishwakarma',
                'slug': 'pm-vishwakarma',
                'level': GovernmentLevel.CENTRAL,
                'state': '',
                'ministry': 'Ministry of MSME & Ministry of Skill Development',
                'department': 'MSME',
                'nodal_agency': 'NSDC & District Industries Centre',
                'category': category_objs['handicraft-artisan'],
                'sectors': ['Artisanal & Crafts', 'Handicraft & Handloom', 'Rural Services'],
                'description': 'End-to-end support for traditional artisans and craftspeople across 18 trades including collateral-free credit up to ₹3 Lakh at 5% interest, toolkit incentive of ₹15,000, and skill training.',
                'short_description': 'Collateral-free loans up to ₹3 Lakh at 5% interest + ₹15,000 toolkit incentive for traditional artisans in 18 trades.',
                'target_audience': 'Carpenters, Blacksmiths, Masons, Tailors, Weavers, Potters, Sculptors, Toolmakers',
                'official_portal_url': 'https://pmvishwakarma.gov.in/',
                'source_name': 'PM Vishwakarma Official Portal',
                'source_document': 'Cabinet Resolution PM Vishwakarma 2023',
                'source_document_date': datetime.date(2023, 9, 17),
                'last_verified_date': datetime.date(2026, 1, 15),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['vishwakarma', 'artisan', 'craft', 'toolkit', '5% interest', 'collateral-free'],
                'fin': {
                    'min_cost': Decimal('15000.00'),
                    'max_cost': Decimal('300000.00'),
                    'max_loan': Decimal('300000.00'),
                    'margin_gen': Decimal('5.00'),
                    'margin_spec': Decimal('0.00'),
                    'sub_gen_urb': Decimal('0.00'),
                    'sub_gen_rur': Decimal('0.00'),
                    'sub_spec_urb': Decimal('0.00'),
                    'sub_spec_rur': Decimal('0.00'),
                    'max_sub': Decimal('15000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('5.00'),
                    'rate_max': Decimal('5.00'),
                    'subvention': Decimal('8.00'),
                    'subvention_years': 3,
                    'tenure': 36,
                    'moratorium': 6,
                    'collateral': '100% Collateral-Free Credit Guarantee Cover',
                },
                'benefits': [
                    {'title': '₹15,000 Toolkit E-Voucher Grant', 'type': BenefitType.GRANT, 'calc': CalculationType.FIXED, 'fixed': Decimal('15000.00'), 'primary': True, 'desc': 'Direct digital voucher for purchasing modern trade toolkits.'},
                    {'title': '5% Subsidized Interest Credit (up to ₹3 Lakh)', 'type': BenefitType.INTEREST_SUBVENTION, 'calc': CalculationType.FIXED, 'max': Decimal('300000.00'), 'desc': 'Tranche 1: ₹1 Lakh for 18 months; Tranche 2: ₹2 Lakh for 30 months at 5% net interest.'},
                ],
                'rules': [
                    {'field': 'age', 'op': '>=', 'val': 18, 'desc': 'Minimum age 18 years.'},
                ],
                'docs': [
                    {'name': 'Aadhaar & Bank Account', 'req': RequirementLevel.REQUIRED, 'desc': 'KYC and bank account.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'CSC Biometric Registration', 'desc': 'Register via CSC center on pmvishwakarma.gov.in', 'portal': 'https://pmvishwakarma.gov.in/'},
                ]
            },

            # --- ANDHRA PRADESH SCHEMES ---
            {
                'official_id': 'AP_ANNADATA',
                'name': 'Annadata Sukhibhava (formerly YSR Rythu Bharosa)',
                'short_name': 'Annadata Sukhibhava',
                'slug': 'annadata-sukhibhava',
                'level': GovernmentLevel.STATE,
                'state': 'Andhra Pradesh',
                'ministry': 'Department of Agriculture, Govt of Andhra Pradesh',
                'department': 'Agriculture Department',
                'nodal_agency': 'AP Agriculture Department',
                'category': category_objs['agriculture-food'],
                'sectors': ['Agriculture & Allied', 'Crop Farming'],
                'description': 'Flagship farmer financial support scheme in Andhra Pradesh providing ₹20,000 per year per farmer family via Direct Benefit Transfer (DBT) (combining ₹14,000 State support + ₹6,000 PM-KISAN).',
                'short_description': '₹20,000 annual direct cash transfer to farmer families in Andhra Pradesh.',
                'target_audience': 'Small & Marginal Farmer Families, Tenant Farmers (ROFR & CCEA) in AP',
                'official_portal_url': 'https://annadathasukhibhava.ap.gov.in/',
                'source_name': 'AP Agriculture Department Official Portal',
                'source_document': 'AP G.O. Ms. No. 12 Agriculture & Cooperation Dept 2024-26',
                'source_document_date': datetime.date(2024, 6, 15),
                'last_verified_date': datetime.date(2026, 2, 1),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 100,
                'keywords': ['andhra pradesh', 'annadata sukhibhava', 'rythu bharosa', 'dbt', 'farmer subsidy'],
                'fin': {
                    'min_cost': Decimal('0.00'),
                    'max_cost': Decimal('0.00'),
                    'max_loan': Decimal('0.00'),
                    'margin_gen': Decimal('0.00'),
                    'margin_spec': Decimal('0.00'),
                    'sub_gen_urb': Decimal('0.00'),
                    'sub_gen_rur': Decimal('0.00'),
                    'sub_spec_urb': Decimal('0.00'),
                    'sub_spec_rur': Decimal('0.00'),
                    'max_sub': Decimal('20000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('0.00'),
                    'rate_max': Decimal('0.00'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 0,
                    'moratorium': 0,
                    'collateral': 'Direct Cash Transfer (No Collateral / No Loan)',
                },
                'benefits': [
                    {'title': '₹20,000 Annual Direct Income Transfer', 'type': BenefitType.GRANT, 'calc': CalculationType.FIXED, 'fixed': Decimal('20000.00'), 'primary': True, 'desc': 'Paid in 3 seasonal installments directly to bank account for crop inputs.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Andhra Pradesh', 'desc': 'Must be resident of Andhra Pradesh.'},
                ],
                'docs': [
                    {'name': 'Aadhaar & Pattadar Passbook / Land Record', 'req': RequirementLevel.REQUIRED, 'desc': 'Land title deed or ROFR card for tenant farmers.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Rythu Seva Kendra (RSK) Verification', 'desc': 'Verify name in Grama Sachivalayam RSK e-Crop list.', 'portal': 'https://annadathasukhibhava.ap.gov.in/'},
                ]
            },

            {
                'official_id': 'AP_FOOD_PROC_4',
                'name': 'AP Food Processing Policy 4.0 (2024–29)',
                'short_name': 'AP Food Processing Policy 4.0',
                'slug': 'ap-food-processing-policy-4',
                'level': GovernmentLevel.STATE,
                'state': 'Andhra Pradesh',
                'ministry': 'Department of Industries & Commerce, Govt of AP',
                'department': 'AP Food Processing Society (APFPS)',
                'nodal_agency': 'AP Food Processing Society',
                'category': category_objs['agriculture-food'],
                'sectors': ['Food Processing', 'Agro-Based Business', 'Cold Storage', 'Rice Mills', 'Banana Ripening'],
                'description': 'Flagship AP Food Processing incentive policy offering 25% to 45% capital subsidy on Fixed Capital Investment (FCI), extra 10% for Women/SC/ST/BC/Minority entrepreneurs, ₹1/unit power tariff subsidy for 6 years, and food testing lab grants.',
                'short_description': '25% to 45% capital subsidy (up to ₹2.5 Cr) + ₹1/unit power tariff subsidy for food processing units in AP.',
                'target_audience': 'Micro/Small/Medium food processing units, FPOs, Agri-Cooperatives in AP',
                'official_portal_url': 'https://apexports.ap.gov.in/',
                'source_name': 'AP Food Processing Society Gazette',
                'source_document': 'AP G.O. Ms. No. 48 Industries & Commerce (FP) Dept 2024',
                'source_document_date': datetime.date(2024, 10, 1),
                'last_verified_date': datetime.date(2026, 1, 20),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['andhra pradesh', 'food processing policy 4.0', 'capital subsidy', 'power tariff subsidy', 'apfps'],
                'fin': {
                    'min_cost': Decimal('500000.00'),
                    'max_cost': Decimal('100000000.00'),
                    'max_loan': Decimal('80000000.00'),
                    'margin_gen': Decimal('15.00'),
                    'margin_spec': Decimal('10.00'),
                    'sub_gen_urb': Decimal('25.00'),
                    'sub_gen_rur': Decimal('35.00'),
                    'sub_spec_urb': Decimal('35.00'),
                    'sub_spec_rur': Decimal('45.00'),
                    'max_sub': Decimal('25000000.00'),
                    'timing': SubsidyTiming.BACK_ENDED,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('10.50'),
                    'subvention': Decimal('2.00'),
                    'subvention_years': 5,
                    'tenure': 84,
                    'moratorium': 12,
                    'collateral': 'CGTMSE / Collateral-Free Bank Financing',
                },
                'benefits': [
                    {'title': 'Capital Subsidy 25% to 45% of FCI', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('45.00'), 'max': Decimal('25000000.00'), 'primary': True, 'desc': 'Up to 45% capital subsidy for Women/SC/ST/BC entrepreneurs in rural AP.'},
                    {'title': 'Power Tariff Reimbursement (₹1/unit)', 'type': BenefitType.GRANT, 'calc': CalculationType.FIXED, 'desc': '₹1.00 per unit power cost subsidy for 6 years from commercial production.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Andhra Pradesh', 'desc': 'Unit location must be within Andhra Pradesh.'},
                ],
                'docs': [
                    {'name': 'AP Single Window Clearance / CFO', 'req': RequirementLevel.REQUIRED, 'desc': 'Consent for Operation from APPCB.'},
                    {'name': 'Detailed Project Report (DPR) & CA Certificate', 'req': RequirementLevel.REQUIRED, 'desc': 'FCI investment audit certificate.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Apply on AP Single Window Portal', 'desc': 'File incentive application on apexports.ap.gov.in', 'portal': 'https://apexports.ap.gov.in/'},
                ]
            },

            {
                'official_id': 'AP_MSME_4',
                'name': 'AP MSME & Entrepreneurship Development Policy 4.0 (2024–29)',
                'short_name': 'AP MSME Policy 4.0',
                'slug': 'ap-msme-policy-4',
                'level': GovernmentLevel.STATE,
                'state': 'Andhra Pradesh',
                'ministry': 'Department of Industries & Commerce, Govt of AP',
                'department': 'Directorate of Industries, AP',
                'nodal_agency': 'District Industries Centre (DIC) / APIIC',
                'category': category_objs['msme-manufacturing'],
                'sectors': ['Manufacturing', 'Services & Repair', 'Agro Processing', 'Logistics'],
                'description': 'Comprehensive state policy covering micro, small, and medium manufacturing and service enterprises in AP with 25% to 35% capital subsidy, interest subvention, power tariff subsidy, and 100% stamp duty waiver.',
                'short_description': '25%–35% capital subsidy (Micro cap ₹25L, Small cap ₹1.5 Cr) + interest subvention & SGST reimbursement in AP.',
                'target_audience': 'New Micro & Small Manufacturing & Service Enterprises in AP',
                'official_portal_url': 'https://industries.ap.gov.in/',
                'source_name': 'AP Industries Department Gazette',
                'source_document': 'AP G.O. Ms. No. 52 Industries & Commerce Dept 2024',
                'source_document_date': datetime.date(2024, 10, 15),
                'last_verified_date': datetime.date(2026, 1, 20),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['andhra pradesh', 'msme policy 4.0', 'capital subsidy', 'services', 'industries'],
                'fin': {
                    'min_cost': Decimal('100000.00'),
                    'max_cost': Decimal('50000000.00'),
                    'max_loan': Decimal('40000000.00'),
                    'margin_gen': Decimal('10.00'),
                    'margin_spec': Decimal('5.00'),
                    'sub_gen_urb': Decimal('20.00'),
                    'sub_gen_rur': Decimal('25.00'),
                    'sub_spec_urb': Decimal('30.00'),
                    'sub_spec_rur': Decimal('35.00'),
                    'max_sub': Decimal('15000000.00'),
                    'timing': SubsidyTiming.BACK_ENDED,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('10.50'),
                    'subvention': Decimal('3.00'),
                    'subvention_years': 5,
                    'tenure': 84,
                    'moratorium': 6,
                    'collateral': 'CGTMSE Coverage Available',
                },
                'benefits': [
                    {'title': '25% to 35% Fixed Capital Subsidy', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('35.00'), 'max': Decimal('15000000.00'), 'primary': True, 'desc': '35% capital subsidy for Women, SC/ST, BC and differently-abled entrepreneurs.'},
                    {'title': '3% Interest Subvention for 5 Years', 'type': BenefitType.INTEREST_SUBVENTION, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('3.00'), 'desc': '3% annual interest subvention on term loan.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Andhra Pradesh', 'desc': 'Unit must be located in Andhra Pradesh.'},
                ],
                'docs': [
                    {'name': 'Udyam Certificate & DIC Registration', 'req': RequirementLevel.REQUIRED, 'desc': 'Valid MSME Udyam registration.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Single Window Application', 'desc': 'File claim on industries.ap.gov.in', 'portal': 'https://industries.ap.gov.in/'},
                ]
            },

            {
                'official_id': 'AP_CLEAN_ENERGY_2024',
                'name': 'AP Integrated Clean Energy (ICE) Policy 2024',
                'short_name': 'AP ICE Policy 2024',
                'slug': 'ap-ice-policy-2024',
                'level': GovernmentLevel.STATE,
                'state': 'Andhra Pradesh',
                'ministry': 'Department of Energy, Govt of AP',
                'department': 'NREDCAP',
                'nodal_agency': 'New & Renewable Energy Development Corp of AP (NREDCAP)',
                'category': category_objs['renewable-green'],
                'sectors': ['Solar Energy', 'Renewable & Green Energy', 'EV Charging', 'Battery Storage'],
                'description': 'State policy targeting 160 GW clean energy capacity by 2030, offering up to 25% capital subsidy for solar/wind/electrolyzer manufacturing, 20% for battery units, 100% SGST reimbursement on rooftop solar, and land conversion fee waivers.',
                'short_description': 'Up to 25% capital subsidy for solar/wind manufacturing & 100% SGST refund on rooftop solar in AP.',
                'target_audience': 'Solar & Renewable Energy Developers, Rooftop Solar Installers, Battery Manufacturers in AP',
                'official_portal_url': 'https://nredcap.in/',
                'source_name': 'NREDCAP AP Official Gazette',
                'source_document': 'AP ICE Policy Resolution 2024',
                'source_document_date': datetime.date(2024, 11, 1),
                'last_verified_date': datetime.date(2026, 1, 25),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 90,
                'keywords': ['andhra pradesh', 'nredcap', 'solar policy', 'clean energy', 'rooftop solar'],
                'fin': {
                    'min_cost': Decimal('100000.00'),
                    'max_cost': Decimal('500000000.00'),
                    'max_loan': Decimal('400000000.00'),
                    'margin_gen': Decimal('15.00'),
                    'margin_spec': Decimal('10.00'),
                    'sub_gen_urb': Decimal('20.00'),
                    'sub_gen_rur': Decimal('25.00'),
                    'sub_spec_urb': Decimal('25.00'),
                    'sub_spec_rur': Decimal('25.00'),
                    'max_sub': Decimal('50000000.00'),
                    'timing': SubsidyTiming.BACK_ENDED,
                    'rate_min': Decimal('8.00'),
                    'rate_max': Decimal('10.00'),
                    'subvention': Decimal('3.00'),
                    'subvention_years': 5,
                    'tenure': 120,
                    'moratorium': 12,
                    'collateral': 'Project Assets & State Subvention Cover',
                },
                'benefits': [
                    {'title': 'Capital Subsidy up to 25%', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('25.00'), 'primary': True, 'desc': '25% capital subsidy for solar module and electrolyzer manufacturing.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Andhra Pradesh', 'desc': 'Project must be located in AP.'},
                ],
                'docs': [
                    {'name': 'NREDCAP Clearance Certificate', 'req': RequirementLevel.REQUIRED, 'desc': 'Project approval from NREDCAP.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Register on NREDCAP Portal', 'desc': 'File application on nredcap.in', 'portal': 'https://nredcap.in/'},
                ]
            },

            # --- BIHAR SCHEMES ---
            {
                'official_id': 'BIHAR_MMUY',
                'name': 'Mukhyamantri Udyami Yojana (MMUY - SC/ST/EBC/Women/Youth)',
                'short_name': 'Bihar Mukhyamantri Udyami Yojana',
                'slug': 'bihar-mukhyamantri-udyami-yojana',
                'level': GovernmentLevel.STATE,
                'state': 'Bihar',
                'ministry': 'Department of Industries, Govt of Bihar',
                'department': 'Industries Department, Bihar',
                'nodal_agency': 'Bihar Industrial Development Corporation / DIC',
                'category': category_objs['msme-manufacturing'],
                'sectors': ['Manufacturing', 'Food Processing', 'Services & Repair', 'Agro Processing'],
                'description': 'Flagship Bihar state entrepreneurship scheme providing up to ₹10 Lakh total financial assistance (50% direct grant/subsidy up to ₹5 Lakh + 50% interest-free or 1% low-interest term loan) for setting up new manufacturing and service units.',
                'short_description': '₹10 Lakh total assistance: 50% direct grant (up to ₹5L) + 50% interest-free loan for new micro-units in Bihar.',
                'target_audience': 'SC, ST, EBC, Women, and General Youth Residents of Bihar (Age 18–50, 10+2/ITI/Polytechnic)',
                'official_portal_url': 'https://udyami.bihar.gov.in/',
                'source_name': 'Bihar Udyami Official Portal',
                'source_document': 'Bihar Industries Department Notification MMUY 2024-26',
                'source_document_date': datetime.date(2024, 7, 1),
                'last_verified_date': datetime.date(2026, 2, 1),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 100,
                'keywords': ['bihar', 'udyami yojana', 'mmuy', '50% grant', 'interest free loan', 'industries bihar'],
                'fin': {
                    'min_cost': Decimal('100000.00'),
                    'max_cost': Decimal('1000000.00'),
                    'max_loan': Decimal('500000.00'),
                    'margin_gen': Decimal('0.00'),
                    'margin_spec': Decimal('0.00'),
                    'sub_gen_urb': Decimal('50.00'),
                    'sub_gen_rur': Decimal('50.00'),
                    'sub_spec_urb': Decimal('50.00'),
                    'sub_spec_rur': Decimal('50.00'),
                    'max_sub': Decimal('500000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('0.00'),
                    'rate_max': Decimal('1.00'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 84,
                    'moratorium': 12,
                    'collateral': '100% Collateral-Free State Guarantee',
                },
                'benefits': [
                    {'title': '50% Direct Capital Grant (up to ₹5 Lakh)', 'type': BenefitType.GRANT, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('50.00'), 'max': Decimal('500000.00'), 'primary': True, 'desc': '50% of project cost up to ₹5 Lakh provided as non-refundable state grant.'},
                    {'title': '50% Interest-Free Loan (7-Year Repayment)', 'type': BenefitType.LOAN_SUPPORT, 'calc': CalculationType.FIXED, 'fixed': Decimal('500000.00'), 'desc': 'Remaining 50% provided as loan (0% interest for Women/SC/ST/EBC; 1% for General Youth) in 84 monthly installments after 1 year moratorium.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Bihar', 'desc': 'Applicant must be a permanent resident of Bihar.'},
                    {'field': 'age', 'op': 'BETWEEN', 'val': [18, 50], 'desc': 'Age must be between 18 and 50 years.'},
                ],
                'docs': [
                    {'name': 'Bihar Domicile Certificate', 'req': RequirementLevel.REQUIRED, 'desc': 'Proof of residence in Bihar.'},
                    {'name': 'Educational Qualification (Intermediate / ITI / Diploma / Degree)', 'req': RequirementLevel.REQUIRED, 'desc': 'Minimum 10+2 pass certificate.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Online Portal Registration', 'desc': 'Apply with Aadhaar OTP on udyami.bihar.gov.in', 'portal': 'https://udyami.bihar.gov.in/'},
                ]
            },

            {
                'official_id': 'BIHAR_BLUY',
                'name': 'Bihar Laghu Udyami Yojana (BLUY)',
                'short_name': 'Bihar Laghu Udyami Yojana',
                'slug': 'bihar-laghu-udyami-yojana',
                'level': GovernmentLevel.STATE,
                'state': 'Bihar',
                'ministry': 'Department of Industries, Govt of Bihar',
                'department': 'Industries Department, Bihar',
                'nodal_agency': 'Directorate of Technical Development, Bihar',
                'category': category_objs['msme-manufacturing'],
                'sectors': ['Small Retail', 'Services & Repair', 'Handicrafts', 'Food Processing'],
                'description': 'Targeted livelihood scheme providing ₹2 Lakh direct financial grant (in 3 installments) to poor families in Bihar for starting small micro-enterprises across 62 eligible trades.',
                'short_description': '₹2 Lakh direct grant (100% non-refundable) in 3 installments for micro-business setup by poor families in Bihar.',
                'target_audience': 'Economically Poor Families in Bihar (Family income < ₹6,000/month as per Caste Survey)',
                'official_portal_url': 'https://udyami.bihar.gov.in/',
                'source_name': 'Bihar Industries Gazette',
                'source_document': 'Bihar Cabinet Decision BLUY 2024',
                'source_document_date': datetime.date(2024, 2, 1),
                'last_verified_date': datetime.date(2026, 1, 15),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['bihar', 'laghu udyami', 'bluy', '2 lakh grant', 'livelihood'],
                'fin': {
                    'min_cost': Decimal('50000.00'),
                    'max_cost': Decimal('200000.00'),
                    'max_loan': Decimal('0.00'),
                    'margin_gen': Decimal('0.00'),
                    'margin_spec': Decimal('0.00'),
                    'sub_gen_urb': Decimal('100.00'),
                    'sub_gen_rur': Decimal('100.00'),
                    'sub_spec_urb': Decimal('100.00'),
                    'sub_spec_rur': Decimal('100.00'),
                    'max_sub': Decimal('200000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('0.00'),
                    'rate_max': Decimal('0.00'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 0,
                    'moratorium': 0,
                    'collateral': '100% Direct Grant (No Loan / No Collateral)',
                },
                'benefits': [
                    {'title': '₹2 Lakh Direct Financial Assistance Grant', 'type': BenefitType.GRANT, 'calc': CalculationType.FIXED, 'fixed': Decimal('200000.00'), 'primary': True, 'desc': 'Disbursed in 3 installments (₹50,000 + ₹1,00,000 + ₹50,000) for toolkit and stock.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Bihar', 'desc': 'Must be resident of Bihar.'},
                ],
                'docs': [
                    {'name': 'Income Certificate (< ₹6,000/month)', 'req': RequirementLevel.REQUIRED, 'desc': 'Issued by Revenue Officer.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Apply on Udyami Portal', 'desc': 'Register online on udyami.bihar.gov.in', 'portal': 'https://udyami.bihar.gov.in/'},
                ]
            },

            # --- ASSAM SCHEMES ---
            {
                'official_id': 'ASSAM_APART',
                'name': 'Assam Agriculture and Rural Transformation Project (APART)',
                'short_name': 'Assam APART Project',
                'slug': 'assam-apart-project',
                'level': GovernmentLevel.STATE,
                'state': 'Assam',
                'ministry': 'Department of Agriculture, Govt of Assam / World Bank',
                'department': 'ARIAS Society, Assam',
                'nodal_agency': 'ARIAS Society',
                'category': category_objs['agriculture-food'],
                'sectors': ['Agribusiness', 'Agro Processing', 'Dairy & Livestock', 'Fisheries', 'Silk & Weaving'],
                'description': 'Flagship World Bank-assisted Assam state project supporting agribusiness value chains, FPOs, agro-processing clusters, custom hiring centres, and market linkage infrastructure across 24 districts in Assam.',
                'short_description': 'Agribusiness grants & post-harvest value chain infrastructure support for FPOs and entrepreneurs in Assam.',
                'target_audience': 'Agri-Entrepreneurs, FPOs, Micro-Processing Units, Dairy Cooperatives in Assam',
                'official_portal_url': 'https://arias.in/apart.html',
                'source_name': 'ARIAS Society Assam Portal',
                'source_document': 'Assam APART Project Guidelines 2024-26',
                'source_document_date': datetime.date(2024, 4, 1),
                'last_verified_date': datetime.date(2026, 1, 20),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 95,
                'keywords': ['assam', 'apart', 'arias', 'agribusiness', 'world bank', 'fpo subsidy'],
                'fin': {
                    'min_cost': Decimal('200000.00'),
                    'max_cost': Decimal('20000000.00'),
                    'max_loan': Decimal('15000000.00'),
                    'margin_gen': Decimal('10.00'),
                    'margin_spec': Decimal('10.00'),
                    'sub_gen_urb': Decimal('30.00'),
                    'sub_gen_rur': Decimal('40.00'),
                    'sub_spec_urb': Decimal('40.00'),
                    'sub_spec_rur': Decimal('50.00'),
                    'max_sub': Decimal('10000000.00'),
                    'timing': SubsidyTiming.BACK_ENDED,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('10.50'),
                    'subvention': Decimal('3.00'),
                    'subvention_years': 5,
                    'tenure': 84,
                    'moratorium': 12,
                    'collateral': 'Supported via NABARD / State Guarantee',
                },
                'benefits': [
                    {'title': 'Value Chain Machinery Subsidy up to 50%', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('50.00'), 'max': Decimal('10000000.00'), 'primary': True, 'desc': 'Subsidies for post-harvest, cold storage, sorting, packaging, and custom hiring machinery.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Assam', 'desc': 'Enterprise must operate in Assam.'},
                ],
                'docs': [
                    {'name': 'FPO / Enterprise Registration', 'req': RequirementLevel.REQUIRED, 'desc': 'Company / Cooperative registration.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Apply via District Agriculture Office', 'desc': 'Submit proposal to District Project Management Unit (DPMU) ARIAS.', 'portal': 'https://arias.in/apart.html'},
                ]
            },

            {
                'official_id': 'ASSAM_CMSGUY',
                'name': 'Chief Minister Samagra Gramya Unnayan Yojana (CMSGUY)',
                'short_name': 'Assam CMSGUY',
                'slug': 'assam-csguy',
                'level': GovernmentLevel.STATE,
                'state': 'Assam',
                'ministry': 'Mega Mission Society, Govt of Assam',
                'department': 'Agriculture & Rural Development',
                'nodal_agency': 'MMS-CMSGUY Assam',
                'category': category_objs['rural-services'],
                'sectors': ['Farm Mechanization', 'Dairy & Livestock', 'Fisheries', 'Rural Logistics'],
                'description': 'Assam state multi-sectoral rural transformation programme providing 70% subsidy on tractor packages to revenue villages, commercial poultry units, fish hatcheries, and rural logistics vehicles.',
                'short_description': '70% capital subsidy on farm mechanization, mini-trucks, and livestock units in Assam.',
                'target_audience': 'Village Youth Groups, Farmer Groups, Artisans, Smallholders in Assam',
                'official_portal_url': 'https://cmsguy.assam.gov.in/',
                'source_name': 'MMS-CMSGUY Assam Portal',
                'source_document': 'Assam CMSGUY Policy Circular 2024-26',
                'source_document_date': datetime.date(2024, 5, 10),
                'last_verified_date': datetime.date(2026, 1, 15),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 90,
                'keywords': ['assam', 'cmsguy', '70% subsidy', 'tractor package', 'rural development'],
                'fin': {
                    'min_cost': Decimal('100000.00'),
                    'max_cost': Decimal('1500000.00'),
                    'max_loan': Decimal('1000000.00'),
                    'margin_gen': Decimal('10.00'),
                    'margin_spec': Decimal('10.00'),
                    'sub_gen_urb': Decimal('50.00'),
                    'sub_gen_rur': Decimal('70.00'),
                    'sub_spec_urb': Decimal('70.00'),
                    'sub_spec_rur': Decimal('70.00'),
                    'max_sub': Decimal('1050000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('8.50'),
                    'rate_max': Decimal('10.50'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 60,
                    'moratorium': 6,
                    'collateral': 'State Subsidy-Linked Financing',
                },
                'benefits': [
                    {'title': '70% Capital Subsidy for Machinery & Vehicles', 'type': BenefitType.CAPITAL_SUBSIDY, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('70.00'), 'max': Decimal('1050000.00'), 'primary': True, 'desc': '70% state subsidy on tractors, implements, and mini transport vehicles.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Assam', 'desc': 'Beneficiaries must reside in Assam.'},
                ],
                'docs': [
                    {'name': 'Village Panchayat Recommendation', 'req': RequirementLevel.REQUIRED, 'desc': 'Panchayat endorsement.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Submit Application at Block Office', 'desc': 'File application with Block Development Officer.', 'portal': 'https://cmsguy.assam.gov.in/'},
                ]
            },

            # --- CHHATTISGARH SCHEMES ---
            {
                'official_id': 'CG_KISAN_SAMRIDHI',
                'name': 'Chhattisgarh Kisan Samridhi Yojana',
                'short_name': 'CG Kisan Samridhi',
                'slug': 'cg-kisan-samridhi-yojana',
                'level': GovernmentLevel.STATE,
                'state': 'Chhattisgarh',
                'ministry': 'Department of Agriculture, Govt of Chhattisgarh',
                'department': 'Agriculture Department, CG',
                'nodal_agency': 'Integrated Kisan Portal / Sewa Setu CG',
                'category': category_objs['agriculture-food'],
                'sectors': ['Agriculture & Allied', 'Irrigation & Pumps', 'Farm Equipment'],
                'description': 'Chhattisgarh state scheme providing up to 75% subsidy for installing electric/solar tubewells, borewell pumps, and micro-irrigation equipment for small & marginal farmers across all districts.',
                'short_description': 'Up to 75% subsidy (max ₹43,000 per borewell) for irrigation pumps & farm equipment in Chhattisgarh.',
                'target_audience': 'Small, Marginal, SC/ST Farmers in Chhattisgarh',
                'official_portal_url': 'https://agriportal.cg.nic.in/',
                'source_name': 'CG Agriculture Portal / Sewa Setu',
                'source_document': 'CG Agriculture Dept Notification 2024-26',
                'source_document_date': datetime.date(2024, 4, 15),
                'last_verified_date': datetime.date(2026, 1, 20),
                'verification_status': VerificationStatus.OFFICIAL,
                'scheme_version': '2026.01',
                'priority_score': 90,
                'keywords': ['chhattisgarh', 'kisan samridhi', 'pump subsidy', 'borewell', 'sewa setu'],
                'fin': {
                    'min_cost': Decimal('20000.00'),
                    'max_cost': Decimal('100000.00'),
                    'max_loan': Decimal('0.00'),
                    'margin_gen': Decimal('25.00'),
                    'margin_spec': Decimal('10.00'),
                    'sub_gen_urb': Decimal('50.00'),
                    'sub_gen_rur': Decimal('60.00'),
                    'sub_spec_urb': Decimal('75.00'),
                    'sub_spec_rur': Decimal('75.00'),
                    'max_sub': Decimal('43000.00'),
                    'timing': SubsidyTiming.UPFRONT,
                    'rate_min': Decimal('0.00'),
                    'rate_max': Decimal('0.00'),
                    'subvention': Decimal('0.00'),
                    'subvention_years': 0,
                    'tenure': 0,
                    'moratorium': 0,
                    'collateral': 'Direct Input Subsidy (No Collateral)',
                },
                'benefits': [
                    {'title': '75% Subsidy for Borewell & Pump Setup', 'type': BenefitType.GRANT, 'calc': CalculationType.PERCENTAGE, 'pct': Decimal('75.00'), 'max': Decimal('43000.00'), 'primary': True, 'desc': '75% subsidy for SC/ST/Small farmers on borewell digging and pump installation.'},
                ],
                'rules': [
                    {'field': 'state', 'op': '=', 'val': 'Chhattisgarh', 'desc': 'Land must be located in Chhattisgarh.'},
                ],
                'docs': [
                    {'name': 'Khasra B-1 Land Record', 'req': RequirementLevel.REQUIRED, 'desc': 'Proof of agricultural land.'},
                ],
                'steps': [
                    {'step': 1, 'title': 'Apply on CG Sewa Setu Portal', 'desc': 'Submit online application on agriportal.cg.nic.in', 'portal': 'https://agriportal.cg.nic.in/'},
                ]
            }
        ]

        # Process all schemes data
        for item in schemes_data:
            scheme_obj, created = GovtScheme.objects.update_or_create(
                official_id=item['official_id'],
                defaults={
                    'name': item['name'],
                    'short_name': item['short_name'],
                    'slug': item['slug'],
                    'level': item['level'],
                    'state': item['state'],
                    'ministry': item['ministry'],
                    'department': item.get('department', ''),
                    'nodal_agency': item.get('nodal_agency', ''),
                    'category': item['category'],
                    'sectors': item['sectors'],
                    'description': item['description'],
                    'short_description': item['short_description'],
                    'target_audience': item['target_audience'],
                    'official_portal_url': item['official_portal_url'],
                    'source_name': item['source_name'],
                    'source_document': item['source_document'],
                    'source_document_date': item.get('source_document_date'),
                    'last_verified_date': item['last_verified_date'],
                    'verification_status': item['verification_status'],
                    'scheme_version': item['scheme_version'],
                    'priority_score': item['priority_score'],
                    'keywords': item['keywords'],
                    'status': SchemeStatus.ACTIVE
                }
            )
            verb = "Created" if created else "Updated"
            self.stdout.write(f"  [{verb}] {scheme_obj.short_name} ({scheme_obj.state or 'Central Government'})")

            # 1. Financial Rule
            fin = item['fin']
            SchemeFinancialRule.objects.update_or_create(
                scheme=scheme_obj,
                defaults={
                    'min_project_cost': fin['min_cost'],
                    'max_project_cost': fin['max_cost'],
                    'max_loan_amount': fin['max_loan'],
                    'min_promoter_margin_pct': fin['margin_gen'],
                    'promoter_margin_special_pct': fin['margin_spec'],
                    'subsidy_rate_general_urban': fin['sub_gen_urb'],
                    'subsidy_rate_general_rural': fin['sub_gen_rur'],
                    'subsidy_rate_special_urban': fin['sub_spec_urb'],
                    'subsidy_rate_special_rural': fin['sub_spec_rur'],
                    'max_subsidy_amount': fin['max_sub'],
                    'subsidy_timing': fin['timing'],
                    'interest_rate_min': fin['rate_min'],
                    'interest_rate_max': fin['rate_max'],
                    'interest_subvention_pct': fin['subvention'],
                    'subvention_tenure_years': fin['subvention_years'],
                    'tenure_months_max': fin['tenure'],
                    'moratorium_months_max': fin['moratorium'],
                    'collateral_type': fin['collateral']
                }
            )

            # 2. Benefits
            SchemeBenefit.objects.filter(scheme=scheme_obj).delete()
            for b_data in item.get('benefits', []):
                SchemeBenefit.objects.create(
                    scheme=scheme_obj,
                    title=b_data['title'],
                    benefit_type=b_data['type'],
                    calculation_type=b_data.get('calc', CalculationType.PERCENTAGE),
                    percentage=b_data.get('pct'),
                    fixed_amount=b_data.get('fixed'),
                    max_amount=b_data.get('max'),
                    is_primary=b_data.get('primary', False),
                    conditions=b_data.get('desc', '')
                )

            # 3. Eligibility Rules
            SchemeEligibilityRule.objects.filter(scheme=scheme_obj).delete()
            for r_data in item.get('rules', []):
                SchemeEligibilityRule.objects.create(
                    scheme=scheme_obj,
                    field=r_data['field'],
                    operator=r_data['op'],
                    expected_value=r_data['val'],
                    rule_description=r_data['desc'],
                    is_mandatory=True
                )

            # 4. Documents
            SchemeDocument.objects.filter(scheme=scheme_obj).delete()
            for idx, d_data in enumerate(item.get('docs', []), 1):
                SchemeDocument.objects.create(
                    scheme=scheme_obj,
                    name=d_data['name'],
                    requirement_level=d_data.get('req', RequirementLevel.REQUIRED),
                    description=d_data.get('desc', ''),
                    sort_order=idx
                )

            # 5. Application Steps
            SchemeApplicationStep.objects.filter(scheme=scheme_obj).delete()
            for s_data in item.get('steps', []):
                SchemeApplicationStep.objects.create(
                    scheme=scheme_obj,
                    step_number=s_data['step'],
                    title=s_data['title'],
                    description=s_data['desc'],
                    portal_url=s_data.get('portal', scheme_obj.official_portal_url),
                    expected_time_days=7
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {GovtScheme.objects.count()} verified government schemes into Django DB!"))
