import type { MilestoneTemplate } from '../types';

export const milestoneTemplates: MilestoneTemplate[] = [
  // Motor milestones
  { id: 'motor-1', title: 'Holds head up', description: 'Can hold head steady without support', category: 'motor', typicalAgeMonths: 2, icon: '💪' },
  { id: 'motor-2', title: 'Rolls over', description: 'Rolls from tummy to back or back to tummy', category: 'motor', typicalAgeMonths: 4, icon: '🔄' },
  { id: 'motor-3', title: 'Sits without support', description: 'Can sit up on their own', category: 'motor', typicalAgeMonths: 6, icon: '🪑' },
  { id: 'motor-4', title: 'Crawls', description: 'Moves around on hands and knees', category: 'motor', typicalAgeMonths: 8, icon: '🐛' },
  { id: 'motor-5', title: 'Pulls to stand', description: 'Pulls up to standing using furniture', category: 'motor', typicalAgeMonths: 9, icon: '🧗' },
  { id: 'motor-6', title: 'First steps', description: 'Takes first independent steps', category: 'motor', typicalAgeMonths: 12, icon: '🚶' },
  { id: 'motor-7', title: 'Walks well', description: 'Walks steadily on their own', category: 'motor', typicalAgeMonths: 15, icon: '🏃' },
  { id: 'motor-8', title: 'Runs', description: 'Can run (may be a bit wobbly)', category: 'motor', typicalAgeMonths: 18, icon: '💨' },
  { id: 'motor-9', title: 'Kicks a ball', description: 'Can kick a ball forward', category: 'motor', typicalAgeMonths: 24, icon: '⚽' },
  { id: 'motor-10', title: 'Jumps with both feet', description: 'Can jump up with both feet leaving the ground', category: 'motor', typicalAgeMonths: 30, icon: '🦘' },

  // Cognitive milestones
  { id: 'cog-1', title: 'Follows objects with eyes', description: 'Tracks moving objects visually', category: 'cognitive', typicalAgeMonths: 1, icon: '👀' },
  { id: 'cog-2', title: 'Recognizes faces', description: 'Recognizes familiar faces and smiles', category: 'cognitive', typicalAgeMonths: 2, icon: '😊' },
  { id: 'cog-3', title: 'Reaches for toys', description: 'Reaches out to grab objects', category: 'cognitive', typicalAgeMonths: 4, icon: '🧸' },
  { id: 'cog-4', title: 'Object permanence', description: 'Looks for things you hide', category: 'cognitive', typicalAgeMonths: 8, icon: '🔍' },
  { id: 'cog-5', title: 'Points at things', description: 'Points to show interest in something', category: 'cognitive', typicalAgeMonths: 10, icon: '👆' },
  { id: 'cog-6', title: 'Stacks blocks', description: 'Can stack 2 or more blocks', category: 'cognitive', typicalAgeMonths: 14, icon: '🧱' },
  { id: 'cog-7', title: 'Sorts shapes', description: 'Puts shapes in correct holes', category: 'cognitive', typicalAgeMonths: 18, icon: '🔺' },
  { id: 'cog-8', title: 'Names colors', description: 'Can name at least one color', category: 'cognitive', typicalAgeMonths: 30, icon: '🎨' },
  { id: 'cog-9', title: 'Counts to 10', description: 'Can count objects up to 10', category: 'cognitive', typicalAgeMonths: 36, icon: '🔢' },

  // Social milestones
  { id: 'social-1', title: 'First social smile', description: 'Smiles in response to your smile', category: 'social', typicalAgeMonths: 2, icon: '😄' },
  { id: 'social-2', title: 'Laughs', description: 'Laughs out loud', category: 'social', typicalAgeMonths: 4, icon: '😆' },
  { id: 'social-3', title: 'Stranger anxiety', description: 'Shows wariness of unfamiliar people', category: 'social', typicalAgeMonths: 7, icon: '😟' },
  { id: 'social-4', title: 'Waves bye-bye', description: 'Waves hello or goodbye', category: 'social', typicalAgeMonths: 9, icon: '👋' },
  { id: 'social-5', title: 'Plays peek-a-boo', description: 'Engages in peek-a-boo games', category: 'social', typicalAgeMonths: 9, icon: '🙈' },
  { id: 'social-6', title: 'Gives hugs', description: 'Hugs parents or stuffed animals', category: 'social', typicalAgeMonths: 12, icon: '🤗' },
  { id: 'social-7', title: 'Parallel play', description: 'Plays alongside other children', category: 'social', typicalAgeMonths: 18, icon: '👫' },
  { id: 'social-8', title: 'Takes turns', description: 'Begins to take turns in games', category: 'social', typicalAgeMonths: 24, icon: '🔁' },
  { id: 'social-9', title: 'Shows empathy', description: 'Comforts others who are upset', category: 'social', typicalAgeMonths: 24, icon: '💕' },

  // Language milestones
  { id: 'lang-1', title: 'Coos', description: 'Makes cooing sounds', category: 'language', typicalAgeMonths: 2, icon: '🗣️' },
  { id: 'lang-2', title: 'Babbles', description: 'Makes babbling sounds (ba-ba, da-da)', category: 'language', typicalAgeMonths: 6, icon: '👶' },
  { id: 'lang-3', title: 'Responds to name', description: 'Turns head when you say their name', category: 'language', typicalAgeMonths: 7, icon: '👂' },
  { id: 'lang-4', title: 'First word', description: 'Says first meaningful word', category: 'language', typicalAgeMonths: 12, icon: '💬' },
  { id: 'lang-5', title: 'Says 10+ words', description: 'Uses 10 or more words', category: 'language', typicalAgeMonths: 18, icon: '📖' },
  { id: 'lang-6', title: 'Two-word phrases', description: 'Puts two words together', category: 'language', typicalAgeMonths: 21, icon: '✌️' },
  { id: 'lang-7', title: 'Says own name', description: 'Can say their own name', category: 'language', typicalAgeMonths: 24, icon: '🏷️' },
  { id: 'lang-8', title: 'Asks "why?"', description: 'Starts asking why questions', category: 'language', typicalAgeMonths: 30, icon: '❓' },
  { id: 'lang-9', title: 'Tells a story', description: 'Can tell a simple story', category: 'language', typicalAgeMonths: 36, icon: '📚' },

  // Feeding milestones
  { id: 'feed-1', title: 'First solid food', description: 'Tries solid food for the first time', category: 'feeding', typicalAgeMonths: 6, icon: '🥄' },
  { id: 'feed-2', title: 'Holds own bottle', description: 'Holds bottle or cup independently', category: 'feeding', typicalAgeMonths: 8, icon: '🍼' },
  { id: 'feed-3', title: 'Finger foods', description: 'Picks up and eats finger foods', category: 'feeding', typicalAgeMonths: 9, icon: '🫐' },
  { id: 'feed-4', title: 'Uses spoon', description: 'Feeds self with a spoon', category: 'feeding', typicalAgeMonths: 15, icon: '🥣' },
  { id: 'feed-5', title: 'Drinks from cup', description: 'Drinks from an open cup', category: 'feeding', typicalAgeMonths: 18, icon: '🥤' },

  // Sleep milestones
  { id: 'sleep-1', title: 'Sleeps through the night', description: 'Sleeps 6+ hours without waking', category: 'sleep', typicalAgeMonths: 6, icon: '🌙' },
  { id: 'sleep-2', title: 'Drops to 2 naps', description: 'Transitions from 3 naps to 2', category: 'sleep', typicalAgeMonths: 8, icon: '😴' },
  { id: 'sleep-3', title: 'Drops to 1 nap', description: 'Transitions from 2 naps to 1', category: 'sleep', typicalAgeMonths: 15, icon: '💤' },
  { id: 'sleep-4', title: 'Moves to toddler bed', description: 'Transitions out of the crib', category: 'sleep', typicalAgeMonths: 24, icon: '🛏️' },
];

export function getMilestonesByCategory(category: string): MilestoneTemplate[] {
  return milestoneTemplates.filter((m) => m.category === category);
}

export function getMilestonesByAge(ageMonths: number): MilestoneTemplate[] {
  return milestoneTemplates.filter(
    (m) => m.typicalAgeMonths <= ageMonths + 2 && m.typicalAgeMonths >= ageMonths - 2
  );
}

export function getUpcomingMilestones(ageMonths: number): MilestoneTemplate[] {
  return milestoneTemplates
    .filter((m) => m.typicalAgeMonths > ageMonths && m.typicalAgeMonths <= ageMonths + 6)
    .sort((a, b) => a.typicalAgeMonths - b.typicalAgeMonths);
}
