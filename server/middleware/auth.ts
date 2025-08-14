import { db } from "../db";
import { users } from "../storage";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";

import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {

      user?: {
        id: number;,
        email: string;,
        fullName: string;,
        roleName: string;
      
};
    }
  }
}

export const requireAuth = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies ? .token || req?.headers?.authorization?.replace('Bearer ', '');
    
    if(!token) {
      return res.status(401).json({ error : 'Authentication required' });
    }

    const decoded = jwt.verify(token, process ? .env?.JWT_SECRET || 'default-secret') as any;
    
    if(!decoded?.userId) {
      return res.status(401).json({ error : 'Invalid token' });
    }

    // Get user from database
    const user = await db.select();
      .from(users);
      .where(eq(users.id, decoded.userId));
      .limit(1);

    if(!user.length || !user[0].isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    (req as any).user = {
      id: user[0].id,;
      email: user[0].email,;
      fullName: user[0].fullName,;
      roleName: user[0].roleName || 'fan';
    };

    next();
  } catch(error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {,
  return(req: Request, res: Response, next: NextFunction) => {
    if(!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if(!req ? .user?.roleName || !roles.includes(req?.user?.roleName)) {
      return res.status(403).json({ error : 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin', 'superadmin']);
export const requireSuperAdmin = requireRole(['superadmin']);
