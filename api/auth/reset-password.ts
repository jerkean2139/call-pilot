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
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Phone, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Verify reset OTP
    const storedOTP = await redis.get(`reset_otp:${formattedPhone}`);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(401).json({ error: 'Invalid or expired reset code' });
    }

    // Delete used OTP
    await redis.del(`reset_otp:${formattedPhone}`);

    // Get user and update password
    const userData = await redis.get(keys.user(formattedPhone));
    if (!userData) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    // Save updated user
    await redis.set(keys.user(formattedPhone), JSON.stringify(user));
    await redis.set(keys.userById(user.id), JSON.stringify(user));

    // Return a fresh token so they're logged in
    const token = createToken({ userId: user.id, phone: formattedPhone });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, phone: user.phone, name: user.name, verified: true, role: user.role || 'viewer' },
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Password reset failed' });
  }
}
