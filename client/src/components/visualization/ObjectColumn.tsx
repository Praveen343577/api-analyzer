/**
 * API Analyzer - ObjectColumn Component
 * * Purpose: Renders a normalized JSON Object node as a structured, key-value block.
 * * Constraints Enforced:
 * 1. Strict Newsprint structural borders separating object hierarchies.
 * 2. Monospaced key representation aligned to the left margin.
 * 3. Collapsible state management to mitigate DOM bloat for deeply nested objects.
 * * Dependencies: Recursively mounts ArrayList or nested ObjectColumns for complex 
 * children, and DataLeaf for primitive evaluations.
 */

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import type { NormalizedNode } from '../../core/astNormalizer';
import { DataLeaf } from './DataLeaf';
import { ArrayList } from './ArrayList';
import { PiiRedBadge } from '../metrics/PiiRedBadge';

export interface ObjectColumnProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The fully processed Object AST node to render. */
    node: NormalizedNode;
}

export const ObjectColumn = React.forwardRef<HTMLDivElement, ObjectColumnProps>(
    ({ className, node, ...props }, ref) => {
        const [isExpanded, setIsExpanded] = useState(true);

        const toggleExpand = (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        };

        if (!node.type.startsWith('Object')) {
            return null;
        }

        return (
            <div 
                ref={ref}
                className={cn(
                    "flex flex-col border border-black bg-white text-black mb-2",
                    className
                )}
                {...props}
            >
                {/* Object Header / Collapse Toggle */}
                <div 
                    className="flex justify-between items-center bg-gray-50 border-b border-black px-2 py-1 cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={toggleExpand}
                >
                    <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest">
                        <span>{isExpanded ? '▼' : '▶'}</span>
                        <span>{typeof node.key === 'string' ? node.key : `[${node.key}]`}</span>
                        <span className="text-gray-500 font-normal">Object {"{"}{node.children?.length || 0}{"}"}</span>
                    </div>
                    <PiiRedBadge level={node.pii?.threatLevel || 'None'} typeLabel={node.pii?.type || null} />
                </div>

                {/* Expanded Content Area */}
                {isExpanded && node.children && node.children.length > 0 && (
                    <div className="flex flex-col divide-y divide-gray-200">
                        {node.children.map((child) => {
                            if (!child.isExpandable) {
                                return <DataLeaf key={child.id} node={child} className="border-none" />;
                            }

                            if (child.type.startsWith('Object')) {
                                return (
                                    <div key={child.id} className="p-2 bg-gray-50/50">
                                        <ObjectColumn node={child} />
                                    </div>
                                );
                            }

                            if (child.type.startsWith('Array')) {
                                return (
                                    <div key={child.id} className="p-2 bg-gray-50/50">
                                        <ArrayList node={child} />
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                )}
                
                {/* Empty State Fallback */}
                {isExpanded && (!node.children || node.children.length === 0) && (
                    <div className="px-3 py-2 font-mono text-xs text-gray-400 italic">
                        {"{ Empty Object }"}
                    </div>
                )}
            </div>
        );
    }
);

ObjectColumn.displayName = 'ObjectColumn';