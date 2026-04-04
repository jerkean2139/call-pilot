import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { formatPhone } from '../lib/twilio';
import { setCorsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();
    const storedOTP = await redis.get(keys.otp(formattedPhone));

    if (!storedOTP || storedOTP !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Delete used OTP
    await redis.del(keys.otp(formattedPhone));

    // Check if user exists
    const existingUser = await redis.get(keys.user(formattedPhone));

    return res.status(200).json({
      verified: true,
      userExists: !!existingUser,
      phone: formattedPhone,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
}
