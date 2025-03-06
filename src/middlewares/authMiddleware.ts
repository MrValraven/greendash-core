import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        if(typeof decoded !== 'object' || !decoded?.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.body.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}