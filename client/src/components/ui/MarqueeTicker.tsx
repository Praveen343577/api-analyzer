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
 */

import React, { useEffect, useRef } from 'react';
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
    ({ className, items, speed = 1000, ...props }, ref) => {
        const stream = items.join('   ---   ') + '   ---   '; // Delimiter between items for visual separation
        const scrollerRef = useRef<HTMLDivElement>(null);
        const animationRef = useRef<Animation | null>(null);
        const frameRef = useRef<number>(0);

        useEffect(() => {
            if (!scrollerRef.current) return;
            
            // Initialize WAAPI continuous loop
            animationRef.current = scrollerRef.current.animate(
                [{ transform: 'translateX(0%)' }, { transform: 'translateX(-50%)' }],
                { duration: speed * 1000, iterations: Infinity, easing: 'linear' }
            );

            return () => {
                animationRef.current?.cancel();
                cancelAnimationFrame(frameRef.current);
            };
        }, [speed]);

        // Decelerate playback rate over structural frames
        const triggerBrake = () => {
            cancelAnimationFrame(frameRef.current);
            const step = () => {
                if (!animationRef.current) return;
                const rate = Math.max(0, animationRef.current.playbackRate - 0.04);
                animationRef.current.playbackRate = rate;
                if (rate > 0) frameRef.current = requestAnimationFrame(step);
            };
            step();
        };

        // Accelerate playback rate over structural frames
        const releaseBrake = () => {
            cancelAnimationFrame(frameRef.current);
            const step = () => {
                if (!animationRef.current) return;
                const rate = Math.min(1, animationRef.current.playbackRate + 0.04);
                animationRef.current.playbackRate = rate;
                if (rate < 1) frameRef.current = requestAnimationFrame(step);
            };
            step();
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex w-full overflow-hidden bg-black text-white border-y-[1px] border-black py-1.5 font-mono text-xs uppercase font-bold tracking-widest whitespace-nowrap selection:bg-white selection:text-black",
                    className
                )}
                onMouseEnter={triggerBrake}
                onMouseLeave={releaseBrake}
                {...props}
            >
                <div ref={scrollerRef} className="flex">
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