'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  QrCode,
  Tag,
  Mic,
  Star,
  BookOpen,
  Loader2,
  Share2,
  Brain,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn, timeAgo, EMOTIONS } from '@/lib/utils';
import type { EntryWithRelations } from '@/types';

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<EntryWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/entries/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Entry not found');
        return res.json();
      })
      .then((data) => setEntry(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load entry')
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!entry) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/app/journal');
    } catch {
      setError('Failed to delete entry');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleQrShare = async () => {
    if (!entry) return;
    try {
      const res = await fetch(`/api/qr/${entry.id}`);
      if (!res.ok) throw new Error('Failed to generate QR');
      const data = await res.json();
      setQrUrl(data.qrUrl || data.url);
      setShowQr(true);
    } catch {
      setError('Could not generate QR code');
    }
  };

  const getEmotionData = (value: string) =>
    EMOTIONS.find((e) => e.value === value);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE':
        return Mic;
      case 'MILESTONE':
        return Star;
      default:
        return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">
          {error || 'Entry not found'}
        </h2>
        <Link href="/app/journal">
          <Button variant="outline">Back to Journal</Button>
        </Link>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(entry.type);
  const emotions: string[] = (entry.emotions as string[]) || [];
  const tags: string[] = (entry as unknown as { tags?: string[] }).tags || [];
  const aiMarkers: string[] =
    (entry as unknown as { aiMarkers?: string[] }).aiMarkers || [];

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/journal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Badge variant="secondary" className="gap-1 capitalize">
            <TypeIcon className="w-3 h-3" />
            {entry.type.toLowerCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {entry.media && entry.media.some((m) => m.type.startsWith('video')) && (
            <Button variant="ghost" size="icon" onClick={handleQrShare}>
              <QrCode className="w-5 h-5" />
            </Button>
          )}
          <Link href={`/app/entry/${entry.id}/edit`}>
            <Button variant="ghost" size="icon">
              <Edit className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Title & Date */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {entry.title || 'Untitled Entry'}
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(entry.occurredAt || entry.createdAt).toLocaleDateString(
              'en-US',
              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </span>
          <span className="text-xs">
            ({timeAgo(entry.occurredAt || entry.createdAt)})
          </span>
        </div>
      </div>

      {/* Emotion Tags */}
      {emotions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => {
            const data = getEmotionData(emotion);
            return (
              <Badge key={emotion} variant="secondary" className="text-sm py-1">
                {data?.emoji} {data?.label || emotion}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Content */}
      {entry.content && (
        <Card>
          <CardContent className="py-4">
            <p className="whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          </CardContent>
        </Card>
      )}

      {/* Media Gallery */}
      {entry.media && entry.media.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Media</h3>
          <div className="grid grid-cols-2 gap-2">
            {entry.media.map((media) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-xl overflow-hidden bg-muted aspect-square"
              >
                {media.type.startsWith('image') ? (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Analysis */}
      {entry.voiceAnalysis && (
        <div className="space-y-3">
          <Separator />
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            AI Voice Analysis
          </h3>

          {entry.voiceAnalysis.transcript && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {entry.voiceAnalysis.transcript}
                </p>
              </CardContent>
            </Card>
          )}

          {entry.voiceAnalysis.summary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{entry.voiceAnalysis.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* AI Markers */}
      {aiMarkers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI-Detected
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {aiMarkers.map((marker) => (
              <Badge key={marker} variant="secondary" className="text-xs">
                {marker}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Author */}
      <div className="text-xs text-muted-foreground text-center pt-4">
        By {entry.author?.name || 'Unknown'}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={showQr} onOpenChange={setShowQr}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Share via QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to view the video entry.
            </DialogDescription>
          </DialogHeader>
          {qrUrl && (
            <div className="flex justify-center py-4">
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
