export interface ScoringMetrics {
  marketDemand: number; // 0 - 100
  competition: number; // 0 - 100 (higher means less intense competition / better market entry)
  accessibility: number; // 0 - 100
  customerDensity: number; // 0 - 100
  infrastructure: number; // 0 - 100
  investmentFit: number; // 0 - 100
  growthPotential: number; // 0 - 100
}

export interface ScoreTier {
  label: 'Excellent' | 'High Potential' | 'Moderate' | 'Low' | 'Poor';
  badgeColor: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
}

export interface ScoreResult {
  overallScore: number; // 0 - 100
  tier: ScoreTier;
  breakdown: {
    marketDemand: number;
    competition: number;
    accessibility: number;
    customerDensity: number;
    infrastructure: number;
    investmentFit: number;
    growthPotential: number;
  };
  keyDrivers: string[];
}

// Configurable scoring weights
const SCORING_WEIGHTS = {
  marketDemand: 0.20,
  competition: 0.15,
  accessibility: 0.15,
  customerDensity: 0.15,
  infrastructure: 0.15,
  investmentFit: 0.10,
  growthPotential: 0.10,
};

export const geoSpatialScoringService = {
  calculateOpportunityScore(
    metrics: ScoringMetrics,
    businessCategory?: string,
    investmentRange?: string
  ): ScoreResult {
    const rawScore =
      metrics.marketDemand * SCORING_WEIGHTS.marketDemand +
      metrics.competition * SCORING_WEIGHTS.competition +
      metrics.accessibility * SCORING_WEIGHTS.accessibility +
      metrics.customerDensity * SCORING_WEIGHTS.customerDensity +
      metrics.infrastructure * SCORING_WEIGHTS.infrastructure +
      metrics.investmentFit * SCORING_WEIGHTS.investmentFit +
      metrics.growthPotential * SCORING_WEIGHTS.growthPotential;

    const overallScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let tier: ScoreTier;
    if (overallScore >= 90) {
      tier = {
        label: 'Excellent',
        badgeColor: 'bg-emerald-500 text-white',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-300',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      };
    } else if (overallScore >= 75) {
      tier = {
        label: 'High Potential',
        badgeColor: 'bg-emerald-600 text-white',
        textColor: 'text-emerald-800 dark:text-emerald-200',
        borderColor: 'border-emerald-200',
        bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      };
    } else if (overallScore >= 60) {
      tier = {
        label: 'Moderate',
        badgeColor: 'bg-amber-500 text-white',
        textColor: 'text-amber-800 dark:text-amber-200',
        borderColor: 'border-amber-200',
        bgLight: 'bg-amber-50 dark:bg-amber-950/30',
      };
    } else if (overallScore >= 40) {
      tier = {
        label: 'Low',
        badgeColor: 'bg-orange-500 text-white',
        textColor: 'text-orange-800 dark:text-orange-200',
        borderColor: 'border-orange-200',
        bgLight: 'bg-orange-50 dark:bg-orange-950/30',
      };
    } else {
      tier = {
        label: 'Poor',
        badgeColor: 'bg-red-500 text-white',
        textColor: 'text-red-800 dark:text-red-200',
        borderColor: 'border-red-200',
        bgLight: 'bg-red-50 dark:bg-red-950/30',
      };
    }

    // Generate transparent rationale drivers based on metrics
    const keyDrivers: string[] = [];
    if (metrics.marketDemand >= 85) {
      keyDrivers.push(`Strong local consumer demand for ${businessCategory || 'rural enterprise'} with robust buying power.`);
    }
    if (metrics.competition >= 85) {
      keyDrivers.push(`Favorable low competitor concentration in this trade zone.`);
    } else if (metrics.competition < 60) {
      keyDrivers.push(`Moderate to high local competition; differentiation strategy recommended.`);
    }
    if (metrics.accessibility >= 85) {
      keyDrivers.push(`Direct proximity to state/national highway hubs & public transport logistics.`);
    }
    if (metrics.infrastructure >= 80) {
      keyDrivers.push(`Reliable 3-phase industrial/commercial grid power and high-speed broadband availability.`);
    }
    if (metrics.investmentFit >= 85 && investmentRange) {
      keyDrivers.push(`Optimal capital alignment for the selected budget tier (${investmentRange}).`);
    }

    if (keyDrivers.length === 0) {
      keyDrivers.push(`Balanced location metrics suitable for standard commercial development.`);
    }

    return {
      overallScore,
      tier,
      breakdown: {
        marketDemand: Math.round(metrics.marketDemand),
        competition: Math.round(metrics.competition),
        accessibility: Math.round(metrics.accessibility),
        customerDensity: Math.round(metrics.customerDensity),
        infrastructure: Math.round(metrics.infrastructure),
        investmentFit: Math.round(metrics.investmentFit),
        growthPotential: Math.round(metrics.growthPotential),
      },
      keyDrivers,
    };
  },
};
