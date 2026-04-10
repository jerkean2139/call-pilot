import { useState } from 'react';
import {
  AlertCircle,
  ShieldAlert,
  CheckSquare,
  TrendingUp,
  Info,
  MessageSquare,
  X,
} from 'lucide-react';
import { MARKER_SHORTCUTS, type MarkerType } from '@/shared/types';
import { cn } from '@/lib/utils';

interface TagBarProps {
  onTag: (type: MarkerType, label: string, note?: string) => void;
  disabled: boolean;
}

const TAG_ICONS: Record<MarkerType, typeof AlertCircle> = {
  'pain-point': AlertCircle,
  'objection': ShieldAlert,
  'action-item': CheckSquare,
  'buying-signal': TrendingUp,
  'key-info': Info,
  'custom': MessageSquare,
};

const TAG_COLORS: Record<MarkerType, string> = {
  'pain-point': 'text-red-400 bg-red-400/10 border-red-400/20 hover:bg-red-400/20',
  'objection': 'text-orange-400 bg-orange-400/10 border-orange-400/20 hover:bg-orange-400/20',
  'action-item': 'text-blue-400 bg-blue-400/10 border-blue-400/20 hover:bg-blue-400/20',
  'buying-signal': 'text-green-400 bg-green-400/10 border-green-400/20 hover:bg-green-400/20',
  'key-info': 'text-purple-400 bg-purple-400/10 border-purple-400/20 hover:bg-purple-400/20',
  'custom': 'text-cp-text-muted bg-cp-surface-hover border-cp-border hover:bg-cp-surface-hover',
};

export function TagBar({ onTag, disabled }: TagBarProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleTag = (type: MarkerType, label: string) => {
    if (disabled) return;
    onTag(type, label);
  };

  const handleCustomNote = () => {
    if (noteText.trim()) {
      onTag('custom', 'Note', noteText.trim());
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  return (
    <div className="border-t border-cp-border bg-cp-surface">
      {/* Quick note input */}
      {showNoteInput && (
        <div className="px-3 py-2 border-b border-cp-border flex gap-2 animate-slide-up">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomNote();
              if (e.key === 'Escape') {
                setShowNoteInput(false);
                setNoteText('');
              }
            }}
            placeholder="Quick note..."
            className="cp-input flex-1 text-xs py-1"
            autoFocus
          />
          <button onClick={handleCustomNote} className="cp-btn-primary text-xs px-2 py-1">
            Save
          </button>
          <button
            onClick={() => {
              setShowNoteInput(false);
              setNoteText('');
            }}
            className="cp-btn-ghost p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tag buttons */}
      <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
        {Object.entries(MARKER_SHORTCUTS).map(([key, { type, label }]) => {
          const Icon = TAG_ICONS[type];
          return (
            <button
              key={key}
              onClick={() => {
                if (type === 'custom') {
                  setShowNoteInput(true);
                } else {
                  handleTag(type, label);
                }
              }}
              disabled={disabled}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                'border transition-all shrink-0',
                'focus:outline-none focus:ring-2 focus:ring-cp-accent focus:ring-offset-1 focus:ring-offset-cp-bg',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                TAG_COLORS[type],
              )}
              title={`${label} (${key})`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
              <kbd className="cp-kbd text-[9px] ml-0.5 h-4 min-w-[1rem]">{key}</kbd>
            </button>
          );
        })}

        {/* M = quick note */}
        <button
          onClick={() => setShowNoteInput(true)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
            'border transition-all shrink-0',
            'text-cp-text-muted bg-cp-surface-hover border-cp-border hover:bg-cp-surface-hover',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
          title="Quick Note (M)"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Note</span>
          <kbd className="cp-kbd text-[9px] ml-0.5 h-4 min-w-[1rem]">M</kbd>
        </button>
      </div>
    </div>
  );
}
