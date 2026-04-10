import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Circle, Clock, Users } from 'lucide-react';
import type { Call } from '@/shared/types';
import { cn, formatDuration } from '@/lib/utils';

interface CallHeaderProps {
  call: Call | null;
  chunkCount: number;
  markerCount: number;
  onStartCall: () => void;
  onEndCall: () => void;
}

export function CallHeader({
  call,
  chunkCount,
  markerCount,
  onStartCall,
  onEndCall,
}: CallHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (call?.status !== 'active') return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - call.startedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [call]);

  const isActive = call?.status === 'active';

  return (
    <div className="bg-cp-surface border-b border-cp-border px-3 py-2">
      <div className="flex items-center justify-between">
        {/* Left: Status and title */}
        <div className="flex items-center gap-2 min-w-0">
          {isActive ? (
            <Circle className="w-2.5 h-2.5 text-cp-success fill-cp-success animate-pulse-soft shrink-0" />
          ) : call?.status === 'ended' ? (
            <Circle className="w-2.5 h-2.5 text-cp-text-muted fill-cp-text-muted shrink-0" />
          ) : (
            <Circle className="w-2.5 h-2.5 text-cp-text-muted shrink-0" />
          )}

          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-cp-text truncate">
              {call?.title || 'CallPilot Live'}
            </h1>
            {call && (
              <div className="flex items-center gap-3 text-[10px] text-cp-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {isActive ? formatDuration(elapsed) : call.endedAt ? formatDuration(call.endedAt - call.startedAt) : '—'}
                </span>
                <span>{chunkCount} chunks</span>
                <span>{markerCount} tags</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Call controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!call || call.status === 'ended' ? (
            <button
              onClick={onStartCall}
              className={cn(
                'cp-btn text-xs px-3 py-1.5',
                'bg-cp-success text-white hover:bg-cp-success/90',
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              Start Call
            </button>
          ) : isActive ? (
            <button
              onClick={onEndCall}
              className="cp-btn-danger text-xs px-3 py-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End Call
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
