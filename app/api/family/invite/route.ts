import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, familyId, role } = body;

    if (!email || !familyId) {
      return NextResponse.json({ error: 'email and familyId are required' }, { status: 400 });
    }

    // Verify user is a member of this family
    const membership = await prisma.membership.findUnique({
      where: { userId_familyId: { userId: session.user.id, familyId } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a family member' }, { status: 403 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.invite.create({
      data: {
        email,
        familyId,
        role: role === 'PARENT' ? 'PARENT' : 'CAREGIVER',
        expiresAt,
      },
    });

    return NextResponse.json({
      id: invite.id,
      email: invite.email,
      token: invite.token,
      role: invite.role,
      expiresAt: invite.expiresAt,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/family/invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invite = await prisma.invite.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        accepted: false,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    }

    // Check if user is already a member
    const existing = await prisma.membership.findUnique({
      where: { userId_familyId: { userId: session.user.id, familyId: invite.familyId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Already a family member' }, { status: 409 });
    }

    // Add user to family and mark invite accepted
    await prisma.$transaction([
      prisma.membership.create({
        data: {
          familyId: invite.familyId,
          userId: session.user.id,
          role: invite.role,
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { accepted: true },
      }),
    ]);

    return NextResponse.json({
      message: 'Successfully joined the family',
      familyId: invite.familyId,
    });
  } catch (error) {
    console.error('GET /api/family/invite error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
