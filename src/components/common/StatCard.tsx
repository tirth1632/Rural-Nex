import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="p-2 rounded bg-slate-100 text-gov-800">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-1 text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {change && (
            <span
              className={`font-semibold ${
                changeType === 'positive'
                  ? 'text-emerald-700'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-slate-600'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
