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
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();
    const userData = await redis.get(keys.user(formattedPhone));

    if (!userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken({ userId: user.id, phone: formattedPhone });

    return res.status(200).json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name, verified: user.verified },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
