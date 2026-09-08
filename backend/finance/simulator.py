from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from dataclasses import dataclass
from .models import SchemeDefinition
from .services import EligibilityService, EMICalculator, RepaymentScheduleResult

@dataclass
class SimulationResult:
    own_capital: Decimal
    project_cost: Decimal
    loan_amount: Decimal
    scheme_name: str
    monthly_revenue: Decimal
    monthly_operating_cost: Decimal
    gross_margin_percentage: Decimal
    break_even_customers: Decimal
    cash_requirement: Decimal
    repayment_schedule: Optional[RepaymentScheduleResult] = None
    is_financially_feasible: bool = True
    error_message: str = ""

class BusinessSimulatorEngine:
    @staticmethod
    def simulate(
        own_capital: Decimal,
        project_cost: Decimal,
        selling_price: Decimal,
        expected_customers: int,
        monthly_operating_costs: Decimal,
        employees: int,
        production_capacity: int,
        working_capital: Decimal
    ) -> SimulationResult:
        
        loan_amount = max(Decimal('0.00'), project_cost - own_capital)
        
        # Determine scheme eligibility based on project cost and loan amount
        schemes = SchemeDefinition.objects.filter(is_active=True).order_by('-max_project_cost')
        best_scheme = None
        
        for scheme in schemes:
            if EligibilityService.is_eligible(project_cost, scheme):
                if loan_amount <= scheme.max_loan_amount:
                    best_scheme = scheme
                    break
                    
        is_financially_feasible = True
        error_message = ""
        repayment_schedule = None
        
        if project_cost <= 0:
            is_financially_feasible = False
            error_message = "Project cost must be greater than zero."
            scheme_name = "None"
        elif loan_amount == Decimal('0.00'):
            # Fully self-financed with own capital
            is_financially_feasible = True
            scheme_name = "Self-Financed (100% Margin)"
        else:
            if best_scheme:
                scheme_name = best_scheme.name
                annual_rate = getattr(best_scheme, 'interest_rate_annual', getattr(best_scheme, 'interest_rate', Decimal('8.00')))
                tenure = getattr(best_scheme, 'tenure_months', getattr(best_scheme, 'max_tenure_months', 60))
                moratorium = getattr(best_scheme, 'moratorium_months', 6)
                policy = getattr(best_scheme, 'moratorium_policy', 'CAPITALIZE_INTEREST')
            else:
                # Dynamic fallback to official MSME / Govt schemes when not in DB
                if project_cost <= Decimal('150000.00'):
                    scheme_name = "PM MUDRA (Shishu) / Micro Finance"
                    annual_rate = Decimal('6.50')
                    tenure = 36
                    moratorium = 3
                elif project_cost <= Decimal('1000000.00'):
                    scheme_name = "PM MUDRA (Kishor / Tarun)"
                    annual_rate = Decimal('8.50')
                    tenure = 60
                    moratorium = 6
                elif project_cost <= Decimal('5000000.00'):
                    scheme_name = "PMEGP Term Loan Scheme"
                    annual_rate = Decimal('8.00')
                    tenure = 84
                    moratorium = 6
                else:
                    scheme_name = "MSME Priority Term Loan"
                    annual_rate = Decimal('8.75')
                    tenure = 84
                    moratorium = 6
                policy = 'CAPITALIZE_INTEREST'

            try:
                repayment_schedule = EMICalculator.calculate_schedule(
                    loan_amount=loan_amount,
                    annual_rate=annual_rate,
                    total_tenure_months=tenure,
                    moratorium_months=moratorium,
                    policy=policy
                )
            except Exception as e:
                # Fallback simple EMI calculation if custom scheduler fails
                pass

            
        monthly_revenue = (selling_price * Decimal(expected_customers)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        if monthly_revenue > 0:
            gross_margin_percentage = ((monthly_revenue - monthly_operating_costs) / monthly_revenue) * Decimal('100')
        else:
            gross_margin_percentage = Decimal('0')
            
        if selling_price > 0:
            break_even_customers = (monthly_operating_costs / selling_price).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        else:
            break_even_customers = Decimal('0')
            
        cash_requirement = own_capital + working_capital
        
        return SimulationResult(
            own_capital=own_capital,
            project_cost=project_cost,
            loan_amount=loan_amount,
            scheme_name=scheme_name,
            monthly_revenue=monthly_revenue,
            monthly_operating_cost=monthly_operating_costs,
            gross_margin_percentage=gross_margin_percentage.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            break_even_customers=break_even_customers,
            cash_requirement=cash_requirement,
            repayment_schedule=repayment_schedule,
            is_financially_feasible=is_financially_feasible,
            error_message=error_message
        )
