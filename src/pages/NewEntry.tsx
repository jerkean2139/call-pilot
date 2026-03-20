import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, X, Save } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { generateId, fileToBase64, getCategoryEmoji } from '../lib/utils';
import type { JournalCategory } from '../types';

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

export default function NewEntry() {
  const navigate = useNavigate();
  const { baby, saveEntry } = useBabyContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalCategory>('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: string[] = [];
    for (const file of Array.from(files)) {
      if (photos.length + newPhotos.length >= 5) break;
      const base64 = await fileToBase64(file);
      newPhotos.push(base64);
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || !baby) return;
    setSaving(true);
    const now = new Date().toISOString();
    await saveEntry({
      id: generateId(),
      babyId: baby.id,
      title,
      content,
      category,
      date,
      photos,
      mood: mood as any || undefined,
      createdAt: now,
      updatedAt: now,
    });
    setSaving(false);
    navigate('/journal');
  };

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
          New Entry
        </h1>
        <button
          onClick={handleSave}
          disabled={!title || saving}
          className="flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-95"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save'}
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
        autoFocus
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

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write about this moment..."
        rows={5}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
      />

      {/* Photos */}
      <div>
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative">
              <img
                src={photo}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-rose-300">
              <Camera size={20} className="text-gray-300" />
              <span className="mt-0.5 text-xs text-gray-300">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhoto}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </motion.div>
  );
}
