/**
 * API Analyzer - NewsGridCard Component
 * * Purpose: A structural container designed to compose the strict editorial grid layout.
 * * Constraints Enforced:
 * 1. 0px border-radius (`rounded-none`).
 * 2. Solid monochrome borders to mimic printed columns and separations.
 * 3. Optional standardized header block utilizing the serif font stack (Playfair/Lora).
 * * Usage: Serves as the primary bounding box for visualization modules (e.g., ObjectColumn, ArrayList).
 * Designed to sit adjacent to other NewsGridCards. Parent containers should utilize flex/grid
 * layouts and manage overlapping borders (e.g., negative margins or border-collapse) if 
 * a seamless grid is desired.
 */

import React from 'react';
import { cn } from '../../utils/cn'; // Assuming execution from client/src/components/ui/

export interface NewsGridCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    /** * Optional header text. If provided, renders a highly visible title block 
     * at the top of the card with a distinct bottom border.
     */
    title?: string | React.ReactNode;
    
    /** * Disables the default internal padding of the content area. 
     * Required when rendering nested grids or full-bleed data structures.
     */
    noPadding?: boolean;
}

/**
 * Instantiates the NewsGridCard with standard React ref forwarding.
 * * @param props - Custom grid properties merged with standard HTML div attributes.
 */
export const NewsGridCard = React.forwardRef<HTMLDivElement, NewsGridCardProps>(
    ({ className, title, noPadding = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex flex-col bg-white border border-black rounded-none text-black",
                    className
                )}
                {...props}
            >
                {/* Conditional Title Block */}
                {title && (
                    <div className="border-b border-black bg-gray-50 px-3 py-2 font-serif font-bold text-sm tracking-wide uppercase selection:bg-black selection:text-white">
                        {title}
                    </div>
                )}
                
                {/* Content Area */}
                <div className={cn(
                    "flex-grow relative", 
                    !noPadding && "p-4"
                )}>
                    {children}
                </div>
            </div>
        );
    }
);

NewsGridCard.displayName = 'NewsGridCard';