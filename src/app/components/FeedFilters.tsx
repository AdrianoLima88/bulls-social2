import React from 'react';
import { Sparkles, BarChart3, Building2, Newspaper, GraduationCap } from 'lucide-react';

interface FeedFiltersProps {
  activeFilter: 'all' | 'analysis' | 'company' | 'news' | 'education';
  onFilterChange: (filter: 'all' | 'analysis' | 'company' | 'news' | 'education') => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'analysis', label: 'Analyses', icon: BarChart3 },
    { id: 'company', label: 'Companys', icon: Building2 },
    { id: 'news', label: 'Notícias', icon: Newspaper },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ];

  return (
    <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id as any)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition min-w-[70px] ${
                isActive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold whitespace-nowrap">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
