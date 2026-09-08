from decimal import Decimal
from typing import Dict, Any
from ..exceptions import InvalidProjectCostError
from .constants import SCHEME_RULES, Schemes

class SchemeEligibilityService:
    @staticmethod
    def determine_scheme(project_cost: Decimal) -> str:
        """
        Determines the applicable scheme strictly based on project cost.
        """
        micro_max = SCHEME_RULES[Schemes.MICRO]['max_project_cost']
        term_max = SCHEME_RULES[Schemes.TERM]['max_project_cost']
        
        if project_cost <= Decimal('0.00'):
            raise InvalidProjectCostError("Project cost must be greater than zero.")
            
        if project_cost <= micro_max:
            return Schemes.MICRO
        else:
            return Schemes.TERM


    @staticmethod
    def get_scheme_rules(scheme: str) -> Dict[str, Any]:
        """Returns hardcoded rules for a specific scheme."""
        return SCHEME_RULES.get(scheme, {})
