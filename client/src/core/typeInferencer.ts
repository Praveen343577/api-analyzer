/**
 * API Analyzer - Type Inference Engine
 * * Purpose: Identifies the semantic data type of JSON payload values.
 * Mechanism: Evaluates values progressively against standard JSON primitives 
 * and applies content-based regex heuristics to strings. This resolves schema 
 * inconsistencies where numeric telemetry or timestamps are cast as strings 
 * (e.g., "end_latitude": "21.26888550").
 */

/** Regex pattern for standard 8-4-4-4-12 UUID structures. */
const REGEX_UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/** Regex pattern for ISO 8601 timestamps, supporting optional milliseconds and timezone offsets. */
const REGEX_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:?\d{2}|Z)?$/i;

/** Regex pattern for YYYY-MM-DD date formats commonly used as dynamic object keys. */
const REGEX_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Regex pattern for standard email addresses. */
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Regex pattern for IPv4 addresses ensuring 0-255 bounds per octet. */
const REGEX_IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

/** Regex pattern for strings containing solely floating-point numerics. */
const REGEX_FLOAT_STR = /^-?\d+\.\d+$/;

/** Regex pattern for strings containing solely integer numerics. */
const REGEX_INT_STR = /^-?\d+$/;

/**
 * Derives the strict or semantic data type of an unknown JSON value.
 * Execution order is prioritized by specificity to prevent generic matches 
 * (e.g., a timestamp being classified as a generic string).
 * * @param value - The raw parsed value from the JSON AST node.
 * @returns A string representing the inferred semantic type.
 */
export function inferType(value: unknown): string {
    if (value === null) return 'Null';
    if (value === undefined) return 'Undefined';

    const type = typeof value;

    if (type === 'boolean') return 'Boolean';
    
    if (type === 'number') {
        return Number.isInteger(value) ? 'Integer' : 'Float';
    }

    if (type === 'string') {
        const str = value as string;
        
        if (str.trim() === '') return 'String (Empty)';
        
        // Semantic string evaluation hierarchy
        if (REGEX_UUID.test(str)) return 'UUID';
        if (REGEX_ISO8601.test(str)) return 'Timestamp (ISO 8601)';
        if (REGEX_DATE_ONLY.test(str)) return 'Date (YYYY-MM-DD)';
        if (REGEX_IPV4.test(str)) return 'IPv4 Address';
        if (REGEX_EMAIL.test(str)) return 'Email';
        
        // Coercion evaluation for mistyped API schemas
        if (REGEX_FLOAT_STR.test(str)) return 'Float (Stringified)';
        if (REGEX_INT_STR.test(str)) return 'Integer (Stringified)';

        return 'String';
    }

    if (Array.isArray(value)) {
        return value.length === 0 ? 'Array (Empty)' : 'Array';
    }

    if (type === 'object') {
        return Object.keys(value as object).length === 0 ? 'Object (Empty)' : 'Object';
    }

    return 'Unknown';
}