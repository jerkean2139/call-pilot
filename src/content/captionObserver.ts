/**
 * Keeps a MutationObserver pointed at the meeting app's caption panel.
 *
 * Two things make this less trivial than it sounds. Meeting apps re-render, so
 * the panel we attached to gets torn out of the document and replaced by an
 * identical-looking one — the observer stays alive, watching a detached node,
 * and captions silently stop arriving. And the page mutates constantly, so the
 * "has it appeared yet?" check runs very often and must be cheap when the
 * answer is "still attached".
 *
 * Deliberately free of chrome APIs so it can be driven in a test.
 */

export type SyncOutcome =
  | 'unchanged' // still watching the same live panel
  | 'attached' // found a panel for the first time
  | 'reattached' // the panel we were watching was replaced
  | 'not-found'; // no panel in the document

export interface SyncResult {
  outcome: SyncOutcome;
  /** An observer is attached to a panel that is in the document. */
  attached: boolean;
}

export class CaptionAttacher {
  private container: Element | null = null;
  private observer: MutationObserver | null = null;

  constructor(
    private readonly findContainer: () => Element | null,
    private readonly onNode: (node: HTMLElement) => void,
  ) {}

  get attached(): boolean {
    return !!this.container?.isConnected;
  }

  /** Idempotent: cheap no-op while the current panel is still in the document. */
  sync(): SyncResult {
    if (this.attached) return { outcome: 'unchanged', attached: true };

    const stale = this.container !== null;
    this.container = null;

    const next = this.findContainer();
    if (!next) return { outcome: 'not-found', attached: false };

    this.observer?.disconnect();
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) this.onNode(node);
        }
        // Captions are usually rewritten in place as the speaker talks, which
        // shows up as characterData rather than a new node.
        if (mutation.type === 'characterData' && mutation.target.parentElement) {
          this.onNode(mutation.target.parentElement);
        }
      }
    });
    this.observer.observe(next, { childList: true, subtree: true, characterData: true });
    this.container = next;

    return { outcome: stale ? 'reattached' : 'attached', attached: true };
  }

  disconnect(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.container = null;
  }
}
