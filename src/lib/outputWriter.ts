import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod';
import type {
  Call,
  CallOutput,
  TranscriptChunk,
  Marker,
  Insight,
  Framework,
  Settings,
  EffortLevel,
} from '@/shared/types';
import { OUTPUT_EFFORT } from '@/shared/constants';
import { formatTimestamp } from './utils';

/**
 * Post-call writing.
 *
 * The local templates in outputGenerator.ts concatenate what was already
 * captured; this reads the call and writes about it. Unlike live extraction
 * this runs once, when the call is over, so it can afford to think.
 */

const SYSTEM_PROMPT = `You write post-call documents for a salesperson, from the transcript of a call they just finished.

The transcript comes from live captions: words are mis-transcribed, sentences break mid-thought, and speaker labels are sometimes wrong. Read through that noise. Never quote a garbled fragment as if it were a clean quote.

Ground rules, in order of importance:
- Every claim must trace to something actually said. You are writing a record someone will act on and may forward to the person who was on the call.
- Never invent a commitment, a number, a date, or a name. If the call didn't establish it, either leave it out or mark it as an explicit gap.
- Distinguish what was said from what you infer. Inferences are allowed when they earn their place, but they must read as inference.
- Where a detail is needed and missing — a first name, a date to propose — write a bracketed placeholder like [name] rather than guessing. A placeholder is honest; a plausible invention is not.
- Prefer the other party's own words for what they care about. Do not restate the seller's pitch as if it were the buyer's need.
- If the transcript is too thin to support the document, say so in one line instead of padding it out. A short honest note beats a page of filler.
- Write plainly. No throat-clearing, no "In today's call, we discussed…", no summary of the summary at the end.`;

const INSTRUCTIONS: Record<CallOutput['type'], string> = {
  'executive-summary': `Write an executive summary of this call in Markdown.

Structure it as: a two-to-three sentence opening that says what this call was and where it landed, then only the sections the call actually supports — among the buyer's situation, what they said they need, objections raised, commercial signals (budget, authority, timeline), and open questions worth chasing.

Omit any section with nothing real behind it. Do not include a section header followed by "none discussed". End with what the seller should do next, only if the call supports a specific answer.`,

  'categorized-notes': `Write structured notes on this call in Markdown, grouped by theme.

Use whichever of these groupings the call supports: Pain points, Desired outcomes, Current tools, Objections, Budget, Authority and process, Timeline, Personal context, Commitments made. Skip the rest.

Under each, use short bullets. Where a bullet rests on a specific thing that was said, follow it with the quote in parentheses. Mark anything you inferred rather than heard with "(inferred)".`,

  'follow-up-email': `Write the follow-up email the seller should send.

Plain text, starting with a "Subject:" line. Open by referring to something specific from the conversation — not "thank you for your time". Recap what you understood their situation to be, in their words, so they can correct you if you got it wrong. State the next steps that were actually agreed, with owners. Close with one clear ask.

Use [brackets] for anything you don't know, including the recipient's name if the transcript doesn't establish it. Keep it under 200 words: this is a working email, not a proposal.`,

  'crm-note': `Extract this call into structured CRM fields.

Every array holds short, self-contained strings that will be read out of context in a CRM record — no pronouns referring to things not in the same string. Use an empty array where the call gave you nothing; do not invent filler entries. "sentiment" is one short phrase on where the buyer seems to stand, and "confidence" reflects how much the transcript actually supports this read.`,
};

const CrmNote = z.object({
  summary: z.string(),
  painPoints: z.array(z.string()),
  desiredOutcomes: z.array(z.string()),
  objections: z.array(z.string()),
  buyingSignals: z.array(z.string()),
  nextSteps: z.array(z.string()),
  budget: z.array(z.string()),
  authority: z.array(z.string()),
  timeline: z.array(z.string()),
  openQuestions: z.array(z.string()),
  sentiment: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
});

export interface OutputRequest {
  type: CallOutput['type'];
  call: Call;
  chunks: TranscriptChunk[];
  markers: Marker[];
  insights: Insight[];
  frameworks: Framework[];
  settings: Settings;
}

let cachedClient: { key: string; client: Anthropic } | null = null;

function getClient(apiKey: string): Anthropic {
  if (cachedClient?.key !== apiKey) {
    cachedClient = {
      key: apiKey,
      client: new Anthropic({ apiKey, dangerouslyAllowBrowser: true }),
    };
  }
  return cachedClient.client;
}

function supportsEffort(model: string): boolean {
  return !model.startsWith('claude-haiku');
}

