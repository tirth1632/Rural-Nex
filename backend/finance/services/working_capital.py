from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any
from .constants import ROUNDING
from ..exceptions import InvalidParameterError

class WorkingCapitalService:
    @staticmethod
    def estimate(projected_annual_turnover: Decimal, margin_percentage: Decimal = Decimal('0.20')) -> Dict[str, Decimal]:
        """
        Estimates the standard working capital requirement.
        Often calculated as a percentage of the projected annual turnover.
        """
        if margin_percentage is None:
            margin_percentage = Decimal('0.20')
        else:
            margin_percentage = Decimal(str(margin_percentage))

        if margin_percentage <= Decimal('0.00') or margin_percentage >= Decimal('1.00'):
            raise InvalidParameterError("Margin percentage must be between 0 and 1.")


        required_wc = (projected_annual_turnover * margin_percentage).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
        bank_finance = (required_wc * Decimal('0.75')).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP) # Standard 75% finance
        promoter_margin = required_wc - bank_finance

        return {
            "projected_turnover": projected_annual_turnover,
            "total_working_capital_required": required_wc,
            "eligible_bank_finance": bank_finance,
            "promoter_margin": promoter_margin
        }
