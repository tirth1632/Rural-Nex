from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict
from dataclasses import dataclass
from .models import SchemeDefinition, MoratoriumPolicy

@dataclass
class FinancialAssessmentResult:
    scheme: SchemeDefinition
    beneficiary_margin: Decimal
    feasible_project_cost: Decimal
    constrained_project_cost: Optional[Decimal]
    loan_amount: Decimal
    cap_constrained: bool
    constraint_reason: str
    working_capital_estimate: Decimal

@dataclass
class EMIInstallment:
    month: int
    principal_payment: Decimal
    interest_payment: Decimal
    total_installment: Decimal
    remaining_balance: Decimal

@dataclass
class RepaymentScheduleResult:
    installments: List[EMIInstallment]
    total_principal: Decimal
    total_interest: Decimal
    total_amount_payable: Decimal

class WorkingCapitalCalculator:
    @staticmethod
    def estimate(project_cost: Decimal, percentage: Decimal = Decimal('0.20')) -> Decimal:
        return (project_cost * percentage).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

class LoanCalculator:
    @staticmethod
    def calculate_project_cost(margin: Decimal, funding_percentage: Decimal) -> Decimal:
        """
        Project Cost = Beneficiary Margin / (1 - Funding Percentage)
        """
        if not isinstance(margin, Decimal):
            margin = Decimal(str(margin))
        if not isinstance(funding_percentage, Decimal):
            funding_percentage = Decimal(str(funding_percentage))
            
        funding_fraction = funding_percentage / Decimal('100.0')
        if funding_fraction >= 1:
            raise ValueError("Funding percentage cannot be 100% or more when calculated from margin.")
        
        project_cost = margin / (Decimal('1.0') - funding_fraction)
        return project_cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

class EligibilityService:
    @staticmethod
    def is_eligible(project_cost: Decimal, scheme: SchemeDefinition) -> bool:
        if scheme.max_project_cost and project_cost > scheme.max_project_cost:
            return False
        if project_cost < scheme.min_project_cost:
            return False
        return True

class SchemeSelector:
    @staticmethod
    def get_applicable_schemes(project_cost: Decimal) -> List[SchemeDefinition]:
        schemes = SchemeDefinition.objects.filter(is_active=True)
        return [s for s in schemes if EligibilityService.is_eligible(project_cost, s)]

class MoratoriumCalculator:
    @staticmethod
    def apply_moratorium(
        principal: Decimal, 
        monthly_rate: Decimal, 
        moratorium_months: int, 
        policy: str
    ) -> Decimal:
        if policy == MoratoriumPolicy.CAPITALIZE_INTEREST:
            # Interest is added to principal
            current_principal = principal
            for _ in range(moratorium_months):
                interest = current_principal * monthly_rate
                current_principal += interest
            return current_principal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        elif policy == MoratoriumPolicy.PAY_INTEREST_ONLY:
            # Principal remains the same
            return principal
        elif policy == MoratoriumPolicy.DEFER_INTEREST:
            # Not fully modeled yet, assuming capitalized for this version unless specified
            return principal
        return principal

