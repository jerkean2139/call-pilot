import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Framework, FrameworkChunk } from '@/shared/types';
import { generateId } from '@/lib/utils';
import * as storage from '@/lib/storage';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function FrameworkUpload() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storage.getAllFrameworks().then(setFrameworks);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setError(null);

    try {
      const text = await file.text();

      // Simple chunking: split by double newlines or every ~500 chars
      const rawChunks = chunkText(text, 500);
      const frameworkId = generateId();

      const chunks: FrameworkChunk[] = rawChunks.map((text, i) => ({
        id: `${frameworkId}-chunk-${i}`,
        frameworkId,
        text,
      }));

      const framework: Framework = {
        id: frameworkId,
        name: file.name,
        type: inferFrameworkType(file.name),
        chunks,
        uploadedAt: Date.now(),
      };

      await storage.saveFramework(framework);
      setFrameworks((prev) => [...prev, framework]);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setError('Failed to process file');
      setStatus('error');
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    await storage.deleteFramework(id);
    setFrameworks((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Upload area */}
      <div>
        <h3 className="text-xs font-medium text-cp-text-muted uppercase tracking-wider mb-2">
          Upload Framework Documents
        </h3>
        <p className="text-[10px] text-cp-text-muted mb-3">
          Upload pitch decks, discovery frameworks, or objection guides. These will be used
          as context during AI extraction.
        </p>

        <label
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6',
            'border-2 border-dashed border-cp-border rounded-lg',
            'hover:border-cp-accent hover:bg-cp-accent/5 transition-colors cursor-pointer',
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          {status === 'uploading' ? (
            <Loader2 className="w-6 h-6 text-cp-accent animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-6 h-6 text-cp-success" />
          ) : status === 'error' ? (
            <AlertCircle className="w-6 h-6 text-cp-danger" />
          ) : (
            <Upload className="w-6 h-6 text-cp-text-muted" />
          )}
          <span className="text-xs text-cp-text-muted">
            {status === 'uploading'
              ? 'Processing...'
              : status === 'success'
                ? 'Uploaded!'
                : status === 'error'
                  ? error || 'Upload failed'
                  : 'Click to upload .txt, .md, or .pdf'}
          </span>
        </label>
      </div>

      {/* Uploaded documents */}
      {frameworks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-cp-text-muted uppercase tracking-wider mb-2">
            Uploaded Documents ({frameworks.length})
          </h3>
          <div className="space-y-1.5">
            {frameworks.map((fw) => (
              <div
                key={fw.id}
                className="cp-card flex items-center gap-2 px-3 py-2"
              >
                <FileText className="w-4 h-4 text-cp-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cp-text font-medium truncate">{fw.name}</p>
                  <p className="text-[10px] text-cp-text-muted">
                    {fw.chunks.length} chunks &middot; {fw.type.replace('-', ' ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(fw.id)}
                  className="cp-btn-ghost p-1 text-cp-text-muted hover:text-cp-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {frameworks.length === 0 && status === 'idle' && (
        <div className="text-center py-4">
          <p className="text-cp-text-muted text-xs">
            No documents uploaded yet. Upload your sales frameworks
            for AI-enhanced extraction.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───

function chunkText(text: string, maxChunkSize: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = '';
    }
    current += para + '\n\n';
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function inferFrameworkType(filename: string): Framework['type'] {
  const lower = filename.toLowerCase();
  if (lower.includes('pitch') || lower.includes('deck')) return 'pitch-deck';
  if (lower.includes('discovery') || lower.includes('framework')) return 'discovery-framework';
  if (lower.includes('objection')) return 'objection-guide';
  return 'other';
}
