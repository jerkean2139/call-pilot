import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod';
import type {
  TranscriptChunk,
  Insight,
  InsightCategory,
  Framework,
  Settings,
} from '@/shared/types';
import { MAX_CHUNKS_PER_EXTRACTION, MAX_KNOWN_INSIGHTS_IN_PROMPT } from '@/shared/constants';
import { generateId, formatTimestamp } from './utils';

const CATEGORIES: InsightCategory[] = [
  'pain-point',
  'symptom',
  'desired-outcome',
  'objection',
  'current-tools',
  'urgency',
  'budget',
  'authority',
  'personal',
  'follow-up',
  'risk',
  'buying-signal',
];

const ExtractionResult = z.object({
  insights: z
    .array(
      z.object({
        category: z.enum(CATEGORIES as [InsightCategory, ...InsightCategory[]]),
        text: z.string(),
        confidence: z.number(),
        source: z.enum(['direct', 'inferred']),
        evidence_quote: z.string(),
        replaces: z.string(),
      }),
    )
    .max(8),
});

const CATEGORY_GUIDE = `
- pain-point: a problem, cost, or frustration the other side is living with
- symptom: an observable effect of a pain point, not the pain point itself
- desired-outcome: the state they say they want to reach
- objection: a stated reason not to move forward
- current-tools: software, vendors, or processes they use today
- urgency: deadlines, triggering events, or the absence of any time pressure
- budget: dollar figures, ranges, approval limits, or cost sensitivity
- authority: who decides, who else must sign off, who is missing from the call
- personal: rapport details worth remembering (role tenure, location, interests)
- follow-up: something either side committed to doing after the call
- risk: anything that could stall or kill the deal
- buying-signal: language implying intent to move forward
`.trim();

const SYSTEM_PROMPT = `You extract sales intelligence from a live meeting transcript, in real time, while the call is still happening.

You are given a rolling window of the transcript. Only the lines marked NEW are new since your last pass; the rest is context so you can interpret them.

Return insights ONLY for what the NEW lines reveal. Returning an empty list is the correct and common answer — most 20-second windows contain nothing worth surfacing. Never pad the list to look useful.

Categories:
${CATEGORY_GUIDE}

Rules:
- The transcript comes from live captions. It is noisy: words are mis-transcribed, sentences are split mid-thought, and speaker labels are sometimes wrong. Read through the noise; never quote noise as if it were meaningful.
- "text" is a short phrase in your own words, at most 15 words. It is read at a glance on a heads-up display during a live call, so lead with the substance.
- "evidence_quote" must be copied verbatim from the transcript. If nothing in the transcript supports the insight, do not report it.
- "source" is "direct" when the speaker said it outright, "inferred" when you are reading between the lines. Inferred insights need a lower confidence.
- "confidence" is 0 to 1. Below 0.4, leave the insight out entirely.
- Attribute only what the other party said. Do not turn the seller's own pitch into a pain point or a buying signal.
- Known insights from earlier in this call are listed for you. Do not repeat them. If a new line materially sharpens one — a vague budget concern becomes a real number — emit the improved version and set "replaces" to that insight's ref (e.g. "K3"). Otherwise set "replaces" to "".
- A restatement of something already known is not new information. Stay silent.`;

/** An insight the model may have flagged as superseding an earlier one. */
export type ExtractedInsight = Insight & { replacesId?: string };

export interface ExtractionInput {
  callId: string;
  chunks: TranscriptChunk[];
  newChunkIds: string[];
  knownInsights: Insight[];
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

/**
 * Haiku rejects output_config.effort; Opus and Sonnet accept it.
 */
function supportsEffort(model: string): boolean {
  return !model.startsWith('claude-haiku');
}

export async function extractInsights(input: ExtractionInput): Promise<ExtractedInsight[]> {
  const { callId, chunks, newChunkIds, knownInsights, frameworks, settings } = input;

  if (!settings.apiKey) throw new Error('No Anthropic API key configured');
  if (newChunkIds.length === 0) return [];

  const window = chunks.slice(-MAX_CHUNKS_PER_EXTRACTION);
  const newIds = new Set(newChunkIds);

  const transcriptText = window
    .map((c) => {
      const marker = newIds.has(c.id) ? 'NEW ' : '    ';
      return `${marker}[${formatTimestamp(c.timestamp)}] ${c.speaker}: ${c.text}`;
    })
    .join('\n');

  // Refs are what the model cites in "replaces"; map them back to real ids afterwards.
  const recentKnown = knownInsights.slice(-MAX_KNOWN_INSIGHTS_IN_PROMPT);
  const refToId = new Map<string, string>();
  const knownText = recentKnown
    .map((insight, i) => {
      const ref = `K${i + 1}`;
      refToId.set(ref, insight.id);
      return `${ref} [${insight.category}] ${insight.text}`;
    })
    .join('\n');

  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: SYSTEM_PROMPT + buildFrameworkContext(frameworks),
      cache_control: { type: 'ephemeral' },
    },
  ];

  const userPrompt = [
    knownText
      ? `Known insights so far in this call:\n${knownText}`
      : 'No insights have been captured yet in this call.',
    '',
    'Transcript window:',
    transcriptText,
  ].join('\n');

  const client = getClient(settings.apiKey);

  const response = await client.messages.parse({
    model: settings.model,
    max_tokens: 8000,
    system: systemBlocks,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: zodOutputFormat(ExtractionResult),
      ...(supportsEffort(settings.model) ? { effort: settings.effort } : {}),
    },
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('Model declined to process this transcript window');
  }

  const parsed = response.parsed_output;
  if (!parsed) return [];

  const now = Date.now();
  const evidenceIds = newChunkIds.slice();

  return parsed.insights
    .filter((raw) => raw.confidence >= 0.4 && raw.text.trim().length > 0)
    .map((raw) => ({
      id: generateId(),
      callId,
      category: raw.category,
      text: raw.text.trim(),
      confidence: Math.min(1, Math.max(0, raw.confidence)),
      evidenceChunkIds: evidenceIds,
      evidenceQuote: raw.evidence_quote.trim() || undefined,
      source: raw.source,
      createdAt: now,
      updatedAt: now,
      replacesId: refToId.get(raw.replaces),
    }));
}

function buildFrameworkContext(frameworks: Framework[]): string {
  if (frameworks.length === 0) return '';

  const body = frameworks
    .map((f) => {
      const text = f.chunks.map((c) => c.text).join('\n').slice(0, 6000);
      return `## ${f.name} (${f.type})\n${text}`;
    })
    .join('\n\n');

  return `\n\nThe seller has uploaded the following reference material for this call. Use it to recognise what matters to them — their qualification criteria, their known objections, the outcomes they sell. Do not quote it as evidence; evidence only ever comes from the transcript.\n\n${body}`;
}

/**
 * Merge a freshly extracted batch into the insights already held for the call,
 * applying any in-place replacements the model asked for.
 */
export function mergeInsights(existing: Insight[], incoming: ExtractedInsight[]): Insight[] {
  let merged = existing;

  for (const insight of incoming) {
    const { replacesId, ...clean } = insight;

    if (replacesId && merged.some((e) => e.id === replacesId)) {
      merged = merged.map((e) =>
        e.id === replacesId ? { ...clean, id: e.id, createdAt: e.createdAt, updatedAt: Date.now() } : e,
      );
    } else {
      merged = [...merged, clean];
    }
  }

  return merged;
}
