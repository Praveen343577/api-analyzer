/**
 * API Analyzer - Float Binning Utility
 * * Purpose: High-precision floating-point numbers (e.g., GPS coordinates, telemetry metrics)
 * exhibit near 100% uniqueness in large API payloads. If tracked raw, they overload the 
 * "Value Frequency" analyzer and exhaust DOM memory with unique nodes.
 * * This module normalizes and truncates floats to a specified precision limit, forcing 
 * mathematically similar values into identical string keys (bins) for frequency counting.
 */

/**
 * Standard precision limit for generic API float payloads. 
 * 3 decimal places provide sufficient variance without overwhelming the UI.
 */
export const DEFAULT_FLOAT_PRECISION = 3;

/**
 * Normalizes a raw floating-point number into a string-based precision bin.
 * * @param value - The raw numeric value extracted from the JSON AST.
 * @param precision - The maximum number of decimal places to retain (defaults to 3).
 * @returns A string representation of the truncated float. Returned as a string to 
 * prevent JavaScript floating-point drift when used as an Object/Map key.
 */
export function binFloat(value: number, precision: number = DEFAULT_FLOAT_PRECISION): string {
    // Pass through non-finite numbers (NaN, Infinity) without modification
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return String(value);
    }

    // toFixed rounds the number and converts to string.
    // parseFloat strips trailing mathematical zeros (e.g., "43.300" -> 43.3).
    // String() converts it back for safe key generation in the frequency map.
    const binned = Number.parseFloat(value.toFixed(precision));
    
    return String(binned);
}

/**
 * Determines if a numeric value is strictly a float (contains a fractional component).
 * Critical for Type Inference to distinguish between 'Integer' and 'Float' types.
 * * @param value - The numeric value to evaluate.
 * @returns boolean - True if the value has a remainder when divided by 1.
 */
export function isFloat(value: number): boolean {
    return Number.isFinite(value) && !Number.isInteger(value);
}

/**
 * Calculates a dynamic bin size based on a standard deviation or range (Optional implementation).
 * Currently unused, reserved for dynamic distribution visualizations in future iterations.
 * * @param min - Minimum value in the dataset.
 * @param max - Maximum value in the dataset.
 * @param binCount - Desired number of distinct bins.
 * @returns The mathematical step size for each bin.
 */
export function calculateBinStep(min: number, max: number, binCount: number = 10): number {
    if (min >= max || binCount <= 0) return 0;
    return (max - min) / binCount;
}