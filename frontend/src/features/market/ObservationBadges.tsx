import { Database, BrainCircuit, ExternalLink } from 'lucide-react';

interface DataSource {
    provider_name: string;
    source_url?: string;
    verification_status?: string;
}

export function ExternalDataBadge({ source }: { source: DataSource }) {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
            <Database size={12} />
            <span>{source.provider_name}</span>
            {source.source_url && (
                <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600" title="View Source">
                    <ExternalLink size={12} />
                </a>
            )}
        </div>
    );
}

export function EstimateBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium" title="Calculated Estimate - Not verified external data">
            <BrainCircuit size={12} />
            <span>Estimate</span>
        </div>
    );
}
