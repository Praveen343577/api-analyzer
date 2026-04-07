/**
 * API Analyzer - Proxy Server Entry Point
 * * Purpose: Initializes the Express application, configures security boundaries,
 * establishes CORS policies for the client application, and mounts the 
 * dynamic proxy router and structural middlewares.
 * * Architecture:
 * - Express.js running on Node.js (ESM).
 * - Port defaults to 3000 unless overridden by environment variables.
 * - Restricts cross-origin requests exclusively to the local Vite client.
 * * Note on Imports: Under TypeScript 'NodeNext' module resolution with ESM,
 * relative file imports must explicitly use the '.js' extension.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { proxyRouter } from './routes/fetchProxy.js';
import { sizeLimiter } from './middleware/sizeLimiter.js';
import { timeoutGuard } from './middleware/timeoutGuard.js';

// Initialize environment variables from .env file (if present)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:1729'; // Default Vite dev server origin

/**
 * CORS Configuration
 * Restricts access to the proxy server to prevent unauthorized external usage.
 * Only the designated client origin (e.g., Vite dev server) is permitted to interact.
 */
app.use(cors({
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-target-url'],
    credentials: true
}));

/**
 * Global Middlewares
 * 1. sizeLimiter: Drops requests exceeding 5MB to protect memory limits.
 * 2. timeoutGuard: Forces connection closure if upstream takes >30s.
 * * Critical Structural Note: `express.json()` and `express.urlencoded()` are 
 * INTENTIONALLY OMITTED. Parsing the body before the proxy middleware intercepts 
 * it consumes the HTTP stream, silently destroying POST/PUT payloads.
 */
app.use(sizeLimiter);
app.use(timeoutGuard);

/**
 * Route Mounting
 * Mounts the proxy logic at /api/proxy. 
 * The Vite client must route requests here and define the final destination 
 * via the 'x-target-url' header.
 */
app.use('/api/proxy', proxyRouter);

/**
 * Health Check Endpoint
 * Provides a lightweight route to verify server operational status without
 * triggering the proxy pipeline or external network calls.
 */
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        service: 'api-analyzer-proxy',
        timestamp: new Date().toISOString() 
    });
});

/**
 * Server Initialization
 * Binds the Express application to the specified port and begins listening
 * for incoming TCP connections.
 */
app.listen(PORT, () => {
    console.log(`[Proxy Server] Active and listening on port ${PORT}`);
    console.log(`[Proxy Server] Accepting connections exclusively from ${CLIENT_ORIGIN}`);
});