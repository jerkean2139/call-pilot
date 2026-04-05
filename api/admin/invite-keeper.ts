import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { getTwilioClient, getTwilioPhone, formatPhone } from '../lib/twilio';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

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
      return res.status(403).json({ error: 'Only super admins can invite Memory Keepers' });
    }

    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name are required' });
    }

    const formattedPhone = formatPhone(phone);
    const redis = getRedis();

    // Check if user already exists
    const existingUser = await redis.get(keys.user(formattedPhone));
    if (existingUser) {
      return res.status(409).json({ error: 'This phone number is already registered' });
    }

    // Store keeper invite so registration knows to assign keeper role
    const invite = {
      phone: formattedPhone,
      name,
      invitedBy: admin.id,
      invitedByName: admin.name,
      createdAt: new Date().toISOString(),
    };
    // Keeper invite never expires (until used)
    await redis.set(keys.keeperInvite(formattedPhone), JSON.stringify(invite));

    // Send SMS invite
    const client = getTwilioClient();
    const signupUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/register`
      : process.env.APP_URL
        ? `${process.env.APP_URL}/register`
        : 'the Living Legacy app';

    await client.messages.create({
      body: `${admin.name} invited you to join Living Legacy as a Memory Keeper! Sign up with this phone number at ${signupUrl}`,
      from: getTwilioPhone(),
      to: formattedPhone,
    });

    return res.status(200).json({
      success: true,
      message: `Invite sent to ${name} at ${formattedPhone}`,
      invite,
    });
  } catch (error: any) {
    console.error('Invite keeper error:', error);
    return res.status(500).json({ error: 'Failed to send invite' });
  }
}
