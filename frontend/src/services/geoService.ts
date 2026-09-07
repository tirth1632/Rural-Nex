import { geoSpatialScoringService, type ScoreResult } from './geoSpatialScoringService';

export interface StateLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  maxRadiusKm: number;
  borderWarningThresholdKm: number;
}

export interface DistrictLocation {
  id: string;
  stateId: string;
  name: string;
  lat: number;
  lng: number;
}

export interface AreaLocation {
  id: string;
  districtId: string;
  name: string;
  lat: number;
  lng: number;
}

export interface BusinessCategory {
  id: string;
  name: string;
  subTypes: string[];
}

export interface CandidateLocation {
  id: string;
  name: string;
  areaName: string;
  districtName: string;
  stateName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  isOutsideState: boolean;
  scoreResult: ScoreResult;
  
  // Market Info
  population: string;
  customerBaseEst: string;
  demandIndicator: 'Very High' | 'High' | 'Moderate' | 'Emerging';
  marketSize: string;
  nearbyMarkets: string[];
  marketConfidence: 'High' | 'Medium' | 'Low';
  
  // Competition Info
  competitorCount: number;
  competitionDensity: 'Low' | 'Medium' | 'High';
  nearestCompetitorDistance: string;
  competitorConcentration: string;
  
  // Accessibility
  nearestMajorRoad: string;
  distanceToHighway: string;
  nearestTransportHub: string;
  nearestRailwayStation: string;
  nearestBusStation: string;
  
  // Infrastructure
  electricityAvailability: string;
  waterAvailability: string;
  roadQuality: string;
  internetConnectivity: string;
  healthcareAccess: string;
  bankingAccess: string;
  infrastructureDataStatus: 'Verified' | 'Estimated' | 'Unavailable';
  
  // Financial Estimates
  estimatedAnnualRevenue: string; // e.g. "₹18.5 lakh"
  estimatedAnnualCost: string;    // e.g. "₹11.2 lakh"
  estimatedAnnualProfit: string;  // e.g. "₹7.3 lakh"
  estimatedBreakevenMonths: string; // e.g. "18 months"
  financialConfidence: 'High' | 'Medium' | 'Low';
  financialDataQuality: 'Modelled' | 'Estimated' | 'Verified';
  
  // Business Fit
  businessCategory: string;
  subType: string;
  investmentRange: string;
  investmentFitScore: number;
  demandFitScore: number;
  competitionFitScore: number;
  infrastructureFitScore: number;
  overallFitScore: number;
  
  // Established Business Age (if specific location node is an existing business)
  establishedYear?: number;
  yearsOperating?: number;
}

