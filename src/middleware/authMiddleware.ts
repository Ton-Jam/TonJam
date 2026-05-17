import { Request, Response, NextFunction } from 'express';
import { getAuthAdmin } from '../lib/firebase-admin';

export interface AuthRequest extends Request {
  user?: any;
}

export async function verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  const authAdmin = getAuthAdmin();

  if (!authAdmin) {
    console.error('Firebase Admin not initialized - skipping verification or failing');
    // In production, you'd want to fail. In dev, maybe skip if the key is missing?
    // Let's fail for safety.
    return res.status(500).json({ error: 'Internal Server Error: Auth service unavailable' });
  }

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
}
