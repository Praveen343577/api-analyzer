/**
 * API Analyzer - PII Red Badge Component
 * * Purpose: A high-visibility inline indicator for detected security threats 
 * or Personally Identifiable Information (PII) within the JSON AST.
 * * Constraints Enforced:
 * 1. 0px border-radius (`rounded-none`).
 * 2. Monospace typography for technical precision.
 * 3. Bypasses standard monochrome palette to utilize semantic alert colors 
 * (Red/Orange/Yellow) to immediately draw operator attention to payload leaks.
 * * Dependencies: Consumes the `SecurityThreatLevel` type from `piiScanner`.
 */

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { SecurityThreatLevel } from '../../security/piiScanner';

const badgeVariants = cva(
    "inline-flex items-center justify-center border font-mono text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-none whitespace-nowrap ml-2",
    {
        variants: {
            level: {
                Critical: "bg-red-600 text-white border-red-600 animate-pulse",
                High: "bg-orange-600 text-white border-orange-600",
                Medium: "bg-yellow-400 text-black border-yellow-500",
                None: "hidden",
            }
        },
        defaultVariants: {
            level: "None"
        }
    }
);

export interface PiiRedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** The severity level determined by the heuristic scanner. */
    level: SecurityThreatLevel;
    /** The specific classification of the data (e.g., "JWT Token", "SSN"). */
    typeLabel: string | null;
}

/**
 * Instantiates the PiiRedBadge. Silently returns null if no threat is detected 
 * to keep the React render tree clean.
 */
export const PiiRedBadge = React.forwardRef<HTMLSpanElement, PiiRedBadgeProps>(
    ({ className, level, typeLabel, ...props }, ref) => {
        if (level === 'None' || !typeLabel) return null;

        return (
            <span 
                ref={ref}
                className={cn(badgeVariants({ level }), className)}
                title={`Security Threat: ${typeLabel} (${level})`}
                {...props}
            >
                {level === 'Critical' && <span className="mr-1 inline-block">⚠</span>}
                {typeLabel}
            </span>
        );
    }
);

PiiRedBadge.displayName = 'PiiRedBadge';