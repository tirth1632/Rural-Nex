const API_BASE = '/api/v1/geo';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export interface DatasetStatus {
  dataset: string;
  file: string;
  status: string;
  rows: number;
  columns: number;
  canonical: boolean;
  description: string;
}

export interface DynamicGeoPoint {
  village_code: number;
  state: string;
  district: string;
  village: string;
  area_locality?: string;
  lat: number;
  lng: number;
  distance_km?: number;
  population?: number;
}

export interface RadiusSearchResponse {
  center: { lat: number; lng: number };
  radius_km: number;
  primary_state: string;
  primary_district: string;
  summary: {
    total_villages: number;
    total_population: number;
    density_per_sq_km: number;
    avg_road_distance_km: number;
    avg_travel_time_minutes: number;
    nearest_highway_distance_km: number;
    nearest_mandi_distance_km: number;
    nearest_railway_station_km: number;
    groundwater_dtwl_meters: number;
    rural_daily_wage_men_rs: number;
    rural_daily_wage_women_rs: number;
    estimated_enterprises_in_state: number;
    skilled_candidates_trained_state: number;
    micro_enterprises_assisted_state: number;
    wholesale_market_arrival_mt: number;
  };
  locations: DynamicGeoPoint[];
}

export const datasetService = {
  async getStates(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/hierarchy/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.states || [];
    } catch (e) {
      console.warn('Fallback states lookup:', e);
      return ['Andhra Pradesh', 'Bihar', 'Gujarat', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh'];
    }
  },

  async getDistricts(state: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/districts-data/?state=${encodeURIComponent(state)}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Fallback districts lookup:', e);
      return [];
    }
  },

  async getVillages(state: string, district: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/villages-data/?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Fallback villages lookup:', e);
      return [];
    }
  },

  async getRadiusSearch(lat: number, lng: number, radiusKm: number, category?: string): Promise<RadiusSearchResponse> {
    try {
      let url = `${API_BASE}/radius-search/?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Radius search failed:', e);
      throw e;
    }
  },

  async getBusinesses(state?: string): Promise<any[]> {
    try {
      let url = `${API_BASE}/businesses-data/`;
      if (state) url += `?state=${encodeURIComponent(state)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Businesses data lookup failed:', e);
      return [];
    }
  },

  async getPopulationData(state?: string, district?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      const res = await fetch(`${API_BASE}/population-data/?${params.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Population data lookup failed:', e);
      return {};
    }
  },

  async getGroundwaterData(state?: string, district?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      const res = await fetch(`${API_BASE}/groundwater-data/?${params.toString()}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Groundwater lookup failed:', e);
      return [];
    }
  },

  async getEconomicsData(state?: string): Promise<any> {
    try {
      let url = `${API_BASE}/economics-data/`;
      if (state) url += `?state=${encodeURIComponent(state)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Economics lookup failed:', e);
      return {};
    }
  },

  async getLivestockData(state?: string): Promise<any[]> {
    try {
      let url = `${API_BASE}/livestock-data/`;
      if (state) url += `?state=${encodeURIComponent(state)}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Livestock lookup failed:', e);
      return [];
    }
  },

  async getMarketData(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/market-data/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Market lookup failed:', e);
      return [];
    }
  },

  async getDataStatus(): Promise<DatasetStatus[]> {
    try {
      const res = await fetch(`${API_BASE}/data-status/`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Data status lookup failed:', e);
      return [];
    }
  }
};
