import { ApiClient } from './api';
import { mockCompetitors } from '../mock/competitorMock';
import type { Competitor } from '../types';

export class GisService {
  public static async getCompetitorsInRadius(
    lat: number,
    lng: number,
    radiusKm: number,
    category?: string
  ): Promise<Competitor[]> {
    return ApiClient.get<Competitor[]>(
      `/gis/competitors/?lat=${lat}&lng=${lng}&radius=${radiusKm}&category=${category || ''}`,
      mockCompetitors
    );
  }
}
