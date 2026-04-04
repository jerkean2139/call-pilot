import jwt from 'jsonwebtoken';
import type { VercelRequest } from '@vercel/node';
import { getRedis, keys } from './redis';

interface TokenPayload {
  userId: string;
  phone: string;
}

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET environment variable');
  return secret;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJWTSecret()) as TokenPayload;
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function getAuthUser(req: VercelRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    const redis = getRedis();
    const user = await redis.get(keys.userById(payload.userId));
    return user as Record<string, string> | null;
  } catch {
    return null;
  }
}

export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
