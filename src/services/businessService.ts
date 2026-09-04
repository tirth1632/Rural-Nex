import { ApiClient } from './api';
import { mockBusinessOpportunities } from '../mock/businessMock';
import type { BusinessOpportunity } from '../types';

export class BusinessService {
  public static async getOpportunities(): Promise<BusinessOpportunity[]> {
    return ApiClient.get<BusinessOpportunity[]>('/opportunities/', mockBusinessOpportunities);
  }

  public static async getOpportunityById(id: string): Promise<BusinessOpportunity | undefined> {
    const opportunities = await this.getOpportunities();
    return opportunities.find((b) => b.id === id);
  }

  public static async evaluateFeasibility(inputData: unknown): Promise<{ score: number; recommendations: BusinessOpportunity[] }> {
    return ApiClient.post('/evaluate-feasibility/', inputData, {
      score: 84,
      recommendations: mockBusinessOpportunities,
    });
  }
}
