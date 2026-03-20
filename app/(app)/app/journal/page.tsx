'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Mic, Trophy, Image, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, timeAgo, EMOTIONS } from '@/lib/utils';
import type { EntryWithRelations } from '@/types';

type FilterTab = 'all' | 'JOURNAL' | 'VOICE' | 'MILESTONE';

const FILTER_TABS: { value: FilterTab; label: string; icon: typeof BookOpen }[] = [
  { value: 'all', label: 'All', icon: BookOpen },
  { value: 'JOURNAL', label: 'Journal', icon: BookOpen },
  { value: 'VOICE', label: 'Voice', icon: Mic },
  { value: 'MILESTONE', label: 'Milestone', icon: Trophy },
];

export default function JournalPage() {
  const { activeBaby } = useBaby();
  const [entries, setEntries] = useState<EntryWithRelations[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBaby) return;
    fetchEntries();
  }, [activeBaby, filter]);

  const fetchEntries = async () => {
    if (!activeBaby) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ babyId: activeBaby.id });
      if (filter !== 'all') params.set('type', filter);
      const res = await fetch(`/api/entries?${params}`);
      if (!res.ok) throw new Error('Failed to load entries');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (value: string) => {
    const emotion = EMOTIONS.find((e) => e.value === value);
    return emotion ? emotion.emoji : '';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE': return Mic;
      case 'MILESTONE': return Trophy;
      default: return BookOpen;
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to start journaling.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Journal</h1>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchEntries}>Try Again</Button>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No entries yet</p>
            <p className="text-sm">Start capturing precious moments!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {entries.map((entry, i) => {
              const TypeIcon = getTypeIcon(entry.type);
              const emotions: string[] = (entry.emotions as string[]) || [];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/app/entry/${entry.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {entry.title || 'Untitled Entry'}
                              </h3>
                            </div>
                            {entry.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {entry.content}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {timeAgo(entry.occurredAt || entry.createdAt)}
                              </span>
                              {emotions.map((e) => (
                                <span key={e} className="text-xs" title={e}>
                                  {getEmotionEmoji(e)}
                                </span>
                              ))}
                              {entry.media && entry.media.length > 0 && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Image className="w-3 h-3" />
                                  {entry.media.length}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      <Link href="/app/journal/new">
        <motion.div
          className="fixed bottom-24 right-6 z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button size="lg" className="rounded-full w-14 h-14 shadow-lg">
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </Link>
    </div>
  );
}
