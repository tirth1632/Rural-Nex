import { calculateFinancials, generateAmortizationSchedule } from '../utils/calculations';
import type { FinancialCalculation } from '../types';

export class FinanceService {
  public static computeModel(
    projectCost: number,
    ownContribution: number,
    subsidyPercent: number,
    interestRate: number,
    tenureYears: number,
    annualRevenue: number,
    annualOpEx: number
  ): FinancialCalculation {
    return calculateFinancials(
      projectCost,
      ownContribution,
      subsidyPercent,
      interestRate,
      tenureYears,
      annualRevenue,
      annualOpEx
    );
  }

  public static getAmortization(loanAmount: number, interestRate: number, tenureYears: number) {
    return generateAmortizationSchedule(loanAmount, interestRate, tenureYears);
  }
}
