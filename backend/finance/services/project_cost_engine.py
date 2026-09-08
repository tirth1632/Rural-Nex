from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List

ROUNDING = '1.00'

STANDARD_CATEGORIES = [
    'land_site',
    'building_civil',
    'plant_machinery',
    'furniture_office',
    'productive_assets',
    'pre_operative',
    'working_capital'
]

CATEGORY_LABELS = {
    'land_site': 'Land / Site Development',
    'building_civil': 'Building & Civil Works',
    'plant_machinery': 'Plant & Machinery / Equipment',
    'furniture_office': 'Furniture, Fixtures & Office Equipment',
    'productive_assets': 'Livestock & Productive Assets',
    'pre_operative': 'Pre-operative & Licensing Expenses',
    'working_capital': 'Initial Working Capital Margin'
}

class ProjectCostEngine:
    @staticmethod
    def calculate_totals(categories_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Validates and calculates itemized totals for each category and overall project cost.
        """
        category_summaries = {}
        total_project_cost = Decimal('0.00')
        sanitized_items = []

        for cat_key in STANDARD_CATEGORIES:
            raw_items = categories_data.get(cat_key, [])
            cat_total = Decimal('0.00')
            processed_items = []

            for item in raw_items:
                name = str(item.get('name', '')).strip()
                if not name:
                    continue
                try:
                    qty = Decimal(str(item.get('quantity', 1)))
                    unit_cost = Decimal(str(item.get('unit_cost', 0)))
                except Exception:
                    qty = Decimal('1.00')
                    unit_cost = Decimal('0.00')
                
                qty = max(Decimal('0.00'), qty)
                unit_cost = max(Decimal('0.00'), unit_cost)
                line_total = (qty * unit_cost).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
                cat_total += line_total

                item_record = {
                    "id": item.get('id', f"{cat_key}_{len(processed_items)+1}"),
                    "category": cat_key,
                    "category_label": CATEGORY_LABELS.get(cat_key, cat_key),
                    "name": name,
                    "quantity": float(qty),
                    "unit_cost": float(unit_cost),
                    "total_amount": float(line_total),
                    "specification": str(item.get('specification', ''))
                }
                processed_items.append(item_record)
                sanitized_items.append(item_record)

            category_summaries[cat_key] = {
                "key": cat_key,
                "label": CATEGORY_LABELS.get(cat_key, cat_key),
                "total": float(cat_total),
                "item_count": len(processed_items),
                "items": processed_items
            }
            total_project_cost += cat_total

        return {
            "total_project_cost": float(total_project_cost),
            "category_summaries": category_summaries,
            "all_items": sanitized_items
        }

    @staticmethod
    def validate_against_scheme(total_cost: Decimal, scheme_rule: Any) -> Dict[str, Any]:
        """
        Validates total cost against scheme ceilings and constraints.
        Returns eligible project cost, ineligible portion, and explanations.
        """
        if not scheme_rule:
            return {
                "eligible_project_cost": float(total_cost),
                "ineligible_portion": 0.0,
                "is_within_limits": True,
                "reasons": ["No specific scheme restrictions applied; 100% of project cost considered."]
            }

        reasons = []
        ineligible = Decimal('0.00')
        eligible_cost = total_cost

        # Scheme max limit validation
        if scheme_rule.max_project_cost and total_cost > scheme_rule.max_project_cost:
            excess = total_cost - scheme_rule.max_project_cost
            ineligible += excess
            eligible_cost = scheme_rule.max_project_cost
            reasons.append(
                f"Project cost ₹{total_cost:,.2f} exceeds scheme maximum limit of ₹{scheme_rule.max_project_cost:,.2f}. "
                f"Excess ₹{excess:,.2f} is ineligible for subsidy calculation."
            )

        if scheme_rule.min_project_cost and total_cost < scheme_rule.min_project_cost:
            reasons.append(
                f"Project cost ₹{total_cost:,.2f} is below minimum requirement of ₹{scheme_rule.min_project_cost:,.2f}."
            )

        is_within_limits = (ineligible == Decimal('0.00')) and (
            not scheme_rule.min_project_cost or total_cost >= scheme_rule.min_project_cost
        )

        return {
            "eligible_project_cost": float(eligible_cost),
            "ineligible_portion": float(ineligible),
            "is_within_limits": is_within_limits,
            "reasons": reasons if reasons else ["Project cost fully conforms with scheme ceilings."]
        }
