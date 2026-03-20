import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { generateShareToken, generateQRCodeDataUrl } from '@/lib/qr/generate';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const shareToken = await prisma.shareToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Invalid or expired share token' },
        { status: 404 }
      );
    }

    const qrCodeDataUrl = await generateQRCodeDataUrl(token);

    return NextResponse.json({
      token: shareToken.token,
      entryId: shareToken.entryId,
      expiresAt: shareToken.expiresAt,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error('GET /api/qr/[token] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
    }

    // Verify user has access to the entry's baby
    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
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

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const isFamilyMember = entry.baby.family.memberships.some(
      (member: { userId: string }) => member.userId === session.user.id
    );

    if (!isFamilyMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const generatedToken = await generateShareToken(entryId, 30);

    const shareToken = await prisma.shareToken.findFirst({
      where: { token: generatedToken },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const qrCodeDataUrl = await generateQRCodeDataUrl(`${baseUrl}/share/video/${generatedToken}`);

    return NextResponse.json(
      {
        token: generatedToken,
        entryId,
        expiresAt: shareToken?.expiresAt,
        qrCode: qrCodeDataUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/qr/[token] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
