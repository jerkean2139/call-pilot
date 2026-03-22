import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X, CheckCircle2 } from 'lucide-react';
import type { JournalEntry } from '../types';
import { formatDate, getCategoryEmoji, getMoodEmoji } from '../lib/utils';

interface Props {
  entry: JournalEntry;
  babyName: string;
  onClose: () => void;
}

export default function ShareMoment({ entry, babyName, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // Use canvas to render the card as an image
      const card = cardRef.current;
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, card.offsetHeight);
      gradient.addColorStop(0, '#FFF1F2');
      gradient.addColorStop(1, '#FFF8F0');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, card.offsetWidth, card.offsetHeight, 20);
      ctx.fill();

      const padding = 24;
      let y = padding;

      // Draw photo if available
      if (entry.photos[0]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = entry.photos[0];
        });
        const imgW = card.offsetWidth - padding * 2;
        const imgH = 160;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(padding, y, imgW, imgH, 12);
        ctx.clip();
        ctx.drawImage(img, padding, y, imgW, imgH);
        ctx.restore();
        y += imgH + 16;
      }

      // Draw category
      ctx.font = '12px "Open Sans", sans-serif';
      ctx.fillStyle = '#9CA3AF';
      ctx.fillText(
        `${getCategoryEmoji(entry.category)} ${entry.category} ${getMoodEmoji(entry.mood)}`,
        padding,
        y
      );
      y += 20;

      // Draw title
      ctx.font = 'bold 20px "Montserrat", sans-serif';
      ctx.fillStyle = '#1F2937';
      ctx.fillText(entry.title, padding, y);
      y += 8;

      // Draw date
      ctx.font = '12px "Open Sans", sans-serif';
      ctx.fillStyle = '#9CA3AF';
      y += 16;
      ctx.fillText(formatDate(entry.date), padding, y);
      y += 20;

      // Draw content preview
      if (entry.content) {
        ctx.font = '13px "Open Sans", sans-serif';
        ctx.fillStyle = '#6B7280';
        const words = entry.content.slice(0, 150).split(' ');
        let line = '';
        const maxWidth = card.offsetWidth - padding * 2;
        for (const word of words) {
          const testLine = line + word + ' ';
          if (ctx.measureText(testLine).width > maxWidth) {
            ctx.fillText(line, padding, y);
            line = word + ' ';
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, padding, y);
        y += 24;
      }

      // Draw footer
      ctx.font = '11px "Open Sans", sans-serif';
      ctx.fillStyle = '#D1D5DB';
      ctx.fillText(`${babyName}'s journal — Living Legacy`, padding, y);

      const dataUrl = canvas.toDataURL('image/png');

      if (navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${entry.title}.png`, { type: 'image/png' });
        try {
          await navigator.share({ files: [file] });
          setStatus('Shared!');
        } catch {
          // User cancelled
        }
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${entry.title}.png`;
        a.click();
        setStatus('Downloaded!');
      }
      if (status) setTimeout(() => setStatus(null), 2000);
    } catch {
      // Fallback: simple text share
      if (navigator.share) {
        await navigator.share({
          title: entry.title,
          text: `${entry.title}\n${entry.content}\n\n— ${babyName}'s journal, Living Legacy`,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Card */}
        <div
          ref={cardRef}
          className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-b from-rose-50 to-warm-50 p-6 shadow-lg"
        >
          {entry.photos[0] && (
            <img
              src={entry.photos[0]}
              alt=""
              className="mb-4 h-40 w-full rounded-xl object-cover"
            />
          )}
          <p className="mb-1 text-xs text-gray-400">
            {getCategoryEmoji(entry.category)} {entry.category}{' '}
            {getMoodEmoji(entry.mood)}
          </p>
          <h3 className="mb-1 font-heading text-xl font-bold text-gray-800">
            {entry.title}
          </h3>
          <p className="mb-2 text-xs text-gray-400">{formatDate(entry.date)}</p>
          {entry.content && (
            <p className="mb-3 line-clamp-3 text-sm text-gray-600">
              {entry.content}
            </p>
          )}
          <p className="text-[10px] text-gray-300">
            {babyName}'s journal — Living Legacy
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            {navigator.share ? (
              <>
                <Share2 size={16} /> Share
              </>
            ) : (
              <>
                <Download size={16} /> Download
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-gray-500 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center justify-center gap-1 text-sm text-green-400"
            >
              <CheckCircle2 size={14} /> {status}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
