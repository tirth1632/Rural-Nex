export interface CapExItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit?: string;
  unit_cost: number;
  total_amount: number;
  specification?: string;
  sourceType?: 'USER INPUT' | 'DATASET FACT' | 'CALCULATED' | 'REFERENCE BENCHMARK';
}

export interface LoanParams {
  principal: number;
  annualRatePct: number;
  tenureMonths: number;
  moratoriumMonths: number;
}

export interface AmortizationRow {
  month: number;
  year: number;
  isMoratorium: boolean;
  openingPrincipal: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  closingPrincipal: number;
}

export interface AmortizationSummary {
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  monthlyEMI: number;
  schedule: AmortizationRow[];
  annualSchedule: Array<{
    year: number;
    openingPrincipal: number;
    totalPayment: number;
    principalPayment: number;
    interestPayment: number;
    closingPrincipal: number;
  }>;
}

export interface FinancialForecastParams {
  baseMonthlyRevenue: number;
  baseMonthlyOpEx: number;
  revenueGrowthPct: number;
  expenseGrowthPct: number;
  taxRatePct?: number;
}

export interface YearForecast {
  year: number;
  revenue: number;
  operatingCosts: number;
  ebitda: number;
  ebitdaMarginPct: number;
  interestExpense: number;
  depreciation: number;
  profitBeforeTax: number;
  tax: number;
  netProfit: number;
  principalRepayment: number;
  debtService: number;
  cashFlow: number;
  closingDebtBalance: number;
  isInterestReconciled: boolean;
}

/**
 * Calculates 5-Year P&L & Cash Flow Forecast.
 * Single source of truth: Interest & Principal Repayment strictly derived from Step 6 Amortization Schedule.
 */
export function calculate5YearForecast(
  params: FinancialForecastParams,
  amortization: AmortizationSummary,
  totalProjectCost: number,
  targetYears?: number
): YearForecast[] {
  const { baseMonthlyRevenue, baseMonthlyOpEx, revenueGrowthPct, expenseGrowthPct, taxRatePct = 15 } = params;
  const forecasts: YearForecast[] = [];

  // Determine total forecast years: use targetYears or max year in amortization schedule (min 5 years)
  const scheduleMaxYear = amortization.annualSchedule?.length
    ? Math.max(...amortization.annualSchedule.map(a => a.year))
    : 5;
  const totalYears = Math.max(5, targetYears || scheduleMaxYear || 5);

  // Straight line planning depreciation basis (10% per annum benchmark)
  const annualDepreciation = Math.max(0, totalProjectCost * 0.10);

  // Interest Reconciliation Audit: Check total interest across forecast period vs schedule
  const totalScheduleInterest = (amortization.annualSchedule || [])
    .filter(a => a.year <= totalYears)
    .reduce((sum, a) => sum + (a.interestPayment || 0), 0);
  let accumulatedForecastInterest = 0;

  for (let yr = 1; yr <= totalYears; yr++) {
    const revMultiplier = Math.pow(1 + Math.max(-50, revenueGrowthPct) / 100, yr - 1);
    const expMultiplier = Math.pow(1 + Math.max(-50, expenseGrowthPct) / 100, yr - 1);

    const annualRevenue = Math.max(0, (baseMonthlyRevenue * 12) * revMultiplier);
    const annualOpEx = Math.max(0, (baseMonthlyOpEx * 12) * expMultiplier);
    const ebitda = annualRevenue - annualOpEx;
    const ebitdaMarginPct = annualRevenue > 0 ? Number(((ebitda / annualRevenue) * 100).toFixed(1)) : 0;

    const yrAmort = amortization.annualSchedule.find(a => a.year === yr) || {
      interestPayment: 0,
      principalPayment: 0,
      totalPayment: 0,
      closingPrincipal: 0
    };

    const interestExpense = Math.max(0, yrAmort.interestPayment);
    const principalRepayment = Math.max(0, yrAmort.principalPayment);
    const debtService = Math.max(0, yrAmort.totalPayment);
    const closingDebtBalance = Math.max(0, yrAmort.closingPrincipal);

    accumulatedForecastInterest += interestExpense;

    const pbt = ebitda - annualDepreciation - interestExpense;
    const tax = pbt > 0 ? (pbt * (taxRatePct / 100)) : 0;
    const netProfit = pbt - tax;

    // Cash Flow = Net Profit + Depreciation - Principal Repayment
    const cashFlow = netProfit + annualDepreciation - principalRepayment;

    forecasts.push({
      year: yr,
      revenue: Math.round(annualRevenue),
      operatingCosts: Math.round(annualOpEx),
      ebitda: Math.round(ebitda),
      ebitdaMarginPct,
      interestExpense: Math.round(interestExpense),
      depreciation: Math.round(annualDepreciation),
      profitBeforeTax: Math.round(pbt),
      tax: Math.round(tax),
      netProfit: Math.round(netProfit),
      principalRepayment: Math.round(principalRepayment),
      debtService: Math.round(debtService),
      cashFlow: Math.round(cashFlow),
      closingDebtBalance: Math.round(closingDebtBalance),
      isInterestReconciled: true
    });
  }

  // Final Reconciliation check: verify interest reconciliation flag across forecast rows
  const isReconciled = Math.abs(accumulatedForecastInterest - totalScheduleInterest) < 100 || amortization.schedule.length === 0;
  forecasts.forEach(f => {
    f.isInterestReconciled = isReconciled;
  });

  return forecasts;
}

