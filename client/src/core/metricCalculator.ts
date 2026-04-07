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

export interface NodeMetric {
    /** JSON path notation indicating node location (e.g., `data.users[0].profile`) */
    path: string;
    /** Exact UTF-8 byte size of the node when serialized */
    byteSize: number;
    /** Relative weight of this node compared to the root payload */
    percentageOfTotal: number;
    /** Structural classification */
    nodeType: 'Object' | 'Array';
}

export interface PayloadMetrics {
    /** Maximum recursive depth of the JSON tree */
    maxDepth: number;
    /** Total byte size of the root payload */
    totalByteSize: number;
    /** Top 10 heaviest objects/arrays sorted by size descending */
    heavyBranches: NodeMetric[];
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
    
    // Execute single-pass DFS
    const root = dfsCompute(data, 'root', branches);

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
        heavyBranches: sortedBranches
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
function dfsCompute(node: unknown, path: string, branches: NodeMetric[]): { size: number, depth: number } {
    // Primitive Base Cases: Hardcoded exact JSON serialized sizes
    if (node === null) return { size: 4, depth: 1 }; // "null"
    if (typeof node === 'boolean') return { size: node ? 4 : 5, depth: 1 }; // "true" or "false"
    
    if (typeof node === 'number') {
        return { size: encoder.encode(node.toString()).length, depth: 1 };
    }
    
    if (typeof node === 'string') {
        // Stringify encodes quotes and escapes characters exactly as JSON would
        return { size: encoder.encode(JSON.stringify(node)).length, depth: 1 };
    }

    let size = 0;
    let maxChildDepth = 0;

    if (Array.isArray(node)) {
        size += 2; // Account for brackets: []
        for (let i = 0; i < node.length; i++) {
            const child = dfsCompute(node[i], `${path}[${i}]`, branches);
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
            const child = dfsCompute((node as Record<string, unknown>)[key], childPath, branches);
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