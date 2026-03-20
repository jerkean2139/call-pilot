'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Calendar,
  Loader2,
  Baby,
  Brain,
  MessageCircle,
  Hand,
  Utensils,
  Moon,
  Users,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, babyAgeInMonths } from '@/lib/utils';

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  category: string;
  ageBand: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

interface MilestoneCategory {
  key: string;
  label: string;
  icon: typeof Hand;
  color: string;
}

const CATEGORIES: MilestoneCategory[] = [
  { key: 'Motor', label: 'Motor', icon: Hand, color: 'text-blue-500 bg-blue-100' },
  { key: 'Language', label: 'Language', icon: MessageCircle, color: 'text-purple-500 bg-purple-100' },
  { key: 'Cognitive', label: 'Cognitive', icon: Brain, color: 'text-amber-500 bg-amber-100' },
  { key: 'Social', label: 'Social', icon: Users, color: 'text-green-500 bg-green-100' },
  { key: 'Feeding', label: 'Feeding', icon: Utensils, color: 'text-orange-500 bg-orange-100' },
  { key: 'Sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-500 bg-indigo-100' },
];

const AGE_BANDS = [
  { key: '0-3mo', label: '0-3 months', min: 0, max: 3 },
  { key: '3-6mo', label: '3-6 months', min: 3, max: 6 },
  { key: '6-9mo', label: '6-9 months', min: 6, max: 9 },
  { key: '9-12mo', label: '9-12 months', min: 9, max: 12 },
  { key: '12-18mo', label: '12-18 months', min: 12, max: 18 },
  { key: '18-24mo', label: '18-24 months', min: 18, max: 24 },
];

