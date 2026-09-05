import { ExternalDataBadge, EstimateBadge } from './ObservationBadges';

interface Competitor {
    id: number;
    name: string;
    category: string;
    distance_km: number;
    data_source: any | null;
}

export default function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
            <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 border-b text-gray-600">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Business Name</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        <th className="px-6 py-4 font-semibold">Distance</th>
                        <th className="px-6 py-4 font-semibold">Data Source</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {competitors.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                No local competitors found in this area.
                            </td>
                        </tr>
                    ) : (
                        competitors.map((comp) => (
                            <tr key={comp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{comp.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">{comp.category}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{comp.distance_km} km</td>
                                <td className="px-6 py-4">
                                    {comp.data_source ? (
                                        <ExternalDataBadge source={comp.data_source} />
                                    ) : (
                                        <EstimateBadge />
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
