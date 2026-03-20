import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import JournalCard from '../components/JournalCard';
import EmptyState from '../components/EmptyState';
import { BookOpen } from 'lucide-react';
import type { JournalCategory } from '../types';

const categories: { value: JournalCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'milestone', label: '⭐ Milestone' },
  { value: 'daily', label: '📝 Daily' },
  { value: 'first', label: '🎉 First' },
  { value: 'health', label: '❤️ Health' },
  { value: 'feeding', label: '🍼 Feeding' },
  { value: 'sleep', label: '😴 Sleep' },
  { value: 'funny', label: '😂 Funny' },
  { value: 'outing', label: '🌳 Outing' },
  { value: 'memory', label: '💭 Memory' },
];

export default function Journal() {
  const navigate = useNavigate();
  const { entries } = useBabyContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<JournalCategory | 'all'>('all');

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || e.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Journal</h1>
        <button
          onClick={() => navigate('/journal/new')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 active:scale-90"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              category === cat.value
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((entry, i) => (
            <JournalCard key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          No entries match your search
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No entries yet"
          description="Start capturing precious moments from your baby's life"
          action={{
            label: 'Write First Entry',
            onClick: () => navigate('/journal/new'),
          }}
        />
      )}
    </div>
  );
}
