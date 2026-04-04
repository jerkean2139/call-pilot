import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedis, keys } from '../lib/redis';
import { getAuthUser, setCorsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const redis = getRedis();

  // POST - Share/unshare an entry
  if (req.method === 'POST') {
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });
    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    try {
      const { entry, action } = req.body;

      if (action === 'unshare') {
        await redis.del(keys.sharedEntry(user.id, entry.entryId));
        // Remove from shared entries list
        const listData = await redis.get(keys.sharedEntries(user.id));
        const list = listData
          ? (typeof listData === 'string' ? JSON.parse(listData) : listData)
          : [];
        const filtered = list.filter((e: any) => e.entryId !== entry.entryId);
        await redis.set(keys.sharedEntries(user.id), JSON.stringify(filtered));
        return res.status(200).json({ message: 'Entry unshared' });
      }

      // Share entry
      const sharedEntry = {
        ...entry,
        userId: user.id,
        sharedAt: new Date().toISOString(),
      };

      await redis.set(keys.sharedEntry(user.id, entry.entryId), JSON.stringify(sharedEntry));

      // Add to shared entries list
      const listData = await redis.get(keys.sharedEntries(user.id));
      const list = listData
        ? (typeof listData === 'string' ? JSON.parse(listData) : listData)
        : [];
      const existing = list.findIndex((e: any) => e.entryId === entry.entryId);
      if (existing >= 0) {
        list[existing] = sharedEntry;
      } else {
        list.push(sharedEntry);
      }
      await redis.set(keys.sharedEntries(user.id), JSON.stringify(list));

      return res.status(200).json({ message: 'Entry shared', sharedEntry });
    } catch (error) {
      console.error('Share entry error:', error);
      return res.status(500).json({ error: 'Failed to share entry' });
    }
  }

  // GET - Get shared entries for a family member
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Check auth - either the owner or a family member
      const userData = await getAuthUser(req);
      if (!userData) return res.status(401).json({ error: 'Not authenticated' });
      const currentUser = typeof userData === 'string' ? JSON.parse(userData) : userData;

      // Check if current user is the owner or a family member
      if (currentUser.id !== userId) {
        const membersData = await redis.get(keys.familyMembers(userId));
        const members = membersData
          ? (typeof membersData === 'string' ? JSON.parse(membersData) : membersData)
          : [];
        const isMember = members.some((m: any) => m.userId === currentUser.id);

        // Also check reverse - maybe current user belongs to this family
        const familyOwner = await redis.get(keys.family(currentUser.id));
        if (!isMember && familyOwner !== userId) {
          return res.status(403).json({ error: 'Not authorized to view these entries' });
        }
      }

      const listData = await redis.get(keys.sharedEntries(userId));
      const entries = listData
        ? (typeof listData === 'string' ? JSON.parse(listData) : listData)
        : [];

      return res.status(200).json({ entries });
    } catch (error) {
      console.error('Get shared entries error:', error);
      return res.status(500).json({ error: 'Failed to get shared entries' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