export default function MilestonesPage() {
  const { activeBaby } = useBaby();
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBand, setExpandedBand] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [completingMilestone, setCompletingMilestone] = useState<MilestoneItem | null>(null);
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const ageInMonths = activeBaby ? babyAgeInMonths(activeBaby.birthDate) : 0;

  useEffect(() => {
    if (!activeBaby) return;
    setLoading(true);
    fetch(`/api/milestones?babyId=${activeBaby.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load milestones');
        return res.json();
      })
      .then((data) => setMilestones(data.milestones || data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeBaby]);

  useEffect(() => {
    // Auto-expand current age band
    const currentBand = AGE_BANDS.find((b) => ageInMonths >= b.min && ageInMonths < b.max);
    if (currentBand) setExpandedBand(currentBand.key);
  }, [ageInMonths]);

  const getMilestonesByBandAndCategory = (bandKey: string, categoryKey: string) =>
    milestones.filter((m) => m.ageBand === bandKey && m.category === categoryKey);

  const getCategoryProgress = (bandKey: string, categoryKey: string) => {
    const items = getMilestonesByBandAndCategory(bandKey, categoryKey);
    if (items.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = items.filter((m) => m.completed).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const getBandProgress = (bandKey: string) => {
    const items = milestones.filter((m) => m.ageBand === bandKey);
    if (items.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = items.filter((m) => m.completed).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  };

  const handleToggleMilestone = (milestone: MilestoneItem) => {
    if (milestone.completed) {
      // Uncomplete
      handleUncomplete(milestone);
    } else {
      // Show completion dialog
      setCompletingMilestone(milestone);
      setCompletedDate(new Date().toISOString().split('T')[0]);
      setCompletionNotes('');
    }
  };

  const handleUncomplete = async (milestone: MilestoneItem) => {
    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: false }),
      });
      if (res.ok) {
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === milestone.id ? { ...m, completed: false, completedAt: undefined, notes: undefined } : m
          )
        );
      }
    } catch {
      // Silent fail
    }
  };

  const handleComplete = async () => {
    if (!completingMilestone) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/milestones/${completingMilestone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          completedAt: new Date(completedDate).toISOString(),
          notes: completionNotes || undefined,
        }),
      });
      if (res.ok) {
        setMilestones((prev) =>
          prev.map((m) =>
            m.id === completingMilestone.id
              ? { ...m, completed: true, completedAt: completedDate, notes: completionNotes || undefined }
              : m
          )
        );
      }
    } catch {
      // Silent fail
    } finally {
      setSaving(false);
      setCompletingMilestone(null);
    }
  };

  const getCategoryIcon = (key: string) => {
    const cat = CATEGORIES.find((c) => c.key === key);
    return cat?.icon || Baby;
  };

  const getCategoryColor = (key: string) => {
    const cat = CATEGORIES.find((c) => c.key === key);
    return cat?.color || 'text-gray-500 bg-gray-100';
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Baby className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to track milestones.</p>
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Milestones</h1>
        <p className="text-muted-foreground text-sm">
          Track {activeBaby.name}&apos;s amazing development journey
        </p>
      </div>

      {/* Age Band Sections */}
      <div className="space-y-3">
        {AGE_BANDS.map((band) => {
          const progress = getBandProgress(band.key);
          const isExpanded = expandedBand === band.key;
          const isCurrent = ageInMonths >= band.min && ageInMonths < band.max;

          return (
            <Card
              key={band.key}
              className={cn(isCurrent && 'ring-2 ring-primary ring-offset-2')}
            >
              <button
                className="w-full text-left"
                onClick={() => setExpandedBand(isExpanded ? null : band.key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{band.label}</CardTitle>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {progress.completed}/{progress.total}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  {progress.total > 0 && (
                    <Progress value={progress.percent} className="h-2 mt-2" />
                  )}
                </CardHeader>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 space-y-4">
                      {CATEGORIES.map((category) => {
                        const catProgress = getCategoryProgress(band.key, category.key);
                        if (catProgress.total === 0) return null;
                        const catMilestones = getMilestonesByBandAndCategory(band.key, category.key);
                        const CatIcon = category.icon;
                        const isCatExpanded = expandedCategory === `${band.key}-${category.key}`;

                        return (
                          <div key={category.key}>
                            <button
                              className="w-full flex items-center justify-between py-2"
                              onClick={() =>
                                setExpandedCategory(
                                  isCatExpanded ? null : `${band.key}-${category.key}`
                                )
                              }
                            >
                              <div className="flex items-center gap-2">
                                <div className={cn('p-1.5 rounded-lg', category.color)}>
                                  <CatIcon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{category.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {catProgress.completed}/{catProgress.total}
                                </span>
                              </div>
                              <Progress value={catProgress.percent} className="w-20 h-1.5" />
                            </button>

                            <AnimatePresence>
                              {isCatExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-2 pl-10 pb-2">
                                    {catMilestones.map((milestone) => (
                                      <motion.div
                                        key={milestone.id}
                                        whileTap={{ scale: 0.98 }}
                                      >
                                        <button
                                          className={cn(
                                            'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors',
                                            milestone.completed
                                              ? 'bg-green-50 border-green-200'
                                              : 'bg-background border-border hover:border-primary/30'
                                          )}
                                          onClick={() => handleToggleMilestone(milestone)}
                                        >
                                          <div
                                            className={cn(
                                              'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                                              milestone.completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-muted-foreground/30'
                                            )}
                                          >
                                            {milestone.completed && (
                                              <Check className="w-3.5 h-3.5 text-white" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p
                                              className={cn(
                                                'text-sm font-medium',
                                                milestone.completed && 'line-through text-muted-foreground'
                                              )}
                                            >
                                              {milestone.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {milestone.description}
                                            </p>
                                            {milestone.completed && milestone.completedAt && (
                                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <PartyPopper className="w-3 h-3" />
                                                Achieved on{' '}
                                                {new Date(milestone.completedAt).toLocaleDateString()}
                                              </p>
                                            )}
                                          </div>
                                        </button>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Completion Dialog */}
      <Dialog open={!!completingMilestone} onOpenChange={() => setCompletingMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-primary" />
              Amazing milestone!
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {completingMilestone?.title}
          </p>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>When did this happen?</Label>
              <Input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any details you want to remember..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCompletingMilestone(null)}>
                Cancel
              </Button>
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Mark Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
