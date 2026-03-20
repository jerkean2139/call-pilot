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

    const milestones = await prisma.milestone.findMany({
      where: { babyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('GET /api/milestones error:', error);
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
    const { title, description, category, ageBandMonths, babyId } = body;

    if (!title || !babyId) {
      return NextResponse.json(
        { error: 'title and babyId are required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title,
        description: description || null,
        category: category || null,
        ageBandMonths: ageBandMonths || null,
        babyId,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('POST /api/milestones error:', error);
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
    const { id, completedAt, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Milestone id is required' }, { status: 400 });
    }

    const milestone = await prisma.milestone.findFirst({
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

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const isFamilyMember = milestone.baby.family.memberships.some(
      (member: { userId: string }) => member.userId === session.user.id
    );

    if (!isFamilyMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        completedAt: completedAt ? new Date(completedAt) : milestone.completedAt ? null : new Date(),
        notes: notes !== undefined ? notes : milestone.notes,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/milestones error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
