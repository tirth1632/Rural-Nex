from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List
from .constants import ROUNDING
from ..exceptions import InvalidParameterError
from ..models import MoratoriumPolicy

class EMICalculator:
    @staticmethod
    def calculate_emi(principal: Decimal, annual_rate: Decimal, tenure_months: int) -> Decimal:
        """
        Calculates monthly reducing-balance EMI using the standard banking formula:
        EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        """
        if principal <= Decimal('0.00'):
            return Decimal('0.00')
        if annual_rate < Decimal('0.00') or tenure_months <= 0:
            raise InvalidParameterError("Invalid interest rate or tenure.")
            
        if annual_rate == Decimal('0.00'):
            return (principal / Decimal(tenure_months)).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
            
        monthly_rate = (annual_rate / Decimal('100.0')) / Decimal('12.0')
        factor = (Decimal('1.0') + monthly_rate) ** Decimal(tenure_months)
        emi = (principal * monthly_rate * factor) / (factor - Decimal('1.0'))
        return emi.quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)

class AmortizationService:
    @staticmethod
    def generate_schedule(
        principal: Decimal, 
        annual_rate: Decimal, 
        tenure: int, 
        moratorium: int = 0,
        moratorium_policy: str = MoratoriumPolicy.PAY_INTEREST_ONLY,
        frequency: str = 'monthly'
    ) -> Dict[str, Any]:
        """
        Generates full amortization schedule supporting custom moratorium policies and quarterly/annual views.
        """
        if principal <= Decimal('0.00') or tenure <= 0 or moratorium < 0 or moratorium >= tenure:
            raise InvalidParameterError("Invalid parameters for amortization.")

        monthly_rate = (annual_rate / Decimal('100.0')) / Decimal('12.0')
        
        schedule = []
        quarterly_summary = []
        annual_summary = []
        
        current_principal = principal
        total_interest = Decimal('0.00')
        total_principal_paid = Decimal('0.00')
        
        # During moratorium:
        # If CAPITALIZE_INTEREST: interest is accrued and added to principal
        # If PAY_INTEREST_ONLY: borrower pays monthly interest, principal remains untouched
        # If DEFER_INTEREST: interest is deferred and added after
        
        active_tenure = tenure - moratorium
        active_principal = current_principal
        
        # If capitalized interest during moratorium, calculate accumulated principal
        if moratorium_policy == MoratoriumPolicy.CAPITALIZE_INTEREST and moratorium > 0:
            for _ in range(moratorium):
                accrued = (active_principal * monthly_rate).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
                active_principal += accrued
        
        emi = EMICalculator.calculate_emi(active_principal, annual_rate, active_tenure)
        
        curr_q_principal = Decimal('0.00')
        curr_q_interest = Decimal('0.00')
        curr_y_principal = Decimal('0.00')
        curr_y_interest = Decimal('0.00')
        
        for month in range(1, tenure + 1):
            is_moratorium = month <= moratorium
            opening_balance = current_principal
            interest_payment = (current_principal * monthly_rate).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
            
            if is_moratorium:
                if moratorium_policy == MoratoriumPolicy.CAPITALIZE_INTEREST:
                    principal_payment = Decimal('0.00')
                    total_payment = Decimal('0.00')
                    current_principal += interest_payment
                elif moratorium_policy == MoratoriumPolicy.DEFER_INTEREST:
                    principal_payment = Decimal('0.00')
                    total_payment = Decimal('0.00')
                else: # PAY_INTEREST_ONLY (Standard)
                    principal_payment = Decimal('0.00')
                    total_payment = interest_payment
            else:
                principal_payment = emi - interest_payment
                if month == tenure or principal_payment > current_principal:
                    principal_payment = current_principal
                    total_payment = principal_payment + interest_payment
                else:
                    total_payment = emi
                current_principal -= principal_payment
                
            if current_principal < Decimal('0.00'):
                current_principal = Decimal('0.00')
                
            total_interest += interest_payment
            total_principal_paid += principal_payment
            
            curr_q_principal += principal_payment
            curr_q_interest += interest_payment
            curr_y_principal += principal_payment
            curr_y_interest += interest_payment
            
            schedule.append({
                "month": month,
                "is_moratorium": is_moratorium,
                "opening_principal": opening_balance,
                "payment": total_payment,
                "principal_payment": principal_payment,
                "interest_payment": interest_payment,
                "closing_principal": current_principal,
                "outstanding_principal": current_principal
            })
            
            # Quarterly grouping
            if month % 3 == 0 or month == tenure:
                q_num = (month - 1) // 3 + 1
                quarterly_summary.append({
                    "quarter": q_num,
                    "label": f"Q{((q_num-1)%4)+1} (M{max(1, month-2)}–M{month})",
                    "total_payment": curr_q_principal + curr_q_interest,
                    "principal_payment": curr_q_principal,
                    "interest_payment": curr_q_interest,
                    "outstanding_principal": current_principal
                })
                curr_q_principal = Decimal('0.00')
                curr_q_interest = Decimal('0.00')
                
            # Annual grouping
            if month % 12 == 0 or month == tenure:
                y_num = (month - 1) // 12 + 1
                annual_summary.append({
                    "year": y_num,
                    "label": f"Year {y_num}",
                    "total_payment": curr_y_principal + curr_y_interest,
                    "principal_payment": curr_y_principal,
                    "interest_payment": curr_y_interest,
                    "outstanding_principal": current_principal
                })
                curr_y_principal = Decimal('0.00')
                curr_y_interest = Decimal('0.00')

        return {
            "summary": {
                "total_principal": principal,
                "total_interest": total_interest,
                "total_repayment": principal + total_interest,
                "active_emi": emi,
                "tenure_months": tenure,
                "moratorium_months": moratorium,
                "moratorium_policy": moratorium_policy,
                "annual_interest_rate": annual_rate
            },
            "monthly_schedule": schedule,
            "quarterly_summary": quarterly_summary,
            "annual_summary": annual_summary
        }

