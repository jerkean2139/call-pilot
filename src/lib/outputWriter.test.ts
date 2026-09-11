import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  Call,
  TranscriptChunk,
  Marker,
  Insight,
  Framework,
  Settings,
  CallOutput,
} from '@/shared/types';

const create = vi.fn();
const parse = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create, parse };
  },
}));

const { writeOutput } = await import('./outputWriter');

const SETTINGS: Settings = {
  apiKey: 'sk-ant-test',
  model: 'claude-opus-5',
  effort: 'low',
  extractionEnabled: true,
  hudEnabled: true,
};

const CALL: Call = {
  id: 'call-1',
  title: 'Discovery — Northwind',
  startedAt: Date.UTC(2026, 0, 14, 15, 0),
  status: 'ended',
  source: 'google-meet',
};

const CHUNKS: TranscriptChunk[] = [
  {
    id: 'c1',
    callId: 'call-1',
    speaker: 'Dana',
    text: 'everything routes through a shared inbox',
    timestamp: 5_000,
    createdAt: 0,
  },
  {
    id: 'c2',
    callId: 'call-1',
    speaker: 'You',
    text: 'how many people work out of it?',
    timestamp: 65_000,
    createdAt: 0,
  },
];

const MARKERS: Marker[] = [
  {
    id: 'm1',
    callId: 'call-1',
    type: 'pain-point',
    label: 'Pain Point',
    note: 'inbox ownership',
    timestamp: 6_000,
    createdAt: 0,
  },
];

const INSIGHTS: Insight[] = [
  {
    id: 'i1',
    callId: 'call-1',
    category: 'budget',
    text: 'Lost a $40k renewal',
    confidence: 0.9,
    evidenceChunkIds: [],
    evidenceQuote: 'about forty thousand',
    source: 'direct',
    createdAt: 0,
    updatedAt: 0,
  },
];

function request(over: Partial<Parameters<typeof writeOutput>[0]> = {}) {
  return {
    type: 'executive-summary' as CallOutput['type'],
    call: CALL,
    chunks: CHUNKS,
    markers: MARKERS,
    insights: INSIGHTS,
    frameworks: [] as Framework[],
    settings: SETTINGS,
    ...over,
  };
}

const prose = (text: string) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text }] });

beforeEach(() => {
  create.mockReset();
  parse.mockReset();
});

