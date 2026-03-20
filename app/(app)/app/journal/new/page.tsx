'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  ImagePlus,
  X,
  Loader2,
  Save,
  Tag,
  Plus,
  BookOpen,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, EMOTIONS } from '@/lib/utils';

type EntryType = 'JOURNAL' | 'MILESTONE';

interface MediaPreview {
  file: File;
  url: string;
  type: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { activeBaby } = useBaby();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [entryType, setEntryType] = useState<EntryType>('JOURNAL');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleEmotion = (value: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!activeBaby || !title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: activeBaby.id,
          title: title.trim(),
          content: content.trim(),
          type: entryType,
          occurredAt: new Date(occurredAt).toISOString(),
          emotions: selectedEmotions,
          tags,
        }),
      });

      if (!res.ok) throw new Error('Failed to save entry');
      const entry = await res.json();

      // Upload media files
      if (mediaPreviews.length > 0) {
        for (const preview of mediaPreviews) {
          const formData = new FormData();
          formData.append('file', preview.file);
          formData.append('entryId', entry.id);
          formData.append('babyId', activeBaby.id);

          await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        }
      }

      router.push('/app/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">
          Add a baby in settings to start journaling.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/journal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">New Entry</h1>
      </div>

      {/* Entry Type Selector */}
      <div className="flex gap-2">
        <Button
          variant={entryType === 'JOURNAL' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setEntryType('JOURNAL')}
        >
          <BookOpen className="w-4 h-4" />
          Journal
        </Button>
        <Button
          variant={entryType === 'MILESTONE' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setEntryType('MILESTONE')}
        >
          <Star className="w-4 h-4" />
          Milestone
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder={
            entryType === 'MILESTONE'
              ? 'e.g., First steps!'
              : 'Give this moment a name...'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">What happened?</Label>
        <Textarea
          id="content"
          placeholder="Write about this moment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="date">When did this happen?</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="date"
            type="date"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Emotion Picker */}
      <div className="space-y-2">
        <Label>How are you feeling?</Label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => (
            <motion.div key={emotion.value} whileTap={{ scale: 0.93 }}>
              <Badge
                variant={
                  selectedEmotions.includes(emotion.value)
                    ? 'default'
                    : 'outline'
                }
                className={cn(
                  'cursor-pointer text-sm py-1.5 px-3 transition-colors',
                  selectedEmotions.includes(emotion.value) &&
                    'bg-primary text-primary-foreground'
                )}
                onClick={() => toggleEmotion(emotion.value)}
              >
                {emotion.emoji} {emotion.label}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <Button variant="outline" size="icon" onClick={addTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Media Upload */}
      <div className="space-y-2">
        <Label>Photos & Videos</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex flex-wrap gap-2">
          {mediaPreviews.map((preview, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted"
            >
              {preview.type.startsWith('image') ? (
                <img
                  src={preview.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={preview.url}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => removeMedia(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px]">Add</span>
          </motion.button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-destructive">
              <CardContent className="py-3 text-sm text-destructive text-center">
                {error}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          className="w-full"
          size="lg"
          disabled={!title.trim() || saving}
          onClick={handleSave}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Entry'}
        </Button>
      </motion.div>
    </div>
  );
}
