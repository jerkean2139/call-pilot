'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Loader2,
  BookOpen,
  Mic,
  Star,
  Heart,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, timeAgo, EMOTIONS } from '@/lib/utils';
import type { EntryWithRelations } from '@/types';

interface MemoryThread {
  id: string;
  title: string;
  description: string;
  entries: EntryWithRelations[];
  tags: string[];
  dateRange: { start: string; end: string };
  emotionSummary: string[];
}

export default function ThreadsPage() {
  const { activeBaby } = useBaby();
  const [allEntries, setAllEntries] = useState<EntryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<MemoryThread | null>(null);

  useEffect(() => {
    if (!activeBaby) return;
    setLoading(true);
    fetch(`/api/entries?babyId=${activeBaby.id}&limit=500`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load entries');
        return res.json();
      })
      .then((data) => setAllEntries(data.entries || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeBaby]);

  const threads = useMemo(() => {
    if (allEntries.length === 0) return [];

    const sorted = [...allEntries].sort(
      (a, b) =>
        new Date(a.occurredAt || a.createdAt).getTime() -
        new Date(b.occurredAt || b.createdAt).getTime()
    );

    const threadMap: Map<string, EntryWithRelations[]> = new Map();

    // Group by week
    sorted.forEach((entry) => {
      const date = new Date(entry.occurredAt || entry.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!threadMap.has(weekKey)) threadMap.set(weekKey, []);
      threadMap.get(weekKey)!.push(entry);
    });

    // Also group by common tags
    const tagGroups: Map<string, EntryWithRelations[]> = new Map();
    sorted.forEach((entry) => {
      const entryTags = (entry as unknown as { tags?: string[] }).tags || [];
      entryTags.forEach((tag) => {
        if (!tagGroups.has(tag)) tagGroups.set(tag, []);
        tagGroups.get(tag)!.push(entry);
      });
    });

    const result: MemoryThread[] = [];

    // Week-based threads
    threadMap.forEach((entries, weekKey) => {
      if (entries.length < 2) return; // Skip single-entry weeks

      const birthDate = activeBaby ? new Date(activeBaby.birthDate) : new Date();
      const weekDate = new Date(weekKey);
      const daysSinceBirth = Math.floor(
        (weekDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let title = '';
      if (daysSinceBirth < 7) title = 'First Week Home';
      else if (daysSinceBirth < 14) title = 'Week Two';
      else if (daysSinceBirth < 30) title = `Week ${Math.ceil(daysSinceBirth / 7)}`;
      else {
        const month = Math.floor(daysSinceBirth / 30);
        const weekInMonth = Math.ceil((daysSinceBirth % 30) / 7);
        title = `Month ${month}, Week ${weekInMonth}`;
      }

      const allEmotions = entries.flatMap((e) => (e.emotions as string[]) || []);
      const uniqueEmotions = [...new Set(allEmotions)];

      result.push({
        id: `week-${weekKey}`,
        title,
        description: `${entries.length} entries from the week of ${new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        entries,
        tags: [],
        dateRange: {
          start: String(entries[0].occurredAt || entries[0].createdAt),
          end: String(entries[entries.length - 1].occurredAt || entries[entries.length - 1].createdAt),
        },
        emotionSummary: uniqueEmotions.slice(0, 4),
      });
    });

    // Tag-based threads (only if 3+ entries share a tag)
    tagGroups.forEach((entries, tag) => {
      if (entries.length < 3) return;

      const allEmotions = entries.flatMap((e) => (e.emotions as string[]) || []);
      const uniqueEmotions = [...new Set(allEmotions)];

      const threadTitle =
        tag.charAt(0).toUpperCase() + tag.slice(1) + ' Journey';

      result.push({
        id: `tag-${tag}`,
        title: threadTitle,
        description: `${entries.length} entries tagged with "${tag}"`,
        entries,
        tags: [tag],
        dateRange: {
          start: String(entries[0].occurredAt || entries[0].createdAt),
          end: String(entries[entries.length - 1].occurredAt || entries[entries.length - 1].createdAt),
        },
        emotionSummary: uniqueEmotions.slice(0, 4),
      });
    });

    // Sort threads by most recent
    result.sort(
      (a, b) =>
        new Date(b.dateRange.end).getTime() - new Date(a.dateRange.end).getTime()
    );

    return result;
  }, [allEntries, activeBaby]);

  const getEmotionEmoji = (value: string) => {
    const emotion = EMOTIONS.find((e) => e.value === value);
    return emotion?.emoji || '';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE': return Mic;
      case 'MILESTONE': return Star;
      default: return BookOpen;
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Layers className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to view memory threads.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Thread detail view
  if (selectedThread) {
    return (
      <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedThread(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{selectedThread.title}</h1>
            <p className="text-sm text-muted-foreground">
              {selectedThread.entries.length} entries
            </p>
          </div>
        </div>

        {selectedThread.emotionSummary.length > 0 && (
          <div className="flex gap-1">
            {selectedThread.emotionSummary.map((e) => (
              <span key={e} className="text-lg">{getEmotionEmoji(e)}</span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {selectedThread.entries.map((entry, i) => {
            const TypeIcon = getTypeIcon(entry.type);
            const emotions: string[] = (entry.emotions as string[]) || [];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/app/entry/${entry.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {entry.title || 'Untitled'}
                          </h3>
                          {entry.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {entry.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {timeAgo(entry.occurredAt || entry.createdAt)}
                            </span>
                            {emotions.map((e) => (
                              <span key={e} className="text-xs">{getEmotionEmoji(e)}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Memory Threads</h1>
        <p className="text-muted-foreground text-sm">
          Auto-grouped storylines from {activeBaby.name}&apos;s journey
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No threads yet</p>
            <p className="text-sm">
              As you add more entries, memory threads will appear automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread, i) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedThread(thread)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-sm truncate">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {thread.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {thread.entries.length} entries
                        </Badge>
                        {thread.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </Badge>
                        ))}
                        {thread.emotionSummary.map((e) => (
                          <span key={e} className="text-sm">
                            {getEmotionEmoji(e)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
