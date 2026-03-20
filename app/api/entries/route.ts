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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const babyId = searchParams.get('babyId');

    if (!babyId) {
      return NextResponse.json({ error: 'babyId is required' }, { status: 400 });
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const entries = await prisma.entry.findMany({
      where: { babyId },
      include: {
        media: true,
        voiceAnalysis: true,
      },
      orderBy: { occurredAt: 'desc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, content, occurredAt, metadata, tags, emotions, babyId } = body;

    if (!babyId || !type || !title) {
      return NextResponse.json(
        { error: 'babyId, type, and title are required' },
        { status: 400 }
      );
    }

    const validTypes = ['LOG', 'JOURNAL', 'VOICE', 'MILESTONE'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const entry = await prisma.entry.create({
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

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
