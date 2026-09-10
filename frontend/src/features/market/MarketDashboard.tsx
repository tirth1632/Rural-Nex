import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompetitors, fetchDensity } from '../../api/market';
import { getProposalDetail } from '../../api/dashboard';
import CompetitorMap from './CompetitorMap';
import CompetitorTable from './CompetitorTable';
import { MapPin, Users, Navigation, Store } from 'lucide-react';

export default function MarketDashboard() {
    const [userLat, setUserLat] = useState<number>(22.9948); 
    const [userLng, setUserLng] = useState<number>(72.6624);
    const [locationLabel, setLocationLabel] = useState<string>('Vastral, Daskroi, Ahmedabad');
    const [businessLabel, setBusinessLabel] = useState<string>('Agro & Dairy Processing Unit');
    const [radiusKm, setRadiusKm] = useState<number>(5.0);

    useEffect(() => {
        const syncActiveProposal = () => {
            const activeId = localStorage.getItem('ruralnex_active_proposal_id');
            if (activeId) {
                getProposalDetail(Number(activeId)).then((p) => {
                    if (p) {
                        if (p.lat && p.lng) {
                            setUserLat(p.lat);
                            setUserLng(p.lng);
                        }
                        const loc = [p.village_name, p.block_name, p.district_name].filter(Boolean).join(', ');
                        if (loc) setLocationLabel(loc);
                        if (p.category?.name) setBusinessLabel(p.category.name);
                    }
                }).catch(() => {});
            }
        };

        syncActiveProposal();
        window.addEventListener('ruralnex_proposal_changed', syncActiveProposal);
        return () => window.removeEventListener('ruralnex_proposal_changed', syncActiveProposal);
    }, []);

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
        <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Hyper-Local Market Intelligence</h1>
                    <p className="text-gray-600 dark:text-zinc-400 text-sm">Analyzing real demographic demand and competitor density around your venture.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    <Store size={14} className="text-emerald-600 shrink-0" />
                    <span>{businessLabel}</span>
                    <span className="text-emerald-400">•</span>
                    <MapPin size={13} className="text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[180px]">{locationLabel}</span>
                </div>
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
