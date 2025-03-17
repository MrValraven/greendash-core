import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token as string, process.env.ACCESS_TOKEN_SECRET as string);

    if (typeof decoded !== 'object' || !decoded?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.body.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
}
