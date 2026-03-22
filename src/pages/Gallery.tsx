import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Mail,
  Download,
  CheckCircle2,
  Image,
  Monitor,
  X,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBabyContext } from '../context/BabyContext';
import EmptyState from '../components/EmptyState';
import { formatShortDate } from '../lib/utils';
import {
  getFrameSettings,
  sharePhotosViaWebShare,
  openEmailToFrame,
  downloadPhoto,
  getFrameTypeName,
} from '../lib/frameSettings';

interface PhotoItem {
  base64: string;
  entryId: string;
  entryTitle: string;
  date: string;
  index: number;
}

export default function Gallery() {
  const navigate = useNavigate();
  const { entries } = useBabyContext();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const frameSettings = getFrameSettings();

  const allPhotos = useMemo(() => {
    const photos: PhotoItem[] = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.photos.length; i++) {
        photos.push({
          base64: entry.photos[i],
          entryId: entry.id,
          entryTitle: entry.title,
          date: entry.date,
          index: i,
        });
      }
    }
    return photos.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries]);

  const photoKey = (p: PhotoItem) => `${p.entryId}-${p.index}`;

  const toggleSelect = (p: PhotoItem) => {
    const key = photoKey(p);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === allPhotos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allPhotos.map(photoKey)));
    }
  };

  const selectedPhotos = allPhotos.filter((p) => selected.has(photoKey(p)));

  const handleShare = async () => {
    if (selectedPhotos.length === 0) return;
    const photos = selectedPhotos.map((p) => p.base64);
    const ok = await sharePhotosViaWebShare(photos, 'Baby Photos');
    if (ok) {
      setShareStatus('Shared successfully!');
      setTimeout(() => setShareStatus(null), 2000);
      setSelected(new Set());
      setSelecting(false);
    }
  };

  const handleEmailToFrame = () => {
    if (selectedPhotos.length === 0 || !frameSettings.frameEmail) return;
    // Download photos first so user can attach them
    selectedPhotos.forEach((p, i) => {
      downloadPhoto(p.base64, `baby-photo-${i + 1}.jpg`);
    });
    openEmailToFrame(
      frameSettings.frameEmail,
      selectedPhotos.map((p) => p.base64),
      `Baby Photos (${selectedPhotos.length})`
    );
    setShareStatus('Photos downloaded & email opened!');
    setTimeout(() => setShareStatus(null), 3000);
  };

  const handleDownload = () => {
    selectedPhotos.forEach((p, i) => {
      downloadPhoto(p.base64, `baby-photo-${i + 1}.jpg`);
    });
    setShareStatus(`${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} downloaded!`);
    setTimeout(() => setShareStatus(null), 2000);
  };

  const handleSingleShare = async (photo: PhotoItem) => {
    const ok = await sharePhotosViaWebShare([photo.base64], photo.entryTitle);
    if (ok) {
      setShareStatus('Shared!');
      setTimeout(() => setShareStatus(null), 2000);
    }
  };

  const handleSingleEmail = (photo: PhotoItem) => {
    if (!frameSettings.frameEmail) return;
    downloadPhoto(photo.base64, `${photo.entryTitle}.jpg`);
    openEmailToFrame(frameSettings.frameEmail, [photo.base64], photo.entryTitle);
  };

  if (allPhotos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-4"
      >
        <div className="flex items-center gap-3 pt-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <h1 className="font-heading text-xl font-bold text-gray-800">
            Photo Gallery
          </h1>
        </div>
        <EmptyState
          icon={Image}
          title="No Photos Yet"
          description="Photos from your journal entries will appear here. Start by adding photos to your entries!"
          action={{
            label: 'Create Entry',
            onClick: () => navigate('/journal/new'),
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => {
            if (selecting) {
              setSelecting(false);
              setSelected(new Set());
            } else {
              navigate(-1);
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200"
        >
          {selecting ? (
            <X size={18} className="text-gray-600" />
          ) : (
            <ArrowLeft size={18} className="text-gray-600" />
          )}
        </button>
        <h1 className="flex-1 font-heading text-xl font-bold text-gray-800">
          {selecting
            ? `${selected.size} selected`
            : `Photos (${allPhotos.length})`}
        </h1>
        {!selecting ? (
          <button
            onClick={() => setSelecting(true)}
            className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-200"
          >
            Select
          </button>
        ) : (
          <button
            onClick={selectAll}
            className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-200"
          >
            {selected.size === allPhotos.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* Frame connection indicator */}
      {frameSettings.enabled && frameSettings.frameEmail && (
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-rose-50 px-3 py-2 ring-1 ring-violet-100">
          <Monitor size={14} className="text-violet-500" />
          <span className="text-xs text-violet-700">
            Connected to{' '}
            <span className="font-semibold">
              {frameSettings.frameName ||
                getFrameTypeName(frameSettings.frameType)}
            </span>
          </span>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {allPhotos.map((photo) => {
          const key = photoKey(photo);
          const isSelected = selected.has(key);
          return (
            <motion.button
              key={key}
              onClick={() => {
                if (selecting) {
                  toggleSelect(photo);
                } else {
                  setPreviewPhoto(photo);
                }
              }}
              className="relative aspect-square overflow-hidden rounded-xl"
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={photo.base64}
                alt={photo.entryTitle}
                className="h-full w-full object-cover"
              />
              {selecting && (
                <div
                  className={`absolute inset-0 flex items-start justify-end p-1.5 transition-colors ${
                    isSelected
                      ? 'bg-violet-500/20'
                      : 'bg-black/5'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/80 ring-1 ring-gray-300'
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              )}
              {!selecting && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                  <p className="truncate text-[10px] text-white/90">
                    {formatShortDate(photo.date)}
                  </p>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selection Action Bar */}
      <AnimatePresence>
        {selecting && selected.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-0 right-0 z-40 px-4"
          >
            <div className="mx-auto flex max-w-lg items-center justify-around rounded-2xl bg-white p-3 shadow-lg ring-1 ring-gray-200">
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                    <Share2 size={18} className="text-violet-600" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600">
                    Share
                  </span>
                </button>
              )}

              {frameSettings.enabled && frameSettings.frameEmail && (
                <button
                  onClick={handleEmailToFrame}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                    <Monitor size={18} className="text-rose-600" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600">
                    To Frame
                  </span>
                </button>
              )}

              <button
                onClick={handleEmailToFrame}
                className="flex flex-col items-center gap-1"
                style={{
                  display:
                    frameSettings.enabled && frameSettings.frameEmail
                      ? 'none'
                      : undefined,
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Mail size={18} className="text-amber-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-600">
                  Email
                </span>
              </button>

              <button
                onClick={handleDownload}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Download size={18} className="text-green-600" />
                </div>
                <span className="text-[10px] font-medium text-gray-600">
                  Download
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Toast */}
      <AnimatePresence>
        {shareStatus && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} />
              {shareStatus}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={previewPhoto.base64}
              alt={previewPhoto.entryTitle}
              className="max-h-[70vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto max-w-lg">
                <p className="mb-3 text-center text-sm text-white/80">
                  {previewPhoto.entryTitle} &middot;{' '}
                  {formatShortDate(previewPhoto.date)}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {navigator.share && (
                    <button
                      onClick={() => handleSingleShare(previewPhoto)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                    >
                      <Share2 size={18} />
                    </button>
                  )}
                  {frameSettings.enabled && frameSettings.frameEmail && (
                    <button
                      onClick={() => handleSingleEmail(previewPhoto)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                    >
                      <Monitor size={18} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      downloadPhoto(
                        previewPhoto.base64,
                        `${previewPhoto.entryTitle}.jpg`
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/journal/${previewPhoto.entryId}`)
                    }
                    className="flex h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-sm text-white transition-colors hover:bg-white/25"
                  >
                    View Entry
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
