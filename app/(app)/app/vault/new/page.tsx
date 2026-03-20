'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Lock,
  Calendar,
  Loader2,
  ShieldAlert,
  Eye,
  Send,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useBaby } from '@/hooks/use-baby-context';

export default function NewVaultPage() {
  const router = useRouter();
  const { activeBaby } = useBaby();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSealWarning, setShowSealWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const isValid = title.trim() && content.trim() && unlockDate && unlockDate >= minDateStr;

  const handleSeal = async () => {
    if (!activeBaby || !isValid) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/timecapsule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: activeBaby.id,
          title: title.trim(),
          content: content.trim(),
          unlockAt: new Date(unlockDate).toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to seal capsule');
      router.push('/app/vault');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
      setShowSealWarning(false);
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Lock className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings first.</p>
      </div>
    );
  }

  const unlockDateFormatted = unlockDate
    ? new Date(unlockDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/vault">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Time Capsule</h1>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., A Letter to You on Your 18th Birthday"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Your Letter</Label>
        <Textarea
          id="content"
          placeholder="Dear little one, I'm writing this to you on a quiet evening while you sleep beside me..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="font-serif"
        />
      </div>

      {/* Unlock Date */}
      <div className="space-y-2">
        <Label htmlFor="unlock-date">Unlock Date</Label>
        <p className="text-xs text-muted-foreground">
          Choose when this capsule can be opened. It can be years from now!
        </p>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="unlock-date"
            type="date"
            min={minDateStr}
            max="2060-12-31"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="pl-10"
          />
        </div>
        {unlockDate && (
          <p className="text-sm text-muted-foreground">
            Will unlock on <span className="font-medium text-foreground">{unlockDateFormatted}</span>
          </p>
        )}
      </div>

      {/* Warning Banner */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Seal Forever</p>
            <p className="text-xs text-amber-700">
              Once sealed, this time capsule cannot be edited or opened until the
              unlock date. Make sure your letter is complete.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 text-sm text-destructive text-center">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={!title.trim() || !content.trim()}
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
        <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
          <Button
            className="w-full gap-2"
            disabled={!isValid || saving}
            onClick={() => setShowSealWarning(true)}
          >
            <Lock className="w-4 h-4" />
            Seal Capsule
          </Button>
        </motion.div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title || 'Untitled'}</DialogTitle>
            <DialogDescription>
              {unlockDate
                ? `Will unlock on ${unlockDateFormatted}`
                : 'No unlock date set'}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed font-serif">
              {content || 'No content yet.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seal Warning Dialog */}
      <Dialog open={showSealWarning} onOpenChange={setShowSealWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Seal This Capsule?
            </DialogTitle>
            <DialogDescription>
              This capsule will be sealed and cannot be edited or opened until{' '}
              <span className="font-medium text-foreground">{unlockDateFormatted}</span>.
              This action is permanent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSealWarning(false)}
            >
              Go Back
            </Button>
            <Button onClick={handleSeal} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Seal Forever
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
