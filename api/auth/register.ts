import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getRedis, keys } from '../lib/redis.js';
import { formatPhone } from '../lib/twilio.js';
import { createToken, setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, password, name } = req.body;
    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Phone, password, and name are required' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Check if user already exists
    const existing = await redis.get(keys.user(formattedPhone));
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if this phone has a keeper invite (sent by super admin)
    const keeperInviteData = await redis.get(keys.keeperInvite(formattedPhone));
    const keeperInvite = keeperInviteData
      ? (typeof keeperInviteData === 'string' ? JSON.parse(keeperInviteData) : keeperInviteData)
      : null;

    const role = keeperInvite ? 'keeper' : 'viewer';
    const invitedBy = keeperInvite?.invitedBy || undefined;

    const user = {
      id: userId,
      phone: formattedPhone,
      name,
      passwordHash,
      verified: true,
      role,
      invitedBy,
      createdAt: new Date().toISOString(),
    };

    // Store user by phone and by ID
    await redis.set(keys.user(formattedPhone), JSON.stringify(user));
    await redis.set(keys.userById(userId), JSON.stringify(user));

    // Initialize empty family members
    await redis.set(keys.familyMembers(userId), JSON.stringify([]));

    // If keeper, add to all keepers list
    if (role === 'keeper') {
      const keepersData = await redis.get(keys.allKeepers());
      const keepers = keepersData
        ? (typeof keepersData === 'string' ? JSON.parse(keepersData) : keepersData)
        : [];
      keepers.push({
        userId,
        name,
        phone: formattedPhone,
        role: 'keeper',
        joinedAt: new Date().toISOString(),
      });
      await redis.set(keys.allKeepers(), JSON.stringify(keepers));

      // Clean up the keeper invite
      await redis.del(keys.keeperInvite(formattedPhone));
    }

    const token = createToken({ userId, phone: formattedPhone });

    return res.status(201).json({
      token,
      user: { id: userId, phone: formattedPhone, name, verified: true, role },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
