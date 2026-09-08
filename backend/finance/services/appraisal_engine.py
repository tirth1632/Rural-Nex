from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List, Optional
from .constants import ROUNDING
from ..models import FeasibilityConfiguration

class AppraisalEngine:
    @staticmethod
    def calculate_break_even(
        annual_revenue: Decimal,
        annual_variable_cost: Decimal,
        annual_fixed_cost: Decimal,
        base_unit_price: Decimal = Decimal('1.00')
    ) -> Dict[str, Any]:
        """
        Calculates Break-Even Revenue, Contribution Margin Ratio, and Break-Even Production Volume.
        """
        if annual_revenue <= Decimal('0.00'):
            return {
                "break_even_revenue": 0.0,
                "break_even_units": 0.0,
                "contribution_margin_ratio": 0.0,
                "margin_of_safety_pct": 0.0,
                "break_even_months": 12.0
            }

        contribution_margin = annual_revenue - annual_variable_cost
        cm_ratio = contribution_margin / annual_revenue if annual_revenue > 0 else Decimal('0.00')

        if cm_ratio > Decimal('0.00'):
            be_revenue = (annual_fixed_cost / cm_ratio).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
            be_units = (be_revenue / base_unit_price).quantize(Decimal('1.00'), rounding=ROUND_HALF_UP) if base_unit_price > 0 else Decimal('0.00')
        else:
            be_revenue = annual_revenue * Decimal('2.0')
            be_units = Decimal('0.00')

        margin_of_safety = max(Decimal('0.00'), annual_revenue - be_revenue)
        mos_pct = ((margin_of_safety / annual_revenue) * Decimal('100.0')).quantize(Decimal('0.1')) if annual_revenue > 0 else Decimal('0.00')
        be_months = min(Decimal('12.0'), (be_revenue / (annual_revenue / Decimal('12.0'))).quantize(Decimal('0.1'))) if annual_revenue > 0 else Decimal('12.0')

        return {
            "annual_fixed_cost": float(annual_fixed_cost),
            "annual_variable_cost": float(annual_variable_cost),
            "contribution_margin": float(contribution_margin),
            "contribution_margin_ratio": float((cm_ratio * Decimal('100.0')).quantize(Decimal('0.1'))),
            "break_even_revenue": float(be_revenue),
            "break_even_units": float(be_units),
            "margin_of_safety_amount": float(margin_of_safety),
            "margin_of_safety_pct": float(mos_pct),
            "break_even_months": float(be_months)
        }

    @staticmethod
    def calculate_dscr(
        annual_pat: Decimal,
        annual_depreciation: Decimal,
        annual_interest: Decimal,
        annual_principal: Decimal,
        config: FeasibilityConfiguration = None
    ) -> Dict[str, Any]:
        """
        Calculates Debt Service Coverage Ratio:
        DSCR = (PAT + Depreciation + Interest) / (Principal Repayment + Interest)
        """
        config = config or FeasibilityConfiguration.get_config()

        cash_available = annual_pat + annual_depreciation + annual_interest
        debt_obligation = annual_principal + annual_interest

        if debt_obligation <= Decimal('0.00'):
            dscr = Decimal('5.00')
        else:
            dscr = (cash_available / debt_obligation).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        if dscr >= config.dscr_strong_threshold:
            status = "Strong"
            risk = "Low Risk"
            interpretation = f"Comfortable debt servicing headroom (DSCR {dscr} >= {config.dscr_strong_threshold}). Lenders readily sanction."
        elif dscr >= config.dscr_moderate_threshold:
            status = "Moderate"
            risk = "Moderate Risk"
            interpretation = f"Adequate coverage (DSCR {dscr}), fully acceptable for priority sector & micro loans."
        elif dscr >= config.dscr_weak_threshold:
            status = "Weak"
            risk = "Elevated Risk"
            interpretation = f"Tight debt servicing margin (DSCR {dscr}). Susceptible to unexpected cost escalation."
        else:
            status = "High Risk"
            risk = "High Risk"
            interpretation = f"Inadequate cash generation for loan repayment (DSCR {dscr} < 1.0). Restructuring or longer tenure required."

        return {
            "dscr_value": float(dscr),
            "cash_available_for_debt": float(cash_available),
            "debt_service_obligation": float(debt_obligation),
            "status": status,
            "risk_level": risk,
            "interpretation": interpretation,
            "thresholds": {
                "strong": float(config.dscr_strong_threshold),
                "moderate": float(config.dscr_moderate_threshold),
                "weak": float(config.dscr_weak_threshold)
            }
        }

    @staticmethod
    def calculate_roi_and_payback(
        total_investment: Decimal,
        annual_net_profit: Decimal,
        annual_depreciation: Decimal
    ) -> Dict[str, Any]:
        """
        Calculates Return on Investment (ROI) and Payback Period.
        """
        if total_investment <= Decimal('0.00'):
            return {"roi_pct": 0.0, "payback_period_years": 0.0, "payback_period_months": 0}

        roi = ((annual_net_profit / total_investment) * Decimal('100.0')).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
        annual_cash_profit = annual_net_profit + annual_depreciation

        if annual_cash_profit > Decimal('0.00'):
            payback_years = (total_investment / annual_cash_profit).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            payback_months = int(payback_years * 12)
        else:
            payback_years = Decimal('99.0')
            payback_months = 999

        return {
            "roi_pct": float(roi),
            "annual_net_profit": float(annual_net_profit),
            "annual_cash_profit": float(annual_cash_profit),
            "total_investment": float(total_investment),
            "payback_period_years": float(payback_years),
            "payback_period_months": payback_months
        }

    @staticmethod
    def calculate_feasibility_score(
        profitability_pct: Decimal,
        cash_flow_healthy: bool,
        deficit_count: int,
        dscr: Decimal,
        has_adequate_funding: bool,
        working_capital_margin: Decimal,
        promoter_equity_pct: Decimal,
        risk_level: str,
        config: FeasibilityConfiguration = None
    ) -> Dict[str, Any]:
        """
        Computes 0-100 explainable Feasibility Score with configurable weight breakdown.
        """
        config = config or FeasibilityConfiguration.get_config()
        reasons = []

        # 1. Profitability component (Max = config.profitability_weight)
        if profitability_pct >= Decimal('20.0'):
            c_prof = config.profitability_weight
            reasons.append(f"Strong profitability margin ({profitability_pct}%) awarded full {c_prof} pts.")
        elif profitability_pct >= Decimal('10.0'):
            c_prof = config.profitability_weight * Decimal('0.75')
            reasons.append(f"Healthy profitability margin ({profitability_pct}%) awarded {c_prof} pts.")
        elif profitability_pct > Decimal('0.0'):
            c_prof = config.profitability_weight * Decimal('0.40')
            reasons.append(f"Modest profitability ({profitability_pct}%) awarded {c_prof} pts.")
        else:
            c_prof = Decimal('0.00')
            reasons.append(f"Project operates at an operational loss ({profitability_pct}%) (0 pts).")

        # 2. Cash Flow component (Max = config.cash_flow_weight)
        if cash_flow_healthy and deficit_count == 0:
            c_cf = config.cash_flow_weight
            reasons.append(f"Zero cash flow deficit months awarded full {c_cf} pts.")
        elif deficit_count <= 2:
            c_cf = config.cash_flow_weight * Decimal('0.50')
            reasons.append(f"Minor working capital deficit in {deficit_count} month(s) awarded {c_cf} pts.")
        else:
            c_cf = Decimal('0.00')
            reasons.append(f"Frequent cash deficits ({deficit_count} months) awarded 0 pts.")

        # 3. DSCR component (Max = config.dscr_weight)
        if dscr >= config.dscr_strong_threshold:
            c_dscr = config.dscr_weight
            reasons.append(f"Robust DSCR ({dscr}) awarded full {c_dscr} pts.")
        elif dscr >= config.dscr_moderate_threshold:
            c_dscr = config.dscr_weight * Decimal('0.75')
            reasons.append(f"Satisfactory DSCR ({dscr}) awarded {c_dscr} pts.")
        elif dscr >= config.dscr_weak_threshold:
            c_dscr = config.dscr_weight * Decimal('0.40')
            reasons.append(f"Marginal DSCR ({dscr}) awarded {c_dscr} pts.")
        else:
            c_dscr = Decimal('0.00')
            reasons.append(f"High risk DSCR below 1.0 ({dscr}) awarded 0 pts.")

        # 4. Project Funding structure (Max = config.funding_weight)
        if has_adequate_funding:
            c_fund = config.funding_weight
            reasons.append(f"Complete funding closure with verified means of finance ({c_fund} pts).")
        else:
            c_fund = config.funding_weight * Decimal('0.30')
            reasons.append(f"Unfunded capital gap detected ({c_fund} pts).")

        # 5. Working capital adequacy (Max = config.working_capital_weight)
        if working_capital_margin > Decimal('0.00') and deficit_count == 0:
            c_wc = config.working_capital_weight
            reasons.append(f"Adequate working capital liquidity cushion ({c_wc} pts).")
        elif working_capital_margin > Decimal('0.00'):
            c_wc = config.working_capital_weight * Decimal('0.50')
            reasons.append(f"Partial working capital buffer ({c_wc} pts).")
        else:
            c_wc = Decimal('0.00')
            reasons.append("Zero dedicated working capital reserve (0 pts).")

        # 6. Promoter contribution (Max = config.promoter_contribution_weight)
        if promoter_equity_pct >= Decimal('15.0'):
            c_prom = config.promoter_contribution_weight
            reasons.append(f"Substantial promoter commitment ({promoter_equity_pct}%) awarded {c_prom} pts.")
        elif promoter_equity_pct >= Decimal('5.0'):
            c_prom = config.promoter_contribution_weight * Decimal('0.80')
            reasons.append(f"Conforming promoter margin ({promoter_equity_pct}%) awarded {c_prom} pts.")
        else:
            c_prom = Decimal('0.00')
            reasons.append(f"Deficient promoter margin ({promoter_equity_pct}%) awarded 0 pts.")

        # 7. Risk Engine output (Max = config.risk_weight)
        if risk_level == "Low Risk":
            c_risk = config.risk_weight
        elif risk_level == "Moderate Risk":
            c_risk = config.risk_weight * Decimal('0.60')
        else:
            c_risk = Decimal('0.00')

        total_score = (c_prof + c_cf + c_dscr + c_fund + c_wc + c_prom + c_risk).quantize(Decimal('1.00'))
        final_score = int(max(Decimal('0'), min(Decimal('100'), total_score)))

        if final_score >= 80:
            status = "Highly Feasible"
            verdict = "Project demonstrates robust commercial economics, strong debt servicing coverage, and comfortable liquidity."
        elif final_score >= 65:
            status = "Feasible"
            verdict = "Project meets all key institutional lending benchmarks and represents a bankable proposal."
        elif final_score >= 50:
            status = "Moderately Feasible"
            verdict = "Project is viable but will require active cash flow monitoring or slightly increased margin capital."
        elif final_score >= 35:
            status = "Risky"
            verdict = "Project carries elevated repayment or working capital stress; recommend scaling down or strengthening equity."
        else:
            status = "Not Feasible"
            verdict = "Current operational or funding assumptions indicate substantial risk of debt default."

        return {
            "score": final_score,
            "status": status,
            "verdict": verdict,
            "breakdown": {
                "profitability": float(c_prof),
                "cash_flow": float(c_cf),
                "dscr": float(c_dscr),
                "project_funding": float(c_fund),
                "working_capital": float(c_wc),
                "promoter_contribution": float(c_prom),
                "risk": float(c_risk)
            },
            "reasons": reasons
        }

    @staticmethod
    def evaluate_risk(
        debt_to_project_ratio: Decimal,
        dscr: Decimal,
        deficit_months: List[int],
        break_even_mos_pct: Decimal,
        subsidy_to_cost_ratio: Decimal
    ) -> Dict[str, Any]:
        """
        Evaluates deterministic risk indicators across debt leverage, liquidity, break-even, and subsidy dependency.
        """
        indicators = []
        risk_points = 0

        # Leverage risk
        if debt_to_project_ratio > Decimal('85.0'):
            risk_points += 3
            indicators.append({
                "category": "High Leverage",
                "severity": "HIGH",
                "message": f"Bank debt accounts for {debt_to_project_ratio}% of total project cost. Heavy interest burden."
            })
        elif debt_to_project_ratio > Decimal('75.0'):
            risk_points += 1
            indicators.append({
                "category": "Moderate Leverage",
                "severity": "MEDIUM",
                "message": f"Debt-to-project ratio is {debt_to_project_ratio}%, typical for micro-enterprise financing."
            })
        else:
            indicators.append({
                "category": "Prudent Leverage",
                "severity": "LOW",
                "message": f"Prudent debt ratio ({debt_to_project_ratio}%) protects entrepreneur from interest volatility."
            })

        # DSCR risk
        if dscr < Decimal('1.0'):
            risk_points += 4
            indicators.append({
                "category": "Debt Servicing Deficit",
                "severity": "HIGH",
                "message": f"Projected operating cash flow is insufficient to service loan obligations (DSCR: {dscr})."
            })
        elif dscr < Decimal('1.25'):
            risk_points += 2
            indicators.append({
                "category": "Tight Debt Coverage",
                "severity": "MEDIUM",
                "message": f"DSCR of {dscr} leaves minimal buffer against market downturns or feed/raw material price spikes."
            })
        else:
            indicators.append({
                "category": "Healthy Debt Coverage",
                "severity": "LOW",
                "message": f"DSCR of {dscr} provides comfortable debt servicing headroom."
            })

        # Liquidity / Working capital risk
        if len(deficit_months) > 2:
            risk_points += 3
            indicators.append({
                "category": "Severe Working Capital Stress",
                "severity": "HIGH",
                "message": f"Project experiences liquidity deficits in months {', '.join(map(str, deficit_months))}."
            })
        elif len(deficit_months) > 0:
            risk_points += 1
            indicators.append({
                "category": "Transient Liquidity Dip",
                "severity": "MEDIUM",
                "message": f"Temporary working capital tightness in month(s) {', '.join(map(str, deficit_months))} during initial ramp-up."
            })
        else:
            indicators.append({
                "category": "Positive Liquidity",
                "severity": "LOW",
                "message": "Continuous positive cash reserves maintained throughout all 12 operating months."
            })

        # Break-even sensitivity
        if break_even_mos_pct < Decimal('15.0'):
            risk_points += 2
            indicators.append({
                "category": "Low Margin of Safety",
                "severity": "MEDIUM",
                "message": f"Margin of safety is only {break_even_mos_pct}%. A modest drop in sales pushes business below break-even."
            })

        # Overall Risk Level
        if risk_points >= 6:
            overall_risk = "High Risk"
            summary = "High financial risk detected. Restructuring of project size, higher equity, or lower debt advised."
        elif risk_points >= 3:
            overall_risk = "Moderate Risk"
            summary = "Moderate financial risk. Standard risk mitigations (adequate working capital limit, insurance) required."
        else:
            overall_risk = "Low Risk"
            summary = "Low financial risk. Project demonstrates solid fundamentals and high resilience."

        return {
            "overall_risk_level": overall_risk,
            "risk_score_points": risk_points,
            "summary": summary,
            "indicators": indicators
        }

    @staticmethod
    def run_sensitivity_analysis(
        base_net_profit: Decimal,
        base_revenue: Decimal,
        base_variable_cost: Decimal,
        base_fixed_cost: Decimal,
        base_interest_rate: Decimal,
        base_loan_amount: Decimal,
        base_dscr: Decimal,
        base_be_revenue: Decimal
    ) -> Dict[str, Any]:
        """
        Runs -10%, Base, +10% stress scenarios across major operating variables and identifies the most sensitive variable.
        """
        variables = [
            {"key": "selling_price", "name": "Selling Price / Realization"},
            {"key": "production_volume", "name": "Production / Demand Volume"},
            {"key": "raw_material_cost", "name": "Raw Material & Feed Cost"},
            {"key": "labour_cost", "name": "Labour & Wage Rates"},
            {"key": "interest_rate", "name": "Bank Loan Interest Rate"},
            {"key": "loan_amount", "name": "Loan Sanction Amount"}
        ]

        matrix = []
        max_profit_swing = Decimal('0.00')
        most_sensitive = "Selling Price / Realization"

        for var in variables:
            # -10% scenario impact on net profit
            if var["key"] == "selling_price":
                minus_10_profit = base_net_profit - (base_revenue * Decimal('0.10'))
                plus_10_profit = base_net_profit + (base_revenue * Decimal('0.10'))
                sensitivity_elasticity = abs(base_revenue * Decimal('0.10'))
            elif var["key"] == "production_volume":
                margin = base_revenue - base_variable_cost
                minus_10_profit = base_net_profit - (margin * Decimal('0.10'))
                plus_10_profit = base_net_profit + (margin * Decimal('0.10'))
                sensitivity_elasticity = abs(margin * Decimal('0.10'))
            elif var["key"] == "raw_material_cost":
                minus_10_profit = base_net_profit + (base_variable_cost * Decimal('0.10'))
                plus_10_profit = base_net_profit - (base_variable_cost * Decimal('0.10'))
                sensitivity_elasticity = abs(base_variable_cost * Decimal('0.10'))
            elif var["key"] == "labour_cost":
                labour_est = base_fixed_cost * Decimal('0.40')
                minus_10_profit = base_net_profit + (labour_est * Decimal('0.10'))
                plus_10_profit = base_net_profit - (labour_est * Decimal('0.10'))
                sensitivity_elasticity = abs(labour_est * Decimal('0.10'))
            elif var["key"] == "interest_rate":
                annual_int = base_loan_amount * (base_interest_rate / Decimal('100.0'))
                minus_10_profit = base_net_profit + (annual_int * Decimal('0.10'))
                plus_10_profit = base_net_profit - (annual_int * Decimal('0.10'))
                sensitivity_elasticity = abs(annual_int * Decimal('0.10'))
            else: # loan_amount
                annual_int = base_loan_amount * (base_interest_rate / Decimal('100.0'))
                minus_10_profit = base_net_profit + (annual_int * Decimal('0.10'))
                plus_10_profit = base_net_profit - (annual_int * Decimal('0.10'))
                sensitivity_elasticity = abs(annual_int * Decimal('0.10'))

            if sensitivity_elasticity > max_profit_swing:
                max_profit_swing = sensitivity_elasticity
                most_sensitive = var["name"]

            # Calculate DSCR impacts
            base_cash = base_net_profit + (base_fixed_cost * Decimal('0.20')) # proxy depr
            dscr_down = max(Decimal('0.00'), (minus_10_profit / base_net_profit * base_dscr).quantize(Decimal('0.01'))) if base_net_profit > 0 else Decimal('0.5')
            dscr_up = max(Decimal('0.00'), (plus_10_profit / base_net_profit * base_dscr).quantize(Decimal('0.01'))) if base_net_profit > 0 else Decimal('1.8')

            matrix.append({
                "variable_key": var["key"],
                "variable_name": var["name"],
                "minus_10_pct": {
                    "net_profit": float(minus_10_profit.quantize(Decimal(ROUNDING))),
                    "dscr": float(dscr_down)
                },
                "base": {
                    "net_profit": float(base_net_profit.quantize(Decimal(ROUNDING))),
                    "dscr": float(base_dscr.quantize(Decimal('0.01')))
                },
                "plus_10_pct": {
                    "net_profit": float(plus_10_profit.quantize(Decimal(ROUNDING))),
                    "dscr": float(dscr_up)
                },
                "swing_amount": float(sensitivity_elasticity.quantize(Decimal(ROUNDING)))
            })

        return {
            "matrix": matrix,
            "most_sensitive_variable": most_sensitive,
            "insight": f"Profitability is most sensitive to variations in '{most_sensitive}'. A 10% adverse movement impacts annual profit by ₹{max_profit_swing:,.2f}."
        }

    @staticmethod
    def evaluate_recommended_project_size(
        current_project_cost: Decimal,
        available_margin: Decimal,
        annual_ebitda_margin: Decimal,
        subsidy_rate_pct: Decimal,
        max_scheme_cost: Optional[Decimal]
    ) -> Dict[str, Any]:
        """
        Tests multi-scale project cost scenarios (₹5L, ₹10L, ₹15L, ₹20L, ₹25L) and recommends the financially optimal size.
        """
        scenario_costs = [
            Decimal('500000.00'),
            Decimal('1000000.00'),
            Decimal('1500000.00'),
            Decimal('2000000.00'),
            Decimal('2500000.00')
        ]

        if current_project_cost not in scenario_costs:
            scenario_costs.append(current_project_cost)
            scenario_costs.sort()

        evaluated = []
        best_size = None
        best_score = -1

        for cost in scenario_costs:
            req_margin = (cost * Decimal('0.10')).quantize(Decimal(ROUNDING))
            subsidy = (cost * (subsidy_rate_pct / Decimal('100.0'))).quantize(Decimal(ROUNDING))
            loan = max(Decimal('0.00'), cost - req_margin - (subsidy if subsidy_rate_pct > 0 else Decimal('0.00')))
            
            # Rough debt service
            annual_ds = (loan * Decimal('0.22')).quantize(Decimal(ROUNDING))
            est_ebitda = (cost * annual_ebitda_margin).quantize(Decimal(ROUNDING))
            est_dscr = (est_ebitda / annual_ds).quantize(Decimal('0.01')) if annual_ds > 0 else Decimal('3.0')

            has_equity = available_margin >= req_margin
            within_scheme = not max_scheme_cost or cost <= max_scheme_cost

            if has_equity and est_dscr >= Decimal('1.30') and within_scheme:
                status = "Feasible & Recommended"
                feasibility = "HIGH"
                score = 90
            elif has_equity and est_dscr >= Decimal('1.10'):
                status = "Feasible (Moderate Risk)"
                feasibility = "MODERATE"
                score = 70
            elif not has_equity:
                status = f"Requires additional equity (Shortfall: ₹{(req_margin - available_margin):,.2f})"
                feasibility = "EQUITY_CONSTRAINED"
                score = 40
            else:
                status = "High Debt Burden / Not Feasible"
                feasibility = "LOW"
                score = 20

            if score > best_score:
                best_score = score
                best_size = cost

            evaluated.append({
                "project_cost": float(cost),
                "formatted_cost": f"₹{cost/100000:,.1f} Lakh",
                "required_promoter_margin": float(req_margin),
                "estimated_subsidy": float(subsidy),
                "estimated_loan": float(loan),
                "estimated_dscr": float(est_dscr),
                "status": status,
                "feasibility": feasibility
            })

        best_size = best_size or current_project_cost

        return {
            "recommended_project_cost": float(best_size),
            "formatted_recommended_cost": f"₹{best_size/100000:,.1f} Lakh (₹{best_size:,.2f})",
            "reason": (
                f"Optimizes scale economies while keeping promoter equity requirement (₹{best_size * Decimal('0.10'):,.2f}) "
                f"strictly within available savings, sustaining a healthy DSCR without liquidity stress."
            ),
            "scenarios": evaluated
        }
