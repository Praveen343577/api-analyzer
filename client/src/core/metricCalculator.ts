/**
 * API Analyzer - Payload Metric Calculator
 * * Purpose: Executes a high-performance, single-pass Depth-First Search (DFS) 
 * across the JSON Abstract Syntax Tree (AST).
 * * Functions:
 * 1. Calculates the absolute maximum depth of the JSON structure.
 * 2. Computes the exact UTF-8 byte size of every nested object and array without 
 * relying on O(n^2) recursive `JSON.stringify` calls.
 * 3. Identifies and isolates the heaviest structural branches in the payload.
 */

import { isFloat, binFloat } from './floatBinner';
export interface NodeMetric {
    path: string;   /** JSON path notation indicating node location (e.g., `data.users[0].profile`) */
    byteSize: number; /** Exact UTF-8 byte size of the node when serialized */
    percentageOfTotal: number; /** Relative weight of this node compared to the root payload */
    nodeType: 'Object' | 'Array'; /** Structural classification */
}

export interface ValueDistribution {
    value: string;
    count: number;
}

export interface KeyMetric {
    key: string;
    uniquenessScore: number;       // (distinct count * 100) / total count
    totalValues: number;           // Total instances of this key
    distinctValues: number;        // Number of unique values mapped to this key
    distribution: ValueDistribution[]; // Sorted list of values and their frequencies
}

export interface PayloadMetrics {
    maxDepth: number;   /* Maximum recursive depth of the JSON tree */
    totalByteSize: number;  /* Total byte size of the root payload */
    heavyBranches: NodeMetric[];    /* Top 10 heaviest objects/arrays sorted by size descending */
    uniqueKeys: KeyMetric[];       // Keys with 100% uniqueness (for dropdowns)
    distributedKeys: KeyMetric[];  // Keys with <100% uniqueness (for distribution panel)
}

/** * Reusable encoder to accurately measure byte length of strings containing 
 * multi-byte UTF-8 characters (e.g., emojis, localized text).
 */
const encoder = new TextEncoder();

/**
 * Initiates the metric calculation pipeline.
 * * @param data - The parsed root JSON payload.
 * @returns Comprehensive size and depth metrics for the visualization engine.
 */
export function calculatePayloadMetrics(data: unknown): PayloadMetrics {
    const branches: NodeMetric[] = [];
    const keyTracker = new Map<string, Map<string, number>>();  // Tracks Key -> Value -> Count

    // Execute single-pass DFS
    // Pass null for the initial currentKey
    const root = dfsCompute(data, 'root', null, branches, keyTracker);

    const uniqueKeys: KeyMetric[] = [];
    const distributedKeys: KeyMetric[] = [];
    
    for (const [key, valueMap] of keyTracker.entries()) {
        let totalValues = 0;
        const distribution: ValueDistribution[] = [];

        // Aggregate total values and build distribution array
        for (const [val, count] of valueMap.entries()) {
            totalValues += count;
            distribution.push({ value: val, count });
        }

        const distinctValues = distribution.length;
        // Apply strict mathematical formula provided by spec
        const uniquenessScore = (distinctValues * 100) / totalValues;

        // Sort distribution by frequency descending
        distribution.sort((a, b) => b.count - a.count);

        const metric: KeyMetric = {
            key,
            uniquenessScore,
            totalValues,
            distinctValues,
            distribution
        };

        // Route to respective array based on absolute uniqueness
        if (uniquenessScore === 100) {
            uniqueKeys.push(metric);
        } else {
            distributedKeys.push(metric);
        }
    }

    // Sort key arrays by total occurrences descending for stable UI rendering
    uniqueKeys.sort((a, b) => b.totalValues - a.totalValues);
    distributedKeys.sort((a, b) => b.totalValues - a.totalValues);

    // Post-process branches: calculate percentages and isolate the top 10 offenders
    const sortedBranches = branches
        .filter(b => b.path !== 'root') // Exclude root from "heavy nested" list
        .map(branch => ({
            ...branch,
            percentageOfTotal: root.size > 0 ? Number(((branch.byteSize / root.size) * 100).toFixed(2)) : 0
        }))
        .sort((a, b) => b.byteSize - a.byteSize)
        .slice(0, 10);

    return {
        maxDepth: root.depth,
        totalByteSize: root.size,
        heavyBranches: sortedBranches,
        uniqueKeys,
        distributedKeys
    };
}