export interface ScoreBreakdown {
  profitabilityScore: number; // max 20
  debtServiceScore: number; // max 20
  cashFlowScore: number; // max 15
  breakEvenScore: number; // max 10
  downsideResilienceScore: number; // max 15
  promoterEquityScore: number; // max 10
  dataConfidenceScore: number; // max 10
  totalScore: number; // max 100
}

export interface ReverseStressTestResult {
  maxRevenueDeclinePct: number;
  maxOpExEscalationPct: number;
  revenueBreakEvenPoint: number;
  opexStressLimit: number;
  message: string;
}

export interface RiskItem {
  id: string;
  category: string;
  riskName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  mitigation: string;
}

export interface FinancialRatios {
  totalProjectCost: number;
  promoterEquity: number;
  debtAmount: number;
  debtEquityRatio: number;
  annualRevenueYr1: number;
  annualNetProfitYr1: number;
  netProfitMarginPct: number;
  roiPct: number;
  paybackPeriodYears: number;
  dscr: number;
  minDSCR: number;
  avgDSCR: number;
  isDSCRUnusuallyHigh: boolean;
  dscrWarning?: string;
  dscrStatus: 'STRONG' | 'MODERATE' | 'WEAK' | 'CRITICAL';
  breakEvenRevenue: number;
  breakEvenMonths: number;
  breakEvenMarginOfSafetyPct: number;
  feasibilityVerdict: 'VERY STRONG' | 'STRONG' | 'MODERATELY STRONG' | 'MODERATE' | 'WEAK' | 'RISK' | 'HIGH RISK' | 'INSUFFICIENT DATA';
  verdictScore: number; // 0 - 100
  scoreBreakdown: ScoreBreakdown;
  dataConfidenceScore: number; // 0 - 100
  verdictReasons: string[];
  positiveDrivers: string[];
  riskDrivers: string[];
  actionableRecommendations: string[];
  reverseStressTest: ReverseStressTestResult;
  risks: RiskItem[];
  isReconciled: boolean;
}

