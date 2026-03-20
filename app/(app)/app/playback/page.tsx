'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Mic,
  Star,
  Heart,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, timeAgo, babyAge, EMOTIONS } from '@/lib/utils';
import type { EntryWithRelations } from '@/types';

interface AgePhase {
  key: string;
  label: string;
  startDays: number;
  endDays: number;
}

const AGE_PHASES: AgePhase[] = [
  { key: 'day1', label: 'Day 1', startDays: 0, endDays: 1 },
  { key: 'week1', label: 'Week 1', startDays: 0, endDays: 7 },
  { key: 'week2', label: 'Week 2', startDays: 7, endDays: 14 },
  { key: 'week3', label: 'Week 3', startDays: 14, endDays: 21 },
  { key: 'month1', label: 'Month 1', startDays: 0, endDays: 30 },
  { key: 'month2', label: 'Month 2', startDays: 30, endDays: 60 },
  { key: 'month3', label: 'Month 3', startDays: 60, endDays: 90 },
  { key: 'month6', label: 'Month 6', startDays: 150, endDays: 180 },
  { key: 'month9', label: 'Month 9', startDays: 240, endDays: 270 },
  { key: 'month12', label: 'Month 12', startDays: 330, endDays: 365 },
  { key: 'month18', label: 'Month 18', startDays: 510, endDays: 545 },
  { key: 'month24', label: 'Month 24', startDays: 700, endDays: 730 },
];

export default function PlaybackPage() {
  const { activeBaby } = useBaby();
  const [allEntries, setAllEntries] = useState<EntryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

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

  const birthDate = activeBaby ? new Date(activeBaby.birthDate) : new Date();

  const entriesForPhase = useMemo(() => {
    const phase = AGE_PHASES[selectedPhaseIdx];
    if (!phase || !activeBaby) return [];

    const phaseStart = new Date(birthDate);
    phaseStart.setDate(phaseStart.getDate() + phase.startDays);
    const phaseEnd = new Date(birthDate);
    phaseEnd.setDate(phaseEnd.getDate() + phase.endDays);

    return allEntries.filter((entry) => {
      const entryDate = new Date(entry.occurredAt || entry.createdAt);
      return entryDate >= phaseStart && entryDate <= phaseEnd;
    });
  }, [allEntries, selectedPhaseIdx, activeBaby, birthDate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE': return Mic;
      case 'MILESTONE': return Star;
      default: return BookOpen;
    }
  };

  const getEmotionEmoji = (value: string) => {
    const emotion = EMOTIONS.find((e) => e.value === value);
    return emotion?.emoji || '';
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Play className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to use playback mode.</p>
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

  const currentPhase = AGE_PHASES[selectedPhaseIdx];

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Playback</h1>
        <p className="text-muted-foreground text-sm">
          Relive {activeBaby.name}&apos;s journey, one phase at a time
        </p>
      </div>

      {/* Timeline Slider */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              disabled={selectedPhaseIdx === 0}
              onClick={() => setSelectedPhaseIdx((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold">{currentPhase.label}</p>
              <p className="text-xs text-muted-foreground">
                {entriesForPhase.length} entries
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={selectedPhaseIdx === AGE_PHASES.length - 1}
              onClick={() => setSelectedPhaseIdx((i) => Math.min(AGE_PHASES.length - 1, i + 1))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Phase Dots */}
          <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
            {AGE_PHASES.map((phase, idx) => {
              const hasEntries = allEntries.some((entry) => {
                const entryDate = new Date(entry.occurredAt || entry.createdAt);
                const phaseStart = new Date(birthDate);
                phaseStart.setDate(phaseStart.getDate() + phase.startDays);
                const phaseEnd = new Date(birthDate);
                phaseEnd.setDate(phaseEnd.getDate() + phase.endDays);
                return entryDate >= phaseStart && entryDate <= phaseEnd;
              });

              return (
                <button
                  key={phase.key}
                  onClick={() => setSelectedPhaseIdx(idx)}
                  className="flex flex-col items-center gap-1 px-1"
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full transition-all',
                      idx === selectedPhaseIdx
                        ? 'bg-primary scale-125'
                        : hasEntries
                        ? 'bg-primary/40'
                        : 'bg-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[9px] whitespace-nowrap',
                      idx === selectedPhaseIdx
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {phase.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Visual Timeline with Entries */}
      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : entriesForPhase.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Heart className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No memories in this phase</p>
            <p className="text-sm">
              Entries from {currentPhase.label} will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {entriesForPhase.map((entry, i) => {
              const TypeIcon = getTypeIcon(entry.type);
              const emotions: string[] = (entry.emotions as string[]) || [];
              const isExpanded = expandedEntryId === entry.id;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />

                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm truncate">
                            {entry.title || 'Untitled'}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.occurredAt || entry.createdAt).toLocaleDateString()}
                        </p>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-2">
                                {entry.content && (
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {entry.content}
                                  </p>
                                )}
                                {emotions.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {emotions.map((e) => (
                                      <span key={e} className="text-sm" title={e}>
                                        {getEmotionEmoji(e)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {entry.media && entry.media.length > 0 && (
                                  <div className="flex gap-1.5 overflow-x-auto">
                                    {entry.media.slice(0, 3).map((media) => (
                                      <div
                                        key={media.id}
                                        className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0"
                                      >
                                        {media.type.startsWith('image') ? (
                                          <img
                                            src={media.thumbnailUrl || media.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Link href={`/app/entry/${entry.id}`}>
                                  <Button variant="outline" size="sm" className="mt-2">
                                    View Full Entry
                                  </Button>
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
