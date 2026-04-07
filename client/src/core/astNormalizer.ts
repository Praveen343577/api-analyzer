/**
 * API Analyzer - AST Normalizer
 * * Purpose: Transforms raw, deeply nested JSON payloads into a standardized, 
 * predictable Abstract Syntax Tree (AST) optimized for recursive React rendering.
 * * Mechanism:
 * 1. Executes a recursive traversal of the JSON object.
 * 2. Assigns a deterministic `id` (dot-notation path) to every node for React keys.
 * 3. Injects semantic types from `typeInferencer`.
 * 4. Injects security threat profiles from `piiScanner`.
 * 5. Applies float binning for telemetry metrics via `floatBinner`.
 * * Output: A unified `NormalizedNode` schema that the EditorialGrid UI can safely consume
 * without executing inline type checks or logic.
 */

import { inferType } from './typeInferencer';
import { scanValueForPii } from '../security/piiScanner';
import type { PiiScanResult } from '../security/piiScanner';
import { isFloat, binFloat } from './floatBinner';

/**
 * Standardized data structure for every leaf and branch in the parsed JSON tree.
 */
export interface NormalizedNode {
    /** Unique dot-notation or bracket-notation path (e.g., `data.users[0].id`) */
    id: string;
    /** The property name or array index */
    key: string | number;
    /** Semantic data type inferred via regex heuristics */
    type: string;
    /** The actual primitive value. Always null for Objects/Arrays. */
    value: string | number | boolean | null;
    /** PII detection results */
    pii: PiiScanResult;
    /** Nested child nodes (only populated if isExpandable is true) */
    children?: NormalizedNode[];
    /** Recursion depth, used for UI indentation rendering */
    depth: number;
    /** Identifies structural nodes (Objects/Arrays) vs primitive leaves */
    isExpandable: boolean;
    /** Pre-calculated truncated string for floating point numbers */
    binnedValue?: string;
}

/**
 * Initiates the AST normalization pipeline.
 * * @param data - The raw JSON payload received from the proxy.
 * @returns The root NormalizedNode containing the entire transformed tree.
 */
export function normalizeAst(data: unknown): NormalizedNode {
    return traverse(data, 'root', 'root', 0);
}

/**
 * Internal recursive worker for AST traversal and metadata injection.
 * * @param node - The current JSON segment being evaluated.
 * @param key - The property key or array index leading to this node.
 * @param path - The accumulated exact path string.
 * @param depth - The current nested level.
 * @returns A fully constructed NormalizedNode.
 */
function traverse(node: unknown, key: string | number, path: string, depth: number): NormalizedNode {
    const type = inferType(node);
    const pii = scanValueForPii(node);
    
    let isExpandable = false;
    let children: NormalizedNode[] = [];
    let binnedValue: string | undefined = undefined;

    // Structural Branch: Object
    if (type.startsWith('Object') && node !== null) {
        isExpandable = true;
        const obj = node as Record<string, unknown>;
        children = Object.keys(obj).map(k => 
            traverse(obj[k], k, path === 'root' ? k : `${path}.${k}`, depth + 1)
        );
    } 
    // Structural Branch: Array
    else if (type.startsWith('Array') && Array.isArray(node)) {
        isExpandable = true;
        children = node.map((item, index) => 
            traverse(item, index, `${path}[${index}]`, depth + 1)
        );
    } 
    // Primitive Leaf: Numbers
    else if (typeof node === 'number') {
        if (isFloat(node)) {
            binnedValue = binFloat(node);
        }
    }

    return {
        id: path,
        key,
        type,
        // Strip the value from memory if it's a structural branch to avoid duplication
        value: isExpandable ? null : (node as string | number | boolean | null),
        pii,
        children: isExpandable ? children : undefined,
        depth,
        isExpandable,
        binnedValue
    };
}