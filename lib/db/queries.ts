import { prisma } from './prisma';
import { EntryType, Role } from '@prisma/client';

export async function getUserFamilies(userId: string) {
  return prisma.family.findMany({
    where: {
      memberships: { some: { userId } },
    },
    include: {
      babies: true,
      memberships: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });
}

export async function getUserMembership(userId: string, familyId: string) {
  return prisma.membership.findUnique({
    where: { userId_familyId: { userId, familyId } },
  });
}

export async function assertFamilyAccess(userId: string, familyId: string) {
  const membership = await getUserMembership(userId, familyId);
  if (!membership) throw new Error('Access denied: not a family member');
  return membership;
}

export async function assertBabyAccess(userId: string, babyId: string) {
  const baby = await prisma.baby.findUnique({
    where: { id: babyId },
    include: { family: { include: { memberships: true } } },
  });
  if (!baby) throw new Error('Baby not found');
  const isMember = baby.family.memberships.some((m) => m.userId === userId);
  if (!isMember) throw new Error('Access denied: not a family member');
  return baby;
}

export async function getTimelineEntries(babyId: string, opts?: { cursor?: string; take?: number; type?: EntryType }) {
  const take = opts?.take ?? 20;
  return prisma.entry.findMany({
    where: {
      babyId,
      ...(opts?.type ? { type: opts.type } : {}),
    },
    include: {
      media: true,
      author: { select: { id: true, name: true, image: true } },
      voiceAnalysis: true,
    },
    orderBy: { occurredAt: 'desc' },
    take,
    ...(opts?.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  });
}

export async function getBabyMilestones(babyId: string) {
  return prisma.milestone.findMany({
    where: { babyId },
    orderBy: [{ ageBandMonths: 'asc' }, { category: 'asc' }],
  });
}

export async function getTimeCapsules(babyId: string) {
  return prisma.timeCapsule.findMany({
    where: { babyId },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { unlockDate: 'asc' },
  });
}

export async function getFamilyMembers(familyId: string) {
  return prisma.membership.findMany({
    where: { familyId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function createFamily(name: string, userId: string) {
  return prisma.family.create({
    data: {
      name,
      memberships: {
        create: { userId, role: Role.PARENT },
      },
    },
  });
}

export async function createBaby(data: { name: string; birthDate: Date; theme: 'STRAWBERRY' | 'STORYBOOK'; familyId: string }) {
  return prisma.baby.create({ data });
}
