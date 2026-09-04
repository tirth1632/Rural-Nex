import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Filter, TrendingUp, Users, ShoppingCart, Percent } from 'lucide-react';
import { mockMarketData } from '../mock/marketMock';
import { formatRupee } from '../utils/formatters';

export const MarketAnalysis: React.FC = () => {
  const [location, setLocation] = useState('Karnal, Haryana');
  const [businessCategory, setBusinessCategory] = useState('Dairy Processing');
  const [radiusKm, setRadiusKm] = useState(10);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Market Intelligence & BI Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantitative demand vs. supply projections and price benchmarks across sub-district blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-gov-800" /> Filter:
          </div>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option>Karnal, Haryana</option>
            <option>Ambala, Haryana</option>
            <option>Kurukshetra, Haryana</option>
          </select>
          <select
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option>Dairy Processing</option>
            <option>Agri Equipment Rental</option>
            <option>Spice Grinding</option>
            <option>Cold Storage</option>
          </select>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 px-3 py-1 border border-slate-300 rounded">
            <span>Radius: <strong>{radiusKm} km</strong></span>
            <input
              type="range"
              min={3}
              max={25}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 h-1 bg-slate-300 rounded accent-gov-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Projected Monthly Demand"
          value={formatRupee(mockMarketData.projectedMonthlyDemandRupees, true)}
          subtitle="Estimated Total Spending"
          change="+14.2% YoY"
          changeType="positive"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          title="Competition Density"
          value={`${mockMarketData.nearbyCompetitorCount} Units`}
          subtitle={`Within ${radiusKm}km radius`}
          change="Moderate Saturation"
          changeType="neutral"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Average Unit Price"
          value={formatRupee(mockMarketData.avgPricePerUnitRupees)}
          subtitle="Per Litre / Unit Equivalent"
          change="Stable Benchmark"
          changeType="neutral"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard
          title="Estimated Daily Buyers"
          value={mockMarketData.estimatedDailyCustomers}
          subtitle="Retail & Commercial Mandi"
          change="+8.5% Growth"
          changeType="positive"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Unsatisfied Supply Deficit"
          value={`${mockMarketData.supplyDeficitPercent}%`}
          subtitle="Unmet Market Gap"
          change="High Opportunity"
          changeType="positive"
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* BI Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 12-Month Demand vs Supply Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">12-Month Demand vs. Supply Projection</h2>
              <p className="text-[11px] text-slate-500">Volume trends in Thousands of Litres (LPD equivalent)</p>
            </div>
            <Badge variant="green">Deficit Gap: 28%</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMarketData.demandForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#115E59" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#115E59" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '4px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="demand" name="Market Demand (LPD)" stroke="#115E59" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
                <Area type="monotone" dataKey="supply" name="Existing Supply (LPD)" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorSupply)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Benchmark per Block Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Block-Level Price Benchmarks</h2>
              <p className="text-[11px] text-slate-500">Average Unit Price (₹ / Litre) by Sub-District</p>
            </div>
            <Badge variant="navy">Karnal District</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMarketData.priceBenchmark} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="block" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[35, 60]} />
                <Tooltip
                  formatter={(val) => [`₹${val} / L`, 'Avg Price']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '12px', borderRadius: '4px' }}
                />
                <Bar dataKey="price" name="Unit Price (₹)" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
