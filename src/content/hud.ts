import type {
  TranscriptChunk,
  Insight,
  InsightCategory,
  Call,
  MarkerType,
  HudPrefs,
} from '@/shared/types';
import { MARKER_SHORTCUTS } from '@/shared/types';
import { getHudPrefs, saveHudPrefs } from '@/lib/settings';
import { formatTimestamp } from '@/lib/utils';

/**
 * The in-meeting heads-up display.
 *
 * Rendered into a shadow root so the meeting app's stylesheet can't reach it and
 * ours can't leak out. Everything here is vanilla DOM on purpose — this runs
 * inside someone else's page, where a React root is weight we don't need.
 */

const HOST_ID = 'callpilot-hud-root';
const EDGE_MARGIN = 8;
const STICK_THRESHOLD_PX = 32;
const MAX_LINES = 400;
const MAX_HIGHLIGHTS = 40;

const CATEGORY_COLOR: Record<InsightCategory, string> = {
  'pain-point': '#f87171',
  symptom: '#fdba74',
  'desired-outcome': '#4ade80',
  objection: '#fb923c',
  'current-tools': '#60a5fa',
  urgency: '#facc15',
  budget: '#34d399',
  authority: '#a78bfa',
  personal: '#f472b6',
  'follow-up': '#93c5fd',
  risk: '#fca5a5',
  'buying-signal': '#86efac',
};

/** Six buttons share the HUD's width, so they get shorter names than the side panel's. */
const SHORT_TAG_LABEL: Record<string, string> = {
  '1': 'Pain',
  '2': 'Object',
  '3': 'Action',
  '4': 'Signal',
  '5': 'Key',
  '6': 'Note',
};

const CATEGORY_LABEL: Record<InsightCategory, string> = {
  'pain-point': 'Pain',
  symptom: 'Symptom',
  'desired-outcome': 'Outcome',
  objection: 'Objection',
  'current-tools': 'Tools',
  urgency: 'Urgency',
  budget: 'Budget',
  authority: 'Authority',
  personal: 'Personal',
  'follow-up': 'Follow-up',
  risk: 'Risk',
  'buying-signal': 'Signal',
};

