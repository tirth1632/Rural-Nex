import { ApiClient } from './api';
import { mockMarketData } from '../mock/marketMock';
import type { MarketIndicator } from '../types';

export class MarketService {
  public static async getMarketMetrics(location: string, category: string, radiusKm: number): Promise<MarketIndicator> {
    return ApiClient.get<MarketIndicator>(
      `/market-analytics/?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}&radius=${radiusKm}`,
      {
        ...mockMarketData,
        location,
        category,
        radiusKm,
      }
    );
  }
}
