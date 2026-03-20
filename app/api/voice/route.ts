import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { processVoiceMemo } from '@/lib/ai/voice-analysis';

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

    const contentType = request.headers.get('content-type') || '';

    // Handle approval flow (JSON body)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { approve, entryId, analysisData } = body;

      if (!approve || !entryId || !analysisData) {
        return NextResponse.json(
          { error: 'approve, entryId, and analysisData are required' },
          { status: 400 }
        );
      }

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

      const voiceAnalysis = await prisma.voiceAnalysis.create({
        data: {
          entryId,
          transcript: analysisData.transcript,
          summary: analysisData.summary,
          suggestedTags: analysisData.suggestedTags || [],
          firsts: analysisData.firsts || [],
          milestones: analysisData.milestones || [],
          authorId: session.user.id,
          approved: true,
        },
      });

      return NextResponse.json(voiceAnalysis, { status: 201 });
    }

    // Handle audio upload flow (FormData)
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const babyId = formData.get('babyId') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    if (!babyId) {
      return NextResponse.json({ error: 'babyId is required' }, { status: 400 });
    }

    const hasAccess = await verifyFamilyAccess(session.user.id, babyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let audioBuffer: Buffer | null = null;
    if (audioFile) {
      const bytes = await audioFile.arrayBuffer();
      audioBuffer = Buffer.from(bytes);
    }
    const analysisResults = await processVoiceMemo(audioBuffer);

    return NextResponse.json({
      transcript: analysisResults.transcript,
      summary: analysisResults.summary,
      suggestedTags: analysisResults.suggestedTags,
      firsts: analysisResults.firsts,
      milestones: analysisResults.milestones,
    });
  } catch (error) {
    console.error('POST /api/voice error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
