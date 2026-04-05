import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getRedis, keys } from '../lib/redis.js';
import { getAuthUser, setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verify super_admin role
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const admin = typeof userData === 'string' ? JSON.parse(userData) : userData;

    if (admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can update users' });
    }

    const { userId, phone, name, password, role } = req.body;
    if (!userId || !phone) {
      return res.status(400).json({ error: 'userId and phone are required' });
    }

    const redis = getRedis();

    // Get existing user
    const existingData = await redis.get(keys.user(phone));
    if (!existingData) {
      return res.status(404).json({ error: 'User not found' });
    }
    const existing = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;

    // Build updated user
    const updated = { ...existing };
    if (name && name.trim()) updated.name = name.trim();
    if (role && (role === 'keeper' || role === 'super_admin')) updated.role = role;
    if (password && password.length >= 6) {
      updated.passwordHash = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    updated.updatedAt = new Date().toISOString();

    // Save user by phone and by ID
    await redis.set(keys.user(phone), JSON.stringify(updated));
    await redis.set(keys.userById(userId), JSON.stringify(updated));

    // Update in all keepers list
    const keepersData = await redis.get(keys.allKeepers());
    if (keepersData) {
      const keepers = typeof keepersData === 'string' ? JSON.parse(keepersData) : keepersData;
      const idx = keepers.findIndex((k: any) => k.userId === userId);
      if (idx !== -1) {
        keepers[idx].name = updated.name;
        keepers[idx].role = updated.role;
        await redis.set(keys.allKeepers(), JSON.stringify(keepers));
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${updated.name} updated successfully`,
      user: { id: userId, phone, name: updated.name, role: updated.role },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}
