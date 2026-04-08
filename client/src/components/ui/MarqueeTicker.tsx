/**
 * API Analyzer - MarqueeTicker Component
 * * Purpose: A continuous scrolling text banner designed to display real-time 
 * ingestion metrics, proxy status, or dynamic diagnostic alerts.
 * * Constraints Enforced:
 * 1. Strict Newsprint typography: Monospaced (JetBrains Mono/Courier), uppercase.
 * 2. High-contrast monochromatic palette: Inverted block (black background, white text).
 * 3. Infinite linear CSS animation loop to simulate classic ticker-tape machines.
 * * Implementation Note: To ensure a seamless infinite scroll across wide viewports, 
 * the text content is duplicated sequentially.
 * * CSS Requirement: You must define the 'marquee' keyframes in client/src/styles/global.css:
 * @keyframes marquee {
 * 0% { transform: translateX(0%); }
 * 100% { transform: translateX(-50%); }
 * }
 */

import React from 'react';
import { cn } from '../../utils/cn'; // Assuming execution from client/src/components/ui/

export interface MarqueeTickerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** * Array of distinct string alerts to concatenate into the ticker stream. */
    items: string[];
    
    /** * Total animation loop duration in seconds. Lower is faster. Defaults to 30. */
    speed?: number;
}

/**
 * Instantiates the MarqueeTicker with standard React ref forwarding.
 * @param props - Component-specific properties merged with standard HTML div attributes.
 */
export const MarqueeTicker = React.forwardRef<HTMLDivElement, MarqueeTickerProps>(
    ({ className, items, speed = 30, ...props }, ref) => {
        // Construct the continuous string stream with a high-visibility delimiter
        const stream = items.join('   ///   ') + '   ///   ';

        return (
            <div
                ref={ref}
                className={cn(
                    "flex w-full overflow-hidden bg-black text-white border-y-[1px] border-black py-1.5 font-mono text-xs uppercase font-bold tracking-widest whitespace-nowrap selection:bg-white selection:text-black",
                    className
                )}
                {...props}
            >
                <div 
                    // className="flex animate-[marquee_linear_infinite]"
                    className="flex animate-marquee hover:[animation-play-state:paused]"
                    style={{ animationDuration: `${speed}s` }}
                >
                    {/* Render identical blocks to guarantee seamless loop continuation */}
                    <span className="pr-0">{stream}</span>
                    <span className="pr-0">{stream}</span>
                    <span className="pr-0">{stream}</span>
                    <span className="pr-0">{stream}</span>
                </div>
            </div>
        );
    }
);

MarqueeTicker.displayName = 'MarqueeTicker';