import { ApiClient } from './api';
import type { AIAdvisorResponse } from '../types';

export class AiService {
  public static async generateAdvisoryBrief(
    businessCategory: string,
    location: string,
    capitalRupees: number
  ): Promise<AIAdvisorResponse> {
    const fallbackResponse: AIAdvisorResponse = {
      context: {
        user: 'Ramesh Kumar',
        location,
        capital: capitalRupees,
        preferredCategory: businessCategory,
      },
      executiveSummary: `Analysis for ${location} indicates high demand for local agro-processing and milk chilling facilities. With ₹${(capitalRupees / 100000).toFixed(1)} Lakh capital capacity, a Dairy Processing & Chilling Unit supported by PMEGP 35% subsidy delivers a Debt Service Coverage Ratio (DSCR) of 3.8x and a 18-month payback period.`,
      feasibilityScore: 87,
      topOpportunities: [
        {
          name: 'Dairy Processing Unit (2,000 LPD)',
          score: 89,
          whyItFits: 'Surplus milk raw supply in Gharaunda block (12,000 LPD) with only 32% formal collection coverage.',
          estimatedCost: 850000,
        },
        {
          name: 'Agri Custom Hiring Center (Tractor + Spray Drone)',
          score: 84,
          whyItFits: 'High demand during paddy and wheat harvest cycles with 40% SMAM government scheme subsidy.',
          estimatedCost: 550000,
        },
        {
          name: 'Hygienic Spice Grinding Unit',
          score: 79,
          whyItFits: 'Unmet demand for branded, unadulterated pure turmeric & chili powder in local weekly mandis.',
          estimatedCost: 600000,
        }
      ],
      riskMatrix: [
        {
          risk: 'Raw Milk Price Volatility during Summer Months',
          mitigation: 'Enter into pre-fixed price supply agreements with village milk producer cooperatives.',
          severity: 'Medium',
        },
        {
          risk: 'Cold Chain Power Interruption (Grid Fluctuations)',
          mitigation: 'Install a dedicated 15 kVA silent diesel generator with automatic changeover switch.',
          severity: 'High',
        },
        {
          risk: 'FSSAI Compliance & Hygiene Audits',
          mitigation: 'Implement SSOP (Sanitation Standard Operating Procedures) and stainless steel grade 304 tanks.',
          severity: 'Low',
        }
      ],
      regulatoryChecklist: [
        { title: 'FSSAI Food Safety Registration / License', agency: 'Food Safety and Standards Authority', timeline: '15 Days' },
        { title: 'State Pollution Control Board NOC (Consent to Operate)', agency: 'HSPCB', timeline: '21 Days' },
        { title: 'Udyam MSME Registration Certificate', agency: 'Ministry of MSME Portal', timeline: 'Immediate (Online)' },
        { title: 'PMEGP Subsidy Sanction Letter', agency: 'KVIC / District Industries Center', timeline: '30 Days' },
      ],
      roadmap: [
        {
          phase: 'Phase 1: Approvals & Land Setup',
          timeline: 'Days 1 - 20',
          tasks: [
            'Secure Udyam Registration online via Aadhaar',
            'Obtain Land Lease Agreement / Panchayati NOC',
            'Submit DPR to District Industries Center (DIC) for PMEGP'
          ]
        },
        {
          phase: 'Phase 2: Machinery Procurement & Site Prep',
          timeline: 'Days 21 - 50',
          tasks: [
            'Release 15% own contribution into Bank Escrow',
            'Procure BMC 2000L Chiller and Cream Separator',
            'Install 3-phase power line and backup generator'
          ]
        },
        {
          phase: 'Phase 3: Trial Run & Brand Launch',
          timeline: 'Days 51 - 90',
          tasks: [
            'Conduct water & milk purity lab testing for FSSAI',
            'Enrol 40 local dairy farmers into morning/evening collection schedule',
            'Begin commercial distribution to Karnal wholesale sweet shops'
          ]
        }
      ]
    };

    return ApiClient.post('/ai/advise/', { businessCategory, location, capitalRupees }, fallbackResponse);
  }
}
