'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  Play,
  Pause,
  Loader2,
  Save,
  Edit3,
  Check,
  Brain,
  Tag,
  Star,
  Baby,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, EMOTIONS } from '@/lib/utils';

interface VoiceAnalysisResult {
  transcript: string;
  summary: string;
  tags: string[];
  emotions: string[];
  firsts: string[];
  milestones: string[];
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'analyzing' | 'analyzed';

export default function VoiceMemoPage() {
  const router = useRouter();
  const { activeBaby } = useBaby();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [analysis, setAnalysis] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable analysis fields
  const [editTranscript, setEditTranscript] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editEmotions, setEditEmotions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState('recorded');
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setError('Microphone access denied. Please allow microphone access to record.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setAnalysis(null);
    setDuration(0);
    setIsPlaying(false);
    setState('idle');
    setError(null);
  };

  const analyzeRecording = async () => {
    if (!audioBlob || !activeBaby) return;
    setState('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('babyId', activeBaby.id);

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data: VoiceAnalysisResult = await res.json();

      setAnalysis(data);
      setEditTranscript(data.transcript);
      setEditSummary(data.summary);
      setEditTags(data.tags);
      setEditEmotions(data.emotions);
      setState('analyzed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze recording');
      setState('recorded');
    }
  };

  const saveAsJournalEntry = async () => {
    if (!activeBaby || !analysis) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyId: activeBaby.id,
          type: 'VOICE',
          title: editSummary.slice(0, 80) || 'Voice Memo',
          content: editTranscript,
          emotions: editEmotions,
          tags: editTags,
          voiceAnalysis: {
            transcript: editTranscript,
            summary: editSummary,
            firsts: analysis.firsts,
            milestones: analysis.milestones,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      const entry = await res.json();

      // Upload audio as media
      if (audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-memo.webm');
        formData.append('entryId', entry.id);
        formData.append('babyId', activeBaby.id);
        await fetch('/api/upload', { method: 'POST', body: formData });
      }

      router.push(`/app/entry/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      setSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleEmotionEdit = (value: string) => {
    setEditEmotions((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Mic className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings to record voice memos.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice Memo</h1>
        <p className="text-muted-foreground text-sm">
          Record your thoughts and let AI capture the moments
        </p>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardContent className="py-8 flex flex-col items-center space-y-4">
          {state === 'idle' && (
            <motion.div className="text-center space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg mx-auto"
              >
                <Mic className="w-10 h-10 text-primary-foreground" />
              </motion.button>
              <p className="text-sm text-muted-foreground">Tap to record</p>
            </motion.div>
          )}

          {state === 'recording' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-24 h-24 rounded-full bg-destructive/20 absolute inset-0 mx-auto"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="relative w-24 h-24 rounded-full bg-destructive flex items-center justify-center shadow-lg mx-auto"
                >
                  <Square className="w-8 h-8 text-white" />
                </motion.button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 rounded-full bg-destructive"
                />
                <span className="text-lg font-mono font-bold">
                  {formatDuration(duration)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Recording... Tap to stop</p>
            </motion.div>
          )}

          {(state === 'recorded' || state === 'analyzing') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4 w-full"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={resetRecording}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              <Button
                className="w-full gap-2"
                onClick={analyzeRecording}
                disabled={state === 'analyzing'}
              >
                {state === 'analyzing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Analyze Recording
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

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

      {/* Analysis Results */}
      {state === 'analyzed' && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Analysis
          </h2>

          {/* Transcript */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editTranscript}
                onChange={(e) => setEditTranscript(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Detected Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {editTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => setEditTags((prev) => prev.filter((t) => t !== tag))}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emotions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((emotion) => (
                  <Badge
                    key={emotion.value}
                    variant={editEmotions.includes(emotion.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEmotionEdit(emotion.value)}
                  >
                    {emotion.emoji} {emotion.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Firsts & Milestones */}
          {(analysis.firsts.length > 0 || analysis.milestones.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Detected Firsts & Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.firsts.map((first, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Baby className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{first}</span>
                  </div>
                ))}
                {analysis.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span>{milestone}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={saveAsJournalEntry}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save as Journal Entry
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
