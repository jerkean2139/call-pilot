import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { TranscriptChunk, Marker } from '@/shared/types';
import { formatTimestamp, cn } from '@/lib/utils';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  markers: Marker[];
  isActive: boolean;
}

export function TranscriptPanel({ chunks, markers, isActive }: TranscriptPanelProps) {
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new chunks arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chunks.length, autoScroll]);

  // Detect if user scrolled up
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(nearBottom);
  };

  const markerMap = new Map(markers.map((m) => [m.chunkId, m]));

  const filtered = search
    ? chunks.filter(
        (c) =>
          c.text.toLowerCase().includes(search.toLowerCase()) ||
          c.speaker.toLowerCase().includes(search.toLowerCase()),
      )
    : chunks;

  // ─── Empty State ───
  if (chunks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-cp-surface-hover flex items-center justify-center mx-auto mb-3">
            <div className="w-3 h-3 rounded-full bg-cp-text-muted animate-pulse-soft" />
          </div>
          <p className="text-cp-text-muted text-sm">
            {isActive
              ? 'Waiting for transcript...'
              : 'Start a call or load a session to see the transcript'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="px-3 py-2 border-b border-cp-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cp-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transcript..."
            className="cp-input pl-8 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {filtered.map((chunk) => {
          const marker = markerMap.get(chunk.id);
          return (
            <div
              key={chunk.id}
              className={cn(
                'group flex gap-2 py-1.5 px-2 rounded-md transition-colors',
                marker && 'bg-cp-accent/5 border-l-2 border-cp-accent',
                !marker && 'hover:bg-cp-surface-hover',
              )}
            >
              <span className="text-[10px] text-cp-text-muted font-mono tabular-nums shrink-0 pt-0.5 w-10 text-right">
                {formatTimestamp(chunk.timestamp)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-cp-accent mr-1.5">
                  {chunk.speaker}
                </span>
                <span className="text-sm text-cp-text leading-relaxed">
                  {chunk.text}
                </span>
                {marker && (
                  <span className="ml-1.5 cp-badge bg-cp-accent/20 text-cp-accent text-[10px]">
                    {marker.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom indicator */}
      {!autoScroll && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            setAutoScroll(true);
          }}
          className="absolute bottom-20 right-4 cp-btn bg-cp-surface border border-cp-border shadow-lg"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-xs">Latest</span>
        </button>
      )}
    </div>
  );
}
