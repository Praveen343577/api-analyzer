import type { Request, Response, NextFunction } from 'express';

const TIMEOUT_MS = 30000; // 30 seconds

export const timeoutGuard = (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({
                error: 'Gateway_Timeout',
                message: `Request aborted. Upstream API failed to respond within ${TIMEOUT_MS}ms.`
            });
        }
    }, TIMEOUT_MS);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
};