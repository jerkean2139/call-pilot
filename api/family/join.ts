import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Invite code is required' });

    const redis = getRedis();
    const inviteData = await redis.get(keys.invite(code.toUpperCase()));
    if (!inviteData) return res.status(404).json({ error: 'Invalid or expired invite code' });

    const invite = typeof inviteData === 'string' ? JSON.parse(inviteData) : inviteData;

    // Add current user to the inviter's family members
    const membersData = await redis.get(keys.familyMembers(invite.createdBy));
    const members = membersData
      ? (typeof membersData === 'string' ? JSON.parse(membersData) : membersData)
      : [];

    // Check if already a member
    if (members.some((m: any) => m.userId === user.id)) {
      return res.status(200).json({ message: 'Already a family member' });
    }

    members.push({
      userId: user.id,
      name: user.name,
      phone: user.phone,
      role: invite.role,
      joinedAt: new Date().toISOString(),
    });

    await redis.set(keys.familyMembers(invite.createdBy), JSON.stringify(members));

    // Also store reverse mapping so the joining user knows which family they belong to
    await redis.set(keys.family(user.id), invite.createdBy);

    return res.status(200).json({
      message: 'Joined family successfully',
      familyOwner: invite.createdByName,
    });
  } catch (error) {
    console.error('Join family error:', error);
    return res.status(500).json({ error: 'Failed to join family' });
  }
}
