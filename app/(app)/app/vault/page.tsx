'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Plus,
  Calendar,
  Loader2,
  Archive,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, timeAgo } from '@/lib/utils';
import type { TimeCapsuleWithAuthor } from '@/types';

export default function VaultPage() {
  const { activeBaby } = useBaby();
  const [capsules, setCapsules] = useState<TimeCapsuleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openedCapsule, setOpenedCapsule] = useState<TimeCapsuleWithAuthor | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!activeBaby) return;
    setLoading(true);
    fetch(`/api/timecapsule?babyId=${activeBaby.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load vault');
        return res.json();
      })
      .then((data) => setCapsules(data.capsules || data || []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [activeBaby]);

  const isUnlocked = (unlockDate: string) => new Date(unlockDate) <= new Date();

  const handleOpen = async (capsule: TimeCapsuleWithAuthor) => {
    if (!isUnlocked(String(capsule.unlockDate))) return;
    setOpening(true);
    setOpenedCapsule(capsule);
    try {
      const res = await fetch(`/api/timecapsule/${capsule.id}`);
      if (!res.ok) throw new Error('Failed to open capsule');
      const data = await res.json();
      setDecryptedContent(data.content || data.capsule?.content || '');
    } catch {
      setDecryptedContent('Could not decrypt this capsule.');
    } finally {
      setOpening(false);
    }
  };

  const lockedCapsules = capsules.filter((c) => !isUnlocked(String(c.unlockDate)));
  const unlockedCapsules = capsules.filter((c) => isUnlocked(String(c.unlockDate)));

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Archive className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to create time capsules.</p>
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

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
        >
          <Lock className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold">Time Capsule Vault</h1>
        <p className="text-muted-foreground text-sm">
          Seal letters to be opened in the future
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 text-sm text-destructive text-center">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Unlocked Capsules */}
      {unlockedCapsules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Unlock className="w-4 h-4" />
            Ready to Open ({unlockedCapsules.length})
          </h2>
          {unlockedCapsules.map((capsule, i) => (
            <motion.div
              key={capsule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{capsule.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Calendar className="w-3 h-3" />
                          Sealed {timeAgo(capsule.createdAt as unknown as string)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpen(capsule)}
                      className="gap-2 ml-3"
                    >
                      <Eye className="w-4 h-4" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked Capsules */}
      {lockedCapsules.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sealed ({lockedCapsules.length})
          </h2>
          {lockedCapsules.map((capsule, i) => (
            <motion.div
              key={capsule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="opacity-80">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{capsule.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Sealed
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Opens {new Date(String(capsule.unlockDate)).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {capsules.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Archive className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">Your vault is empty</p>
            <p className="text-sm">Write a letter to be opened in the future.</p>
          </CardContent>
        </Card>
      )}

      {/* FAB */}
      <Link href="/app/vault/new">
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

      {/* Opened Capsule Dialog */}
      <Dialog open={!!openedCapsule} onOpenChange={() => { setOpenedCapsule(null); setDecryptedContent(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-primary" />
              {openedCapsule?.title}
            </DialogTitle>
            <DialogDescription>
              Written by {openedCapsule?.author?.name || 'Unknown'} on{' '}
              {openedCapsule
                ? new Date(openedCapsule.createdAt as unknown as string).toLocaleDateString()
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {opening ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
                    {decryptedContent}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
