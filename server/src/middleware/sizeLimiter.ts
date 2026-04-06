import type { Request, Response, NextFunction } from 'express';

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

export const sizeLimiter = (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > MAX_PAYLOAD_BYTES) {
        res.status(413).json({
            error: 'Payload_Too_Large',
            message: `Request size of ${contentLength} bytes exceeds the strict ${MAX_PAYLOAD_BYTES} byte limit.`
        });
        return;
    }

    next();
};