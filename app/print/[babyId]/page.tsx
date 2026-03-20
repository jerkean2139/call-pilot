import { prisma } from '@/lib/db/prisma';
import { babyAge, getPhaseLabel } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export default async function PrintPage({ params }: { params: { babyId: string } }) {
  const baby = await prisma.baby.findUnique({
    where: { id: params.babyId },
    include: {
      family: true,
      entries: {
        orderBy: { occurredAt: 'asc' },
        include: {
          media: true,
          author: { select: { name: true } },
        },
        take: 100,
      },
      milestones: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: 'asc' },
      },
    },
  });

  if (!baby) notFound();

  const journals = baby.entries.filter((e) => e.type === 'JOURNAL' || e.type === 'MILESTONE');
  const completedMilestones = baby.milestones;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white print:p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
        `,
      }} />

      {/* Cover */}
      <div className="text-center py-16 border-b-2 border-gray-100 mb-12">
        <div className="text-6xl mb-4">
          {baby.theme === 'STRAWBERRY' ? '🍓' : '📖'}
        </div>
        <h1 className="font-heading text-4xl font-bold mb-2">{baby.name}&apos;s Story</h1>
        <p className="text-lg text-muted-foreground">{baby.family.name}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Born {format(baby.birthDate, 'MMMM d, yyyy')} · Currently {babyAge(baby.birthDate)} old
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          {getPhaseLabel(baby.birthDate)} · Printed {format(new Date(), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Milestones Summary */}
      {completedMilestones.length > 0 && (
        <div className="mb-12">
          <h2 className="font-heading text-2xl font-semibold mb-6 text-center">Milestones Reached</h2>
          <div className="grid grid-cols-2 gap-4">
            {completedMilestones.map((m) => (
              <div key={m.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-500">✓</span>
                  <span className="font-medium text-sm">{m.title}</span>
                </div>
                {m.completedAt && (
                  <p className="text-xs text-muted-foreground ml-6">
                    {format(m.completedAt, 'MMM d, yyyy')}
                  </p>
                )}
                {m.notes && (
                  <p className="text-xs text-muted-foreground ml-6 mt-1">{m.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Entries */}
      {journals.length > 0 && (
        <div className="page-break">
          <h2 className="font-heading text-2xl font-semibold mb-6 text-center">Journal Entries</h2>
          <div className="space-y-8">
            {journals.map((entry) => (
              <div key={entry.id} className="border-l-2 border-gray-200 pl-6 pb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <time className="text-xs text-muted-foreground font-mono">
                    {format(entry.occurredAt, 'MMM d, yyyy')}
                  </time>
                  {entry.emotions.length > 0 && (
                    <div className="flex gap-1">
                      {entry.emotions.map((e) => (
                        <span key={e} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{e}</span>
                      ))}
                    </div>
                  )}
                </div>
                {entry.title && (
                  <h3 className="font-heading font-semibold text-lg mb-1">{entry.title}</h3>
                )}
                {entry.content && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                )}
                {entry.media.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {entry.media.filter((m) => m.type.startsWith('image')).map((m) => (
                      <img
                        key={m.id}
                        src={m.thumbnailUrl || m.url}
                        alt=""
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                    {entry.media.filter((m) => m.type.startsWith('video')).map((m) => (
                      <div key={m.id} className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-xs text-muted-foreground">
                        📹 Video
                        {/* QR would go here for video entries */}
                      </div>
                    ))}
                  </div>
                )}
                {entry.author.name && (
                  <p className="text-xs text-muted-foreground mt-2">— {entry.author.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Summary */}
      <div className="page-break">
        <h2 className="font-heading text-2xl font-semibold mb-6 text-center">Activity Summary</h2>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">
              {baby.entries.filter((e) => e.type === 'LOG' && (e.metadata as Record<string, unknown>)?.logType === 'diaper').length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Diaper Changes</div>
          </div>
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">
              {baby.entries.filter((e) => e.type === 'LOG' && (e.metadata as Record<string, unknown>)?.logType === 'feeding').length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Feedings</div>
          </div>
          <div className="border rounded-lg p-6">
            <div className="text-3xl font-bold">
              {baby.entries.filter((e) => e.type === 'LOG' && (e.metadata as Record<string, unknown>)?.logType === 'sleep').length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Sleep Sessions</div>
          </div>
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Total entries: {baby.entries.length} · Total milestones: {completedMilestones.length}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-16 pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Made with love using Living Legacy
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {baby.name}&apos;s life, beautifully preserved.
        </p>
      </div>

      {/* Print button */}
      <div className="no-print fixed bottom-6 right-6">
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition font-medium"
        >
          Print This Book
        </button>
      </div>
    </div>
  );
}
