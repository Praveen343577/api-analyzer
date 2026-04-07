/**
 * API Analyzer - EditorialGrid Component
 * * Purpose: The master container for rendering the fully normalized JSON Abstract Syntax Tree (AST).
 * * Structural Constraints:
 * 1. Establishes the outermost "Newsprint" bounding box and overarching metric summary header.
 * 2. Dynamically orchestrates the rendering of structural AST nodes (ObjectColumn/ArrayList) vs 
 * primitive fallback arrays (though the root is almost exclusively an Object or Array).
 * * Dependencies: Consumes `NormalizedNode` and `PayloadMetrics`.
 */

import React from 'react';
import { cn } from '../../utils/cn';
import type { NormalizedNode } from '../../core/astNormalizer';
import type { PayloadMetrics } from '../../core/metricCalculator';
import { ObjectColumn } from './ObjectColumn';
import { ArrayList } from './ArrayList';
import { DataLeaf } from './DataLeaf';

export interface EditorialGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The fully processed root AST node representing the entire API response. */
    dataNode: NormalizedNode;
    /** Calculated ingestion metrics for the header display. */
    metrics: PayloadMetrics;
}

export const EditorialGrid = React.forwardRef<HTMLDivElement, EditorialGridProps>(
    ({ className, dataNode, metrics, ...props }, ref) => {
        
        // Helper to format byte sizes into readable kilobytes
        const formatSize = (bytes: number) => {
            return (bytes / 1024).toFixed(2) + ' KB';
        };

        return (
            <div 
                ref={ref}
                className={cn(
                    "flex flex-col border-[4px] border-black bg-white",
                    className
                )}
                {...props}
            >
                {/* Master Grid Header: Metrics & Telemetry Summary */}
                <div className="bg-black text-white p-4 border-b-[4px] border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-serif text-2xl font-bold uppercase tracking-widest text-white selection:bg-white selection:text-black">
                            AST Telemetry Log
                        </h2>
                        <p className="font-mono text-xs mt-1 text-gray-300">
                            STRUCTURAL ANALYSIS COMPLETE
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-widest">
                        <div className="flex flex-col bg-white text-black px-3 py-1 text-center">
                            <span className="text-[9px] text-gray-500">MAX DEPTH</span>
                            <span>{metrics.maxDepth}</span>
                        </div>
                        <div className="flex flex-col bg-white text-black px-3 py-1 text-center">
                            <span className="text-[9px] text-gray-500">PAYLOAD WT.</span>
                            <span>{formatSize(metrics.totalByteSize)}</span>
                        </div>
                    </div>
                </div>

                {/* Recursive AST Render Boundary */}
                <div className="p-4 sm:p-6 overflow-x-auto">
                    {/* Render specific component based on Root Type */}
                    {dataNode.type.startsWith('Object') && (
                        <ObjectColumn node={dataNode} className="border-none" />
                    )}
                    
                    {dataNode.type.startsWith('Array') && (
                        <ArrayList node={dataNode} className="border-none" />
                    )}
                    
                    {/* Fallback for invalid JSON structures (e.g., a single primitive root) */}
                    {!dataNode.type.startsWith('Object') && !dataNode.type.startsWith('Array') && (
                        <div className="border border-black p-2 bg-gray-50/50">
                            <DataLeaf node={dataNode} className="border-none" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

EditorialGrid.displayName = 'EditorialGrid';