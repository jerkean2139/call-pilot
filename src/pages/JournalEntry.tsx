import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Share2, Monitor, CheckCircle2, Pencil, Sparkles, Globe, Lock } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { formatDate, getCategoryColor, getCategoryEmoji, getMoodEmoji } from '../lib/utils';
import { getFrameSettings, sharePhotosViaWebShare, openEmailToFrame, downloadPhoto, getFrameTypeName } from '../lib/frameSettings';
import ConfirmDialog from '../components/ConfirmDialog';
import ShareMoment from '../components/ShareMoment';

export default function JournalEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { baby, entries, deleteEntry } = useBabyContext();

  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const frameSettings = getFrameSettings();

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Entry not found</p>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteEntry(entry.id);
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
        <div className="flex-1" />
        <button
          onClick={() => setShowShareCard(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 transition-colors hover:bg-amber-50 hover:text-amber-500"
          title="Share as card"
        >
          <Sparkles size={16} className="text-gray-400" />
        </button>
        <button
          onClick={() => navigate(`/journal/new?edit=${entry.id}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 transition-colors hover:bg-violet-50 hover:text-violet-500"
        >
          <Pencil size={16} className="text-gray-400" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
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

      {/* Share Actions */}
      {entry.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {navigator.share && (
            <button
              onClick={async () => {
                const ok = await sharePhotosViaWebShare(entry.photos, entry.title);
                if (ok) {
                  setShareStatus('Shared!');
                  setTimeout(() => setShareStatus(null), 2000);
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600 ring-1 ring-violet-200 transition-colors hover:bg-violet-100"
            >
              <Share2 size={13} />
              Share Photos
            </button>
          )}
          {frameSettings.enabled && frameSettings.frameEmail && (
            <button
              onClick={() => {
                entry.photos.forEach((p, i) => downloadPhoto(p, `${entry.title}-${i + 1}.jpg`));
                openEmailToFrame(frameSettings.frameEmail, entry.photos, entry.title);
                setShareStatus(`Sending to ${frameSettings.frameName || getFrameTypeName(frameSettings.frameType)}...`);
                setTimeout(() => setShareStatus(null), 3000);
              }}
              className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 ring-1 ring-rose-200 transition-colors hover:bg-rose-100"
            >
              <Monitor size={13} />
              Send to Frame
            </button>
          )}
        </div>
      )}

      {/* Share Status Toast */}
      <AnimatePresence>
        {shareStatus && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} />
              {shareStatus}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(entry.category)}`}>
          {getCategoryEmoji(entry.category)} {entry.category}
        </span>
        {entry.mood && (
          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
        )}
        <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
        {entry.visibility === 'public' ? (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
            <Globe size={10} /> Public
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
            <Lock size={10} /> Private
          </span>
        )}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Share as Card Modal */}
      <AnimatePresence>
        {showShareCard && baby && (
          <ShareMoment
            entry={entry}
            babyName={baby.name}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
