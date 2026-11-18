import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badge,
}) => {
  const variantStyles = {
    blue: {
      border: 'border-blue-200',
      bgIcon: 'bg-blue-50 text-blue-600',
      accent: 'text-blue-700',
    },
    green: {
      border: 'border-emerald-200',
      bgIcon: 'bg-emerald-50 text-emerald-600',
      accent: 'text-emerald-700',
    },
    amber: {
      border: 'border-amber-200',
      bgIcon: 'bg-amber-50 text-amber-600',
      accent: 'text-amber-700',
    },
    red: {
      border: 'border-red-200',
      bgIcon: 'bg-red-50 text-red-600',
      accent: 'text-red-700',
    },
    purple: {
      border: 'border-purple-200',
      bgIcon: 'bg-purple-50 text-purple-600',
      accent: 'text-purple-700',
    },
    slate: {
      border: 'border-slate-200',
      bgIcon: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-800',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`bg-white rounded-lg border ${style.border} p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${style.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <span className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          {badge}
        </span>
      )}
    </div>
  );
};