const STYLES = `
:host {
  position: fixed;
  z-index: 2147483000;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  color-scheme: dark;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

.hud {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 17, 23, 0.94);
  border: 1px solid #2a2e3b;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  color: #e4e5ea;
  font-size: 12px;
  line-height: 1.45;
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.hud.collapsed .body,
.hud.collapsed .tags,
.hud.collapsed .resize { display: none; }

.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(26, 29, 39, 0.9);
  border-bottom: 1px solid #2a2e3b;
  cursor: grab;
  user-select: none;
  flex: 0 0 auto;
}
.bar:active { cursor: grabbing; }

.dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #8b8fa3; flex: 0 0 auto;
}
.dot.live { background: #22c55e; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }

.title { font-size: 11px; font-weight: 600; letter-spacing: 0.01em; white-space: nowrap; }
.elapsed { font-size: 10px; color: #8b8fa3; font-variant-numeric: tabular-nums; }
.spacer { flex: 1 1 auto; }

.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  border: none; border-radius: 6px;
  background: transparent; color: #8b8fa3;
  cursor: pointer; font-size: 12px; line-height: 1;
  transition: background 0.12s, color 0.12s;
}
.icon-btn:hover { background: #222633; color: #e4e5ea; }
.icon-btn.on { color: #818cf8; background: rgba(99, 102, 241, 0.14); }
.icon-btn svg { width: 13px; height: 13px; display: block; }

.opacity-slider {
  width: 44px; height: 3px; margin: 0 2px;
  accent-color: #6366f1; cursor: pointer;
}

.body { flex: 1 1 auto; display: flex; flex-direction: column; min-height: 0; }

/* The pill anchors to the transcript, not the panel — it must never cover the
   highlights list sitting below it. */
.scroller { position: relative; flex: 1 1 auto; min-height: 0; display: flex; }

.transcript {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px 10px;
  scrollbar-width: thin;
  scrollbar-color: #2a2e3b transparent;
}
.transcript::-webkit-scrollbar { width: 6px; }
.transcript::-webkit-scrollbar-thumb { background: #2a2e3b; border-radius: 3px; }

.line { margin-bottom: 6px; }
.line-meta { display: flex; gap: 6px; align-items: baseline; }
.speaker { font-size: 10px; font-weight: 600; color: #818cf8; }
.time { font-size: 9px; color: #8b8fa3; font-variant-numeric: tabular-nums; }
.text { color: #e4e5ea; overflow-wrap: anywhere; }

.empty {
  height: 100%; display: flex; align-items: center; justify-content: center;
  text-align: center; color: #8b8fa3; font-size: 11px; padding: 0 16px;
}

.jump {
  position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
  display: none; align-items: center; gap: 5px;
  padding: 4px 10px; border: none; border-radius: 999px;
  background: #6366f1; color: #fff;
  font-family: inherit; font-size: 10px; font-weight: 600; white-space: nowrap;
  cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.45);
}
.jump.show { display: inline-flex; }
.jump:hover { background: #818cf8; }
.jump svg { width: 11px; height: 11px; flex: 0 0 auto; }

.highlights {
  flex: 0 0 auto;
  max-height: 42%;
  overflow-y: auto;
  border-top: 1px solid #2a2e3b;
  background: rgba(26, 29, 39, 0.6);
  padding: 6px 10px 8px;
  scrollbar-width: thin;
}
.highlights::-webkit-scrollbar { width: 6px; }
.highlights::-webkit-scrollbar-thumb { background: #2a2e3b; border-radius: 3px; }
.highlights.hidden { display: none; }

.hl-head {
  display: flex; align-items: center; gap: 5px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: #8b8fa3; margin-bottom: 5px;
}
.hl-count {
  background: rgba(99,102,241,0.16); color: #818cf8;
  border-radius: 999px; padding: 0 5px; font-size: 9px; letter-spacing: 0;
}
.hl-empty { font-size: 10px; color: #8b8fa3; font-style: italic; }

.hl {
  display: flex; gap: 6px; align-items: flex-start;
  padding: 3px 0; animation: rise 0.18s ease-out;
}
@keyframes rise { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
.hl-bullet { width: 5px; height: 5px; border-radius: 50%; margin-top: 6px; flex: 0 0 auto; }
.hl-body { min-width: 0; }
.hl-cat { font-size: 9px; font-weight: 700; letter-spacing: 0.03em; }
.hl-text { font-size: 11px; color: #e4e5ea; overflow-wrap: anywhere; }

.tags {
  flex: 0 0 auto;
  display: flex; gap: 3px; padding: 6px;
  border-top: 1px solid #2a2e3b; background: rgba(26, 29, 39, 0.9);
}
.tag {
  flex: 1 1 0; min-width: 0;
  padding: 4px 2px; border: 1px solid #2a2e3b; border-radius: 6px;
  background: transparent; color: #8b8fa3;
  font-family: inherit; font-size: 9px; font-weight: 600;
  cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: all 0.12s;
}
.tag:hover:not(:disabled) { color: #e4e5ea; border-color: #6366f1; }
.tag:disabled { opacity: 0.4; cursor: default; }
.tag .key { display: block; font-size: 8px; color: #8b8fa3; }
.tag.flash { background: #6366f1; color: #fff; border-color: #6366f1; }

.resize {
  position: absolute; right: 0; bottom: 0;
  width: 16px; height: 16px; cursor: nwse-resize;
}
.resize::after {
  content: ''; position: absolute; right: 3px; bottom: 3px;
  width: 6px; height: 6px;
  border-right: 2px solid #2a2e3b; border-bottom: 2px solid #2a2e3b;
}
`;

const ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  minus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
};

export interface HudCallbacks {
  onTag: (type: MarkerType, label: string) => void;
  onClose: () => void;
}

export interface HudHandle {
  addLine: (chunk: TranscriptChunk) => void;
  setInsights: (insights: Insight[]) => void;
  setCall: (call: Call | null) => void;
  destroy: () => void;
}

