import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Star, TrendingUp, Clock } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import EmptyState from '../components/EmptyState';
import { formatShortDate, getCategoryEmoji } from '../lib/utils';
import type { TimelineEvent } from '../types';

export default function Timeline() {
  const navigate = useNavigate();
  const { baby, entries, milestones, growthRecords } = useBabyContext();

  const events = useMemo<TimelineEvent[]>(() => {
    if (!baby) return [];
    const all: TimelineEvent[] = [];

    entries.forEach((e) => {
      all.push({
        id: e.id,
        type: 'journal',
        date: e.date,
        title: e.title,
        preview: e.content.slice(0, 100),
        photoUrl: e.photos[0],
        category: e.category,
      });
    });

    milestones
      .filter((m) => m.achievedDate)
      .forEach((m) => {
        all.push({
          id: m.id,
          type: 'milestone',
          date: m.achievedDate!,
          title: m.title,
          preview: m.description,
          category: m.category,
        });
      });

    growthRecords.forEach((g) => {
      const parts: string[] = [];
      if (g.weightLbs !== undefined) parts.push(`${g.weightLbs}lb ${g.weightOz ? g.weightOz + 'oz' : ''}`);
      if (g.heightInches !== undefined) parts.push(`${g.heightInches}in`);
      all.push({
        id: g.id,
        type: 'growth',
        date: g.date,
        title: 'Growth recorded',
        preview: parts.join(', '),
      });
    });

    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [baby, entries, milestones, growthRecords]);

  const typeConfig = {
    journal: { icon: BookOpen, color: 'bg-rose-500', ring: 'ring-rose-200' },
    milestone: { icon: Star, color: 'bg-amber-500', ring: 'ring-amber-200' },
    growth: { icon: TrendingUp, color: 'bg-violet-500', ring: 'ring-violet-200' },
    photo: { icon: BookOpen, color: 'bg-blue-500', ring: 'ring-blue-200' },
  };

  if (events.length === 0) {
    return (
      <div className="pt-2">
        <h1 className="mb-4 font-heading text-2xl font-bold text-gray-800">Timeline</h1>
        <EmptyState
          icon={Clock}
          title="No events yet"
          description="Your baby's story will appear here as you add journal entries, milestones, and growth records"
        />
      </div>
    );
  }

  // Group by month
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const d = new Date(event.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Timeline</h1>
        <p className="text-sm text-gray-400">{events.length} moments captured</p>
      </div>

      {Object.entries(grouped).map(([monthKey, monthEvents]) => {
        const d = new Date(monthKey + '-01');
        const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div key={monthKey}>
            <h2 className="mb-3 font-heading text-sm font-semibold text-gray-500">
              {monthLabel}
            </h2>
            <div className="relative ml-3 border-l-2 border-gray-100 pl-6">
              {monthEvents.map((event, i) => {
                const config = typeConfig[event.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      if (event.type === 'journal') navigate(`/journal/${event.id}`);
                    }}
                    className={`relative mb-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 ${
                      event.type === 'journal' ? 'cursor-pointer hover:shadow-md' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[2.15rem] top-3 flex h-5 w-5 items-center justify-center rounded-full ${config.color}`}
                    >
                      <Icon size={10} className="text-white" />
                    </div>

                    <div className="flex gap-3">
                      {event.photoUrl && (
                        <img
                          src={event.photoUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {event.category && (
                            <span className="text-xs">
                              {getCategoryEmoji(event.category)}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatShortDate(event.date)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700">
                          {event.title}
                        </h3>
                        {event.preview && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                            {event.preview}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
