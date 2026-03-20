import { describe, it, expect } from 'vitest';

// Ensure no API key so we test the mock path
delete process.env.OPENAI_API_KEY;

import { processVoiceMemo } from '@/lib/ai/voice-analysis';

describe('Voice Analysis (Mock Fallback)', () => {
  it('returns a transcript when no audio buffer provided', async () => {
    const result = await processVoiceMemo(null);
    expect(result.transcript).toBeTruthy();
    expect(typeof result.transcript).toBe('string');
    expect(result.transcript.length).toBeGreaterThan(20);
  });

  it('returns analysis structure with all required fields', async () => {
    const result = await processVoiceMemo(null);
    expect(result).toHaveProperty('transcript');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('suggestedTags');
    expect(result).toHaveProperty('firsts');
    expect(result).toHaveProperty('milestones');

    expect(Array.isArray(result.suggestedTags)).toBe(true);
    expect(Array.isArray(result.firsts)).toBe(true);
    expect(Array.isArray(result.milestones)).toBe(true);
  });

  it('returns suggested tags', async () => {
    const result = await processVoiceMemo(null);
    expect(result.suggestedTags.length).toBeGreaterThan(0);
  });

  it('provides a summary', async () => {
    const result = await processVoiceMemo(null);
    expect(result.summary).toBeTruthy();
    expect(typeof result.summary).toBe('string');
  });
});
