import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getRedis, keys } from '../lib/redis.js';
import { formatPhone } from '../lib/twilio.js';
import { createToken, setCorsHeaders } from '../lib/auth.js';

// One-time setup endpoint to create the super admin account.
// Only works if no super admin exists yet.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, password, name, setupKey } = req.body;

    // Require setup key from environment to prevent unauthorized access
    const expectedKey = process.env.ADMIN_SETUP_KEY;
    if (!expectedKey || setupKey !== expectedKey) {
      return res.status(403).json({ error: 'Invalid setup key' });
    }

    if (!phone || !password || !name) {
      return res.status(400).json({ error: 'Phone, password, and name are required' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Check if user already exists
    const existing = await redis.get(keys.user(formattedPhone));
    if (existing) {
      const existingUser = typeof existing === 'string' ? JSON.parse(existing) : existing;
      if (existingUser.role === 'super_admin') {
        return res.status(409).json({ error: 'Super admin already exists' });
      }
      // Upgrade existing user to super_admin
      existingUser.role = 'super_admin';
      await redis.set(keys.user(formattedPhone), JSON.stringify(existingUser));
      await redis.set(keys.userById(existingUser.id), JSON.stringify(existingUser));
      const token = createToken({ userId: existingUser.id, phone: formattedPhone });
      return res.status(200).json({
        token,
        user: { id: existingUser.id, phone: formattedPhone, name: existingUser.name, verified: true, role: 'super_admin' },
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: userId,
      phone: formattedPhone,
      name,
      passwordHash,
      verified: true,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    };

    await redis.set(keys.user(formattedPhone), JSON.stringify(user));
    await redis.set(keys.userById(userId), JSON.stringify(user));
    await redis.set(keys.familyMembers(userId), JSON.stringify([]));
    await redis.set(keys.allKeepers(), JSON.stringify([]));

    const token = createToken({ userId, phone: formattedPhone });

    return res.status(201).json({
      token,
      user: { id: userId, phone: formattedPhone, name, verified: true, role: 'super_admin' },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: 'Setup failed' });
  }
}
