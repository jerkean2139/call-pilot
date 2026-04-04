import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userData = await getAuthUser(req);
  if (!userData) return res.status(401).json({ error: 'Not authenticated' });
  const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

  const redis = getRedis();

  if (req.method === 'POST') {
    try {
      const { role = 'family' } = req.body || {};
      const code = generateInviteCode();

      const invite = {
        code,
        createdBy: user.id,
        createdByName: user.name,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString(),
      };

      // Store invite with 7-day TTL
      await redis.set(keys.invite(code), JSON.stringify(invite), { ex: 7 * 24 * 60 * 60 });

      return res.status(201).json({ invite });
    } catch (error) {
      console.error('Create invite error:', error);
      return res.status(500).json({ error: 'Failed to create invite' });
    }
  }

  if (req.method === 'GET') {
    // List invites isn't stored centrally, return a message
    return res.status(200).json({ message: 'Use invite code to join a family' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
