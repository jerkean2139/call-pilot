import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await getSession();

  if (session?.user) {
    redirect('/app');
  } else {
    redirect('/login');
  }
}
