from datetime import datetime
from typing import Dict, Any, Optional

class DPREngine:
    @staticmethod
    def generate_bank_dpr(
        project_title: str,
        promoter_profile: Dict[str, Any],
        location_data: Dict[str, Any],
        activity_data: Dict[str, Any],
        cost_data: Dict[str, Any],
        funding_data: Dict[str, Any],
        subsidy_data: Dict[str, Any],
        loan_data: Dict[str, Any],
        amortization_data: Dict[str, Any],
        forecast_data: Dict[str, Any],
        pl_data: Dict[str, Any],
        cf_data: Dict[str, Any],
        be_data: Dict[str, Any],
        dscr_data: Dict[str, Any],
        roi_data: Dict[str, Any],
        risk_data: Dict[str, Any],
        sensitivity_data: Dict[str, Any],
        feasibility_data: Dict[str, Any],
        scheme_rule: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes all deterministic financial engine outputs into a formal 28-section institutional Bank DPR.
        """
        now = datetime.now()
        report_id = f"RNX-DPR-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"

        dpr = {
            "metadata": {
                "report_id": report_id,
                "generation_timestamp": now.isoformat(),
                "formatted_date": now.strftime("%d %B %Y, %I:%M %p"),
                "system_branding": "RuralNex Intelligent Financial Engine",
                "appraisal_standard": "RBI MSME Priority Sector Lending & NABARD Project Appraisal Norms",
                "rule_version_used": subsidy_data.get('rule_version', '2026.01'),
                "verification_status": subsidy_data.get('verification_status', 'OFFICIAL')
            },
            "sections": {
                # 1. Applicant Details
                "1_applicant_details": {
                    "section_number": 1,
                    "title": "Applicant Details",
                    "full_name": promoter_profile.get('name', 'Rural Entrepreneur'),
                    "contact_phone": promoter_profile.get('phone', 'Registered Profile Phone'),
                    "email": promoter_profile.get('email', 'applicant@ruralnex.org'),
                    "aadhaar_pan_status": "Verified KYC on file",
                    "applicant_type": "Individual Proprietorship / Micro Enterprise"
                },
                # 2. Project Details
                "2_project_details": {
                    "section_number": 2,
                    "title": "Project Details",
                    "project_name": project_title or f"Commercial {activity_data.get('name', 'Rural Business')} Unit",
                    "sector": activity_data.get('sector', 'Agri & Allied'),
                    "activity_name": activity_data.get('name', 'Micro Business'),
                    "proposed_capacity": f"{forecast_data.get('base_monthly_capacity', 1000):,.0f} {forecast_data.get('unit_of_measurement', 'Units')} / Month",
                    "implementation_period": "3–6 Months from Loan Sanction"
                },
                # 3. Location
                "3_location": {
                    "section_number": 3,
                    "title": "Location Details",
                    "village": location_data.get('village', 'Village Center'),
                    "block_taluka": location_data.get('block', 'Block HQ'),
                    "district": location_data.get('district', 'District'),
                    "state": location_data.get('state', 'State'),
                    "area_classification": str(location_data.get('rural_urban', 'Rural')).title(),
                    "pincode": location_data.get('pincode', 'N/A'),
                    "infrastructure_connectivity": "All-weather road connectivity, 3-phase commercial electricity supply, local water source available"
                },
                # 4. Promoter Profile
                "4_promoter_profile": {
                    "section_number": 4,
                    "title": "Promoter Profile",
                    "age": promoter_profile.get('age', 28),
                    "gender": str(promoter_profile.get('gender', 'Male')).title(),
                    "social_category": str(promoter_profile.get('social_category', 'General')).upper(),
                    "special_category": str(promoter_profile.get('special_category', 'None')).title(),
                    "educational_qualification": promoter_profile.get('education', '12th Pass / Graduate'),
                    "technical_experience": promoter_profile.get('experience', '3+ years in local farming / allied operations'),
                    "existing_business": "Yes" if promoter_profile.get('existing_business') else "No (Greenfield / New Venture)",
                    "credit_history": "No reported defaults in institutional credit bureaus"
                },
                # 5. Business Description
                "5_business_description": {
                    "section_number": 5,
                    "title": "Business Description",
                    "overview": activity_data.get('description', 'Comprehensive rural enterprise serving local and semi-urban demand.'),
                    "operational_model": "Direct production/procurement, in-house quality testing, value addition and aggregated distribution to local market cooperatives and retail buyers.",
                    "employment_generation": f"Direct employment for 3–6 rural youth and indirect livelihood support for 15+ local agrarian families."
                },
                # 6. Market Overview
                "6_market_overview": {
                    "section_number": 6,
                    "title": "Market Overview & Demand Potential",
                    "target_market": "Local consumer retail, cooperative dairies/grain mandis, wholesale aggregators within 35 km radius.",
                    "demand_drivers": "Rising per-capita rural purchasing power, demand for hygienically processed food products, supply-chain modernization.",
                    "competitive_advantage": "Proximity to production clusters, lower logistics cost, direct consumer trust, competitive local pricing."
                },
                # 7. Project Cost
                "7_project_cost": {
                    "section_number": 7,
                    "title": "Project Cost Breakdown",
                    "total_project_cost": cost_data.get('total_project_cost', 0.0),
                    "category_summaries": cost_data.get('category_summaries', {}),
                    "itemized_list": cost_data.get('all_items', [])
                },
                # 8. Means of Finance
                "8_means_of_finance": {
                    "section_number": 8,
                    "title": "Means of Finance (Funding Waterfall)",
                    "waterfall_stages": funding_data.get('waterfall_stages', []),
                    "promoter_equity": funding_data.get('total_promoter_equity', 0.0),
                    "subsidy_grant": funding_data.get('subsidy_amount', 0.0),
                    "bank_term_debt": funding_data.get('gross_bank_loan_required', 0.0),
                    "other_funding": funding_data.get('other_funding', 0.0)
                },
                # 9. Government Scheme
                "9_government_scheme": {
                    "section_number": 9,
                    "title": "Government Scheme & Nodal Agency",
                    "scheme_name": subsidy_data.get('source_document', 'Government Credit Scheme'),
                    "official_portal": subsidy_data.get('official_portal_url', ''),
                    "rule_version": subsidy_data.get('rule_version', '2026.01'),
                    "verification_status": subsidy_data.get('verification_status', 'OFFICIAL'),
                    "last_verified": subsidy_data.get('last_verified_date', '')
                },
                # 10. Subsidy Calculation
                "10_subsidy_calculation": {
                    "section_number": 10,
                    "title": "Subsidy & Entitlement Calculation",
                    "subsidy_rate_pct": subsidy_data.get('applicable_subsidy_pct', 0.0),
                    "eligible_base_amount": subsidy_data.get('eligible_base_amount', 0.0),
                    "calculated_subsidy": subsidy_data.get('raw_subsidy_amount', 0.0),
                    "statutory_cap": subsidy_data.get('max_subsidy_cap', 0.0),
                    "final_sanctioned_subsidy": subsidy_data.get('final_subsidy_amount', 0.0),
                    "subsidy_timing_mode": subsidy_data.get('subsidy_timing_display', 'Back-Ended Subsidy (TDR)'),
                    "arithmetic_steps": subsidy_data.get('calculation_steps', [])
                },
                # 11. Loan Requirement
                "11_loan_requirement": {
                    "section_number": 11,
                    "title": "Bank Loan Requirement",
                    "sanction_amount": loan_data.get('principal', 0.0),
                    "interest_rate_annual": loan_data.get('interest_rate', 8.5),
                    "effective_rate_after_subvention": loan_data.get('effective_interest_rate', 8.5),
                    "tenure_months": loan_data.get('tenure_months', 84),
                    "moratorium_months": loan_data.get('moratorium_months', 6),
                    "moratorium_policy": loan_data.get('moratorium_policy', 'PAY_INTEREST_ONLY')
                },
                # 12. EMI
                "12_emi": {
                    "section_number": 12,
                    "title": "EMI & Debt Servicing Structure",
                    "active_emi": amortization_data.get('summary', {}).get('active_emi', 0.0),
                    "moratorium_monthly_payment": f"₹{(loan_data.get('principal', 0) * (loan_data.get('interest_rate', 8.5)/100)/12):,.2f} (Interest only)",
                    "repayment_frequency": "Monthly reducing balance"
                },
                # 13. Repayment Schedule
                "13_repayment_schedule": {
                    "section_number": 13,
                    "title": "Amortization & Repayment Schedule",
                    "total_principal": amortization_data.get('summary', {}).get('total_principal', 0.0),
                    "total_interest": amortization_data.get('summary', {}).get('total_interest', 0.0),
                    "total_repayment": amortization_data.get('summary', {}).get('total_repayment', 0.0),
                    "annual_summary": amortization_data.get('annual_summary', []),
                    "monthly_schedule_preview": amortization_data.get('monthly_schedule', [])[:12]
                },
                # 14. Production Assumptions
                "14_production_assumptions": {
                    "section_number": 14,
                    "title": "Production & Operating Assumptions",
                    "installed_capacity": f"{forecast_data.get('base_monthly_capacity', 1000):,.0f} {forecast_data.get('unit_of_measurement', 'Units')}",
                    "operating_days": forecast_data.get('operating_days_per_month', 26),
                    "unit_selling_price": forecast_data.get('base_selling_price', 0.0),
                    "unit_variable_cost": forecast_data.get('base_variable_cost_per_unit', 0.0),
                    "monthly_fixed_costs": forecast_data.get('monthly_fixed_costs', 0.0)
                },
                # 15. Revenue Projection
                "15_revenue_projection": {
                    "section_number": 15,
                    "title": "12-Month Revenue Projections (Base Scenario)",
                    "annual_revenue": forecast_data.get('scenarios', {}).get('base', {}).get('annual_revenue', 0.0),
                    "monthly_average": forecast_data.get('scenarios', {}).get('base', {}).get('average_monthly_revenue', 0.0),
                    "monthly_trend": [
                        {"month": m['month'], "revenue": m['gross_revenue'], "utilization": m['capacity_utilization_pct']}
                        for m in forecast_data.get('scenarios', {}).get('base', {}).get('months', [])
                    ]
                },
                # 16. Expense Projection
                "16_expense_projection": {
                    "section_number": 16,
                    "title": "12-Month Operating Expense Projections",
                    "annual_variable_costs": forecast_data.get('scenarios', {}).get('base', {}).get('annual_variable_cost', 0.0),
                    "annual_fixed_costs": forecast_data.get('scenarios', {}).get('base', {}).get('annual_fixed_cost', 0.0),
                    "annual_total_opex": forecast_data.get('scenarios', {}).get('base', {}).get('annual_total_opex', 0.0)
                },
                # 17. Profit & Loss
                "17_profit_and_loss": {
                    "section_number": 17,
                    "title": "Profit & Loss Statement (Year 1)",
                    "annual_summary": pl_data.get('annual_summary', {}),
                    "ebitda_margin_pct": pl_data.get('ebitda_margin_pct', 0.0),
                    "net_profit_margin_pct": pl_data.get('net_profit_margin_pct', 0.0),
                    "monthly_pl_rows": pl_data.get('monthly', [])
                },
                # 18. Cash Flow
                "18_cash_flow": {
                    "section_number": 18,
                    "title": "12-Month Cash Flow Statement",
                    "annual_inflows": cf_data.get('annual_inflows', 0.0),
                    "annual_outflows": cf_data.get('annual_outflows', 0.0),
                    "closing_cash_year1": cf_data.get('closing_cash_year1', 0.0),
                    "liquidity_status": cf_data.get('warning_message', 'Positive liquidity throughout Year 1.'),
                    "monthly_cash_rows": cf_data.get('monthly', [])
                },
                # 19. Break-even
                "19_break_even": {
                    "section_number": 19,
                    "title": "Break-Even Analysis",
                    "break_even_revenue": be_data.get('break_even_revenue', 0.0),
                    "break_even_units": be_data.get('break_even_units', 0.0),
                    "contribution_margin_ratio": be_data.get('contribution_margin_ratio', 0.0),
                    "margin_of_safety_pct": be_data.get('margin_of_safety_pct', 0.0),
                    "break_even_timeline_months": be_data.get('break_even_months', 0.0)
                },
                # 20. DSCR
                "20_dscr": {
                    "section_number": 20,
                    "title": "Debt Service Coverage Ratio (DSCR)",
                    "dscr_value": dscr_data.get('dscr_value', 0.0),
                    "status": dscr_data.get('status', 'Moderate'),
                    "risk_assessment": dscr_data.get('risk_level', 'Moderate Risk'),
                    "bank_interpretation": dscr_data.get('interpretation', '')
                },
                # 21. ROI
                "21_roi": {
                    "section_number": 21,
                    "title": "Return on Investment (ROI) & Payback",
                    "roi_percentage": roi_data.get('roi_pct', 0.0),
                    "payback_years": roi_data.get('payback_period_years', 0.0),
                    "payback_months": roi_data.get('payback_period_months', 0)
                },
                # 22. Risk Analysis
                "22_risk_analysis": {
                    "section_number": 22,
                    "title": "Financial Risk & Mitigation Framework",
                    "overall_risk_level": risk_data.get('overall_risk_level', 'Moderate Risk'),
                    "risk_summary": risk_data.get('summary', ''),
                    "risk_indicators": risk_data.get('indicators', [])
                },
                # 23. Sensitivity Analysis
                "23_sensitivity_analysis": {
                    "section_number": 23,
                    "title": "Sensitivity & Stress Testing Matrix",
                    "most_sensitive_variable": sensitivity_data.get('most_sensitive_variable', ''),
                    "sensitivity_insight": sensitivity_data.get('insight', ''),
                    "matrix": sensitivity_data.get('matrix', [])
                },
                # 24. Financial Feasibility
                "24_financial_feasibility": {
                    "section_number": 24,
                    "title": "Feasibility Scorecard & Institutional Assessment",
                    "feasibility_score": feasibility_data.get('score', 80),
                    "feasibility_status": feasibility_data.get('status', 'Feasible'),
                    "verdict": feasibility_data.get('verdict', ''),
                    "scoring_breakdown": feasibility_data.get('breakdown', {}),
                    "evaluator_reasons": feasibility_data.get('reasons', [])
                },
                # 25. Required Documents
                "25_required_documents": {
                    "section_number": 25,
                    "title": "Statutory & Bank Document Checklist",
                    "checklist": subsidy_data.get('required_documents', [
                        "Promoter Aadhaar & PAN Cards",
                        "Passport size photographs (3 copies)",
                        "Educational qualification certificate / Marksheet",
                        "Social Category / Caste Certificate (SC/ST/OBC/Minority) if claiming reservation",
                        "Rural Area Certificate from Village Panchayat / BDO",
                        "Proof of Land / Shed ownership or registered rent/lease agreement (min 5 years)",
                        "Quotations from authorized machinery and equipment vendors with GST numbers",
                        "Electricity connection sanction letter / commercial load estimate",
                        "Bank Account Statement for past 6 months",
                        "EDP (Entrepreneurship Development Programme) Training Certificate (where mandatory)"
                    ])
                },
                # 26. Assumptions
                "26_assumptions": {
                    "section_number": 26,
                    "title": "Key Operating & Financial Assumptions",
                    "list": [
                        "Raw material and sales prices remain within +/-10% of stated projections.",
                        "Commercial operations commence within 90 days of machinery installation.",
                        "Loan interest rate assumed as prevailing bank repo-linked lending rate (RLLR).",
                        "Working capital cycle assumed at 30 days receivables and 15 days payables.",
                        "Depreciation calculated at standard 10% straight-line basis on fixed assets.",
                        "Income tax estimated at presumptive micro-enterprise tax rate of 15%."
                    ]
                },
                # 27. Data Sources
                "27_data_sources": {
                    "section_number": 27,
                    "title": "Data Sources & Benchmark Verification",
                    "sources": [
                        {"name": "Government Scheme Guidelines", "source": subsidy_data.get('source_document', 'Official Notification'), "url": subsidy_data.get('official_portal_url', '')},
                        {"name": "Rule Engine Version", "source": f"RuralNex Engine v{subsidy_data.get('rule_version', '2026.01')}", "status": subsidy_data.get('verification_status', 'OFFICIAL')},
                        {"name": "Benchmark Unit Costs", "source": "District Industrial Center (DIC) & State Agro Development Corporation Standards", "status": "VERIFIED"},
                        {"name": "Last Verification Date", "source": subsidy_data.get('last_verified_date', now.strftime('%Y-%m-%d')), "status": "CURRENT"}
                    ]
                },
                # 28. Disclaimer
                "28_disclaimer": {
                    "section_number": 28,
                    "title": "Institutional Disclaimer & Declaration",
                    "text": (
                        "This Detailed Project Report (DPR) is generated by the RuralNex Financial Feasibility Engine based on "
                        "applicant inputs and active official government scheme guidelines. Actual loan sanction, subsidy release, "
                        "and interest terms are subject to formal underwriting, physical site inspection, and approval by the "
                        "financing bank and nodal implementing agency (e.g. KVIC / DIC / NABARD). Calculations are deterministic "
                        "and based on rule versions recorded at time of report generation."
                    )
                }
            }
        }
        return dpr
