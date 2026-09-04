import type { GovScheme } from '../types';

export const mockGovSchemes: GovScheme[] = [
  {
    id: 'SCH-01',
    code: 'PMEGP',
    name: 'Prime Minister Employment Generation Programme',
    department: 'Ministry of MSME, Govt. of India',
    maxSubsidyPercent: 35,
    maxSubsidyAmountRupees: 1750000,
    maxLoanAmountRupees: 5000000,
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'Women', 'Ex-Servicemen'],
    eligibleSectors: ['Manufacturing', 'Agro-Processing', 'Services', 'Handicraft'],
    keyBenefits: [
      '35% Margin Money Subsidy for Special Category (Rural SC/ST/OBC/Women)',
      '25% Margin Money Subsidy for General Category (Rural)',
      'Bank financing up to 95% of total project cost'
    ],
    documentsRequired: [
      'Aadhaar Card & PAN',
      'Detailed Project Report (DPR)',
      'EDP Training Certificate',
      'Caste/Category Certificate (if applicable)',
      'Land Title / Lease Agreement'
    ],
    portalUrl: 'https://www.kviconline.gov.in/pmegpportal/',
    applicationStatus: 'Eligible',
  },
  {
    id: 'SCH-02',
    code: 'PMFME',
    name: 'PM Formalisation of Micro Food Processing Enterprises',
    department: 'Ministry of Food Processing Industries',
    maxSubsidyPercent: 35,
    maxSubsidyAmountRupees: 1000000,
    maxLoanAmountRupees: 3000000,
    eligibleCategories: ['Micro Enterprise', 'SHG Member', 'FPO', 'Individual Farmer'],
    eligibleSectors: ['Food Processing', 'Dairy', 'Spices', 'Bakery', 'Fruit Pulping'],
    keyBenefits: [
      '35% credit-linked capital subsidy up to ₹10 Lakh',
      'Seed capital of ₹40,000 per SHG member for working capital & small tools',
      'Branding and marketing support for ODOP (One District One Product)'
    ],
    documentsRequired: [
      'FSSAI Registration Copy',
      'Identity Proof (Aadhaar/Voter ID)',
      'Bank Account Statement (6 Months)',
      'Project Cost Breakdown Sheet'
    ],
    portalUrl: 'https://pmfme.mofpi.gov.in/',
    applicationStatus: 'Eligible',
  },
  {
    id: 'SCH-03',
    code: 'MUDRA-TARUN',
    name: 'Pradhan Mantri MUDRA Yojana (Tarun Category)',
    department: 'Department of Financial Services, Ministry of Finance',
    maxSubsidyPercent: 0,
    maxSubsidyAmountRupees: 0,
    maxLoanAmountRupees: 1000000,
    eligibleCategories: ['General', 'OBC', 'SC', 'ST', 'Women Entrepreneurs'],
    eligibleSectors: ['Retail Trade', 'Small Manufacturing', 'Dairy & Transport'],
    keyBenefits: [
      'No collateral requirement for loans up to ₹10 Lakh',
      'Low interest rates starting from 8.50% p.a.',
      'Issued with MUDRA Card for flexible working capital withdrawals'
    ],
    documentsRequired: [
      'MUDRA Application Form',
      'Proof of Business Identity / Udyam Registration',
      '2 Passport size photos',
      'Quotation of machinery to be purchased'
    ],
    portalUrl: 'https://www.mudra.org.in/',
    applicationStatus: 'Eligible',
  },
  {
    id: 'SCH-04',
    code: 'AIF',
    name: 'Agriculture Infrastructure Fund (AIF)',
    department: 'Department of Agriculture & Farmers Welfare',
    maxSubsidyPercent: 3,
    maxSubsidyAmountRupees: 2000000,
    maxLoanAmountRupees: 20000000,
    eligibleCategories: ['Agri Entrepreneurs', 'FPOs', 'PACS', 'Startups'],
    eligibleSectors: ['Cold Chain', 'Assaying Units', 'Custom Hiring Centers', 'Silos'],
    keyBenefits: [
      '3% per annum interest subvention up to ₹2 Crore loan for 7 years',
      'Credit guarantee coverage under CGTMSE for loans up to ₹2 Crore',
      'Moratorium period up to 2 years'
    ],
    documentsRequired: [
      'Land ownership documents / long-term lease',
      'Detailed Project Report with cash flow projections',
      'KYC documents of Directors/Proprietor'
    ],
    portalUrl: 'https://agriinfra.dac.gov.in/',
    applicationStatus: 'Eligible',
  },
  {
    id: 'SCH-05',
    code: 'STANDUP-INDIA',
    name: 'Stand-Up India Scheme',
    department: 'SIDBI / Ministry of Finance',
    maxSubsidyPercent: 15,
    maxSubsidyAmountRupees: 1500000,
    maxLoanAmountRupees: 10000000,
    eligibleCategories: ['SC', 'ST', 'Women Entrepreneurs'],
    eligibleSectors: ['Manufacturing', 'Services', 'Agri-Allied Trading'],
    keyBenefits: [
      'Bank loans between ₹10 Lakh and ₹1 Crore for greenfield enterprises',
      'Composite loan covering equipment purchase and working capital',
      'Handholding support through Stand-Up Mitra portal'
    ],
    documentsRequired: [
      'Caste certificate for SC/ST applicants',
      'Project Feasibility Dossier',
      'Bank Statement for 12 months'
    ],
    portalUrl: 'https://www.standupmitra.in/',
    applicationStatus: 'Action Required',
  }
];