export interface LayerFeature {
  id: string;
  type: 'competitor' | 'transport' | 'market' | 'bank' | 'hospital' | 'school' | 'industrial' | 'agricultural';
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

export interface GeoSearchParams {
  stateId: string;
  districtId: string;
  areaId: string;
  radiusKm: number;
  businessCategory: string;
  subType?: string;
  investmentRange: string;
  constrainToInvestment: boolean;
  includeNeighboringStates: boolean;
}

// Comprehensive State & Union Territory Data for India (All 28 States + 8 Union Territories)
const STATES: StateLocation[] = [
  // 28 States
  { id: 'AP', name: 'Andhra Pradesh', lat: 15.9129, lng: 79.7400, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'AR', name: 'Arunachal Pradesh', lat: 28.2180, lng: 94.7278, maxRadiusKm: 200, borderWarningThresholdKm: 150 },
  { id: 'AS', name: 'Assam', lat: 26.2006, lng: 92.9376, maxRadiusKm: 160, borderWarningThresholdKm: 120 },
  { id: 'BR', name: 'Bihar', lat: 25.0961, lng: 85.3131, maxRadiusKm: 150, borderWarningThresholdKm: 110 },
  { id: 'CG', name: 'Chhattisgarh', lat: 21.2787, lng: 81.8661, maxRadiusKm: 190, borderWarningThresholdKm: 140 },
  { id: 'GA', name: 'Goa', lat: 15.2993, lng: 74.1240, maxRadiusKm: 70, borderWarningThresholdKm: 45 },
  { id: 'GJ', name: 'Gujarat', lat: 23.0225, lng: 72.5714, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'HR', name: 'Haryana', lat: 29.0588, lng: 76.0856, maxRadiusKm: 120, borderWarningThresholdKm: 90 },
  { id: 'HP', name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, maxRadiusKm: 140, borderWarningThresholdKm: 100 },
  { id: 'JH', name: 'Jharkhand', lat: 23.6102, lng: 85.2799, maxRadiusKm: 160, borderWarningThresholdKm: 120 },
  { id: 'KA', name: 'Karnataka', lat: 12.9716, lng: 77.5946, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'KL', name: 'Kerala', lat: 10.8505, lng: 76.2711, maxRadiusKm: 130, borderWarningThresholdKm: 95 },
  { id: 'MP', name: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, maxRadiusKm: 220, borderWarningThresholdKm: 160 },
  { id: 'MH', name: 'Maharashtra', lat: 19.0760, lng: 72.8777, maxRadiusKm: 200, borderWarningThresholdKm: 150 },
  { id: 'MN', name: 'Manipur', lat: 24.6637, lng: 93.9063, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'ML', name: 'Meghalaya', lat: 25.4670, lng: 91.3662, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'MZ', name: 'Mizoram', lat: 23.1645, lng: 92.9376, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'NL', name: 'Nagaland', lat: 26.1584, lng: 94.5624, maxRadiusKm: 100, borderWarningThresholdKm: 75 },
  { id: 'OD', name: 'Odisha', lat: 20.9517, lng: 85.0985, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'PB', name: 'Punjab', lat: 30.9010, lng: 75.8573, maxRadiusKm: 120, borderWarningThresholdKm: 90 },
  { id: 'RJ', name: 'Rajasthan', lat: 26.9124, lng: 75.7873, maxRadiusKm: 240, borderWarningThresholdKm: 180 },
  { id: 'SK', name: 'Sikkim', lat: 27.5330, lng: 88.5122, maxRadiusKm: 80, borderWarningThresholdKm: 50 },
  { id: 'TN', name: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, maxRadiusKm: 160, borderWarningThresholdKm: 120 },
  { id: 'TG', name: 'Telangana', lat: 18.1124, lng: 79.0193, maxRadiusKm: 170, borderWarningThresholdKm: 120 },
  { id: 'TR', name: 'Tripura', lat: 23.9408, lng: 91.9882, maxRadiusKm: 90, borderWarningThresholdKm: 60 },
  { id: 'UP', name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, maxRadiusKm: 210, borderWarningThresholdKm: 150 },
  { id: 'UK', name: 'Uttarakhand', lat: 30.0668, lng: 79.0193, maxRadiusKm: 130, borderWarningThresholdKm: 90 },
  { id: 'WB', name: 'West Bengal', lat: 22.9868, lng: 87.8550, maxRadiusKm: 170, borderWarningThresholdKm: 120 },

  // 8 Union Territories
  { id: 'AN', name: 'Andaman and Nicobar Islands', lat: 11.7401, lng: 92.6586, maxRadiusKm: 90, borderWarningThresholdKm: 60 },
  { id: 'CH', name: 'Chandigarh', lat: 30.7333, lng: 76.7794, maxRadiusKm: 50, borderWarningThresholdKm: 30 },
  { id: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.4283, lng: 72.8397, maxRadiusKm: 60, borderWarningThresholdKm: 40 },
  { id: 'DL', name: 'Delhi (NCT)', lat: 28.7041, lng: 77.1025, maxRadiusKm: 70, borderWarningThresholdKm: 45 },
  { id: 'JK', name: 'Jammu and Kashmir', lat: 33.7782, lng: 76.5762, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'LA', name: 'Ladakh', lat: 34.1526, lng: 77.5771, maxRadiusKm: 220, borderWarningThresholdKm: 160 },
  { id: 'LD', name: 'Lakshadweep', lat: 10.5667, lng: 72.6417, maxRadiusKm: 50, borderWarningThresholdKm: 30 },
  { id: 'PY', name: 'Puducherry', lat: 11.9416, lng: 79.8083, maxRadiusKm: 60, borderWarningThresholdKm: 40 },
];

const DISTRICTS: Record<string, DistrictLocation[]> = {
  AP: [
    { id: 'AP_VSKP', stateId: 'AP', name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    { id: 'AP_NTR', stateId: 'AP', name: 'Vijayawada (NTR)', lat: 16.5062, lng: 80.6480 },
    { id: 'AP_GNT', stateId: 'AP', name: 'Guntur', lat: 16.3067, lng: 80.4365 },
    { id: 'AP_TPT', stateId: 'AP', name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
    { id: 'AP_KRN', stateId: 'AP', name: 'Kurnool', lat: 15.8281, lng: 78.0373 },
    { id: 'AP_KKD', stateId: 'AP', name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  ],
  AR: [
    { id: 'AR_PPR', stateId: 'AR', name: 'Itanagar (Papum Pare)', lat: 27.0844, lng: 93.6053 },
    { id: 'AR_TWG', stateId: 'AR', name: 'Tawang', lat: 27.5861, lng: 91.8594 },
    { id: 'AR_PSG', stateId: 'AR', name: 'Pasighat (East Siang)', lat: 28.0664, lng: 95.3262 },
  ],
  AS: [
    { id: 'AS_GHY', stateId: 'AS', name: 'Guwahati (Kamrup Metro)', lat: 26.1445, lng: 91.7362 },
    { id: 'AS_DIB', stateId: 'AS', name: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
    { id: 'AS_SIL', stateId: 'AS', name: 'Silchar (Cachar)', lat: 24.8333, lng: 92.7789 },
    { id: 'AS_JOR', stateId: 'AS', name: 'Jorhat', lat: 26.7509, lng: 94.2037 },
  ],
  BR: [
    { id: 'BR_PAT', stateId: 'BR', name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { id: 'BR_GAY', stateId: 'BR', name: 'Gaya', lat: 24.7914, lng: 85.0002 },
    { id: 'BR_MUZ', stateId: 'BR', name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
    { id: 'BR_BGP', stateId: 'BR', name: 'Bhagalpur', lat: 25.2425, lng: 87.0135 },
    { id: 'BR_PUR', stateId: 'BR', name: 'Purnea', lat: 25.7771, lng: 87.4753 },
  ],
  CG: [
    { id: 'CG_RPR', stateId: 'CG', name: 'Raipur', lat: 21.2514, lng: 81.6296 },
    { id: 'CG_DRG', stateId: 'CG', name: 'Durg-Bhilai', lat: 21.1904, lng: 81.2849 },
    { id: 'CG_BSP', stateId: 'CG', name: 'Bilaspur', lat: 22.0797, lng: 82.1391 },
    { id: 'CG_JGD', stateId: 'CG', name: 'Jagdalpur (Bastar)', lat: 19.0744, lng: 82.0212 },
  ],
  GA: [
    { id: 'GA_NGA', stateId: 'GA', name: 'North Goa (Panaji / Mapusa)', lat: 15.4989, lng: 73.8278 },
    { id: 'GA_SGA', stateId: 'GA', name: 'South Goa (Margao / Vasco)', lat: 15.2736, lng: 73.9581 },
  ],
  GJ: [
    { id: 'GJ_AMD', stateId: 'GJ', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { id: 'GJ_SUR', stateId: 'GJ', name: 'Surat', lat: 21.1702, lng: 72.8311 },
    { id: 'GJ_VAD', stateId: 'GJ', name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
    { id: 'GJ_RAJ', stateId: 'GJ', name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
    { id: 'GJ_ANAND', stateId: 'GJ', name: 'Anand', lat: 22.5645, lng: 72.9289 },
    { id: 'GJ_MEH', stateId: 'GJ', name: 'Mehsana', lat: 23.6000, lng: 72.4000 },
    { id: 'GJ_GND', stateId: 'GJ', name: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
    { id: 'GJ_BHV', stateId: 'GJ', name: 'Bhavnagar', lat: 21.7645, lng: 72.1519 },
    { id: 'GJ_JMN', stateId: 'GJ', name: 'Jamnagar', lat: 22.4707, lng: 70.0577 },
    { id: 'GJ_KTCH', stateId: 'GJ', name: 'Kutch (Bhuj)', lat: 23.2420, lng: 69.6669 },
  ],
  HR: [
    { id: 'HR_GGM', stateId: 'HR', name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
    { id: 'HR_FDB', stateId: 'HR', name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
    { id: 'HR_PNP', stateId: 'HR', name: 'Panipat', lat: 29.3909, lng: 76.9635 },
    { id: 'HR_KRN', stateId: 'HR', name: 'Karnal', lat: 29.6857, lng: 76.9905 },
    { id: 'HR_HSR', stateId: 'HR', name: 'Hisar', lat: 29.1492, lng: 75.7217 },
  ],
  HP: [
    { id: 'HP_SML', stateId: 'HP', name: 'Shimla', lat: 31.1048, lng: 77.1734 },
    { id: 'HP_KNG', stateId: 'HP', name: 'Kangra (Dharamshala)', lat: 32.2190, lng: 76.3234 },
    { id: 'HP_MND', stateId: 'HP', name: 'Mandi', lat: 31.5892, lng: 76.9182 },
    { id: 'HP_SLN', stateId: 'HP', name: 'Solan', lat: 30.9084, lng: 77.0999 },
  ],
  JH: [
    { id: 'JH_RNC', stateId: 'JH', name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { id: 'JH_JSR', stateId: 'JH', name: 'Jamshedpur (East Singhbhum)', lat: 22.8046, lng: 86.2029 },
    { id: 'JH_DHN', stateId: 'JH', name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
    { id: 'JH_BKR', stateId: 'JH', name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
  ],
  KA: [
    { id: 'KA_BLR', stateId: 'KA', name: 'Bengaluru Rural', lat: 13.2257, lng: 77.5750 },
    { id: 'KA_MYS', stateId: 'KA', name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { id: 'KA_HUB', stateId: 'KA', name: 'Dharwad / Hubballi', lat: 15.3647, lng: 75.1240 },
    { id: 'KA_DKN', stateId: 'KA', name: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560 },
    { id: 'KA_BLG', stateId: 'KA', name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { id: 'KA_KLB', stateId: 'KA', name: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
  ],
  KL: [
    { id: 'KL_TVM', stateId: 'KL', name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { id: 'KL_EKM', stateId: 'KL', name: 'Ernakulam (Kochi)', lat: 9.9816, lng: 76.2999 },
    { id: 'KL_CCJ', stateId: 'KL', name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
    { id: 'KL_TCR', stateId: 'KL', name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
    { id: 'KL_PKD', stateId: 'KL', name: 'Palakkad', lat: 10.7867, lng: 76.6548 },
  ],
  MP: [
    { id: 'MP_IND', stateId: 'MP', name: 'Indore Rural', lat: 22.7196, lng: 75.8577 },
    { id: 'MP_BHO', stateId: 'MP', name: 'Bhopal Rural', lat: 23.2599, lng: 77.4126 },
    { id: 'MP_JBP', stateId: 'MP', name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
    { id: 'MP_GWL', stateId: 'MP', name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
    { id: 'MP_UJN', stateId: 'MP', name: 'Ujjain', lat: 23.1765, lng: 75.7885 },
  ],
  MH: [
    { id: 'MH_PUN', stateId: 'MH', name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { id: 'MH_NSK', stateId: 'MH', name: 'Nashik', lat: 20.0059, lng: 73.7898 },
    { id: 'MH_NAG', stateId: 'MH', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { id: 'MH_KOL', stateId: 'MH', name: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
    { id: 'MH_CSN', stateId: 'MH', name: 'Chhatrapati Sambhaji Nagar', lat: 19.8762, lng: 75.3433 },
    { id: 'MH_THN', stateId: 'MH', name: 'Thane / Palghar', lat: 19.2183, lng: 72.9781 },
    { id: 'MH_SLP', stateId: 'MH', name: 'Solapur', lat: 17.6599, lng: 75.9064 },
  ],
  MN: [
    { id: 'MN_IMP', stateId: 'MN', name: 'Imphal West & East', lat: 24.8170, lng: 93.9368 },
    { id: 'MN_CCP', stateId: 'MN', name: 'Churachandpur', lat: 24.3333, lng: 93.6833 },
  ],
  ML: [
    { id: 'ML_SHL', stateId: 'ML', name: 'East Khasi Hills (Shillong)', lat: 25.5788, lng: 91.8933 },
    { id: 'ML_TRA', stateId: 'ML', name: 'West Garo Hills (Tura)', lat: 25.5141, lng: 90.2032 },
  ],
  MZ: [
    { id: 'MZ_AJL', stateId: 'MZ', name: 'Aizawl', lat: 23.7271, lng: 92.7176 },
    { id: 'MZ_LNG', stateId: 'MZ', name: 'Lunglei', lat: 22.8872, lng: 92.7369 },
  ],
  NL: [
    { id: 'NL_DMP', stateId: 'NL', name: 'Dimapur', lat: 25.9060, lng: 93.7272 },
    { id: 'NL_KHM', stateId: 'NL', name: 'Kohima', lat: 25.6751, lng: 94.1086 },
  ],
  OD: [
    { id: 'OD_BBS', stateId: 'OD', name: 'Khordha (Bhubaneswar)', lat: 20.2961, lng: 85.8245 },
    { id: 'OD_CTC', stateId: 'OD', name: 'Cuttack', lat: 20.4625, lng: 85.8828 },
    { id: 'OD_BHM', stateId: 'OD', name: 'Ganjam (Berhampur)', lat: 19.3150, lng: 84.7941 },
    { id: 'OD_RKL', stateId: 'OD', name: 'Sundargarh (Rourkela)', lat: 22.2604, lng: 84.8536 },
  ],
  PB: [
    { id: 'PB_LDH', stateId: 'PB', name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
    { id: 'PB_ASR', stateId: 'PB', name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    { id: 'PB_JAL', stateId: 'PB', name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
    { id: 'PB_PTL', stateId: 'PB', name: 'Patiala', lat: 30.3398, lng: 76.3869 },
    { id: 'PB_BTI', stateId: 'PB', name: 'Bathinda', lat: 30.2110, lng: 74.9455 },
  ],
  RJ: [
    { id: 'RJ_JAI', stateId: 'RJ', name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { id: 'RJ_JOD', stateId: 'RJ', name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
    { id: 'RJ_UDA', stateId: 'RJ', name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
    { id: 'RJ_KTA', stateId: 'RJ', name: 'Kota', lat: 25.2138, lng: 75.8648 },
    { id: 'RJ_AJM', stateId: 'RJ', name: 'Ajmer', lat: 26.4499, lng: 74.6399 },
    { id: 'RJ_BKN', stateId: 'RJ', name: 'Bikaner', lat: 28.0229, lng: 73.3119 },
  ],
  SK: [
    { id: 'SK_GTK', stateId: 'SK', name: 'Gangtok (East Sikkim)', lat: 27.3389, lng: 88.6065 },
    { id: 'SK_NMC', stateId: 'SK', name: 'Namchi (South Sikkim)', lat: 27.1667, lng: 88.3500 },
  ],
  TN: [
    { id: 'TN_CHN', stateId: 'TN', name: 'Chennai / Kanchipuram', lat: 13.0827, lng: 80.2707 },
    { id: 'TN_CBE', stateId: 'TN', name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { id: 'TN_MDU', stateId: 'TN', name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { id: 'TN_SLM', stateId: 'TN', name: 'Salem', lat: 11.6643, lng: 78.1460 },
    { id: 'TN_TRY', stateId: 'TN', name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
    { id: 'TN_TPR', stateId: 'TN', name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  ],
  TG: [
    { id: 'TG_HYD', stateId: 'TG', name: 'Hyderabad / Rangareddy', lat: 17.3850, lng: 78.4867 },
    { id: 'TG_WGL', stateId: 'TG', name: 'Warangal', lat: 17.9689, lng: 79.5941 },
    { id: 'TG_KRM', stateId: 'TG', name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
    { id: 'TG_NZB', stateId: 'TG', name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
  ],
  TR: [
    { id: 'TR_AGT', stateId: 'TR', name: 'West Tripura (Agartala)', lat: 23.8315, lng: 91.2868 },
    { id: 'TR_UDP', stateId: 'TR', name: 'Gomati (Udaipur)', lat: 23.5333, lng: 91.4833 },
  ],
  UP: [
    { id: 'UP_LKO', stateId: 'UP', name: 'Lucknow Rural', lat: 26.8467, lng: 80.9462 },
    { id: 'UP_VNS', stateId: 'UP', name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { id: 'UP_KAN', stateId: 'UP', name: 'Kanpur Dehat', lat: 26.4499, lng: 80.3319 },
    { id: 'UP_AGR', stateId: 'UP', name: 'Agra', lat: 27.1767, lng: 78.0081 },
    { id: 'UP_PRG', stateId: 'UP', name: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463 },
    { id: 'UP_NOI', stateId: 'UP', name: 'Gautam Buddha Nagar (Noida)', lat: 28.5355, lng: 77.3910 },
    { id: 'UP_GKP', stateId: 'UP', name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
    { id: 'UP_MRT', stateId: 'UP', name: 'Meerut', lat: 28.9845, lng: 77.7064 },
  ],
  UK: [
    { id: 'UK_DDN', stateId: 'UK', name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
    { id: 'UK_HDW', stateId: 'UK', name: 'Haridwar', lat: 29.9457, lng: 78.1642 },
    { id: 'UK_RDP', stateId: 'UK', name: 'Udham Singh Nagar (Rudrapur)', lat: 28.9800, lng: 79.4000 },
    { id: 'UK_HLD', stateId: 'UK', name: 'Nainital (Haldwani)', lat: 29.2183, lng: 79.5130 },
  ],
  WB: [
    { id: 'WB_KOL', stateId: 'WB', name: 'Kolkata / South 24 Parganas', lat: 22.5726, lng: 88.3639 },
    { id: 'WB_HWH', stateId: 'WB', name: 'Howrah', lat: 22.5958, lng: 88.2636 },
    { id: 'WB_DGP', stateId: 'WB', name: 'Paschim Bardhaman (Durgapur)', lat: 23.5204, lng: 87.3119 },
    { id: 'WB_SLG', stateId: 'WB', name: 'Darjeeling (Siliguri)', lat: 26.7271, lng: 88.3953 },
    { id: 'WB_MSD', stateId: 'WB', name: 'Murshidabad', lat: 24.1750, lng: 88.2800 },
  ],

  // Union Territories
  AN: [
    { id: 'AN_PBL', stateId: 'AN', name: 'South Andaman (Port Blair)', lat: 11.6234, lng: 92.7265 },
  ],
  CH: [
    { id: 'CH_CHD', stateId: 'CH', name: 'Chandigarh City & Peri-Urban', lat: 30.7333, lng: 76.7794 },
  ],
  DN: [
    { id: 'DN_DMN', stateId: 'DN', name: 'Daman & Silvassa Belt', lat: 20.4283, lng: 72.8397 },
  ],
  DL: [
    { id: 'DL_NW', stateId: 'DL', name: 'North West & West Rural Delhi', lat: 28.7041, lng: 77.1025 },
    { id: 'DL_SW', stateId: 'DL', name: 'South West & Najafgarh Belt', lat: 28.6090, lng: 76.9855 },
  ],
  JK: [
    { id: 'JK_SGR', stateId: 'JK', name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
    { id: 'JK_JMU', stateId: 'JK', name: 'Jammu', lat: 32.7266, lng: 74.8570 },
    { id: 'JK_ANT', stateId: 'JK', name: 'Anantnag', lat: 33.7311, lng: 75.1487 },
  ],
  LA: [
    { id: 'LA_LEH', stateId: 'LA', name: 'Leh District', lat: 34.1526, lng: 77.5771 },
    { id: 'LA_KGL', stateId: 'LA', name: 'Kargil District', lat: 34.5539, lng: 76.1349 },
  ],
  LD: [
    { id: 'LD_KVR', stateId: 'LD', name: 'Kavaratti & Agatti Islands', lat: 10.5667, lng: 72.6417 },
  ],
  PY: [
    { id: 'PY_PDY', stateId: 'PY', name: 'Puducherry & Karaikal Region', lat: 11.9416, lng: 79.8083 },
  ],
};

const AREAS: Record<string, AreaLocation[]> = {
  GJ_AMD: [
    { id: 'GJ_AMD_SANAND', districtId: 'GJ_AMD', name: 'Sanand Rural', lat: 22.9902, lng: 72.3812 },
    { id: 'GJ_AMD_CHANGODAR', districtId: 'GJ_AMD', name: 'Changodar Industrial Zone', lat: 22.9234, lng: 72.4412 },
    { id: 'GJ_AMD_BAVLA', districtId: 'GJ_AMD', name: 'Bavla Agri Cluster', lat: 22.8361, lng: 72.3619 },
    { id: 'GJ_AMD_DHALKA', districtId: 'GJ_AMD', name: 'Dholka Town & Peri-Urban', lat: 22.7214, lng: 72.4632 },
  ],
  GJ_SUR: [
    { id: 'GJ_SUR_KAMDREJ', districtId: 'GJ_SUR', name: 'Kamrej Rural Hub', lat: 21.2678, lng: 72.9612 },
    { id: 'GJ_SUR_BARDOLI', districtId: 'GJ_SUR', name: 'Bardoli Sugar Belt', lat: 21.1214, lng: 73.1124 },
  ],
  GJ_VAD: [
    { id: 'GJ_VAD_PADRA', districtId: 'GJ_VAD', name: 'Padra Food Processing Hub', lat: 22.2412, lng: 73.0812 },
    { id: 'GJ_VAD_SAVLI', districtId: 'GJ_VAD', name: 'Savli GIDC Extension', lat: 22.5612, lng: 73.2212 },
  ],
  GJ_RAJ: [
    { id: 'GJ_RAJ_GONDAL', districtId: 'GJ_RAJ', name: 'Gondal Market Yard', lat: 21.9612, lng: 70.7912 },
    { id: 'GJ_RAJ_MORBI', districtId: 'GJ_RAJ', name: 'Morbi Rural Peripheral', lat: 22.8112, lng: 70.8312 },
  ],
  GJ_ANAND: [
    { id: 'GJ_ANAND_PETLAD', districtId: 'GJ_ANAND', name: 'Petlad Dairy & Farming Zone', lat: 22.4744, lng: 72.8012 },
    { id: 'GJ_ANAND_UMRETH', districtId: 'GJ_ANAND', name: 'Umreth Cooperative Belt', lat: 22.6988, lng: 73.1124 },
  ],
  GJ_MEH: [
    { id: 'GJ_MEH_KADI', districtId: 'GJ_MEH', name: 'Kadi Cotton & Cottonseed Cluster', lat: 23.3012, lng: 72.3312 },
  ],
  MH_PUN: [
    { id: 'MH_PUN_SHIRUR', districtId: 'MH_PUN', name: 'Shirur Agri & Processing Zone', lat: 18.8212, lng: 74.3712 },
    { id: 'MH_PUN_BARAMATI', districtId: 'MH_PUN', name: 'Baramati High-Tech Dairy', lat: 18.1512, lng: 74.5812 },
  ],
  MH_NSK: [
    { id: 'MH_NSK_NIPHAD', districtId: 'MH_NSK', name: 'Niphad Grape & Horticulture', lat: 20.0812, lng: 74.1124 },
  ],
  MH_NAG: [
    { id: 'MH_NAG_KALMESHWAR', districtId: 'MH_NAG', name: 'Kalmeshwar Agro Processing', lat: 21.2312, lng: 78.9112 },
  ],
  MH_KOL: [
    { id: 'MH_KOL_SHIROLI', districtId: 'MH_KOL', name: 'Shiroli Foundry & Dairy Cluster', lat: 16.7412, lng: 74.2712 },
  ],
  RJ_JAI: [
    { id: 'RJ_JAI_CHOMU', districtId: 'RJ_JAI', name: 'Chomu Vegetable & Agri Mandi', lat: 27.1712, lng: 75.7212 },
    { id: 'RJ_JAI_BAGRU', districtId: 'RJ_JAI', name: 'Bagru Textile & Handicraft Zone', lat: 26.8112, lng: 75.5412 },
  ],
  RJ_JOD: [
    { id: 'RJ_JOD_LUNI', districtId: 'RJ_JOD', name: 'Luni Handicraft & Processing', lat: 26.0912, lng: 73.0112 },
  ],
  RJ_UDA: [
    { id: 'RJ_UDA_MAVLI', districtId: 'RJ_UDA', name: 'Mavli Agri Dairy Belt', lat: 24.7812, lng: 73.9812 },
  ],
  KA_BLR: [
    { id: 'KA_BLR_DODDABALLAPUR', districtId: 'KA_BLR', name: 'Doddaballapur Agri-Infra', lat: 13.2912, lng: 77.5412 },
    { id: 'KA_BLR_HOSKOTE', districtId: 'KA_BLR', name: 'Hoskote Logistics & Processing', lat: 13.0712, lng: 77.7912 },
  ],
  KA_MYS: [
    { id: 'KA_MYS_HUNSUR', districtId: 'KA_MYS', name: 'Hunsur Tobacco & Timber Zone', lat: 12.3112, lng: 76.2912 },
  ],
  KA_HUB: [
    { id: 'KA_HUB_NAVALGUND', districtId: 'KA_HUB', name: 'Navalgund Weaving & Pulse Belt', lat: 15.5612, lng: 75.3712 },
  ],
  TN_CBE: [
    { id: 'TN_CBE_POLLACHI', districtId: 'TN_CBE', name: 'Pollachi Coconut & Dairy Belt', lat: 10.6612, lng: 77.0112 },
    { id: 'TN_CBE_ANNUR', districtId: 'TN_CBE', name: 'Annur Textile & Poultry Zone', lat: 11.2312, lng: 77.1124 },
  ],
  TN_MDU: [
    { id: 'TN_MDU_MELUR', districtId: 'TN_MDU', name: 'Melur Paddy & Agri Mandi', lat: 10.0412, lng: 78.3312 },
  ],
  TN_SLM: [
    { id: 'TN_SLM_ATTUR', districtId: 'TN_SLM', name: 'Attur Tapioca & Sago Belt', lat: 11.5912, lng: 78.6012 },
  ],
  UP_LKO: [
    { id: 'UP_LKO_MALIHABAD', districtId: 'UP_LKO', name: 'Malihabad Mango & Horticulture', lat: 26.9212, lng: 80.7112 },
    { id: 'UP_LKO_MOHANLALGANJ', districtId: 'UP_LKO', name: 'Mohanlalganj Dairy Belt', lat: 26.6812, lng: 80.9812 },
  ],
  UP_VNS: [
    { id: 'UP_VNS_PINDRA', districtId: 'UP_VNS', name: 'Pindra Handloom & Agro Cluster', lat: 25.4812, lng: 82.8412 },
  ],
  UP_KAN: [
    { id: 'UP_KAN_AKBARPUR', districtId: 'UP_KAN', name: 'Akbarpur Pulse & Oilseed Belt', lat: 26.4312, lng: 79.9512 },
  ],
  PB_LDH: [
    { id: 'PB_LDH_KHANNA', districtId: 'PB_LDH', name: 'Khanna Asia Largest Grain Mandi', lat: 30.7012, lng: 76.2112 },
    { id: 'PB_LDH_SAMRALA', districtId: 'PB_LDH', name: 'Samrala Dairy & Cattle Feed', lat: 30.8412, lng: 76.1912 },
  ],
  PB_ASR: [
    { id: 'PB_ASR_JANDIALA', districtId: 'PB_ASR', name: 'Jandiala Crafts & Basmati Zone', lat: 31.5612, lng: 75.0212 },
  ],
  MP_IND: [
    { id: 'MP_IND_SANWER', districtId: 'MP_IND', name: 'Sanwer Soybean & Wheat Belt', lat: 22.9712, lng: 75.8312 },
    { id: 'MP_IND_DEPALPUR', districtId: 'MP_IND', name: 'Depalpur Dairy & Organic Hub', lat: 22.8512, lng: 75.5412 },
  ],
  MP_BHO: [
    { id: 'MP_BHO_BERASIA', districtId: 'MP_BHO', name: 'Berasia Grain & Spice Belt', lat: 23.6312, lng: 77.4312 },
  ]
};

// BUSINESS CATEGORIES WITH SUBTYPES
const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'agriculture', name: 'Agriculture', subTypes: ['Crop Farming', 'Organic Farming', 'Horticulture', 'Greenhouse Cultivation', 'Agri Inputs Store'] },
  { id: 'dairy', name: 'Dairy Farming', subTypes: ['Dairy Farm', 'Milk Collection Center', 'Dairy Processing', 'Cattle Feed Unit'] },
  { id: 'poultry', name: 'Poultry', subTypes: ['Layer Farming', 'Broiler Farm', 'Hatchery Unit', 'Poultry Feed Processing'] },
  { id: 'fisheries', name: 'Fisheries', subTypes: ['Freshwater Aquaculture', 'Biofloc Fish Farming', 'Fish Feed Mill', 'Cold Storage & Fish Supply'] },
  { id: 'goat_farming', name: 'Goat Farming', subTypes: ['Commercial Goat Breeding', 'Stall-Fed Goat Unit', 'Meat Processing & Supply'] },
  { id: 'food_processing', name: 'Food Processing', subTypes: ['Flour Mill (Chakki)', 'Oil Extraction Unit', 'Spices Processing', 'Fruit & Vegetable Drying', 'Bakery Unit'] },
  { id: 'retail', name: 'Grocery / Retail', subTypes: ['Rural Supermarket', 'Agri Machinery Retail', 'General Store', 'Hardware & Fertilizer'] },
  { id: 'manufacturing', name: 'Manufacturing', subTypes: ['Paper Bag & Packaging', 'Clay Pottery & Tiles', 'Small Machinery Fabrication', 'Bio-Fertilizer Unit'] },
  { id: 'transportation', name: 'Transportation', subTypes: ['Rural Agri Freight Logistics', 'Cold Chain Van Supply', 'Passenger Auto/Mini-Bus Service'] },
  { id: 'hospitality', name: 'Hospitality', subTypes: ['Agri-Tourism Resort', 'Highway Dhaba & Eatery', 'Rural Homestay'] },
  { id: 'services', name: 'Services', subTypes: ['Solar Installation & Repair', 'Tractor Repair & Rental', 'Digital Citizen Service Center (CSC)', 'Cold Storage Rental'] },
  { id: 'handicrafts', name: 'Handicrafts', subTypes: ['Textile Handloom Unit', 'Leather Crafts Unit', 'Wooden Artifacts & Toys', 'Jute Product Crafting'] },
  { id: 'other', name: 'Other', subTypes: ['Custom Micro-Enterprise'] },
];

export const geoService = {
  getStates(): StateLocation[] {
    return STATES;
  },

  getDistricts(stateId: string): DistrictLocation[] {
    if (DISTRICTS[stateId] && DISTRICTS[stateId].length > 0) {
      return DISTRICTS[stateId];
    }
    const state = STATES.find((s) => s.id === stateId);
    if (!state) return [];

    // Dynamic generator fallback for any state without explicit custom entries
    return [
      { id: `${stateId}_CENTRAL`, stateId, name: `${state.name} Central / Headquarter District`, lat: state.lat, lng: state.lng },
      { id: `${stateId}_NORTH`, stateId, name: `${state.name} North Agricultural District`, lat: state.lat + 0.35, lng: state.lng - 0.25 },
      { id: `${stateId}_SOUTH`, stateId, name: `${state.name} South Industrial District`, lat: state.lat - 0.35, lng: state.lng + 0.25 },
      { id: `${stateId}_EAST`, stateId, name: `${state.name} East Rural Cluster`, lat: state.lat + 0.15, lng: state.lng + 0.4 },
      { id: `${stateId}_WEST`, stateId, name: `${state.name} West Commercial Hub`, lat: state.lat - 0.2, lng: state.lng - 0.45 },
    ];
  },

  getAreas(districtId: string): AreaLocation[] {
    if (AREAS[districtId] && AREAS[districtId].length > 0) {
      return AREAS[districtId];
    }
    
    // Search district in DISTRICTS
    let targetDistrict: DistrictLocation | undefined;
    for (const dList of Object.values(DISTRICTS)) {
      const found = dList.find((d) => d.id === districtId);
      if (found) {
        targetDistrict = found;
        break;
      }
    }

    const distLat = targetDistrict ? targetDistrict.lat : 23.0225;
    const distLng = targetDistrict ? targetDistrict.lng : 72.5714;
    const distName = targetDistrict ? targetDistrict.name : 'Target District';

    // Dynamic generator fallback for any district without explicit custom entries
    return [
      { id: `${districtId}_AGRI_BELT`, districtId, name: `${distName} Agri & Dairy Zone`, lat: distLat + 0.03, lng: distLng - 0.04 },
      { id: `${districtId}_IND_HUB`, districtId, name: `${distName} Industrial & Logistics Hub`, lat: distLat - 0.04, lng: distLng + 0.05 },
      { id: `${districtId}_PERI_URBAN`, districtId, name: `${distName} Peri-Urban Commercial Belt`, lat: distLat + 0.02, lng: distLng + 0.03 },
      { id: `${districtId}_RURAL_CLUSTER`, districtId, name: `${distName} Rural Micro-Enterprise Cluster`, lat: distLat - 0.05, lng: distLng - 0.03 },
    ];
  },

  getBusinessCategories(): BusinessCategory[] {
    return BUSINESS_CATEGORIES;
  },

  async searchLocations(params: GeoSearchParams): Promise<CandidateLocation[]> {
    // Simulate real geospatial scoring & server lookup
    await new Promise((res) => setTimeout(res, 400));

    const state = STATES.find((s) => s.id === params.stateId);
    const districts = DISTRICTS[params.stateId] || [];
    const district = districts.find((d) => d.id === params.districtId);
    const areas = AREAS[params.districtId] || [];
    const area = areas.find((a) => a.id === params.areaId);

    const centerLat = area ? area.lat : district ? district.lat : state ? state.lat : 23.0225;
    const centerLng = area ? area.lng : district ? district.lng : state ? state.lng : 72.5714;
    const baseStateName = state ? state.name : 'Gujarat';
    const baseDistrictName = district ? district.name : 'Ahmedabad';
    const baseAreaName = area ? area.name : 'Sanand Rural';

    // Candidate Location generator based on inputs
    const candidates: CandidateLocation[] = [
      {
        id: 'loc_1',
        name: `${baseAreaName} Primary Corridor`,
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: centerLat + 0.015,
        lng: centerLng + 0.022,
        distanceKm: Math.round(params.radiusKm * 0.25 * 10) / 10,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          {
            marketDemand: 92,
            competition: 84,
            accessibility: 95,
            customerDensity: 88,
            infrastructure: 86,
            investmentFit: 92,
            growthPotential: 90,
          },
          params.businessCategory,
          params.investmentRange
        ),
        population: '48,500 residents',
        customerBaseEst: '14,200 active households',
        demandIndicator: 'Very High',
        marketSize: '₹4.8 Crore / year',
        nearbyMarkets: [`${baseDistrictName} Main APMC Mandi (6 km)`, 'Highway Junction Market (2 km)'],
        marketConfidence: 'High',
        competitorCount: 3,
        competitionDensity: 'Low',
        nearestCompetitorDistance: '4.2 km away',
        competitorConcentration: 'Low - High market gap',
        nearestMajorRoad: 'SH-17 Highway',
        distanceToHighway: '0.8 km',
        nearestTransportHub: `${baseDistrictName} Central Bus Depot (8 km)`,
        nearestRailwayStation: `${baseDistrictName} Junction (12 km)`,
        nearestBusStation: `${baseAreaName} Crossroad Terminal (1.2 km)`,
        electricityAvailability: '22 hrs / day (3-Phase Industrial)',
        waterAvailability: 'Borewell & Canal Pipeline (High)',
        roadQuality: 'Paved 2-Lane Asphalt Road',
        internetConnectivity: '4G Fiber Broadband Available',
        healthcareAccess: 'Community Health Center (3.5 km)',
        bankingAccess: 'SBI Branch & 2 ATMs (1.5 km)',
        infrastructureDataStatus: 'Verified',
        estimatedAnnualRevenue: '₹22.5 Lakh',
        estimatedAnnualCost: '₹13.8 Lakh',
        estimatedAnnualProfit: '₹8.7 Lakh',
        estimatedBreakevenMonths: '16 months',
        financialConfidence: 'High',
        financialDataQuality: 'Modelled',
        businessCategory: params.businessCategory,
        subType: params.subType || 'General Unit',
        investmentRange: params.investmentRange,
        investmentFitScore: 92,
        demandFitScore: 92,
        competitionFitScore: 84,
        infrastructureFitScore: 86,
        overallFitScore: 89,
        establishedYear: 2018,
        yearsOperating: 8,
      },
      {
        id: 'loc_2',
        name: `${baseAreaName} East Extension`,
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: centerLat - 0.028,
        lng: centerLng + 0.045,
        distanceKm: Math.round(params.radiusKm * 0.5 * 10) / 10,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          {
            marketDemand: 85,
            competition: 76,
            accessibility: 88,
            customerDensity: 82,
            infrastructure: 79,
            investmentFit: 86,
            growthPotential: 84,
          },
          params.businessCategory,
          params.investmentRange
        ),
        population: '32,100 residents',
        customerBaseEst: '9,800 households',
        demandIndicator: 'High',
        marketSize: '₹3.2 Crore / year',
        nearbyMarkets: [`${baseAreaName} Local Bazaar (1.8 km)`],
        marketConfidence: 'High',
        competitorCount: 6,
        competitionDensity: 'Medium',
        nearestCompetitorDistance: '1.9 km away',
        competitorConcentration: 'Moderate',
        nearestMajorRoad: 'District Major Road 4',
        distanceToHighway: '3.5 km',
        nearestTransportHub: `${baseDistrictName} Bus Terminal (11 km)`,
        nearestRailwayStation: `${baseDistrictName} Junction (15 km)`,
        nearestBusStation: 'Village Stand (0.4 km)',
        electricityAvailability: '20 hrs / day (Standard Commercial)',
        waterAvailability: 'Groundwater Well Supply',
        roadQuality: 'Single-Lane Tar Road',
        internetConnectivity: '4G Cellular Data',
        healthcareAccess: 'Primary Health Center (5 km)',
        bankingAccess: 'Cooperative Bank & ATM (2 km)',
        infrastructureDataStatus: 'Estimated',
        estimatedAnnualRevenue: '₹17.2 Lakh',
        estimatedAnnualCost: '₹10.9 Lakh',
        estimatedAnnualProfit: '₹6.3 Lakh',
        estimatedBreakevenMonths: '20 months',
        financialConfidence: 'Medium',
        financialDataQuality: 'Modelled',
        businessCategory: params.businessCategory,
        subType: params.subType || 'General Unit',
        investmentRange: params.investmentRange,
        investmentFitScore: 86,
        demandFitScore: 85,
        competitionFitScore: 76,
        infrastructureFitScore: 79,
        overallFitScore: 82,
      },
      {
        id: 'loc_3',
        name: `${baseDistrictName} Outer Bypass Node`,
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: centerLat + 0.052,
        lng: centerLng - 0.038,
        distanceKm: Math.round(params.radiusKm * 0.75 * 10) / 10,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          {
            marketDemand: 74,
            competition: 68,
            accessibility: 82,
            customerDensity: 70,
            infrastructure: 72,
            investmentFit: 78,
            growthPotential: 89,
          },
          params.businessCategory,
          params.investmentRange
        ),
        population: '21,500 residents',
        customerBaseEst: '6,400 households',
        demandIndicator: 'Moderate',
        marketSize: '₹2.1 Crore / year',
        nearbyMarkets: ['Bypass Trade Center (0.5 km)'],
        marketConfidence: 'Medium',
        competitorCount: 9,
        competitionDensity: 'High',
        nearestCompetitorDistance: '0.9 km away',
        competitorConcentration: 'Dense around bypass',
        nearestMajorRoad: 'National Highway NH-48',
        distanceToHighway: '0.2 km',
        nearestTransportHub: 'Interstate Freight Hub (4 km)',
        nearestRailwayStation: `${baseDistrictName} Junction (18 km)`,
        nearestBusStation: 'Highway Stop (0.3 km)',
        electricityAvailability: '24 hrs / day (Industrial Feeder)',
        waterAvailability: 'Municipal Connection',
        roadQuality: '4-Lane Expressway Slip Road',
        internetConnectivity: 'High-Speed Fiber Optical',
        healthcareAccess: 'District Hospital (12 km)',
        bankingAccess: 'Nationalized Bank Branch (3 km)',
        infrastructureDataStatus: 'Verified',
        estimatedAnnualRevenue: '₹14.8 Lakh',
        estimatedAnnualCost: '₹9.8 Lakh',
        estimatedAnnualProfit: '₹5.0 Lakh',
        estimatedBreakevenMonths: '24 months',
        financialConfidence: 'Medium',
        financialDataQuality: 'Modelled',
        businessCategory: params.businessCategory,
        subType: params.subType || 'General Unit',
        investmentRange: params.investmentRange,
        investmentFitScore: 78,
        demandFitScore: 74,
        competitionFitScore: 68,
        infrastructureFitScore: 72,
        overallFitScore: 75,
      },
      {
        id: 'loc_4',
        name: `${baseAreaName} Rural Peripheral`,
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: centerLat - 0.065,
        lng: centerLng - 0.055,
        distanceKm: Math.round(params.radiusKm * 0.9 * 10) / 10,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          {
            marketDemand: 58,
            competition: 82,
            accessibility: 52,
            customerDensity: 48,
            infrastructure: 50,
            investmentFit: 64,
            growthPotential: 62,
          },
          params.businessCategory,
          params.investmentRange
        ),
        population: '9,400 residents',
        customerBaseEst: '2,600 households',
        demandIndicator: 'Emerging',
        marketSize: '₹0.9 Crore / year',
        nearbyMarkets: ['Weekly Village Haat (4 km)'],
        marketConfidence: 'Low',
        competitorCount: 1,
        competitionDensity: 'Low',
        nearestCompetitorDistance: '8.5 km away',
        competitorConcentration: 'Very Low',
        nearestMajorRoad: 'Village Panchayat Road',
        distanceToHighway: '14.2 km',
        nearestTransportHub: 'Taluka Bus Stand (16 km)',
        nearestRailwayStation: 'Branch Station (22 km)',
        nearestBusStation: 'Gram Panchayat Stop (1.5 km)',
        electricityAvailability: '16 hrs / day (Agricultural Grid)',
        waterAvailability: 'Seasonal Borewell',
        roadQuality: 'Unpaved / Gravel Road',
        internetConnectivity: '3G / Limited 4G Signal',
        healthcareAccess: 'Sub-Center Clinic (7 km)',
        bankingAccess: 'Data unavailable',
        infrastructureDataStatus: 'Unavailable',
        estimatedAnnualRevenue: '₹9.2 Lakh',
        estimatedAnnualCost: '₹6.8 Lakh',
        estimatedAnnualProfit: '₹2.4 Lakh',
        estimatedBreakevenMonths: '32 months',
        financialConfidence: 'Low',
        financialDataQuality: 'Estimated',
        businessCategory: params.businessCategory,
        subType: params.subType || 'General Unit',
        investmentRange: params.investmentRange,
        investmentFitScore: 64,
        demandFitScore: 58,
        competitionFitScore: 82,
        infrastructureFitScore: 50,
        overallFitScore: 57,
      },
    ];

    // Include cross-state location if user turned ON neighboring state search
    if (params.includeNeighboringStates) {
      candidates.push({
        id: 'loc_cross_state',
        name: `Inter-State Border Hub (Neighboring State)`,
        areaName: 'Border District Sector',
        districtName: 'Border Region',
        stateName: 'Neighboring State Zone',
        lat: centerLat + 0.088,
        lng: centerLng + 0.092,
        distanceKm: Math.round(params.radiusKm * 1.1 * 10) / 10,
        isOutsideState: true,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          {
            marketDemand: 82,
            competition: 78,
            accessibility: 89,
            customerDensity: 80,
            infrastructure: 84,
            investmentFit: 85,
            growthPotential: 86,
          },
          params.businessCategory,
          params.investmentRange
        ),
        population: '38,000 residents',
        customerBaseEst: '11,000 households',
        demandIndicator: 'High',
        marketSize: '₹3.9 Crore / year',
        nearbyMarkets: ['Border Trade Checkpost Mandi (1 km)'],
        marketConfidence: 'Medium',
        competitorCount: 4,
        competitionDensity: 'Low',
        nearestCompetitorDistance: '3.8 km away',
        competitorConcentration: 'Cross-state trade route',
        nearestMajorRoad: 'Interstate Highway 56',
        distanceToHighway: '0.1 km',
        nearestTransportHub: 'Border Logistics Yard (2 km)',
        nearestRailwayStation: 'Border Junction (9 km)',
        nearestBusStation: 'Interstate Stand (0.8 km)',
        electricityAvailability: '22 hrs / day',
        waterAvailability: 'Riverbed Canal',
        roadQuality: 'Heavy Duty Freight Corridor',
        internetConnectivity: '4G Broadband',
        healthcareAccess: 'District Hospital (8 km)',
        bankingAccess: '2 Commercial Banks & 3 ATMs (1 km)',
        infrastructureDataStatus: 'Verified',
        estimatedAnnualRevenue: '₹19.8 Lakh',
        estimatedAnnualCost: '₹12.1 Lakh',
        estimatedAnnualProfit: '₹7.7 Lakh',
        estimatedBreakevenMonths: '18 months',
        financialConfidence: 'Medium',
        financialDataQuality: 'Modelled',
        businessCategory: params.businessCategory,
        subType: params.subType || 'General Unit',
        investmentRange: params.investmentRange,
        investmentFitScore: 85,
        demandFitScore: 82,
        competitionFitScore: 78,
        infrastructureFitScore: 84,
        overallFitScore: 83,
      });
    }

    return candidates;
  },

  async getLayersData(centerLat: number, centerLng: number): Promise<LayerFeature[]> {
    return [
      { id: 'f1', type: 'competitor', name: 'Competing Milk Chilling Plant', lat: centerLat + 0.012, lng: centerLng + 0.018, details: 'Competitor - Dairy' },
      { id: 'f2', type: 'competitor', name: 'Local Agri Input Shop', lat: centerLat - 0.015, lng: centerLng + 0.022, details: 'Competitor - Agri' },
      { id: 'f3', type: 'transport', name: 'Inter-Taluka Bus Depot', lat: centerLat + 0.025, lng: centerLng - 0.010, details: 'Transport Hub' },
      { id: 'f4', type: 'market', name: 'Weekly Rural APMC Mandi', lat: centerLat - 0.008, lng: centerLng - 0.025, details: 'Agricultural Market' },
      { id: 'f5', type: 'bank', name: 'State Bank of India & Micro-ATM', lat: centerLat + 0.005, lng: centerLng + 0.008, details: 'Financial Access' },
      { id: 'f6', type: 'hospital', name: 'Taluka Primary Health Center', lat: centerLat - 0.020, lng: centerLng - 0.015, details: 'Healthcare Facility' },
      { id: 'f7', type: 'industrial', name: 'GIDC Agro-Processing Cluster', lat: centerLat + 0.032, lng: centerLng + 0.035, details: 'Industrial Park' },
      { id: 'f8', type: 'agricultural', name: 'Organic Farming Cooperative Field', lat: centerLat - 0.035, lng: centerLng + 0.012, details: 'Agri Zone' },
    ];
  },
};
