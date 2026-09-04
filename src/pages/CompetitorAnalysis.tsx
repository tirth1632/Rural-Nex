import { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import {
  Users,
  Search,
  ArrowUpDown,
  List,
  MapPin,
  Star,
  Building,
  Navigation,
} from 'lucide-react';
import { mockCompetitors } from '../mock/competitorMock';

export const CompetitorAnalysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortField, setSortField] = useState<'distanceKm' | 'pricePerUnit' | 'marketSharePercent'>('distanceKm');
  const [viewMode, setViewMode] = useState<'list' | 'split'>('list');

  const filtered = mockCompetitors
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.village.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => a[sortField] - b[sortField]);

  return (
    <div className="space-y-6">
      {/* Top Header & Search Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Competitor Intelligence & Density</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify market share, unit pricing, and distance of registered SME units in Karnal Block.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competitor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium text-slate-800"
          >
            <option value="All">All Categories</option>
            <option value="Dairy Processing">Dairy Processing</option>
            <option value="Food Processing">Food Processing</option>
            <option value="Farm Machinery">Farm Machinery</option>
            <option value="Cold Storage">Cold Storage</option>
          </select>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-subtle text-slate-900' : 'text-slate-500'}`}
            >
              <List className="w-3.5 h-3.5 inline mr-1" /> List View
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded ${viewMode === 'split' ? 'bg-white shadow-subtle text-slate-900' : 'text-slate-500'}`}
            >
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Density Summary
            </button>
          </div>
        </div>
      </div>

      {/* Density Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Competition Density Level"
          value="MODERATE"
          subtitle="Healthy Market Entry"
          change="Index: 64/100"
          changeType="positive"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Nearby Registered Units"
          value="18 Units"
          subtitle="Within 10 km Buffer"
          icon={<Building className="w-5 h-5" />}
        />
        <StatCard
          title="Average Distance"
          value="3.8 km"
          subtitle="Proximity to Village Center"
          icon={<Navigation className="w-5 h-5" />}
        />
        <StatCard
          title="Avg Market Unit Price"
          value="₹50 / L"
          subtitle="Milk & Chilling Equivalent"
          icon={<ArrowUpDown className="w-5 h-5" />}
        />
      </div>

      {/* Competitor Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Registered Competitors Directory ({filtered.length})</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Sort by:</span>
            <button
              onClick={() => setSortField('distanceKm')}
              className={`font-semibold ${sortField === 'distanceKm' ? 'text-gov-800 underline' : 'hover:underline'}`}
            >
              Distance
            </button>
            <span>•</span>
            <button
              onClick={() => setSortField('pricePerUnit')}
              className={`font-semibold ${sortField === 'pricePerUnit' ? 'text-gov-800 underline' : 'hover:underline'}`}
            >
              Price
            </button>
            <span>•</span>
            <button
              onClick={() => setSortField('marketSharePercent')}
              className={`font-semibold ${sortField === 'marketSharePercent' ? 'text-gov-800 underline' : 'hover:underline'}`}
            >
              Market Share
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Business Name</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Distance</th>
                <th className="px-3 py-2.5">Daily Capacity</th>
                <th className="px-3 py-2.5">Estimated Unit Price</th>
                <th className="px-3 py-2.5">Market Share</th>
                <th className="px-3 py-2.5">Threat Level</th>
                <th className="px-3 py-2.5">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-bold text-slate-900">{comp.name}</td>
                  <td className="px-3 py-2.5 text-slate-700">{comp.category}</td>
                  <td className="px-3 py-2.5 text-slate-600">{comp.village}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{comp.distanceKm} km</td>
                  <td className="px-3 py-2.5 text-slate-700">{comp.dailyCapacity}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-800">₹{comp.pricePerUnit}</td>
                  <td className="px-3 py-2.5 text-slate-800">{comp.marketSharePercent}%</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={comp.threatLevel === 'High' ? 'red' : comp.threatLevel === 'Moderate' ? 'amber' : 'green'}>
                      {comp.threatLevel}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {comp.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
