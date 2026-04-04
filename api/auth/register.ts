import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { getRedis, keys } from '../lib/redis';
import { formatPhone } from '../lib/twilio';
import { createToken, setCorsHeaders } from '../lib/auth';

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

    const user = {
      id: userId,
      phone: formattedPhone,
      name,
      passwordHash,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    // Store user by phone and by ID
    await redis.set(keys.user(formattedPhone), JSON.stringify(user));
    await redis.set(keys.userById(userId), JSON.stringify(user));

    // Initialize empty family
    await redis.set(keys.familyMembers(userId), JSON.stringify([]));

    const token = createToken({ userId, phone: formattedPhone });

    return res.status(201).json({
      token,
      user: { id: userId, phone: formattedPhone, name, verified: true },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