/**
 * Internal recursive worker for DFS metric calculation.
 * Builds exact byte sizes bottom-up to maintain O(n) time complexity.
 * * @param node - Current AST node.
 * @param path - Dot-notation tracking string.
 * @param branches - Mutable array accumulating complex node metrics.
 * @returns Tuple of { size, depth } for the current node.
 */
function dfsCompute(
    node: unknown, 
    path: string, 
    currentKey: string | null, // The actual object property name
    branches: NodeMetric[],
    keyTracker: Map<string, Map<string, number>>
): { size: number, depth: number } {
    
    // Helper to log values into the tracker
    const trackValue = (valStr: string) => {
        if (!currentKey) return;
        if (!keyTracker.has(currentKey)) {
            keyTracker.set(currentKey, new Map());
        }
        const valMap = keyTracker.get(currentKey)!;
        valMap.set(valStr, (valMap.get(valStr) || 0) + 1);
    };

    // Primitive Base Cases
    if (node === null) {
        trackValue('null');
        return { size: 4, depth: 1 };
    }

    if (typeof node === 'boolean') {
        trackValue(node ? 'true' : 'false');
        return { size: node ? 4 : 5, depth: 1 };
    }
    
    if (typeof node === 'number') {
        // Apply float binning to prevent unique tracking of insignificant decimal drift
        const valStr = isFloat(node) ? binFloat(node) : String(node);
        trackValue(valStr);
        return { size: encoder.encode(node.toString()).length, depth: 1 };
    }
    
    if (typeof node === 'string') {
        // Enclose strings in quotes to distinguish from numeric identicals (e.g., "1" vs 1)
        trackValue(node === '' ? '""' : node);
        return { size: encoder.encode(JSON.stringify(node)).length, depth: 1 };
    }

    let size = 0;
    let maxChildDepth = 0;

    if (Array.isArray(node)) {
        size += 2; // Account for brackets: []
        for (let i = 0; i < node.length; i++) {
            const child = dfsCompute(node[i], `${path}[${i}]`, currentKey, branches, keyTracker);
            size += child.size;
            if (i < node.length - 1) size += 1; // Account for commas
            if (child.depth > maxChildDepth) maxChildDepth = child.depth;
        }
        
        const currentDepth = maxChildDepth + 1;
        branches.push({ path, byteSize: size, percentageOfTotal: 0, nodeType: 'Array' });
        return { size, depth: currentDepth };
    }

    if (typeof node === 'object') {
        size += 2; // Account for braces: {}
        const keys = Object.keys(node as object);
        
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            // Size of key + quotes + colon (e.g., "key":)
            const keySize = encoder.encode(JSON.stringify(key)).length;
            size += keySize + 1; 
            
            const childPath = path === 'root' ? key : `${path}.${key}`;
            const child = dfsCompute((node as Record<string, unknown>)[key], childPath, key, branches, keyTracker);
            size += child.size;
            
            if (i < keys.length - 1) size += 1; // Account for commas
            if (child.depth > maxChildDepth) maxChildDepth = child.depth;
        }
        
        const currentDepth = maxChildDepth + 1;
        branches.push({ path, byteSize: size, percentageOfTotal: 0, nodeType: 'Object' });
        return { size, depth: currentDepth };
    }

    // Fallback for undefined/functions (should not exist in standard JSON)
    return { size: 0, depth: 1 };
}