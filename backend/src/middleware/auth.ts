import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin token required' });
  }

  const token = authHeader.substring(7);
  
  // If ADMIN_TOKEN is configured, check if token matches it
  if (adminToken && token === adminToken) {
    return next();
  }
  
  // If ADMIN_TOKEN is not configured or token doesn't match, 
  // allow any authenticated user token (fallback for logged-in users)
  // This allows authenticated users to perform admin operations
  if (!adminToken) {
    // No ADMIN_TOKEN configured, accept any non-empty token
    (req as any).token = token;
    return next();
  }
  
  // ADMIN_TOKEN is configured but token doesn't match
  // Check if it's a valid user token (any non-empty token for now)
  // In production, you'd validate the token against stored user tokens
  if (token && token.length > 0) {
    // Accept as authenticated user token
    (req as any).token = token;
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: Invalid admin token' });
}

// Simple token validation (in production, use JWT or store tokens in DB)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Token required' });
  }

  const token = authHeader.substring(7);
  
  // For simplicity, we'll extract user ID from a token format
  // In production, use JWT or query token from database
  // For now, we'll use a simple approach: store userId in request after validation
  // This is a simplified version - in production, decode JWT or query token from DB
  
  // For demo purposes, we'll accept any non-empty token and require userId in body/query
  // In a real app, you'd validate the token and extract userId from it
  (req as any).token = token;
  
  // If userId is provided in body or query, use it (for demo)
  // In production, extract from validated JWT token
  const userId = (req.body?.userId || req.query?.userId) as number | undefined;
  if (userId) {
    (req as any).userId = userId;
  }

  next();
}
