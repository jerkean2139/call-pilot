import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error('Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables');
    }
    redis = new Redis({ url, token });
  }
  return redis;
}

// Key helpers
export const keys = {
  user: (phone: string) => `user:${phone}`,
  userById: (id: string) => `user_id:${id}`,
  otp: (phone: string) => `otp:${phone}`,
  session: (token: string) => `session:${token}`,
  family: (userId: string) => `family:${userId}`,
  familyMembers: (userId: string) => `family_members:${userId}`,
  invite: (code: string) => `invite:${code}`,
  sharedEntries: (userId: string) => `shared:${userId}`,
  sharedEntry: (userId: string, entryId: string) => `shared:${userId}:${entryId}`,
};
