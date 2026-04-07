/**
 * API Analyzer - SharpButton Component
 * * Purpose: A core interactive primitive strictly adhering to the "Newsprint" design system.
 * * Constraints Enforced:
 * 1. 0px border-radius (`rounded-none`).
 * 2. High-contrast monochrome default palettes.
 * 3. Consistent focus states matching the architectural aesthetic.
 * * Utilizes `class-variance-authority` (cva) for deterministic variant mapping
 * and `cn` for conflict-free Tailwind overrides.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn'; // Assuming execution from client/src/components/ui/

/**
 * Defines the permutation matrix for button styling.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center border font-sans font-medium transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                primary: "bg-black text-white border-black hover:bg-gray-800",
                secondary: "bg-transparent text-black border-black hover:bg-gray-100",
                ghost: "border-transparent bg-transparent text-black hover:bg-gray-100",
                danger: "bg-red-600 text-white border-red-600 hover:bg-red-700",
            },
            size: {
                sm: "h-8 px-3 text-xs",
                default: "h-10 px-4 py-2 text-sm",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface SharpButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

/**
 * Instantiates the SharpButton with standard React ref forwarding.
 * * @param props - Standard HTML button attributes merged with CVA variants.
 */
export const SharpButton = React.forwardRef<HTMLButtonElement, SharpButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

SharpButton.displayName = "SharpButton";