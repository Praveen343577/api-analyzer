/**
 * API Analyzer - EditionHeader Component
 * * Purpose: Serves as the primary global masthead for the application, strictly 
 * enforcing the "Newsprint" visual hierarchy.
 * * Constraints Enforced:
 * 1. Heavy monochromatic typography utilizing the primary serif font stack (Playfair/Lora).
 * 2. Structural varied-weight borders simulating classic broadsheet newspaper layouts.
 * 3. Fluid responsive text scaling for the main title to prevent overflow on mobile viewports.
 * * Usage: Intended for single-instance usage at the top of the DOM tree (e.g., inside App.tsx), 
 * immediately preceding the MarqueeTicker or Ingestion Engine.
 */

import React from 'react';
import { cn } from '../../utils/cn'; // Assuming execution from client/src/components/ui/

export interface EditionHeaderProps extends React.HTMLAttributes<HTMLElement> {
    /** * Optional override for the dateline display. 
     * Defaults to the current system date formatted in uppercase.
     */
    dateString?: string;
    
    /** * Optional override for the edition tag located in the top right. 
     * Defaults to "LATEST METRICS EDITION".
     */
    edition?: string;
}

/**
 * Instantiates the EditionHeader with standard React ref forwarding.
 * @param props - Custom header properties merged with standard HTML header attributes.
 */
export const EditionHeader = React.forwardRef<HTMLElement, EditionHeaderProps>(
    ({ className, dateString, edition = "LATEST METRICS EDITION", ...props }, ref) => {
        // Compute default semantic date string if no override is provided
        const displayDate = dateString || new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).toUpperCase();

        return (
            <header 
                ref={ref}
                className={cn(
                    "w-full bg-white text-black flex flex-col",
                    className
                )}
                {...props}
            >
                {/* Structural Border: Top Heavy */}
                <div className="w-full h-3 bg-black"></div>

                {/* Meta Dateline Row */}
                <div className="flex justify-between items-center py-2 px-4 border-b border-black text-xs md:text-sm font-sans font-bold uppercase tracking-widest">
                    <span className="hidden md:inline-block w-1/3 text-left">Vol. I — No. 1</span>
                    <span className="w-full md:w-1/3 text-center">{displayDate}</span>
                    <span className="hidden md:inline-block w-1/3 text-right">{edition}</span>
                </div>

                {/* Primary Masthead */}
                <div className="py-8 md:py-12 px-4 flex flex-col items-center justify-center border-b-[6px] border-black">
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-center leading-none selection:bg-black selection:text-white">
                        The API Analyzer
                    </h1>
                    <p className="mt-4 md:mt-6 font-sans text-xs md:text-sm font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase text-center text-gray-800">
                        JSON Payload Ingestion & Telemetry Diagnostics
                    </p>
                </div>
            </header>
        );
    }
);

EditionHeader.displayName = 'EditionHeader';