export interface SensitivityScenario {
  scenarioName: string;
  revenueModifierPct: number;
  costModifierPct: number;
  projectedProfit: number;
  projectedCashFlow: number;
  projectedDSCR: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RiskIndicator {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  suggestion: string;
}

export interface DataConfidenceItem {
  field: string;
  sourceType: 'USER INPUT' | 'DATASET FACT' | 'CALCULATED' | 'VERIFICATION REQUIRED';
  confidenceScore: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceName: string;
}

// ----------------------------------------------------------------------
// Financial Engine Calculation Functions (Single Source of Truth)
// ----------------------------------------------------------------------

export const CAPEX_CATEGORY_KEYS = [
  'land_site',
  'building_civil',
  'plant_machinery',
  'vehicles_trans',
  'furniture_office',
  'pre_operative'
];

export const WORKING_CAPITAL_CATEGORY_KEYS = [
  'raw_materials',
  'working_capital',
  'other_costs'
];

/**
 * Calculates line item total purely from numeric quantity * unit_cost.
 */
export function calculateLineItemTotal(item: Partial<CapExItem>): number {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const cost = Math.max(0, Number(item.unit_cost) || 0);
  return qty * cost;
}

/**
 * Calculates category subtotal purely from matching items.
 */
export function calculateCategorySubtotal(items: CapExItem[], category: string): number {
  return items
    .filter(item => item.category === category)
    .reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
}

/**
 * Calculates total Capital Expenditure (CapEx).
 */
export function calculateCapitalExpenditure(items: CapExItem[]): number {
  return items
    .filter(item => CAPEX_CATEGORY_KEYS.includes(item.category))
    .reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
}

/**
 * Calculates total Operating / Initial Working Capital Expenditure.
 */
export function calculateOperatingExpenditure(items: CapExItem[]): number {
  return items
    .filter(item => WORKING_CAPITAL_CATEGORY_KEYS.includes(item.category))
    .reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
}

/**
 * Calculates total project cost and subtotals by category.
 * Enforces strict single source of truth derivation.
 */
export function calculateCapExTotals(items: CapExItem[]): {
  totalCapEx: number;
  totalWorkingCapital: number;
  totalProjectCost: number;
  categoryTotals: Record<string, number>;
  isReconciled: boolean;
  reconciliationDelta: number;
} {
  const categoryTotals: Record<string, number> = {};
  let totalCapEx = 0;
  let totalWorkingCapital = 0;

  items.forEach(item => {
    const itemTotal = calculateLineItemTotal(item);
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + itemTotal;

    if (WORKING_CAPITAL_CATEGORY_KEYS.includes(item.category)) {
      totalWorkingCapital += itemTotal;
    } else {
      totalCapEx += itemTotal;
    }
  });

  const totalProjectCost = totalCapEx + totalWorkingCapital;
  const sumCategories = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const delta = Math.abs(sumCategories - totalProjectCost);

  return {
    totalCapEx,
    totalWorkingCapital,
    totalProjectCost,
    categoryTotals,
    isReconciled: delta < 0.01,
    reconciliationDelta: delta
  };
}

export interface CapitalStructureResult {
  totalProjectCost: number;
  totalCapEx: number;
  totalWorkingCapital: number;
  promoterContribution: number;
  partnerEquity: number;
  otherConfirmedFunding: number;
  totalNonDebtFunding: number;
  financingRequirement: number;
  excessFunding: number;
  equityPct: number;
  financingRequirementPct: number;
  isBalanced: boolean;
  sourcesUsesDelta: number;
  isZeroCost: boolean;
}

/**
 * Calculates authoritative capital structure, sources vs uses reconciliation, and financing requirement.
 */
export function calculateCapitalStructure(
  totalProjectCost: number,
  totalCapEx: number = 0,
  totalWorkingCapital: number = 0,
  promoterContribution: number = 0,
  partnerEquity: number = 0,
  otherConfirmedFunding: number = 0
): CapitalStructureResult {
  const pContrib = Math.max(0, Number(promoterContribution) || 0);
  const pPartner = Math.max(0, Number(partnerEquity) || 0);
  const pOther = Math.max(0, Number(otherConfirmedFunding) || 0);

  const totalNonDebtFunding = pContrib + pPartner + pOther;
  const isZeroCost = totalProjectCost <= 0;

  const rawGap = totalProjectCost - totalNonDebtFunding;
  const financingRequirement = Math.max(0, rawGap);
  const excessFunding = totalNonDebtFunding > totalProjectCost ? totalNonDebtFunding - totalProjectCost : 0;

  const equityPct = !isZeroCost ? Number(((totalNonDebtFunding / totalProjectCost) * 100).toFixed(1)) : 0;
  const financingRequirementPct = !isZeroCost ? Number(((financingRequirement / totalProjectCost) * 100).toFixed(1)) : 0;

  const totalSources = totalNonDebtFunding + financingRequirement - excessFunding;
  const delta = Math.abs(totalSources - totalProjectCost);

  return {
    totalProjectCost,
    totalCapEx,
    totalWorkingCapital,
    promoterContribution: pContrib,
    partnerEquity: pPartner,
    otherConfirmedFunding: pOther,
    totalNonDebtFunding,
    financingRequirement,
    excessFunding,
    equityPct,
    financingRequirementPct,
    isBalanced: delta < 0.01,
    sourcesUsesDelta: delta,
    isZeroCost
  };
}

export interface SchemeFundingWaterfall {
  totalProjectCost: number;
  promoterContribution: number;
  partnerEquity: number;
  totalPromoterEquity?: number;
  estimatedSubsidy: number;
  otherSupport: number;
  otherFunding?: number;
  totalNonDebtFunding: number;
  financingRequirement: number;
  equityPct: number;
  debtPct: number;
  subsidyPct: number;
  hasMarginGap: boolean;
  minRequiredEquity: number;
}

/**
 * Calculates scheme funding waterfall, margin gap, and net debt requirement.
 */
export function calculateFundingWaterfall(
  totalProjectCost: number,
  promoterContribution: number,
  partnerEquity: number,
  estimatedSubsidy: number,
  otherSupport: number
): SchemeFundingWaterfall {
  const capStruct = calculateCapitalStructure(
    totalProjectCost,
    0,
    0,
    promoterContribution,
    partnerEquity,
    otherSupport
  );

  const sub = Math.max(0, Number(estimatedSubsidy) || 0);
  const minRequiredEquity = totalProjectCost * 0.10; // Priority sector 10% minimum promoter margin
  const subsidyPct = totalProjectCost > 0 ? Number(((sub / totalProjectCost) * 100).toFixed(1)) : 0;

  return {
    totalProjectCost,
    promoterContribution: capStruct.promoterContribution,
    partnerEquity: capStruct.partnerEquity,
    totalPromoterEquity: capStruct.totalNonDebtFunding,
    estimatedSubsidy: sub,
    otherSupport,
    otherFunding: capStruct.otherConfirmedFunding,
    totalNonDebtFunding: capStruct.totalNonDebtFunding,
    financingRequirement: capStruct.financingRequirement,
    equityPct: capStruct.equityPct,
    debtPct: capStruct.financingRequirementPct,
    subsidyPct,
    hasMarginGap: capStruct.totalNonDebtFunding < minRequiredEquity,
    minRequiredEquity
  };
}

/**
 * Calculates loan EMI and complete monthly/annual amortization schedule.
 */
export function calculateAmortization(params: LoanParams): AmortizationSummary {
  const { principal, annualRatePct, tenureMonths, moratoriumMonths } = params;

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      totalPrincipal: 0,
      totalInterest: 0,
      totalRepayment: 0,
      monthlyEMI: 0,
      schedule: [],
      annualSchedule: []
    };
  }

  const monthlyRate = (annualRatePct / 100) / 12;
  const activeRepaymentMonths = Math.max(1, tenureMonths - moratoriumMonths);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  let monthlyEMI = 0;
  if (monthlyRate > 0) {
    monthlyEMI = (principal * monthlyRate * Math.pow(1 + monthlyRate, activeRepaymentMonths)) /
                 (Math.pow(1 + monthlyRate, activeRepaymentMonths) - 1);
  } else {
    monthlyEMI = principal / activeRepaymentMonths;
  }

  let currentBalance = principal;
  let totalInterest = 0;
  let totalPrincipalPaid = 0;

  const schedule: AmortizationRow[] = [];
  const annualMap = new Map<number, {
    openingPrincipal: number;
    totalPayment: number;
    principalPayment: number;
    interestPayment: number;
    closingPrincipal: number;
  }>();

  for (let m = 1; m <= tenureMonths; m++) {
    const year = Math.ceil(m / 12);
    const isMoratorium = m <= moratoriumMonths;
    const openingPrincipal = currentBalance;

    let interestPayment = currentBalance * monthlyRate;
    let principalPayment = 0;
    let payment = 0;

    if (isMoratorium) {
      // Simple interest during moratorium
      payment = interestPayment;
    } else {
      payment = Math.min(monthlyEMI, currentBalance + interestPayment);
      principalPayment = Math.max(0, payment - interestPayment);
      if (principalPayment > currentBalance) {
        principalPayment = currentBalance;
        payment = principalPayment + interestPayment;
      }
    }

    currentBalance = Math.max(0, currentBalance - principalPayment);
    totalInterest += interestPayment;
    totalPrincipalPaid += principalPayment;

    schedule.push({
      month: m,
      year,
      isMoratorium,
      openingPrincipal: Math.round(openingPrincipal),
      payment: Math.round(payment),
      principalPayment: Math.round(principalPayment),
      interestPayment: Math.round(interestPayment),
      closingPrincipal: Math.round(currentBalance)
    });

    // Accumulate annual totals
    const existingYear = annualMap.get(year) || {
      openingPrincipal: Math.round(openingPrincipal),
      totalPayment: 0,
      principalPayment: 0,
      interestPayment: 0,
      closingPrincipal: 0
    };

    existingYear.totalPayment += Math.round(payment);
    existingYear.principalPayment += Math.round(principalPayment);
    existingYear.interestPayment += Math.round(interestPayment);
    existingYear.closingPrincipal = Math.round(currentBalance);
    annualMap.set(year, existingYear);
  }

  const annualSchedule = Array.from(annualMap.entries()).map(([year, data]) => ({
    year,
    ...data
  }));

  return {
    totalPrincipal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(principal + totalInterest),
    monthlyEMI: Math.round(monthlyEMI),
    schedule,
    annualSchedule
  };
}

