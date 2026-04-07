/**
 * API Analyzer - RequestTerminal Component
 * * Purpose: The primary command interface for initiating API payload ingestion. 
 * Captures target URLs, HTTP methods, and optional JSON payloads to forward 
 * through the local proxy server.
 * * Structural Features:
 * 1. Controlled React form managing URL, Method, and Body state.
 * 2. Conditionally expands to reveal a payload textarea when stateful HTTP 
 * methods (POST, PUT, PATCH) are selected.
 * 3. Integrates existing Newsprint UI primitives (SharpInput, SharpButton, NewsGridCard).
 * * Constraints Enforced:
 * 1. Prevents submission of empty or malformed basic URIs.
 * 2. Disables interaction during active ingestion (isIngesting = true) to prevent 
 * race conditions and overlapping DOM AST renders.
 */

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { SharpInput } from '../ui/SharpInput';
import { SharpButton } from '../ui/SharpButton';
import { NewsGridCard } from '../ui/NewsGridCard';

export interface RequestConfig {
    url: string;
    method: string;
    body?: string;
}

export interface RequestTerminalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
    /** * Callback executed when the user dispatches a valid configuration. */
    onDispatch: (config: RequestConfig) => void;
    /** * Locks the terminal inputs and shows processing state. */
    isIngesting: boolean;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const STATEFUL_METHODS = ['POST', 'PUT', 'PATCH'];

export const RequestTerminal = React.forwardRef<HTMLDivElement, RequestTerminalProps>(
    ({ className, onDispatch, isIngesting, ...props }, ref) => {
        const [url, setUrl] = useState('');
        const [method, setMethod] = useState('GET');
        const [body, setBody] = useState('');
        const [error, setError] = useState<string | null>(null);

        const requiresBody = STATEFUL_METHODS.includes(method);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            const trimmedUrl = url.trim();
            if (!trimmedUrl) {
                setError('Target URL is required.');
                return;
            }

            try {
                new URL(trimmedUrl);
            } catch {
                setError('Malformed URL. Must include protocol (e.g., https://).');
                return;
            }

            if (requiresBody && body.trim()) {
                try {
                    JSON.parse(body);
                } catch {
                    setError('Payload must be valid JSON.');
                    return;
                }
            }

            onDispatch({
                url: trimmedUrl,
                method,
                body: requiresBody && body.trim() ? body : undefined
            });
        };

        return (
            <NewsGridCard 
                title="Ingestion Command Terminal" 
                ref={ref} 
                className={className} 
                {...props}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* Primary Input Row */}
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                        {/* Method Selector */}
                        <div className="relative w-full md:w-32 flex-shrink-0">
                            <select
                                value={method}
                                onChange={(e) => {
                                    setMethod(e.target.value);
                                    setError(null);
                                }}
                                disabled={isIngesting}
                                className={cn(
                                    "h-10 w-full appearance-none border border-black bg-white px-3 py-2 text-sm font-sans font-bold transition-colors rounded-none",
                                    "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            >
                                {HTTP_METHODS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {/* Custom caret to replace default browser styling */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="flex-grow w-full">
                            <SharpInput
                                type="url"
                                placeholder="https://api.example.com/v1/resource..."
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError(null);
                                }}
                                disabled={isIngesting}
                                className="font-mono text-sm"
                            />
                        </div>

                        {/* Dispatch Button */}
                        <SharpButton 
                            type="submit" 
                            disabled={isIngesting}
                            className="w-full md:w-auto flex-shrink-0 font-bold uppercase tracking-widest"
                        >
                            {isIngesting ? 'Ingesting...' : 'Execute'}
                        </SharpButton>
                    </div>

                    {/* Conditional Payload Textarea */}
                    {requiresBody && (
                        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-sans font-bold uppercase tracking-wider text-gray-700">
                                JSON Payload
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => {
                                    setBody(e.target.value);
                                    setError(null);
                                }}
                                disabled={isIngesting}
                                placeholder='{"key": "value"}'
                                className={cn(
                                    "min-h-[120px] w-full resize-y border border-black bg-white px-3 py-2 font-mono text-sm placeholder:text-gray-400 rounded-none",
                                    "focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                            />
                        </div>
                    )}

                    {/* Error Diagnostics Block */}
                    {error && (
                        <div className="bg-black text-white px-3 py-2 font-mono text-xs uppercase tracking-wide border-l-4 border-red-500">
                            ERR: {error}
                        </div>
                    )}
                </form>
            </NewsGridCard>
        );
    }
);

RequestTerminal.displayName = 'RequestTerminal';