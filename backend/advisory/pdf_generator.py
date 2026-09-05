import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from advisory.models import BusinessProposal, FeasibilityReport

class ReportGeneratorService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1e3a8a') # primary blue
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#1f2937')
        ))

        self.styles.add(ParagraphStyle(
            name='AIRecommendation',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#6b21a8'), # purple for AI
            backColor=colors.HexColor('#faf5ff'),
            borderPadding=10,
            borderColor=colors.HexColor('#d8b4fe'),
            borderWidth=1,
            borderRadius=5
        ))
        
        self.styles.add(ParagraphStyle(
            name='OfficialScheme',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#1e40af'), # blue for scheme
            backColor=colors.HexColor('#eff6ff'),
            borderPadding=10,
            borderColor=colors.HexColor('#bfdbfe'),
            borderWidth=1,
            borderRadius=5
        ))

        self.styles.add(ParagraphStyle(
            name='DeterministicCalc',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#065f46'), # green for calc
            backColor=colors.HexColor('#ecfdf5'),
            borderPadding=10,
            borderColor=colors.HexColor('#a7f3d0'),
            borderWidth=1,
            borderRadius=5
        ))

        self.styles.add(ParagraphStyle(
            name='ExternalObs',
            parent=self.styles['Normal'],
            fontName='Helvetica-Oblique',
            textColor=colors.HexColor('#4b5563') # gray italic
        ))

        self.styles.add(ParagraphStyle(
            name='Assumption',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#6b7280')
        ))

    def generate_pdf(self, proposal: BusinessProposal, report: FeasibilityReport):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=50, 
            leftMargin=50, 
            topMargin=50, 
            bottomMargin=50
        )

        elements = []
        
        # Helper to add section
        def _add_section(title, content, style_name='Normal'):
            if title:
                elements.append(Paragraph(title, self.styles['SectionHeader']))
            
            if isinstance(content, list):
                for c in content:
                    elements.append(Paragraph(str(c), self.styles[style_name]))
                    elements.append(Spacer(1, 5))
            else:
                elements.append(Paragraph(str(content), self.styles[style_name]))
            elements.append(Spacer(1, 10))

        # 1. Executive Summary
        elements.append(Paragraph(f"Business Feasibility Report", self.styles['ReportTitle']))
        _add_section("1. Executive Summary (AI Generated)", report.executive_summary, 'AIRecommendation')

        import html
        def _e(s): return html.escape(str(s))

        # 2. Entrepreneur Inputs
        inputs_data = [
            ["Business Category", _e(proposal.category.name) if proposal.category else 'N/A'],
            ["Margin Capital", f"INR {proposal.margin_capital}"],
            ["Expected Scale", _e(proposal.expected_scale) or 'N/A'],
            ["Experience (Years)", str(proposal.experience_years)],
            ["Target Customers", _e(proposal.target_customers) or 'N/A']
        ]
        
        t = Table(inputs_data, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e5e7eb'))
        ]))
        
        elements.append(Paragraph("2. Entrepreneur Inputs", self.styles['SectionHeader']))
        elements.append(t)
        elements.append(Spacer(1, 20))

        # 3 & 4. Location & Business Context
        loc_str = f"Village: {_e(proposal.village)}, Block: {_e(proposal.block)}, District: {_e(proposal.district)}, State: {_e(proposal.state)}"
        _add_section("3. Location", loc_str)

        # Ensure we have scoring data
        scoring = report.scoring_data if report.scoring_data else {}
        dimensions = scoring.get('dimensions', {})
        
        # 5, 6, 7, 8. Market Analysis (External Obs)
        mkt_reach = dimensions.get('market_reach', {})
        comp = dimensions.get('competition', {})
        opp = dimensions.get('opportunity', {})
        pricing = dimensions.get('pricing', {})
        
        _add_section("5. Market Reach (External Observation)", _e(mkt_reach.get('explanation', 'Data not available.')), 'ExternalObs')
        _add_section("6. Local Competition (External Observation)", _e(comp.get('explanation', 'Data not available.')), 'ExternalObs')
        _add_section("7. Opportunity Analysis (External Observation)", _e(opp.get('explanation', 'Data not available.')), 'ExternalObs')
        _add_section("8. Pricing Analysis (External Observation)", _e(pricing.get('explanation', 'Data not available.')), 'ExternalObs')

        # 9, 10. SWOT & Threats (AI Derived from scoring)
        # Note: In a full integration, these specific AI fields would be explicitly stored on the report model
        # For now, we will place standard placeholders emphasizing the AI style.
        _add_section("9. SWOT Summary", "Strengths, Weaknesses, Opportunities, and Threats have been analyzed dynamically in the executive summary.", 'AIRecommendation')

        # Financials (Deterministic)
        try:
            fin = proposal.financial_assessment
            fin_data = [
                ["11. Capital Requirement", f"INR {fin.feasible_project_cost}"],
                ["12. Beneficiary Contribution", f"INR {proposal.margin_capital}"],
                ["13. Eligible Project Cost", f"INR {fin.feasible_project_cost}"],
                ["14. Potential Loan", f"INR {fin.loan_amount}"],
                ["21. Working Capital Estimate", f"INR {fin.working_capital_estimate}"]
            ]
            
            t2 = Table(fin_data, colWidths=[200, 250])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#065f46')),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0'))
            ]))
            
            elements.append(Paragraph("Deterministic Financial Engine Output", self.styles['SectionHeader']))
            elements.append(t2)
            elements.append(Spacer(1, 20))

            # Scheme Rules
            scheme_data = [
                ["15. Applicable Scheme", fin.scheme],
                ["16. Interest Rate", "8.0% (Term Loan estimate)" if fin.scheme == 'Term Loan' else "6.5% (Micro estimate)"],
                ["17. Tenure", "84 months" if fin.scheme == 'Term Loan' else "36 months"],
                ["18. Moratorium", "6 months" if fin.scheme == 'Term Loan' else "3 months"],
                ["19. Est. EMI", "Calculated separately based on exact tenure"]
            ]
            
            t3 = Table(scheme_data, colWidths=[200, 250])
            t3.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1e40af')),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe'))
            ]))
            
            elements.append(Paragraph("Official Scheme Constraints", self.styles['SectionHeader']))
            elements.append(t3)
            elements.append(Spacer(1, 20))
            
        except Exception as e:
            elements.append(Paragraph("Financial data unavailable.", self.styles['Normal']))

        # Disclaimers
        elements.append(Spacer(1, 30))
        _add_section("22. Key Assumptions & 23. Data Sources", 
            "Data is synthesized from sample hyper-local inputs and standard scheme guidelines. Financials are deterministic but subject to final bank approval.", 'Assumption')
        
        _add_section("24. Confidence / Data Quality", f"Scoring Confidence Level: {scoring.get('confidence_level', 'Medium')}. Data is indicative.", 'Assumption')
        
        # 25. Final Recommendation
        rec = "Recommended to Proceed" if report.is_feasible else "High Risk - Rethink Model or Increase Capital"
        _add_section("25. Final Recommendation", rec, 'DeterministicCalc')

        doc.build(elements)
        buffer.seek(0)
        return buffer
