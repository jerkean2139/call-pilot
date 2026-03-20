import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entryId = formData.get('entryId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
    }

    const entry = await prisma.entry.findFirst({
      where: { id: entryId },
      include: {
        baby: {
          include: {
            family: {
              include: {
                memberships: true,
              },
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVideo = file.type.startsWith('video');
    const uploadResult = await uploadToCloudinary(buffer, {
      resourceType: isVideo ? 'video' : 'image',
    });

    const media = await prisma.media.create({
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        type: file.type,
        thumbnailUrl: uploadResult.thumbnailUrl,
        entryId,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
