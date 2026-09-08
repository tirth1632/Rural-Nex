from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List
from .constants import ROUNDING

class ProfitAndCashFlowEngine:
    @staticmethod
    def generate_statements(
        total_project_cost: Decimal,
        promoter_equity: Decimal,
        loan_amount: Decimal,
        subsidy_amount: Decimal,
        subsidy_timing: str,
        forecast_months: List[Dict[str, Any]],
        amortization_schedule: List[Dict[str, Any]],
        working_capital_margin: Decimal = Decimal('0.00'),
        tax_rate_pct: Decimal = Decimal('15.0')
    ) -> Dict[str, Any]:
        """
        Generates integrated 12-month Profit & Loss (P&L) and Cash Flow Statements.
        Detects working capital deficits and provides transparent balance reconciliations.
        """
        pl_rows = []
        cf_rows = []

        # Assume 10% annual straight-line depreciation on fixed assets portion (approx 85% of project cost)
        depreciable_base = total_project_cost * Decimal('0.85')
        monthly_depreciation = (depreciable_base * Decimal('0.10') / Decimal('12.0')).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)

        # Initial opening cash: Working capital reserve brought by promoter
        current_cash = promoter_equity + working_capital_margin
        min_cash_balance = current_cash
        has_cash_deficit = False
        deficit_months = []
        max_deficit = Decimal('0.00')

        annual_totals = {
            "gross_revenue": Decimal('0.00'),
            "variable_costs": Decimal('0.00'),
            "gross_profit": Decimal('0.00'),
            "fixed_costs": Decimal('0.00'),
            "total_opex": Decimal('0.00'),
            "ebitda": Decimal('0.00'),
            "depreciation": Decimal('0.00'),
            "interest_expense": Decimal('0.00'),
            "pbt": Decimal('0.00'),
            "tax": Decimal('0.00'),
            "pat": Decimal('0.00'),
            "total_cash_inflows": Decimal('0.00'),
            "total_cash_outflows": Decimal('0.00')
        }

        for m in range(1, 13):
            # 1. Financial drivers for month m
            fc = forecast_months[m - 1] if m <= len(forecast_months) else forecast_months[-1]
            am = amortization_schedule[m - 1] if m <= len(amortization_schedule) else {"interest_payment": 0.0, "principal_payment": 0.0, "payment": 0.0}

            rev = Decimal(str(fc['gross_revenue']))
            var_cost = Decimal(str(fc['variable_cost']))
            gross_profit = rev - var_cost
            fixed_cost = Decimal(str(fc['fixed_cost']))
            opex = var_cost + fixed_cost
            ebitda = rev - opex

            interest_exp = Decimal(str(am.get('interest_payment', 0.0)))
            principal_exp = Decimal(str(am.get('principal_payment', 0.0)))
            total_debt_service = interest_exp + principal_exp

            depr = monthly_depreciation
            pbt = ebitda - depr - interest_exp
            tax = max(Decimal('0.00'), (pbt * (tax_rate_pct / Decimal('100.0'))).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)) if pbt > 0 else Decimal('0.00')
            pat = pbt - tax

            annual_totals["gross_revenue"] += rev
            annual_totals["variable_costs"] += var_cost
            annual_totals["gross_profit"] += gross_profit
            annual_totals["fixed_costs"] += fixed_cost
            annual_totals["total_opex"] += opex
            annual_totals["ebitda"] += ebitda
            annual_totals["depreciation"] += depr
            annual_totals["interest_expense"] += interest_exp
            annual_totals["pbt"] += pbt
            annual_totals["tax"] += tax
            annual_totals["pat"] += pat

            pl_rows.append({
                "month": m,
                "month_label": f"Month {m}",
                "gross_revenue": float(rev),
                "variable_costs": float(var_cost),
                "gross_profit": float(gross_profit),
                "fixed_costs": float(fixed_cost),
                "total_opex": float(opex),
                "ebitda": float(ebitda),
                "depreciation": float(depr),
                "interest_expense": float(interest_exp),
                "profit_before_tax": float(pbt),
                "tax": float(tax),
                "net_profit": float(pat)
            })

            # 2. Cash Flow Statement for month m
            opening_cash = current_cash

            if m == 1:
                # Month 1: Initial Capex out, Loan disbursement in
                inflows_loan = loan_amount
                inflows_subsidy = subsidy_amount if subsidy_timing == 'UPFRONT' else Decimal('0.00')
                inflows_rev = rev
                total_inflows = inflows_loan + inflows_subsidy + inflows_rev

                capex_out = total_project_cost
                opex_out = opex
                debt_service_out = total_debt_service
                tax_out = tax
                total_outflows = capex_out + opex_out + debt_service_out + tax_out
            else:
                inflows_loan = Decimal('0.00')
                inflows_subsidy = Decimal('0.00')
                inflows_rev = rev
                total_inflows = inflows_rev

                capex_out = Decimal('0.00')
                opex_out = opex
                debt_service_out = total_debt_service
                tax_out = tax
                total_outflows = opex_out + debt_service_out + tax_out

            closing_cash = opening_cash + total_inflows - total_outflows
            current_cash = closing_cash

            annual_totals["total_cash_inflows"] += total_inflows
            annual_totals["total_cash_outflows"] += total_outflows

            if closing_cash < Decimal('0.00'):
                has_cash_deficit = True
                deficit_months.append(m)
                if abs(closing_cash) > max_deficit:
                    max_deficit = abs(closing_cash)

            if closing_cash < min_cash_balance:
                min_cash_balance = closing_cash

            cf_rows.append({
                "month": m,
                "month_label": f"Month {m}",
                "opening_cash": float(opening_cash),
                "inflows": {
                    "revenue": float(inflows_rev),
                    "loan_disbursement": float(inflows_loan),
                    "subsidy": float(inflows_subsidy),
                    "total": float(total_inflows)
                },
                "outflows": {
                    "capex": float(capex_out),
                    "opex": float(opex_out),
                    "debt_service": float(debt_service_out),
                    "tax": float(tax_out),
                    "total": float(total_outflows)
                },
                "net_cash_flow": float(total_inflows - total_outflows),
                "closing_cash": float(closing_cash),
                "is_deficit": closing_cash < Decimal('0.00')
            })

        return {
            "profit_and_loss": {
                "monthly": pl_rows,
                "annual_summary": {k: float(v) for k, v in annual_totals.items()},
                "ebitda_margin_pct": float((annual_totals["ebitda"] / annual_totals["gross_revenue"] * 100).quantize(Decimal('0.1'))) if annual_totals["gross_revenue"] > 0 else 0.0,
                "net_profit_margin_pct": float((annual_totals["pat"] / annual_totals["gross_revenue"] * 100).quantize(Decimal('0.1'))) if annual_totals["gross_revenue"] > 0 else 0.0
            },
            "cash_flow": {
                "monthly": cf_rows,
                "annual_inflows": float(annual_totals["total_cash_inflows"]),
                "annual_outflows": float(annual_totals["total_cash_outflows"]),
                "net_annual_cash_generation": float(annual_totals["total_cash_inflows"] - annual_totals["total_cash_outflows"]),
                "closing_cash_year1": float(current_cash),
                "min_cash_balance": float(min_cash_balance),
                "has_cash_deficit": has_cash_deficit,
                "deficit_months": deficit_months,
                "max_deficit_amount": float(max_deficit),
                "warning_message": (
                    f"Working capital shortfall detected in Month(s) {', '.join(map(str, deficit_months))}. "
                    f"Peak liquidity deficit is ₹{max_deficit:,.2f}. Consider increasing initial promoter working capital or opting for CC limit."
                    if has_cash_deficit else "Operating cash flow remains positive throughout Year 1 with adequate liquidity reserve."
                )
            }
        }
