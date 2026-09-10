import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Insight, TranscriptChunk, Settings } from '@/shared/types';

const parse = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { parse };
  },
}));

const { extractInsights, mergeInsights } = await import('./insightExtractor');

const SETTINGS: Settings = {
  apiKey: 'sk-ant-test',
  model: 'claude-opus-5',
  effort: 'low',
  extractionEnabled: true,
  hudEnabled: true,
};

function chunk(id: string, speaker: string, text: string, timestamp = 0): TranscriptChunk {
  return { id, callId: 'call-1', speaker, text, timestamp, createdAt: 0 };
}

function insight(over: Partial<Insight> = {}): Insight {
  return {
    id: 'i1',
    callId: 'call-1',
    category: 'pain-point',
    text: 'Shared inbox has no ownership',
    confidence: 0.9,
    evidenceChunkIds: [],
    source: 'direct',
    createdAt: 1,
    updatedAt: 1,
    ...over,
  };
}

function reply(insights: unknown[]) {
  return { stop_reason: 'end_turn', parsed_output: { insights } };
}

describe('extractInsights', () => {
  beforeEach(() => parse.mockReset());

  const chunks = [
    chunk('c1', 'Dana', 'we route everything through a shared inbox', 1000),
    chunk('c2', 'You', 'how many people work out of it?', 2000),
    chunk('c3', 'Dana', 'five, and we lost two escalations this quarter', 3000),
  ];

  it('marks only the new lines and leaves the rest as context', async () => {
    parse.mockResolvedValue(reply([]));

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [],
      frameworks: [],
      settings: SETTINGS,
    });

    const prompt = parse.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toContain('NEW [0:03] Dana: five, and we lost two escalations');
    expect(prompt).not.toContain('NEW [0:01]');
    expect(prompt).toContain('[0:01] Dana: we route everything');
  });

  it('caches the system prompt so the resent prefix is not re-billed', async () => {
    parse.mockResolvedValue(reply([]));

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [],
      frameworks: [],
      settings: SETTINGS,
    });

    const [system] = parse.mock.calls[0][0].system;
    expect(system.cache_control).toEqual({ type: 'ephemeral' });
  });

  it('gives known insights stable refs the model can point at', async () => {
    parse.mockResolvedValue(reply([]));

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [insight({ id: 'abc', text: 'Budget is a concern' })],
      frameworks: [],
      settings: SETTINGS,
    });

    const prompt = parse.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toContain('K1 [pain-point] Budget is a concern');
  });

  it('drops low-confidence and empty insights', async () => {
    parse.mockResolvedValue(
      reply([
        { category: 'pain-point', text: 'Real finding', confidence: 0.8, source: 'direct', evidence_quote: 'we lost two escalations', replaces: '' },
        { category: 'risk', text: 'Shaky guess', confidence: 0.2, source: 'inferred', evidence_quote: '', replaces: '' },
        { category: 'budget', text: '   ', confidence: 0.9, source: 'direct', evidence_quote: '', replaces: '' },
      ]),
    );

    const result = await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [],
      frameworks: [],
      settings: SETTINGS,
    });

    expect(result.map((i) => i.text)).toEqual(['Real finding']);
    expect(result[0].evidenceQuote).toBe('we lost two escalations');
  });

  it('resolves a replaces ref back to the real insight id', async () => {
    parse.mockResolvedValue(
      reply([
        { category: 'budget', text: 'Lost a $40k renewal', confidence: 0.9, source: 'direct', evidence_quote: 'forty thousand', replaces: 'K1' },
      ]),
    );

    const result = await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [insight({ id: 'known-id', category: 'budget', text: 'Budget is a concern' })],
      frameworks: [],
      settings: SETTINGS,
    });

    expect(result[0].replacesId).toBe('known-id');
  });

  it('omits effort for Haiku, which rejects it', async () => {
    parse.mockResolvedValue(reply([]));

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [],
      frameworks: [],
      settings: { ...SETTINGS, model: 'claude-haiku-4-5' },
    });

    expect(parse.mock.calls[0][0].output_config).not.toHaveProperty('effort');

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      knownInsights: [],
      frameworks: [],
      settings: SETTINGS,
    });

    expect(parse.mock.calls[1][0].output_config.effort).toBe('low');
  });

  it('feeds framework docs in as context, not as quotable evidence', async () => {
    parse.mockResolvedValue(reply([]));

    await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: ['c3'],
      frameworks: [
        {
          id: 'f1',
          name: 'MEDDIC sheet',
          type: 'discovery-framework',
          uploadedAt: 0,
          chunks: [{ id: 'fc1', frameworkId: 'f1', text: 'Identify the economic buyer early.' }],
        },
      ],
      knownInsights: [],
      settings: SETTINGS,
    });

    const system = parse.mock.calls[0][0].system[0].text as string;
    expect(system).toContain('MEDDIC sheet');
    expect(system).toContain('Identify the economic buyer early.');
    expect(system).toContain('evidence only ever comes from the transcript');
  });

  it('does not call the API when there is nothing new', async () => {
    const result = await extractInsights({
      callId: 'call-1',
      chunks,
      newChunkIds: [],
      knownInsights: [],
      frameworks: [],
      settings: SETTINGS,
    });

    expect(result).toEqual([]);
    expect(parse).not.toHaveBeenCalled();
  });

  it('refuses to run without an API key', async () => {
    await expect(
      extractInsights({
        callId: 'call-1',
        chunks,
        newChunkIds: ['c3'],
        knownInsights: [],
        frameworks: [],
        settings: { ...SETTINGS, apiKey: '' },
      }),
    ).rejects.toThrow(/API key/i);
  });

  it('surfaces a refusal rather than treating it as an empty result', async () => {
    parse.mockResolvedValue({ stop_reason: 'refusal', parsed_output: null });

    await expect(
      extractInsights({
        callId: 'call-1',
        chunks,
        newChunkIds: ['c3'],
        knownInsights: [],
        frameworks: [],
        settings: SETTINGS,
      }),
    ).rejects.toThrow(/declined/i);
  });
});

describe('mergeInsights', () => {
  it('appends insights that replace nothing', () => {
    const existing = [insight({ id: 'a' })];
    const merged = mergeInsights(existing, [insight({ id: 'b', text: 'New one' })]);

    expect(merged.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('replaces in place, keeping the original id and creation time', () => {
    const existing = [insight({ id: 'a', text: 'Budget is a concern', createdAt: 100 })];
    const merged = mergeInsights(existing, [
      { ...insight({ id: 'fresh', text: 'Lost a $40k renewal' }), replacesId: 'a' },
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('a');
    expect(merged[0].text).toBe('Lost a $40k renewal');
    expect(merged[0].createdAt).toBe(100);
    expect(merged[0].updatedAt).toBeGreaterThanOrEqual(100);
  });

  it('appends when the replaced insight is already gone', () => {
    const merged = mergeInsights(
      [insight({ id: 'a' })],
      [{ ...insight({ id: 'b', text: 'Orphan' }), replacesId: 'deleted' }],
    );

    expect(merged.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('never leaks the internal replacesId into stored state', () => {
    const merged = mergeInsights([], [{ ...insight({ id: 'b' }), replacesId: 'x' }]);

    expect(merged[0]).not.toHaveProperty('replacesId');
  });
});