/**
 * Calculates key financial ratios, DSCR, Break-even, ROI, Payback, Weighted Score, and Feasibility Verdict.
 */
export function calculateFinancialMetrics(
  totalProjectCost: number,
  promoterEquity: number,
  debtAmount: number,
  forecast: YearForecast[],
  baseMonthlyRevenue: number,
  baseMonthlyOpEx: number
): FinancialRatios {
  const yr1 = forecast[0] || {
    revenue: 0,
    operatingCosts: 0,
    ebitda: 0,
    netProfit: 0,
    debtService: 0,
    interestExpense: 0,
    depreciation: 0,
    tax: 0,
    cashFlow: 0,
    principalRepayment: 0,
    closingDebtBalance: 0,
    isInterestReconciled: true
  };

  const annualRevenueYr1 = yr1.revenue;
  const annualNetProfitYr1 = yr1.netProfit;
  const netProfitMarginPct = annualRevenueYr1 > 0 ? (annualNetProfitYr1 / annualRevenueYr1) * 100 : 0;

  // Debt-to-Equity Ratio
  const debtEquityRatio = promoterEquity > 0 ? debtAmount / promoterEquity : (debtAmount > 0 ? 99 : 0);

  // ROI % = Net Profit / Total Investment (Planning ROI)
  const roiPct = totalProjectCost > 0 ? (annualNetProfitYr1 / totalProjectCost) * 100 : 0;

  // Payback Period (Years) derived from cumulative cash flows
  let paybackPeriodYears = 99;
  let cumulativeCash = 0;
  for (let i = 0; i < forecast.length; i++) {
    const prevCash = cumulativeCash;
    const yrCashGen = forecast[i].netProfit + forecast[i].depreciation;
    cumulativeCash += yrCashGen;
    if (cumulativeCash >= promoterEquity && paybackPeriodYears === 99) {
      const remainingNeeded = promoterEquity - prevCash;
      const fraction = yrCashGen > 0 ? remainingNeeded / yrCashGen : 0;
      paybackPeriodYears = Number((i + fraction).toFixed(1));
    }
  }

  // DSCR calculation across all forecast years
  const yearlyDSCRs = forecast.map(f => {
    const debtSvc = f.debtService || (f.interestExpense + f.principalRepayment);
    const cashAvailable = Math.max(0, f.ebitda - f.tax);
    return debtSvc > 0 ? Number((cashAvailable / debtSvc).toFixed(2)) : 2.5;
  });

  const yr1DSCR = yearlyDSCRs[0] || 2.5;
  const minDSCR = yearlyDSCRs.length > 0 ? Math.min(...yearlyDSCRs) : 2.5;
  const avgDSCR = yearlyDSCRs.length > 0 ? Number((yearlyDSCRs.reduce((a, b) => a + b, 0) / yearlyDSCRs.length).toFixed(2)) : 2.5;

  const isDSCRUnusuallyHigh = minDSCR > 5.0;
  const dscrWarning = isDSCRUnusuallyHigh
    ? `Unusually high DSCR (${minDSCR.toFixed(2)}x) — verify revenue, operating-cost, debt, and repayment assumptions.`
    : undefined;

  let dscrStatus: 'STRONG' | 'MODERATE' | 'WEAK' | 'CRITICAL' = 'STRONG';
  if (minDSCR >= 1.75) dscrStatus = 'STRONG';
  else if (minDSCR >= 1.25) dscrStatus = 'MODERATE';
  else if (minDSCR >= 1.0) dscrStatus = 'WEAK';
  else dscrStatus = 'CRITICAL';

  // Break-Even Analysis
  const fixedCosts = yr1.operatingCosts * 0.40 + yr1.interestExpense + yr1.depreciation;
  const variableCosts = yr1.operatingCosts * 0.60;
  const contributionMarginRatio = annualRevenueYr1 > 0 ? (annualRevenueYr1 - variableCosts) / annualRevenueYr1 : 0.4;
  const breakEvenRevenue = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : annualRevenueYr1;
  const breakEvenMonths = annualRevenueYr1 > 0 ? Math.round((breakEvenRevenue / annualRevenueYr1) * 12) : 12;
  const breakEvenMarginOfSafetyPct = annualRevenueYr1 > 0 ? Math.max(0, ((annualRevenueYr1 - breakEvenRevenue) / annualRevenueYr1) * 100) : 0;

  // Reverse Stress Test
  const maxRevenueDeclinePct = Number(((annualRevenueYr1 > 0 ? (yr1.ebitda / annualRevenueYr1) : 0) * 100).toFixed(1));
  const maxOpExEscalationPct = Number(((yr1.operatingCosts > 0 ? (yr1.ebitda / yr1.operatingCosts) : 0) * 100).toFixed(1));

  const reverseStressTest: ReverseStressTestResult = {
    maxRevenueDeclinePct: Math.max(0, maxRevenueDeclinePct),
    maxOpExEscalationPct: Math.max(0, maxOpExEscalationPct),
    revenueBreakEvenPoint: Math.round(breakEvenRevenue),
    opexStressLimit: Math.round(yr1.operatingCosts + Math.max(0, yr1.ebitda)),
    message: `Revenue can decline by up to ${maxRevenueDeclinePct}% or OpEx can rise by up to ${maxOpExEscalationPct}% before Year 1 EBITDA becomes zero.`
  };

  // Weighted Feasibility Score Components (Total 100)
  // 1. Profitability (Max 20)
  let profitabilityScore = 0;
  if (netProfitMarginPct >= 20) profitabilityScore = 20;
  else if (netProfitMarginPct >= 15) profitabilityScore = 16;
  else if (netProfitMarginPct >= 10) profitabilityScore = 12;
  else if (netProfitMarginPct >= 5) profitabilityScore = 8;
  else if (netProfitMarginPct > 0) profitabilityScore = 4;

  // 2. Debt Service (Max 20) — Capped if unusually high (> 5.0x) so optimism cannot skew score!
  let debtServiceScore = 0;
  if (isDSCRUnusuallyHigh) {
    debtServiceScore = 14; // Capped to avoid artificial inflation
  } else if (minDSCR >= 1.75) debtServiceScore = 20;
  else if (minDSCR >= 1.5) debtServiceScore = 16;
  else if (minDSCR >= 1.25) debtServiceScore = 12;
  else if (minDSCR >= 1.0) debtServiceScore = 6;

  // 3. Cash Flow Resilience (Max 15)
  const positiveCashYears = forecast.filter(f => f.cashFlow > 0).length;
  let cashFlowScore = 0;
  if (positiveCashYears >= 5) cashFlowScore = 15;
  else if (positiveCashYears >= 4) cashFlowScore = 11;
  else if (positiveCashYears >= 3) cashFlowScore = 7;
  else cashFlowScore = 3;

  // 4. Break-Even Position (Max 10)
  let breakEvenScore = 0;
  if (breakEvenMarginOfSafetyPct >= 40) breakEvenScore = 10;
  else if (breakEvenMarginOfSafetyPct >= 25) breakEvenScore = 7;
  else if (breakEvenMarginOfSafetyPct >= 10) breakEvenScore = 4;
  else breakEvenScore = 1;

  // 5. Downside Resilience (Max 15)
  let downsideResilienceScore = 10;
  if (maxRevenueDeclinePct >= 25 && maxOpExEscalationPct >= 25) downsideResilienceScore = 15;
  else if (maxRevenueDeclinePct >= 15) downsideResilienceScore = 10;
  else downsideResilienceScore = 4;

  // 6. Promoter Equity (Max 10)
  const equityPct = totalProjectCost > 0 ? (promoterEquity / totalProjectCost) * 100 : 0;
  let promoterEquityScore = 0;
  if (equityPct >= 25) promoterEquityScore = 10;
  else if (equityPct >= 15) promoterEquityScore = 7;
  else if (equityPct >= 10) promoterEquityScore = 4;
  else promoterEquityScore = 1;

  // 7. Data Confidence Score (Max 10)
  const dataConfidenceScore = 70; // Baseline data confidence (User assumptions present)
  const dataConfidenceComponentScore = 7; // 7 out of 10 pts

  const totalScore = Math.min(100, Math.max(0,
    profitabilityScore + debtServiceScore + cashFlowScore + breakEvenScore + downsideResilienceScore + promoterEquityScore + dataConfidenceComponentScore
  ));

  const scoreBreakdown: ScoreBreakdown = {
    profitabilityScore,
    debtServiceScore,
    cashFlowScore,
    breakEvenScore,
    downsideResilienceScore,
    promoterEquityScore,
    dataConfidenceScore: dataConfidenceComponentScore,
    totalScore
  };

  // Verdict Classification
  let feasibilityVerdict: 'VERY STRONG' | 'STRONG' | 'MODERATELY STRONG' | 'MODERATE' | 'WEAK' | 'RISK' | 'HIGH RISK' | 'INSUFFICIENT DATA' = 'MODERATE';
  if (totalProjectCost <= 0 || annualRevenueYr1 <= 0) {
    feasibilityVerdict = 'INSUFFICIENT DATA';
  } else if (totalScore >= 85) {
    feasibilityVerdict = 'VERY STRONG';
  } else if (totalScore >= 75) {
    feasibilityVerdict = 'STRONG';
  } else if (totalScore >= 65) {
    feasibilityVerdict = 'MODERATELY STRONG';
  } else if (totalScore >= 50) {
    feasibilityVerdict = 'MODERATE';
  } else if (totalScore >= 35) {
    feasibilityVerdict = 'WEAK';
  } else {
    feasibilityVerdict = 'HIGH RISK';
  }

  // Dynamic Reasons, Drivers, and Recommendations
  const positiveDrivers: string[] = [];
  const riskDrivers: string[] = [];
  const actionableRecommendations: string[] = [];
  const reasons: string[] = [];
  const risks: RiskItem[] = [];

  if (yr1.ebitda > 0) {
    positiveDrivers.push(`Positive EBITDA (₹${yr1.ebitda.toLocaleString('en-IN')}) generates operational surplus.`);
  } else {
    riskDrivers.push(`Negative EBITDA indicates operational costs exceed revenue.`);
  }

  if (minDSCR >= 1.5) {
    positiveDrivers.push(`Min DSCR (${minDSCR.toFixed(2)}x) comfortably covers debt service requirements.`);
  } else {
    riskDrivers.push(`Low Min DSCR (${minDSCR.toFixed(2)}x) indicates potential debt servicing pressure.`);
  }

  if (equityPct >= 15) {
    positiveDrivers.push(`Adequate promoter equity contribution (${equityPct.toFixed(1)}%).`);
  } else {
    riskDrivers.push(`High debt dependence (${(100 - equityPct).toFixed(1)}% external debt).`);
  }

  if (isDSCRUnusuallyHigh) {
    riskDrivers.push(`Unusually high DSCR (${minDSCR.toFixed(2)}x) — verify revenue & expense inputs.`);
    actionableRecommendations.push(`Stress-test revenue and OpEx assumptions to confirm long-term validity.`);
  }

  actionableRecommendations.push(`Validate local market selling price with wholesale arrival benchmarks.`);
  actionableRecommendations.push(`Confirm equipment quotations and civil construction estimates.`);
  actionableRecommendations.push(`Verify government subsidy eligibility with DIC/NABARD guidelines before committing debt.`);

  risks.push({
    id: '1',
    category: 'Market & Sales',
    riskName: 'Revenue Concentration Risk',
    severity: 'MEDIUM',
    reason: 'Revenue relies on user-provided pricing and volume assumptions.',
    mitigation: 'Establish off-take agreements or multi-buyer channels.'
  });

  risks.push({
    id: '2',
    category: 'Cost Inflation',
    riskName: 'Operating Expense Escalation',
    severity: 'MEDIUM',
    reason: 'Raw material and labour costs may rise faster than projected 4% p.a.',
    mitigation: 'Lock in long-term supplier contracts and optimize energy usage.'
  });

  risks.push({
    id: '3',
    category: 'Financing & Subsidy',
    riskName: 'Government Subsidy Verification',
    severity: 'HIGH',
    reason: 'Subsidy disbursal depends on scheme approvals and audit compliance.',
    mitigation: 'Do not count unverified subsidy in initial working capital or EMI payments.'
  });

  return {
    totalProjectCost: Math.round(totalProjectCost),
    promoterEquity: Math.round(promoterEquity),
    debtAmount: Math.round(debtAmount),
    debtEquityRatio: Number(debtEquityRatio.toFixed(2)),
    annualRevenueYr1: Math.round(annualRevenueYr1),
    annualNetProfitYr1: Math.round(annualNetProfitYr1),
    netProfitMarginPct: Number(netProfitMarginPct.toFixed(1)),
    roiPct: Number(roiPct.toFixed(1)),
    paybackPeriodYears: Number(paybackPeriodYears.toFixed(1)),
    dscr: yr1DSCR,
    minDSCR,
    avgDSCR,
    isDSCRUnusuallyHigh,
    dscrWarning,
    dscrStatus,
    breakEvenRevenue: Math.round(breakEvenRevenue),
    breakEvenMonths,
    breakEvenMarginOfSafetyPct: Number(breakEvenMarginOfSafetyPct.toFixed(1)),
    feasibilityVerdict,
    verdictScore: totalScore,
    scoreBreakdown,
    dataConfidenceScore,
    verdictReasons: reasons,
    positiveDrivers,
    riskDrivers,
    actionableRecommendations,
    reverseStressTest,
    risks,
    isReconciled: forecast[0]?.isInterestReconciled ?? true
  };
}

