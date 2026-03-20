import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

async function verifyFamilyAccess(userId: string, babyId: string): Promise<boolean> {
  const baby = await prisma.baby.findFirst({
    where: {
      id: babyId,
      family: {
        memberships: {
          some: { userId },
        },
      },
    },
  });
  return !!baby;
}

function generateTitle(logType: string, subType?: string): string {
  const typeLabel = logType.charAt(0).toUpperCase() + logType.slice(1).toLowerCase();
  if (subType) {
    return `${typeLabel} - ${subType.toLowerCase()}`;
  }
  return typeLabel;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { babyId, metadata, occurredAt } = body;

    if (!babyId) {
      return NextResponse.json({ error: 'babyId is required' }, { status: 400 });
    }

    if (!metadata || !metadata.logType) {
      return NextResponse.json(
        { error: 'metadata with logType is required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { logType, subType, amount, duration, notes, startTime, endTime } = metadata;
    const title = generateTitle(logType, subType);

    const entry = await prisma.entry.create({
      data: {
        type: 'LOG',
        title,
        content: notes || null,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        metadata: {
          logType,
          subType: subType || null,
          amount: amount || null,
          duration: duration || null,
          notes: notes || null,
          startTime: startTime || null,
          endTime: endTime || null,
        },
        babyId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/entries/quick error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
