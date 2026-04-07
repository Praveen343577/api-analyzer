/**
 * API Analyzer - Root Application Component
 * * Purpose: Orchestrates global state, handles HTTP proxy communication, 
 * and controls the macro DOM layout.
 * * Data Flow:
 * 1. Receives RequestConfig from RequestTerminal.
 * 2. Pipes request through the local Node.js CORS proxy.
 * 3. Catches and parses the upstream JSON response.
 * 4. Dispatches the raw JSON to the metricCalculator and astNormalizer engines.
 * 5. Passes the processed structural data to the EditorialGrid for rendering.
 */

import React, { useState } from 'react';
import { EditionHeader } from './components/ui/EditionHeader';
import { MarqueeTicker } from './components/ui/MarqueeTicker';
import { RequestTerminal, type RequestConfig } from './components/ingestion/RequestTerminal';
import { EditorialGrid } from './components/visualization/EditorialGrid';
import { normalizeAst, type NormalizedNode } from './core/astNormalizer';
import { calculatePayloadMetrics, type PayloadMetrics } from './core/metricCalculator';

// Standard local proxy endpoint established in server.ts
const PROXY_URL = 'http://localhost:3000/api/proxy';

export default function App() {
    const [isIngesting, setIsIngesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [astRoot, setAstRoot] = useState<NormalizedNode | null>(null);
    const [metrics, setMetrics] = useState<PayloadMetrics | null>(null);
    const [tickerItems, setTickerItems] = useState<string[]>([
        'SYSTEM ONLINE',
        'AWAITING INGESTION COMMAND',
        'CORS PROXY ACTIVE ON PORT 3000',
        'STRICT AST NORMALIZATION ENFORCED'
    ]);

    const handleDispatch = async (config: RequestConfig) => {
        setIsIngesting(true);
        setError(null);
        setAstRoot(null);
        setMetrics(null);
        setTickerItems(['INITIATING CONNECTION...', `TARGET: ${config.url}`, 'BYPASSING CORS...']);

        try {
            const fetchOptions: RequestInit = {
                method: config.method,
                headers: {
                    'x-target-url': config.url,
                    ...(config.body ? { 'Content-Type': 'application/json' } : {})
                },
                body: config.body
            };

            const startTime = performance.now();
            const response = await fetch(PROXY_URL, fetchOptions);
            const endTime = performance.now();
            const latency = Math.round(endTime - startTime);

            if (!response.ok) {
                throw new Error(`Upstream rejected request: HTTP ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error(`Expected application/json, received ${contentType || 'Unknown'}`);
            }

            const rawJson = await response.json();
            
            setTickerItems(['ANALYZING PAYLOAD...', 'COMPUTING METRICS...', 'RECURSIVE AST GENERATION...']);

            // Execute synchronous heavy-lifting pipelines
            const calculatedMetrics = calculatePayloadMetrics(rawJson);
            const normalizedTree = normalizeAst(rawJson);

            setMetrics(calculatedMetrics);
            setAstRoot(normalizedTree);
            setTickerItems([
                'INGESTION COMPLETE',
                `LATENCY: ${latency}ms`,
                `PAYLOAD SIZE: ${(calculatedMetrics.totalByteSize / 1024).toFixed(2)} KB`,
                `MAX STRUCTURAL DEPTH: ${calculatedMetrics.maxDepth}`
            ]);

        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown network or parsing error occurred.';
            setError(errorMsg);
            setTickerItems(['INGESTION FAILED', 'CRITICAL ERROR IN PROXY PIPELINE', 'AWAITING RESET']);
        } finally {
            setIsIngesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f0] text-black font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white pb-20">
            <EditionHeader />
            <MarqueeTicker items={tickerItems} speed={25} />
            
            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
                
                {/* Command & Control Block */}
                <section>
                    <RequestTerminal 
                        onDispatch={handleDispatch} 
                        isIngesting={isIngesting} 
                    />
                </section>

                {/* System Error Block */}
                {error && (
                    <div className="border-[4px] border-red-600 bg-white p-4 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="font-serif text-xl font-bold uppercase text-red-600 mb-2">
                            SYSTEM FAULT DETECTED
                        </h2>
                        <p className="font-mono text-sm font-bold bg-red-50 text-red-900 p-3 border border-red-200">
                            {error}
                        </p>
                    </div>
                )}

                {/* Master Output Render Boundary */}
                {astRoot && metrics && (
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <EditorialGrid dataNode={astRoot} metrics={metrics} />
                    </section>
                )}

            </main>
        </div>
    );
}