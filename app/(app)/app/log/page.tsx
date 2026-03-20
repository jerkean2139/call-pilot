'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Utensils, Moon, Droplets, ChevronLeft, Clock, WifiOff, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBaby } from '@/hooks/use-baby-context';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { cn, timeAgo, generateId } from '@/lib/utils';
import type { QuickLogData } from '@/types';

interface RecentLog {
  id: string;
  type: 'diaper' | 'feeding' | 'sleep';
  subType?: string;
  amount?: string;
  notes?: string;
  createdAt: string;
  synced: boolean;
}

const ACTION_CARDS = [
  {
    type: 'diaper' as const,
    label: 'Diaper',
    icon: Baby,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-200 border-amber-400',
  },
  {
    type: 'feeding' as const,
    label: 'Feeding',
    icon: Utensils,
    color: 'bg-green-100 text-green-700 border-green-200',
    activeColor: 'bg-green-200 border-green-400',
  },
  {
    type: 'sleep' as const,
    label: 'Sleep',
    icon: Moon,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    activeColor: 'bg-indigo-200 border-indigo-400',
  },
] as const;

const DIAPER_OPTIONS = ['Wet', 'Dirty', 'Mixed'];
const FEEDING_OPTIONS = ['Breast', 'Bottle', 'Solids'];

export default function QuickLogPage() {
  const { activeBaby } = useBaby();
  const { addQuickLog, isOnline, pendingCount } = useOfflineSync();
  const [expanded, setExpanded] = useState<'diaper' | 'feeding' | 'sleep' | null>(null);
  const [subType, setSubType] = useState('');
  const [amount, setAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBaby) return;
    fetchRecentLogs();
  }, [activeBaby]);

  const fetchRecentLogs = async () => {
    if (!activeBaby) return;
    try {
      const res = await fetch(`/api/entries/quick?babyId=${activeBaby.id}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setRecentLogs(data.entries || []);
      }
    } catch {
      // Offline — show local logs
    }
  };

  const handleCardTap = useCallback((type: 'diaper' | 'feeding' | 'sleep') => {
    setExpanded((prev) => (prev === type ? null : type));
    setSubType('');
    setAmount('');
    setStartTime('');
    setEndTime('');
    setNotes('');
  }, []);

  const handleSave = useCallback(() => {
    if (!activeBaby) return;

    const logData: QuickLogData = {
      type: expanded!,
      subType: subType || undefined,
      amount: amount || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes || undefined,
    };

    if (expanded === 'sleep' && startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      logData.duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    const entry = addQuickLog(activeBaby.id, logData as unknown as Record<string, unknown>);

    // Optimistic: add to recent logs
    const newLog: RecentLog = {
      id: entry.id,
      type: expanded!,
      subType,
      amount,
      notes,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    setRecentLogs((prev) => [newLog, ...prev].slice(0, 5));
    setSavedId(entry.id);

    // Reset form
    setExpanded(null);
    setSubType('');
    setAmount('');
    setStartTime('');
    setEndTime('');
    setNotes('');

    setTimeout(() => setSavedId(null), 2000);
  }, [activeBaby, expanded, subType, amount, startTime, endTime, notes, addQuickLog]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'diaper': return Baby;
      case 'feeding': return Utensils;
      case 'sleep': return Moon;
      default: return Clock;
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Baby className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to start logging.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quick Log</h1>
        {!isOnline && (
          <Badge variant="secondary" className="gap-1">
            <WifiOff className="w-3 h-3" />
            Offline {pendingCount > 0 && `(${pendingCount})`}
          </Badge>
        )}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {ACTION_CARDS.map((card) => {
          const Icon = card.icon;
          const isExpanded = expanded === card.type;
          return (
            <motion.div
              key={card.type}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Card
                className={cn(
                  'cursor-pointer border-2 transition-colors',
                  card.color,
                  isExpanded && card.activeColor,
                )}
                onClick={() => handleCardTap(card.type)}
              >
                <CardContent className="flex flex-col items-center justify-center py-6 px-2">
                  <Icon className="w-10 h-10 mb-2" />
                  <span className="text-sm font-semibold">{card.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Sub-Options */}
      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            key={expanded}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="mb-6">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg capitalize">{expanded} Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(null)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                </div>

                {/* Diaper Sub-Options */}
                {expanded === 'diaper' && (
                  <div className="flex gap-2">
                    {DIAPER_OPTIONS.map((opt) => (
                      <motion.div key={opt} whileTap={{ scale: 0.93 }}>
                        <Button
                          variant={subType === opt ? 'default' : 'outline'}
                          className="flex-1 min-w-[80px]"
                          onClick={() => setSubType(opt)}
                        >
                          <Droplets className="w-4 h-4 mr-1" />
                          {opt}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Feeding Sub-Options */}
                {expanded === 'feeding' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {FEEDING_OPTIONS.map((opt) => (
                        <motion.div key={opt} whileTap={{ scale: 0.93 }}>
                          <Button
                            variant={subType === opt ? 'default' : 'outline'}
                            className="flex-1 min-w-[80px]"
                            onClick={() => setSubType(opt)}
                          >
                            {opt}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <Input
                      placeholder="Amount (e.g., 4oz, 15min)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                )}

                {/* Sleep Sub-Options */}
                {expanded === 'sleep' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Start Time</label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">End Time</label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    {startTime && endTime && (
                      <p className="text-sm text-muted-foreground">
                        Duration: {(() => {
                          const s = new Date(`1970-01-01T${startTime}`);
                          const e = new Date(`1970-01-01T${endTime}`);
                          const mins = Math.round((e.getTime() - s.getTime()) / 60000);
                          if (mins < 0) return 'Invalid';
                          const h = Math.floor(mins / 60);
                          const m = mins % 60;
                          return h > 0 ? `${h}h ${m}m` : `${m}m`;
                        })()}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <Textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />

                {/* Save Button */}
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button className="w-full" size="lg" onClick={handleSave}>
                    <Check className="w-4 h-4 mr-2" />
                    Save {expanded} Log
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Confirmation */}
      <AnimatePresence>
        {savedId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Badge className="bg-green-500 text-white gap-1 px-3 py-1">
              <Check className="w-3 h-3" /> Saved!
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Logs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Logs</h2>
        {recentLogs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No logs yet. Tap an action above to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const Icon = getLogIcon(log.type);
              return (
                <motion.div
                  key={log.id}
                  initial={log.id === savedId ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card>
                    <CardContent className="flex items-center gap-3 py-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        log.type === 'diaper' && 'bg-amber-100 text-amber-700',
                        log.type === 'feeding' && 'bg-green-100 text-green-700',
                        log.type === 'sleep' && 'bg-indigo-100 text-indigo-700',
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{log.type}</span>
                          {log.subType && (
                            <Badge variant="secondary" className="text-xs">{log.subType}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {log.notes || (log.amount ? `Amount: ${log.amount}` : timeAgo(log.createdAt))}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {timeAgo(log.createdAt)}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
