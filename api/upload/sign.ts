import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser, setCorsHeaders } from '../lib/auth.js';
import { getUploadSignature } from '../lib/cloudinary.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userData = await getAuthUser(req);
    if (!userData) return res.status(401).json({ error: 'Not authenticated' });

    const { resourceType = 'image' } = req.body;

    if (resourceType !== 'image' && resourceType !== 'video') {
      return res.status(400).json({ error: 'resourceType must be image or video' });
    }

    const folder = 'living-legacy';
    const signData = getUploadSignature(folder, resourceType);

    return res.status(200).json(signData);
  } catch (error: any) {
    console.error('Upload sign error:', error);
    return res.status(500).json({ error: 'Failed to generate upload signature' });
  }
}
