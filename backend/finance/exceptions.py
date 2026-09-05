class FinanceDomainError(Exception):
    """Base exception for all finance domain errors."""
    pass

class ZeroCapitalError(FinanceDomainError):
    pass

class NegativeCapitalError(FinanceDomainError):
    pass

class InvalidProjectCostError(FinanceDomainError):
    pass

class SchemeLimitExceededError(FinanceDomainError):
    pass

class InvalidParameterError(FinanceDomainError):
    pass
