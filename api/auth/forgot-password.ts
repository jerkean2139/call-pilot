import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis.js';
import { getTwilioClient, getTwilioPhone, generateOTP, formatPhone } from '../lib/twilio.js';
import { setCorsHeaders } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Check if user exists
    const userData = await redis.get(keys.user(formattedPhone));
    if (!userData) {
      // Don't reveal whether the account exists
      return res.status(200).json({ success: true, message: 'If an account exists, a reset code was sent' });
    }

    const otp = generateOTP();

    // Store reset OTP with 10 minute expiry (using a separate key from login OTP)
    await redis.set(`reset_otp:${formattedPhone}`, otp, { ex: 600 });

    const client = getTwilioClient();
    await client.messages.create({
      body: `Your Living Legacy password reset code is: ${otp}. This code expires in 10 minutes.`,
      from: getTwilioPhone(),
      to: formattedPhone,
    });

    return res.status(200).json({ success: true, message: 'Reset code sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to send reset code' });
  }
}
