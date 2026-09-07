import type { CandidateLocation } from './geoService';

export interface SavedLocationItem {
  id: string;
  candidateId: string;
  name: string;
  areaName: string;
  districtName: string;
  stateName: string;
  businessCategory: string;
  subType: string;
  investmentRange: string;
  overallScore: number;
  tierLabel: string;
  savedAt: string; // ISO string
  rawCandidate: CandidateLocation;
}

const SAVED_LOCATIONS_STORAGE_KEY = 'ruralnex_saved_locations';

export const locationService = {
  getSavedLocations(): SavedLocationItem[] {
    try {
      const data = localStorage.getItem(SAVED_LOCATIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocation(candidate: CandidateLocation): SavedLocationItem[] {
    const existing = this.getSavedLocations();
    if (existing.some((item) => item.candidateId === candidate.id)) {
      return existing; // already saved
    }

    const newItem: SavedLocationItem = {
      id: `saved_${Date.now()}`,
      candidateId: candidate.id,
      name: candidate.name,
      areaName: candidate.areaName,
      districtName: candidate.districtName,
      stateName: candidate.stateName,
      businessCategory: candidate.businessCategory,
      subType: candidate.subType,
      investmentRange: candidate.investmentRange,
      overallScore: candidate.scoreResult.overallScore,
      tierLabel: candidate.scoreResult.tier.label,
      savedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      rawCandidate: candidate,
    };

    const updated = [newItem, ...existing];
    try {
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist saved location', e);
    }
    return updated;
  },

  removeSavedLocation(savedId: string): SavedLocationItem[] {
    const existing = this.getSavedLocations();
    const updated = existing.filter((item) => item.id !== savedId && item.candidateId !== savedId);
    try {
      localStorage.setItem(SAVED_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to remove saved location', e);
    }
    return updated;
  },

  isLocationSaved(candidateId: string): boolean {
    const saved = this.getSavedLocations();
    return saved.some((item) => item.candidateId === candidateId || item.id === candidateId);
  },
};