export async function writeOutput(request: OutputRequest): Promise<string> {
  const { type, chunks, settings } = request;

  if (!settings.apiKey) throw new Error('No Anthropic API key configured');
  if (chunks.length === 0) throw new Error('No transcript to write from');

  return type === 'crm-note' ? writeCrmNote(request) : writeProse(request);
}

/** Haiku rejects output_config.effort; Opus and Sonnet accept it. */
function effortConfig(model: string): { effort?: EffortLevel } {
  return supportsEffort(model) ? { effort: OUTPUT_EFFORT } : {};
}

/** Shared shape of every request: cached instructions, cached call, then the ask. */
function baseParams(request: OutputRequest) {
  const { settings } = request;

  return {
    model: settings.model,
    max_tokens: 16000,
    system: [
      {
        type: 'text' as const,
        text: SYSTEM_PROMPT + buildFrameworkContext(request.frameworks),
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    messages: [
      {
        role: 'user' as const,
        content: [
          // The call itself is identical across all four documents, so it sits
          // behind its own breakpoint — generating the second one re-reads it.
          {
            type: 'text' as const,
            text: buildCallContext(request),
            cache_control: { type: 'ephemeral' as const },
          },
          { type: 'text' as const, text: INSTRUCTIONS[request.type] },
        ],
      },
    ],
  };
}

async function writeProse(request: OutputRequest): Promise<string> {
  const client = getClient(request.settings.apiKey);

  const response = await client.messages.create({
    ...baseParams(request),
    output_config: effortConfig(request.settings.model),
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Model declined to write this document');
  }

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) throw new Error('Model returned an empty document');
  return text;
}

async function writeCrmNote(request: OutputRequest): Promise<string> {
  const client = getClient(request.settings.apiKey);

  const response = await client.messages.parse({
    ...baseParams(request),
    output_config: {
      format: zodOutputFormat(CrmNote),
      ...effortConfig(request.settings.model),
    },
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Model declined to write this document');
  }

  const parsed = response.parsed_output;
  if (!parsed) throw new Error('CRM note came back in an unreadable shape');

  // Facts we can state exactly go in here, not through the model.
  return JSON.stringify({ ...describeCall(request), ...parsed }, null, 2);
}

/** Facts we can state exactly — no reason to let the model paraphrase them. */
function describeCall(request: OutputRequest) {
  const { call, chunks, markers, insights } = request;
  const last = chunks[chunks.length - 1];

  return {
    callTitle: call.title,
    callDate: new Date(call.startedAt).toISOString(),
    duration: last ? formatTimestamp(last.timestamp) : '0:00',
    participants: [...new Set(chunks.map((c) => c.speaker))],
    taggedMoments: markers.length,
    insightsCaptured: insights.length,
  };
}

function buildCallContext(request: OutputRequest): string {
  const { call, chunks, markers, insights } = request;
  const facts = describeCall(request);

  const sections: string[] = [
    `Call: ${call.title}`,
    `Duration: ${facts.duration}`,
    `Participants as labelled by the captions: ${facts.participants.join(', ') || 'unknown'}`,
    '',
    'TRANSCRIPT',
    chunks
      .map((c) => `[${formatTimestamp(c.timestamp)}] ${c.speaker}: ${c.text}`)
      .join('\n'),
  ];

  if (markers.length > 0) {
    sections.push(
      '',
      'MOMENTS THE SELLER TAGGED IN REAL TIME',
      'These are what the seller thought mattered as it happened. Weight them accordingly.',
      markers
        .map(
          (m) =>
            `[${formatTimestamp(m.timestamp)}] ${m.label}${m.note ? ` — ${m.note}` : ''}`,
        )
        .join('\n'),
    );
  }

  if (insights.length > 0) {
    sections.push(
      '',
      'INSIGHTS EXTRACTED DURING THE CALL',
      'Machine-extracted and not independently verified — treat as leads to check against the transcript, not as established fact.',
      insights
        .map((i) => {
          const quote = i.evidenceQuote ? ` (heard: "${i.evidenceQuote}")` : '';
          return `- [${i.category}, ${i.source}] ${i.text}${quote}`;
        })
        .join('\n'),
    );
  }

  return sections.join('\n');
}

function buildFrameworkContext(frameworks: Framework[]): string {
  if (frameworks.length === 0) return '';

  const body = frameworks
    .map((f) => {
      const text = f.chunks.map((c) => c.text).join('\n').slice(0, 6000);
      return `## ${f.name} (${f.type})\n${text}`;
    })
    .join('\n\n');

  return `\n\nThe seller works from the reference material below — their qualification criteria, their positioning, the objections they expect. Use it to judge what matters in this call and to match their vocabulary. It describes how they sell; it is not evidence about this buyer, and nothing in it may be reported as something said on the call.\n\n${body}`;
}
