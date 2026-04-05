import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userData = await getAuthUser(req);
    if (!userData) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    return res.status(200).json({
      user: { id: user.id, phone: user.phone, name: user.name, verified: user.verified, role: user.role || 'viewer' },
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}
