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
    const otp = generateOTP();
    const redis = getRedis();

    // Store OTP with 10 minute expiry
    await redis.set(keys.otp(formattedPhone), otp, { ex: 600 });

    // Send SMS via Twilio
    const client = getTwilioClient();
    await client.messages.create({
      body: `Your Living Legacy verification code is: ${otp}`,
      from: getTwilioPhone(),
      to: formattedPhone,
    });

    return res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}
