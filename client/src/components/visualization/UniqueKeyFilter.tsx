/**
 * API Analyzer - UniqueKeyFilter Component
 * Purpose: Renders dropdown filters for keys with 100% uniqueness scores.
 */

import React from 'react';
import { cn } from '../../utils/cn';
import type { KeyMetric } from '../../core/metricCalculator';
import { NewsGridCard } from '../ui/NewsGridCard';

export interface UniqueKeyFilterProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Array of KeyMetrics strictly filtered for uniquenessScore === 100 */
    uniqueKeys: KeyMetric[];
    /** Callback fired when a filter value is selected or cleared */
    onFilterChange: (key: string, value: string | null) => void;
}

export const UniqueKeyFilter = React.forwardRef<HTMLDivElement, UniqueKeyFilterProps>(
    ({ className, uniqueKeys, onFilterChange, ...props }, ref) => {
        if (!uniqueKeys || uniqueKeys.length === 0) {
            return null;
        }

        return (
            <NewsGridCard 
                title="Unique Identifier Filters" 
                ref={ref} 
                className={className} 
                {...props}
            >
                <div className="flex flex-wrap gap-4">
                    {uniqueKeys.map((metric) => (
                        <div key={metric.key} className="flex flex-col gap-1 w-full md:w-auto">
                            <label className="text-xs font-sans font-bold uppercase tracking-wider text-gray-700">
                                {metric.key}
                            </label>
                            <div className="relative w-full md:w-64">
                                <select
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onFilterChange(metric.key, val === "" ? null : val);
                                    }}
                                    className={cn(
                                        "h-10 w-full appearance-none border border-black bg-white px-3 py-2 text-sm font-sans transition-colors rounded-none",
                                        "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                    )}
                                >
                                    <option value="">[ NO FILTER ]</option>
                                    {metric.distribution.map((dist) => (
                                        <option key={dist.value} value={dist.value}>
                                            {dist.value}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom caret */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </NewsGridCard>
        );
    }
);

UniqueKeyFilter.displayName = 'UniqueKeyFilter';