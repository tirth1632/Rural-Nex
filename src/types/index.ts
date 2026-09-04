export type UserRole = 'entrepreneur' | 'analyst' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  district: string;
  state: string;
  village: string;
  category: 'General' | 'OBC' | 'SC' | 'ST';
  education: string;
  experienceYears: number;
  availableCapital: number;
}

export interface BusinessOpportunity {
  id: string;
  name: string;
  category: string;
  feasibilityScore: number; // 0-100
  demandScore: number;
  competitionScore: number;
  capitalFitScore: number;
  govSupportScore: number;
  minInvestment: number; // Rupees
  maxInvestment: number;
  marketDemand: 'High' | 'Moderate' | 'Low';
  competitionLevel: 'Low' | 'Moderate' | 'High';
  paybackPeriodMonths: number;
  subsidyPercentage: number;
  description: string;
  keyRisks: string[];
  certifications: string[];
  equipmentNeeded: string[];
}

export interface Competitor {
  id: string;
  name: string;
  category: string;
  village: string;
  distanceKm: number;
  dailyCapacity: string;
  pricePerUnit: number;
  marketSharePercent: number;
  threatLevel: 'Low' | 'Moderate' | 'High';
  rating: number;
  lat: number;
  lng: number;
  phone: string;
}

export interface GovScheme {
  id: string;
  code: string;
  name: string;
  department: string;
  maxSubsidyPercent: number;
  maxSubsidyAmountRupees: number;
  maxLoanAmountRupees: number;
  eligibleCategories: string[];
  eligibleSectors: string[];
  keyBenefits: string[];
  documentsRequired: string[];
  portalUrl: string;
  applicationStatus?: 'Eligible' | 'Action Required' | 'Applied' | 'Approved';
}

export interface MarketIndicator {
  location: string;
  category: string;
  radiusKm: number;
  saturationIndexPercent: number;
  estimatedDailyCustomers: number;
  avgPricePerUnitRupees: number;
  projectedMonthlyDemandRupees: number;
  supplyDeficitPercent: number;
  nearbyCompetitorCount: number;
  demandForecast: { month: string; demand: number; supply: number }[];
  priceBenchmark: { block: string; price: number }[];
}

export interface FinancialCalculation {
  projectCost: number;
  ownContribution: number;
  subsidyAmount: number;
  loanAmount: number;
  interestRate: number; // annual %
  tenureYears: number; // years
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  ltvRatio: number; // %
  projectedAnnualRevenue: number;
  projectedAnnualOpEx: number;
  netOperatingProfit: number;
  dscr: number; // Debt Service Coverage Ratio
  breakEvenMonths: number;
  roiPercent: number;
}

export interface AIAdvisorResponse {
  context: {
    user: string;
    location: string;
    capital: number;
    preferredCategory: string;
  };
  executiveSummary: string;
  feasibilityScore: number;
  topOpportunities: {
    name: string;
    score: number;
    whyItFits: string;
    estimatedCost: number;
  }[];
  riskMatrix: { risk: string; mitigation: string; severity: 'High' | 'Medium' | 'Low' }[];
  regulatoryChecklist: { title: string; agency: string; timeline: string }[];
  roadmap: { phase: string; timeline: string; tasks: string[] }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}
