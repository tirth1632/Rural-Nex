from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List
from ..exceptions import ZeroCapitalError, NegativeCapitalError
from .constants import MARGIN_PERCENTAGE, LOAN_PERCENTAGE, ROUNDING, SCHEME_RULES
from .eligibility import SchemeEligibilityService

class FinancialCalculationService:
    @staticmethod
    def calculate(available_margin: Decimal, desired_project_cost: Decimal = None) -> Dict[str, Any]:
        """
        Calculates theoretical and eligible project costs and loans strictly 
        based on available margin and scheme caps.
        """
        if available_margin < Decimal('0.00'):
            raise NegativeCapitalError("Margin capital cannot be negative.")
        if available_margin == Decimal('0.00'):
            raise ZeroCapitalError("Margin capital cannot be zero.")

        warnings: List[str] = []

        # 1. Theoretical calculations
        theoretical_project_cost = (available_margin / MARGIN_PERCENTAGE).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
        
        # If user provided a desired project cost, and it's lower than what they can afford, we use it.
        # But they still have to contribute 10% of that cost, not their full margin.
        if desired_project_cost and desired_project_cost < theoretical_project_cost:
            if desired_project_cost <= Decimal('0.00'):
                 warnings.append("Provided desired project cost is invalid (<=0). Using theoretical max.")
                 working_project_cost = theoretical_project_cost
                 beneficiary_contribution = available_margin
            else:
                 working_project_cost = desired_project_cost
                 beneficiary_contribution = (working_project_cost * MARGIN_PERCENTAGE).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
        else:
            working_project_cost = theoretical_project_cost
            beneficiary_contribution = available_margin

        theoretical_loan = (working_project_cost * LOAN_PERCENTAGE).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)

        # 2. Scheme Determination
        scheme_id = SchemeEligibilityService.determine_scheme(working_project_cost)
        rules = SchemeEligibilityService.get_scheme_rules(scheme_id)

        # 3. Apply Scheme Caps
        eligible_project_cost = min(working_project_cost, rules['max_project_cost'])
        if eligible_project_cost < working_project_cost:
             warnings.append(f"Project cost capped at scheme maximum of ₹{rules['max_project_cost']}")

        # Recalculate loan based on capped cost
        eligible_loan_uncapped = (eligible_project_cost * LOAN_PERCENTAGE).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
        eligible_loan = min(eligible_loan_uncapped, rules['max_loan'])
        
        if eligible_loan < eligible_loan_uncapped:
             warnings.append(f"Loan capped at scheme maximum of ₹{rules['max_loan']}")
             
        # Beneficiary must bring remaining funds if loan is capped
        actual_beneficiary_contribution = eligible_project_cost - eligible_loan

        return {
            "requested_margin": available_margin,
            "theoretical_project_cost": theoretical_project_cost,
            "eligible_project_cost": eligible_project_cost,
            "theoretical_loan": theoretical_loan,
            "eligible_loan": eligible_loan,
            "beneficiary_contribution": actual_beneficiary_contribution,
            "scheme": scheme_id,
            "interest_rate": rules['interest_rate'],
            "tenure": rules['tenure_months'],
            "moratorium": rules['moratorium_months'],
            "warnings": warnings
        }
