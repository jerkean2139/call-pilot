import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaptionAttacher } from './captionObserver';

// MutationObserver batches into a microtask; let it flush.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function addPanel(id = 'panel'): HTMLElement {
  const panel = document.createElement('div');
  panel.id = id;
  panel.className = 'captions';
  document.body.append(panel);
  return panel;
}

describe('CaptionAttacher', () => {
  let onNode: ReturnType<typeof vi.fn>;
  let attacher: CaptionAttacher;

  beforeEach(() => {
    document.body.innerHTML = '';
    onNode = vi.fn();
    attacher = new CaptionAttacher(() => document.querySelector('.captions'), onNode);
  });

  it('reports not-found until the panel exists', () => {
    expect(attacher.sync()).toEqual({ outcome: 'not-found', attached: false });
    expect(attacher.attached).toBe(false);
  });

  it('attaches once the panel appears', () => {
    addPanel();
    expect(attacher.sync()).toEqual({ outcome: 'attached', attached: true });
    expect(attacher.attached).toBe(true);
  });

  it('is a no-op while the same panel is still in the document', () => {
    addPanel();
    attacher.sync();

    // The body observer calls this on every mutation the meeting app makes.
    expect(attacher.sync().outcome).toBe('unchanged');
    expect(attacher.sync().outcome).toBe('unchanged');
  });

  it('forwards nodes added to the panel', async () => {
    const panel = addPanel();
    attacher.sync();

    const line = document.createElement('div');
    line.textContent = 'we route everything through a shared inbox';
    panel.append(line);
    await flush();

    expect(onNode).toHaveBeenCalledWith(line);
  });

  it('forwards in-place text rewrites, which is how captions usually update', async () => {
    const panel = addPanel();
    const line = document.createElement('div');
    line.textContent = 'we route everything';
    panel.append(line);
    attacher.sync();

    line.firstChild!.textContent = 'we route everything through a shared inbox';
    await flush();

    expect(onNode).toHaveBeenCalledWith(line);
  });

  // The bug this class exists for: a re-render swaps the panel, the old
  // observer keeps watching a detached node, and captions stop arriving with
  // no error anywhere.
  it('notices when the panel is torn out and attaches to its replacement', () => {
    const first = addPanel('first');
    expect(attacher.sync().outcome).toBe('attached');

    first.remove();
    expect(attacher.attached).toBe(false);

    addPanel('second');
    expect(attacher.sync()).toEqual({ outcome: 'reattached', attached: true });
  });

  it('delivers captions from the replacement panel', async () => {
    addPanel('first').remove();
    attacher.sync();

    const second = addPanel('second');
    attacher.sync();

    const line = document.createElement('div');
    line.textContent = 'five, and we lost two escalations';
    second.append(line);
    await flush();

    expect(onNode).toHaveBeenCalledWith(line);
  });

  it('goes back to not-found when the panel disappears with no replacement', () => {
    const panel = addPanel();
    attacher.sync();

    panel.remove();
    expect(attacher.sync()).toEqual({ outcome: 'not-found', attached: false });
  });

  it('stops delivering after disconnect', async () => {
    const panel = addPanel();
    attacher.sync();
    attacher.disconnect();

    panel.append(document.createElement('div'));
    await flush();

    expect(onNode).not.toHaveBeenCalled();
    expect(attacher.attached).toBe(false);
  });
});
