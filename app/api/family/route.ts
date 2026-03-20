import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const families = await prisma.family.findMany({
      where: {
        memberships: {
          some: { userId: session.user.id },
        },
      },
      include: {
        babies: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(families);
  } catch (error) {
    console.error('GET /api/family error:', error);
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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    const family = await prisma.family.create({
      data: {
        name,
        memberships: {
          create: {
            userId: session.user.id,
            role: 'PARENT',
          },
        },
      },
      include: {
        babies: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(family, { status: 201 });
  } catch (error) {
    console.error('POST /api/family error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
