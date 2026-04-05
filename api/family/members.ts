import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis.js';
import { getAuthUser, setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    const redis = getRedis();
    const membersData = await redis.get(keys.familyMembers(user.id));
    const members = membersData
      ? (typeof membersData === 'string' ? JSON.parse(membersData) : membersData)
      : [];

    return res.status(200).json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({ error: 'Failed to get family members' });
  }
}
