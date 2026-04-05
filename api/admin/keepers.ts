import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const admin = typeof userData === 'string' ? JSON.parse(userData) : userData;

    if (admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can view keepers' });
    }

    const redis = getRedis();
    const keepersData = await redis.get(keys.allKeepers());
    const keepers = keepersData
      ? (typeof keepersData === 'string' ? JSON.parse(keepersData) : keepersData)
      : [];

    return res.status(200).json({ keepers });
  } catch (error: any) {
    console.error('Get keepers error:', error);
    return res.status(500).json({ error: 'Failed to get keepers' });
  }
}
