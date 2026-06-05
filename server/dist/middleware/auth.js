import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing bearer token' });
    }
    const token = header.slice('Bearer '.length);
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        if (typeof decoded.sub !== 'string' || !decoded.email || !decoded.name) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        req.auth = {
            userId: decoded.sub,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
        };
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
//# sourceMappingURL=auth.js.map