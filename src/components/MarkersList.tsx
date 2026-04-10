import { X, AlertCircle, ShieldAlert, CheckSquare, TrendingUp, Info, MessageSquare } from 'lucide-react';
import type { Marker, MarkerType } from '@/shared/types';
import { formatTimestamp, cn } from '@/lib/utils';

interface MarkersListProps {
  markers: Marker[];
  onDelete: (id: string) => void;
}

const MARKER_ICON: Record<MarkerType, typeof AlertCircle> = {
  'pain-point': AlertCircle,
  'objection': ShieldAlert,
  'action-item': CheckSquare,
  'buying-signal': TrendingUp,
  'key-info': Info,
  'custom': MessageSquare,
};

const MARKER_COLOR: Record<MarkerType, string> = {
  'pain-point': 'text-red-400',
  'objection': 'text-orange-400',
  'action-item': 'text-blue-400',
  'buying-signal': 'text-green-400',
  'key-info': 'text-purple-400',
  'custom': 'text-cp-text-muted',
};

export function MarkersList({ markers, onDelete }: MarkersListProps) {
  if (markers.length === 0) return null;

  return (
    <div className="border-t border-cp-border bg-cp-surface">
      <div className="px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] font-medium text-cp-text-muted uppercase tracking-wider">
          Markers ({markers.length})
        </span>
      </div>
      <div className="max-h-32 overflow-y-auto px-3 pb-2 space-y-0.5">
        {markers.map((marker) => {
          const Icon = MARKER_ICON[marker.type];
          return (
            <div
              key={marker.id}
              className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-cp-surface-hover group animate-slide-up"
            >
              <Icon className={cn('w-3 h-3 shrink-0', MARKER_COLOR[marker.type])} />
              <span className="text-[10px] text-cp-text-muted font-mono tabular-nums">
                {formatTimestamp(marker.timestamp)}
              </span>
              <span className="text-xs text-cp-text flex-1 truncate">
                {marker.label}
                {marker.note && (
                  <span className="text-cp-text-muted ml-1">— {marker.note}</span>
                )}
              </span>
              <button
                onClick={() => onDelete(marker.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity cp-btn-ghost p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
