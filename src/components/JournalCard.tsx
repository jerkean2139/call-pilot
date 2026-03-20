import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { JournalEntry } from '../types';
import { formatShortDate, getCategoryColor, getCategoryEmoji, getMoodEmoji } from '../lib/utils';

interface Props {
  entry: JournalEntry;
  index?: number;
}

export default function JournalCard({ entry, index = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/journal/${entry.id}`)}
      className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex gap-3">
        {entry.photos.length > 0 && (
          <img
            src={entry.photos[0]}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(entry.category)}`}>
              {getCategoryEmoji(entry.category)} {entry.category}
            </span>
            {entry.mood && (
              <span className="text-sm">{getMoodEmoji(entry.mood)}</span>
            )}
          </div>
          <h3 className="truncate font-heading text-sm font-semibold text-gray-800">
            {entry.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
            {entry.content}
          </p>
          <p className="mt-1 text-xs text-gray-300">
            {formatShortDate(entry.date)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
