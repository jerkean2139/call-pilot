import { describe, it, expect } from 'vitest';
import { cn, babyAge, babyAgeInMonths, getPhaseLabel, generateId, EMOTIONS } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('handles tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });
});

describe('babyAge', () => {
  it('returns day count for very young babies', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(babyAge(threeDaysAgo)).toBe('Day 3');
  });

  it('returns weeks for babies under 12 weeks', () => {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    expect(babyAge(fourWeeksAgo)).toBe('Week 4');
  });

  it('returns months for babies under 2 years', () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const result = babyAge(sixMonthsAgo);
    expect(result).toMatch(/\d+ months?/);
  });
});

describe('getPhaseLabel', () => {
  it('returns Newborn for < 1 month', () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    expect(getPhaseLabel(recent)).toBe('Newborn');
  });

  it('returns Early Days for 1-3 months', () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    expect(getPhaseLabel(twoMonthsAgo)).toBe('Early Days');
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('contains timestamp', () => {
    const id = generateId();
    const timestamp = parseInt(id.split('-')[0]);
    expect(timestamp).toBeGreaterThan(0);
  });
});

describe('EMOTIONS constant', () => {
  it('has expected emotions', () => {
    const values = EMOTIONS.map((e) => e.value);
    expect(values).toContain('proud');
    expect(values).toContain('exhausted');
    expect(values).toContain('grateful');
    expect(values).toContain('in-love');
  });

  it('each emotion has label and emoji', () => {
    for (const emotion of EMOTIONS) {
      expect(emotion.label).toBeTruthy();
      expect(emotion.emoji).toBeTruthy();
    }
  });
});