describe('writeOutput — prose documents', () => {
  it('returns what the model wrote', async () => {
    create.mockResolvedValue(prose('# Call Summary\n\nThey have an inbox problem.'));

    const result = await writeOutput(request());

    expect(result).toBe('# Call Summary\n\nThey have an inbox problem.');
    expect(parse).not.toHaveBeenCalled();
  });

  it('sends the transcript with timestamps and speakers', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(request());

    const context = create.mock.calls[0][0].messages[0].content[0].text as string;
    expect(context).toContain('[0:05] Dana: everything routes through a shared inbox');
    expect(context).toContain('[1:05] You: how many people work out of it?');
  });

  it('passes the seller\'s own tags and the extracted insights as separate evidence', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(request());

    const context = create.mock.calls[0][0].messages[0].content[0].text as string;
    expect(context).toContain('MOMENTS THE SELLER TAGGED');
    expect(context).toContain('inbox ownership');
    expect(context).toContain('INSIGHTS EXTRACTED DURING THE CALL');
    expect(context).toContain('Lost a $40k renewal');
    // Extracted insights are leads, not established fact.
    expect(context).toMatch(/not independently verified/i);
  });

  it('varies the instruction by document type', async () => {
    create.mockResolvedValue(prose('ok'));

    await writeOutput(request({ type: 'follow-up-email' }));
    expect(create.mock.calls[0][0].messages[0].content[1].text).toContain('Subject:');

    await writeOutput(request({ type: 'categorized-notes' }));
    expect(create.mock.calls[1][0].messages[0].content[1].text).toContain('grouped by theme');
  });

  it('caches the instructions and the call separately, so a second document re-reads both', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(request());

    const params = create.mock.calls[0][0];
    expect(params.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(params.messages[0].content[0].cache_control).toEqual({ type: 'ephemeral' });
    // The per-type ask sits after the breakpoint, so it can vary for free.
    expect(params.messages[0].content[1].cache_control).toBeUndefined();
  });

  it('puts framework docs in the system prompt, fenced off from the evidence', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(
      request({
        frameworks: [
          {
            id: 'f1',
            name: 'MEDDIC sheet',
            type: 'discovery-framework',
            uploadedAt: 0,
            chunks: [{ id: 'fc1', frameworkId: 'f1', text: 'Find the economic buyer.' }],
          },
        ],
      }),
    );

    const system = create.mock.calls[0][0].system[0].text as string;
    expect(system).toContain('Find the economic buyer.');
    expect(system).toMatch(/not evidence about this buyer/i);
  });

  it('runs at high effort — this is one call after the meeting, not a live pass', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(request());

    expect(create.mock.calls[0][0].output_config.effort).toBe('high');
  });

  it('omits effort for Haiku, which rejects it', async () => {
    create.mockResolvedValue(prose('ok'));
    await writeOutput(request({ settings: { ...SETTINGS, model: 'claude-haiku-4-5' } }));

    expect(create.mock.calls[0][0].output_config).not.toHaveProperty('effort');
  });

  it('treats an empty document as a failure rather than returning a blank', async () => {
    create.mockResolvedValue(prose('   '));

    await expect(writeOutput(request())).rejects.toThrow(/empty/i);
  });

  it('surfaces a refusal', async () => {
    create.mockResolvedValue({ stop_reason: 'refusal', content: [] });

    await expect(writeOutput(request())).rejects.toThrow(/declined/i);
  });
});

describe('writeOutput — CRM note', () => {
  const crmReply = {
    stop_reason: 'end_turn',
    parsed_output: {
      summary: 'Inbox ownership problem, budget already proven by a lost renewal.',
      painPoints: ['No ownership of the shared inbox'],
      desiredOutcomes: [],
      objections: [],
      buyingSignals: [],
      nextSteps: ['Send security questionnaire'],
      budget: ['Lost a $40k renewal'],
      authority: [],
      timeline: [],
      openQuestions: [],
      sentiment: 'Engaged, problem-aware',
      confidence: 'medium',
    },
  };

  it('returns structured JSON via the parse path', async () => {
    parse.mockResolvedValue(crmReply);

    const result = JSON.parse(await writeOutput(request({ type: 'crm-note' })));

    expect(result.painPoints).toEqual(['No ownership of the shared inbox']);
    expect(result.confidence).toBe('medium');
    expect(create).not.toHaveBeenCalled();
  });

  it('fills the factual fields itself rather than asking the model for them', async () => {
    parse.mockResolvedValue(crmReply);

    const result = JSON.parse(await writeOutput(request({ type: 'crm-note' })));

    expect(result.callTitle).toBe('Discovery — Northwind');
    expect(result.callDate).toBe(new Date(CALL.startedAt).toISOString());
    expect(result.duration).toBe('1:05');
    expect(result.participants).toEqual(['Dana', 'You']);
    expect(result.taggedMoments).toBe(1);
  });

  it('fails loudly when the note comes back unparseable', async () => {
    parse.mockResolvedValue({ stop_reason: 'end_turn', parsed_output: null });

    await expect(writeOutput(request({ type: 'crm-note' }))).rejects.toThrow(/unreadable/i);
  });
});

describe('writeOutput — refuses to run', () => {
  it('without an API key', async () => {
    await expect(
      writeOutput(request({ settings: { ...SETTINGS, apiKey: '' } })),
    ).rejects.toThrow(/API key/i);
    expect(create).not.toHaveBeenCalled();
  });

  it('without a transcript', async () => {
    await expect(writeOutput(request({ chunks: [] }))).rejects.toThrow(/transcript/i);
    expect(create).not.toHaveBeenCalled();
  });
});
