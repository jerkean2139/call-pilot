import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { formatDate, getCategoryColor, getCategoryEmoji, getMoodEmoji } from '../lib/utils';

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, deleteEntry } = useBabyContext();

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Entry not found</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this journal entry?')) {
      await deleteEntry(entry.id);
      navigate('/journal');
    }
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
        <div className="flex-1" />
        <button
          onClick={handleDelete}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Photos */}
      {entry.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {entry.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt=""
              className="h-48 w-auto shrink-0 rounded-2xl object-cover"
            />
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(entry.category)}`}>
          {getCategoryEmoji(entry.category)} {entry.category}
        </span>
        {entry.mood && (
          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
        )}
        <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
      </div>

      {/* Content */}
      <div>
        <h1 className="mb-2 font-heading text-2xl font-bold text-gray-800">
          {entry.title}
        </h1>
        {entry.content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
            {entry.content}
          </p>
        )}
      </div>
    </motion.div>
  );
}
