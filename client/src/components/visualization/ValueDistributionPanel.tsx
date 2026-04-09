/**
 * API Analyzer - ValueDistributionPanel Component
 * Purpose: Renders the frequency distribution of non-unique payload keys.
 */

import React from 'react';
import type { KeyMetric } from '../../core/metricCalculator';
import { NewsGridCard } from '../ui/NewsGridCard';

export interface ValueDistributionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Array of KeyMetrics strictly filtered for uniquenessScore < 100 */
    distributedKeys: KeyMetric[];
}

export const ValueDistributionPanel = React.forwardRef<HTMLDivElement, ValueDistributionPanelProps>(
    ({ className, distributedKeys, ...props }, ref) => {
        if (!distributedKeys || distributedKeys.length === 0) {
            return null;
        }

        return (
            <NewsGridCard 
                title="Value Frequency Distribution" 
                ref={ref} 
                className={className} 
                {...props}
            >
                <div className="flex flex-col gap-4">
                    {distributedKeys.map((metric) => (
                        <div 
                            key={metric.key} 
                            className="flex flex-col border-[2px] border-black bg-white rounded-none"
                        >
                            {/* Key Header */}
                            <div className="flex justify-between items-center bg-black text-white px-3 py-1.5 border-b-[2px] border-black">
                                <span className="font-mono text-sm font-bold uppercase tracking-widest selection:bg-white selection:text-black">
                                    {metric.key}
                                </span>
                                <div className="flex gap-4 font-mono text-xs">
                                    <span>VOL: {metric.totalValues}</span>
                                    <span>UNIQ: {metric.uniquenessScore.toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Value Boxes */}
                            <div className="flex flex-wrap p-2 gap-2">
                                {metric.distribution.map((dist, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center gap-2 border border-black px-2 py-1 bg-gray-50 text-xs font-mono hover:bg-gray-200 transition-colors cursor-default"
                                    >
                                        <span 
                                            className="font-medium text-black max-w-[200px] truncate"
                                            title={dist.value}
                                        >
                                            {dist.value}
                                        </span>
                                        <span className="bg-black text-white px-1.5 py-0.5 font-bold">
                                            {dist.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </NewsGridCard>
        );
    }
);

ValueDistributionPanel.displayName = 'ValueDistributionPanel';