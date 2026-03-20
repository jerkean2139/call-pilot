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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'entries array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Collect unique babyIds and verify access for all
    const babyIds = [...new Set(entries.map((e: { babyId: string }) => e.babyId))];

    for (const babyId of babyIds) {
      const hasAccess = await verifyFamilyAccess(session.user.id, babyId as string);
      if (!hasAccess) {
        return NextResponse.json(
          { error: `Access denied for baby ${babyId}` },
          { status: 403 }
        );
      }
    }

    const results: { offlineId?: string; id: string; status: string; error?: string }[] = [];

    for (const entry of entries) {
      try {
        const { offlineId, type, title, content, occurredAt, metadata, tags, emotions, babyId } = entry;

        const validTypes = ['LOG', 'JOURNAL', 'VOICE', 'MILESTONE'];
        if (!validTypes.includes(type)) {
          results.push({
            offlineId,
            id: '',
            status: 'error',
            error: `Invalid type: ${type}`,
          });
          continue;
        }

        const created = await prisma.entry.create({
          data: {
            type,
            title,
            content: content || null,
            occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
            metadata: metadata || undefined,
            tags: tags || [],
            emotions: emotions || [],
            babyId,
            authorId: session.user.id,
          },
        });

        results.push({
          offlineId,
          id: created.id,
          status: 'created',
        });
      } catch (entryError) {
        results.push({
          offlineId: entry.offlineId,
          id: '',
          status: 'error',
          error: entryError instanceof Error ? entryError.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      synced: results.filter((r) => r.status === 'created').length,
      failed: results.filter((r) => r.status === 'error').length,
      results,
    });
  } catch (error) {
    console.error('POST /api/offline-sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
