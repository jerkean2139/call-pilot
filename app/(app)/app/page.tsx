'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  BookOpen,
  Mic,
  Star,
  ClipboardList,
  Image as ImageIcon,
  Heart,
} from 'lucide-react';
import { cn, timeAgo, babyAge, getPhaseLabel, EMOTIONS } from '@/lib/utils';
import { useBaby } from '@/hooks/use-baby-context';
import { useTimelinePolling } from '@/hooks/use-timeline-polling';
import { BABY_THEMES } from '@/types';
import type { EntryWithRelations } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ENTRY_TYPE_CONFIG: Record<
  string,
  { icon: typeof BookOpen; label: string; color: string }
> = {
  JOURNAL: { icon: BookOpen, label: 'Journal', color: 'text-indigo-500' },
  VOICE: { icon: Mic, label: 'Voice Memo', color: 'text-amber-500' },
  MILESTONE: { icon: Star, label: 'Milestone', color: 'text-yellow-500' },
  LOG: { icon: ClipboardList, label: 'Log', color: 'text-emerald-500' },
};

function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const config = ENTRY_TYPE_CONFIG[entry.type] ?? ENTRY_TYPE_CONFIG.LOG;
  const Icon = config.icon;
  const emotionMap = new Map(EMOTIONS.map((e) => [e.value as string, e]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Type Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-montserrat text-sm font-semibold">
                  {entry.title ?? config.label}
                </h3>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(entry.occurredAt)}
                </span>
              </div>

              {entry.content && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {entry.content}
                </p>
              )}

              {/* Emotion Badges */}
              {entry.emotions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.emotions.map((emotion) => {
                    const emotionData = emotionMap.get(emotion);
                    return (
                      <Badge
                        key={emotion}
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        {emotionData?.emoji ?? ''} {emotionData?.label ?? emotion}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Media Thumbnails */}
              {entry.media.length > 0 && (
                <div className="mt-2 flex gap-1.5 overflow-x-auto">
                  {entry.media.slice(0, 4).map((media) => (
                    <div
                      key={media.id}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
                    >
                      {media.type.startsWith('image') ? (
                        <img
                          src={media.thumbnailUrl ?? media.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {entry.media.length > 4 && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                      +{entry.media.length - 4}
                    </div>
                  )}
                </div>
              )}

              {/* Author */}
              <div className="mt-2 flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  {entry.author.image ? (
                    <AvatarImage src={entry.author.image} alt={entry.author.name ?? ''} />
                  ) : null}
                  <AvatarFallback className="text-[8px]">
                    {entry.author.name?.charAt(0) ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[11px] text-muted-foreground">
                  {entry.author.name ?? 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ babyName }: { babyName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-10 w-10 text-primary" />
      </div>
      <h2 className="font-montserrat text-xl font-bold">
        Welcome to {babyName}&apos;s Story
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Every moment is worth remembering. Tap the{' '}
        <span className="font-semibold text-primary">+</span> button below to
        capture your first memory.
      </p>
    </motion.div>
  );
}

export default function HomePage() {
  const { activeBaby } = useBaby();
  const { entries, isLoading, refetch } = useTimelinePolling(
    activeBaby?.id ?? null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const theme = activeBaby?.theme
    ? BABY_THEMES[activeBaby.theme]
    : BABY_THEMES.STRAWBERRY;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (!activeBaby) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <p className="text-muted-foreground">No baby selected</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Age Phase Header */}
      <div
        className={cn(
          'bg-gradient-to-b px-4 pb-4 pt-3',
          theme.gradient
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {getPhaseLabel(activeBaby.birthDate)}
            </p>
            <h1 className="font-montserrat text-lg font-bold">
              {activeBaby.name} &middot;{' '}
              <span className="text-muted-foreground">
                {babyAge(activeBaby.birthDate)}
              </span>
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 transition-transform',
                isRefreshing && 'animate-spin'
              )}
            />
          </Button>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState babyName={activeBaby.name} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
