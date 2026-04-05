import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getRedis, keys } from '../lib/redis.js';
import { formatPhone } from '../lib/twilio.js';
import { getAuthUser, setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Verify super_admin role
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const admin = typeof userData === 'string' ? JSON.parse(userData) : userData;

    if (admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create users' });
    }

    const { phone, name, password, role = 'keeper' } = req.body;
    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'Phone, name, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Check if user already exists
    const existing = await redis.get(keys.user(formattedPhone));
    if (existing) {
      return res.status(409).json({ error: 'This phone number is already registered' });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: userId,
      phone: formattedPhone,
      name,
      passwordHash,
      verified: true,
      role,
      invitedBy: admin.id,
      createdAt: new Date().toISOString(),
    };

    // Store user by phone and by ID
    await redis.set(keys.user(formattedPhone), JSON.stringify(user));
    await redis.set(keys.userById(userId), JSON.stringify(user));

    // Initialize empty family members
    await redis.set(keys.familyMembers(userId), JSON.stringify([]));

    // Add to all keepers list
    const keepersData = await redis.get(keys.allKeepers());
    const keepers = keepersData
      ? (typeof keepersData === 'string' ? JSON.parse(keepersData) : keepersData)
      : [];
    keepers.push({
      userId,
      name,
      phone: formattedPhone,
      role,
      joinedAt: new Date().toISOString(),
    });
    await redis.set(keys.allKeepers(), JSON.stringify(keepers));

    return res.status(201).json({
      success: true,
      message: `User ${name} created successfully`,
      user: { id: userId, phone: formattedPhone, name, role },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}
