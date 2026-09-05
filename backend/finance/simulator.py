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
        
        loan_amount = project_cost - own_capital
        
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
        scheme_name = "None"
        repayment_schedule = None
        
        if loan_amount < 0:
            is_financially_feasible = False
            error_message = "Own capital exceeds project cost."
        elif not best_scheme:
            is_financially_feasible = False
            error_message = "No eligible scheme found for this project cost and loan combination."
        else:
            scheme_name = best_scheme.name
            repayment_schedule = EMICalculator.calculate_schedule(
                loan_amount=loan_amount,
                annual_rate=best_scheme.interest_rate,
                total_tenure_months=best_scheme.max_tenure_months,
                moratorium_months=best_scheme.moratorium_months,
                policy=best_scheme.moratorium_policy
            )
            
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
