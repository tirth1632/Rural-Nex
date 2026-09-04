import type { FinancialCalculation } from '../types';

export const calculateFinancials = (
  projectCost: number,
  ownContribution: number,
  subsidyPercent: number,
  interestRate: number,
  tenureYears: number,
  projectedAnnualRevenue: number,
  projectedAnnualOpEx: number
): FinancialCalculation => {
  const subsidyAmount = Math.min(projectCost * (subsidyPercent / 100), projectCost * 0.35);
  const netLoanBase = Math.max(0, projectCost - ownContribution - subsidyAmount);
  
  const annualInterestRate = interestRate / 100;
  const monthlyRate = annualInterestRate / 12;
  const totalMonths = tenureYears * 12;

  let monthlyEMI = 0;
  if (monthlyRate > 0 && netLoanBase > 0 && totalMonths > 0) {
    monthlyEMI = Math.round(
      (netLoanBase * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
  } else if (netLoanBase > 0 && totalMonths > 0) {
    monthlyEMI = Math.round(netLoanBase / totalMonths);
  }

  const totalRepayment = monthlyEMI * totalMonths;
  const totalInterest = Math.max(0, totalRepayment - netLoanBase);
  const ltvRatio = projectCost > 0 ? (netLoanBase / projectCost) * 100 : 0;

  const netOperatingProfit = Math.max(0, projectedAnnualRevenue - projectedAnnualOpEx);
  const annualDebtService = monthlyEMI * 12;
  const dscr = annualDebtService > 0 ? Number((netOperatingProfit / annualDebtService).toFixed(2)) : 0;

  const monthlyNetMargin = netOperatingProfit / 12;
  const breakEvenMonths = monthlyNetMargin > 0 ? Math.ceil(ownContribution / monthlyNetMargin) : 24;
  const roiPercent = ownContribution > 0 ? Number(((netOperatingProfit / ownContribution) * 100).toFixed(1)) : 0;

  return {
    projectCost,
    ownContribution,
    subsidyAmount,
    loanAmount: netLoanBase,
    interestRate,
    tenureYears,
    monthlyEMI,
    totalInterest,
    totalRepayment,
    ltvRatio: Number(ltvRatio.toFixed(1)),
    projectedAnnualRevenue,
    projectedAnnualOpEx,
    netOperatingProfit,
    dscr,
    breakEvenMonths,
    roiPercent,
  };
};

export const generateAmortizationSchedule = (
  loanAmount: number,
  interestRate: number,
  tenureYears: number
) => {
  const annualInterestRate = interestRate / 100;
  const schedule = [];
  let balance = loanAmount;
  const monthlyRate = annualInterestRate / 12;
  
  for (let year = 1; year <= tenureYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    for (let month = 1; month <= 12; month++) {
      const interestForMonth = balance * monthlyRate;
      const totalEMIPaid = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureYears * 12)) / (Math.pow(1 + monthlyRate, tenureYears * 12) - 1);
      const principalForMonth = totalEMIPaid - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);
      yearPrincipal += principalForMonth;
      yearInterest += interestForMonth;
    }
    schedule.push({
      year: `Year ${year}`,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      remainingBalance: Math.round(balance),
    });
  }
  return schedule;
};
