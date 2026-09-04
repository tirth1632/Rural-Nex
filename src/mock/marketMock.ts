import type { MarketIndicator } from '../types';

export const mockMarketData: MarketIndicator = {
  location: 'Karnal, Haryana',
  category: 'Dairy Processing',
  radiusKm: 10,
  saturationIndexPercent: 42,
  estimatedDailyCustomers: 340,
  avgPricePerUnitRupees: 52,
  projectedMonthlyDemandRupees: 1840000,
  supplyDeficitPercent: 28,
  nearbyCompetitorCount: 18,
  demandForecast: [
    { month: 'Jan', demand: 1650, supply: 1200 },
    { month: 'Feb', demand: 1720, supply: 1250 },
    { month: 'Mar', demand: 1800, supply: 1300 },
    { month: 'Apr', demand: 1950, supply: 1350 },
    { month: 'May', demand: 2100, supply: 1400 },
    { month: 'Jun', demand: 2250, supply: 1420 },
    { month: 'Jul', demand: 2000, supply: 1450 },
    { month: 'Aug', demand: 1900, supply: 1400 },
    { month: 'Sep', demand: 1850, supply: 1380 },
    { month: 'Oct', demand: 2050, supply: 1450 },
    { month: 'Nov', demand: 2200, supply: 1500 },
    { month: 'Dec', demand: 2400, supply: 1550 },
  ],
  priceBenchmark: [
    { block: 'Gharaunda', price: 48 },
    { block: 'Karnal Urban', price: 56 },
    { block: 'Nilokheri', price: 50 },
    { block: 'Assandh', price: 46 },
    { block: 'Indri', price: 47 },
    { block: 'Taraori', price: 51 },
  ]
};
