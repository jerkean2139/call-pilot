import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function getCurrentUserId() {
  const session = await requireAuth();
  return (session.user as { id: string }).id;
}
