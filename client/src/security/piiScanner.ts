/**
 * API Analyzer - PII & Security Scanner
 * * Purpose: Executes regex-based heuristic sweeps across parsed JSON values
 * to identify sensitive information, credentials, and Personally Identifiable 
 * Information (PII) that may have been accidentally exposed in API responses.
 * * Implementation Note: These patterns prioritize high-confidence matches to 
 * prevent false positives that would otherwise overwhelm the UI metric badges.
 */

export type SecurityThreatLevel = 'Critical' | 'High' | 'Medium' | 'None';

export interface PiiScanResult {
    detected: boolean;
    type: string | null;
    threatLevel: SecurityThreatLevel;
}

/** * High-confidence Regex Patterns for Security & PII Detection
 */
const SEC_PATTERNS = {
    // Matches standard 3-part JSON Web Tokens
    JWT: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    
    // Matches standard OAuth/Bearer authorization headers or payload mirrors
    BEARER_TOKEN: /^Bearer\s+[A-Za-z0-9\-._~+/]+$/,
    
    // Matches common cloud provider and payment gateway secret keys (e.g., Stripe, AWS)
    API_KEY: /^(?:sk_live_|pk_live_|AKIA|AIza)[A-Za-z0-9-_]{10,}$/,
    
    // Matches standard 16-digit credit card PANs (Visually separated or contiguous)
    CREDIT_CARD: /^(?:\d{4}[-\s]?){3}\d{4}$/,
    
    // Matches standard US Social Security Numbers
    SSN: /^\d{3}-\d{2}-\d{4}$/,
    
    // Matches standard email formats
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // Matches standard E.164 or US formatted phone numbers with optional extensions
    PHONE: /^\+?1?\s*\(?-?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
};

/**
 * Sweeps a single AST leaf node value against security definitions.
 * * @param value - The raw parsed value from the JSON AST node.
 * @returns Object containing detection status, specific PII type, and threat level.
 */
export function scanValueForPii(value: unknown): PiiScanResult {
    if (typeof value !== 'string') {
        return { detected: false, type: null, threatLevel: 'None' };
    }

    const str = value.trim();
    if (!str) {
        return { detected: false, type: null, threatLevel: 'None' };
    }

    // Critical Level: Auth & Financial Compromise
    if (SEC_PATTERNS.JWT.test(str)) return { detected: true, type: 'JWT Token', threatLevel: 'Critical' };
    if (SEC_PATTERNS.BEARER_TOKEN.test(str)) return { detected: true, type: 'Bearer Token', threatLevel: 'Critical' };
    if (SEC_PATTERNS.API_KEY.test(str)) return { detected: true, type: 'Exposed API Key', threatLevel: 'Critical' };
    if (SEC_PATTERNS.CREDIT_CARD.test(str)) return { detected: true, type: 'Credit Card (PAN)', threatLevel: 'Critical' };
    
    // High Level: Severe Identity Compromise
    if (SEC_PATTERNS.SSN.test(str)) return { detected: true, type: 'SSN', threatLevel: 'High' };
    
    // Medium Level: Standard PII
    if (SEC_PATTERNS.EMAIL.test(str)) return { detected: true, type: 'Email Address', threatLevel: 'Medium' };
    if (SEC_PATTERNS.PHONE.test(str)) return { detected: true, type: 'Phone Number', threatLevel: 'Medium' };

    return { detected: false, type: null, threatLevel: 'None' };
}