import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompetitors, fetchDensity } from '../../api/market';
import CompetitorMap from './CompetitorMap';
import CompetitorTable from './CompetitorTable';
import { MapPin, Users, Navigation } from 'lucide-react';

export default function MarketDashboard() {
    // For MVP, we'll hardcode a central location (e.g. New Delhi) or use browser geolocation.
    // In full app, this comes from LocationSearch component.
    const [userLat] = useState(28.6139); 
    const [userLng] = useState(77.2090);
    const [radiusKm, setRadiusKm] = useState(5.0);

    const { data: competitorsResponse, isLoading: loadingCompetitors } = useQuery({
        queryKey: ['competitors', userLat, userLng, radiusKm],
        queryFn: () => fetchCompetitors(userLat, userLng, radiusKm)
    });

    const { data: densityData, isLoading: loadingDensity } = useQuery({
        queryKey: ['density', userLat, userLng, radiusKm],
        queryFn: () => fetchDensity(userLat, userLng, radiusKm)
    });

    const competitors = competitorsResponse?.data || [];
    const density = densityData?.density;

    return (
        <div className="max-w-6xl mx-auto p-4 mt-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Hyper-Local Market Intelligence</h1>
                <p className="text-gray-600">Analyzing external data and POIs around your selected location.</p>
            </div>

            {/* Radius Toggle */}
            <div className="flex bg-white rounded-lg p-1 w-fit shadow-sm border">
                <button 
                    onClick={() => setRadiusKm(5.0)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${radiusKm === 5.0 ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    5 km Radius
                </button>
                <button 
                    onClick={() => setRadiusKm(10.0)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${radiusKm === 10.0 ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    10 km Radius
                </button>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Local Competitors</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {loadingDensity ? '...' : density?.competitor_count || 0}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Competitor Density</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {loadingDensity ? '...' : density?.density_per_sq_km ? parseFloat(density.density_per_sq_km).toFixed(2) : '0'} 
                            <span className="text-sm font-normal text-gray-500 ml-1">per km²</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <Navigation size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Search Area</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {loadingDensity ? '...' : density?.area_sq_km ? parseFloat(density.area_sq_km).toFixed(1) : '0'} 
                            <span className="text-sm font-normal text-gray-500 ml-1">km²</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Map and Table Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Competitor Map</h2>
                    {loadingCompetitors ? (
                        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl border"></div>
                    ) : (
                        <CompetitorMap 
                            userLat={userLat} 
                            userLng={userLng} 
                            radiusKm={radiusKm} 
                            competitors={competitors} 
                        />
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Businesses</h2>
                    {loadingCompetitors ? (
                        <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl border"></div>
                    ) : (
                        <CompetitorTable competitors={competitors} />
                    )}
                </div>
            </div>
        </div>
    );
}
