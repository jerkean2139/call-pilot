import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis.js';
import { getAuthUser, setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verify super_admin role
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const admin = typeof userData === 'string' ? JSON.parse(userData) : userData;

    if (admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete users' });
    }

    const { userId, phone } = req.body;
    if (!userId || !phone) {
      return res.status(400).json({ error: 'userId and phone are required' });
    }

    // Prevent self-deletion
    if (userId === admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const redis = getRedis();

    // Delete user records
    await redis.del(keys.user(phone));
    await redis.del(keys.userById(userId));
    await redis.del(keys.familyMembers(userId));

    // Remove from all keepers list
    const keepersData = await redis.get(keys.allKeepers());
    if (keepersData) {
      const keepers = typeof keepersData === 'string' ? JSON.parse(keepersData) : keepersData;
      const updated = keepers.filter((k: any) => k.userId !== userId);
      await redis.set(keys.allKeepers(), JSON.stringify(updated));
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}
