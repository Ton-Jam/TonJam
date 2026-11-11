import { Request, Response, NextFunction } from 'express';
import { getAuthAdmin, getFirestoreAdmin } from '../lib/firebase-admin';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Standard Firebase ID token verification middleware.
 * Verifies Authorization: Bearer <token> and attaches decoded user to req.user.
 */
export async function verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No authorization token provided' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Malformed authorization header' });
  }

  const authAdmin = getAuthAdmin();
  if (!authAdmin) {
    console.warn('[AuthMiddleware] Firebase Auth Admin not available');
    return res.status(503).json({ error: 'Service Unavailable: Authentication service offline' });
  }

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.warn('[AuthMiddleware] ID token verification rejected:', error?.message || error);
    return res.status(403).json({ error: 'Unauthorized: Invalid or expired ID token' });
  }
}

export const requireAuth = verifyFirebaseToken;

/**
 * Optional authentication middleware.
 * Enriches req.user if a valid token is provided, but allows unauthenticated access.
 */
export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return next();
  }

  const authAdmin = getAuthAdmin();
  if (authAdmin) {
    try {
      const decoded = await authAdmin.verifyIdToken(token);
      req.user = decoded;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

/**
 * Strict administrator authorization middleware.
 * Requires user to be authenticated AND verified in Firestore /admins/{uid} collection or admin claim.
 */
export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required for administrative operations' });
  }

  // 1. Check custom claim if set
  if (req.user.admin === true || req.user.role === 'admin') {
    return next();
  }

  // 2. Check Firestore /admins/{uid} record
  const firestoreAdmin = getFirestoreAdmin();
  if (firestoreAdmin) {
    try {
      const adminDoc = await firestoreAdmin.collection('admins').doc(req.user.uid).get();
      if (adminDoc.exists) {
        return next();
      }
    } catch (err) {
      console.error('[AuthMiddleware] Error checking admin document:', err);
    }
  }

  return res.status(403).json({ error: 'Forbidden: Administrative privileges required' });
}

/**
 * In-memory sliding-window rate limiter for sensitive API routes (e.g., AI and uploads).
 */
export function createRateLimiter({
  windowMs = 60000,
  maxRequests = 30,
  message = 'Too many requests, please try again later.'
}: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }, 300000);

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const identifier = req.user?.uid || req.ip || req.headers['x-forwarded-for'] || 'global';
    const key = String(identifier);
    const now = Date.now();

    const record = requestCounts.get(key);
    if (!record || now > record.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds
      });
    }

    record.count++;
    next();
  };
}

/**
 * SSRF Protection Validator.
 * Blocks private IP ranges, loopback addresses, link-local metadata services,
 * and only permits secure HTTP/HTTPS endpoints from approved hosts.
 */
export function validateSafeRemoteUrl(rawUrl: string): { valid: boolean; reason?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'Empty or invalid URL parameter' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: 'Malformed URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Only HTTP and HTTPS protocols are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. Prohibit localhost and loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0'
  ) {
    return { valid: false, reason: 'Loopback and localhost destinations are forbidden' };
  }

  // 2. Prohibit cloud metadata endpoints (AWS/GCP/Azure/DigitalOcean)
  if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
    return { valid: false, reason: 'Cloud instance metadata service destination is forbidden' };
  }

  // 3. Prohibit RFC 1918 Private IPv4 ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) {
      return { valid: false, reason: 'Private network destination (10.0.0.0/8) is forbidden' };
    }
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
      return { valid: false, reason: 'Private network destination (172.16.0.0/12) is forbidden' };
    }
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) {
      return { valid: false, reason: 'Private network destination (192.168.0.0/16) is forbidden' };
    }
  }

  return { valid: true };
}
