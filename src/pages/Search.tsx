import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, ArrowLeft, BookOpen, Star, TrendingUp } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { formatShortDate, getCategoryEmoji } from '../lib/utils';

interface SearchResult {
  id: string;
  type: 'journal' | 'milestone' | 'growth';
  title: string;
  subtitle: string;
  date: string;
  icon: typeof BookOpen;
  color: string;
}

export default function Search() {
  const navigate = useNavigate();
  const { entries, milestones, growthRecords } = useBabyContext();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: SearchResult[] = [];

    entries.forEach((e) => {
      if (
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      ) {
        matches.push({
          id: e.id,
          type: 'journal',
          title: e.title,
          subtitle: `${getCategoryEmoji(e.category)} ${e.category} — ${e.content.slice(0, 80)}`,
          date: e.date,
          icon: BookOpen,
          color: 'rose',
        });
      }
    });

    milestones.forEach((m) => {
      if (
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      ) {
        matches.push({
          id: m.id,
          type: 'milestone',
          title: m.title,
          subtitle: `${getCategoryEmoji(m.category)} ${m.category}${m.achievedDate ? ' — Achieved' : ''}`,
          date: m.achievedDate || m.createdAt,
          icon: Star,
          color: 'amber',
        });
      }
    });

    growthRecords.forEach((g) => {
      const parts: string[] = [];
      if (g.weightLbs !== undefined) parts.push(`${g.weightLbs}lb`);
      if (g.heightInches !== undefined) parts.push(`${g.heightInches}in`);
      const text = parts.join(', ') + (g.notes || '');
      if (text.toLowerCase().includes(q) || g.notes?.toLowerCase().includes(q)) {
        matches.push({
          id: g.id,
          type: 'growth',
          title: 'Growth Record',
          subtitle: parts.join(', ') + (g.notes ? ` — ${g.notes}` : ''),
          date: g.date,
          icon: TrendingUp,
          color: 'violet',
        });
      }
    });

    return matches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [query, entries, milestones, growthRecords]);

  const handleClick = (result: SearchResult) => {
    if (result.type === 'journal') navigate(`/journal/${result.id}`);
    else if (result.type === 'milestone') navigate('/milestones');
    else navigate('/growth');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-4"
    >
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="font-heading text-xl font-bold text-gray-800">Search</h1>
      </div>

      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entries, milestones, growth..."
          autoFocus
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {query && (
        <p className="text-xs text-gray-400">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="space-y-2">
        {results.map((result) => {
          const Icon = result.icon;
          return (
            <motion.button
              key={`${result.type}-${result.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleClick(result)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-${result.color}-100`}>
                <Icon size={16} className={`text-${result.color}-500`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-700">{result.title}</p>
                <p className="truncate text-xs text-gray-400">{result.subtitle}</p>
              </div>
              <span className="shrink-0 text-[10px] text-gray-400">
                {formatShortDate(result.date)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {query && results.length === 0 && (
        <div className="py-12 text-center">
          <SearchIcon size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm text-gray-400">No results found</p>
        </div>
      )}

      {!query && (
        <div className="py-12 text-center">
          <SearchIcon size={32} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm text-gray-400">
            Search across journal entries, milestones, and growth records
          </p>
        </div>
      )}
    </motion.div>
  );
}
