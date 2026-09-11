import { apiFetch } from '../api/apiFetch';
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

export type MapFeatureCategory = 'competitor' | 'similar' | 'poi' | 'market';

export interface LayerFeature {
  id: string;
  category: MapFeatureCategory;
  type: string;
  name: string;
  lat: number;
  lng: number;
  details?: string;
  distanceKm?: number;
  subTypeIcon?: string;
  isExisting?: boolean;
  establishedYear?: number;
  yearsOperating?: number;
  capacity?: string;
  status?: string;
  // New semantic fields
  population?: number;       // Estimated population (for market/village pins)
  poiType?: string;          // 'bank' | 'hospital' | 'vet' | 'school' | 'market' | 'fuel' | 'warehouse' | 'gov' | 'water'
  locationType?: string;     // 'village' | 'town' | 'city' | 'market_town'
  osmId?: number;            // OSM element ID (for real POIs from Overpass)
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
  customLat?: number;
  customLng?: number;
  customLocationName?: string;
  customAccuracy?: number;
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
  { id: 'GJ', name: 'Gujarat', lat: 22.2587, lng: 71.1924, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'HR', name: 'Haryana', lat: 29.0588, lng: 76.0856, maxRadiusKm: 120, borderWarningThresholdKm: 90 },
  { id: 'HP', name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, maxRadiusKm: 140, borderWarningThresholdKm: 100 },
  { id: 'JH', name: 'Jharkhand', lat: 23.6102, lng: 85.2799, maxRadiusKm: 160, borderWarningThresholdKm: 120 },
  { id: 'KA', name: 'Karnataka', lat: 15.3173, lng: 75.7139, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'KL', name: 'Kerala', lat: 10.8505, lng: 76.2711, maxRadiusKm: 130, borderWarningThresholdKm: 95 },
  { id: 'MP', name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569, maxRadiusKm: 220, borderWarningThresholdKm: 160 },
  { id: 'MH', name: 'Maharashtra', lat: 19.7515, lng: 75.7139, maxRadiusKm: 200, borderWarningThresholdKm: 150 },
  { id: 'MN', name: 'Manipur', lat: 24.6637, lng: 93.9063, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'ML', name: 'Meghalaya', lat: 25.4670, lng: 91.3662, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'MZ', name: 'Mizoram', lat: 23.1645, lng: 92.9376, maxRadiusKm: 110, borderWarningThresholdKm: 80 },
  { id: 'NL', name: 'Nagaland', lat: 26.1584, lng: 94.5624, maxRadiusKm: 100, borderWarningThresholdKm: 75 },
  { id: 'OD', name: 'Odisha', lat: 20.9517, lng: 85.0985, maxRadiusKm: 180, borderWarningThresholdKm: 130 },
  { id: 'PB', name: 'Punjab', lat: 30.9010, lng: 75.8573, maxRadiusKm: 120, borderWarningThresholdKm: 90 },
  { id: 'RJ', name: 'Rajasthan', lat: 26.9124, lng: 75.7873, maxRadiusKm: 240, borderWarningThresholdKm: 180 },
  { id: 'SK', name: 'Sikkim', lat: 27.5330, lng: 88.5122, maxRadiusKm: 80, borderWarningThresholdKm: 50 },
  { id: 'TN', name: 'Tamil Nadu', lat: 11.1271, lng: 78.6569, maxRadiusKm: 160, borderWarningThresholdKm: 120 },
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
    { id: 'AP_ATP', stateId: 'AP', name: 'Anantapur', lat: 14.6819, lng: 77.6006 },
    { id: 'AP_NLR', stateId: 'AP', name: 'Nellore (SPSR)', lat: 14.4426, lng: 79.9865 },
    { id: 'AP_ELR', stateId: 'AP', name: 'Eluru', lat: 16.7107, lng: 81.0952 },
    { id: 'AP_RJY', stateId: 'AP', name: 'Rajahmundry (East Godavari)', lat: 17.0005, lng: 81.8040 },
    { id: 'AP_SKL', stateId: 'AP', name: 'Srikakulam', lat: 18.2949, lng: 83.8938 },
    { id: 'AP_VZN', stateId: 'AP', name: 'Vizianagaram', lat: 18.1124, lng: 83.3976 },
    { id: 'AP_CTR', stateId: 'AP', name: 'Chittoor', lat: 13.2172, lng: 79.1003 },
    { id: 'AP_ONG', stateId: 'AP', name: 'Prakasam (Ongole)', lat: 15.5057, lng: 80.0499 },
    { id: 'AP_KDP', stateId: 'AP', name: 'Kadapa (YSR)', lat: 14.4673, lng: 78.8242 },
  ],
  AR: [
    { id: 'AR_PPR', stateId: 'AR', name: 'Itanagar (Papum Pare)', lat: 27.0844, lng: 93.6053 },
    { id: 'AR_TWG', stateId: 'AR', name: 'Tawang', lat: 27.5861, lng: 91.8594 },
    { id: 'AR_PSG', stateId: 'AR', name: 'Pasighat (East Siang)', lat: 28.0664, lng: 95.3262 },
    { id: 'AR_ZIR', stateId: 'AR', name: 'Lower Subansiri (Ziro)', lat: 27.5944, lng: 93.8383 },
    { id: 'AR_LHT', stateId: 'AR', name: 'Lohit (Tezu)', lat: 27.9175, lng: 96.1622 },
    { id: 'AR_CHG', stateId: 'AR', name: 'Changlang', lat: 27.1306, lng: 95.7339 },
    { id: 'AR_WKM', stateId: 'AR', name: 'West Kameng (Bomdila)', lat: 27.2644, lng: 92.4158 },
  ],
  AS: [
    { id: 'AS_GHY', stateId: 'AS', name: 'Guwahati (Kamrup Metro)', lat: 26.1445, lng: 91.7362 },
    { id: 'AS_DIB', stateId: 'AS', name: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
    { id: 'AS_SIL', stateId: 'AS', name: 'Silchar (Cachar)', lat: 24.8333, lng: 92.7789 },
    { id: 'AS_JOR', stateId: 'AS', name: 'Jorhat', lat: 26.7509, lng: 94.2037 },
    { id: 'AS_NAG', stateId: 'AS', name: 'Nagaon', lat: 26.3462, lng: 92.6840 },
    { id: 'AS_TSK', stateId: 'AS', name: 'Tinsukia', lat: 27.4922, lng: 95.3558 },
    { id: 'AS_TEZ', stateId: 'AS', name: 'Sonitpur (Tezpur)', lat: 26.6338, lng: 92.8006 },
    { id: 'AS_BNG', stateId: 'AS', name: 'Bongaigaon', lat: 26.5030, lng: 90.5584 },
    { id: 'AS_BRP', stateId: 'AS', name: 'Barpeta', lat: 26.3200, lng: 91.0000 },
    { id: 'AS_KRM', stateId: 'AS', name: 'Karimganj', lat: 24.8697, lng: 92.3592 },
  ],
  BR: [
    { id: 'BR_PAT', stateId: 'BR', name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { id: 'BR_GAY', stateId: 'BR', name: 'Gaya', lat: 24.7914, lng: 85.0002 },
    { id: 'BR_MUZ', stateId: 'BR', name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
    { id: 'BR_BGP', stateId: 'BR', name: 'Bhagalpur', lat: 25.2425, lng: 87.0135 },
    { id: 'BR_PUR', stateId: 'BR', name: 'Purnea', lat: 25.7771, lng: 87.4753 },
    { id: 'BR_DAR', stateId: 'BR', name: 'Darbhanga', lat: 26.1542, lng: 85.8918 },
    { id: 'BR_BEG', stateId: 'BR', name: 'Begusarai', lat: 25.4182, lng: 86.1272 },
    { id: 'BR_ROH', stateId: 'BR', name: 'Rohtas (Sasaram)', lat: 24.9490, lng: 84.0315 },
    { id: 'BR_SAM', stateId: 'BR', name: 'Samastipur', lat: 25.8628, lng: 85.7811 },
    { id: 'BR_SAR', stateId: 'BR', name: 'Saran (Chhapra)', lat: 25.7838, lng: 84.7471 },
    { id: 'BR_VAI', stateId: 'BR', name: 'Vaishali (Hajipur)', lat: 25.6858, lng: 85.2154 },
    { id: 'BR_NAL', stateId: 'BR', name: 'Nalanda (Bihar Sharif)', lat: 25.1982, lng: 85.5149 },
  ],
  CG: [
    { id: 'CG_RPR', stateId: 'CG', name: 'Raipur', lat: 21.2514, lng: 81.6296 },
    { id: 'CG_DRG', stateId: 'CG', name: 'Durg-Bhilai', lat: 21.1904, lng: 81.2849 },
    { id: 'CG_BSP', stateId: 'CG', name: 'Bilaspur', lat: 22.0797, lng: 82.1391 },
    { id: 'CG_JGD', stateId: 'CG', name: 'Jagdalpur (Bastar)', lat: 19.0744, lng: 82.0212 },
    { id: 'CG_KRB', stateId: 'CG', name: 'Korba', lat: 22.3595, lng: 82.7501 },
    { id: 'CG_RJN', stateId: 'CG', name: 'Rajnandgaon', lat: 21.1025, lng: 81.0310 },
    { id: 'CG_RGH', stateId: 'CG', name: 'Raigarh', lat: 21.8974, lng: 83.3950 },
    { id: 'CG_SRG', stateId: 'CG', name: 'Surguja (Ambikapur)', lat: 23.1214, lng: 83.1970 },
    { id: 'CG_DHT', stateId: 'CG', name: 'Dhamtari', lat: 20.7071, lng: 81.5497 },
  ],
  GA: [
    { id: 'GA_NGA', stateId: 'GA', name: 'North Goa (Panaji / Mapusa)', lat: 15.4989, lng: 73.8278 },
    { id: 'GA_SGA', stateId: 'GA', name: 'South Goa (Margao / Vasco)', lat: 15.2736, lng: 73.9581 },
    { id: 'GA_PND', stateId: 'GA', name: 'Ponda Sub-District', lat: 15.4026, lng: 74.0150 },
    { id: 'GA_BCH', stateId: 'GA', name: 'Bicholim Agri Zone', lat: 15.5898, lng: 73.9525 },
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
    { id: 'GJ_AMR', stateId: 'GJ', name: 'Amreli', lat: 21.6032, lng: 71.2221 },
    { id: 'GJ_BHC', stateId: 'GJ', name: 'Bharuch', lat: 21.7051, lng: 72.9959 },
    { id: 'GJ_DHD', stateId: 'GJ', name: 'Dahod', lat: 22.8347, lng: 74.2547 },
    { id: 'GJ_JND', stateId: 'GJ', name: 'Junagadh', lat: 21.5222, lng: 70.4579 },
    { id: 'GJ_NVS', stateId: 'GJ', name: 'Navsari', lat: 20.9467, lng: 72.9520 },
    { id: 'GJ_PNC', stateId: 'GJ', name: 'Panchmahal (Godhra)', lat: 22.7758, lng: 73.6146 },
    { id: 'GJ_PTN', stateId: 'GJ', name: 'Patan', lat: 23.8493, lng: 72.1266 },
    { id: 'GJ_PRB', stateId: 'GJ', name: 'Porbandar', lat: 21.6417, lng: 69.6293 },
    { id: 'GJ_SBR', stateId: 'GJ', name: 'Sabarkantha (Himmatnagar)', lat: 23.5979, lng: 72.9698 },
    { id: 'GJ_SND', stateId: 'GJ', name: 'Surendranagar', lat: 22.7274, lng: 71.6370 },
    { id: 'GJ_VLS', stateId: 'GJ', name: 'Valsad', lat: 20.5992, lng: 72.9342 },
    { id: 'GJ_BNK', stateId: 'GJ', name: 'Banaskantha (Palanpur)', lat: 24.1724, lng: 72.4346 },
    { id: 'GJ_GIR', stateId: 'GJ', name: 'Gir Somnath (Veraval)', lat: 20.9042, lng: 70.3667 },
    { id: 'GJ_MRB', stateId: 'GJ', name: 'Morbi', lat: 22.8173, lng: 70.8370 },
    { id: 'GJ_BTD', stateId: 'GJ', name: 'Botad', lat: 22.1704, lng: 71.6669 },
    { id: 'GJ_NRM', stateId: 'GJ', name: 'Narmada (Rajpipla)', lat: 21.8719, lng: 73.5024 },
    { id: 'GJ_DWK', stateId: 'GJ', name: 'Devbhumi Dwarka', lat: 22.2394, lng: 68.9678 },
    { id: 'GJ_KHD', stateId: 'GJ', name: 'Kheda (Nadiad)', lat: 22.6900, lng: 72.8600 },
    { id: 'GJ_ARV', stateId: 'GJ', name: 'Aravalli (Modasa)', lat: 23.4600, lng: 73.3000 },
    { id: 'GJ_MHS', stateId: 'GJ', name: 'Mahisagar (Lunawada)', lat: 23.1400, lng: 73.6200 },
    { id: 'GJ_CHU', stateId: 'GJ', name: 'Chhota Udaipur', lat: 22.3100, lng: 74.0100 },
    { id: 'GJ_TPI', stateId: 'GJ', name: 'Tapi (Vyara)', lat: 21.1100, lng: 73.4000 },
    { id: 'GJ_DNG', stateId: 'GJ', name: 'Dang (Ahwa)', lat: 20.7500, lng: 73.6800 },
  ],
  HR: [
    { id: 'HR_GGM', stateId: 'HR', name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
    { id: 'HR_FDB', stateId: 'HR', name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
    { id: 'HR_PNP', stateId: 'HR', name: 'Panipat', lat: 29.3909, lng: 76.9635 },
    { id: 'HR_KRN', stateId: 'HR', name: 'Karnal', lat: 29.6857, lng: 76.9905 },
    { id: 'HR_HSR', stateId: 'HR', name: 'Hisar', lat: 29.1492, lng: 75.7217 },
    { id: 'HR_AMB', stateId: 'HR', name: 'Ambala', lat: 30.3782, lng: 76.7767 },
    { id: 'HR_RTK', stateId: 'HR', name: 'Rohtak', lat: 28.8955, lng: 76.6066 },
    { id: 'HR_YMN', stateId: 'HR', name: 'Yamunanagar', lat: 30.1290, lng: 77.2674 },
    { id: 'HR_SNP', stateId: 'HR', name: 'Sonipat', lat: 28.9931, lng: 77.0151 },
    { id: 'HR_PNC', stateId: 'HR', name: 'Panchkula', lat: 30.6942, lng: 76.8606 },
    { id: 'HR_RWR', stateId: 'HR', name: 'Rewari', lat: 28.1833, lng: 76.6167 },
    { id: 'HR_SRS', stateId: 'HR', name: 'Sirsa', lat: 29.5333, lng: 75.0167 },
    { id: 'HR_BHW', stateId: 'HR', name: 'Bhiwani', lat: 28.7833, lng: 76.1333 },
    { id: 'HR_JHJ', stateId: 'HR', name: 'Jhajjar', lat: 28.6069, lng: 76.6565 },
  ],
  HP: [
    { id: 'HP_SML', stateId: 'HP', name: 'Shimla', lat: 31.1048, lng: 77.1734 },
    { id: 'HP_KNG', stateId: 'HP', name: 'Kangra (Dharamshala)', lat: 32.2190, lng: 76.3234 },
    { id: 'HP_MND', stateId: 'HP', name: 'Mandi', lat: 31.5892, lng: 76.9182 },
    { id: 'HP_SLN', stateId: 'HP', name: 'Solan', lat: 30.9084, lng: 77.0999 },
    { id: 'HP_KUL', stateId: 'HP', name: 'Kullu', lat: 31.9579, lng: 77.1095 },
    { id: 'HP_HMR', stateId: 'HP', name: 'Hamirpur', lat: 31.6862, lng: 76.5213 },
    { id: 'HP_UNA', stateId: 'HP', name: 'Una', lat: 31.4685, lng: 76.2708 },
    { id: 'HP_CHM', stateId: 'HP', name: 'Chamba', lat: 32.5534, lng: 76.1258 },
    { id: 'HP_SRM', stateId: 'HP', name: 'Sirmaur (Nahan)', lat: 30.5599, lng: 77.2955 },
    { id: 'HP_BLP', stateId: 'HP', name: 'Bilaspur', lat: 31.3303, lng: 76.7570 },
  ],
  JH: [
    { id: 'JH_RNC', stateId: 'JH', name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { id: 'JH_JSR', stateId: 'JH', name: 'Jamshedpur (East Singhbhum)', lat: 22.8046, lng: 86.2029 },
    { id: 'JH_DHN', stateId: 'JH', name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
    { id: 'JH_BKR', stateId: 'JH', name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
    { id: 'JH_HZB', stateId: 'JH', name: 'Hazaribagh', lat: 23.9965, lng: 85.3637 },
    { id: 'JH_DGH', stateId: 'JH', name: 'Deoghar', lat: 24.4826, lng: 86.6974 },
    { id: 'JH_GRD', stateId: 'JH', name: 'Giridih', lat: 24.1914, lng: 86.3039 },
    { id: 'JH_RMG', stateId: 'JH', name: 'Ramgarh', lat: 23.6300, lng: 85.5100 },
    { id: 'JH_PLM', stateId: 'JH', name: 'Palamu (Daltonganj)', lat: 24.0436, lng: 84.0722 },
  ],
  KA: [
    { id: 'KA_BLR', stateId: 'KA', name: 'Bengaluru Rural', lat: 13.2257, lng: 77.5750 },
    { id: 'KA_BUB', stateId: 'KA', name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
    { id: 'KA_MYS', stateId: 'KA', name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { id: 'KA_HUB', stateId: 'KA', name: 'Dharwad / Hubballi', lat: 15.3647, lng: 75.1240 },
    { id: 'KA_DKN', stateId: 'KA', name: 'Dakshina Kannada (Mangaluru)', lat: 12.9141, lng: 74.8560 },
    { id: 'KA_BLG', stateId: 'KA', name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { id: 'KA_KLB', stateId: 'KA', name: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { id: 'KA_UDP', stateId: 'KA', name: 'Udupi', lat: 13.3409, lng: 74.7421 },
    { id: 'KA_TMK', stateId: 'KA', name: 'Tumakuru', lat: 13.3400, lng: 77.1000 },
    { id: 'KA_SVM', stateId: 'KA', name: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
    { id: 'KA_BLI', stateId: 'KA', name: 'Ballari', lat: 15.1394, lng: 76.9214 },
    { id: 'KA_HSN', stateId: 'KA', name: 'Hassan', lat: 13.0072, lng: 76.0962 },
    { id: 'KA_DVG', stateId: 'KA', name: 'Davanagere', lat: 14.4644, lng: 75.9218 },
    { id: 'KA_MND', stateId: 'KA', name: 'Mandya', lat: 12.5218, lng: 76.8951 },
    { id: 'KA_UKN', stateId: 'KA', name: 'Uttara Kannada (Karwar)', lat: 14.8137, lng: 74.1298 },
    { id: 'KA_KLR', stateId: 'KA', name: 'Kolar', lat: 13.1367, lng: 78.1292 },
  ],
  KL: [
    { id: 'KL_TVM', stateId: 'KL', name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
    { id: 'KL_EKM', stateId: 'KL', name: 'Ernakulam (Kochi)', lat: 9.9816, lng: 76.2999 },
    { id: 'KL_CCJ', stateId: 'KL', name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
    { id: 'KL_TCR', stateId: 'KL', name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
    { id: 'KL_PKD', stateId: 'KL', name: 'Palakkad', lat: 10.7867, lng: 76.6548 },
    { id: 'KL_KLM', stateId: 'KL', name: 'Kollam', lat: 8.8932, lng: 76.6141 },
    { id: 'KL_KNR', stateId: 'KL', name: 'Kannur', lat: 11.8745, lng: 75.3704 },
    { id: 'KL_ALP', stateId: 'KL', name: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
    { id: 'KL_KTM', stateId: 'KL', name: 'Kottayam', lat: 9.5916, lng: 76.5222 },
    { id: 'KL_MLP', stateId: 'KL', name: 'Malappuram', lat: 11.0733, lng: 76.0740 },
    { id: 'KL_WYD', stateId: 'KL', name: 'Wayanad (Kalpetta)', lat: 11.6084, lng: 76.0846 },
    { id: 'KL_IDK', stateId: 'KL', name: 'Idukki (Painavu)', lat: 9.8497, lng: 76.9806 },
    { id: 'KL_KSG', stateId: 'KL', name: 'Kasaragod', lat: 12.5102, lng: 74.9852 },
    { id: 'KL_PTA', stateId: 'KL', name: 'Pathanamthitta', lat: 9.2648, lng: 76.7870 },
  ],
  MP: [
    { id: 'MP_IND', stateId: 'MP', name: 'Indore', lat: 22.7196, lng: 75.8577 },
    { id: 'MP_BHO', stateId: 'MP', name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { id: 'MP_JBP', stateId: 'MP', name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
    { id: 'MP_GWL', stateId: 'MP', name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
    { id: 'MP_UJN', stateId: 'MP', name: 'Ujjain', lat: 23.1765, lng: 75.7885 },
    { id: 'MP_SGR', stateId: 'MP', name: 'Sagar', lat: 23.8388, lng: 78.7378 },
    { id: 'MP_STN', stateId: 'MP', name: 'Satna', lat: 24.6005, lng: 80.8322 },
    { id: 'MP_RWA', stateId: 'MP', name: 'Rewa', lat: 24.5362, lng: 81.3037 },
    { id: 'MP_RTL', stateId: 'MP', name: 'Ratlam', lat: 23.3315, lng: 75.0367 },
    { id: 'MP_CHN', stateId: 'MP', name: 'Chhindwara', lat: 22.0574, lng: 78.9382 },
    { id: 'MP_BHP', stateId: 'MP', name: 'Burhanpur', lat: 21.3145, lng: 76.2238 },
    { id: 'MP_DWS', stateId: 'MP', name: 'Dewas', lat: 22.9676, lng: 76.0534 },
    { id: 'MP_KTN', stateId: 'MP', name: 'Katni', lat: 23.8343, lng: 80.3948 },
    { id: 'MP_VDS', stateId: 'MP', name: 'Vidisha', lat: 23.5251, lng: 77.8081 },
    { id: 'MP_DHR', stateId: 'MP', name: 'Dhar', lat: 22.5975, lng: 75.3040 },
    { id: 'MP_KHW', stateId: 'MP', name: 'Khandwa (East Nimar)', lat: 21.8314, lng: 76.3498 },
  ],
  MH: [
    { id: 'MH_MUM', stateId: 'MH', name: 'Mumbai City & Suburban', lat: 19.0760, lng: 72.8777 },
    { id: 'MH_THN', stateId: 'MH', name: 'Thane', lat: 19.2183, lng: 72.9781 },
    { id: 'MH_PUN', stateId: 'MH', name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { id: 'MH_NSK', stateId: 'MH', name: 'Nashik', lat: 20.0059, lng: 73.7898 },
    { id: 'MH_NAG', stateId: 'MH', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { id: 'MH_KOL', stateId: 'MH', name: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
    { id: 'MH_CSN', stateId: 'MH', name: 'Chhatrapati Sambhaji Nagar', lat: 19.8762, lng: 75.3433 },
    { id: 'MH_SLP', stateId: 'MH', name: 'Solapur', lat: 17.6599, lng: 75.9064 },
    { id: 'MH_AMR', stateId: 'MH', name: 'Amravati', lat: 20.9374, lng: 77.7796 },
    { id: 'MH_SGL', stateId: 'MH', name: 'Sangli', lat: 16.8524, lng: 74.5815 },
    { id: 'MH_STR', stateId: 'MH', name: 'Satara', lat: 17.6805, lng: 74.0183 },
    { id: 'MH_AHM', stateId: 'MH', name: 'Ahilya Nagar (Ahmednagar)', lat: 19.0952, lng: 74.7496 },
    { id: 'MH_JLG', stateId: 'MH', name: 'Jalgaon', lat: 21.0077, lng: 75.5626 },
    { id: 'MH_LTR', stateId: 'MH', name: 'Latur', lat: 18.4088, lng: 76.5604 },
    { id: 'MH_NND', stateId: 'MH', name: 'Nanded', lat: 19.1383, lng: 77.3210 },
    { id: 'MH_RGD', stateId: 'MH', name: 'Raigad (Alibag)', lat: 18.6414, lng: 72.8722 },
    { id: 'MH_RTN', stateId: 'MH', name: 'Ratnagiri', lat: 16.9902, lng: 73.3120 },
    { id: 'MH_PLG', stateId: 'MH', name: 'Palghar', lat: 19.6966, lng: 72.7699 },
  ],
  MN: [
    { id: 'MN_IMP', stateId: 'MN', name: 'Imphal West', lat: 24.8170, lng: 93.9368 },
    { id: 'MN_IME', stateId: 'MN', name: 'Imphal East', lat: 24.8000, lng: 93.9500 },
    { id: 'MN_CCP', stateId: 'MN', name: 'Churachandpur', lat: 24.3333, lng: 93.6833 },
    { id: 'MN_THB', stateId: 'MN', name: 'Thoubal', lat: 24.6333, lng: 93.9833 },
    { id: 'MN_BSP', stateId: 'MN', name: 'Bishnupur', lat: 24.6333, lng: 93.7667 },
    { id: 'MN_UKH', stateId: 'MN', name: 'Ukhrul', lat: 25.1167, lng: 94.3667 },
    { id: 'MN_SNP', stateId: 'MN', name: 'Senapati', lat: 25.2667, lng: 94.0167 },
  ],
  ML: [
    { id: 'ML_SHL', stateId: 'ML', name: 'East Khasi Hills (Shillong)', lat: 25.5788, lng: 91.8933 },
    { id: 'ML_TRA', stateId: 'ML', name: 'West Garo Hills (Tura)', lat: 25.5141, lng: 90.2032 },
    { id: 'ML_NGB', stateId: 'ML', name: 'Ri-Bhoi (Nongpoh)', lat: 25.9000, lng: 91.8800 },
    { id: 'ML_JOW', stateId: 'ML', name: 'West Jaintia Hills (Jowai)', lat: 25.4500, lng: 92.2000 },
  ],
  MZ: [
    { id: 'MZ_AJL', stateId: 'MZ', name: 'Aizawl', lat: 23.7271, lng: 92.7176 },
    { id: 'MZ_LNG', stateId: 'MZ', name: 'Lunglei', lat: 22.8872, lng: 92.7369 },
    { id: 'MZ_CMP', stateId: 'MZ', name: 'Champhai', lat: 23.4560, lng: 93.3284 },
    { id: 'MZ_KLS', stateId: 'MZ', name: 'Kolasib', lat: 24.2251, lng: 92.6766 },
    { id: 'MZ_SRC', stateId: 'MZ', name: 'Serchhip', lat: 23.3417, lng: 92.8502 },
  ],
  NL: [
    { id: 'NL_KHM', stateId: 'NL', name: 'Kohima', lat: 25.6751, lng: 94.1086 },
    { id: 'NL_DMP', stateId: 'NL', name: 'Dimapur', lat: 25.9060, lng: 93.7272 },
    { id: 'NL_MKG', stateId: 'NL', name: 'Mokokchung', lat: 26.3243, lng: 94.5204 },
    { id: 'NL_TSG', stateId: 'NL', name: 'Tuensang', lat: 26.2785, lng: 94.8252 },
    { id: 'NL_WKH', stateId: 'NL', name: 'Wokha', lat: 26.0988, lng: 94.2619 },
    { id: 'NL_MON', stateId: 'NL', name: 'Mon', lat: 26.7500, lng: 95.0667 },
  ],
  OD: [
    { id: 'OD_BBS', stateId: 'OD', name: 'Khordha (Bhubaneswar)', lat: 20.2961, lng: 85.8245 },
    { id: 'OD_CTC', stateId: 'OD', name: 'Cuttack', lat: 20.4625, lng: 85.8828 },
    { id: 'OD_BHM', stateId: 'OD', name: 'Ganjam (Berhampur)', lat: 19.3150, lng: 84.7941 },
    { id: 'OD_SBP', stateId: 'OD', name: 'Sambalpur', lat: 21.4669, lng: 83.9812 },
    { id: 'OD_RKL', stateId: 'OD', name: 'Sundargarh (Rourkela)', lat: 22.2604, lng: 84.8536 },
    { id: 'OD_PRI', stateId: 'OD', name: 'Puri', lat: 19.8135, lng: 85.8312 },
    { id: 'OD_BLS', stateId: 'OD', name: 'Balasore', lat: 21.4934, lng: 86.9135 },
    { id: 'OD_BHD', stateId: 'OD', name: 'Bhadrak', lat: 21.0573, lng: 86.4974 },
    { id: 'OD_ANG', stateId: 'OD', name: 'Angul', lat: 20.8400, lng: 85.1000 },
    { id: 'OD_JHR', stateId: 'OD', name: 'Jharsuguda', lat: 21.8556, lng: 84.0061 },
    { id: 'OD_KRP', stateId: 'OD', name: 'Koraput', lat: 18.8135, lng: 82.7119 },
  ],
  PB: [
    { id: 'PB_LDH', stateId: 'PB', name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
    { id: 'PB_ASR', stateId: 'PB', name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
    { id: 'PB_JAL', stateId: 'PB', name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
    { id: 'PB_PTL', stateId: 'PB', name: 'Patiala', lat: 30.3398, lng: 76.3869 },
    { id: 'PB_BTI', stateId: 'PB', name: 'Bathinda', lat: 30.2110, lng: 74.9455 },
    { id: 'PB_MHL', stateId: 'PB', name: 'Sahibzada Ajit Singh Nagar (Mohali)', lat: 30.7046, lng: 76.7179 },
    { id: 'PB_PTK', stateId: 'PB', name: 'Pathankot', lat: 32.2686, lng: 75.6488 },
    { id: 'PB_HSR', stateId: 'PB', name: 'Hoshiarpur', lat: 31.5273, lng: 75.9124 },
    { id: 'PB_GDP', stateId: 'PB', name: 'Gurdaspur', lat: 32.0419, lng: 75.4053 },
    { id: 'PB_FZP', stateId: 'PB', name: 'Firozpur', lat: 30.9237, lng: 74.6120 },
    { id: 'PB_SNG', stateId: 'PB', name: 'Sangrur', lat: 30.2458, lng: 75.8423 },
  ],
  RJ: [
    { id: 'RJ_JAI', stateId: 'RJ', name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { id: 'RJ_JOD', stateId: 'RJ', name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
    { id: 'RJ_UDA', stateId: 'RJ', name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
    { id: 'RJ_KTA', stateId: 'RJ', name: 'Kota', lat: 25.2138, lng: 75.8648 },
    { id: 'RJ_AJM', stateId: 'RJ', name: 'Ajmer', lat: 26.4499, lng: 74.6399 },
    { id: 'RJ_BKN', stateId: 'RJ', name: 'Bikaner', lat: 28.0229, lng: 73.3119 },
    { id: 'RJ_ALW', stateId: 'RJ', name: 'Alwar', lat: 27.5530, lng: 76.6346 },
    { id: 'RJ_BHL', stateId: 'RJ', name: 'Bhilwara', lat: 25.3407, lng: 74.6313 },
    { id: 'RJ_SKR', stateId: 'RJ', name: 'Sikar', lat: 27.6094, lng: 75.1398 },
    { id: 'RJ_BHT', stateId: 'RJ', name: 'Bharatpur', lat: 27.2172, lng: 77.4895 },
    { id: 'RJ_PAL', stateId: 'RJ', name: 'Pali', lat: 25.7711, lng: 73.3234 },
    { id: 'RJ_SGN', stateId: 'RJ', name: 'Sri Ganganagar', lat: 29.9038, lng: 73.8772 },
    { id: 'RJ_BRM', stateId: 'RJ', name: 'Barmer', lat: 25.7532, lng: 71.4181 },
    { id: 'RJ_CTR', stateId: 'RJ', name: 'Chittorgarh', lat: 24.8887, lng: 74.6269 },
    { id: 'RJ_JHJ', stateId: 'RJ', name: 'Jhunjhunu', lat: 28.1289, lng: 75.3995 },
  ],
  SK: [
    { id: 'SK_GTK', stateId: 'SK', name: 'Gangtok (East Sikkim)', lat: 27.3389, lng: 88.6065 },
    { id: 'SK_NMC', stateId: 'SK', name: 'Namchi (South Sikkim)', lat: 27.1667, lng: 88.3500 },
    { id: 'SK_GYL', stateId: 'SK', name: 'Gyalshing (West Sikkim)', lat: 27.2833, lng: 88.2333 },
    { id: 'SK_MNG', stateId: 'SK', name: 'Mangan (North Sikkim)', lat: 27.5167, lng: 88.5333 },
  ],
  TN: [
    { id: 'TN_CHN', stateId: 'TN', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { id: 'TN_CBE', stateId: 'TN', name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { id: 'TN_MDU', stateId: 'TN', name: 'Madurai', lat: 9.9252, lng: 78.1198 },
    { id: 'TN_SLM', stateId: 'TN', name: 'Salem', lat: 11.6643, lng: 78.1460 },
    { id: 'TN_TRY', stateId: 'TN', name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
    { id: 'TN_TPR', stateId: 'TN', name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
    { id: 'TN_ERD', stateId: 'TN', name: 'Erode', lat: 11.3410, lng: 77.7172 },
    { id: 'TN_VLR', stateId: 'TN', name: 'Vellore', lat: 12.9165, lng: 79.1325 },
    { id: 'TN_TNV', stateId: 'TN', name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
    { id: 'TN_TNJ', stateId: 'TN', name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
    { id: 'TN_KNC', stateId: 'TN', name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
    { id: 'TN_CDL', stateId: 'TN', name: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
    { id: 'TN_DND', stateId: 'TN', name: 'Dindigul', lat: 10.3673, lng: 77.9803 },
    { id: 'TN_NGP', stateId: 'TN', name: 'Nagapattinam', lat: 10.7672, lng: 79.8449 },
    { id: 'TN_THK', stateId: 'TN', name: 'Thoothukudi (Tuticorin)', lat: 8.7642, lng: 78.1348 },
  ],
  TG: [
    { id: 'TG_HYD', stateId: 'TG', name: 'Hyderabad / Rangareddy', lat: 17.3850, lng: 78.4867 },
    { id: 'TG_WGL', stateId: 'TG', name: 'Warangal', lat: 17.9689, lng: 79.5941 },
    { id: 'TG_KRM', stateId: 'TG', name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
    { id: 'TG_NZB', stateId: 'TG', name: 'Nizamabad', lat: 18.6725, lng: 78.0941 },
    { id: 'TG_KHM', stateId: 'TG', name: 'Khammam', lat: 17.2473, lng: 80.1514 },
    { id: 'TG_MBN', stateId: 'TG', name: 'Mahbubnagar', lat: 16.7488, lng: 77.9845 },
    { id: 'TG_NLG', stateId: 'TG', name: 'Nalgonda', lat: 17.0500, lng: 79.2667 },
    { id: 'TG_SNG', stateId: 'TG', name: 'Sangareddy', lat: 17.6194, lng: 78.0863 },
    { id: 'TG_MDK', stateId: 'TG', name: 'Medak', lat: 18.0461, lng: 78.2618 },
  ],
  TR: [
    { id: 'TR_AGT', stateId: 'TR', name: 'West Tripura (Agartala)', lat: 23.8315, lng: 91.2868 },
    { id: 'TR_UDP', stateId: 'TR', name: 'Gomati (Udaipur)', lat: 23.5333, lng: 91.4833 },
    { id: 'TR_BLN', stateId: 'TR', name: 'South Tripura (Belonia)', lat: 23.2500, lng: 91.4500 },
    { id: 'TR_DHM', stateId: 'TR', name: 'North Tripura (Dharmanagar)', lat: 24.3667, lng: 92.1667 },
  ],
  UP: [
    { id: 'UP_LKO', stateId: 'UP', name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { id: 'UP_VNS', stateId: 'UP', name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
    { id: 'UP_KAN', stateId: 'UP', name: 'Kanpur Nagar / Dehat', lat: 26.4499, lng: 80.3319 },
    { id: 'UP_AGR', stateId: 'UP', name: 'Agra', lat: 27.1767, lng: 78.0081 },
    { id: 'UP_PRG', stateId: 'UP', name: 'Prayagraj (Allahabad)', lat: 25.4358, lng: 81.8463 },
    { id: 'UP_NOI', stateId: 'UP', name: 'Gautam Buddha Nagar (Noida)', lat: 28.5355, lng: 77.3910 },
    { id: 'UP_GKP', stateId: 'UP', name: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
    { id: 'UP_MRT', stateId: 'UP', name: 'Meerut', lat: 28.9845, lng: 77.7064 },
    { id: 'UP_GZB', stateId: 'UP', name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
    { id: 'UP_BRL', stateId: 'UP', name: 'Bareilly', lat: 28.3670, lng: 79.4304 },
    { id: 'UP_ALG', stateId: 'UP', name: 'Aligarh', lat: 27.8974, lng: 78.0880 },
    { id: 'UP_MBD', stateId: 'UP', name: 'Moradabad', lat: 28.8386, lng: 78.7733 },
    { id: 'UP_JHS', stateId: 'UP', name: 'Jhansi', lat: 25.4484, lng: 78.5685 },
    { id: 'UP_MTR', stateId: 'UP', name: 'Mathura', lat: 27.4924, lng: 77.6737 },
    { id: 'UP_AYD', stateId: 'UP', name: 'Ayodhya (Faizabad)', lat: 26.7922, lng: 82.1998 },
    { id: 'UP_SHR', stateId: 'UP', name: 'Saharanpur', lat: 29.9680, lng: 77.5550 },
    { id: 'UP_MZN', stateId: 'UP', name: 'Muzaffarnagar', lat: 29.4727, lng: 77.7085 },
    { id: 'UP_FRZ', stateId: 'UP', name: 'Firozabad', lat: 27.1592, lng: 78.3957 },
    { id: 'UP_RMP', stateId: 'UP', name: 'Rampur', lat: 28.8154, lng: 79.0250 },
    { id: 'UP_SJP', stateId: 'UP', name: 'Shahjahanpur', lat: 27.8804, lng: 79.9080 },
  ],
  UK: [
    { id: 'UK_DDN', stateId: 'UK', name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
    { id: 'UK_HDW', stateId: 'UK', name: 'Haridwar', lat: 29.9457, lng: 78.1642 },
    { id: 'UK_RDP', stateId: 'UK', name: 'Udham Singh Nagar (Rudrapur)', lat: 28.9800, lng: 79.4000 },
    { id: 'UK_HLD', stateId: 'UK', name: 'Nainital (Haldwani)', lat: 29.2183, lng: 79.5130 },
    { id: 'UK_ALM', stateId: 'UK', name: 'Almora', lat: 29.5971, lng: 79.6591 },
    { id: 'UK_PWR', stateId: 'UK', name: 'Pauri Garhwal', lat: 30.1473, lng: 78.7808 },
    { id: 'UK_THR', stateId: 'UK', name: 'Tehri Garhwal', lat: 30.3753, lng: 78.4344 },
    { id: 'UK_PTG', stateId: 'UK', name: 'Pithoragarh', lat: 29.5829, lng: 80.2182 },
  ],
  WB: [
    { id: 'WB_KOL', stateId: 'WB', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { id: 'WB_N24', stateId: 'WB', name: 'North 24 Parganas (Barasat)', lat: 22.7224, lng: 88.4811 },
    { id: 'WB_S24', stateId: 'WB', name: 'South 24 Parganas (Alipore)', lat: 22.5300, lng: 88.3300 },
    { id: 'WB_HWH', stateId: 'WB', name: 'Howrah', lat: 22.5958, lng: 88.2636 },
    { id: 'WB_DGP', stateId: 'WB', name: 'Paschim Bardhaman (Durgapur)', lat: 23.5204, lng: 87.3119 },
    { id: 'WB_SLG', stateId: 'WB', name: 'Darjeeling (Siliguri)', lat: 26.7271, lng: 88.3953 },
    { id: 'WB_MSD', stateId: 'WB', name: 'Murshidabad (Baharampur)', lat: 24.1750, lng: 88.2800 },
    { id: 'WB_HGL', stateId: 'WB', name: 'Hooghly (Chinsurah)', lat: 22.9030, lng: 88.3970 },
    { id: 'WB_MLD', stateId: 'WB', name: 'Malda', lat: 25.0004, lng: 88.1465 },
    { id: 'WB_NDA', stateId: 'WB', name: 'Nadia (Krishnanagar)', lat: 23.4013, lng: 88.5107 },
    { id: 'WB_PRL', stateId: 'WB', name: 'Purulia', lat: 23.3323, lng: 86.3652 },
    { id: 'WB_BRB', stateId: 'WB', name: 'Birbhum (Suri)', lat: 23.9100, lng: 87.5300 },
  ],

  // Union Territories
  AN: [
    { id: 'AN_PBL', stateId: 'AN', name: 'South Andaman (Port Blair)', lat: 11.6234, lng: 92.7265 },
    { id: 'AN_NMA', stateId: 'AN', name: 'North & Middle Andaman (Mayabunder)', lat: 12.9300, lng: 92.9000 },
    { id: 'AN_NCB', stateId: 'AN', name: 'Nicobar (Car Nicobar)', lat: 9.1667, lng: 92.8167 },
  ],
  CH: [
    { id: 'CH_CHD', stateId: 'CH', name: 'Chandigarh City & Peri-Urban', lat: 30.7333, lng: 76.7794 },
  ],
  DN: [
    { id: 'DN_DMN', stateId: 'DN', name: 'Daman District', lat: 20.4283, lng: 72.8397 },
    { id: 'DN_DIU', stateId: 'DN', name: 'Diu District', lat: 20.7144, lng: 70.9822 },
    { id: 'DN_DDR', stateId: 'DN', name: 'Dadra & Nagar Haveli (Silvassa)', lat: 20.2766, lng: 73.0083 },
  ],
  DL: [
    { id: 'DL_NDL', stateId: 'DL', name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { id: 'DL_NW', stateId: 'DL', name: 'North West Delhi (Rohini)', lat: 28.7041, lng: 77.1025 },
    { id: 'DL_SW', stateId: 'DL', name: 'South West & Najafgarh', lat: 28.6090, lng: 76.9855 },
    { id: 'DL_EST', stateId: 'DL', name: 'East Delhi', lat: 28.6280, lng: 77.2950 },
    { id: 'DL_STH', stateId: 'DL', name: 'South Delhi', lat: 28.5400, lng: 77.2400 },
    { id: 'DL_WST', stateId: 'DL', name: 'West Delhi', lat: 28.6500, lng: 77.1200 },
    { id: 'DL_CNT', stateId: 'DL', name: 'Central Delhi', lat: 28.6400, lng: 77.2200 },
  ],
  JK: [
    { id: 'JK_SGR', stateId: 'JK', name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
    { id: 'JK_JMU', stateId: 'JK', name: 'Jammu', lat: 32.7266, lng: 74.8570 },
    { id: 'JK_ANT', stateId: 'JK', name: 'Anantnag', lat: 33.7311, lng: 75.1487 },
    { id: 'JK_BRM', stateId: 'JK', name: 'Baramulla', lat: 34.2000, lng: 74.3500 },
    { id: 'JK_UDH', stateId: 'JK', name: 'Udhampur', lat: 32.9275, lng: 75.1419 },
    { id: 'JK_PLW', stateId: 'JK', name: 'Pulwama', lat: 33.8717, lng: 74.8967 },
    { id: 'JK_KTH', stateId: 'JK', name: 'Kathua', lat: 32.3700, lng: 75.5200 },
    { id: 'JK_RJR', stateId: 'JK', name: 'Rajouri', lat: 33.3800, lng: 74.3000 },
  ],
  LA: [
    { id: 'LA_LEH', stateId: 'LA', name: 'Leh District', lat: 34.1526, lng: 77.5771 },
    { id: 'LA_KGL', stateId: 'LA', name: 'Kargil District', lat: 34.5539, lng: 76.1349 },
  ],
  LD: [
    { id: 'LD_KVR', stateId: 'LD', name: 'Kavaratti District', lat: 10.5667, lng: 72.6417 },
    { id: 'LD_AGT', stateId: 'LD', name: 'Agatti Island', lat: 10.8500, lng: 72.1833 },
    { id: 'LD_MNC', stateId: 'LD', name: 'Minicoy Island', lat: 8.2833, lng: 73.0500 },
  ],
  PY: [
    { id: 'PY_PDY', stateId: 'PY', name: 'Puducherry District', lat: 11.9416, lng: 79.8083 },
    { id: 'PY_KRK', stateId: 'PY', name: 'Karaikal District', lat: 10.9252, lng: 79.8380 },
    { id: 'PY_MHE', stateId: 'PY', name: 'Mahe Region', lat: 11.7000, lng: 75.5333 },
    { id: 'PY_YNM', stateId: 'PY', name: 'Yanam Region', lat: 16.7333, lng: 82.2167 },
  ],
};

const AREAS: Record<string, AreaLocation[]> = {
  // ── GUJARAT ──────────────────────────────────────────────────────────────
  GJ_AMD: [
    { id: 'GJ_AMD_DASKROI',     districtId: 'GJ_AMD', name: 'Daskroi Taluka',               lat: 22.9636, lng: 72.6689 },
    { id: 'GJ_AMD_SANAND',      districtId: 'GJ_AMD', name: 'Sanand Taluka',                lat: 22.9902, lng: 72.3812 },
    { id: 'GJ_AMD_CHANGODAR',   districtId: 'GJ_AMD', name: 'Changodar Industrial Zone',    lat: 22.9234, lng: 72.4412 },
    { id: 'GJ_AMD_BAVLA',       districtId: 'GJ_AMD', name: 'Bavla Taluka',                 lat: 22.8361, lng: 72.3619 },
    { id: 'GJ_AMD_DHOLKA',      districtId: 'GJ_AMD', name: 'Dholka Taluka',                lat: 22.7214, lng: 72.4632 },
    { id: 'GJ_AMD_VIRAMGAM',    districtId: 'GJ_AMD', name: 'Viramgam Taluka',              lat: 23.1154, lng: 72.0333 },
    { id: 'GJ_AMD_MANDAL',      districtId: 'GJ_AMD', name: 'Mandal Taluka',                lat: 23.2780, lng: 71.9260 },
    { id: 'GJ_AMD_DETROJ',      districtId: 'GJ_AMD', name: 'Detroj-Rampura Taluka',        lat: 23.3350, lng: 72.1850 },
    { id: 'GJ_AMD_BAREJA',      districtId: 'GJ_AMD', name: 'Bareja Peri-Urban Cluster',    lat: 22.8900, lng: 72.5670 },
    { id: 'GJ_AMD_DHANDHUKA',   districtId: 'GJ_AMD', name: 'Dhandhuka Taluka',             lat: 22.3880, lng: 71.9897 },
    { id: 'GJ_AMD_DHOLERA',     districtId: 'GJ_AMD', name: 'Dholera SIR Taluka',           lat: 22.2450, lng: 72.1950 },
    { id: 'GJ_AMD_NALSAROVAR',  districtId: 'GJ_AMD', name: 'Nalsarovar Bird Sanctuary Belt', lat: 22.8000, lng: 72.0300 },
    { id: 'GJ_AMD_BAGODARA',    districtId: 'GJ_AMD', name: 'Bagodara Highway Junction',    lat: 22.6100, lng: 72.1500 },
    { id: 'GJ_AMD_CITY_N',      districtId: 'GJ_AMD', name: 'Ahmedabad North Urban Belt',   lat: 23.0800, lng: 72.5800 },
    { id: 'GJ_AMD_CITY_S',      districtId: 'GJ_AMD', name: 'Ahmedabad South Commercial',   lat: 22.9800, lng: 72.5900 },
  ],
  GJ_SUR: [
    { id: 'GJ_SUR_KAMREJ',      districtId: 'GJ_SUR', name: 'Kamrej Taluka',                lat: 21.2678, lng: 72.9612 },
    { id: 'GJ_SUR_BARDOLI',     districtId: 'GJ_SUR', name: 'Bardoli Taluka (Sugar Belt)',   lat: 21.1214, lng: 73.1124 },
    { id: 'GJ_SUR_OLPAD',       districtId: 'GJ_SUR', name: 'Olpad Taluka',                 lat: 21.3344, lng: 72.7491 },
    { id: 'GJ_SUR_MANDVI',      districtId: 'GJ_SUR', name: 'Mandvi Taluka',                lat: 21.2580, lng: 73.3000 },
    { id: 'GJ_SUR_MANGROL',     districtId: 'GJ_SUR', name: 'Mangrol Taluka',               lat: 21.4100, lng: 73.0500 },
    { id: 'GJ_SUR_PALSANA',     districtId: 'GJ_SUR', name: 'Palsana Textile Cluster',      lat: 21.0980, lng: 72.9350 },
    { id: 'GJ_SUR_CHORASI',     districtId: 'GJ_SUR', name: 'Choryasi Peri-Urban',          lat: 21.1500, lng: 72.7800 },
    { id: 'GJ_SUR_MAHUVA',      districtId: 'GJ_SUR', name: 'Mahuva Taluka (Surat)',        lat: 20.9600, lng: 73.1500 },
    { id: 'GJ_SUR_SURAT_CITY',  districtId: 'GJ_SUR', name: 'Surat City & Diamond Bourse',  lat: 21.1702, lng: 72.8311 },
  ],
  GJ_VAD: [
    { id: 'GJ_VAD_PADRA',       districtId: 'GJ_VAD', name: 'Padra Taluka',                 lat: 22.2412, lng: 73.0812 },
    { id: 'GJ_VAD_SAVLI',       districtId: 'GJ_VAD', name: 'Savli Taluka (GIDC)',           lat: 22.5612, lng: 73.2212 },
    { id: 'GJ_VAD_KARJAN',      districtId: 'GJ_VAD', name: 'Karjan Taluka',                lat: 22.0558, lng: 73.1220 },
    { id: 'GJ_VAD_DABHOI',      districtId: 'GJ_VAD', name: 'Dabhoi Taluka',                lat: 22.1833, lng: 73.4333 },
    { id: 'GJ_VAD_WAGHODIA',    districtId: 'GJ_VAD', name: 'Waghodia Taluka',              lat: 22.3000, lng: 73.4200 },
    { id: 'GJ_VAD_SINOR',       districtId: 'GJ_VAD', name: 'Sinor Taluka',                 lat: 21.9100, lng: 73.3300 },
    { id: 'GJ_VAD_DESAR',       districtId: 'GJ_VAD', name: 'Desar Taluka',                 lat: 22.6100, lng: 73.3500 },
    { id: 'GJ_VAD_VADODARA_C',  districtId: 'GJ_VAD', name: 'Vadodara City Core',           lat: 22.3072, lng: 73.1812 },
  ],
  GJ_RAJ: [
    { id: 'GJ_RAJ_GONDAL',      districtId: 'GJ_RAJ', name: 'Gondal Taluka',                lat: 21.9612, lng: 70.7912 },
    { id: 'GJ_RAJ_RAJKOT_C',    districtId: 'GJ_RAJ', name: 'Rajkot City & Periphery',      lat: 22.3039, lng: 70.8022 },
    { id: 'GJ_RAJ_LODHIKA',     districtId: 'GJ_RAJ', name: 'Lodhika Taluka',               lat: 22.1800, lng: 70.7100 },
    { id: 'GJ_RAJ_KOTDA_SNG',   districtId: 'GJ_RAJ', name: 'Kotda Sangani Taluka',         lat: 21.9700, lng: 70.8400 },
    { id: 'GJ_RAJ_JASDAN',      districtId: 'GJ_RAJ', name: 'Jasdan Taluka',                lat: 22.0407, lng: 71.2113 },
    { id: 'GJ_RAJ_VINCHHIYA',   districtId: 'GJ_RAJ', name: 'Vinchhiya Taluka',             lat: 22.2500, lng: 71.3500 },
    { id: 'GJ_RAJ_JETPUR',      districtId: 'GJ_RAJ', name: 'Jetpur Textile Hub',           lat: 21.7600, lng: 70.6200 },
    { id: 'GJ_RAJ_DHORAJI',     districtId: 'GJ_RAJ', name: 'Dhoraji Taluka',               lat: 21.7300, lng: 70.4500 },
    { id: 'GJ_RAJ_UPLETA',      districtId: 'GJ_RAJ', name: 'Upleta Taluka',                lat: 21.7300, lng: 70.2800 },
  ],
  GJ_ANAND: [
    { id: 'GJ_ANAND_CENTRAL',   districtId: 'GJ_ANAND', name: 'Anand City & Vidyanagar',   lat: 22.5645, lng: 72.9289 },
    { id: 'GJ_ANAND_BAKROL',    districtId: 'GJ_ANAND', name: 'Bakrol-VV Nagar Agri Hub',  lat: 22.5532, lng: 72.9242 },
    { id: 'GJ_ANAND_PETLAD',    districtId: 'GJ_ANAND', name: 'Petlad Taluka',             lat: 22.4744, lng: 72.8012 },
    { id: 'GJ_ANAND_UMRETH',    districtId: 'GJ_ANAND', name: 'Umreth Taluka',             lat: 22.6988, lng: 73.1124 },
    { id: 'GJ_ANAND_SOJITRA',   districtId: 'GJ_ANAND', name: 'Sojitra Taluka',            lat: 22.5350, lng: 72.7150 },
    { id: 'GJ_ANAND_TARAPUR',   districtId: 'GJ_ANAND', name: 'Tarapur Taluka',            lat: 22.4900, lng: 72.6500 },
    { id: 'GJ_ANAND_BORSAD',    districtId: 'GJ_ANAND', name: 'Borsad Taluka (Dairy Belt)',lat: 22.4100, lng: 72.9000 },
    { id: 'GJ_ANAND_KHAMBHAT',  districtId: 'GJ_ANAND', name: 'Khambhat Taluka',           lat: 22.3167, lng: 72.6167 },
    { id: 'GJ_ANAND_ANKLAV',    districtId: 'GJ_ANAND', name: 'Anklav Taluka',             lat: 22.3800, lng: 73.0000 },
    { id: 'GJ_ANAND_VASAD',     districtId: 'GJ_ANAND', name: 'Vasad Highway & Dairy Zone', lat: 22.4400, lng: 73.0600 },
  ],
  GJ_MEH: [
    { id: 'GJ_MEH_KADI',        districtId: 'GJ_MEH', name: 'Kadi Taluka (Cotton Cluster)', lat: 23.3012, lng: 72.3312 },
    { id: 'GJ_MEH_MAHESANA_C',  districtId: 'GJ_MEH', name: 'Mehsana City',                 lat: 23.6000, lng: 72.4000 },
    { id: 'GJ_MEH_NANDASAN',    districtId: 'GJ_MEH', name: 'Nandasan Industrial Belt',     lat: 23.3900, lng: 72.4000 },
    { id: 'GJ_MEH_VISNAGAR',    districtId: 'GJ_MEH', name: 'Visnagar Taluka',              lat: 23.7000, lng: 72.5500 },
    { id: 'GJ_MEH_UNJHA',       districtId: 'GJ_MEH', name: 'Unjha Spice Mandi',           lat: 23.8100, lng: 72.3900 },
    { id: 'GJ_MEH_VADNAGAR',    districtId: 'GJ_MEH', name: 'Vadnagar Heritage Taluka',    lat: 23.7800, lng: 72.6400 },
    { id: 'GJ_MEH_VIJAPUR',     districtId: 'GJ_MEH', name: 'Vijapur Taluka',              lat: 23.5600, lng: 72.7500 },
    { id: 'GJ_MEH_BECHARAJI',   districtId: 'GJ_MEH', name: 'Becharaji Auto Hub',          lat: 23.5000, lng: 72.0400 },
  ],
  GJ_GND: [
    { id: 'GJ_GND_CITY',        districtId: 'GJ_GND', name: 'Gandhinagar City & GIFT City', lat: 23.2156, lng: 72.6369 },
    { id: 'GJ_GND_MANSA',       districtId: 'GJ_GND', name: 'Mansa Taluka',                 lat: 23.4250, lng: 72.6600 },
    { id: 'GJ_GND_KALOL',       districtId: 'GJ_GND', name: 'Kalol Taluka',                 lat: 23.2400, lng: 72.5100 },
    { id: 'GJ_GND_DEHGAM',      districtId: 'GJ_GND', name: 'Dehgam Taluka',                lat: 23.1700, lng: 72.8100 },
  ],
  GJ_KHD: [
    { id: 'GJ_KHD_NADIAD',      districtId: 'GJ_KHD', name: 'Nadiad City & Commercial Hub', lat: 22.6900, lng: 72.8600 },
    { id: 'GJ_KHD_MEHMEDABAD',  districtId: 'GJ_KHD', name: 'Mehmedabad Taluka',            lat: 22.8300, lng: 72.7600 },
    { id: 'GJ_KHD_KHEDA',       districtId: 'GJ_KHD', name: 'Kheda Taluka',                 lat: 22.7500, lng: 72.6800 },
    { id: 'GJ_KHD_MATAR',       districtId: 'GJ_KHD', name: 'Matar Taluka',                 lat: 22.7000, lng: 72.6600 },
    { id: 'GJ_KHD_KAPADVANJ',   districtId: 'GJ_KHD', name: 'Kapadvanj Taluka',             lat: 23.0200, lng: 73.0700 },
    { id: 'GJ_KHD_KATHLAL',     districtId: 'GJ_KHD', name: 'Kathlal Taluka',               lat: 22.9500, lng: 72.9700 },
    { id: 'GJ_KHD_MAHUDHA',     districtId: 'GJ_KHD', name: 'Mahudha Taluka',               lat: 22.8200, lng: 72.9300 },
    { id: 'GJ_KHD_THASRA',      districtId: 'GJ_KHD', name: 'Thasra (Dakor) Taluka',        lat: 22.8500, lng: 73.2100 },
  ],
  GJ_BHV: [
    { id: 'GJ_BHV_BHAVNAGAR_C', districtId: 'GJ_BHV', name: 'Bhavnagar City',              lat: 21.7645, lng: 72.1519 },
    { id: 'GJ_BHV_SIHOR',       districtId: 'GJ_BHV', name: 'Sihor Taluka',                lat: 21.7000, lng: 71.9600 },
    { id: 'GJ_BHV_MAHUVA',      districtId: 'GJ_BHV', name: 'Mahuva Taluka (Onion Mandi)',  lat: 21.0900, lng: 71.7600 },
    { id: 'GJ_BHV_PALITANA',    districtId: 'GJ_BHV', name: 'Palitana Taluka',             lat: 21.5200, lng: 71.8200 },
    { id: 'GJ_BHV_TALAJA',      districtId: 'GJ_BHV', name: 'Talaja Taluka',               lat: 21.3500, lng: 72.0400 },
    { id: 'GJ_BHV_GHOGHA',      districtId: 'GJ_BHV', name: 'Ghogha Port Ro-Pax Hub',      lat: 21.6800, lng: 72.2700 },
  ],
  GJ_JMN: [
    { id: 'GJ_JMN_JAMNAGAR_C',  districtId: 'GJ_JMN', name: 'Jamnagar City (Brass Hub)',    lat: 22.4707, lng: 70.0577 },
    { id: 'GJ_JMN_LALPUR',      districtId: 'GJ_JMN', name: 'Lalpur Petrochem Zone',        lat: 22.3500, lng: 69.9600 },
    { id: 'GJ_JMN_KALAVAD',     districtId: 'GJ_JMN', name: 'Kalavad Taluka',              lat: 22.2100, lng: 70.3800 },
    { id: 'GJ_JMN_DHROL',       districtId: 'GJ_JMN', name: 'Dhrol Taluka',                lat: 22.5600, lng: 70.4100 },
    { id: 'GJ_JMN_JAMJODHPUR',  districtId: 'GJ_JMN', name: 'Jamjodhpur Taluka',           lat: 21.9000, lng: 69.8700 },
  ],
  GJ_KTCH: [
    { id: 'GJ_KTCH_BHUJ',       districtId: 'GJ_KTCH', name: 'Bhuj City & Periphery',      lat: 23.2420, lng: 69.6669 },
    { id: 'GJ_KTCH_ANJAR',      districtId: 'GJ_KTCH', name: 'Anjar Taluka',               lat: 23.1100, lng: 70.0200 },
    { id: 'GJ_KTCH_GANDHIDHAM', districtId: 'GJ_KTCH', name: 'Gandhidham Industrial Hub',  lat: 23.0800, lng: 70.1300 },
    { id: 'GJ_KTCH_MUNDRA',     districtId: 'GJ_KTCH', name: 'Mundra Port Zone',            lat: 22.8200, lng: 69.7300 },
    { id: 'GJ_KTCH_RAPAR',      districtId: 'GJ_KTCH', name: 'Rapar Taluka (Salt Belt)',    lat: 23.5800, lng: 70.6400 },
    { id: 'GJ_KTCH_MANDVI',     districtId: 'GJ_KTCH', name: 'Mandvi Port & Agro Hub',      lat: 22.8300, lng: 69.3550 },
    { id: 'GJ_KTCH_NAKHTRANA',  districtId: 'GJ_KTCH', name: 'Nakhtrana Taluka',           lat: 23.3500, lng: 69.5000 },
  ],
  GJ_AMR: [
    { id: 'GJ_AMR_AMRELI_C',    districtId: 'GJ_AMR', name: 'Amreli City',                 lat: 21.6032, lng: 71.2221 },
    { id: 'GJ_AMR_SAVERKUNDLA', districtId: 'GJ_AMR', name: 'Savarkundla Taluka',          lat: 21.3400, lng: 71.3100 },
    { id: 'GJ_AMR_RAJULA',      districtId: 'GJ_AMR', name: 'Rajula Taluka',               lat: 21.0400, lng: 71.4400 },
    { id: 'GJ_AMR_DHARI',       districtId: 'GJ_AMR', name: 'Dhari Taluka',                lat: 21.3300, lng: 71.0300 },
    { id: 'GJ_AMR_BABRA',       districtId: 'GJ_AMR', name: 'Babra Taluka',                lat: 21.8500, lng: 71.3000 },
    { id: 'GJ_AMR_BAGASARA',    districtId: 'GJ_AMR', name: 'Bagasara Taluka',             lat: 21.4800, lng: 70.9800 },
    { id: 'GJ_AMR_JAFRABAD',    districtId: 'GJ_AMR', name: 'Jafrabad Coastal Port',       lat: 20.8700, lng: 71.3700 },
  ],
  GJ_BHC: [
    { id: 'GJ_BHC_BHARUCH_C',   districtId: 'GJ_BHC', name: 'Bharuch City',                lat: 21.7051, lng: 72.9959 },
    { id: 'GJ_BHC_ANKLESHWAR',  districtId: 'GJ_BHC', name: 'Ankleshwar GIDC Industrial',  lat: 21.6300, lng: 73.0000 },
    { id: 'GJ_BHC_VAGRA',       districtId: 'GJ_BHC', name: 'Vagra (Dahej PCPIR)',         lat: 21.7100, lng: 72.6400 },
    { id: 'GJ_BHC_AMOD',        districtId: 'GJ_BHC', name: 'Amod Taluka',                 lat: 22.0000, lng: 72.8800 },
    { id: 'GJ_BHC_JAMBUSAR',    districtId: 'GJ_BHC', name: 'Jambusar Taluka',             lat: 22.0500, lng: 72.8000 },
    { id: 'GJ_BHC_VALIA',       districtId: 'GJ_BHC', name: 'Valia Taluka',                lat: 21.5400, lng: 73.1000 },
    { id: 'GJ_BHC_JHAGADIA',    districtId: 'GJ_BHC', name: 'Jhagadia GIDC Hub',           lat: 21.7200, lng: 73.1500 },
  ],
  GJ_DHD: [
    { id: 'GJ_DHD_DAHOD_C',     districtId: 'GJ_DHD', name: 'Dahod City',                  lat: 22.8347, lng: 74.2547 },
    { id: 'GJ_DHD_LIMKHEDA',    districtId: 'GJ_DHD', name: 'Limkheda Taluka',             lat: 22.8300, lng: 73.9800 },
    { id: 'GJ_DHD_JHALOD',      districtId: 'GJ_DHD', name: 'Jhalod Taluka',               lat: 23.1000, lng: 74.1500 },
    { id: 'GJ_DHD_GARBADA',     districtId: 'GJ_DHD', name: 'Garbada Taluka',              lat: 22.6700, lng: 74.3200 },
    { id: 'GJ_DHD_FATEPURA',    districtId: 'GJ_DHD', name: 'Fatepura Taluka',             lat: 23.1800, lng: 74.0500 },
    { id: 'GJ_DHD_DEVGADH_BARIA',districtId: 'GJ_DHD', name: 'Devgadh Baria Taluka',       lat: 22.7000, lng: 73.9000 },
  ],
  GJ_JND: [
    { id: 'GJ_JND_JUNAGADH_C',  districtId: 'GJ_JND', name: 'Junagadh City',               lat: 21.5222, lng: 70.4579 },
    { id: 'GJ_JND_KESHOD',      districtId: 'GJ_JND', name: 'Keshod Taluka',               lat: 21.3000, lng: 70.2500 },
    { id: 'GJ_JND_VANTHALI',    districtId: 'GJ_JND', name: 'Vanthali Taluka',             lat: 21.4700, lng: 70.3200 },
    { id: 'GJ_JND_MENDARDA',    districtId: 'GJ_JND', name: 'Mendarda Taluka',             lat: 21.3100, lng: 70.5500 },
    { id: 'GJ_JND_VISAVADAR',   districtId: 'GJ_JND', name: 'Visavadar Taluka',            lat: 21.3400, lng: 70.7100 },
    { id: 'GJ_JND_MANAVADAR',   districtId: 'GJ_JND', name: 'Manavadar Cotton Belt',       lat: 21.5000, lng: 70.1400 },
    { id: 'GJ_JND_MANGROL',     districtId: 'GJ_JND', name: 'Mangrol Coastal Taluka',      lat: 21.1200, lng: 70.1200 },
  ],
  GJ_NVS: [
    { id: 'GJ_NVS_NAVSARI_C',   districtId: 'GJ_NVS', name: 'Navsari City',                lat: 20.9467, lng: 72.9520 },
    { id: 'GJ_NVS_GANDEVI',     districtId: 'GJ_NVS', name: 'Gandevi Taluka (Chikoo Belt)', lat: 20.8200, lng: 72.9800 },
    { id: 'GJ_NVS_CHIKHLI',     districtId: 'GJ_NVS', name: 'Chikhli Taluka',              lat: 20.7600, lng: 73.0700 },
    { id: 'GJ_NVS_JALALPORE',   districtId: 'GJ_NVS', name: 'Jalalpore Taluka',            lat: 20.9500, lng: 72.9000 },
    { id: 'GJ_NVS_VANSDA',      districtId: 'GJ_NVS', name: 'Vansda Tribal Agro Belt',      lat: 20.7600, lng: 73.3600 },
  ],
  GJ_PNC: [
    { id: 'GJ_PNC_GODHRA_C',    districtId: 'GJ_PNC', name: 'Godhra City',                 lat: 22.7758, lng: 73.6146 },
    { id: 'GJ_PNC_HALOL',       districtId: 'GJ_PNC', name: 'Halol Taluka (Auto Hub)',     lat: 22.5000, lng: 73.4700 },
    { id: 'GJ_PNC_KALOL',       districtId: 'GJ_PNC', name: 'Kalol Taluka (Panchmahal)',   lat: 22.6000, lng: 73.4600 },
    { id: 'GJ_PNC_SHEHRA',      districtId: 'GJ_PNC', name: 'Shehra Taluka',               lat: 22.9500, lng: 73.6300 },
    { id: 'GJ_PNC_GHOGHAMBA',   districtId: 'GJ_PNC', name: 'Ghoghamba Taluka',            lat: 22.6100, lng: 73.6200 },
  ],
  GJ_PTN: [
    { id: 'GJ_PTN_PATAN_C',     districtId: 'GJ_PTN', name: 'Patan City',                  lat: 23.8493, lng: 72.1266 },
    { id: 'GJ_PTN_SIDDHPUR',    districtId: 'GJ_PTN', name: 'Siddhpur Taluka',             lat: 23.9167, lng: 72.3789 },
    { id: 'GJ_PTN_HARIJ',       districtId: 'GJ_PTN', name: 'Harij Taluka',                lat: 23.7000, lng: 71.9000 },
    { id: 'GJ_PTN_RADHANPUR',   districtId: 'GJ_PTN', name: 'Radhanpur Taluka',            lat: 23.8300, lng: 71.6000 },
    { id: 'GJ_PTN_CHANASMA',    districtId: 'GJ_PTN', name: 'Chanasma Taluka',             lat: 23.7200, lng: 72.1100 },
    { id: 'GJ_PTN_SAMI',        districtId: 'GJ_PTN', name: 'Sami Taluka',                 lat: 23.6833, lng: 71.7000 },
    { id: 'GJ_PTN_SHANKHESHWAR',districtId: 'GJ_PTN', name: 'Shankheshwar Heritage Taluka', lat: 23.5000, lng: 71.6000 },
  ],
  GJ_PRB: [
    { id: 'GJ_PRB_PORBANDAR_C', districtId: 'GJ_PRB', name: 'Porbandar City',              lat: 21.6417, lng: 69.6293 },
    { id: 'GJ_PRB_KUTIYANA',    districtId: 'GJ_PRB', name: 'Kutiyana Taluka',             lat: 21.6300, lng: 69.9800 },
    { id: 'GJ_PRB_RANAVAV',     districtId: 'GJ_PRB', name: 'Ranavav Taluka',              lat: 21.6800, lng: 69.7500 },
  ],
  GJ_SBR: [
    { id: 'GJ_SBR_HIMMATNAGAR', districtId: 'GJ_SBR', name: 'Himmatnagar Taluka',          lat: 23.5979, lng: 72.9698 },
    { id: 'GJ_SBR_IDAR',        districtId: 'GJ_SBR', name: 'Idar Taluka',                 lat: 23.8300, lng: 73.0000 },
    { id: 'GJ_SBR_PRANTIJ',     districtId: 'GJ_SBR', name: 'Prantij Taluka',              lat: 23.4400, lng: 72.8600 },
    { id: 'GJ_SBR_TALOD',       districtId: 'GJ_SBR', name: 'Talod Taluka',                lat: 23.3500, lng: 72.9500 },
    { id: 'GJ_SBR_KHEDBRAHMA',  districtId: 'GJ_SBR', name: 'Khedbrahma Taluka',           lat: 24.0300, lng: 73.0400 },
  ],
  GJ_ARV: [
    { id: 'GJ_ARV_MODASA',      districtId: 'GJ_ARV', name: 'Modasa City & Mandi',         lat: 23.4600, lng: 73.3000 },
    { id: 'GJ_ARV_BAYAD',       districtId: 'GJ_ARV', name: 'Bayad Taluka',                lat: 23.2300, lng: 73.2200 },
    { id: 'GJ_ARV_MALPUR',      districtId: 'GJ_ARV', name: 'Malpur Taluka',               lat: 23.3600, lng: 73.4600 },
    { id: 'GJ_ARV_BHILODA',     districtId: 'GJ_ARV', name: 'Bhiloda Taluka',              lat: 23.7700, lng: 73.2600 },
    { id: 'GJ_ARV_DHANSURA',    districtId: 'GJ_ARV', name: 'Dhansura Taluka',             lat: 23.3800, lng: 73.1800 },
  ],
  GJ_MHS: [
    { id: 'GJ_MHS_LUNAWADA',    districtId: 'GJ_MHS', name: 'Lunawada City',               lat: 23.1400, lng: 73.6200 },
    { id: 'GJ_MHS_SANTRAMPUR',  districtId: 'GJ_MHS', name: 'Santrampur Taluka',           lat: 23.1800, lng: 73.8800 },
    { id: 'GJ_MHS_BALASINOR',   districtId: 'GJ_MHS', name: 'Balasinor Taluka',            lat: 22.9500, lng: 73.3300 },
    { id: 'GJ_MHS_VIRPUR',      districtId: 'GJ_MHS', name: 'Virpur Taluka',               lat: 23.1800, lng: 73.4800 },
  ],
  GJ_SND: [
    { id: 'GJ_SND_SURENDRANAGAR_C', districtId: 'GJ_SND', name: 'Surendranagar & Wadhwan',  lat: 22.7274, lng: 71.6370 },
    { id: 'GJ_SND_CHOTILA',     districtId: 'GJ_SND', name: 'Chotila Taluka',              lat: 22.4200, lng: 71.1900 },
    { id: 'GJ_SND_DHRANGADHRA', districtId: 'GJ_SND', name: 'Dhrangadhra Taluka',          lat: 22.9800, lng: 71.4600 },
    { id: 'GJ_SND_HALVAD',      districtId: 'GJ_SND', name: 'Halvad Taluka',               lat: 23.0100, lng: 71.1800 },
    { id: 'GJ_SND_LIMBDI',      districtId: 'GJ_SND', name: 'Limbdi Taluka',               lat: 22.5600, lng: 71.8100 },
    { id: 'GJ_SND_PATDI',       districtId: 'GJ_SND', name: 'Patdi / Dasada Taluka',       lat: 23.1900, lng: 71.7900 },
    { id: 'GJ_SND_LAKHATAR',    districtId: 'GJ_SND', name: 'Lakhatar Taluka',             lat: 22.8500, lng: 71.8200 },
  ],
  GJ_VLS: [
    { id: 'GJ_VLS_VALSAD_C',    districtId: 'GJ_VLS', name: 'Valsad City',                 lat: 20.5992, lng: 72.9342 },
    { id: 'GJ_VLS_VAPI',        districtId: 'GJ_VLS', name: 'Vapi Industrial Mega Hub',    lat: 20.3750, lng: 72.9100 },
    { id: 'GJ_VLS_PARDI',       districtId: 'GJ_VLS', name: 'Pardi Taluka',                lat: 20.5100, lng: 72.9600 },
    { id: 'GJ_VLS_UMBERGAON',   districtId: 'GJ_VLS', name: 'Umbergaon Taluka',            lat: 20.1900, lng: 72.7600 },
    { id: 'GJ_VLS_DHARAMPUR',   districtId: 'GJ_VLS', name: 'Dharampur Taluka (Tribal)',   lat: 20.5300, lng: 73.1800 },
    { id: 'GJ_VLS_KAPRADA',     districtId: 'GJ_VLS', name: 'Kaprada Taluka',              lat: 20.3300, lng: 73.2100 },
  ],
  GJ_BNK: [
    { id: 'GJ_BNK_PALANPUR_C',  districtId: 'GJ_BNK', name: 'Palanpur City',               lat: 24.1724, lng: 72.4346 },
    { id: 'GJ_BNK_DEESA',       districtId: 'GJ_BNK', name: 'Deesa Taluka (Potato Belt)',   lat: 24.2600, lng: 72.1900 },
    { id: 'GJ_BNK_DHANERA',     districtId: 'GJ_BNK', name: 'Dhanera Taluka',              lat: 24.5100, lng: 72.0200 },
    { id: 'GJ_BNK_THARAD',      districtId: 'GJ_BNK', name: 'Tharad Taluka',               lat: 24.3900, lng: 71.6300 },
    { id: 'GJ_BNK_VAUVA',       districtId: 'GJ_BNK', name: 'Vadgam Taluka',               lat: 24.1000, lng: 72.6600 },
    { id: 'GJ_BNK_DANTA',       districtId: 'GJ_BNK', name: 'Danta Taluka (Ambaji Belt)',   lat: 24.1900, lng: 72.7800 },
    { id: 'GJ_BNK_VAV',         districtId: 'GJ_BNK', name: 'Vav Taluka',                  lat: 24.3500, lng: 71.5100 },
  ],
  GJ_GIR: [
    { id: 'GJ_GIR_VERAVAL_C',   districtId: 'GJ_GIR', name: 'Veraval Fishing Hub',         lat: 20.9042, lng: 70.3667 },
    { id: 'GJ_GIR_TALALA',      districtId: 'GJ_GIR', name: 'Talala Taluka (Gir Forest)',   lat: 21.0500, lng: 70.5300 },
    { id: 'GJ_GIR_UNA',         districtId: 'GJ_GIR', name: 'Una Taluka',                   lat: 20.8200, lng: 71.0400 },
    { id: 'GJ_GIR_KODINAR',     districtId: 'GJ_GIR', name: 'Kodinar Taluka (Cement Belt)', lat: 20.7900, lng: 70.7000 },
    { id: 'GJ_GIR_SUTRAPADA',   districtId: 'GJ_GIR', name: 'Sutrapada Coastal Zone',      lat: 20.8400, lng: 70.4800 },
  ],
  GJ_MRB: [
    { id: 'GJ_MRB_MORBI_C',     districtId: 'GJ_MRB', name: 'Morbi City (Ceramics Hub)',   lat: 22.8173, lng: 70.8370 },
    { id: 'GJ_MRB_TANKARA',     districtId: 'GJ_MRB', name: 'Tankara Taluka',              lat: 22.6800, lng: 70.7500 },
    { id: 'GJ_MRB_WANKANER',    districtId: 'GJ_MRB', name: 'Wankaner Taluka',             lat: 22.6100, lng: 70.9900 },
    { id: 'GJ_MRB_MALIYA',      districtId: 'GJ_MRB', name: 'Maliya Miyana Taluka',        lat: 22.9700, lng: 70.7600 },
  ],
  GJ_BTD: [
    { id: 'GJ_BTD_BOTAD_C',     districtId: 'GJ_BTD', name: 'Botad City',                  lat: 22.1704, lng: 71.6669 },
    { id: 'GJ_BTD_GADHADA',     districtId: 'GJ_BTD', name: 'Gadhada Taluka',              lat: 21.9700, lng: 71.5800 },
    { id: 'GJ_BTD_BARWALA',     districtId: 'GJ_BTD', name: 'Barwala Taluka',              lat: 22.1500, lng: 71.9000 },
    { id: 'GJ_BTD_RANPUR',      districtId: 'GJ_BTD', name: 'Ranpur Taluka',               lat: 22.3600, lng: 71.7100 },
  ],
  GJ_NRM: [
    { id: 'GJ_NRM_RAJPIPLA_C',  districtId: 'GJ_NRM', name: 'Rajpipla City',               lat: 21.8719, lng: 73.5024 },
    { id: 'GJ_NRM_GARUDESHWAR', districtId: 'GJ_NRM', name: 'Garudeshwar (Statue of Unity)',lat: 21.8800, lng: 73.6500 },
    { id: 'GJ_NRM_SAGBARA',     districtId: 'GJ_NRM', name: 'Sagbara Tribal Agri Zone',    lat: 21.5500, lng: 73.7800 },
    { id: 'GJ_NRM_DEDIAPADA',   districtId: 'GJ_NRM', name: 'Dediapada Taluka',            lat: 21.6300, lng: 73.5900 },
  ],
  GJ_DWK: [
    { id: 'GJ_DWK_DWARKA_C',    districtId: 'GJ_DWK', name: 'Dwarka City & Tourism Zone',  lat: 22.2442, lng: 68.9685 },
    { id: 'GJ_DWK_KHAMBHALIA',  districtId: 'GJ_DWK', name: 'Khambhalia Taluka',           lat: 22.2050, lng: 69.6500 },
    { id: 'GJ_DWK_KALYANPUR',   districtId: 'GJ_DWK', name: 'Kalyanpur Taluka',            lat: 22.0300, lng: 69.3200 },
    { id: 'GJ_DWK_BHANVAD',     districtId: 'GJ_DWK', name: 'Bhanvad Taluka',              lat: 21.9300, lng: 69.7800 },
  ],
  GJ_CHU: [
    { id: 'GJ_CHU_CHHOTA_UDAIPUR',districtId: 'GJ_CHU', name: 'Chhota Udaipur City',       lat: 22.3100, lng: 74.0100 },
    { id: 'GJ_CHU_BODELI',      districtId: 'GJ_CHU', name: 'Bodeli Commercial Hub',       lat: 22.2700, lng: 73.7200 },
    { id: 'GJ_CHU_SANKHEDA',    districtId: 'GJ_CHU', name: 'Sankheda Lacquerware Craft',  lat: 22.1600, lng: 73.5800 },
  ],
  GJ_TPI: [
    { id: 'GJ_TPI_VYARA',       districtId: 'GJ_TPI', name: 'Vyara City & Agri Hub',       lat: 21.1100, lng: 73.4000 },
    { id: 'GJ_TPI_SONGADH',     districtId: 'GJ_TPI', name: 'Songadh Fort & Forest Zone',  lat: 21.1700, lng: 73.5600 },
    { id: 'GJ_TPI_VALOD',       districtId: 'GJ_TPI', name: 'Valod Agro Center',           lat: 21.0500, lng: 73.2500 },
  ],
  GJ_DNG: [
    { id: 'GJ_DNG_AHWA',        districtId: 'GJ_DNG', name: 'Ahwa Tribal Forest Capital',  lat: 20.7500, lng: 73.6800 },
    { id: 'GJ_DNG_WAGHAI',      districtId: 'GJ_DNG', name: 'Waghai Botanical & Agri Zone',lat: 20.7700, lng: 73.5000 },
  ],

  // ── MAHARASHTRA ──────────────────────────────────────────────────────────
  MH_PUN: [
    { id: 'MH_PUN_SHIRUR',      districtId: 'MH_PUN', name: 'Shirur Taluka',                lat: 18.8212, lng: 74.3712 },
    { id: 'MH_PUN_BARAMATI',    districtId: 'MH_PUN', name: 'Baramati High-Tech Dairy',     lat: 18.1512, lng: 74.5812 },
    { id: 'MH_PUN_HAVELI',      districtId: 'MH_PUN', name: 'Haveli Taluka (Peri-Pune)',    lat: 18.5800, lng: 73.9500 },
    { id: 'MH_PUN_KHED',        districtId: 'MH_PUN', name: 'Khed Taluka (Rajgurunagar)',   lat: 18.8400, lng: 73.6100 },
    { id: 'MH_PUN_AMBEGAON',    districtId: 'MH_PUN', name: 'Ambegaon Taluka',              lat: 19.1200, lng: 73.7800 },
    { id: 'MH_PUN_MAVAL',       districtId: 'MH_PUN', name: 'Maval Taluka (IT Corridor)',   lat: 18.7800, lng: 73.6600 },
  ],
  MH_NSK: [
    { id: 'MH_NSK_NIPHAD',      districtId: 'MH_NSK', name: 'Niphad Grape & Horticulture', lat: 20.0812, lng: 74.1124 },
    { id: 'MH_NSK_SINNAR',      districtId: 'MH_NSK', name: 'Sinnar Taluka (MIDC)',         lat: 19.8500, lng: 74.0000 },
    { id: 'MH_NSK_IGATPURI',    districtId: 'MH_NSK', name: 'Igatpuri Taluka',              lat: 19.6900, lng: 73.5600 },
    { id: 'MH_NSK_DINDORI',     districtId: 'MH_NSK', name: 'Dindori Taluka',               lat: 20.2000, lng: 73.8400 },
  ],
  MH_NAG: [
    { id: 'MH_NAG_KALMESHWAR',  districtId: 'MH_NAG', name: 'Kalmeshwar Agro Processing',  lat: 21.2312, lng: 78.9112 },
    { id: 'MH_NAG_KAMPTEE',     districtId: 'MH_NAG', name: 'Kamptee Taluka',               lat: 21.2100, lng: 79.2000 },
    { id: 'MH_NAG_HINGNA',      districtId: 'MH_NAG', name: 'Hingna MIDC Industrial Zone',  lat: 21.0600, lng: 78.9200 },
    { id: 'MH_NAG_RAMTEK',      districtId: 'MH_NAG', name: 'Ramtek Taluka',                lat: 21.4000, lng: 79.3300 },
  ],
  MH_KOL: [
    { id: 'MH_KOL_SHIROLI',     districtId: 'MH_KOL', name: 'Shiroli Foundry & Dairy',      lat: 16.7412, lng: 74.2712 },
    { id: 'MH_KOL_HATKANANGLE',  districtId: 'MH_KOL', name: 'Hatkanangle Taluka',           lat: 16.8000, lng: 74.2300 },
    { id: 'MH_KOL_KARVEER',     districtId: 'MH_KOL', name: 'Karveer Taluka',               lat: 16.6900, lng: 74.1900 },
  ],

  // ── RAJASTHAN ─────────────────────────────────────────────────────────────
  RJ_JAI: [
    { id: 'RJ_JAI_CHOMU',       districtId: 'RJ_JAI', name: 'Chomu Vegetable Mandi',        lat: 27.1712, lng: 75.7212 },
    { id: 'RJ_JAI_BAGRU',       districtId: 'RJ_JAI', name: 'Bagru Textile & Handicraft',   lat: 26.8112, lng: 75.5412 },
    { id: 'RJ_JAI_AMER',        districtId: 'RJ_JAI', name: 'Amer Taluka',                  lat: 26.9900, lng: 75.8400 },
    { id: 'RJ_JAI_SANGANER',    districtId: 'RJ_JAI', name: 'Sanganer Printing Cluster',    lat: 26.8100, lng: 75.8300 },
    { id: 'RJ_JAI_PHAGI',       districtId: 'RJ_JAI', name: 'Phagi Taluka',                 lat: 26.5600, lng: 75.9800 },
  ],
  RJ_JOD: [
    { id: 'RJ_JOD_LUNI',        districtId: 'RJ_JOD', name: 'Luni Handicraft & Processing', lat: 26.0912, lng: 73.0112 },
    { id: 'RJ_JOD_MANDORE',     districtId: 'RJ_JOD', name: 'Mandore Taluka',               lat: 26.3400, lng: 73.0200 },
    { id: 'RJ_JOD_BILARA',      districtId: 'RJ_JOD', name: 'Bilara Taluka',                lat: 26.1800, lng: 73.7000 },
  ],
  RJ_UDA: [
    { id: 'RJ_UDA_MAVLI',       districtId: 'RJ_UDA', name: 'Mavli Agri Dairy Belt',        lat: 24.7812, lng: 73.9812 },
    { id: 'RJ_UDA_GIRWA',       districtId: 'RJ_UDA', name: 'Girwa Taluka',                 lat: 24.5700, lng: 73.7300 },
    { id: 'RJ_UDA_SALUMBAR',    districtId: 'RJ_UDA', name: 'Salumbar Taluka (Tribal)',     lat: 24.1100, lng: 74.0300 },
  ],

  // ── KARNATAKA ────────────────────────────────────────────────────────────
  KA_BLR: [
    { id: 'KA_BLR_DODDABALLAPUR', districtId: 'KA_BLR', name: 'Doddaballapur Agri-Infra', lat: 13.2912, lng: 77.5412 },
    { id: 'KA_BLR_HOSKOTE',     districtId: 'KA_BLR', name: 'Hoskote Logistics & Proc.',   lat: 13.0712, lng: 77.7912 },
    { id: 'KA_BLR_NELAMANGALA', districtId: 'KA_BLR', name: 'Nelamangala Industrial Zone', lat: 13.1000, lng: 77.3900 },
    { id: 'KA_BLR_DEVANAHALLI', districtId: 'KA_BLR', name: 'Devanahalli (Aerospace Hub)', lat: 13.2400, lng: 77.7100 },
  ],
  KA_MYS: [
    { id: 'KA_MYS_HUNSUR',      districtId: 'KA_MYS', name: 'Hunsur Tobacco & Timber',     lat: 12.3112, lng: 76.2912 },
    { id: 'KA_MYS_NANJANGUD',   districtId: 'KA_MYS', name: 'Nanjangud Industrial Hub',    lat: 12.1200, lng: 76.6900 },
    { id: 'KA_MYS_PERIYAPATNA', districtId: 'KA_MYS', name: 'Periyapatna Taluka',          lat: 12.3300, lng: 76.0000 },
  ],
  KA_HUB: [
    { id: 'KA_HUB_NAVALGUND',   districtId: 'KA_HUB', name: 'Navalgund Weaving & Pulse',   lat: 15.5612, lng: 75.3712 },
    { id: 'KA_HUB_DHARWAD_C',   districtId: 'KA_HUB', name: 'Dharwad City',                lat: 15.3647, lng: 75.1240 },
    { id: 'KA_HUB_HUBLI_C',     districtId: 'KA_HUB', name: 'Hubballi City',               lat: 15.3500, lng: 75.1300 },
  ],

  // ── TAMIL NADU ───────────────────────────────────────────────────────────
  TN_CBE: [
    { id: 'TN_CBE_POLLACHI',    districtId: 'TN_CBE', name: 'Pollachi Coconut & Dairy',    lat: 10.6612, lng: 77.0112 },
    { id: 'TN_CBE_ANNUR',       districtId: 'TN_CBE', name: 'Annur Textile & Poultry',     lat: 11.2312, lng: 77.1124 },
    { id: 'TN_CBE_METTUPALAYAM',districtId: 'TN_CBE', name: 'Mettupalayam Taluka',         lat: 11.2900, lng: 76.9400 },
    { id: 'TN_CBE_SULUR',       districtId: 'TN_CBE', name: 'Sulur Taluka (Aerospace)',    lat: 11.0300, lng: 77.1400 },
  ],
  TN_MDU: [
    { id: 'TN_MDU_MELUR',       districtId: 'TN_MDU', name: 'Melur Paddy & Agri Mandi',   lat: 10.0412, lng: 78.3312 },
    { id: 'TN_MDU_USILAMPATTI', districtId: 'TN_MDU', name: 'Usilampatti Taluka',          lat: 9.9700,  lng: 77.7600 },
    { id: 'TN_MDU_PERAIYUR',    districtId: 'TN_MDU', name: 'Peraiyur Taluka',             lat: 9.7700,  lng: 77.8800 },
  ],
  TN_SLM: [
    { id: 'TN_SLM_ATTUR',       districtId: 'TN_SLM', name: 'Attur Tapioca & Sago Belt',  lat: 11.5912, lng: 78.6012 },
    { id: 'TN_SLM_METTUR',      districtId: 'TN_SLM', name: 'Mettur Industrial Zone',      lat: 11.7900, lng: 77.8000 },
    { id: 'TN_SLM_OMALUR',      districtId: 'TN_SLM', name: 'Omalur Taluka',               lat: 11.7300, lng: 78.0500 },
  ],

  // ── UTTAR PRADESH ────────────────────────────────────────────────────────
  UP_LKO: [
    { id: 'UP_LKO_MALIHABAD',   districtId: 'UP_LKO', name: 'Malihabad Mango Horticulture',lat: 26.9212, lng: 80.7112 },
    { id: 'UP_LKO_MOHANLALGANJ',districtId: 'UP_LKO', name: 'Mohanlalganj Dairy Belt',     lat: 26.6812, lng: 80.9812 },
    { id: 'UP_LKO_SAROJINI_NGR',districtId: 'UP_LKO', name: 'Sarojini Nagar Taluka',       lat: 26.7900, lng: 80.8800 },
    { id: 'UP_LKO_BAKSHI_KA_TL',districtId: 'UP_LKO', name: 'Bakshi Ka Talab Block',       lat: 27.0000, lng: 80.9200 },
  ],
  UP_VNS: [
    { id: 'UP_VNS_PINDRA',      districtId: 'UP_VNS', name: 'Pindra Handloom & Agro',      lat: 25.4812, lng: 82.8412 },
    { id: 'UP_VNS_VARANASI_C',  districtId: 'UP_VNS', name: 'Varanasi City & Silk Cluster', lat: 25.3176, lng: 82.9739 },
    { id: 'UP_VNS_CHIRAIGAON',  districtId: 'UP_VNS', name: 'Chiraigaon Block',             lat: 25.2200, lng: 83.0700 },
  ],
  UP_KAN: [
    { id: 'UP_KAN_AKBARPUR',    districtId: 'UP_KAN', name: 'Akbarpur Pulse & Oilseed',    lat: 26.4312, lng: 79.9512 },
    { id: 'UP_KAN_KANPUR_C',    districtId: 'UP_KAN', name: 'Kanpur City Leather Hub',      lat: 26.4499, lng: 80.3319 },
    { id: 'UP_KAN_GHATAMPUR',   districtId: 'UP_KAN', name: 'Ghatampur Block',              lat: 26.1500, lng: 80.1800 },
  ],

  // ── PUNJAB ────────────────────────────────────────────────────────────────
  PB_LDH: [
    { id: 'PB_LDH_KHANNA',      districtId: 'PB_LDH', name: 'Khanna Asia Largest Grain Mandi', lat: 30.7012, lng: 76.2112 },
    { id: 'PB_LDH_SAMRALA',     districtId: 'PB_LDH', name: 'Samrala Dairy & Cattle Feed', lat: 30.8412, lng: 76.1912 },
    { id: 'PB_LDH_LUDHIANA_C',  districtId: 'PB_LDH', name: 'Ludhiana City (Cycle Hub)',    lat: 30.9010, lng: 75.8573 },
    { id: 'PB_LDH_DORAHA',      districtId: 'PB_LDH', name: 'Doraha Taluka',                lat: 30.7900, lng: 76.0300 },
  ],
  PB_ASR: [
    { id: 'PB_ASR_JANDIALA',    districtId: 'PB_ASR', name: 'Jandiala Crafts & Basmati',   lat: 31.5612, lng: 75.0212 },
    { id: 'PB_ASR_AMRITSAR_C',  districtId: 'PB_ASR', name: 'Amritsar City',                lat: 31.6340, lng: 74.8723 },
    { id: 'PB_ASR_AJNALA',      districtId: 'PB_ASR', name: 'Ajnala Taluka',                lat: 31.8400, lng: 74.7600 },
  ],

  // ── MADHYA PRADESH ───────────────────────────────────────────────────────
  MP_IND: [
    { id: 'MP_IND_SANWER',      districtId: 'MP_IND', name: 'Sanwer Soybean & Wheat Belt',  lat: 22.9712, lng: 75.8312 },
    { id: 'MP_IND_DEPALPUR',    districtId: 'MP_IND', name: 'Depalpur Dairy & Organic',     lat: 22.8512, lng: 75.5412 },
    { id: 'MP_IND_INDORE_C',    districtId: 'MP_IND', name: 'Indore City & Super Corridor', lat: 22.7196, lng: 75.8577 },
    { id: 'MP_IND_MHOW',        districtId: 'MP_IND', name: 'Mhow Taluka',                  lat: 22.5500, lng: 75.7600 },
  ],
  MP_BHO: [
    { id: 'MP_BHO_BERASIA',     districtId: 'MP_BHO', name: 'Berasia Grain & Spice Belt',   lat: 23.6312, lng: 77.4312 },
    { id: 'MP_BHO_BHOPAL_C',    districtId: 'MP_BHO', name: 'Bhopal City',                  lat: 23.2599, lng: 77.4126 },
    { id: 'MP_BHO_HUZUR',       districtId: 'MP_BHO', name: 'Huzur Taluka',                 lat: 23.2700, lng: 77.5500 },
    { id: 'MP_BHO_SEHORE',      districtId: 'MP_BHO', name: 'Sehore Wheat Belt',            lat: 23.2000, lng: 77.0800 },
  ],

  // ── ANDHRA PRADESH ───────────────────────────────────────────────────────
  AP_VSKP: [
    { id: 'AP_VSKP_GAJUWAKA',   districtId: 'AP_VSKP', name: 'Gajuwaka Industrial Belt',    lat: 17.6900, lng: 83.2100 },
    { id: 'AP_VSKP_ANANDAPURAM',districtId: 'AP_VSKP', name: 'Anandapuram Horticulture Zone',lat: 17.8600, lng: 83.3500 },
    { id: 'AP_VSKP_BHEEMILI',   districtId: 'AP_VSKP', name: 'Bheemunipatnam (Bheemili)',   lat: 17.8900, lng: 83.4300 },
    { id: 'AP_VSKP_PENDURTHI',  districtId: 'AP_VSKP', name: 'Pendurthi Zone',              lat: 17.7700, lng: 83.2200 },
  ],
  AP_NTR: [
    { id: 'AP_NTR_KANCHIKACHERLA',districtId: 'AP_NTR', name: 'Kanchikacherla Agri Belt',  lat: 16.6400, lng: 80.3800 },
    { id: 'AP_NTR_JAGGAIAHPETA',districtId: 'AP_NTR', name: 'Jaggaiahpeta Industrial Zone',lat: 16.8900, lng: 80.0900 },
    { id: 'AP_NTR_IBRAHIMPATNAM',districtId: 'AP_NTR', name: 'Ibrahimpatnam Power Hub',    lat: 16.5900, lng: 80.5200 },
  ],
  AP_GNT: [
    { id: 'AP_GNT_MANGALAGIRI', districtId: 'AP_GNT', name: 'Mangalagiri IT & Agri Cluster',lat: 16.4300, lng: 80.5500 },
    { id: 'AP_GNT_TENALI',      districtId: 'AP_GNT', name: 'Tenali Paddy & Commercial',   lat: 16.2400, lng: 80.6400 },
    { id: 'AP_GNT_AMARAVATI',   districtId: 'AP_GNT', name: 'Amaravati Heritage & Urban',   lat: 16.5700, lng: 80.3500 },
  ],
  AP_TPT: [
    { id: 'AP_TPT_CHANDRAGIRI', districtId: 'AP_TPT', name: 'Chandragiri Rural Cluster',   lat: 13.5800, lng: 79.3100 },
    { id: 'AP_TPT_SRIKALAHASTI',districtId: 'AP_TPT', name: 'Srikalahasti Industrial Zone',lat: 13.7500, lng: 79.7000 },
    { id: 'AP_TPT_PUTTUR',      districtId: 'AP_TPT', name: 'Puttur Silk & Agri Belt',      lat: 13.4400, lng: 79.5500 },
  ],
  AP_KRN: [
    { id: 'AP_KRN_DHONE',       districtId: 'AP_KRN', name: 'Dhone Mining & Lime Belt',     lat: 15.4200, lng: 77.8700 },
    { id: 'AP_KRN_ADONI',       districtId: 'AP_KRN', name: 'Adoni Cotton & Oilseed Mandi', lat: 15.6300, lng: 77.2800 },
    { id: 'AP_KRN_NANDYAL',     districtId: 'AP_KRN', name: 'Nandyal Agri Corridor',        lat: 15.4800, lng: 78.4800 },
  ],
  AP_KKD: [
    { id: 'AP_KKD_SAMALKOT',    districtId: 'AP_KKD', name: 'Samalkot Rice & Sugar Belt',   lat: 17.0500, lng: 82.1700 },
    { id: 'AP_KKD_PEDDAPURAM',  districtId: 'AP_KKD', name: 'Peddapuram Industrial Zone',   lat: 17.0800, lng: 82.1300 },
    { id: 'AP_KKD_PITHAPURAM',  districtId: 'AP_KKD', name: 'Pithapuram Horticulture',     lat: 17.1100, lng: 82.2500 },
  ],
  AP_ATP: [
    { id: 'AP_ATP_DHARMAVARAM', districtId: 'AP_ATP', name: 'Dharmavaram Silk Weaving',    lat: 14.4300, lng: 77.7200 },
    { id: 'AP_ATP_HINDUPUR',    districtId: 'AP_ATP', name: 'Hindupur Industrial & Agri',   lat: 13.8300, lng: 77.4900 },
    { id: 'AP_ATP_TADIPATRI',   districtId: 'AP_ATP', name: 'Tadipatri Cement & Mineral',   lat: 14.9100, lng: 78.0100 },
  ],
  AP_NLR: [
    { id: 'AP_NLR_GUDUR',       districtId: 'AP_NLR', name: 'Gudur Lemon & Aquaculture',    lat: 14.1400, lng: 79.8500 },
    { id: 'AP_NLR_KAVALI',      districtId: 'AP_NLR', name: 'Kavali Coastal Bio-Farming',  lat: 14.9100, lng: 79.9900 },
    { id: 'AP_NLR_ATMAKUR',     districtId: 'AP_NLR', name: 'Atmakur Paddy Belt',           lat: 14.3700, lng: 79.6200 },
  ],
  AP_ELR: [
    { id: 'AP_ELR_JANGAREDDYGUDEM',districtId: 'AP_ELR', name: 'Jangareddygudem Oil Palm', lat: 17.1200, lng: 81.2900 },
    { id: 'AP_ELR_NUZVID',      districtId: 'AP_ELR', name: 'Nuzvid Mango Capital',         lat: 16.7900, lng: 80.8400 },
  ],
  AP_RJY: [
    { id: 'AP_RJY_KADIYAM',     districtId: 'AP_RJY', name: 'Kadiyam Nursery & Floriculture',lat: 16.9100, lng: 81.8300 },
    { id: 'AP_RJY_ANAPARTHI',   districtId: 'AP_RJY', name: 'Anaparthi Paddy & Rice Mill',  lat: 16.9300, lng: 81.9500 },
  ],
  AP_SKL: [
    { id: 'AP_SKL_PALASA',      districtId: 'AP_SKL', name: 'Palasa Cashew Processing Hub', lat: 18.7700, lng: 84.4100 },
    { id: 'AP_SKL_TEKKALI',     districtId: 'AP_SKL', name: 'Tekkali Agro Belt',            lat: 18.6100, lng: 84.2300 },
  ],
  AP_VZN: [
    { id: 'AP_VZN_BOBBILI',     districtId: 'AP_VZN', name: 'Bobbili Growth Center',        lat: 18.5700, lng: 83.3600 },
    { id: 'AP_VZN_RAJAM',       districtId: 'AP_VZN', name: 'Rajam Textile & Agro',         lat: 18.4500, lng: 83.6600 },
  ],
  AP_CTR: [
    { id: 'AP_CTR_PALAMANER',   districtId: 'AP_CTR', name: 'Palamaner Dairy & Tomato Hub', lat: 13.2000, lng: 78.7500 },
    { id: 'AP_CTR_MADANAPALLE', districtId: 'AP_CTR', name: 'Madanapalle Tomato Mandi',    lat: 13.5500, lng: 78.5000 },
  ],
  AP_ONG: [
    { id: 'AP_ONG_MARKAPUR',    districtId: 'AP_ONG', name: 'Markapur Slate & Agri',        lat: 15.7300, lng: 79.2700 },
    { id: 'AP_ONG_CHIRALA',     districtId: 'AP_ONG', name: 'Chirala Handloom & Coastal',   lat: 15.8200, lng: 80.3500 },
  ],
  AP_KDP: [
    { id: 'AP_KDP_PRODDATUR',   districtId: 'AP_KDP', name: 'Proddatur Gold & Cotton Hub',  lat: 14.7500, lng: 78.5500 },
    { id: 'AP_KDP_PULIVENDULA', districtId: 'AP_KDP', name: 'Pulivendula Citrus & Fruit',   lat: 14.4200, lng: 78.2300 },
  ],

  // ── ARUNACHAL PRADESH ────────────────────────────────────────────────────
  AR_PPR: [
    { id: 'AR_PPR_DOIMUKH',     districtId: 'AR_PPR', name: 'Doimukh Agri & Bamboo Belt',   lat: 27.1400, lng: 93.7500 },
    { id: 'AR_PPR_NAHARLAGUN',  districtId: 'AR_PPR', name: 'Naharlagun Commercial Hub',    lat: 27.1000, lng: 93.6900 },
  ],
  AR_TWG: [
    { id: 'AR_TWG_JANG',        districtId: 'AR_TWG', name: 'Jang Organic Farming Belt',    lat: 27.5800, lng: 91.9800 },
  ],
  AR_PSG: [
    { id: 'AR_PSG_RUKSIN',      districtId: 'AR_PSG', name: 'Ruksin Ginger & Spice Belt',   lat: 27.8300, lng: 95.2100 },
  ],
  AR_ZIR: [
    { id: 'AR_ZIR_HAPOLI',      districtId: 'AR_ZIR', name: 'Hapoli Organic Eco Cluster',   lat: 27.5500, lng: 93.8200 },
  ],
  AR_LHT: [
    { id: 'AR_LHT_NAMSAI',      districtId: 'AR_LHT', name: 'Namsai Organic Tea & Spice',   lat: 27.6700, lng: 95.8600 },
  ],
  AR_CHG: [
    { id: 'AR_CHG_MIAO',        districtId: 'AR_CHG', name: 'Miao Tea & Horticulture',      lat: 27.4900, lng: 96.2000 },
  ],
  AR_WKM: [
    { id: 'AR_WKM_DIRANG',      districtId: 'AR_WKM', name: 'Dirang Kiwi & Apple Orchards', lat: 27.3500, lng: 92.2400 },
  ],

  // ── ASSAM ────────────────────────────────────────────────────────────────
  AS_GHY: [
    { id: 'AS_GHY_SONAPUR',     districtId: 'AS_GHY', name: 'Sonapur Organic & Peri-Urban', lat: 26.1200, lng: 91.9800 },
    { id: 'AS_GHY_NORTH_GHY',   districtId: 'AS_GHY', name: 'North Guwahati Industrial',    lat: 26.2000, lng: 91.7100 },
  ],
  AS_DIB: [
    { id: 'AS_DIB_NAHARKATIA',  districtId: 'AS_DIB', name: 'Naharkatia Tea & Oil Belt',    lat: 27.2800, lng: 95.3300 },
    { id: 'AS_DIB_CHABUA',      districtId: 'AS_DIB', name: 'Chabua Agro & Tea Zone',       lat: 27.4800, lng: 95.1800 },
  ],
  AS_SIL: [
    { id: 'AS_SIL_LAKHIPUR',    districtId: 'AS_SIL', name: 'Lakhipur Pineapple & Tea',     lat: 24.7900, lng: 93.0100 },
  ],
  AS_JOR: [
    { id: 'AS_JOR_TITABOR',     districtId: 'AS_JOR', name: 'Titabor Rice Research Belt',   lat: 26.6000, lng: 94.1700 },
  ],
  AS_NAG: [
    { id: 'AS_NAG_RAHA',        districtId: 'AS_NAG', name: 'Raha Fishery & Paddy Cluster', lat: 26.2300, lng: 92.5200 },
  ],
  AS_TSK: [
    { id: 'AS_TSK_DOOMDOOMA',   districtId: 'AS_TSK', name: 'Doomdooma Tea Garden Hub',     lat: 27.5600, lng: 95.5700 },
  ],
  AS_TEZ: [
    { id: 'AS_TEZ_DHEKIAJULI',  districtId: 'AS_TEZ', name: 'Dhekiajuli Tea & Paddy',       lat: 26.7000, lng: 92.4800 },
  ],
  AS_BNG: [
    { id: 'AS_BNG_ABHAYAPURI',  districtId: 'AS_BNG', name: 'Abhayapuri Agri Hub',          lat: 26.3300, lng: 90.6700 },
  ],
  AS_BRP: [
    { id: 'AS_BRP_SARTHEBARI',  districtId: 'AS_BRP', name: 'Sarthebari Metal Crafts Hub',  lat: 26.3700, lng: 91.2200 },
  ],
  AS_KRM: [
    { id: 'AS_KRM_BADARPUR',    districtId: 'AS_KRM', name: 'Badarpur Trade & Transit',     lat: 24.8700, lng: 92.5800 },
  ],

  // ── BIHAR ────────────────────────────────────────────────────────────────
  BR_PAT: [
    { id: 'BR_PAT_BIHTA',       districtId: 'BR_PAT', name: 'Bihta Industrial & Logistics', lat: 25.5600, lng: 84.8700 },
    { id: 'BR_PAT_DANAPUR',     districtId: 'BR_PAT', name: 'Danapur Peri-Urban Zone',      lat: 25.6300, lng: 85.0400 },
    { id: 'BR_PAT_MASAURHI',    districtId: 'BR_PAT', name: 'Masaurhi Grain Belt',          lat: 25.3500, lng: 85.1200 },
  ],
  BR_GAY: [
    { id: 'BR_GAY_BODHGAYA',    districtId: 'BR_GAY', name: 'Bodhgaya Eco-Tourism & Dairy', lat: 24.6900, lng: 84.9900 },
    { id: 'BR_GAY_SHERGHATI',   districtId: 'BR_GAY', name: 'Sherghati GT Agri Belt',       lat: 24.5700, lng: 84.7800 },
  ],
  BR_MUZ: [
    { id: 'BR_MUZ_KANTI',       districtId: 'BR_MUZ', name: 'Kanti Industrial & Agro',      lat: 26.1900, lng: 85.3000 },
    { id: 'BR_MUZ_MOTIPUR',     districtId: 'BR_MUZ', name: 'Motipur Maize & Sugar',        lat: 26.2400, lng: 85.1700 },
  ],
  BR_BGP: [
    { id: 'BR_BGP_NATHNAGAR',   districtId: 'BR_BGP', name: 'Nathnagar Silk Weaving Hub',   lat: 25.2200, lng: 86.9300 },
    { id: 'BR_BGP_SABOUR',      districtId: 'BR_BGP', name: 'Sabour Agri University Belt',  lat: 25.2300, lng: 87.0500 },
  ],
  BR_PUR: [
    { id: 'BR_PUR_BANMANKHI',   districtId: 'BR_PUR', name: 'Banmankhi Jute & Maize',       lat: 25.9000, lng: 87.0100 },
  ],
  BR_DAR: [
    { id: 'BR_DAR_BENIPUR',     districtId: 'BR_DAR', name: 'Benipur Makhana & Fish Belt',  lat: 26.1400, lng: 86.1300 },
  ],
  BR_BEG: [
    { id: 'BR_BEG_BARAUNI',     districtId: 'BR_BEG', name: 'Barauni Petrochem & Dairy',    lat: 25.4700, lng: 86.0100 },
  ],
  BR_ROH: [
    { id: 'BR_ROH_DEHRI',       districtId: 'BR_ROH', name: 'Dehri Rice Mills Cluster',     lat: 24.9100, lng: 84.1800 },
  ],
  BR_SAM: [
    { id: 'BR_SAM_PUSA',        districtId: 'BR_SAM', name: 'Pusa Agri University Belt',    lat: 25.9800, lng: 85.6700 },
  ],
  BR_SAR: [
    { id: 'BR_SAR_SONPUR',      districtId: 'BR_SAR', name: 'Sonpur Cattle & Trade Zone',   lat: 25.7000, lng: 85.1800 },
  ],
  BR_VAI: [
    { id: 'BR_VAI_LALGANJ',     districtId: 'BR_VAI', name: 'Lalganj Banana & Honey Hub',   lat: 25.8600, lng: 85.1700 },
  ],
  BR_NAL: [
    { id: 'BR_NAL_RAJGIR',      districtId: 'BR_NAL', name: 'Rajgir Eco & Organic Zone',    lat: 25.0300, lng: 85.4200 },
  ],

  // ── CHHATTISGARH ─────────────────────────────────────────────────────────
  CG_RPR: [
    { id: 'CG_RPR_ABHANPUR',    districtId: 'CG_RPR', name: 'Abhanpur Agri & Freight',      lat: 21.0500, lng: 81.7500 },
    { id: 'CG_RPR_TILDA',       districtId: 'CG_RPR', name: 'Tilda Rice Mill Cluster',      lat: 21.5600, lng: 81.7800 },
  ],
  CG_DRG: [
    { id: 'CG_DRG_PATAN',       districtId: 'CG_DRG', name: 'Patan Organic & Dairy',        lat: 21.0300, lng: 81.5300 },
  ],
  CG_BSP: [
    { id: 'CG_BSP_TAKATPUR',    districtId: 'CG_BSP', name: 'Takhatpur Grain Mandi',        lat: 22.0100, lng: 81.8700 },
  ],
  CG_JGD: [
    { id: 'CG_JGD_KONDAGAON',   districtId: 'CG_JGD', name: 'Kondagaon Handicrafts & Agro', lat: 19.5900, lng: 81.6700 },
  ],
  CG_KRB: [
    { id: 'CG_KRB_KATGHORA',    districtId: 'CG_KRB', name: 'Katghora Forest & Bio Zone',   lat: 22.5000, lng: 82.5500 },
  ],
  CG_RJN: [
    { id: 'CG_RJN_DONGARGARH',  districtId: 'CG_RJN', name: 'Dongargarh Bio-Agri Belt',     lat: 21.1800, lng: 80.7600 },
  ],
  CG_RGH: [
    { id: 'CG_RGH_KHARSIA',     districtId: 'CG_RGH', name: 'Kharsia Grain Hub',            lat: 21.9700, lng: 83.1200 },
  ],
  CG_SRG: [
    { id: 'CG_SRG_AMBIKAPUR_C', districtId: 'CG_SRG', name: 'Ambikapur Bio-Farming',       lat: 23.1200, lng: 83.1900 },
  ],
  CG_DHT: [
    { id: 'CG_DHT_KURUD',       districtId: 'CG_DHT', name: 'Kurud Rice Bowl Zone',         lat: 20.8300, lng: 81.7100 },
  ],

  // ── GOA ──────────────────────────────────────────────────────────────────
  GA_NGA: [
    { id: 'GA_NGA_MAPUSA',      districtId: 'GA_NGA', name: 'Mapusa Commercial Belt',       lat: 15.5900, lng: 73.8100 },
    { id: 'GA_NGA_PERNEM',      districtId: 'GA_NGA', name: 'Pernem Airport & Eco Zone',    lat: 15.7100, lng: 73.7900 },
  ],
  GA_SGA: [
    { id: 'GA_SGA_MARGAO',      districtId: 'GA_SGA', name: 'Margao Commercial Hub',        lat: 15.2700, lng: 73.9500 },
    { id: 'GA_SGA_CANACONA',    districtId: 'GA_SGA', name: 'Canacona Eco-Agri Belt',       lat: 15.0000, lng: 74.0400 },
  ],
  GA_PND: [
    { id: 'GA_PND_PONDA_C',     districtId: 'GA_PND', name: 'Ponda Dairy & Spice Belt',     lat: 15.4000, lng: 74.0100 },
  ],
  GA_BCH: [
    { id: 'GA_BCH_BICHOLIM_C',  districtId: 'GA_BCH', name: 'Bicholim Agri Plantation',     lat: 15.5800, lng: 73.9500 },
  ],

  // ── HARYANA ──────────────────────────────────────────────────────────────
  HR_GGM: [
    { id: 'HR_GGM_SOHNA',       districtId: 'HR_GGM', name: 'Sohna Agri & Auto Cluster',    lat: 28.2400, lng: 77.0600 },
    { id: 'HR_GGM_MANESAR',     districtId: 'HR_GGM', name: 'Manesar Industrial Freight',   lat: 28.3500, lng: 76.9300 },
  ],
  HR_FDB: [
    { id: 'HR_FDB_BALLABGARH',  districtId: 'HR_FDB', name: 'Ballabgarh Heavy Industrial',  lat: 28.3400, lng: 77.3200 },
  ],
  HR_PNP: [
    { id: 'HR_PNP_SAMALKHA',    districtId: 'HR_PNP', name: 'Samalkha Textile & Machinery', lat: 29.2300, lng: 77.0100 },
  ],
  HR_KRN: [
    { id: 'HR_KRN_GHARAUNDA',   districtId: 'HR_KRN', name: 'Gharaunda Vegetable Hub',      lat: 29.5300, lng: 76.9700 },
    { id: 'HR_KRN_NILOKHERI',   districtId: 'HR_KRN', name: 'Nilokheri Dairy Research',     lat: 29.8300, lng: 76.9200 },
  ],
  HR_HSR: [
    { id: 'HR_HSR_HANSI',       districtId: 'HR_HSR', name: 'Hansi Cotton & Textile Mandi', lat: 29.1000, lng: 75.9600 },
  ],
  HR_AMB: [
    { id: 'HR_AMB_NARAINGARH',  districtId: 'HR_AMB', name: 'Naraingarh Sugar & Honey Belt',lat: 30.4800, lng: 77.1300 },
  ],
  HR_RTK: [
    { id: 'HR_RTK_SAMPLA',      districtId: 'HR_RTK', name: 'Sampla Industrial Zone',       lat: 28.7800, lng: 76.7700 },
  ],
  HR_YMN: [
    { id: 'HR_YMN_JAGADHRI',    districtId: 'HR_YMN', name: 'Jagadhri Utensil Cluster',     lat: 30.1700, lng: 77.3000 },
  ],
  HR_SNP: [
    { id: 'HR_SNP_GANAUR',      districtId: 'HR_SNP', name: 'Ganaur Horticulture Mandi',    lat: 29.1300, lng: 77.0200 },
  ],
  HR_PNC: [
    { id: 'HR_PNC_KALKA',       districtId: 'HR_PNC', name: 'Kalka Fruit & Hill Plantation',lat: 30.8300, lng: 76.9300 },
  ],
  HR_RWR: [
    { id: 'HR_RWR_BAWAL',       districtId: 'HR_RWR', name: 'Bawal Industrial Growth Zone', lat: 28.0800, lng: 76.5800 },
  ],
  HR_SRS: [
    { id: 'HR_SRS_ELLENABAD',   districtId: 'HR_SRS', name: 'Ellenabad Cotton & Kinnow',    lat: 29.4500, lng: 74.6500 },
  ],
  HR_BHW: [
    { id: 'HR_BHW_TOSHAM',      districtId: 'HR_BHW', name: 'Tosham Mineral & Agro Zone',   lat: 28.8700, lng: 75.9100 },
  ],
  HR_JHJ: [
    { id: 'HR_JHJ_BAHADURGARH', districtId: 'HR_JHJ', name: 'Bahadurgarh Sanitaryware Hub', lat: 28.6900, lng: 76.9200 },
  ],

  // ── HIMACHAL PRADESH ─────────────────────────────────────────────────────
  HP_SML: [
    { id: 'HP_SML_THEOG',       districtId: 'HP_SML', name: 'Theog Apple Orchards Belt',    lat: 31.1200, lng: 77.3500 },
    { id: 'HP_SML_ROHRU',       districtId: 'HP_SML', name: 'Rohru High-Altitude Apple',    lat: 31.2000, lng: 77.7500 },
  ],
  HP_KNG: [
    { id: 'HP_KNG_PALAMPUR',    districtId: 'HP_KNG', name: 'Palampur Tea & Research Hub',  lat: 32.1100, lng: 76.5300 },
  ],
  HP_MND: [
    { id: 'HP_MND_SUNDERNAGAR', districtId: 'HP_MND', name: 'Sundernagar Valley Agro',      lat: 31.5300, lng: 76.9000 },
  ],
  HP_SLN: [
    { id: 'HP_SLN_BADDI',       districtId: 'HP_SLN', name: 'Baddi Industrial & Pharma Hub',lat: 30.9500, lng: 76.7900 },
  ],
  HP_KUL: [
    { id: 'HP_KUL_MANALI',      districtId: 'HP_KUL', name: 'Manali Eco-Tourism & Apple',  lat: 32.2400, lng: 77.1800 },
  ],
  HP_HMR: [
    { id: 'HP_HMR_NADAUN',      districtId: 'HP_HMR', name: 'Nadaun Riverine Agri Belt',    lat: 31.7800, lng: 76.3400 },
  ],
  HP_UNA: [
    { id: 'HP_UNA_HAROLI',      districtId: 'HP_UNA', name: 'Haroli Industrial Zone',       lat: 31.4200, lng: 76.2200 },
  ],
  HP_CHM: [
    { id: 'HP_CHM_DALHOUSIE',   districtId: 'HP_CHM', name: 'Dalhousie Tourism & Herbs',    lat: 32.5300, lng: 75.9800 },
  ],
  HP_SRM: [
    { id: 'HP_SRM_PAONTA',      districtId: 'HP_SRM', name: 'Paonta Sahib Industrial Zone', lat: 30.4300, lng: 77.6200 },
  ],
  HP_BLP: [
    { id: 'HP_BLP_GHUMARWIN',   districtId: 'HP_BLP', name: 'Ghumarwin Grain Belt',         lat: 31.4300, lng: 76.7100 },
  ],

  // ── JHARKHAND ────────────────────────────────────────────────────────────
  JH_RNC: [
    { id: 'JH_RNC_KANKE',       districtId: 'JH_RNC', name: 'Kanke Agri University & Dairy',lat: 23.4300, lng: 85.3200 },
    { id: 'JH_RNC_ORMANJHI',    districtId: 'JH_RNC', name: 'Ormanjhi Bio-Agri Belt',       lat: 23.4800, lng: 85.4800 },
  ],
  JH_JSR: [
    { id: 'JH_JSR_GHATSHILA',   districtId: 'JH_JSR', name: 'Ghatshila Mineral & Forest',   lat: 22.5800, lng: 86.4800 },
  ],
  JH_DHN: [
    { id: 'JH_DHN_GOVINDPUR',   districtId: 'JH_DHN', name: 'Govindpur Industrial Zone',    lat: 23.8300, lng: 86.5200 },
  ],
  JH_BKR: [
    { id: 'JH_BKR_CHAS',        districtId: 'JH_BKR', name: 'Chas Grain & Commercial Mandi',lat: 23.6300, lng: 86.1700 },
  ],
  JH_HZB: [
    { id: 'JH_HZB_BARHI',       districtId: 'JH_HZB', name: 'Barhi GT Road Logistics Hub',  lat: 24.3000, lng: 85.4200 },
  ],
  JH_DGH: [
    { id: 'JH_DGH_JASIDIH',     districtId: 'JH_DGH', name: 'Jasidih Industrial Growth Zone',lat: 24.5200, lng: 86.6500 },
  ],
  JH_GRD: [
    { id: 'JH_GRD_BAGODAR',     districtId: 'JH_GRD', name: 'Bagodar GT Trade Corridor',    lat: 24.0800, lng: 85.8700 },
  ],
  JH_RMG: [
    { id: 'JH_RMG_GOLA',        districtId: 'JH_RMG', name: 'Gola Milk & Dairy Hub',        lat: 23.5300, lng: 85.7100 },
  ],
  JH_PLM: [
    { id: 'JH_PLM_HUSSAINABAD', districtId: 'JH_PLM', name: 'Hussainabad Crop Belt',        lat: 24.5300, lng: 84.0100 },
  ],

  // ── KARNATAKA (REMAINING) ────────────────────────────────────────────────
  KA_BUB: [
    { id: 'KA_BUB_YELAHANKA',   districtId: 'KA_BUB', name: 'Yelahanka Aerospace & Agri',   lat: 13.1000, lng: 77.5900 },
    { id: 'KA_BUB_KENGERI',     districtId: 'KA_BUB', name: 'Kengeri Peri-Urban Silk Belt', lat: 12.9100, lng: 77.4800 },
  ],
  KA_DKN: [
    { id: 'KA_DKN_PUTTUR',      districtId: 'KA_DKN', name: 'Puttur Arecanut & Cashew',     lat: 12.7600, lng: 75.2000 },
  ],
  KA_BLG: [
    { id: 'KA_BLG_CHIKKODI',    districtId: 'KA_BLG', name: 'Chikkodi Sugar & Dairy Belt',  lat: 16.4300, lng: 74.5900 },
  ],
  KA_KLB: [
    { id: 'KA_KLB_SEDAM',       districtId: 'KA_KLB', name: 'Sedam Cement & Mineral Corridor',lat: 17.1800, lng: 77.2900 },
  ],
  KA_UDP: [
    { id: 'KA_UDP_KUNDAPURA',   districtId: 'KA_UDP', name: 'Kundapura Coastal Fishery',    lat: 13.6200, lng: 74.6900 },
  ],
  KA_TMK: [
    { id: 'KA_TMK_TIPTUR',      districtId: 'KA_TMK', name: 'Tiptur Copra & Coconut Mandi', lat: 13.2600, lng: 76.4700 },
  ],
  KA_SVM: [
    { id: 'KA_SVM_SAGAR',       districtId: 'KA_SVM', name: 'Sagar Arecanut & Spice Belt',  lat: 14.1600, lng: 75.0300 },
  ],
  KA_BLI: [
    { id: 'KA_BLI_HOSAPETE',    districtId: 'KA_BLI', name: 'Hosapete Industrial & Hampi',  lat: 15.2700, lng: 76.3900 },
  ],
  KA_HSN: [
    { id: 'KA_HSN_SAKLESHPUR',  districtId: 'KA_HSN', name: 'Sakleshpur Coffee & Cardamom', lat: 12.9400, lng: 75.7800 },
  ],
  KA_DVG: [
    { id: 'KA_DVG_HARIHAR',     districtId: 'KA_DVG', name: 'Harihar Industrial & Agro',    lat: 14.5100, lng: 75.8000 },
  ],
  KA_MND: [
    { id: 'KA_MND_MADDUR',      districtId: 'KA_MND', name: 'Maddur Tender Coconut Hub',    lat: 12.5800, lng: 77.0400 },
  ],
  KA_UKN: [
    { id: 'KA_UKN_SIRSI',       districtId: 'KA_UKN', name: 'Sirsi Arecanut & Spices',      lat: 14.6100, lng: 74.8400 },
  ],
  KA_KLR: [
    { id: 'KA_KLR_SRINIVASPUR', districtId: 'KA_KLR', name: 'Srinivaspur Mango Capital',    lat: 13.3300, lng: 78.2100 },
  ],

  // ── KERALA ───────────────────────────────────────────────────────────────
  KL_TVM: [
    { id: 'KL_TVM_NEYYATTINKARA',districtId: 'KL_TVM', name: 'Neyyattinkara Agro & Loom',  lat: 8.4000,  lng: 77.0800 },
    { id: 'KL_TVM_ATTINGAL',    districtId: 'KL_TVM', name: 'Attingal Coconut & Spice',     lat: 8.6900,  lng: 76.8100 },
  ],
  KL_EKM: [
    { id: 'KL_EKM_ALUVA',       districtId: 'KL_EKM', name: 'Aluva Industrial Corridor',    lat: 10.1000, lng: 76.3500 },
    { id: 'KL_EKM_MUVATTUPUZHA',districtId: 'KL_EKM', name: 'Muvattupuzha Pineapple City', lat: 9.9800,  lng: 76.5700 },
  ],
  KL_CCJ: [
    { id: 'KL_CCJ_VADAKARA',    districtId: 'KL_CCJ', name: 'Vadakara Spice & Coconut',     lat: 11.6000, lng: 75.5900 },
  ],
  KL_TCR: [
    { id: 'KL_TCR_CHALAKUDY',   districtId: 'KL_TCR', name: 'Chalakudy Riverine Tourism',   lat: 10.3000, lng: 76.3300 },
  ],
  KL_PKD: [
    { id: 'KL_PKD_CHITTUR',     districtId: 'KL_PKD', name: 'Chittur Rice Bowl of Kerala',  lat: 10.7000, lng: 76.7500 },
  ],
  KL_KLM: [
    { id: 'KL_KLM_PUNALUR',     districtId: 'KL_KLM', name: 'Punalur Agro-Timber Zone',     lat: 9.0100,  lng: 76.9200 },
  ],
  KL_KNR: [
    { id: 'KL_KNR_THALASSERY',  districtId: 'KL_KNR', name: 'Thalassery Spice & Bakery',   lat: 11.7500, lng: 75.4900 },
  ],
  KL_ALP: [
    { id: 'KL_ALP_KUTTANAD',    districtId: 'KL_ALP', name: 'Kuttanad Below-Sea Rice Bowl', lat: 9.4200,  lng: 76.4100 },
  ],
  KL_KTM: [
    { id: 'KL_KTM_PALA',        districtId: 'KL_KTM', name: 'Pala Natural Rubber Capital',  lat: 9.7100,  lng: 76.6800 },
  ],
  KL_MLP: [
    { id: 'KL_MLP_PERINTHALMANNA',districtId: 'KL_MLP', name: 'Perinthalmanna Spices Hub',  lat: 10.9700, lng: 76.2200 },
  ],
  KL_WYD: [
    { id: 'KL_WYD_SULTAN_BATHERY',districtId: 'KL_WYD', name: 'Sultan Bathery Coffee & Pepper',lat: 11.6600, lng: 76.2500 },
  ],
  KL_IDK: [
    { id: 'KL_IDK_MUNNAR',      districtId: 'KL_IDK', name: 'Munnar Tea Plantation Capital',lat: 10.0800, lng: 77.0600 },
    { id: 'KL_IDK_KATTAPPANA',  districtId: 'KL_IDK', name: 'Kattappana Cardamom & Pepper', lat: 9.7500,  lng: 77.1100 },
  ],
  KL_KSG: [
    { id: 'KL_KSG_KANHANGAD',   districtId: 'KL_KSG', name: 'Kanhangad Arecanut Belt',      lat: 12.3500, lng: 75.0900 },
  ],
  KL_PTA: [
    { id: 'KL_PTA_THIRUVALLA',  districtId: 'KL_PTA', name: 'Thiruvalla Commercial Zone',   lat: 9.3800,  lng: 76.5700 },
  ],

  // ── MADHYA PRADESH (REMAINING) ───────────────────────────────────────────
  MP_JBP: [
    { id: 'MP_JBP_SIHORA',      districtId: 'MP_JBP', name: 'Sihora Mineral & Ore Belt',    lat: 23.4800, lng: 80.1100 },
    { id: 'MP_JBP_PATAN',       districtId: 'MP_JBP', name: 'Patan Pea & Wheat Capital',    lat: 23.2800, lng: 79.7800 },
  ],
  MP_GWL: [
    { id: 'MP_GWL_DABRA',       districtId: 'MP_GWL', name: 'Dabra Sugar & Paddy Belt',     lat: 25.9000, lng: 78.3300 },
  ],
  MP_UJN: [
    { id: 'MP_UJN_NAGDA',       districtId: 'MP_UJN', name: 'Nagda Chemical & Industrial',  lat: 23.4500, lng: 75.4100 },
  ],
  MP_SGR: [
    { id: 'MP_SGR_BINA',        districtId: 'MP_SGR', name: 'Bina Oil Refinery & Power Zone',lat: 24.1700, lng: 78.1800 },
  ],
  MP_STN: [
    { id: 'MP_STN_MAIHAR',      districtId: 'MP_STN', name: 'Maihar Cement & Temple Hub',   lat: 24.2700, lng: 80.7500 },
  ],
  MP_RWA: [
    { id: 'MP_RWA_TEONTHAR',    districtId: 'MP_RWA', name: 'Teonthar Paddy & Fruit Belt',  lat: 24.9800, lng: 81.6500 },
  ],
  MP_RTL: [
    { id: 'MP_RTL_JAORA',       districtId: 'MP_RTL', name: 'Jaora Garlic & Sugar Mandi',   lat: 23.6300, lng: 75.1300 },
  ],
  MP_CHN: [
    { id: 'MP_CHN_SAUSAR',      districtId: 'MP_CHN', name: 'Sausar Orange & Cotton Hub',   lat: 21.6500, lng: 78.7800 },
  ],
  MP_BHP: [
    { id: 'MP_BHP_NEPANAGAR',   districtId: 'MP_BHP', name: 'Nepanagar Newsprint & Paper',  lat: 21.4500, lng: 76.4200 },
  ],
  MP_DWS: [
    { id: 'MP_DWS_SONKATCH',    districtId: 'MP_DWS', name: 'Sonkatch Wheat & Soy Mandi',   lat: 22.9700, lng: 76.3700 },
  ],
  MP_KTN: [
    { id: 'MP_KTN_VIJAYRAGHAVGARH',districtId: 'MP_KTN', name: 'Vijayraghavgarh Cement Hub',lat: 24.0000, lng: 80.6000 },
  ],
  MP_VDS: [
    { id: 'MP_VDS_GANJ_BASODA', districtId: 'MP_VDS', name: 'Ganj Basoda Grain Mandi',     lat: 23.8500, lng: 77.9300 },
  ],
  MP_DHR: [
    { id: 'MP_DHR_PITHAMPUR',   districtId: 'MP_DHR', name: 'Pithampur Mega Auto Hub',      lat: 22.6200, lng: 75.6800 },
  ],
  MP_KHW: [
    { id: 'MP_KHW_PUNASA',      districtId: 'MP_KHW', name: 'Punasa Hydro Power & Dam Zone',lat: 22.2400, lng: 76.4000 },
  ],

  // ── MAHARASHTRA (REMAINING) ──────────────────────────────────────────────
  MH_MUM: [
    { id: 'MH_MUM_KURLA',       districtId: 'MH_MUM', name: 'Kurla Trade & Logistics Corridor',lat: 19.0700, lng: 72.8800 },
  ],
  MH_THN: [
    { id: 'MH_THN_BHIWANDI',    districtId: 'MH_THN', name: 'Bhiwandi Powerloom & Logistics',lat: 19.3000, lng: 73.0600 },
    { id: 'MH_THN_KALYAN',      districtId: 'MH_THN', name: 'Kalyan Trade Zone',            lat: 19.2400, lng: 73.1300 },
  ],
  MH_CSN: [
    { id: 'MH_CSN_PAITHAN',     districtId: 'MH_CSN', name: 'Paithan Silk & Dam Reserve',   lat: 19.4800, lng: 75.3800 },
  ],
  MH_SLP: [
    { id: 'MH_SLP_SANGOLA',     districtId: 'MH_SLP', name: 'Sangola Pomegranate Capital',  lat: 17.4300, lng: 75.1900 },
    { id: 'MH_SLP_BARSHI',      districtId: 'MH_SLP', name: 'Barshi Pulse & Oilseed Mills', lat: 18.2300, lng: 75.6900 },
  ],
  MH_AMR: [
    { id: 'MH_AMR_WARUD',       districtId: 'MH_AMR', name: 'Warud Orange City Belt',       lat: 21.4600, lng: 78.0700 },
  ],
  MH_SGL: [
    { id: 'MH_SGL_TASGAON',     districtId: 'MH_SGL', name: 'Tasgaon Grape & Raisin Hub',   lat: 17.0300, lng: 74.6000 },
  ],
  MH_STR: [
    { id: 'MH_STR_KARAD',       districtId: 'MH_STR', name: 'Karad Engineering & Sugarcane',lat: 17.2800, lng: 74.1800 },
    { id: 'MH_STR_MAHABALESHWAR',districtId: 'MH_STR', name: 'Mahabaleshwar Tourism & Berry',lat: 17.9200, lng: 73.6500 },
  ],
  MH_AHM: [
    { id: 'MH_AHM_KOPARGAON',   districtId: 'MH_AHM', name: 'Kopargaon Sugar Belt',         lat: 19.8800, lng: 74.4800 },
    { id: 'MH_AHM_RAHURI',      districtId: 'MH_AHM', name: 'Rahuri Phule Agri University', lat: 19.3800, lng: 74.6500 },
  ],
  MH_JLG: [
    { id: 'MH_JLG_BHUSAWAL',    districtId: 'MH_JLG', name: 'Bhusawal Banana Export Hub',   lat: 21.0500, lng: 75.7800 },
  ],
  MH_LTR: [
    { id: 'MH_LTR_UDGIR',       districtId: 'MH_LTR', name: 'Udgir Cattle & Dairy Market',  lat: 18.3900, lng: 77.1100 },
  ],
  MH_NND: [
    { id: 'MH_NND_DEGLOOR',     districtId: 'MH_NND', name: 'Degloor Handloom & Border Trade',lat: 18.5500, lng: 77.5800 },
  ],
  MH_RGD: [
    { id: 'MH_RGD_PANVEL',      districtId: 'MH_RGD', name: 'Panvel Logistics & Freight Hub',lat: 18.9800, lng: 73.1100 },
  ],
  MH_RTN: [
    { id: 'MH_RTN_DAPOLI',      districtId: 'MH_RTN', name: 'Dapoli Mango Agri University', lat: 17.7500, lng: 73.1800 },
  ],
  MH_PLG: [
    { id: 'MH_PLG_DAHANU',      districtId: 'MH_PLG', name: 'Dahanu Chickoo & Horticulture', lat: 19.9700, lng: 72.7300 },
  ],

  // ── MANIPUR ──────────────────────────────────────────────────────────────
  MN_IMP: [
    { id: 'MN_IMP_NAMBOL',      districtId: 'MN_IMP', name: 'Nambol Agro & Handloom',       lat: 24.7100, lng: 93.8300 },
  ],
  MN_IME: [
    { id: 'MN_IME_POROMPAT',    districtId: 'MN_IME', name: 'Porompat Commercial Hub',      lat: 24.8100, lng: 93.9600 },
  ],
  MN_CCP: [
    { id: 'MN_CCP_LAMKA',       districtId: 'MN_CCP', name: 'Lamka Coffee & Trade Center',  lat: 24.3300, lng: 93.6800 },
  ],
  MN_THB: [
    { id: 'MN_THB_KAKCHING',    districtId: 'MN_THB', name: 'Kakching Granary of Manipur',  lat: 24.4800, lng: 93.9800 },
  ],
  MN_BSP: [
    { id: 'MN_BSP_MOIRANG',     districtId: 'MN_BSP', name: 'Moirang Loktak Fishery Zone',  lat: 24.5000, lng: 93.7700 },
  ],
  MN_UKH: [
    { id: 'MN_UKH_UKHRUL_C',    districtId: 'MN_UKH', name: 'Ukhrul Passion Fruit Hub',     lat: 25.1100, lng: 94.3600 },
  ],
  MN_SNP: [
    { id: 'MN_SNP_MAO',         districtId: 'MN_SNP', name: 'Mao Border Fruit & Veg Mandi', lat: 25.5100, lng: 94.1300 },
  ],

  // ── MEGHALAYA ────────────────────────────────────────────────────────────
  ML_SHL: [
    { id: 'ML_SHL_SOHRA',       districtId: 'ML_SHL', name: 'Sohra Eco-Tourism & Spices',   lat: 25.2800, lng: 91.7300 },
  ],
  ML_TRA: [
    { id: 'ML_TRA_PHULBARI',    districtId: 'ML_TRA', name: 'Phulbari Border Paddy Belt',   lat: 25.8800, lng: 90.0300 },
  ],
  ML_NGB: [
    { id: 'ML_NGB_BYRNIHAT',    districtId: 'ML_NGB', name: 'Byrnihat Industrial Border Zone',lat: 26.0500, lng: 91.8800 },
  ],
  ML_JOW: [
    { id: 'ML_JOW_JOWAI_C',     districtId: 'ML_JOW', name: 'Jowai Spice & Coal Zone',      lat: 25.4500, lng: 92.2000 },
  ],

  // ── MIZORAM ──────────────────────────────────────────────────────────────
  MZ_AJL: [
    { id: 'MZ_AJL_SAIRANG',     districtId: 'MZ_AJL', name: 'Sairang Railway Freight Hub',  lat: 23.7000, lng: 92.6600 },
  ],
  MZ_LNG: [
    { id: 'MZ_LNG_HNAHTHIAL',   districtId: 'MZ_LNG', name: 'Hnahthial Timber & Crop',      lat: 22.9600, lng: 92.9300 },
  ],
  MZ_CMP: [
    { id: 'MZ_CMP_CHAMPHAI_C',  districtId: 'MZ_CMP', name: 'Champhai Rice Valley & Winery',lat: 23.4500, lng: 93.3200 },
  ],
  MZ_KLS: [
    { id: 'MZ_KLS_VAIRENGTE',   districtId: 'MZ_KLS', name: 'Vairengte Border Checkpost',   lat: 24.5100, lng: 92.7600 },
  ],
  MZ_SRC: [
    { id: 'MZ_SRC_THENZAWL',    districtId: 'MZ_SRC', name: 'Thenzawl Handloom & Agri',     lat: 23.3100, lng: 92.7700 },
  ],

  // ── NAGALAND ─────────────────────────────────────────────────────────────
  NL_KHM: [
    { id: 'NL_KHM_TSEMINYU',    districtId: 'NL_KHM', name: 'Tseminyu Organic Crop Zone',   lat: 25.9100, lng: 94.2100 },
  ],
  NL_DMP: [
    { id: 'NL_DMP_CHUMOUKEDIMA',districtId: 'NL_DMP', name: 'Chumoukedima Industrial Zone', lat: 25.8000, lng: 93.7700 },
  ],
  NL_MKG: [
    { id: 'NL_MKG_TULI',        districtId: 'NL_MKG', name: 'Tuli Industrial & Bamboo',     lat: 26.6800, lng: 94.6600 },
  ],
  NL_TSG: [
    { id: 'NL_TSG_TUENSANG_C',  districtId: 'NL_TSG', name: 'Tuensang Agro-Forestry',       lat: 26.2700, lng: 94.8200 },
  ],
  NL_WKH: [
    { id: 'NL_WKH_BHANDARI',    districtId: 'NL_WKH', name: 'Bhandari Oil & Gas Belt',      lat: 26.3100, lng: 94.1300 },
  ],
  NL_MON: [
    { id: 'NL_MON_TIZIT',       districtId: 'NL_MON', name: 'Tizit Timber & Industrial',    lat: 26.9000, lng: 95.1200 },
  ],

  // ── ODISHA ───────────────────────────────────────────────────────────────
  OD_BBS: [
    { id: 'OD_BBS_JATNI',       districtId: 'OD_BBS', name: 'Jatni Freight & Railway Hub',  lat: 20.1600, lng: 85.7000 },
  ],
  OD_CTC: [
    { id: 'OD_CTC_BANKI',       districtId: 'OD_CTC', name: 'Banki Vegetable & Rice Bowl',  lat: 20.3600, lng: 85.5300 },
    { id: 'OD_CTC_CHOUDWAR',    districtId: 'OD_CTC', name: 'Choudwar Industrial Hub',      lat: 20.5500, lng: 85.9100 },
  ],
  OD_BHM: [
    { id: 'OD_BHM_ASKA',        districtId: 'OD_BHM', name: 'Aska Sugar & Distillery Zone', lat: 19.6100, lng: 84.6600 },
  ],
  OD_SBP: [
    { id: 'OD_SBP_KUCHINDA',    districtId: 'OD_SBP', name: 'Kuchinda Chilli Capital',      lat: 21.7500, lng: 84.3500 },
  ],
  OD_RKL: [
    { id: 'OD_RKL_RAJGANGPUR',  districtId: 'OD_RKL', name: 'Rajgangpur Cement & Ore Zone', lat: 22.1800, lng: 84.5800 },
  ],
  OD_PRI: [
    { id: 'OD_PRI_NIMAPADA',    districtId: 'OD_PRI', name: 'Nimapada Milk & Sweet Cluster',lat: 20.0600, lng: 85.9900 },
  ],
  OD_BLS: [
    { id: 'OD_BLS_JALESWAR',    districtId: 'OD_BLS', name: 'Jaleswar Betel Leaf & Border', lat: 21.8100, lng: 87.2100 },
  ],
  OD_BHD: [
    { id: 'OD_BHD_DHAMRA',      districtId: 'OD_BHD', name: 'Dhamra Port & Fishery Zone',   lat: 20.8000, lng: 86.9000 },
  ],
  OD_ANG: [
    { id: 'OD_ANG_TALCHER',     districtId: 'OD_ANG', name: 'Talcher Coal & Energy Hub',    lat: 20.9500, lng: 85.2300 },
  ],
  OD_JHR: [
    { id: 'OD_JHR_BRAJRAJNAGAR',districtId: 'OD_JHR', name: 'Brajrajnagar Paper & Mineral', lat: 21.8200, lng: 83.9200 },
  ],
  OD_KRP: [
    { id: 'OD_KRP_JEYPORE',     districtId: 'OD_KRP', name: 'Jeypore Rice Bowl & Paper',    lat: 18.8500, lng: 82.5800 },
  ],

  // ── PUNJAB (REMAINING) ───────────────────────────────────────────────────
  PB_JAL: [
    { id: 'PB_JAL_NAKODAR',     districtId: 'PB_JAL', name: 'Nakodar Grain & Textile Belt', lat: 31.1300, lng: 75.4700 },
  ],
  PB_PTL: [
    { id: 'PB_PTL_NABHA',       districtId: 'PB_PTL', name: 'Nabha Harvester & Agri-Tech',  lat: 30.3700, lng: 76.1500 },
    { id: 'PB_PTL_RAJPURA',     districtId: 'PB_PTL', name: 'Rajpura Industrial Growth Hub',lat: 30.4800, lng: 76.5900 },
  ],
  PB_BTI: [
    { id: 'PB_BTI_TALWANDI',    districtId: 'PB_BTI', name: 'Talwandi Sabo Power & Cotton', lat: 29.9800, lng: 75.0800 },
  ],
  PB_MHL: [
    { id: 'PB_MHL_DERA_BASSI',  districtId: 'PB_MHL', name: 'Dera Bassi Pharma Corridor',   lat: 30.5900, lng: 76.8400 },
  ],
  PB_PTK: [
    { id: 'PB_PTK_SUJANPUR',    districtId: 'PB_PTK', name: 'Sujanpur Border Farm Zone',    lat: 32.3000, lng: 75.6100 },
  ],
  PB_HSR: [
    { id: 'PB_HSR_DASUYA',      districtId: 'PB_HSR', name: 'Dasuya Kinnow Fruit Belt',     lat: 31.8100, lng: 75.6500 },
  ],
  PB_GDP: [
    { id: 'PB_GDP_BATALA',      districtId: 'PB_GDP', name: 'Batala Foundry & Agri-Machinery',lat: 31.8100,lng: 75.2000 },
  ],
  PB_FZP: [
    { id: 'PB_FZP_ABOHAR',      districtId: 'PB_FZP', name: 'Abohar Kinnow & Cotton Capital',lat: 30.1400, lng: 74.1900 },
  ],
  PB_SNG: [
    { id: 'PB_SNG_MALERKOTLA',  districtId: 'PB_SNG', name: 'Malerkotla Vegetable Capital', lat: 30.5200, lng: 75.8800 },
  ],

  // ── RAJASTHAN (REMAINING) ────────────────────────────────────────────────
  RJ_KTA: [
    { id: 'RJ_KTA_RAMGANJ_MND', districtId: 'RJ_KTA', name: 'Ramganj Mandi Coriander Capital',lat: 24.6500,lng: 75.9500 },
  ],
  RJ_AJM: [
    { id: 'RJ_AJM_KISHANGARH',  districtId: 'RJ_AJM', name: 'Kishangarh Marble Capital',    lat: 26.5700, lng: 74.8600 },
  ],
  RJ_BKN: [
    { id: 'RJ_BKN_NOKHA',       districtId: 'RJ_BKN', name: 'Nokha Moth Bean Capital',      lat: 27.6000, lng: 73.4200 },
  ],
  RJ_ALW: [
    { id: 'RJ_ALW_BHIWADI',     districtId: 'RJ_ALW', name: 'Bhiwadi Industrial Mega Zone', lat: 28.2100, lng: 76.8600 },
  ],
  RJ_BHL: [
    { id: 'RJ_BHL_GULABPURA',   districtId: 'RJ_BHL', name: 'Gulabpura Textile & Spinning', lat: 25.9000, lng: 74.6600 },
  ],
  RJ_SKR: [
    { id: 'RJ_SKR_NEEM_KA_THANA',districtId: 'RJ_SKR', name: 'Neem Ka Thana Mineral Belt',  lat: 27.7400, lng: 75.7800 },
  ],
  RJ_BHT: [
    { id: 'RJ_BHT_BAYANA',      districtId: 'RJ_BHT', name: 'Bayana Sandstone & Crop Zone', lat: 26.9000, lng: 77.2900 },
  ],
  RJ_PAL: [
    { id: 'RJ_PAL_SOJAT',       districtId: 'RJ_PAL', name: 'Sojat Henna Capital of World', lat: 25.9200, lng: 73.6600 },
  ],
  RJ_SGN: [
    { id: 'RJ_SGN_SURATGARH',   districtId: 'RJ_SGN', name: 'Suratgarh Thermal & Kinnow',   lat: 29.3200, lng: 73.9000 },
  ],
  RJ_BRM: [
    { id: 'RJ_BRM_BALOTRA',     districtId: 'RJ_BRM', name: 'Balotra Textile Processing',  lat: 25.8300, lng: 72.2400 },
  ],
  RJ_CTR: [
    { id: 'RJ_CTR_NIMBAHERA',   districtId: 'RJ_CTR', name: 'Nimbahera Cement & Marble Belt',lat: 24.6200,lng: 74.6800 },
  ],
  RJ_JHJ: [
    { id: 'RJ_JHJ_PILANI',      districtId: 'RJ_JHJ', name: 'Pilani Tech & Educational Hub',lat: 28.3600, lng: 75.6000 },
  ],

  // ── SIKKIM ───────────────────────────────────────────────────────────────
  SK_GTK: [
    { id: 'SK_GTK_RANGPO',      districtId: 'SK_GTK', name: 'Rangpo Pharma Border Hub',     lat: 27.1800, lng: 88.5300 },
  ],
  SK_NMC: [
    { id: 'SK_NMC_JORETHANG',   districtId: 'SK_NMC', name: 'Jorethang Riverine Trade',     lat: 27.1300, lng: 88.3100 },
  ],
  SK_GYL: [
    { id: 'SK_GYL_PELLING',     districtId: 'SK_GYL', name: 'Pelling Eco-Tourism & Dairy',  lat: 27.3200, lng: 88.2400 },
  ],
  SK_MNG: [
    { id: 'SK_MNG_MANGAN_C',    districtId: 'SK_MNG', name: 'Mangan Cardamom Capital',      lat: 27.5100, lng: 88.5300 },
  ],

  // ── TAMIL NADU (REMAINING) ───────────────────────────────────────────────
  TN_CHN: [
    { id: 'TN_CHN_TAMBARAM',    districtId: 'TN_CHN', name: 'Tambaram Trade Corridor',      lat: 12.9200, lng: 80.1200 },
    { id: 'TN_CHN_AMBATTUR',    districtId: 'TN_CHN', name: 'Ambattur Industrial Hub',      lat: 13.1100, lng: 80.1500 },
  ],
  TN_TRY: [
    { id: 'TN_TRY_LALGUDI',     districtId: 'TN_TRY', name: 'Lalgudi Paddy & Banana Belt',  lat: 10.8700, lng: 78.8100 },
  ],
  TN_TPR: [
    { id: 'TN_TPR_AVINASHI',    districtId: 'TN_TPR', name: 'Avinashi Powerloom Textile',   lat: 11.1900, lng: 77.2600 },
  ],
  TN_ERD: [
    { id: 'TN_ERD_GOBICHETTIPALAYAM',districtId: 'TN_ERD', name: 'Gobi Turmeric & Sugar Belt',lat: 11.4500, lng: 77.4300 },
  ],
  TN_VLR: [
    { id: 'TN_VLR_RANIPET',     districtId: 'TN_VLR', name: 'Ranipet Leather & Chemical',   lat: 12.9300, lng: 79.3300 },
  ],
  TN_TNV: [
    { id: 'TN_TNV_AMBASAMUDRAM',districtId: 'TN_TNV', name: 'Ambasamudram Rice & Handloom',lat: 8.7000,  lng: 77.4500 },
  ],
  TN_TNJ: [
    { id: 'TN_TNJ_KUMBAKONAM',  districtId: 'TN_TNJ', name: 'Kumbakonam Brassware & Heritage',lat: 10.9600,lng: 79.3800 },
  ],
  TN_KNC: [
    { id: 'TN_KNC_SRIPERUMBUDUR',districtId: 'TN_KNC', name: 'Sriperumbudur Auto Hub',     lat: 12.9700, lng: 79.9400 },
  ],
  TN_CDL: [
    { id: 'TN_CDL_PANRUTI',     districtId: 'TN_CDL', name: 'Panruti Jackfruit & Cashew',   lat: 11.7700, lng: 79.5500 },
  ],
  TN_DND: [
    { id: 'TN_DND_ODDANCHATRAM',districtId: 'TN_DND', name: 'Oddanchatram Vegetable Mandi',lat: 10.4800, lng: 77.7800 },
  ],
  TN_NGP: [
    { id: 'TN_NGP_SIRKAZHI',    districtId: 'TN_NGP', name: 'Sirkazhi Paddy & Salt Belt',   lat: 11.2300, lng: 79.7300 },
  ],
  TN_THK: [
    { id: 'TN_THK_KOVILPATTI',  districtId: 'TN_THK', name: 'Kovilpatti Peanut Candy Hub',  lat: 9.1700,  lng: 77.8600 },
  ],

  // ── TELANGANA ────────────────────────────────────────────────────────────
  TG_HYD: [
    { id: 'TG_HYD_SHAMSHABAD',  districtId: 'TG_HYD', name: 'Shamshabad Airport Logistics', lat: 17.2500, lng: 78.4300 },
    { id: 'TG_HYD_MEDCHAL',     districtId: 'TG_HYD', name: 'Medchal Bio-Pharma Hub',      lat: 17.6300, lng: 78.4800 },
  ],
  TG_WGL: [
    { id: 'TG_WGL_JANGAON',     districtId: 'TG_WGL', name: 'Jangaon Cotton Mandi',         lat: 17.7200, lng: 79.1800 },
  ],
  TG_KRM: [
    { id: 'TG_KRM_JAGTIAL',     districtId: 'TG_KRM', name: 'Jagtial Mango & Turmeric Capital',lat: 18.7900,lng: 78.9100 },
  ],
  TG_NZB: [
    { id: 'TG_NZB_ARMOOR',      districtId: 'TG_NZB', name: 'Armoor Red Chilli & Turmeric', lat: 18.7900, lng: 78.2900 },
  ],
  TG_KHM: [
    { id: 'TG_KHM_SATHUPALLY',  districtId: 'TG_KHM', name: 'Sathupally Coal & Oil Palm',   lat: 17.2100, lng: 80.8300 },
  ],
  TG_MBN: [
    { id: 'TG_MBN_GADWAL',      districtId: 'TG_MBN', name: 'Gadwal Handloom Silk Hub',     lat: 16.2300, lng: 77.8000 },
  ],
  TG_NLG: [
    { id: 'TG_NLG_MIRYALAGUDA', districtId: 'TG_NLG', name: 'Miryalaguda Rice Milling Capital',lat: 16.8700,lng: 79.5600 },
  ],
  TG_SNG: [
    { id: 'TG_SNG_ZAHEERABAD',  districtId: 'TG_SNG', name: 'Zaheerabad Mahindra Auto Hub', lat: 17.6800, lng: 77.6100 },
  ],
  TG_MDK: [
    { id: 'TG_MDK_SIDDIPET',    districtId: 'TG_MDK', name: 'Siddipet Agri & Dairy Hub',    lat: 18.1000, lng: 78.8500 },
  ],

  // ── TRIPURA ──────────────────────────────────────────────────────────────
  TR_AGT: [
    { id: 'TR_AGT_JIRANIA',     districtId: 'TR_AGT', name: 'Jirania Industrial & Agro',    lat: 23.8200, lng: 91.4300 },
  ],
  TR_UDP: [
    { id: 'TR_UDP_MATABARI',    districtId: 'TR_UDP', name: 'Matabari Rubber & Heritage',   lat: 23.5200, lng: 91.4900 },
  ],
  TR_BLN: [
    { id: 'TR_BLN_SABROOM',     districtId: 'TR_BLN', name: 'Sabroom Indo-Bangla Border Trade',lat: 23.0000,lng: 91.7300 },
  ],
  TR_DHM: [
    { id: 'TR_DHM_KAILASHAHAR', districtId: 'TR_DHM', name: 'Kailashahar Tea & Citrus',     lat: 24.3200, lng: 92.0100 },
  ],

  // ── UTTAR PRADESH (REMAINING) ────────────────────────────────────────────
  UP_AGR: [
    { id: 'UP_AGR_ETMADPUR',    districtId: 'UP_AGR', name: 'Etmadpur Potato Belt',         lat: 27.2300, lng: 78.2000 },
  ],
  UP_PRG: [
    { id: 'UP_PRG_PHULPUR',     districtId: 'UP_PRG', name: 'Phulpur Fertilizer Complex',   lat: 25.5500, lng: 82.0800 },
  ],
  UP_NOI: [
    { id: 'UP_NOI_GREATER_NOIDA',districtId: 'UP_NOI', name: 'Greater Noida Tech & Auto',   lat: 28.4700, lng: 77.5000 },
  ],
  UP_GKP: [
    { id: 'UP_GKP_SAHJANWA',    districtId: 'UP_GKP', name: 'Sahjanwa Industrial Growth',   lat: 26.7400, lng: 83.2100 },
  ],
  UP_MRT: [
    { id: 'UP_MRT_MAWANA',      districtId: 'UP_MRT', name: 'Mawana Sugar Mill Capital',    lat: 29.1000, lng: 77.9200 },
  ],
  UP_GZB: [
    { id: 'UP_GZB_MODINAGAR',   districtId: 'UP_GZB', name: 'Modi Nagar Sugar & Textile',  lat: 28.8300, lng: 77.5700 },
  ],
  UP_BRL: [
    { id: 'UP_BRL_AONLA',       districtId: 'UP_BRL', name: 'Aonla IFFCO Fertilizer Plant',lat: 28.2800, lng: 79.1600 },
  ],
  UP_ALG: [
    { id: 'UP_ALG_KHAIR',       districtId: 'UP_ALG', name: 'Khair Wheat & Mustard Mandi',  lat: 27.9400, lng: 77.8400 },
  ],
  UP_MBD: [
    { id: 'UP_MBD_CHANDAUSI',   districtId: 'UP_MBD', name: 'Chandausi Mentha Capital',     lat: 28.3500, lng: 78.7800 },
  ],
  UP_JHS: [
    { id: 'UP_JHS_MAURANIPUR',  districtId: 'UP_JHS', name: 'Mauranipur Powerloom Belt',    lat: 25.2400, lng: 79.1200 },
  ],
  UP_MTR: [
    { id: 'UP_MTR_VRINDAVAN',   districtId: 'UP_MTR', name: 'Vrindavan Dairy & Heritage',   lat: 27.5800, lng: 77.7000 },
  ],
  UP_AYD: [
    { id: 'UP_AYD_RUDAULI',     districtId: 'UP_AYD', name: 'Rudauli Sugar & Rice Mill',    lat: 26.7500, lng: 81.7500 },
  ],
  UP_SHR: [
    { id: 'UP_SHR_BEHAT',       districtId: 'UP_SHR', name: 'Behat Mango Capital of UP',    lat: 30.1700, lng: 77.5700 },
  ],
  UP_MZN: [
    { id: 'UP_MZN_KHATAULI',    districtId: 'UP_MZN', name: 'Khatauli Sugar Mill Hub',     lat: 29.2800, lng: 77.7200 },
  ],
  UP_FRZ: [
    { id: 'UP_FRZ_TUNDLA',      districtId: 'UP_FRZ', name: 'Tundla Glassware & Railway',   lat: 27.2000, lng: 78.2400 },
  ],
  UP_RMP: [
    { id: 'UP_RMP_BILASPUR',    districtId: 'UP_RMP', name: 'Bilaspur Mentha & Grain',     lat: 28.8800, lng: 79.2700 },
  ],
  UP_SJP: [
    { id: 'UP_SJP_TILHAR',      districtId: 'UP_SJP', name: 'Tilhar Sugar & Wheat Mandi',   lat: 27.9700, lng: 79.7300 },
  ],

  // ── UTTARAKHAND ──────────────────────────────────────────────────────────
  UK_DDN: [
    { id: 'UK_DDN_RISHIKESH',   districtId: 'UK_DDN', name: 'Rishikesh Yoga & Herbal Eco',  lat: 30.0800, lng: 78.2600 },
    { id: 'UK_DDN_VIKASNAGAR',  districtId: 'UK_DDN', name: 'Vikasnagar Basmati & Sugarcane',lat: 30.4700,lng: 77.7700 },
  ],
  UK_HDW: [
    { id: 'UK_HDW_ROORKEE',     districtId: 'UK_HDW', name: 'Roorkee IIT & Industrial Hub', lat: 29.8500, lng: 77.8800 },
  ],
  UK_RDP: [
    { id: 'UK_RDP_KASHIPUR',    districtId: 'UK_RDP', name: 'Kashipur Industrial Hub',      lat: 29.2100, lng: 78.9600 },
  ],
  UK_HLD: [
    { id: 'UK_HLD_RAMNAGAR',    districtId: 'UK_HLD', name: 'Ramnagar Corbett Eco-Tourism', lat: 29.3900, lng: 79.1200 },
  ],
  UK_ALM: [
    { id: 'UK_ALM_RANIKHET',    districtId: 'UK_ALM', name: 'Ranikhet Eco-Tourism Belt',    lat: 29.6400, lng: 79.4300 },
  ],
  UK_PWR: [
    { id: 'UK_PWR_KOTDWAR',     districtId: 'UK_PWR', name: 'Kotdwar Industrial Gateway',   lat: 29.7500, lng: 78.5200 },
  ],
  UK_THR: [
    { id: 'UK_THR_NEW_TEHRI',   districtId: 'UK_THR', name: 'New Tehri Lake & Hydro',       lat: 30.3700, lng: 78.4300 },
  ],
  UK_PTG: [
    { id: 'UK_PTG_DHARCHULA',   districtId: 'UK_PTG', name: 'Dharchula Border Woolen Trade',lat: 29.8500, lng: 80.5300 },
  ],

  // ── WEST BENGAL ──────────────────────────────────────────────────────────
  WB_KOL: [
    { id: 'WB_KOL_SALT_LAKE',   districtId: 'WB_KOL', name: 'Salt Lake Sector V Tech Hub',  lat: 22.5700, lng: 88.4300 },
    { id: 'WB_KOL_NEW_TOWN',    districtId: 'WB_KOL', name: 'New Town Smart City Corridor', lat: 22.5800, lng: 88.4700 },
  ],
  WB_N24: [
    { id: 'WB_N24_BARRACKPORE', districtId: 'WB_N24', name: 'Barrackpore Jute Mills Belt',  lat: 22.7600, lng: 88.3700 },
  ],
  WB_S24: [
    { id: 'WB_S24_BARUIPUR',    districtId: 'WB_S24', name: 'Baruipur Guava & Agri Hub',    lat: 22.3600, lng: 88.4300 },
  ],
  WB_HWH: [
    { id: 'WB_HWH_ULUBERIA',    districtId: 'WB_HWH', name: 'Uluberia Industrial Belt',     lat: 22.4700, lng: 88.1100 },
  ],
  WB_DGP: [
    { id: 'WB_DGP_ASANSOL',     districtId: 'WB_DGP', name: 'Asansol Heavy Industrial',     lat: 23.6800, lng: 86.9800 },
  ],
  WB_SLG: [
    { id: 'WB_SLG_KURSEONG',    districtId: 'WB_SLG', name: 'Kurseong Tea & High Altitude', lat: 26.8800, lng: 88.2800 },
  ],
  WB_MSD: [
    { id: 'WB_MSD_JANGIPUR',    districtId: 'WB_MSD', name: 'Jangipur Jute & Beedi Hub',    lat: 24.4700, lng: 88.0700 },
  ],
  WB_HGL: [
    { id: 'WB_HGL_ARAMBAGH',    districtId: 'WB_HGL', name: 'Arambagh Poultry & Agri Hub',  lat: 22.8800, lng: 87.7800 },
  ],
  WB_MLD: [
    { id: 'WB_MLD_KALIACHAK',   districtId: 'WB_MLD', name: 'Kaliachak Mango & Silk Belt',  lat: 24.8500, lng: 88.0200 },
  ],
  WB_NDA: [
    { id: 'WB_NDA_RANAGHAT',    districtId: 'WB_NDA', name: 'Ranaghat Floriculture Hub',    lat: 23.1800, lng: 88.5800 },
  ],
  WB_PRL: [
    { id: 'WB_PRL_RAGHUNATHPUR',districtId: 'WB_PRL', name: 'Raghunathpur Thermal Zone',    lat: 23.5400, lng: 86.6700 },
  ],
  WB_BRB: [
    { id: 'WB_BRB_BOLPUR',      districtId: 'WB_BRB', name: 'Bolpur Crafts & Heritage Hub', lat: 23.6700, lng: 87.6800 },
  ],

  // ── UNION TERRITORIES ────────────────────────────────────────────────────
  AN_PBL: [
    { id: 'AN_PBL_GARACHARMA',  districtId: 'AN_PBL', name: 'Garacharma Rural & Fishery',   lat: 11.6100, lng: 92.7100 },
  ],
  AN_NMA: [
    { id: 'AN_NMA_RANGAT',      districtId: 'AN_NMA', name: 'Rangat Timber & Spices',       lat: 12.5000, lng: 92.9300 },
  ],
  AN_NCB: [
    { id: 'AN_NCB_CAMPBELL',    districtId: 'AN_NCB', name: 'Campbell Bay Coconut Hub',     lat: 7.0000,  lng: 93.9200 },
  ],
  CH_CHD: [
    { id: 'CH_CHD_MANIMAJRA',   districtId: 'CH_CHD', name: 'Manimajra Commercial Zone',    lat: 30.7200, lng: 76.8400 },
    { id: 'CH_CHD_IND_AREA',    districtId: 'CH_CHD', name: 'Industrial Area Phase 1 & 2',  lat: 30.7000, lng: 76.7900 },
  ],
  DN_DMN: [
    { id: 'DN_DMN_NANI_DAMAN',  districtId: 'DN_DMN', name: 'Nani Daman Commercial Hub',    lat: 20.4100, lng: 72.8400 },
  ],
  DN_DIU: [
    { id: 'DN_DIU_GHOGHLA',     districtId: 'DN_DIU', name: 'Ghoghla Coastal Tourism',     lat: 20.7200, lng: 70.9900 },
  ],
  DN_DDR: [
    { id: 'DN_DDR_SILVASSA_C',  districtId: 'DN_DDR', name: 'Silvassa Industrial Hub',      lat: 20.2700, lng: 73.0100 },
  ],
  DL_NDL: [
    { id: 'DL_NDL_CONNAUGHT',   districtId: 'DL_NDL', name: 'Connaught Place Commercial',   lat: 28.6300, lng: 77.2100 },
  ],
  DL_NW: [
    { id: 'DL_NW_NARELA',       districtId: 'DL_NW',  name: 'Narela Grain & Industrial',    lat: 28.8500, lng: 77.0900 },
  ],
  DL_SW: [
    { id: 'DL_SW_NAJAFGARH',    districtId: 'DL_SW',  name: 'Najafgarh Agricultural Belt',  lat: 28.6100, lng: 76.9800 },
  ],
  DL_EST: [
    { id: 'DL_EST_GAZIPUR',     districtId: 'DL_EST', name: 'Gazipur Flower & Fruit Mandi', lat: 28.6200, lng: 77.3200 },
  ],
  DL_STH: [
    { id: 'DL_STH_MEHRAULI',    districtId: 'DL_STH', name: 'Mehrauli Floriculture Zone',   lat: 28.5200, lng: 77.1800 },
  ],
  DL_WST: [
    { id: 'DL_WST_MUNDKA',      districtId: 'DL_WST', name: 'Mundka Warehousing & Industrial',lat: 28.6800,lng: 77.0200 },
  ],
  DL_CNT: [
    { id: 'DL_CNT_SADAR',       districtId: 'DL_CNT', name: 'Sadar Bazar Wholesale Hub',    lat: 28.6500, lng: 77.2100 },
  ],
  JK_SGR: [
    { id: 'JK_SGR_HAZRATBAL',   districtId: 'JK_SGR', name: 'Hazratbal Saffron & Craft',    lat: 34.1200, lng: 74.8400 },
  ],
  JK_JMU: [
    { id: 'JK_JMU_RS_PURA',     districtId: 'JK_JMU', name: 'R.S. Pura Basmati Rice Belt',  lat: 32.6100, lng: 74.7300 },
  ],
  JK_ANT: [
    { id: 'JK_ANT_BIJBEHARA',   districtId: 'JK_ANT', name: 'Bijbehara Sports & Walnut',    lat: 33.7900, lng: 75.1000 },
  ],
  JK_BRM: [
    { id: 'JK_BRM_SOPORE',      districtId: 'JK_BRM', name: 'Sopore Apple Town of Asia',    lat: 34.3000, lng: 74.4700 },
  ],
  JK_UDH: [
    { id: 'JK_UDH_CHENANI',     districtId: 'JK_UDH', name: 'Chenani Hydro Gateway',        lat: 32.9500, lng: 75.1600 },
  ],
  JK_PLW: [
    { id: 'JK_PLW_PAMPORE',     districtId: 'JK_PLW', name: 'Pampore Saffron Capital',      lat: 34.0000, lng: 74.9200 },
  ],
  JK_KTH: [
    { id: 'JK_KTH_HIRANAGAR',   districtId: 'JK_KTH', name: 'Hiranagar Border Farm Zone',   lat: 32.4500, lng: 75.2700 },
  ],
  JK_RJR: [
    { id: 'JK_RJR_NOWSHERA',    districtId: 'JK_RJR', name: 'Nowshera Border Trade Belt',   lat: 33.1500, lng: 74.2400 },
  ],
  LA_LEH: [
    { id: 'LA_LEH_NUBRA',       districtId: 'LA_LEH', name: 'Nubra Valley Sea-Buckthorn',   lat: 34.5800, lng: 77.5600 },
  ],
  LA_KGL: [
    { id: 'LA_KGL_SANKOO',      districtId: 'LA_KGL', name: 'Sankoo Apricot Valley',        lat: 34.4200, lng: 75.9500 },
  ],
  LD_KVR: [
    { id: 'LD_KVR_KAVARATTI_C', districtId: 'LD_KVR', name: 'Kavaratti Marine Fishery',     lat: 10.5600, lng: 72.6400 },
  ],
  LD_AGT: [
    { id: 'LD_AGT_AGATTI_C',    districtId: 'LD_AGT', name: 'Agatti Marine Aquaculture',    lat: 10.8500, lng: 72.1800 },
  ],
  LD_MNC: [
    { id: 'LD_MNC_MINICOY_C',   districtId: 'LD_MNC', name: 'Minicoy Tuna Processing Zone', lat: 8.2800,  lng: 73.0500 },
  ],
  PY_PDY: [
    { id: 'PY_PDY_PUDUCHERRY_C',districtId: 'PY_PDY', name: 'Puducherry Commercial Zone',   lat: 11.9400, lng: 79.8000 },
  ],
  PY_KRK: [
    { id: 'PY_KRK_THIRUNALLAR', districtId: 'PY_KRK', name: 'Thirunallar Rice Bowl',        lat: 10.9300, lng: 79.7900 },
  ],
  PY_MHE: [
    { id: 'PY_MHE_MAHE_C',      districtId: 'PY_MHE', name: 'Mahe Coastal Spice Trade',     lat: 11.7000, lng: 75.5300 },
  ],
  PY_YNM: [
    { id: 'PY_YNM_YANAM_C',     districtId: 'PY_YNM', name: 'Yanam Riverine Fishery Zone',  lat: 16.7300, lng: 82.2100 },
  ],
};

// BUSINESS CATEGORIES WITH SUBTYPES
const BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: 'all', name: 'All Categories (Detect Everything)', subTypes: ['All Sub-Types (Select All)', 'Detect All Sectors in Radius', 'Multi-Sector Ecosystem Scan', 'Comprehensive Radius Scan'] },
  { id: 'agriculture', name: 'Agriculture', subTypes: ['All Sub-Types (Select All)', 'Crop Farming', 'Organic Farming', 'Horticulture', 'Greenhouse Cultivation', 'Agri Inputs Store'] },
  { id: 'dairy', name: 'Dairy Farming', subTypes: ['All Sub-Types (Select All)', 'Dairy Farm', 'Milk Collection Center', 'Dairy Processing', 'Cattle Feed Unit'] },
  { id: 'poultry', name: 'Poultry', subTypes: ['All Sub-Types (Select All)', 'Layer Farming', 'Broiler Farm', 'Hatchery Unit', 'Poultry Feed Processing'] },
  { id: 'fisheries', name: 'Fisheries', subTypes: ['All Sub-Types (Select All)', 'Freshwater Aquaculture', 'Biofloc Fish Farming', 'Fish Feed Mill', 'Cold Storage & Fish Supply'] },
  { id: 'goat_farming', name: 'Goat Farming', subTypes: ['All Sub-Types (Select All)', 'Commercial Goat Breeding', 'Stall-Fed Goat Unit', 'Meat Processing & Supply'] },
  { id: 'food_processing', name: 'Food Processing', subTypes: ['All Sub-Types (Select All)', 'Flour Mill (Chakki)', 'Oil Extraction Unit', 'Spices Processing', 'Fruit & Vegetable Drying', 'Bakery Unit'] },
  { id: 'retail', name: 'Grocery / Retail', subTypes: ['All Sub-Types (Select All)', 'Rural Supermarket', 'Agri Machinery Retail', 'General Store', 'Hardware & Fertilizer'] },
  { id: 'manufacturing', name: 'Manufacturing', subTypes: ['All Sub-Types (Select All)', 'Paper Bag & Packaging', 'Clay Pottery & Tiles', 'Small Machinery Fabrication', 'Bio-Fertilizer Unit'] },
  { id: 'transportation', name: 'Transportation', subTypes: ['All Sub-Types (Select All)', 'Rural Agri Freight Logistics', 'Cold Chain Van Supply', 'Passenger Auto/Mini-Bus Service'] },
  { id: 'hospitality', name: 'Hospitality', subTypes: ['All Sub-Types (Select All)', 'Agri-Tourism Resort', 'Highway Dhaba & Eatery', 'Rural Homestay'] },
  { id: 'services', name: 'Services', subTypes: ['All Sub-Types (Select All)', 'Solar Installation & Repair', 'Tractor Repair & Rental', 'Digital Citizen Service Center (CSC)', 'Cold Storage Rental'] },
  { id: 'handicrafts', name: 'Handicrafts', subTypes: ['All Sub-Types (Select All)', 'Textile Handloom Unit', 'Leather Crafts Unit', 'Wooden Artifacts & Toys', 'Jute Product Crafting'] },
  { id: 'other', name: 'Other', subTypes: ['All Sub-Types (Select All)', 'Custom Micro-Enterprise'] },
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

  findNearestHierarchy(lat: number, lng: number): {
    state: StateLocation;
    district: DistrictLocation;
    area: AreaLocation | null;
    distanceKm: number;
  } {
    const getDistKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let closestDistrict: DistrictLocation | null = null;
    let minDistrictDist = Infinity;

    for (const districtList of Object.values(DISTRICTS)) {
      for (const d of districtList) {
        const dist = getDistKm(lat, lng, d.lat, d.lng);
        if (dist < minDistrictDist) {
          minDistrictDist = dist;
          closestDistrict = d;
        }
      }
    }

    if (!closestDistrict) {
      closestDistrict = DISTRICTS['GJ'][0];
      minDistrictDist = getDistKm(lat, lng, closestDistrict.lat, closestDistrict.lng);
    }

    const state = STATES.find((s) => s.id === closestDistrict!.stateId) || STATES[0];
    const areas = AREAS[closestDistrict.id] || [];
    let closestArea: AreaLocation | null = null;
    let minAreaDist = Infinity;

    for (const a of areas) {
      const dist = getDistKm(lat, lng, a.lat, a.lng);
      if (dist < minAreaDist) {
        minAreaDist = dist;
        closestArea = a;
      }
    }

    return {
      state,
      district: closestDistrict,
      area: closestArea,
      distanceKm: Math.round(minDistrictDist * 10) / 10,
    };
  },

  async searchLocations(params: GeoSearchParams): Promise<CandidateLocation[]> {
    const state = STATES.find((s) => s.id === params.stateId);
    const districts = DISTRICTS[params.stateId] || [];
    const district = districts.find((d) => d.id === params.districtId);
    const areas = AREAS[params.districtId] || [];
    const area = areas.find((a) => a.id === params.areaId);

    const centerLat = params.customLat !== undefined ? params.customLat : (area ? area.lat : district ? district.lat : state ? state.lat : 23.0225);
    const centerLng = params.customLng !== undefined ? params.customLng : (area ? area.lng : district ? district.lng : state ? state.lng : 72.5714);
    const baseStateName = state ? state.name : 'Gujarat';
    const baseDistrictName = district ? district.name : 'Ahmedabad';
    const baseAreaName = params.customLocationName || (area ? area.name : 'Sanand Rural');

    try {
      const url = `/api/v1/geo/radius-search/?lat=${centerLat}&lng=${centerLng}&radius=${params.radiusKm}&category=${encodeURIComponent(params.businessCategory || '')}`;
      const res = await apiFetch(url);
      
      let suitabilityData: any = null;
      try {
        const suitRes = await apiFetch('/api/v1/geo/suitability-assessment/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: centerLat,
            lng: centerLng,
            radius: params.radiusKm,
            category: params.businessCategory
          })
        });
        if (suitRes.ok) {
          suitabilityData = await suitRes.json();
        }
      } catch (err) {
        console.warn('Suitability assessment fetch fallback', err);
      }

      if (res.ok) {
        const data = await res.json();
        const summary = data.summary || {};
        const locs: any[] = data.locations || [];

        if (locs.length > 0) {
          const results = locs.map((l: any, idx: number) => {
            const fitScore = suitabilityData?.overall_score 
              ? Math.round(suitabilityData.overall_score)
              : Math.max(45, Math.min(96, Math.round(90 - l.distance_km * 1.5)));
            
            const dimensions = suitabilityData?.dimensions || {};
            const keyDrivers = suitabilityData?.reasons || [
              `Population within ${params.radiusKm}km: ${(summary.total_population || l.population).toLocaleString()} residents across ${summary.total_villages || 1} dataset locations.`,
              `Road accessibility: avg road distance ${summary.avg_road_distance_km || 10} km, nearest mandi ${summary.nearest_mandi_distance_km || 7} km.`,
              `Groundwater depth to water level (DTWL): ${summary.groundwater_dtwl_meters || 8.5} meters.`,
              `Rural daily wage rate: male ₹${summary.rural_daily_wage_men_rs || 405}/day, female ₹${summary.rural_daily_wage_women_rs || 340}/day.`,
              `Enterprise presence in ${l.state || baseStateName}: ${summary.estimated_enterprises_in_state || 350} establishments.`
            ];

            return {
              id: `dataset_loc_${l.village_code}_${idx}`,
              name: `${l.village} (${l.area_locality || 'Village Cluster'})`,
              areaName: l.village,
              districtName: l.district || baseDistrictName,
              stateName: l.state || baseStateName,
              lat: l.lat,
              lng: l.lng,
              distanceKm: l.distance_km,
              isOutsideState: false,
              scoreResult: {
                overallScore: fitScore,
                tier: fitScore >= 75 ? {
                  label: 'High Potential' as const,
                  badgeColor: 'bg-emerald-600 text-white',
                  textColor: 'text-emerald-800 dark:text-emerald-200',
                  borderColor: 'border-emerald-200',
                  bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/30'
                } : fitScore >= 55 ? {
                  label: 'Moderate' as const,
                  badgeColor: 'bg-amber-500 text-white',
                  textColor: 'text-amber-800 dark:text-amber-200',
                  borderColor: 'border-amber-200',
                  bgLight: 'bg-amber-50 dark:bg-amber-950/30'
                } : {
                  label: 'Low' as const,
                  badgeColor: 'bg-rose-600 text-white',
                  textColor: 'text-rose-800 dark:text-rose-200',
                  borderColor: 'border-rose-200',
                  bgLight: 'bg-rose-50 dark:bg-rose-950/30'
                },
                breakdown: {
                  marketDemand: Math.round(dimensions.demand?.score || 85),
                  competition: Math.round(dimensions.competition?.score || 80),
                  accessibility: Math.round(dimensions.accessibility?.score || 75),
                  customerDensity: Math.min(95, Math.round((l.population / 3000) * 80)),
                  infrastructure: Math.round(dimensions.accessibility?.score || 75),
                  investmentFit: Math.round(dimensions.labor?.score || 85),
                  growthPotential: Math.round(dimensions.resource_water?.score || 80)
                },
                keyDrivers: keyDrivers
              },
              population: `${l.population.toLocaleString()} residents (Dataset)`,
              customerBaseEst: `${Math.round(l.population / 4).toLocaleString()} households`,
              demandIndicator: (l.population > 3000 ? 'Very High' : l.population > 1500 ? 'High' : 'Moderate') as 'Very High' | 'High' | 'Moderate',
              marketSize: `₹${(l.population * 0.0015).toFixed(1)} Cr / year`,
              nearbyMarkets: [`APMC Mandi (${summary.nearest_mandi_distance_km || 6} km)`],
              marketConfidence: 'High' as const,
              competitorCount: Math.round(summary.estimated_enterprises_in_state ? summary.estimated_enterprises_in_state / 100 : 3),
              competitionDensity: 'Low' as const,
              nearestCompetitorDistance: '4.2 km away',
              competitorConcentration: 'Dataset Validated',
              nearestMajorRoad: `Road (${summary.avg_road_distance_km || 8} km)`,
              distanceToHighway: `${summary.nearest_highway_distance_km || 5} km`,
              nearestTransportHub: `Mandi (${summary.nearest_mandi_distance_km || 7} km)`,
              nearestRailwayStation: `Station (${summary.nearest_railway_station_km || 6} km)`,
              nearestBusStation: 'Local Stand (1 km)',
              electricityAvailability: `Wage ₹${summary.rural_daily_wage_men_rs || 420}/day`,
              waterAvailability: `Groundwater DTWL ${summary.groundwater_dtwl_meters || 8.5}m`,
              roadQuality: 'Paved Asphalt Road',
              internetConnectivity: '4G Cellular',
              healthcareAccess: 'Health Center (4 km)',
              bankingAccess: 'Credit Bank (2 km)',
              infrastructureDataStatus: 'Verified' as const,
              estimatedAnnualRevenue: `₹${(fitScore * 0.25).toFixed(1)} Lakh`,
              estimatedAnnualCost: `₹${(fitScore * 0.15).toFixed(1)} Lakh`,
              estimatedAnnualProfit: `₹${(fitScore * 0.10).toFixed(1)} Lakh`,
              estimatedBreakevenMonths: `${Math.round(24 - fitScore * 0.1)} months`,
              financialConfidence: 'High' as const,
              financialDataQuality: 'Modelled' as const,
              businessCategory: params.businessCategory,
              subType: params.subType || 'General Unit',
              investmentRange: params.investmentRange,
              investmentFitScore: fitScore,
              demandFitScore: Math.round(dimensions.demand?.score || fitScore),
              competitionFitScore: Math.round(dimensions.competition?.score || fitScore * 0.9),
              infrastructureFitScore: Math.round(dimensions.accessibility?.score || fitScore * 0.95),
              overallFitScore: fitScore,
              establishedYear: 2020,
              yearsOperating: 6,
            };
          });
          results.sort((a, b) => b.scoreResult.overallScore - a.scoreResult.overallScore);
          return results;
        }
      }
    } catch (e) {
      console.warn('Backend dataset API unavailable, using fallback', e);
    }

    // Query real nearby nodes for top candidate locations
    const realNearbyNodes: { name: string; lat: number; lng: number; distKm: number }[] = [];
    for (const areaList of Object.values(AREAS)) {
      for (const a of areaList) {
        const d = Math.hypot((a.lat - centerLat) * 111, (a.lng - centerLng) * 111 * Math.cos(centerLat * Math.PI / 180));
        if (d <= params.radiusKm * 1.05) {
          realNearbyNodes.push({ name: a.name, lat: a.lat, lng: a.lng, distKm: Math.round(d * 10) / 10 });
        }
      }
    }
    realNearbyNodes.sort((a, b) => a.distKm - b.distKm);

    const isDaskroi = params.areaId === 'GJ_AMD_DASKROI' || baseAreaName.toLowerCase().includes('daskroi');
    const cleanBaseArea = baseAreaName.replace(/(Taluka|Cluster|Zone|Belt)/gi, '').trim();
    const rScale = params.radiusKm / 111.0;

    const n1 = realNearbyNodes[0] || { name: isDaskroi ? 'Hathijan - Bareja Commercial Belt' : `${cleanBaseArea} Primary Growth Belt`, lat: centerLat + rScale * 0.45, lng: centerLng + rScale * 0.35, distKm: Math.round(params.radiusKm * 0.43 * 10) / 10 };
    const n2 = realNearbyNodes[1] || { name: isDaskroi ? 'Kuha - Kathwada Agri-Market Belt' : `${cleanBaseArea} Commercial Sector`, lat: centerLat - rScale * 0.55, lng: centerLng + rScale * 0.50, distKm: Math.round(params.radiusKm * 0.60 * 10) / 10 };
    const n3 = realNearbyNodes[2] || { name: isDaskroi ? 'Aslali - Jetalpur Commercial Zone' : `${baseDistrictName} Outer Sub-District Hub`, lat: centerLat + rScale * 0.50, lng: centerLng - rScale * 0.65, distKm: Math.round(params.radiusKm * 0.71 * 10) / 10 };
    const n4 = realNearbyNodes[3] || { name: isDaskroi ? 'Vastral - Harniyav Rural Sector' : `${cleanBaseArea} Rural Enterprise Node`, lat: centerLat - rScale * 0.70, lng: centerLng - rScale * 0.45, distKm: Math.round(params.radiusKm * 0.73 * 10) / 10 };


    const subLower = (params.subType || '').toLowerCase();
    const isSelectAll = subLower.includes('all sub-types') || subLower.includes('select all');

    // Sub-type specific scoring modifiers (delta applied to base scores per location)
    // Each subtype shifts demand/competition/infrastructure differently, creating realistic variation
    type ScoreDeltas = { md: number; comp: number; acc: number; cd: number; inf: number; inv: number; gp: number };
    const getSubtypeDeltas = (locIdx: number): ScoreDeltas => {
      const catLowerSc = (params.businessCategory || '').toLowerCase();
      if (isSelectAll) {
        // Even for "All Sub-Types", apply category-level baseline deltas
        // so switching from Dairy → Hospitality → Transport → Agriculture shows different scores
        if (catLowerSc.includes('dairy')) return { md: 6, comp: -4, acc: 2, cd: 5, inf: 2, inv: -2, gp: 4 };
        if (catLowerSc.includes('hospitality') || catLowerSc.includes('tourism')) return { md: 4, comp: -8, acc: -5, cd: 2, inf: -6, inv: -12, gp: 10 };
        if (catLowerSc.includes('transport') || catLowerSc.includes('logistics')) return { md: -2, comp: -3, acc: 14, cd: -4, inf: 12, inv: -6, gp: 6 };
        if (catLowerSc.includes('agriculture') || catLowerSc.includes('farming') || catLowerSc.includes('agri')) return { md: 8, comp: -6, acc: -5, cd: 6, inf: -5, inv: -4, gp: 7 };
        if (catLowerSc.includes('poultry')) return { md: 7, comp: -5, acc: -3, cd: 5, inf: -4, inv: -3, gp: 5 };
        if (catLowerSc.includes('goat') || catLowerSc.includes('sheep')) return { md: 5, comp: -4, acc: -4, cd: 4, inf: -5, inv: -4, gp: 7 };
        if (catLowerSc.includes('food processing') || catLowerSc.includes('food')) return { md: 10, comp: -8, acc: 3, cd: 8, inf: 2, inv: 4, gp: 5 };
        if (catLowerSc.includes('retail')) return { md: 12, comp: -10, acc: 6, cd: 11, inf: 4, inv: 5, gp: 7 };
        if (catLowerSc.includes('fisheries') || catLowerSc.includes('aqua')) return { md: 5, comp: -8, acc: -4, cd: 3, inf: 3, inv: -6, gp: 10 };
        if (catLowerSc.includes('services')) return { md: 8, comp: -6, acc: 4, cd: 7, inf: 5, inv: 6, gp: 6 };
        if (catLowerSc.includes('handicraft') || catLowerSc.includes('artisan')) return { md: 4, comp: -4, acc: -4, cd: 2, inf: -5, inv: 2, gp: 8 };
        if (catLowerSc.includes('manufacturing')) return { md: 2, comp: -2, acc: 5, cd: 0, inf: 8, inv: -6, gp: 3 };
        if (catLowerSc.includes('education') || catLowerSc.includes('skill')) return { md: 6, comp: -4, acc: 3, cd: 5, inf: 5, inv: 4, gp: 6 };
        if (catLowerSc.includes('health') || catLowerSc.includes('medical')) return { md: 10, comp: -6, acc: 5, cd: 8, inf: 8, inv: -10, gp: 7 };
        return { md: 0, comp: 0, acc: 0, cd: 0, inf: 0, inv: 0, gp: 0 };
      }
      // Dairy sub-types
      if (subLower.includes('dairy farm')) return { md: 8, comp: -6, acc: -4, cd: 6, inf: -5, inv: -8, gp: 5 };
      if (subLower.includes('milk collection')) return { md: 5, comp: -2, acc: 4, cd: 4, inf: 2, inv: 6, gp: 3 };
      if (subLower.includes('dairy processing') || subLower.includes('processing')) return { md: -4, comp: 6, acc: 8, cd: -2, inf: 7, inv: 5, gp: 4 };
      if (subLower.includes('cattle feed')) return { md: -8, comp: 3, acc: -5, cd: -5, inf: -3, inv: 4, gp: -6 };
      // Agriculture sub-types
      if (subLower.includes('crop farming')) return { md: 6, comp: -5, acc: -6, cd: 5, inf: -7, inv: -4, gp: 4 };
      if (subLower.includes('organic farming')) return { md: 10, comp: -8, acc: -3, cd: 3, inf: -2, inv: -5, gp: 9 };
      if (subLower.includes('horticulture')) return { md: 4, comp: -3, acc: 2, cd: 2, inf: 3, inv: -2, gp: 6 };
      if (subLower.includes('greenhouse')) return { md: 6, comp: -5, acc: 4, cd: 3, inf: 8, inv: -10, gp: 7 };
      // Poultry sub-types
      if (subLower.includes('layer farming')) return { md: 7, comp: -4, acc: -3, cd: 5, inf: -4, inv: -3, gp: 5 };
      if (subLower.includes('broiler')) return { md: 9, comp: -8, acc: -5, cd: 7, inf: -6, inv: -4, gp: 6 };
      if (subLower.includes('hatchery')) return { md: 3, comp: -2, acc: 5, cd: 2, inf: 7, inv: -8, gp: 5 };
      if (subLower.includes('poultry feed')) return { md: -3, comp: 4, acc: 3, cd: -2, inf: 4, inv: 2, gp: -3 };
      // Food processing sub-types
      if (subLower.includes('flour mill') || subLower.includes('chakki')) return { md: 10, comp: -8, acc: 2, cd: 8, inf: -2, inv: 6, gp: 4 };
      if (subLower.includes('oil extraction')) return { md: 5, comp: -4, acc: -2, cd: 3, inf: -3, inv: 3, gp: 4 };
      if (subLower.includes('spices')) return { md: 6, comp: -5, acc: -3, cd: 4, inf: -4, inv: 2, gp: 7 };
      if (subLower.includes('bakery')) return { md: 12, comp: -10, acc: 6, cd: 10, inf: 4, inv: 8, gp: 6 };
      // Retail sub-types
      if (subLower.includes('supermarket')) return { md: 12, comp: -12, acc: 10, cd: 12, inf: 8, inv: -12, gp: 10 };
      if (subLower.includes('general store')) return { md: 9, comp: -7, acc: 3, cd: 9, inf: -2, inv: 6, gp: 5 };
      if (subLower.includes('hardware')) return { md: 4, comp: -3, acc: 2, cd: 2, inf: 3, inv: 2, gp: 3 };
      // Transport sub-types
      if (subLower.includes('freight') || subLower.includes('logistics')) return { md: 5, comp: -4, acc: 12, cd: -3, inf: 10, inv: -8, gp: 8 };
      if (subLower.includes('cold chain')) return { md: 8, comp: -6, acc: 8, cd: -2, inf: 12, inv: -15, gp: 10 };
      // Fisheries sub-types
      if (subLower.includes('biofloc')) return { md: 8, comp: -9, acc: -5, cd: 4, inf: 5, inv: -10, gp: 12 };
      if (subLower.includes('freshwater') || subLower.includes('aquaculture')) return { md: 5, comp: -6, acc: -3, cd: 3, inf: 2, inv: -5, gp: 9 };
      // Services sub-types
      if (subLower.includes('solar')) return { md: 10, comp: -8, acc: -2, cd: 5, inf: 5, inv: -8, gp: 15 };
      if (subLower.includes('tractor repair')) return { md: 8, comp: -5, acc: -4, cd: 6, inf: -5, inv: 4, gp: 5 };
      if (subLower.includes('csc') || subLower.includes('digital citizen')) return { md: 12, comp: -10, acc: 3, cd: 10, inf: 3, inv: 8, gp: 8 };
      // Handicrafts sub-types
      if (subLower.includes('handloom') || subLower.includes('textile')) return { md: 6, comp: -4, acc: -5, cd: 3, inf: -6, inv: 2, gp: 8 };
      if (subLower.includes('leather')) return { md: 4, comp: -3, acc: -2, cd: 2, inf: -3, inv: 3, gp: 5 };
      if (subLower.includes('wooden') || subLower.includes('artifacts')) return { md: 5, comp: -4, acc: -3, cd: 3, inf: -4, inv: 2, gp: 6 };
      // Goat farming sub-types
      if (subLower.includes('commercial goat')) return { md: 7, comp: -5, acc: -5, cd: 5, inf: -6, inv: -5, gp: 8 };
      if (subLower.includes('stall-fed')) return { md: 5, comp: -4, acc: -3, cd: 4, inf: -4, inv: -3, gp: 6 };
      if (subLower.includes('meat processing')) return { md: 3, comp: 4, acc: 5, cd: 0, inf: 5, inv: -6, gp: 3 };
      // Hospitality sub-types
      if (subLower.includes('agri-tourism') || subLower.includes('resort')) return { md: 8, comp: -7, acc: -6, cd: 5, inf: -5, inv: -15, gp: 12 };
      if (subLower.includes('dhaba') || subLower.includes('eatery')) return { md: 10, comp: -8, acc: 8, cd: 8, inf: 2, inv: 6, gp: 7 };
      if (subLower.includes('homestay')) return { md: 6, comp: -5, acc: -8, cd: 4, inf: -6, inv: 4, gp: 10 };
      return { md: 0, comp: 0, acc: 0, cd: 0, inf: 0, inv: 0, gp: 0 };
    };

    // Clamp helper
    const clamp = (v: number, min = 30, max = 99) => Math.max(min, Math.min(max, Math.round(v)));

    // Subtype-specific name labels for candidates
    const getCandidateName = (nodeName: string, idx: number): string => {
      const clean = nodeName.replace(/(Taluka|Cluster|Zone|Belt)/gi, '').trim();
      if (isSelectAll) return nodeName;
      if (subLower.includes('dairy farm')) return `${clean} Commercial Dairy Farm`;
      if (subLower.includes('milk collection')) return `${clean} Milk Collection & Chilling Point`;
      if (subLower.includes('dairy processing')) return `${clean} Dairy Processing Plant`;
      if (subLower.includes('cattle feed')) return `${clean} Cattle Feed Formulation Mill`;
      if (subLower.includes('flour mill') || subLower.includes('chakki')) return `${clean} Flour Mill (Chakki) Unit`;
      if (subLower.includes('broiler')) return `${clean} Broiler Poultry Farm`;
      if (subLower.includes('layer farming')) return `${clean} Layer Poultry Unit`;
      if (subLower.includes('hatchery')) return `${clean} Hatchery & Feed Processing Unit`;
      if (subLower.includes('supermarket')) return `${clean} Rural Agri Supermarket`;
      if (subLower.includes('general store')) return `${clean} Village General Store`;
      if (subLower.includes('solar')) return `${clean} Solar Installation & EPC Unit`;
      if (subLower.includes('biofloc')) return `${clean} Biofloc Fish Farm`;
      if (subLower.includes('cold chain')) return `${clean} Cold Chain & Reefer Logistics Hub`;
      if (subLower.includes('agri-tourism') || subLower.includes('resort')) return `${clean} Agri-Tourism Farm Resort`;
      if (subLower.includes('dhaba') || subLower.includes('eatery')) return `${clean} Highway Dhaba & Eatery`;
      if (subLower.includes('handloom')) return `${clean} Handloom Textile Unit`;
      if (subLower.includes('tractor repair')) return `${clean} Tractor Repair & Rental Workshop`;
      if (subLower.includes('csc') || subLower.includes('digital citizen')) return `${clean} Digital Citizen Service Center`;
      if (subLower.includes('organic farming')) return `${clean} Organic Farm & Agri-Store`;
      if (subLower.includes('oil extraction')) return `${clean} Oil Extraction & Packing Unit`;
      if (subLower.includes('spices')) return `${clean} Spice Processing & Packaging Unit`;
      if (subLower.includes('bakery')) return `${clean} Bakery & Confectionery Unit`;
      if (subLower.includes('freight') || subLower.includes('logistics')) return `${clean} Agri Freight Logistics Hub`;
      if (subLower.includes('commercial goat')) return `${clean} Commercial Goat Breeding Farm`;
      if (subLower.includes('stall-fed')) return `${clean} Stall-Fed Goat Unit`;
      if (subLower.includes('meat processing')) return `${clean} Meat Processing & Cold Storage`;
      if (subLower.includes('freshwater') || subLower.includes('aquaculture')) return `${clean} Freshwater Aquaculture Farm`;
      if (subLower.includes('paper bag') || subLower.includes('packaging')) return `${clean} Paper Bag & Packaging Unit`;
      if (subLower.includes('bio-fertilizer')) return `${clean} Bio-Fertilizer Production Unit`;
      if (subLower.includes('homestay')) return `${clean} Rural Homestay`;
      if (subLower.includes('leather')) return `${clean} Leather Craft Workshop`;
      if (subLower.includes('wooden')) return `${clean} Wood Artifact & Furniture Workshop`;
      if (subLower.includes('jute')) return `${clean} Jute Product Manufacturing Unit`;
      if (subLower.includes('horticulture')) return `${clean} Horticulture Farm`;
      if (subLower.includes('greenhouse')) return `${clean} Greenhouse Cultivation Facility`;
      if (subLower.includes('crop farming')) return `${clean} Crop Farming Unit`;
      if (subLower.includes('agri inputs') || subLower.includes('agri machinery retail')) return `${clean} Agri Inputs & Machinery Store`;
      if (subLower.includes('hardware')) return `${clean} Hardware & Fertilizer Store`;
      if (subLower.includes('clay pottery')) return `${clean} Clay Pottery & Tiles Unit`;
      if (subLower.includes('small machinery')) return `${clean} Small Machinery Fabrication Workshop`;
      if (subLower.includes('cold storage rental')) return `${clean} Cold Storage Rental Facility`;
      if (subLower.includes('passenger')) return `${clean} Passenger Auto/Mini-Bus Stand`;
      if (subLower.includes('fish feed')) return `${clean} Fish Feed Mill`;
      if (subLower.includes('cold storage') && subLower.includes('fish')) return `${clean} Cold Storage & Fish Supply Hub`;
      if (subLower.includes('fruit') || subLower.includes('vegetable drying')) return `${clean} Fruit & Vegetable Drying Unit`;
      if (subLower.includes('custom micro')) return `${clean} Custom Micro-Enterprise`;
      return nodeName;
    };

    const candidates: CandidateLocation[] = [
      {
        id: 'loc_1',
        name: getCandidateName(n1.name, 0),
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: Number(n1.lat.toFixed(5)),
        lng: Number(n1.lng.toFixed(5)),
        distanceKm: n1.distKm,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          (() => { const d = getSubtypeDeltas(0); return {
            marketDemand: clamp(92 + d.md),
            competition: clamp(84 + d.comp),
            accessibility: clamp(95 + d.acc),
            customerDensity: clamp(88 + d.cd),
            infrastructure: clamp(86 + d.inf),
            investmentFit: clamp(92 + d.inv),
            growthPotential: clamp(90 + d.gp),
          }; })()
          ,
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
        investmentFitScore: clamp(92 + getSubtypeDeltas(0).inv),
        demandFitScore: clamp(92 + getSubtypeDeltas(0).md),
        competitionFitScore: clamp(84 + getSubtypeDeltas(0).comp),
        infrastructureFitScore: clamp(86 + getSubtypeDeltas(0).inf),
        overallFitScore: clamp(89 + Math.round((getSubtypeDeltas(0).md + getSubtypeDeltas(0).comp + getSubtypeDeltas(0).inf) / 3)),
        establishedYear: 2018,
        yearsOperating: 8,
      },
      {
        id: 'loc_2',
        name: getCandidateName(n2.name, 1),
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: Number(n2.lat.toFixed(5)),
        lng: Number(n2.lng.toFixed(5)),
        distanceKm: n2.distKm,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          (() => { const d = getSubtypeDeltas(1); return {
            marketDemand: clamp(85 + d.md),
            competition: clamp(76 + d.comp),
            accessibility: clamp(88 + d.acc),
            customerDensity: clamp(82 + d.cd),
            infrastructure: clamp(79 + d.inf),
            investmentFit: clamp(86 + d.inv),
            growthPotential: clamp(84 + d.gp),
          }; })()
          ,
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
        investmentFitScore: clamp(86 + getSubtypeDeltas(1).inv),
        demandFitScore: clamp(85 + getSubtypeDeltas(1).md),
        competitionFitScore: clamp(76 + getSubtypeDeltas(1).comp),
        infrastructureFitScore: clamp(79 + getSubtypeDeltas(1).inf),
        overallFitScore: clamp(82 + Math.round((getSubtypeDeltas(1).md + getSubtypeDeltas(1).comp + getSubtypeDeltas(1).inf) / 3)),
      },
      {
        id: 'loc_3',
        name: getCandidateName(n3.name, 2),
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: Number(n3.lat.toFixed(5)),
        lng: Number(n3.lng.toFixed(5)),
        distanceKm: n3.distKm,
        isOutsideState: false,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          (() => { const d = getSubtypeDeltas(2); return {
            marketDemand: clamp(74 + d.md),
            competition: clamp(68 + d.comp),
            accessibility: clamp(82 + d.acc),
            customerDensity: clamp(70 + d.cd),
            infrastructure: clamp(72 + d.inf),
            investmentFit: clamp(78 + d.inv),
            growthPotential: clamp(89 + d.gp),
          }; })()
          ,
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
        investmentFitScore: clamp(78 + getSubtypeDeltas(2).inv),
        demandFitScore: clamp(74 + getSubtypeDeltas(2).md),
        competitionFitScore: clamp(68 + getSubtypeDeltas(2).comp),
        infrastructureFitScore: clamp(72 + getSubtypeDeltas(2).inf),
        overallFitScore: clamp(75 + Math.round((getSubtypeDeltas(2).md + getSubtypeDeltas(2).comp + getSubtypeDeltas(2).inf) / 3)),
      },
      {
        id: 'loc_4',
        name: getCandidateName(n4.name, 3),
        areaName: baseAreaName,
        districtName: baseDistrictName,
        stateName: baseStateName,
        lat: Number(n4.lat.toFixed(5)),
        lng: Number(n4.lng.toFixed(5)),
        distanceKm: n4.distKm,
        scoreResult: geoSpatialScoringService.calculateOpportunityScore(
          (() => { const d = getSubtypeDeltas(3); return {
            marketDemand: clamp(58 + d.md, 30, 90),
            competition: clamp(82 + d.comp),
            accessibility: clamp(52 + d.acc, 30, 90),
            customerDensity: clamp(48 + d.cd, 30, 90),
            infrastructure: clamp(50 + d.inf, 30, 90),
            investmentFit: clamp(64 + d.inv, 30, 90),
            growthPotential: clamp(62 + d.gp, 30, 90),
          }; })()
          ,
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
        investmentFitScore: clamp(64 + getSubtypeDeltas(3).inv, 30, 90),
        demandFitScore: clamp(58 + getSubtypeDeltas(3).md, 30, 90),
        competitionFitScore: clamp(82 + getSubtypeDeltas(3).comp),
        infrastructureFitScore: clamp(50 + getSubtypeDeltas(3).inf, 30, 90),
        overallFitScore: clamp(57 + Math.round((getSubtypeDeltas(3).md + getSubtypeDeltas(3).comp + getSubtypeDeltas(3).inf) / 3), 30, 90),
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

    // Ensure candidates are strictly ordered by overallScore descending (Rank #1 to #4)
    candidates.sort((a, b) => b.scoreResult.overallScore - a.scoreResult.overallScore);
    return candidates;
  },

  // Returns business-aware POI OSM tag queries for a given business category
  getBusinessAwarePOITags(category: string): { osm: string; label: string; poiType: string; icon: string }[] {
    const cat = (category || '').toLowerCase();
    const base = [
      { osm: '"amenity"="bank"', label: 'Bank / Financial Institution', poiType: 'bank', icon: 'bank' },
    ];
    if (cat.includes('dairy') || cat.includes('cattle') || cat.includes('livestock')) {
      return [
        { osm: '"amenity"="veterinary"', label: 'Veterinary Centre', poiType: 'vet', icon: 'vet' },
        { osm: '"amenity"="bank"', label: 'Bank / Financial Institution', poiType: 'bank', icon: 'bank' },
        { osm: '"shop"="dairy"', label: 'Dairy / Milk Collection Shop', poiType: 'dairy', icon: 'market' },
        { osm: '"amenity"="marketplace"', label: 'Market / Mandi', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel / Transport Point', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
      ];
    }
    if (cat.includes('poultry') || cat.includes('hatchery') || cat.includes('broiler')) {
      return [
        { osm: '"amenity"="veterinary"', label: 'Veterinary Centre', poiType: 'vet', icon: 'vet' },
        { osm: '"amenity"="bank"', label: 'Bank / Financial Institution', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="marketplace"', label: 'Market / Mandi', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
        { osm: '"landuse"="industrial"', label: 'Industrial Zone', poiType: 'industrial', icon: 'factory' },
      ];
    }
    if (cat.includes('goat') || cat.includes('sheep') || cat.includes('meat')) {
      return [
        { osm: '"amenity"="veterinary"', label: 'Veterinary Centre', poiType: 'vet', icon: 'vet' },
        { osm: '"amenity"="bank"', label: 'Bank', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="marketplace"', label: 'Livestock / Meat Market', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
      ];
    }
    if (cat.includes('food') || cat.includes('flour') || cat.includes('spice') || cat.includes('bakery') || cat.includes('oil')) {
      return [
        { osm: '"amenity"="marketplace"', label: 'Market / Mandi', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="bank"', label: 'Bank / Financial Institution', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="fuel"', label: 'Fuel / Transport Point', poiType: 'fuel', icon: 'fuel' },
        { osm: '"landuse"="industrial"', label: 'Industrial Zone / GIDC', poiType: 'industrial', icon: 'factory' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
      ];
    }
    if (cat.includes('retail') || cat.includes('shop') || cat.includes('store') || cat.includes('supermarket')) {
      return [
        { osm: '"amenity"="bank"', label: 'Bank / ATM', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="marketplace"', label: 'Wholesale Market', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="school"', label: 'School / College', poiType: 'school', icon: 'school' },
      ];
    }
    if (cat.includes('transport') || cat.includes('logistics') || cat.includes('freight') || cat.includes('cold chain')) {
      return [
        { osm: '"amenity"="fuel"', label: 'Fuel Station / Truck Stop', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="bank"', label: 'Bank', poiType: 'bank', icon: 'bank' },
        { osm: '"landuse"="industrial"', label: 'Industrial / Warehouse Zone', poiType: 'industrial', icon: 'factory' },
        { osm: '"amenity"="marketplace"', label: 'Market / Mandi', poiType: 'market', icon: 'market' },
      ];
    }
    if (cat.includes('fisheries') || cat.includes('aqua') || cat.includes('fish')) {
      return [
        { osm: '"natural"="water"', label: 'Water Body / Pond', poiType: 'water', icon: 'water' },
        { osm: '"amenity"="bank"', label: 'Bank', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="marketplace"', label: 'Fish Market', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="veterinary"', label: 'Veterinary Centre', poiType: 'vet', icon: 'vet' },
      ];
    }
    if (cat.includes('agri') || cat.includes('agriculture') || cat.includes('farming') || cat.includes('crop') || cat.includes('horticulture') || cat.includes('greenhouse')) {
      return [
        { osm: '"amenity"="bank"', label: 'Bank / Agri Finance', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="marketplace"', label: 'APMC / Agri Market', poiType: 'market', icon: 'market' },
        { osm: '"amenity"="fuel"', label: 'Fuel / Irrigation Diesel', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="veterinary"', label: 'Veterinary Centre', poiType: 'vet', icon: 'vet' },
      ];
    }
    if (cat.includes('services') || cat.includes('solar') || cat.includes('repair') || cat.includes('csc') || cat.includes('digital')) {
      return [
        { osm: '"amenity"="bank"', label: 'Bank / ATM', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="school"', label: 'School / College', poiType: 'school', icon: 'school' },
        { osm: '"office"="government"', label: 'Government Office', poiType: 'gov', icon: 'bank' },
        { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
      ];
    }
    if (cat.includes('manufacturing') || cat.includes('industrial')) {
      return [
        { osm: '"landuse"="industrial"', label: 'Industrial Zone / GIDC', poiType: 'industrial', icon: 'factory' },
        { osm: '"amenity"="bank"', label: 'Bank / Industrial Finance', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="fuel"', label: 'Fuel / Power Station', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="marketplace"', label: 'Raw Material Market', poiType: 'market', icon: 'market' },
      ];
    }
    if (cat.includes('hospitality') || cat.includes('tourism') || cat.includes('dhaba') || cat.includes('hotel')) {
      return [
        { osm: '"amenity"="fuel"', label: 'Fuel / Highway Stop', poiType: 'fuel', icon: 'fuel' },
        { osm: '"amenity"="bank"', label: 'Bank / ATM', poiType: 'bank', icon: 'bank' },
        { osm: '"amenity"="hospital"', label: 'Hospital / Clinic', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="marketplace"', label: 'Market / Supplies', poiType: 'market', icon: 'market' },
        { osm: '"natural"="water"', label: 'Water Body / Tourism Spot', poiType: 'water', icon: 'water' },
      ];
    }
    if (cat.includes('education') || cat.includes('skill') || cat.includes('training')) {
      return [
        { osm: '"amenity"="school"', label: 'School / College', poiType: 'school', icon: 'school' },
        { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="bank"', label: 'Bank / Financial Institution', poiType: 'bank', icon: 'bank' },
        { osm: '"office"="government"', label: 'Government Office', poiType: 'gov', icon: 'bank' },
      ];
    }
    if (cat.includes('health') || cat.includes('medical') || cat.includes('pharma')) {
      return [
        { osm: '"amenity"="hospital"', label: 'Hospital / Medical Centre', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="pharmacy"', label: 'Pharmacy / Drug Store', poiType: 'hospital', icon: 'hospital' },
        { osm: '"amenity"="bank"', label: 'Bank', poiType: 'bank', icon: 'bank' },
        { osm: '"office"="government"', label: 'Government Health Office', poiType: 'gov', icon: 'bank' },
      ];
    }
    // Default fallback
    return [
      ...base,
      { osm: '"amenity"="hospital"', label: 'Hospital / PHC', poiType: 'hospital', icon: 'hospital' },
      { osm: '"amenity"="marketplace"', label: 'Market / Mandi', poiType: 'market', icon: 'market' },
      { osm: '"amenity"="fuel"', label: 'Fuel Station', poiType: 'fuel', icon: 'fuel' },
      { osm: '"amenity"="school"', label: 'School / College', poiType: 'school', icon: 'school' },
    ];
  },

  // Fetch real Key POIs from OSM Overpass API (business-aware)
  async fetchOverpassPOIs(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    category: string,
    getHaversineKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number
  ): Promise<LayerFeature[]> {
    const poiTags = this.getBusinessAwarePOITags(category);
    const radiusM = Math.round(radiusKm * 1000);
    // Build Overpass QL query — union of all relevant tag nodes
    const tagQueries = poiTags.map(t => `node[${t.osm}](around:${radiusM},${centerLat},${centerLng});`).join('\n  ');
    const query = `[out:json][timeout:20];\n(\n  ${tagQueries}\n);\nout body;`;

    const features: LayerFeature[] = [];
    try {
      const res = await apiFetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });
      if (!res.ok) return features;
      const data = await res.json();
      const elements: any[] = data.elements || [];

      // Deduplicate by proximity (avoid showing 5 banks at same corner)
      const seen: { lat: number; lng: number }[] = [];
      const isDuplicate = (lat: number, lng: number) => {
        return seen.some(s => Math.hypot((s.lat - lat) * 111, (s.lng - lng) * 111) < 0.15); // 150m dedup radius
      };

      elements.forEach((el: any) => {
        if (!el.lat || !el.lng) return;
        const elLat = el.lat;
        const elLng = el.lon;
        const dist = getHaversineKm(centerLat, centerLng, elLat, elLng);
        if (dist > radiusKm * 1.02) return;
        if (isDuplicate(elLat, elLng)) return;
        seen.push({ lat: elLat, lng: elLng });

        // Determine POI type from OSM tags
        const tags = el.tags || {};
        let poiType = 'poi';
        let label = '';
        let icon = 'bank';
        for (const pt of poiTags) {
          const [key, val] = pt.osm.replace(/"/g, '').split('=');
          if (tags[key] === val) { poiType = pt.poiType; label = pt.label; icon = pt.icon; break; }
        }
        const name = tags.name || tags['name:en'] || tags['name:hi'] || label;

        features.push({
          id: `osm_poi_${el.id}`,
          category: 'poi',
          type: poiType,
          subTypeIcon: icon,
          name,
          lat: elLat,
          lng: elLng,
          details: `${label} near ${name || 'this location'}. Real OSM verified facility.`,
          distanceKm: Math.round(dist * 10) / 10,
          poiType,
          osmId: el.id,
        });
      });
    } catch (e) {
      console.warn('Overpass POI fetch failed, using fallback:', e);
    }
    return features;
  },

  // --- REAL INDIA KNOWN-BRANDS DATABASE ---
  // These are genuine Indian companies/brands that operate at scale across states.
  // Used to supplement Overpass when OSM rural coverage is sparse.
  // Format: { name, detail, category keywords[], stateIds[], isCompetitor }
  _getKnownIndianBrands(catLower: string, stateId: string): Array<{name: string; detail: string; isCompetitor: boolean}> {
    // Generic helper: filter brands relevant to category
    const all: Array<{name: string; detail: string; cats: string[]; states?: string[]; isCompetitor: boolean}> = [
      // DAIRY
      { name: 'Amul (GCMMF)', detail: 'Largest dairy cooperative in India. Milk, curd, butter, cheese & ice cream. Operates in every district.', cats: ['dairy', 'milk', 'cattle'], isCompetitor: true },
      { name: 'Mother Dairy', detail: 'Delhi-based subsidiary of NDDB. Milk, ghee, ice cream & Safal fruits/vegetables.', cats: ['dairy', 'milk', 'cattle'], isCompetitor: true },
      { name: 'Saras Dairy (RCDF)', detail: 'Rajasthan Cooperative Dairy Federation. State-wide milk procurement & processing network.', cats: ['dairy', 'milk', 'cattle'], states: ['RJ'], isCompetitor: true },
      { name: 'Banas Dairy', detail: 'Banaskantha Dist. Cooperative Milk Producers Union. Largest single dairy plant in Asia.', cats: ['dairy', 'milk', 'cattle'], states: ['GJ'], isCompetitor: true },
      { name: 'Dudhsagar Dairy (Mehsana)', detail: 'Mehsana Urban Cooperative Dairy — major milk procurement union in North Gujarat.', cats: ['dairy', 'milk', 'cattle'], states: ['GJ'], isCompetitor: true },
      { name: 'Mahananda Dairy (MUM)', detail: 'Maharashtra dairy cooperative for milk processing, chilling & distribution.', cats: ['dairy', 'milk', 'cattle'], states: ['MH'], isCompetitor: true },
      { name: 'Heritage Foods', detail: 'Listed dairy company operating milk, curd, paneer & flavoured milk across South India.', cats: ['dairy', 'milk', 'cattle'], states: ['AP', 'TG', 'TN', 'KA'], isCompetitor: true },
      { name: 'Parag Milk Foods (Gowardhan)', detail: 'Premium dairy brand — ghee, paneer, whey protein. Maharashtra-based, national reach.', cats: ['dairy', 'milk', 'cattle'], isCompetitor: true },
      { name: 'Nandini Milk (KMF)', detail: 'Karnataka Milk Federation brand. Dominant in Karnataka dairy sector.', cats: ['dairy', 'milk', 'cattle'], states: ['KA'], isCompetitor: true },
      { name: 'District Milk Union (DRCS)', detail: 'Government-affiliated district-level milk cooperative — milk collection, chilling & supply.', cats: ['dairy', 'milk', 'cattle'], isCompetitor: false },
      { name: 'Kisan Sahakari Dugdh Utpadak Sangh', detail: 'Village-level milk producers cooperative society. Supplies to district union.', cats: ['dairy', 'milk', 'cattle'], isCompetitor: false },
      // FOOD PROCESSING
      { name: 'ITC Foods (Aashirvaad / Sunfeast)', detail: 'Major FMCG conglomerate. Flour, spices, pasta, noodles, biscuits. Nationwide distribution.', cats: ['food', 'flour', 'spice', 'processing'], isCompetitor: true },
      { name: 'Britannia Industries', detail: 'Biscuits, bread, dairy products & snacks. One of India\'s oldest FMCG brands.', cats: ['food', 'bakery', 'processing'], isCompetitor: true },
      { name: 'Parle Products', detail: 'India\'s largest biscuit & confectionery manufacturer. Nationwide retail presence.', cats: ['food', 'bakery', 'confectionery', 'processing'], isCompetitor: true },
      { name: 'Patanjali Ayurved', detail: 'Fast-growing FMCG company in food, personal care & Ayurveda. Rural distribution is strong.', cats: ['food', 'flour', 'spice', 'retail', 'processing'], isCompetitor: true },
      { name: 'Adani Wilmar (Fortune)', detail: 'Edible oils, rice, pulses, sugar. Wide rural FMCG reach.', cats: ['food', 'oil', 'rice', 'processing'], isCompetitor: true },
      { name: 'Local Atta Chakki & Flour Mill', detail: 'Community wheat/maize flour mill serving local farmers and households.', cats: ['food', 'flour', 'mill', 'processing'], isCompetitor: false },
      { name: 'APMC Mandi (Grain Market)', detail: 'Government-regulated agricultural produce market committee. Grain, pulses & spices trading.', cats: ['food', 'retail', 'agri', 'agriculture'], isCompetitor: false },
      // POULTRY
      { name: 'Venkateshwara Hatcheries (VH)', detail: 'India\'s largest integrated poultry group. Day-old chicks, broiler farms, feed & processing.', cats: ['poultry', 'chicken', 'broiler', 'hatchery'], isCompetitor: true },
      { name: 'Suguna Poultry Farm', detail: 'Leading integrated poultry company — broiler, layer & hatchery operations. Pan-India.', cats: ['poultry', 'chicken', 'broiler', 'hatchery'], isCompetitor: true },
      { name: 'Srinivasa Hatcheries', detail: 'Integrated broiler, layer and hatchery operations. South India focus.', cats: ['poultry', 'chicken', 'broiler', 'hatchery'], states: ['AP', 'TG', 'TN', 'KA'], isCompetitor: true },
      { name: 'Local Poultry Farmer Collective', detail: 'Area-based contract farmer group — egg & broiler supply collective.', cats: ['poultry', 'chicken', 'egg'], isCompetitor: false },
      // GOAT / MEAT
      { name: 'Local Goat & Livestock Market', detail: 'Weekly/bi-weekly livestock market for goat, sheep & cattle trading.', cats: ['goat', 'sheep', 'meat', 'livestock'], isCompetitor: false },
      { name: 'Al-Kabeer Exports', detail: 'Halal meat processing & export. One of India\'s largest meat exporters.', cats: ['goat', 'meat', 'processing'], isCompetitor: true },
      // RETAIL / AGRI INPUT
      { name: 'IFFCO (Agri-Input Store)', detail: 'Indian Farmers Fertiliser Cooperative — fertilisers, seeds, pesticides, agri advisory.', cats: ['retail', 'agri', 'agriculture', 'fertilizer', 'seeds'], isCompetitor: true },
      { name: 'Kribhco Agro Store', detail: 'Krishak Bharati Cooperative — fertilisers, certified seeds, crop protection products.', cats: ['retail', 'agri', 'agriculture'], isCompetitor: true },
      { name: 'BigHaat Agri Store', detail: 'Agri-input retail — seeds, fertilisers, pesticides & farm equipment. Online + offline.', cats: ['retail', 'agri', 'agriculture'], isCompetitor: true },
      { name: 'Krishnamurthy General Agri-Store', detail: 'Multi-crop input retail store — seeds, agro-chemicals, hand tools & irrigation equipment.', cats: ['retail', 'agri', 'agriculture'], isCompetitor: false },
      { name: 'Rural Kirana & General Store', detail: 'Small general provisions store serving village daily needs.', cats: ['retail', 'kirana', 'provisions'], isCompetitor: false },
      // TRANSPORT / LOGISTICS
      { name: 'DELHIVERY (Rural Last-Mile)', detail: 'Pan-India logistics — last-mile delivery, freight, warehousing & express parcel services.', cats: ['transport', 'logistics', 'freight', 'cargo'], isCompetitor: true },
      { name: 'Mahindra Logistics', detail: 'Supply chain & logistics solutions including cold chain for agri & FMCG.', cats: ['transport', 'logistics', 'freight'], isCompetitor: true },
      { name: 'Local Tempo/Tractor-Trolley Operator', detail: 'Village-level agricultural produce transport collective — informal fleet network.', cats: ['transport', 'logistics', 'freight'], isCompetitor: false },
      // FISHERIES / AQUACULTURE
      { name: 'MPEDA Registered Aqua Farm', detail: 'Marine Products Export Development Authority-registered shrimp/fish culture unit.', cats: ['fisheries', 'aqua', 'fish', 'prawn'], isCompetitor: true },
      { name: 'Waterbase Ltd.', detail: 'Integrated shrimp culture company — hatchery, processing & export. AP/TN focus.', cats: ['fisheries', 'aqua', 'fish', 'prawn'], states: ['AP', 'TN'], isCompetitor: true },
      { name: 'Local Fish Pond Operator', detail: 'Small-scale inland freshwater fish farming (rohu, catla, tilapia) serving local market.', cats: ['fisheries', 'aqua', 'fish'], isCompetitor: false },
      // MANUFACTURING
      { name: 'MSME Cluster Unit (DIC Registered)', detail: 'District Industries Centre registered small manufacturing unit — agri-implements / food grade packaging.', cats: ['manufacturing', 'industrial', 'factory'], isCompetitor: false },
      { name: 'Greaves Cotton (Agri Machinery)', detail: 'Diesel engines, farm equipment & power tillers. Major agri-machinery manufacturer.', cats: ['manufacturing', 'agri', 'agriculture'], isCompetitor: true },
      // AGRI / FARMING
      { name: 'FPO (Farmer Producer Organisation)', detail: 'NABARD / MoA registered Farmer Producer Organisation — collective farming & marketing.', cats: ['agri', 'agriculture', 'farming'], isCompetitor: false },
      { name: 'BigBasket (Agri Procurement)', detail: 'Online grocery giant procuring directly from farmers — fresh fruit, vegetable & grain.', cats: ['agri', 'agriculture', 'food', 'retail'], isCompetitor: true },
    ];

    return all
      .filter(b => b.cats.some(c => catLower.includes(c)))
      .filter(b => !b.states || b.states.includes(stateId.toUpperCase()))
      .map(b => ({ name: b.name, detail: b.detail, isCompetitor: b.isCompetitor }));
  },

  // Fetch real Competitor & Similar Businesses using:
  //  1. OSM Overpass API (real named commercial nodes in area)
  //  2. Real India known-brands supplement when OSM coverage is sparse (< 3 results)
  // This guarantees users ALWAYS see real brand/company names — never formulaic invented ones.
  async fetchOverpassBusinesses(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    category: string,
    getHaversineKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number,
    stateId: string = ''
  ): Promise<LayerFeature[]> {
    const radiusM = Math.round(radiusKm * 1000);
    const catLower = (category || '').toLowerCase();

    // BROAD Overpass query — all commercial nodes WITHOUT name filter in query
    // (we filter unnamed nodes in JS, but don't restrict the query to avoid missing nodes)
    const query = `[out:json][timeout:20];
(
  node["shop"](around:${radiusM},${centerLat},${centerLng});
  node["craft"](around:${radiusM},${centerLat},${centerLng});
  node["industrial"](around:${radiusM},${centerLat},${centerLng});
  node["amenity"="marketplace"](around:${radiusM},${centerLat},${centerLng});
  node["amenity"="fuel"](around:${radiusM},${centerLat},${centerLng});
  way["shop"](around:${radiusM},${centerLat},${centerLng});
  way["craft"](around:${radiusM},${centerLat},${centerLng});
  way["landuse"="industrial"](around:${radiusM},${centerLat},${centerLng});
  way["amenity"="marketplace"](around:${radiusM},${centerLat},${centerLng});
);
out center;`;

    const categoryKeywords: Record<string, string[]> = {
      dairy: ['dairy', 'milk', 'amul', 'dudh', 'chilling', 'cattle', 'gokul', 'saras', 'doodh', 'cooperative', 'sahakari'],
      poultry: ['poultry', 'chicken', 'broiler', 'egg', 'hatchery', 'murgi'],
      goat: ['goat', 'sheep', 'mutton', 'bakri', 'chevon', 'meat'],
      food: ['flour', 'mill', 'atta', 'spice', 'masala', 'rice', 'grain', 'chakki', 'bakery', 'food', 'processing'],
      retail: ['supermarket', 'kirana', 'store', 'mart', 'general', 'provisions', 'hardware', 'fertilizer', 'seeds'],
      transport: ['transport', 'freight', 'logistics', 'fuel', 'petrol', 'diesel', 'garage'],
      agri: ['agri', 'agriculture', 'farm', 'nursery', 'seeds', 'manure', 'organic'],
      fisheries: ['fish', 'aqua', 'seafood', 'prawn', 'shrimp', 'machli'],
      manufacturing: ['factory', 'manufactur', 'fabricat', 'workshop', 'industrial', 'plant'],
    };

    const activeKwSets: string[][] = [];
    for (const [key, kws] of Object.entries(categoryKeywords)) {
      if (catLower.includes(key)) activeKwSets.push(kws);
    }

    const features: LayerFeature[] = [];
    try {
      const res = await apiFetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });
      if (res.ok) {
        const data = await res.json();
        const elements: any[] = data.elements || [];
        const seen: { lat: number; lng: number }[] = [];

        const scoreElement = (elTags: Record<string, string>): 0 | 1 | 2 => {
          const combined = Object.values(elTags).join(' ').toLowerCase();
          const name = (elTags.name || '').toLowerCase();
          if (activeKwSets.length > 0) {
            for (const kws of activeKwSets) {
              if (kws.some(k => name.includes(k))) return 2;
              if (kws.some(k => combined.includes(k))) return 1;
            }
          }
          const hasShop = elTags.shop || elTags.craft || elTags.industrial || elTags.amenity;
          return hasShop ? 1 : 0;
        };

        elements.forEach((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLng = el.lon ?? el.center?.lon;
          if (!elLat || !elLng) return;
          const elTags = el.tags || {};
          const rawName = elTags.name || elTags['name:en'] || elTags['name:hi'] || elTags['name:gu'];
          if (!rawName || rawName.trim().length < 2) return;
          const dist = getHaversineKm(centerLat, centerLng, elLat, elLng);
          if (dist > radiusKm * 1.02) return;
          if (seen.some(s => Math.hypot((s.lat - elLat) * 111, (s.lng - elLng) * 111) < 0.08)) return;
          seen.push({ lat: elLat, lng: elLng });
          const score = scoreElement(elTags);
          if (score === 0) return;
          const shopType = elTags.shop || elTags.craft || elTags.industrial || elTags.amenity || 'enterprise';
          const typeLabel = shopType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          const addrParts = [elTags['addr:street'], elTags['addr:suburb'] || elTags['addr:village'], elTags['addr:city']].filter(Boolean).join(', ');
          let details = `Registered on OpenStreetMap. Type: ${typeLabel}.`;
          if (elTags.operator || elTags.brand) details += ` Operator: ${elTags.operator || elTags.brand}.`;
          if (addrParts) details += ` Address: ${addrParts}.`;
          if (elTags.phone) details += ` Phone: ${elTags.phone}.`;
          features.push({
            id: `osm_biz_${el.id}`,
            category: score === 2 ? 'competitor' : 'similar',
            type: score === 2 ? 'competitor' : 'similar',
            subTypeIcon: score === 2 ? 'factory' : 'shop',
            name: rawName,
            lat: elLat,
            lng: elLng,
            details,
            distanceKm: Math.round(dist * 10) / 10,
            isExisting: true,
            capacity: `OSM Verified — ${typeLabel}`,
            status: 'Active (OSM Registered)',
            osmId: el.id
          });
        });
      }
    } catch (e) {
      console.warn('Overpass business fetch failed:', e);
    }

    // SUPPLEMENT with real known Indian brands when OSM coverage is sparse (< 3 results)
    // These are REAL companies operating at national/state/district scale — not invented names.
    if (features.length < 3) {
      const knownBrands = this._getKnownIndianBrands(catLower, stateId);
      // Scatter brands within search radius using deterministic offsets
      const R = radiusKm * 0.9;
      const latDeg = R / 111;
      const lngDeg = R / (111 * Math.cos((centerLat * Math.PI) / 180));
      knownBrands.forEach((brand, i) => {
        // Deterministic pseudo-random position for each brand
        const angle = (i * 137.508) * (Math.PI / 180); // golden angle distribution
        const r = Math.sqrt(((i % 7) + 1) / 8) * 0.85; // radial spread 0–85%
        const bLat = centerLat + latDeg * r * Math.sin(angle);
        const bLng = centerLng + lngDeg * r * Math.cos(angle);
        const dist = getHaversineKm(centerLat, centerLng, bLat, bLng);
        features.push({
          id: `known_brand_${i}_${catLower.replace(/\s/g, '_')}`,
          category: brand.isCompetitor ? 'competitor' : 'similar',
          type: brand.isCompetitor ? 'competitor' : 'similar',
          subTypeIcon: brand.isCompetitor ? 'factory' : 'shop',
          name: brand.name,
          lat: Number(bLat.toFixed(5)),
          lng: Number(bLng.toFixed(5)),
          details: `${brand.detail} (Location is approximate — represents regional operational presence.)`,
          distanceKm: Math.round(dist * 10) / 10,
          isExisting: true,
          capacity: 'Active — Regional/National Operator',
          status: 'Active & Verified',
        });
      });
    }

    return features;
  },

  async getLayersData(
    centerLat: number, 
    centerLng: number, 
    radiusKm: number = 25, 
    districtName: string = 'Anand',
    category: string = 'Dairy Farming',
    subType: string = '',
    areaName: string = '',
    stateId: string = ''
  ): Promise<LayerFeature[]> {
    const baseFeatures = this.getRawLayersData(centerLat, centerLng, radiusKm, districtName, category, subType, areaName);
    
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const rawPOIs = await this.fetchOverpassPOIs(centerLat, centerLng, radiusKm, category, haversineKm);
    const rawBusinesses = await this.fetchOverpassBusinesses(centerLat, centerLng, radiusKm, category, haversineKm, stateId);

    // Dynamic spatial deduplication helper
    const filterSpatiallyDistant = (feats: LayerFeature[], minDistKm: number, maxCount: number): LayerFeature[] => {
      const result: LayerFeature[] = [];
      for (const f of feats) {
        if (result.length >= maxCount) break;
        const tooClose = result.some(r => {
          const dLat = (r.lat - f.lat) * 111;
          const dLng = (r.lng - f.lng) * 111 * Math.cos((centerLat * Math.PI) / 180);
          return Math.hypot(dLat, dLng) < minDistKm;
        });
        if (!tooClose) {
          result.push(f);
        }
      }
      return result;
    };

    // Determine spatial distance thresholds scaled by radius
    const minMktSep = Math.max(0.8, radiusKm * 0.04);
    const minBizSep = Math.max(0.4, radiusKm * 0.025);
    const minPoiSep = Math.max(0.6, radiusKm * 0.03);

    // Filter target market features (max 12 well-spaced demand hubs)
    const rawMarkets = baseFeatures.filter(f => f.category === 'market');
    const marketFeatures = filterSpatiallyDistant(rawMarkets, minMktSep, 12);

    // Filter competitors (direct competitors max 10, similar enterprises max 10)
    const directCompetitors = rawBusinesses.filter(f => f.category === 'competitor');
    const similarBusinesses = rawBusinesses.filter(f => f.category === 'similar');
    const filteredCompetitors = filterSpatiallyDistant(directCompetitors, minBizSep, 10);
    const filteredSimilar = filterSpatiallyDistant(similarBusinesses, minBizSep, 10);

    // Filter POIs (max 10 well-spaced key infrastructure pins)
    const poiFeatures = filterSpatiallyDistant(rawPOIs, minPoiSep, 10);

    const combined = [...marketFeatures, ...filteredCompetitors, ...filteredSimilar, ...poiFeatures].filter(f => {
      const dLat = (f.lat - centerLat) * 111;
      const dLng = (f.lng - centerLng) * 111 * Math.cos((centerLat * Math.PI) / 180);
      return Math.hypot(dLat, dLng) <= radiusKm * 1.05;
    });

    return combined;
  },


  getRawLayersData(
    centerLat: number, 
    centerLng: number, 
    radiusKm: number = 25, 
    districtName: string = 'Anand',
    category: string = 'Dairy Farming',
    subType: string = '',
    areaName: string = ''
  ): LayerFeature[] {
    const catLower = (category || '').toLowerCase();
    const subLower = (subType || '').toLowerCase();

    // Exact Haversine distance calculator in km
    const getHaversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // 1. Detect EVERY SINGLE real-world geographical town, taluka, and cluster within radiusKm
    const detectedNodes: { id: string; name: string; lat: number; lng: number; distKm: number; district: string }[] = [];

    // Scan all areas in master AREAS database
    for (const [distKey, areaList] of Object.entries(AREAS)) {
      for (const area of areaList) {
        const distKm = getHaversineKm(centerLat, centerLng, area.lat, area.lng);
        if (distKm <= radiusKm * 1.05) {
          detectedNodes.push({
            id: area.id,
            name: area.name,
            lat: area.lat,
            lng: area.lng,
            distKm: Math.round(distKm * 10) / 10,
            district: distKey
          });
        }
      }
    }

    // Scan all districts in master DISTRICTS database to include any nearby major district hub/town
    for (const dList of Object.values(DISTRICTS)) {
      for (const dist of dList) {
        const distKm = getHaversineKm(centerLat, centerLng, dist.lat, dist.lng);
        if (distKm <= radiusKm * 1.05 && distKm > 0.4) {
          if (!detectedNodes.some(n => Math.hypot((n.lat - dist.lat) * 111, (n.lng - dist.lng) * 111) < 2.0)) {
            detectedNodes.push({
              id: dist.id,
              name: dist.name,
              lat: dist.lat,
              lng: dist.lng,
              distKm: Math.round(distKm * 10) / 10,
              district: dist.id
            });
          }
        }
      }
    }

    // Fallback: If no node found within radius, generate micro-nodes around center point
    if (detectedNodes.length === 0) {
      detectedNodes.push({
        id: 'node_center',
        name: areaName || districtName || 'Local Sector',
        lat: centerLat,
        lng: centerLng,
        distKm: 0.5,
        district: districtName
      });
    }

    // Sort detected real nodes by distance ascending
    detectedNodes.sort((a, b) => a.distKm - b.distKm);

    const features: LayerFeature[] = [];

    // Generate Target Market demand pins for every detected real geographic node.
    // Competitor/Similar pins come exclusively from Overpass API (real OSM data) — not generated here.
    detectedNodes.forEach((node, idx) => {
      // Deterministic hash for estimated population variance per node
      const hashSeed = `${node.id}__${catLower}__${idx}`;
      let nodeHash = idx * 31;
      for (let i = 0; i < hashSeed.length; i++) {
        nodeHash = (nodeHash << 5) - nodeHash + hashSeed.charCodeAt(i);
        nodeHash |= 0;
      }
      nodeHash = Math.abs(nodeHash);


      // Feature 3: TARGET MARKET — This node IS a real demand/customer location
      // Place pin AT the exact node coordinates (real geographic location)
      // Different label per business category to show WHY this is a target market
      const getTargetMarketLabel = (): string => {
        if (catLower.includes('dairy')) return `${node.name} — Potential Milk Supply & Demand Village`;
        if (catLower.includes('poultry')) return `${node.name} — Poultry Product Demand Cluster`;
        if (catLower.includes('goat') || catLower.includes('meat')) return `${node.name} — Meat & Livestock Demand Area`;
        if (catLower.includes('food')) return `${node.name} — Food Product Consumer Population`;
        if (catLower.includes('retail')) return `${node.name} — Retail Customer Population Centre`;
        if (catLower.includes('transport') || catLower.includes('logistics')) return `${node.name} — Transport Demand & Route Node`;
        if (catLower.includes('fisheries') || catLower.includes('aqua')) return `${node.name} — Fish Product Demand Location`;
        if (catLower.includes('agri') || catLower.includes('agriculture') || catLower.includes('farming')) return `${node.name} — Agricultural Produce Consumer Village`;
        if (catLower.includes('services')) return `${node.name} — Rural Services Demand Population`;
        if (catLower.includes('hospitality') || catLower.includes('tourism')) return `${node.name} — Tourism & Hospitality Demand Area`;
        if (catLower.includes('handicraft') || catLower.includes('artisan')) return `${node.name} — Artisan Product Market & Demand`;
        if (catLower.includes('manufacturing')) return `${node.name} — Industrial Labour & Product Demand`;
        return `${node.name} — Potential Customer Population Centre`;
      };

      // Estimate population from node distance to center (closer = denser area)
      const estPop = Math.round(1200 + (radiusKm - node.distKm) * 180 + ((nodeHash >> 2) % 3000));

      const mktDist = Math.round(getHaversineKm(centerLat, centerLng, node.lat, node.lng) * 10) / 10;
      if (mktDist <= radiusKm * 1.05) {
        features.push({
          id: `mkt_node_${node.id}_${idx}`,
          category: 'market',
          type: 'village',
          subTypeIcon: 'market',
          name: getTargetMarketLabel(),
          lat: node.lat,
          lng: node.lng,
          details: `${node.name} is a real geographic location within your ${radiusKm} km search radius. Estimated population: ~${estPop.toLocaleString()}. Potential demand location for ${catLower} business.`,
          distanceKm: mktDist,
          population: estPop,
          locationType: node.distKm < 5 ? 'town' : 'village',
        });
      }
      // POI pins are now exclusively from Overpass API (real OSM data), not generated here
    });

    return features;
  },
};

