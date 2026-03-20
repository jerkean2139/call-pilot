import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { encryptContent, decryptContent, isUnlockable } from '@/lib/encryption/capsule';

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

    const capsules = await prisma.timeCapsule.findMany({
      where: { babyId },
      orderBy: { unlockDate: 'asc' },
    });

    const result = capsules.map((capsule) => {
      const unlockable = isUnlockable(capsule.unlockDate);
      return {
        id: capsule.id,
        title: capsule.title,
        unlockDate: capsule.unlockDate,
        createdAt: capsule.createdAt,
        isUnlockable: unlockable,
        content: unlockable ? decryptContent(capsule.encryptedContent) : null,
        isSealed: capsule.isSealed,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/timecapsule error:', error);
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
    const { title, content, unlockDate, babyId } = body;

    if (!title || !content || !unlockDate || !babyId) {
      return NextResponse.json(
        { error: 'title, content, unlockDate, and babyId are required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const encryptedContent = encryptContent(content);

    const capsule = await prisma.timeCapsule.create({
      data: {
        title,
        encryptedContent,
        unlockDate: new Date(unlockDate),
        babyId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        id: capsule.id,
        title: capsule.title,
        unlockDate: capsule.unlockDate,
        createdAt: capsule.createdAt,
        isUnlockable: false,
        content: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/timecapsule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Capsule id is required' }, { status: 400 });
    }

    const capsule = await prisma.timeCapsule.findFirst({
      where: { id },
      include: {
        baby: {
          include: {
            family: {
              include: { memberships: true },
            },
          },
        },
      },
    });

    if (!capsule) {
      return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
    }

    const isFamilyMember = capsule.baby.family.memberships.some(
      (member: { userId: string }) => member.userId === session.user.id
    );

    if (!isFamilyMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!isUnlockable(capsule.unlockDate)) {
      return NextResponse.json(
        { error: 'This capsule cannot be opened yet' },
        { status: 403 }
      );
    }

    const decryptedContent = decryptContent(capsule.encryptedContent);

    return NextResponse.json({
      id: capsule.id,
      title: capsule.title,
      unlockDate: capsule.unlockDate,
      createdAt: capsule.createdAt,
      isUnlockable: true,
      content: decryptedContent,
    });
  } catch (error) {
    console.error('PUT /api/timecapsule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
