import { useState, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CallHeader } from '@/components/CallHeader';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { TagBar } from '@/components/TagBar';
import { MarkersList } from '@/components/MarkersList';
import { InsightsPanel } from '@/components/InsightsPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { FrameworkUpload } from '@/components/FrameworkUpload';
import { generateLocalOutput } from '@/lib/outputGenerator';
import type { ViewTab } from '@/shared/types';
import type { MarkerType, CallOutput } from '@/shared/types';
import { cn } from '@/lib/utils';
import {
  MessageSquareText,
  Lightbulb,
  FileOutput,
  Upload,
} from 'lucide-react';

const TABS: { id: ViewTab | 'upload'; label: string; icon: typeof MessageSquareText }[] = [
  { id: 'transcript', label: 'Transcript', icon: MessageSquareText },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'output', label: 'Output', icon: FileOutput },
  { id: 'upload', label: 'Docs', icon: Upload },
];

export default function App() {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<ViewTab | 'upload'>('transcript');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleMarkerShortcut = useCallback(
    (type: MarkerType, label: string) => {
      session.addMarker(type, label);
    },
    [session],
  );

  const handleCustomMarker = useCallback(() => {
    setShowNoteInput(true);
  }, []);

  useKeyboardShortcuts({
    onMarker: handleMarkerShortcut,
    onCustomMarker: handleCustomMarker,
    enabled: session.isActive,
  });

  const handleStartCall = () => {
    const title = `Call ${new Date().toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    session.startCall(title);
  };

  const handleGenerateOutput = (type: CallOutput['type']) => {
    const content = generateLocalOutput(
      type,
      session.chunks,
      session.markers,
      session.insights,
    );
    session.addOutput(type, content);
  };

  return (
    <div className="h-screen flex flex-col bg-cp-bg">
      {/* Call Header */}
      <CallHeader
        call={session.call}
        chunkCount={session.chunks.length}
        markerCount={session.markers.length}
        onStartCall={handleStartCall}
        onEndCall={session.endCall}
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-cp-border bg-cp-surface">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                'border-b-2',
                isActive
                  ? 'border-cp-accent text-cp-accent'
                  : 'border-transparent text-cp-text-muted hover:text-cp-text',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'transcript' && (
          <>
            <TranscriptPanel
              chunks={session.chunks}
              markers={session.markers}
              isActive={session.isActive}
            />
            <MarkersList markers={session.markers} onDelete={session.removeMarker} />
            <TagBar
              onTag={(type, label, note) => session.addMarker(type, label, note)}
              disabled={!session.isActive}
            />
          </>
        )}

        {activeTab === 'insights' && (
          <InsightsPanel insights={session.insights} />
        )}

        {activeTab === 'output' && (
          <OutputPanel
            outputs={session.outputs}
            chunks={session.chunks}
            markers={session.markers}
            insights={session.insights}
            isActive={session.isActive}
            onGenerateOutput={handleGenerateOutput}
          />
        )}

        {activeTab === 'upload' && <FrameworkUpload />}
      </div>
    </div>
  );
}