export async function mountHud(callbacks: HudCallbacks): Promise<HudHandle> {
  document.getElementById(HOST_ID)?.remove();

  const prefs = await getHudPrefs();

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = STYLES;
  shadow.append(style);

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="bar" part="bar">
      <span class="dot"></span>
      <span class="title">CallPilot</span>
      <span class="elapsed"></span>
      <span class="spacer"></span>
      <input class="opacity-slider" type="range" min="35" max="100" step="5" title="Opacity">
      <button class="icon-btn" data-act="camera" title="Snap to camera line">${ICONS.camera}</button>
      <button class="icon-btn" data-act="highlights" title="Toggle highlights">${ICONS.bulb}</button>
      <button class="icon-btn" data-act="collapse" title="Collapse">${ICONS.minus}</button>
      <button class="icon-btn" data-act="close" title="Hide HUD">${ICONS.close}</button>
    </div>
    <div class="body">
      <div class="scroller">
        <div class="transcript"><div class="empty">Waiting for captions…<br>Turn on captions in the meeting to start.</div></div>
        <button class="jump">${ICONS.down}<span class="jump-label">Jump to live</span></button>
      </div>
      <div class="highlights">
        <div class="hl-head">Highlights <span class="hl-count">0</span></div>
        <div class="hl-list"><div class="hl-empty">Nothing flagged yet.</div></div>
      </div>
    </div>
    <div class="tags"></div>
    <div class="resize"></div>
  `;
  shadow.append(hud);
  document.documentElement.append(host);

  // ─── Element handles ───

  const $ = <T extends Element>(sel: string) => shadow.querySelector(sel) as T;
  const bar = $<HTMLElement>('.bar');
  const dot = $<HTMLElement>('.dot');
  const elapsedEl = $<HTMLElement>('.elapsed');
  const transcript = $<HTMLElement>('.transcript');
  const jump = $<HTMLButtonElement>('.jump');
  const jumpLabel = $<HTMLElement>('.jump-label');
  const highlights = $<HTMLElement>('.highlights');
  const hlList = $<HTMLElement>('.hl-list');
  const hlCount = $<HTMLElement>('.hl-count');
  const tags = $<HTMLElement>('.tags');
  const resize = $<HTMLElement>('.resize');
  const slider = $<HTMLInputElement>('.opacity-slider');

  // ─── State ───

  let current: HudPrefs = prefs;
  let call: Call | null = null;
  let stickToBottom = true;
  let missed = 0;
  let lineCount = 0;
  let renderedInsightIds = new Set<string>();
  let elapsedTimer: ReturnType<typeof setInterval> | undefined;
  let savePending: ReturnType<typeof setTimeout> | undefined;

  // ─── Geometry ───

  function applyGeometry(): void {
    const width = clamp(current.width, 260, Math.max(260, window.innerWidth - EDGE_MARGIN * 2));
    const height = clamp(current.height, 180, Math.max(180, window.innerHeight - EDGE_MARGIN * 2));

    // A null position means "camera line" — centred at the top of the screen,
    // where the webcam sits, so reading the transcript keeps your eyes on lens.
    const x = current.x ?? (window.innerWidth - width) / 2;
    const y = current.y ?? EDGE_MARGIN + 4;

    host.style.left = `${clamp(x, EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN)}px`;
    host.style.top = `${clamp(y, EDGE_MARGIN, window.innerHeight - height - EDGE_MARGIN)}px`;
    host.style.width = `${width}px`;
    host.style.height = current.collapsed ? 'auto' : `${height}px`;
    host.style.opacity = String(current.opacity);
  }

  function patchPrefs(patch: Partial<HudPrefs>, persist = true): void {
    current = { ...current, ...patch };
    applyGeometry();
    if (!persist) return;
    clearTimeout(savePending);
    savePending = setTimeout(() => void saveHudPrefs(current), 250);
  }

  applyGeometry();
  slider.value = String(Math.round(current.opacity * 100));
  highlights.classList.toggle('hidden', !current.showHighlights);
  hud.classList.toggle('collapsed', current.collapsed);
  syncToggleButtons();

  // ─── Drag ───

  bar.addEventListener('pointerdown', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.icon-btn') || target.closest('.opacity-slider')) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originLeft = host.offsetLeft;
    const originTop = host.offsetTop;
    bar.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      patchPrefs(
        { x: originLeft + (ev.clientX - startX), y: originTop + (ev.clientY - startY) },
        false,
      );
    };
    const onUp = () => {
      bar.removeEventListener('pointermove', onMove);
      bar.removeEventListener('pointerup', onUp);
      void saveHudPrefs(current);
    };

    bar.addEventListener('pointermove', onMove);
    bar.addEventListener('pointerup', onUp);
  });

  // ─── Resize ───

  resize.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = host.offsetWidth;
    const startH = host.offsetHeight;
    resize.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      patchPrefs(
        { width: startW + (ev.clientX - startX), height: startH + (ev.clientY - startY) },
        false,
      );
      if (stickToBottom) transcript.scrollTop = transcript.scrollHeight;
    };
    const onUp = () => {
      resize.removeEventListener('pointermove', onMove);
      resize.removeEventListener('pointerup', onUp);
      void saveHudPrefs(current);
    };

    resize.addEventListener('pointermove', onMove);
    resize.addEventListener('pointerup', onUp);
  });

  window.addEventListener('resize', applyGeometry);

  // ─── Bar controls ───

  bar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.icon-btn') as HTMLElement | null;
    if (!btn) return;

    switch (btn.dataset.act) {
      case 'camera':
        patchPrefs({ x: null, y: null });
        break;
      case 'highlights':
        patchPrefs({ showHighlights: !current.showHighlights });
        highlights.classList.toggle('hidden', !current.showHighlights);
        repin();
        break;
      case 'collapse':
        patchPrefs({ collapsed: !current.collapsed });
        hud.classList.toggle('collapsed', current.collapsed);
        btn.innerHTML = current.collapsed ? ICONS.plus : ICONS.minus;
        repin();
        break;
      case 'close':
        callbacks.onClose();
        break;
    }
    syncToggleButtons();
  });

  slider.addEventListener('input', () => {
    patchPrefs({ opacity: Number(slider.value) / 100 });
  });

  function syncToggleButtons(): void {
    shadow.querySelector('[data-act="highlights"]')?.classList.toggle('on', current.showHighlights);
  }

  // ─── Transcript scroll tracking ───

  transcript.addEventListener('scroll', () => {
    const atBottom =
      transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight <=
      STICK_THRESHOLD_PX;

    if (atBottom && !stickToBottom) {
      stickToBottom = true;
      missed = 0;
      jump.classList.remove('show');
    } else if (!atBottom && stickToBottom) {
      stickToBottom = false;
    }
  });

  jump.addEventListener('click', () => {
    stickToBottom = true;
    missed = 0;
    jump.classList.remove('show');
    transcript.scrollTop = transcript.scrollHeight;
  });

  /**
   * Anything that changes the transcript's height — a highlight landing, the
   * panel collapsing — steals its bottom pin. Put it back.
   */
  function repin(): void {
    if (stickToBottom) transcript.scrollTop = transcript.scrollHeight;
  }

  // ─── Tag bar ───

  for (const [key, def] of Object.entries(MARKER_SHORTCUTS)) {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.dataset.key = key;
    btn.disabled = true;
    btn.title = `${def.label} (press ${key})`;

    const keyEl = document.createElement('span');
    keyEl.className = 'key';
    keyEl.textContent = key;
    btn.append(keyEl, document.createTextNode(SHORT_TAG_LABEL[key] ?? def.label));

    btn.addEventListener('click', () => fireTag(key));
    tags.append(btn);
  }

  function fireTag(key: string): void {
    const def = MARKER_SHORTCUTS[key];
    if (!def || call?.status !== 'active') return;

    callbacks.onTag(def.type, def.label);

    const btn = shadow.querySelector(`.tag[data-key="${key}"]`);
    btn?.classList.add('flash');
    setTimeout(() => btn?.classList.remove('flash'), 220);
  }

  // ─── Hotkeys ───
  // Capture phase so the meeting app doesn't get there first, but never while
  // the user is typing — meeting chat and search boxes must keep their keys.

  const onKeyDown = (e: KeyboardEvent) => {
    if (call?.status !== 'active') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;

    const key = e.key === 'm' || e.key === 'M' ? '6' : e.key;
    if (!MARKER_SHORTCUTS[key]) return;

    e.preventDefault();
    e.stopPropagation();
    fireTag(key);
  };
  window.addEventListener('keydown', onKeyDown, true);

  // ─── Public surface ───

  function addLine(chunk: TranscriptChunk): void {
    shadow.querySelector('.empty')?.remove();

    const line = document.createElement('div');
    line.className = 'line';

    const meta = document.createElement('div');
    meta.className = 'line-meta';
    const speaker = document.createElement('span');
    speaker.className = 'speaker';
    speaker.textContent = chunk.speaker;
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatTimestamp(chunk.timestamp);
    meta.append(speaker, time);

    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = chunk.text;

    line.append(meta, text);
    transcript.append(line);

    if (++lineCount > MAX_LINES) {
      transcript.firstElementChild?.remove();
      lineCount--;
    }

    if (stickToBottom) {
      transcript.scrollTop = transcript.scrollHeight;
    } else {
      missed++;
      jumpLabel.textContent = `${missed} new line${missed === 1 ? '' : 's'}`;
      jump.classList.add('show');
    }
  }

  function setInsights(insights: Insight[]): void {
    const incoming = insights.slice(-MAX_HIGHLIGHTS);
    const incomingIds = new Set(incoming.map((i) => i.id));

    // Nothing changed — leave the DOM (and its animations) alone.
    const unchanged =
      incomingIds.size === renderedInsightIds.size &&
      [...incomingIds].every((id) => renderedInsightIds.has(id));
    if (unchanged) return;

    renderedInsightIds = incomingIds;
    hlCount.textContent = String(insights.length);
    hlList.replaceChildren();

    if (incoming.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hl-empty';
      empty.textContent = 'Nothing flagged yet.';
      hlList.append(empty);
      return;
    }

    for (const insight of [...incoming].reverse()) {
      const color = CATEGORY_COLOR[insight.category] ?? '#8b8fa3';

      const row = document.createElement('div');
      row.className = 'hl';

      const bullet = document.createElement('span');
      bullet.className = 'hl-bullet';
      bullet.style.background = color;

      const body = document.createElement('div');
      body.className = 'hl-body';

      const cat = document.createElement('div');
      cat.className = 'hl-cat';
      cat.style.color = color;
      cat.textContent = CATEGORY_LABEL[insight.category] ?? insight.category;

      const text = document.createElement('div');
      text.className = 'hl-text';
      text.textContent = insight.text;

      body.append(cat, text);
      row.append(bullet, body);
      hlList.append(row);
    }

    repin();
  }

  function setCall(next: Call | null): void {
    call = next;
    const active = next?.status === 'active';

    dot.classList.toggle('live', active);
    shadow.querySelectorAll<HTMLButtonElement>('.tag').forEach((b) => {
      b.disabled = !active;
    });

    clearInterval(elapsedTimer);
    if (active && next) {
      const tick = () => {
        elapsedEl.textContent = formatTimestamp(Date.now() - next.startedAt);
      };
      tick();
      elapsedTimer = setInterval(tick, 1000);
    } else {
      elapsedEl.textContent = '';
    }
  }

  function destroy(): void {
    clearInterval(elapsedTimer);
    clearTimeout(savePending);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('resize', applyGeometry);
    host.remove();
  }

  return { addLine, setInsights, setCall, destroy };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isTypingTarget(node: EventTarget | Element | null): boolean {
  const el = node as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  if (el.isContentEditable) return true;

  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
