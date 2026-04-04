import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate, getCategoryColor, getCategoryEmoji } from '../lib/utils';
import type { SharedEntry } from '../types';

export default function SharedView() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<SharedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    fetch(`/api/shared/entries?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authorized');
        return res.json();
      })
      .then((data) => {
        setEntries(data.entries || []);
      })
      .catch(() => {
        setError('Unable to load shared entries. You may not have access.');
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-50 px-4 dark:bg-gray-900">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-rose-300" />
          <h2 className="mb-2 font-heading text-xl font-bold text-gray-800 dark:text-white">
            Sign in to view shared entries
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            You need an account to view family journal entries.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-rose-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-rose-500 hover:text-rose-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg space-y-4 px-4 pb-8 pt-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
          Shared Journal
        </h1>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry) => (
            <motion.div
              key={entry.entryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
            >
              {entry.photos.length > 0 && (
                <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {entry.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt=""
                      className="h-32 w-auto shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="mb-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(entry.category)}`}>
                  {getCategoryEmoji(entry.category)} {entry.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {formatDate(entry.date)}
                </span>
              </div>

              <h3 className="mb-1 font-heading font-semibold text-gray-800 dark:text-white">
                {entry.title}
              </h3>
              {entry.content && (
                <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                  {entry.content}
                </p>
              )}

              {entry.babyName && (
                <p className="mt-2 text-xs text-gray-400">
                  From {entry.babyName}'s journal
                </p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-200" />
          <h3 className="mb-1 font-heading font-semibold text-gray-600 dark:text-gray-300">
            No shared entries
          </h3>
          <p className="text-sm text-gray-400">
            There are no public journal entries to view yet.
          </p>
        </div>
      )}
    </motion.div>
  );
}
