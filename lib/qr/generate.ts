import QRCode from 'qrcode';
import { prisma } from '@/lib/db/prisma';
import { randomBytes } from 'crypto';

export async function generateShareToken(entryId: string, expiresInDays?: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await prisma.shareToken.create({
    data: {
      token,
      entryId,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    },
  });
  return token;
}

export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });
}

export async function validateShareToken(token: string) {
  const shareToken = await prisma.shareToken.findUnique({
    where: { token },
    include: {
      entry: {
        include: {
          media: true,
          baby: { select: { name: true } },
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!shareToken) return null;
  if (shareToken.expiresAt && new Date() > shareToken.expiresAt) return null;
  return shareToken;
}
