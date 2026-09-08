from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List, Optional
from ..models import BusinessActivity, ActivityDriverTemplate

ROUNDING = '1.00'

class ForecastEngine:
    @staticmethod
    def generate_forecast(
        activity: Optional[BusinessActivity],
        driver_template: Optional[ActivityDriverTemplate],
        custom_drivers: Dict[str, Any] = None,
        scale_multiplier: float = 1.0
    ) -> Dict[str, Any]:
        """
        Generates 12-month deterministic revenue and cost forecast across Conservative, Base, and Optimistic scenarios.
        """
        custom_drivers = custom_drivers or {}

        # 1. Base Drivers resolution
        if driver_template:
            base_capacity = Decimal(str(custom_drivers.get('capacity', driver_template.base_capacity_monthly)))
            base_price = Decimal(str(custom_drivers.get('selling_price', driver_template.default_selling_price)))
            base_var_cost = Decimal(str(custom_drivers.get('variable_cost_per_unit', driver_template.default_variable_cost_per_unit)))
            operating_days = int(custom_drivers.get('operating_days', driver_template.default_operating_days))
            fixed_costs_list = custom_drivers.get('fixed_costs', driver_template.default_fixed_costs)
            seasonal_factors = driver_template.seasonal_factors or [1.0] * 12
        else:
            base_capacity = Decimal(str(custom_drivers.get('capacity', 1000)))
            base_price = Decimal(str(custom_drivers.get('selling_price', 100)))
            base_var_cost = Decimal(str(custom_drivers.get('variable_cost_per_unit', 60)))
            operating_days = int(custom_drivers.get('operating_days', 26))
            fixed_costs_list = custom_drivers.get('fixed_costs', [
                {"name": "Rent & Premises", "monthly_amount": 10000},
                {"name": "Permanent Labor & Supervision", "monthly_amount": 18000},
                {"name": "Utilities (Electricity, Water, Fuel)", "monthly_amount": 6000},
                {"name": "Repairs, Maintenance & Consumables", "monthly_amount": 4000},
                {"name": "Admin, Insurance & Marketing", "monthly_amount": 3000}
            ])
            seasonal_factors = [1.0] * 12

        # Scale capacity by business size scale
        effective_capacity = base_capacity * Decimal(str(scale_multiplier))

        # Base Monthly Fixed Costs sum
        monthly_fixed_cost = sum(Decimal(str(item.get('monthly_amount', 0))) for item in fixed_costs_list) * Decimal(str(scale_multiplier))

        # Ramp-up curve over the first year (e.g. Month 1: 50%, Month 2: 65%, Month 3: 75%, Month 4: 85%, Month 5+: 95%+)
        ramp_up_curve = [0.55, 0.65, 0.75, 0.85, 0.90, 0.95, 0.95, 1.00, 1.00, 1.00, 1.00, 1.00]

        def build_scenario(price_mod: Decimal, vol_mod: Decimal, cost_mod: Decimal, name: str):
            months_data = []
            annual_rev = Decimal('0.00')
            annual_var = Decimal('0.00')
            annual_fixed = Decimal('0.00')

            for m in range(1, 13):
                season = Decimal(str(seasonal_factors[m - 1] if len(seasonal_factors) >= m else 1.0))
                ramp = Decimal(str(ramp_up_curve[m - 1]))
                
                utilization_pct = (ramp * vol_mod * Decimal('100.0')).quantize(Decimal('0.1'))
                monthly_production = (effective_capacity * ramp * vol_mod * season).quantize(Decimal('1.00'), rounding=ROUND_HALF_UP)
                
                effective_unit_price = (base_price * price_mod).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                gross_revenue = (monthly_production * effective_unit_price).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
                
                effective_unit_var_cost = (base_var_cost * cost_mod).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                monthly_var_cost = (monthly_production * effective_unit_var_cost).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
                
                monthly_fixed = monthly_fixed_cost.quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
                monthly_opex = monthly_var_cost + monthly_fixed
                operating_profit = gross_revenue - monthly_opex

                annual_rev += gross_revenue
                annual_var += monthly_var_cost
                annual_fixed += monthly_fixed

                months_data.append({
                    "month": m,
                    "month_label": f"Month {m}",
                    "capacity_utilization_pct": float(utilization_pct),
                    "production_volume": float(monthly_production),
                    "selling_price_per_unit": float(effective_unit_price),
                    "gross_revenue": float(gross_revenue),
                    "variable_cost": float(monthly_var_cost),
                    "fixed_cost": float(monthly_fixed),
                    "total_opex": float(monthly_opex),
                    "operating_profit": float(operating_profit)
                })

            return {
                "scenario_name": name,
                "months": months_data,
                "annual_revenue": float(annual_rev),
                "annual_variable_cost": float(annual_var),
                "annual_fixed_cost": float(annual_fixed),
                "annual_total_opex": float(annual_var + annual_fixed),
                "annual_operating_profit": float(annual_rev - (annual_var + annual_fixed)),
                "average_monthly_revenue": float((annual_rev / Decimal('12.0')).quantize(Decimal(ROUNDING))),
                "average_monthly_opex": float(((annual_var + annual_fixed) / Decimal('12.0')).quantize(Decimal(ROUNDING)))
            }

        scenarios = {
            "conservative": build_scenario(price_mod=Decimal('0.92'), vol_mod=Decimal('0.85'), cost_mod=Decimal('1.06'), name="Conservative (Stress Case)"),
            "base": build_scenario(price_mod=Decimal('1.00'), vol_mod=Decimal('1.00'), cost_mod=Decimal('1.00'), name="Base Case (Expected Performance)"),
            "optimistic": build_scenario(price_mod=Decimal('1.08'), vol_mod=Decimal('1.10'), cost_mod=Decimal('0.95'), name="Optimistic (Favorable Market)")
        }

        unit_name = activity.unit_of_measurement if activity else "Units"

        return {
            "unit_of_measurement": unit_name,
            "base_monthly_capacity": float(effective_capacity),
            "base_selling_price": float(base_price),
            "base_variable_cost_per_unit": float(base_var_cost),
            "monthly_fixed_costs": float(monthly_fixed_cost),
            "operating_days_per_month": operating_days,
            "scenarios": scenarios,
            "attribution": {
                "unit_of_measurement": "OFFICIAL_TEMPLATE",
                "base_monthly_capacity": "USER_PROVIDED" if 'capacity' in custom_drivers else "OFFICIAL_TEMPLATE",
                "base_selling_price": "USER_PROVIDED" if 'selling_price' in custom_drivers else "OFFICIAL_TEMPLATE",
                "forecast_method": "DETERMINISTIC_SCENARIO_MODELLING",
                "label": "FORECAST"
            }
        }
