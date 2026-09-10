import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { Settings, ExtractionStatus } from '@/shared/types';
import { getSettings, saveSettings } from '@/lib/settings';
import { AVAILABLE_MODELS } from '@/shared/constants';
import { sendMessage } from '@/shared/messaging';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  status: ExtractionStatus | null;
}

export function SettingsPanel({ status }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = async (patch: Partial<Settings>) => {
    const next = await saveSettings(patch);
    setSettings(next);
    sendMessage('SETTINGS_CHANGED', next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-cp-text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      <section className="space-y-1.5">
        <label className="block text-xs font-medium text-cp-text">
          Anthropic API key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            onBlur={(e) => update({ apiKey: e.target.value.trim() })}
            placeholder="sk-ant-..."
            spellCheck={false}
            className="cp-input w-full pr-8 text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-cp-text-muted hover:text-cp-text"
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-[10px] text-cp-text-muted leading-relaxed">
          Stored unencrypted in this browser profile and sent only to
          api.anthropic.com. Anyone with access to this profile can read it — use a
          key scoped to this tool, and revoke it if the machine is shared.
        </p>
      </section>

      <section className="space-y-1.5">
        <label className="block text-xs font-medium text-cp-text">Model</label>
        <select
          value={settings.model}
          onChange={(e) => update({ model: e.target.value })}
          className="cp-input w-full text-xs"
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-1.5">
        <label className="block text-xs font-medium text-cp-text">
          Extraction depth
        </label>
        <div className="flex gap-1">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => update({ effort: level })}
              className={cn(
                'flex-1 py-1.5 text-[11px] rounded-md border capitalize transition-colors',
                settings.effort === level
                  ? 'border-cp-accent text-cp-accent bg-cp-accent/10'
                  : 'border-cp-border text-cp-text-muted hover:text-cp-text',
              )}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-cp-text-muted">
          Higher depth catches subtler signals but takes longer per pass.
        </p>
      </section>

      <section className="space-y-2">
        <Toggle
          label="Live insight extraction"
          hint="Analyses the transcript every 20 seconds during a call."
          checked={settings.extractionEnabled}
          onChange={(v) => update({ extractionEnabled: v })}
        />
        <Toggle
          label="In-meeting HUD"
          hint="Floating transcript and highlights over the meeting tab."
          checked={settings.hudEnabled}
          onChange={(v) => update({ hudEnabled: v })}
        />
      </section>

      {status && <StatusRow status={status} />}

      {saved && (
        <p className="flex items-center gap-1 text-[10px] text-cp-success">
          <Check className="w-3 h-3" /> Saved
        </p>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-2 text-left"
    >
      <span
        className={cn(
          'mt-0.5 w-8 h-4.5 rounded-full shrink-0 transition-colors relative',
          checked ? 'bg-cp-accent' : 'bg-cp-surface-hover',
        )}
        style={{ height: '18px', width: '32px' }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform"
          style={{ transform: `translateX(${checked ? 16 : 2}px)` }}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-cp-text">{label}</span>
        <span className="block text-[10px] text-cp-text-muted">{hint}</span>
      </span>
    </button>
  );
}

function StatusRow({ status }: { status: ExtractionStatus }) {
  return (
    <div className="cp-card px-3 py-2 space-y-1">
      <div className="flex items-center gap-1.5 text-[11px]">
        {status.phase === 'running' ? (
          <>
            <Loader2 className="w-3 h-3 text-cp-accent animate-spin" />
            <span className="text-cp-text">Extracting…</span>
          </>
        ) : status.phase === 'error' ? (
          <>
            <AlertTriangle className="w-3 h-3 text-cp-warning" />
            <span className="text-cp-warning">Extraction problem</span>
          </>
        ) : status.phase === 'disabled' ? (
          <span className="text-cp-text-muted">Extraction off</span>
        ) : (
          <>
            <Check className="w-3 h-3 text-cp-success" />
            <span className="text-cp-text-muted">
              {status.insightCount} insight{status.insightCount === 1 ? '' : 's'} this call
            </span>
          </>
        )}
      </div>
      {status.lastError && (
        <p className="text-[10px] text-cp-text-muted leading-relaxed">
          {status.lastError}
        </p>
      )}
    </div>
  );
}