class EMICalculator:
    @staticmethod
    def calculate_schedule(
        loan_amount: Decimal, 
        annual_rate: Decimal, 
        total_tenure_months: int, 
        moratorium_months: int, 
        policy: str
    ) -> RepaymentScheduleResult:
        monthly_rate = annual_rate / Decimal('100') / Decimal('12')
        installments = []
        
        repayment_months = total_tenure_months - moratorium_months
        if repayment_months <= 0 and total_tenure_months > 0:
            raise ValueError("Repayment tenure must be greater than moratorium period.")
        
        current_balance = loan_amount
        
        # 1. Moratorium Period
        for i in range(1, moratorium_months + 1):
            if policy == MoratoriumPolicy.PAY_INTEREST_ONLY:
                interest_payment = (loan_amount * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                total_installment = interest_payment
            elif policy == MoratoriumPolicy.CAPITALIZE_INTEREST:
                interest_payment = (current_balance * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                current_balance += interest_payment
                total_installment = Decimal('0.00')
            else:
                interest_payment = Decimal('0.00')
                total_installment = Decimal('0.00')

            installments.append(EMIInstallment(
                month=i,
                principal_payment=Decimal('0.00'),
                interest_payment=interest_payment,
                total_installment=total_installment,
                remaining_balance=current_balance
            ))
            
        if repayment_months > 0:
            # Calculate standard EMI for remaining months
            if monthly_rate > 0:
                emi = (current_balance * monthly_rate * ((Decimal('1') + monthly_rate) ** Decimal(repayment_months))) / (((Decimal('1') + monthly_rate) ** Decimal(repayment_months)) - Decimal('1'))
            else:
                emi = current_balance / Decimal(repayment_months)
                
            emi = emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            for i in range(moratorium_months + 1, total_tenure_months + 1):
                interest = (current_balance * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                
                if i == total_tenure_months:
                    principal = current_balance
                    emi = principal + interest
                else:
                    principal = emi - interest
                    
                current_balance -= principal
                
                installments.append(EMIInstallment(
                    month=i,
                    principal_payment=principal,
                    interest_payment=interest,
                    total_installment=emi,
                    remaining_balance=max(current_balance, Decimal('0.00'))
                ))
                
        total_principal = sum(i.principal_payment for i in installments)
        total_interest = sum(i.interest_payment for i in installments)
        
        return RepaymentScheduleResult(
            installments=installments,
            total_principal=total_principal,
            total_interest=total_interest,
            total_amount_payable=total_principal + total_interest
        )

class FinancialAssessmentEngine:
    @staticmethod
    def assess(margin_capital: Decimal) -> FinancialAssessmentResult:
        if not isinstance(margin_capital, Decimal):
            margin_capital = Decimal(str(margin_capital))
        # For simplicity in this logic, we attempt to find the highest possible project cost
        # The brief lists two schemes:
        # Micro Finance: max project 1.40L, max loan 1.25L, 90% funding
        # Term Loan: max project 50L, max loan 45L, 90% funding
        
        # We start by testing against all schemes and pick the best one
        schemes = SchemeDefinition.objects.filter(is_active=True).order_by('-max_project_cost')
        
        if not schemes.exists():
            raise ValueError("No active financial schemes available.")
            
        best_scheme = None
        feasible_project_cost = Decimal('0.00')
        constrained_project_cost = None
        loan_amount = Decimal('0.00')
        cap_constrained = False
        constraint_reason = ""
        
        for scheme in schemes:
            temp_cost = LoanCalculator.calculate_project_cost(margin_capital, scheme.funding_percentage)
            
            temp_loan = (temp_cost * (scheme.funding_percentage / Decimal('100.0'))).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            is_constrained = False
            reason = ""
            
            # Apply maximum loan constraint
            if temp_loan > scheme.max_loan_amount:
                temp_loan = scheme.max_loan_amount
                constrained_cost = temp_loan + margin_capital
                
                if EligibilityService.is_eligible(constrained_cost, scheme):
                    is_constrained = True
                    reason = f"Loan amount capped at {scheme.max_loan_amount} for {scheme.name}."
                    temp_cost = constrained_cost
                else:
                    continue # Not eligible even after constraint
            else:
                if not EligibilityService.is_eligible(temp_cost, scheme):
                    continue

            # Found a match
            best_scheme = scheme
            feasible_project_cost = temp_cost
            loan_amount = temp_loan
            cap_constrained = is_constrained
            constraint_reason = reason
            if cap_constrained:
                constrained_project_cost = feasible_project_cost
            break
            
        if not best_scheme:
            raise ValueError(f"Margin of {margin_capital} does not fit into any active scheme boundaries.")
            
        working_capital = WorkingCapitalCalculator.estimate(feasible_project_cost)
        
        return FinancialAssessmentResult(
            scheme=best_scheme,
            beneficiary_margin=margin_capital,
            feasible_project_cost=feasible_project_cost,
            constrained_project_cost=constrained_project_cost,
            loan_amount=loan_amount,
            cap_constrained=cap_constrained,
            constraint_reason=constraint_reason,
            working_capital_estimate=working_capital
        )
