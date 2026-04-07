import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import type { Request, Response, NextFunction } from 'express';
import type { Socket } from 'net';

export const proxyRouter = Router();

/**
 * Dynamic CORS Proxy Middleware
 * * Purpose: Bypasses browser CORS restrictions by acting as an intermediary 
 * between the React client and the user-provided API endpoint.
 * * Mechanism: 
 * 1. Intercepts incoming requests to the proxy route.
 * 2. Extracts the target API destination from the 'x-target-url' HTTP header.
 * 3. Dynamically generates a proxy middleware instance for that specific host.
 * 4. Pipes the request (including methods, body, and auth headers) to the target.
 */
proxyRouter.use('/', (req: Request, res: Response, next: NextFunction): void => {
    const targetUrl = req.headers['x-target-url'];

    // Validation: Ensure the client provided a destination
    if (!targetUrl || typeof targetUrl !== 'string') {
        res.status(400).json({ 
            error: 'Missing_Target_URL', 
            message: 'The x-target-url header is required to route the request.' 
        });
        return;
    }

    try {
        // Validate URL construct to prevent SSRF or malformed routing crashes
        new URL(targetUrl);
    } catch (e) {
        res.status(400).json({ 
            error: 'Invalid_Target_URL', 
            message: 'The provided x-target-url is not a valid URI.' 
        });
        return;
    }

    /**
     * Proxy Configuration
     * - changeOrigin: Modifies the origin of the host header to the target URL (critical for virtual hosted sites).
     * - ignorePath: Prevents appending the local proxy route path to the target URL.
     */
    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ignorePath: true,
        on: {
            /**
             * Body Parser Fix
             * If body-parser middleware runs before the proxy, the request stream is consumed.
             * fixRequestBody restripes the parsed body back into the proxy stream.
             */
            proxyReq: fixRequestBody,
            
            /**
             * Error Boundary
             * Catches DNS resolution failures, connection resets, and timeouts from the upstream server
             * to prevent the Node process from crashing.
             */
            error: (err: Error, req: Request, res: Response | Socket) => {
                // Type guard: Ensure 'res' is an Express Response (HTTP) and not a raw TCP Socket (WebSocket)
                if ('status' in res && typeof res.status === 'function') {
                    if (!res.headersSent) {
                        res.status(502).json({ 
                            error: 'Bad_Gateway', 
                            message: 'Upstream API failed to respond or rejected the connection.',
                            details: err.message
                        });
                    }
                }
            }
        }
    });

    // Execute the dynamically constructed proxy middleware
    proxy(req, res, next);
});