from decimal import Decimal

# Decimal policy for currency calculations
ROUNDING = '1.00'

class Schemes:
    MICRO = "MICRO"
    TERM = "TERM"

# Scheme rules based on user constraints
SCHEME_RULES = {
    Schemes.MICRO: {
        "max_project_cost": Decimal('140000.00'),
        "max_loan": Decimal('125000.00'),
        "interest_rate": Decimal('6.5'),
        "tenure_months": 36,
        "moratorium_months": 3
    },
    Schemes.TERM: {
        "min_project_cost": Decimal('140000.00'), # Must be greater than this
        "max_project_cost": Decimal('5000000.00'),
        "max_loan": Decimal('4500000.00'),
        "interest_rate": Decimal('8.0'),
        "tenure_months": 84,
        "moratorium_months": 6
    }
}

MARGIN_PERCENTAGE = Decimal('0.10')
LOAN_PERCENTAGE = Decimal('0.90')
