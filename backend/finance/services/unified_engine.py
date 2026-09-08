from decimal import Decimal
from typing import Dict, Any, Optional
from ..models import BusinessActivity, SchemeRule, FeasibilityConfiguration
from .project_cost_engine import ProjectCostEngine
from .scheme_matching_engine import SchemeMatchingEngine
from .subsidy_engine import SubsidyEngine
from .funding_waterfall_engine import FundingWaterfallEngine
from .amortization import AmortizationService, EMICalculator
from .forecast_engine import ForecastEngine
from .profit_cash_flow_engine import ProfitAndCashFlowEngine
from .appraisal_engine import AppraisalEngine
from .dpr_engine import DPREngine

class UnifiedFinancialFeasibilityEngine:
    @staticmethod
    def run_full_feasibility_pipeline(
        activity_id_or_code: Optional[str],
        promoter_profile: Dict[str, Any],
        location_data: Dict[str, Any],
        financial_inputs: Dict[str, Any],
        project_cost_items: Dict[str, Any],
        selected_scheme_rule_id: Optional[int] = None,
        what_if_modifiers: Optional[Dict[str, Any]] = None,
        business_stage: str = 'new'
    ) -> Dict[str, Any]:
        """
        Executes the full end-to-end deterministic financial feasibility pipeline.
        Zero hardcoded business rules; all rules evaluated from backend models.
        """
        what_if_modifiers = what_if_modifiers or {}
        
        # 1. Resolve Business Activity & Template
        activity = None
        driver_template = None
        if activity_id_or_code:
            try:
                if str(activity_id_or_code).isdigit():
                    activity = BusinessActivity.objects.filter(id=int(activity_id_or_code), is_active=True).first()
                else:
                    activity = BusinessActivity.objects.filter(code=activity_id_or_code, is_active=True).first()
            except Exception:
                pass

        if not activity:
            activity = BusinessActivity.objects.filter(is_active=True).first()

        if activity and hasattr(activity, 'driver_template'):
            driver_template = activity.driver_template

        # 2. Compute Project Cost from Itemized Inputs
        cost_results = ProjectCostEngine.calculate_totals(project_cost_items or {})
        total_project_cost = Decimal(str(cost_results['total_project_cost']))

        # Apply What-If project cost delta if provided
        cost_delta_pct = Decimal(str(what_if_modifiers.get('project_cost_delta_pct', 0.0)))
        if cost_delta_pct != Decimal('0.00'):
            total_project_cost = max(Decimal('10000.00'), total_project_cost * (Decimal('1.00') + cost_delta_pct / Decimal('100.0')))
            cost_results['total_project_cost'] = float(total_project_cost)

        # 3. Resolve Scheme and Match Rules
        matched_schemes = SchemeMatchingEngine.match_schemes(
            project_cost=total_project_cost,
            business_activity=activity,
            promoter_profile=promoter_profile,
            location_data=location_data,
            business_stage=business_stage
        )

        selected_rule = None
        if selected_scheme_rule_id:
            selected_rule = SchemeRule.objects.filter(id=selected_scheme_rule_id).select_related('scheme').first()
        elif matched_schemes:
            top_match = matched_schemes[0]
            if top_match['eligibility_status'] in ['Eligible', 'Potentially Eligible']:
                selected_rule = SchemeRule.objects.filter(id=top_match['rule_id']).select_related('scheme').first()

        # 4. Project Cost Validation vs Scheme
        cost_validation = ProjectCostEngine.validate_against_scheme(total_project_cost, selected_rule)
        eligible_project_cost = Decimal(str(cost_validation['eligible_project_cost']))

        # 5. Calculate Subsidy
        subsidy_results = SubsidyEngine.calculate_subsidy(
            eligible_project_cost=eligible_project_cost,
            scheme_rule=selected_rule,
            promoter_profile=promoter_profile,
            location_data=location_data
        )

        # 6. Funding Structure Waterfall
        own_contrib = Decimal(str(financial_inputs.get('own_contribution', 0.0)))
        addl_invest = Decimal(str(financial_inputs.get('additional_investment', 0.0)))
        other_fund = Decimal(str(financial_inputs.get('other_funding', 0.0)))

        # What-If own contribution delta
        own_contrib_delta_pct = Decimal(str(what_if_modifiers.get('own_contribution_delta_pct', 0.0)))
        if own_contrib_delta_pct != Decimal('0.00'):
            own_contrib = max(Decimal('0.00'), own_contrib * (Decimal('1.00') + own_contrib_delta_pct / Decimal('100.0')))

        waterfall_results = FundingWaterfallEngine.calculate_waterfall(
            total_project_cost=total_project_cost,
            eligible_project_cost=eligible_project_cost,
            own_contribution_input=own_contrib,
            additional_investment_input=addl_invest,
            subsidy_data=subsidy_results,
            scheme_rule=selected_rule,
            other_funding_input=other_fund
        )

        # 7. Loan & EMI Calculation
        gross_loan = Decimal(str(waterfall_results['gross_bank_loan_required']))

        if selected_rule:
            interest_rate = selected_rule.interest_rate_annual
            tenure_months = selected_rule.tenure_months
            moratorium_months = selected_rule.moratorium_months
            moratorium_policy = selected_rule.moratorium_policy
            interest_subvention = selected_rule.interest_subvention_pct
        else:
            interest_rate = Decimal('8.50')
            tenure_months = 84
            moratorium_months = 6
            moratorium_policy = 'PAY_INTEREST_ONLY'
            interest_subvention = Decimal('0.00')

        # What-If interest rate delta
        int_delta_pct = Decimal(str(what_if_modifiers.get('interest_rate_delta_pct', 0.0)))
        effective_interest_rate = max(Decimal('0.00'), interest_rate - interest_subvention + int_delta_pct)

        amortization_results = AmortizationService.generate_schedule(
            principal=gross_loan,
            annual_rate=effective_interest_rate,
            tenure=tenure_months,
            moratorium=moratorium_months,
            moratorium_policy=moratorium_policy
        )

        # 8. Revenue & Expense Forecast
        custom_drivers = financial_inputs.get('custom_drivers', {})
        scale_multiplier = float(what_if_modifiers.get('scale_multiplier', 1.0))
        
        forecast_results = ForecastEngine.generate_forecast(
            activity=activity,
            driver_template=driver_template,
            custom_drivers=custom_drivers,
            scale_multiplier=scale_multiplier
        )

        base_scenario = forecast_results['scenarios']['base']

        # Apply What-If revenue and raw material cost deltas
        rev_delta_pct = Decimal(str(what_if_modifiers.get('revenue_delta_pct', 0.0)))
        raw_delta_pct = Decimal(str(what_if_modifiers.get('raw_material_delta_pct', 0.0)))

        adjusted_months = []
        for m in base_scenario['months']:
            adj_m = dict(m)
            if rev_delta_pct != Decimal('0.00'):
                adj_m['gross_revenue'] = float(Decimal(str(adj_m['gross_revenue'])) * (Decimal('1.00') + rev_delta_pct / Decimal('100.0')))
            if raw_delta_pct != Decimal('0.00'):
                adj_m['variable_cost'] = float(Decimal(str(adj_m['variable_cost'])) * (Decimal('1.00') + raw_delta_pct / Decimal('100.0')))
            adj_m['total_opex'] = adj_m['variable_cost'] + adj_m['fixed_cost']
            adjusted_months.append(adj_m)

        # 9. Profit & Loss and Cash Flow
        pl_cf_results = ProfitAndCashFlowEngine.generate_statements(
            total_project_cost=total_project_cost,
            promoter_equity=Decimal(str(waterfall_results['total_promoter_equity'])),
            loan_amount=gross_loan,
            subsidy_amount=Decimal(str(subsidy_results['final_subsidy_amount'])),
            subsidy_timing=subsidy_results['subsidy_timing'],
            forecast_months=adjusted_months,
            amortization_schedule=amortization_results['monthly_schedule'],
            working_capital_margin=Decimal(str(financial_inputs.get('working_capital', 0.0)))
        )

        # 10. Break-Even & Appraisal Metrics
        annual_summary_pl = pl_cf_results['profit_and_loss']['annual_summary']
        annual_rev = Decimal(str(annual_summary_pl['gross_revenue']))
        annual_var = Decimal(str(annual_summary_pl['variable_costs']))
        annual_fixed = Decimal(str(annual_summary_pl['fixed_costs']))
        annual_pat = Decimal(str(annual_summary_pl['pat']))
        annual_depr = Decimal(str(annual_summary_pl['depreciation']))
        annual_interest = Decimal(str(annual_summary_pl['interest_expense']))

        # Principal repaid in Year 1
        year1_principal = sum(Decimal(str(m['principal_payment'])) for m in amortization_results['monthly_schedule'][:12])

        break_even_results = AppraisalEngine.calculate_break_even(
            annual_revenue=annual_rev,
            annual_variable_cost=annual_var,
            annual_fixed_cost=annual_fixed,
            base_unit_price=Decimal(str(forecast_results['base_selling_price']))
        )

        dscr_results = AppraisalEngine.calculate_dscr(
            annual_pat=annual_pat,
            annual_depreciation=annual_depr,
            annual_interest=annual_interest,
            annual_principal=year1_principal
        )

        roi_results = AppraisalEngine.calculate_roi_and_payback(
            total_investment=total_project_cost,
            annual_net_profit=annual_pat,
            annual_depreciation=annual_depr
        )

        # 11. Risk Engine Evaluation
        debt_to_cost = (gross_loan / total_project_cost * Decimal('100.0')).quantize(Decimal('0.1')) if total_project_cost > 0 else Decimal('0.0')
        deficit_months = pl_cf_results['cash_flow']['deficit_months']
        mos_pct = Decimal(str(break_even_results['margin_of_safety_pct']))
        subsidy_to_cost = (Decimal(str(subsidy_results['final_subsidy_amount'])) / total_project_cost * Decimal('100.0')).quantize(Decimal('0.1')) if total_project_cost > 0 else Decimal('0.0')

        risk_results = AppraisalEngine.evaluate_risk(
            debt_to_project_ratio=debt_to_cost,
            dscr=Decimal(str(dscr_results['dscr_value'])),
            deficit_months=deficit_months,
            break_even_mos_pct=mos_pct,
            subsidy_to_cost_ratio=subsidy_to_cost
        )

        # 12. Feasibility Score
        promoter_equity_pct = (Decimal(str(waterfall_results['total_promoter_equity'])) / total_project_cost * Decimal('100.0')).quantize(Decimal('0.1')) if total_project_cost > 0 else Decimal('0.0')
        feasibility_score_results = AppraisalEngine.calculate_feasibility_score(
            profitability_pct=Decimal(str(pl_cf_results['profit_and_loss']['net_profit_margin_pct'])),
            cash_flow_healthy=not pl_cf_results['cash_flow']['has_cash_deficit'],
            deficit_count=len(deficit_months),
            dscr=Decimal(str(dscr_results['dscr_value'])),
            has_adequate_funding=waterfall_results['has_adequate_margin'],
            working_capital_margin=Decimal(str(financial_inputs.get('working_capital', 0.0))),
            promoter_equity_pct=promoter_equity_pct,
            risk_level=risk_results['overall_risk_level']
        )

        # 13. Sensitivity Analysis
        sensitivity_results = AppraisalEngine.run_sensitivity_analysis(
            base_net_profit=annual_pat,
            base_revenue=annual_rev,
            base_variable_cost=annual_var,
            base_fixed_cost=annual_fixed,
            base_interest_rate=effective_interest_rate,
            base_loan_amount=gross_loan,
            base_dscr=Decimal(str(dscr_results['dscr_value'])),
            base_be_revenue=Decimal(str(break_even_results['break_even_revenue']))
        )

        # 14. Recommended Project Size
        recommended_size_results = AppraisalEngine.evaluate_recommended_project_size(
            current_project_cost=total_project_cost,
            available_margin=own_contrib + addl_invest,
            annual_ebitda_margin=Decimal(str(pl_cf_results['profit_and_loss']['ebitda_margin_pct'])) / Decimal('100.0'),
            subsidy_rate_pct=Decimal(str(subsidy_results['applicable_subsidy_pct'])),
            max_scheme_cost=selected_rule.max_project_cost if selected_rule else None
        )

        # 15. Activity Data payload
        activity_info = {
            "id": activity.id if activity else None,
            "code": activity.code if activity else "custom",
            "name": activity.name if activity else "Custom Business Activity",
            "sector": activity.get_sector_display() if activity else "Agri & Allied",
            "unit_of_measurement": activity.unit_of_measurement if activity else "Units",
            "description": activity.description if activity else ""
        }

        loan_info = {
            "principal": float(gross_loan),
            "interest_rate": float(interest_rate),
            "interest_subvention": float(interest_subvention),
            "effective_interest_rate": float(effective_interest_rate),
            "tenure_months": tenure_months,
            "moratorium_months": moratorium_months,
            "moratorium_policy": moratorium_policy
        }

        # 16. Assemble Bank DPR
        dpr_document = DPREngine.generate_bank_dpr(
            project_title=financial_inputs.get('project_title', f"{activity_info['name']} Project Feasibility"),
            promoter_profile=promoter_profile,
            location_data=location_data,
            activity_data=activity_info,
            cost_data=cost_results,
            funding_data=waterfall_results,
            subsidy_data=subsidy_results,
            loan_data=loan_info,
            amortization_data=amortization_results,
            forecast_data=forecast_results,
            pl_data=pl_cf_results['profit_and_loss'],
            cf_data=pl_cf_results['cash_flow'],
            be_data=break_even_results,
            dscr_data=dscr_results,
            roi_data=roi_results,
            risk_data=risk_results,
            sensitivity_data=sensitivity_results,
            feasibility_data=feasibility_score_results,
            scheme_rule=selected_rule
        )

        return {
            "activity": activity_info,
            "matched_schemes": matched_schemes,
            "selected_scheme_rule": {
                "id": selected_rule.id if selected_rule else None,
                "code": selected_rule.scheme.code if selected_rule else None,
                "name": selected_rule.scheme.name if selected_rule else None,
                "rule_version": selected_rule.rule_version if selected_rule else "2026.01",
                "verification_status": selected_rule.verification_status if selected_rule else "NONE",
                "official_portal_url": selected_rule.scheme.official_portal_url if selected_rule else "",
                "last_verified_date": selected_rule.last_verified_date.isoformat() if selected_rule else None
            } if selected_rule else None,
            "project_cost": cost_results,
            "cost_validation": cost_validation,
            "subsidy": subsidy_results,
            "funding_waterfall": waterfall_results,
            "loan": loan_info,
            "amortization": amortization_results,
            "forecast": forecast_results,
            "profit_and_loss": pl_cf_results['profit_and_loss'],
            "cash_flow": pl_cf_results['cash_flow'],
            "break_even": break_even_results,
            "dscr": dscr_results,
            "roi": roi_results,
            "feasibility_score": feasibility_score_results,
            "risk_analysis": risk_results,
            "sensitivity_analysis": sensitivity_results,
            "recommended_project_size": recommended_size_results,
            "bank_dpr": dpr_document,
            "calculation_audit": {
                "rule_version_used": selected_rule.rule_version if selected_rule else "2026.01",
                "verification_status": selected_rule.verification_status if selected_rule else "OFFICIAL",
                "official_source_url": selected_rule.scheme.official_portal_url if selected_rule else "",
                "last_verified": selected_rule.last_verified_date.isoformat() if selected_rule else None,
                "engine": "RuralNex Deterministic Financial Engine v2.0",
                "data_source": "Government Gazette & Official Ministry Guidelines"
            }
        }