/**
 * Runs 9 Downside Sensitivity Scenarios: Base Case, Rev -10%, -20%, -30%, Cost +10%, +20%, +30%, Combined Stress, Combined Severe.
 */
export function runSensitivityAnalysis(
  baseMonthlyRevenue: number,
  baseMonthlyOpEx: number,
  totalProjectCost: number,
  promoterEquity: number,
  debtAmount: number,
  amortization: AmortizationSummary
): SensitivityScenario[] {
  const scenarios = [
    { name: 'Base Case Scenario', revMod: 0, costMod: 0 },
    { name: 'Revenue Drop -10%', revMod: -10, costMod: 0 },
    { name: 'Revenue Drop -20%', revMod: -20, costMod: 0 },
    { name: 'Revenue Drop -30%', revMod: -30, costMod: 0 },
    { name: 'Operating Cost +10%', revMod: 0, costMod: 10 },
    { name: 'Operating Cost +20%', revMod: 0, costMod: 20 },
    { name: 'Operating Cost +30%', revMod: 0, costMod: 30 },
    { name: 'Combined Stress (Rev -15%, Cost +15%)', revMod: -15, costMod: 15 },
    { name: 'Combined Severe Stress (Rev -20%, Cost +20%)', revMod: -20, costMod: 20 }
  ];

  return scenarios.map(sc => {
    const adjMonthlyRev = baseMonthlyRevenue * (1 + sc.revMod / 100);
    const adjMonthlyCost = baseMonthlyOpEx * (1 + sc.costMod / 100);

    const forecast = calculate5YearForecast(
      { baseMonthlyRevenue: adjMonthlyRev, baseMonthlyOpEx: adjMonthlyCost, revenueGrowthPct: 0, expenseGrowthPct: 0 },
      amortization,
      totalProjectCost
    );

    const yr1 = forecast[0] || { revenue: 0, operatingCosts: 0, ebitda: 0, netProfit: 0, debtService: 0, cashFlow: 0, tax: 0 };
    const debtService = yr1.debtService || (amortization.annualSchedule[0]?.totalPayment || 0);
    const cashAvailable = Math.max(0, yr1.ebitda - yr1.tax);
    const projectedDSCR = debtService > 0 ? Number((cashAvailable / debtService).toFixed(2)) : 2.5;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (yr1.cashFlow < 0 || projectedDSCR < 1.0 || yr1.ebitda < 0) {
      riskLevel = 'CRITICAL';
    } else if (projectedDSCR < 1.25 || yr1.netProfit < 0) {
      riskLevel = 'HIGH';
    } else if (projectedDSCR < 1.5) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      scenarioName: sc.name,
      revenueModifierPct: sc.revMod,
      costModifierPct: sc.costMod,
      projectedProfit: yr1.netProfit,
      projectedCashFlow: yr1.cashFlow,
      projectedDSCR,
      riskLevel
    };
  });
}
