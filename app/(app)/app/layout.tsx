import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { BabyProvider } from '@/hooks/use-baby-context';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id: string }).id;

  // Fetch user's families and babies
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      family: {
        include: {
          babies: true,
        },
      },
    },
  });

  // If no families, redirect to onboarding
  if (memberships.length === 0) {
    redirect('/onboarding');
  }

  // Collect all babies across all families
  const babies = memberships.flatMap((m) => m.family.babies);

  // If family exists but no babies, redirect to onboarding
  if (babies.length === 0) {
    redirect('/onboarding');
  }

  return (
    <BabyProvider initialBabies={babies}>
      <AppShell>{children}</AppShell>
    </BabyProvider>
  );
}
