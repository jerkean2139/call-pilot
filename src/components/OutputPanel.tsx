import { useState } from 'react';
import {
  FileText,
  List,
  Mail,
  Database,
  Copy,
  Download,
  Check,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import type {
  CallOutput,
  TranscriptChunk,
  Marker,
  Insight,
  OutputResult,
} from '@/shared/types';
import { cn, copyToClipboard, downloadFile, formatTimestamp } from '@/lib/utils';

interface OutputPanelProps {
  outputs: CallOutput[];
  chunks: TranscriptChunk[];
  markers: Marker[];
  insights: Insight[];
  isActive: boolean;
  onGenerateOutput: (type: CallOutput['type']) => Promise<OutputResult>;
}

interface Notice {
  type: CallOutput['type'];
  kind: 'warn' | 'error';
  text: string;
}

const OUTPUT_TYPES: { type: CallOutput['type']; label: string; icon: typeof FileText }[] = [
  { type: 'executive-summary', label: 'Executive Summary', icon: FileText },
  { type: 'categorized-notes', label: 'Categorized Notes', icon: List },
  { type: 'follow-up-email', label: 'Follow-up Email', icon: Mail },
  { type: 'crm-note', label: 'CRM Note Block', icon: Database },
];

export function OutputPanel({
  outputs,
  chunks,
  markers,
  insights,
  isActive,
  onGenerateOutput,
}: OutputPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleCopy = async (output: CallOutput) => {
    await copyToClipboard(output.content);
    setCopiedId(output.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (output: CallOutput) => {
    const ext = output.type === 'crm-note' ? 'json' : 'md';
    downloadFile(output.content, `callpilot-${output.type}.${ext}`);
  };

  const handleGenerate = async (type: CallOutput['type']) => {
    setGenerating(type);
    setNotice(null);

    try {
      const { fallbackReason } = await onGenerateOutput(type);
      if (fallbackReason) {
        setNotice({
          type,
          kind: 'warn',
          text: `Assembled from the local template — ${fallbackReason}.`,
        });
      }
    } catch (err) {
      setNotice({
        type,
        kind: 'error',
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setGenerating(null);
    }
  };

  // Quick export: raw transcript + markers
  const handleExportRaw = () => {
    let md = '# Call Transcript\n\n';
    for (const chunk of chunks) {
      const marker = markers.find((m) => m.chunkId === chunk.id);
      const tag = marker ? ` **[${marker.label}]**` : '';
      md += `**${formatTimestamp(chunk.timestamp)}** — _${chunk.speaker}_: ${chunk.text}${tag}\n\n`;
    }

    if (markers.length > 0) {
      md += '\n---\n\n# Markers\n\n';
      for (const m of markers) {
        md += `- **${formatTimestamp(m.timestamp)}** [${m.label}]${m.note ? ` — ${m.note}` : ''}\n`;
      }
    }

    downloadFile(md, `callpilot-transcript-${Date.now()}.md`);
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      chunks: chunks.map((c) => ({
        timestamp: c.timestamp,
        speaker: c.speaker,
        text: c.text,
      })),
      markers: markers.map((m) => ({
        timestamp: m.timestamp,
        type: m.type,
        label: m.label,
        note: m.note,
      })),
      insights: insights.map((i) => ({
        category: i.category,
        text: i.text,
        confidence: i.confidence,
        source: i.source,
        evidenceQuote: i.evidenceQuote,
      })),
    };
    downloadFile(JSON.stringify(data, null, 2), `callpilot-export-${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Quick Export */}
      <div>
        <h3 className="text-xs font-medium text-cp-text-muted uppercase tracking-wider mb-2">
          Quick Export
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportRaw}
            disabled={chunks.length === 0}
            className="cp-btn-ghost text-xs flex-1 justify-center disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Markdown
          </button>
          <button
            onClick={handleExportJSON}
            disabled={chunks.length === 0}
            className="cp-btn-ghost text-xs flex-1 justify-center disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* AI-Generated Outputs */}
      <div>
        <h3 className="text-xs font-medium text-cp-text-muted uppercase tracking-wider mb-2">
          AI-Generated Outputs
        </h3>
        <div className="space-y-2">
          {OUTPUT_TYPES.map(({ type, label, icon: Icon }) => {
            const existing = outputs.find((o) => o.type === type);
            const isGenerating = generating === type;

            return (
              <div key={type} className="cp-card">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Icon className="w-4 h-4 text-cp-text-muted shrink-0" />
                  <span className="text-xs font-medium text-cp-text flex-1">{label}</span>

                  {existing ? (
                    <div className="flex items-center gap-1">
                      {existing.generatedBy === 'local' && (
                        <span
                          className="cp-badge bg-cp-warning/15 text-cp-warning px-1.5 py-0 text-[9px]"
                          title="Written from the local template, not by the model"
                        >
                          local
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(existing)}
                        className="cp-btn-ghost p-1"
                        title="Copy"
                      >
                        {copiedId === existing.id ? (
                          <Check className="w-3.5 h-3.5 text-cp-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(existing)}
                        className="cp-btn-ghost p-1"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleGenerate(type)}
                        disabled={isActive || isGenerating}
                        className="cp-btn-ghost p-1 disabled:opacity-40"
                        title="Rewrite"
                      >
                        <RefreshCw
                          className={cn('w-3.5 h-3.5', isGenerating && 'animate-spin')}
                        />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerate(type)}
                      disabled={isActive || chunks.length === 0 || isGenerating}
                      className="cp-btn-primary text-[10px] px-2 py-0.5 disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Generate'
                      )}
                    </button>
                  )}
                </div>

                {notice?.type === type && (
                  <div
                    className={cn(
                      'flex items-start gap-1.5 px-3 py-1.5 text-[10px] leading-relaxed border-t border-cp-border',
                      notice.kind === 'error'
                        ? 'text-cp-danger bg-cp-danger/10'
                        : 'text-cp-warning bg-cp-warning/10',
                    )}
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{notice.text}</span>
                  </div>
                )}

                {existing && (
                  <div className="px-3 pb-2 border-t border-cp-border">
                    <pre className="text-xs text-cp-text whitespace-pre-wrap leading-relaxed mt-2 max-h-48 overflow-y-auto">
                      {existing.content}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Placeholder for no-call state */}
      {chunks.length === 0 && (
        <div className="text-center py-6">
          <p className="text-cp-text-muted text-xs">
            Complete a call to generate outputs
          </p>
        </div>
      )}
    </div>
  );
}
