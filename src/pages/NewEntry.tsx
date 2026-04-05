import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Video, X, Save, Globe, Lock, Loader2 } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { useAuth } from '../context/AuthContext';
import { generateId, getCategoryEmoji } from '../lib/utils';
import { uploadToCloudinary, getMediaUrl, isVideoMedia, formatDuration } from '../lib/cloudinary';
import type { JournalCategory, EntryVisibility, MediaItem } from '../types';

const categories: { value: JournalCategory; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'first', label: 'First' },
  { value: 'health', label: 'Health' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'play', label: 'Play' },
  { value: 'funny', label: 'Funny' },
  { value: 'outing', label: 'Outing' },
  { value: 'memory', label: 'Memory' },
];

const moods = [
  { value: 'happy', emoji: '😊' },
  { value: 'sleepy', emoji: '😴' },
  { value: 'fussy', emoji: '😤' },
  { value: 'calm', emoji: '😌' },
  { value: 'playful', emoji: '🤗' },
] as const;

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  type: 'image' | 'video';
  error?: string;
}

export default function NewEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { baby, entries, saveEntry } = useBabyContext();
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalCategory>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<string>('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [legacyPhotos, setLegacyPhotos] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<EntryVisibility>('private');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  const editingEntry = editId ? entries.find((e) => e.id === editId) : null;

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setCategory(editingEntry.category);
      setDate(editingEntry.date);
      setMood(editingEntry.mood || '');
      setVisibility(editingEntry.visibility || 'private');
      // Load existing media
      if (editingEntry.media && editingEntry.media.length > 0) {
        setMedia(editingEntry.media);
      }
      // Keep legacy photos
      if (editingEntry.photos && editingEntry.photos.length > 0 && (!editingEntry.media || editingEntry.media.length === 0)) {
        setLegacyPhotos(editingEntry.photos);
      }
    }
  }, [editingEntry]);

  const totalMedia = media.length + legacyPhotos.length + uploading.length;

  const handleAddMedia = async (e: React.ChangeEvent<HTMLInputElement>, accept: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || !token) return;

    const newUploads: UploadingFile[] = [];
    for (const file of Array.from(files)) {
      if (totalMedia + newUploads.length >= 10) break;

      // Video size limit: 100MB, image: 10MB
      const maxSize = accept === 'video' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) continue;

      // Video duration limit: 10 min
      const id = generateId();
      const preview = accept === 'image'
        ? URL.createObjectURL(file)
        : URL.createObjectURL(file);

      newUploads.push({
        id,
        file,
        preview,
        progress: 0,
        type: accept,
      });
    }

    if (newUploads.length === 0) return;

    setUploading(prev => [...prev, ...newUploads]);

    // Upload each file
    for (const upload of newUploads) {
      try {
        const mediaItem = await uploadToCloudinary(
          upload.file,
          token,
          (progress) => {
            setUploading(prev =>
              prev.map(u => u.id === upload.id ? { ...u, progress: progress.percent } : u)
            );
          }
        );

        // Remove from uploading, add to media
        setUploading(prev => prev.filter(u => u.id !== upload.id));
        setMedia(prev => [...prev, mediaItem]);
        URL.revokeObjectURL(upload.preview);
      } catch {
        setUploading(prev =>
          prev.map(u => u.id === upload.id ? { ...u, error: 'Upload failed', progress: 0 } : u)
        );
      }
    }

    // Reset input
    e.target.value = '';
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeLegacyPhoto = (index: number) => {
    setLegacyPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeUpload = (id: string) => {
    setUploading(prev => {
      const item = prev.find(u => u.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(u => u.id !== id);
    });
  };

  const handleSave = async () => {
    if (!title || !baby) return;
    if (uploading.some(u => !u.error)) return; // Wait for uploads

    setSaving(true);
    const now = new Date().toISOString();
    await saveEntry({
      id: editingEntry?.id || generateId(),
      babyId: baby.id,
      title,
      content,
      category,
      date,
      photos: legacyPhotos, // Keep legacy for backward compat
      media: media.length > 0 ? media : undefined,
      mood: (mood as any) || undefined,
      visibility,
      createdAt: editingEntry?.createdAt || now,
      updatedAt: now,
    });
    setSaving(false);
    navigate(editingEntry ? `/journal/${editingEntry.id}` : '/journal');
  };

  const hasActiveUploads = uploading.some(u => !u.error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="flex-1 font-heading text-xl font-bold text-gray-800">
          {editingEntry ? 'Edit Entry' : 'New Entry'}
        </h1>
        <button
          onClick={handleSave}
          disabled={!title || saving || hasActiveUploads}
          className="flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-95"
        >
          {hasActiveUploads ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? 'Saving...' : hasActiveUploads ? 'Uploading...' : 'Save'}
        </button>
      </div>

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-300"
      />

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What happened today?"
        autoFocus={!editingEntry}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg font-medium text-gray-800 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />

      {/* Category */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              category === cat.value
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            {getCategoryEmoji(cat.value)} {cat.label}
          </button>
        ))}
      </div>

      {/* Mood */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">Baby's mood</p>
        <div className="flex gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition-all ${
                mood === m.value
                  ? 'bg-rose-100 ring-2 ring-rose-400 scale-110'
                  : 'bg-white ring-1 ring-gray-200'
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility Toggle */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">Visibility</p>
        <div className="flex gap-2">
          <button
            onClick={() => setVisibility('private')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              visibility === 'private'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            <Lock size={12} />
            Private
          </button>
          <button
            onClick={() => setVisibility('public')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              visibility === 'public'
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            <Globe size={12} />
            Public (Family can see)
          </button>
        </div>
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write about this moment..."
        rows={5}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />

      {/* Media (Photos & Videos) */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-400">
          Photos & Videos ({totalMedia}/10)
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Legacy base64 photos */}
          {legacyPhotos.map((photo, i) => (
            <div key={`legacy-${i}`} className="relative">
              <img
                src={photo}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
              <button
                onClick={() => removeLegacyPhoto(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Cloud media */}
          {media.map((item, i) => (
            <div key={`media-${i}`} className="relative">
              {isVideoMedia(item) ? (
                <div className="relative h-20 w-20 rounded-xl bg-gray-900 overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Video size={20} className="text-white/60" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                    {formatDuration(item.duration)}
                  </div>
                </div>
              ) : (
                <img
                  src={getMediaUrl(item)}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
              )}
              <button
                onClick={() => removeMedia(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Uploading items */}
          <AnimatePresence>
            {uploading.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                <div className="relative h-20 w-20 rounded-xl overflow-hidden">
                  {item.type === 'video' ? (
                    <video
                      src={item.preview}
                      className="h-full w-full object-cover opacity-50"
                    />
                  ) : (
                    <img
                      src={item.preview}
                      alt=""
                      className="h-full w-full object-cover opacity-50"
                    />
                  )}
                  {/* Progress overlay */}
                  {!item.error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="text-center">
                        <Loader2 size={16} className="mx-auto animate-spin text-white" />
                        <span className="mt-0.5 block text-[10px] font-semibold text-white">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                      <span className="text-[10px] font-semibold text-white">Failed</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeUpload(item.id)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add buttons */}
          {totalMedia < 10 && (
            <>
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-rose-300">
                <Camera size={20} className="text-gray-300" />
                <span className="mt-0.5 text-[10px] text-gray-300">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAddMedia(e, 'image')}
                  className="hidden"
                />
              </label>
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 transition-all hover:border-violet-400">
                <Video size={20} className="text-violet-300" />
                <span className="mt-0.5 text-[10px] text-violet-300">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleAddMedia(e, 'video')}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
