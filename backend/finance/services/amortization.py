from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List
from .constants import ROUNDING
from ..exceptions import InvalidParameterError

class EMICalculator:
    @staticmethod
    def calculate_emi(principal: Decimal, annual_rate: Decimal, tenure_months: int) -> Decimal:
        if principal <= Decimal('0.00'):
            return Decimal('0.00')
        if annual_rate < Decimal('0.00') or tenure_months <= 0:
            raise InvalidParameterError("Invalid interest rate or tenure.")
            
        if annual_rate == Decimal('0.00'):
            return (principal / Decimal(tenure_months)).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
            
        monthly_rate = (annual_rate / Decimal('100.0')) / Decimal('12.0')
        # EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        factor = (Decimal('1.0') + monthly_rate) ** Decimal(tenure_months)
        emi = (principal * monthly_rate * factor) / (factor - Decimal('1.0'))
        return emi.quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)

class AmortizationService:
    @staticmethod
    def generate_schedule(principal: Decimal, annual_rate: Decimal, tenure: int, moratorium: int) -> Dict[str, Any]:
        """
        Generates the full amortization schedule assuming Interest-Only payments during the moratorium.
        """
        if principal <= Decimal('0.00') or tenure <= 0 or moratorium < 0 or moratorium >= tenure:
            raise InvalidParameterError("Invalid parameters for amortization.")

        monthly_rate = (annual_rate / Decimal('100.0')) / Decimal('12.0')
        
        schedule = []
        quarterly_summary = []
        
        current_principal = principal
        total_interest = Decimal('0.00')
        total_principal_paid = Decimal('0.00')
        
        # Calculate EMI for the active repayment period
        active_tenure = tenure - moratorium
        emi = EMICalculator.calculate_emi(principal, annual_rate, active_tenure)
        
        current_quarter_interest = Decimal('0.00')
        current_quarter_principal = Decimal('0.00')
        
        for month in range(1, tenure + 1):
            is_moratorium = month <= moratorium
            
            # Interest for the month
            interest_payment = (current_principal * monthly_rate).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
            
            if is_moratorium:
                principal_payment = Decimal('0.00')
                total_payment = interest_payment # Interest-only during moratorium
            else:
                principal_payment = emi - interest_payment
                # Handle rounding on final month
                if month == tenure:
                    principal_payment = current_principal
                    total_payment = principal_payment + interest_payment
                else:
                    total_payment = emi
            
            current_principal -= principal_payment
            if current_principal < Decimal('0.00'):
                current_principal = Decimal('0.00')
                
            total_interest += interest_payment
            total_principal_paid += principal_payment
            
            current_quarter_interest += interest_payment
            current_quarter_principal += principal_payment
            
            schedule.append({
                "month": month,
                "is_moratorium": is_moratorium,
                "payment": total_payment,
                "principal_payment": principal_payment,
                "interest_payment": interest_payment,
                "outstanding_principal": current_principal
            })
            
            # Quarterly grouping
            if month % 3 == 0 or month == tenure:
                quarterly_summary.append({
                    "quarter": (month - 1) // 3 + 1,
                    "total_payment": current_quarter_principal + current_quarter_interest,
                    "principal_payment": current_quarter_principal,
                    "interest_payment": current_quarter_interest,
                    "outstanding_principal": current_principal
                })
                current_quarter_interest = Decimal('0.00')
                current_quarter_principal = Decimal('0.00')

        return {
            "summary": {
                "total_principal": principal,
                "total_interest": total_interest,
                "total_repayment": principal + total_interest,
                "active_emi": emi
            },
            "monthly_schedule": schedule,
            "quarterly_summary": quarterly_summary
        }
