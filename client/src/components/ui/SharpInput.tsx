/**
 * API Analyzer - SharpInput Component
 * * Purpose: A core text input primitive strictly adhering to the "Newsprint" design system.
 * * Constraints Enforced:
 * 1. 0px border-radius (`rounded-none`).
 * 2. High-contrast monochrome borders and active focus states.
 * 3. Consistent typography aligning with the global font stack.
 * * Utilizes `cn` utility for conflict-free Tailwind CSS composition, allowing 
 * parent containers to inject spatial overrides (margins, widths) safely.
 */

import React from 'react';
import { cn } from '../../utils/cn'; // Assuming execution from client/src/components/ui/

export type SharpInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Instantiates the SharpInput with standard React ref forwarding.
 * * @param props - Standard HTML input attributes.
 */
export const SharpInput = React.forwardRef<HTMLInputElement, SharpInputProps>(
    ({ className, type = 'text', ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full border border-black bg-white px-3 py-2 text-sm font-sans placeholder:text-gray-500",
                    "rounded-none transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

SharpInput.displayName = 'SharpInput';