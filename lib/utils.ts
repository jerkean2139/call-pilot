import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function babyAge(birthDate: Date | string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const days = differenceInDays(now, birth);
  if (days < 7) return `Day ${days}`;
  const weeks = differenceInWeeks(now, birth);
  if (weeks < 12) return `Week ${weeks}`;
  const months = differenceInMonths(now, birth);
  if (months < 24) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) !== 1 ? 's' : ''}`;
}

export function babyAgeInMonths(birthDate: Date | string): number {
  return differenceInMonths(new Date(), new Date(birthDate));
}

export function getPhaseLabel(birthDate: Date | string): string {
  const months = babyAgeInMonths(birthDate);
  if (months < 1) return 'Newborn';
  if (months < 3) return 'Early Days';
  if (months < 6) return 'Discovery Phase';
  if (months < 9) return 'Explorer Phase';
  if (months < 12) return 'Almost One';
  if (months < 18) return 'Toddling';
  if (months < 24) return 'Little Explorer';
  return 'Growing Up';
}

export const EMOTIONS = [
  { value: 'proud', label: 'Proud', emoji: '🥹' },
  { value: 'overwhelmed', label: 'Overwhelmed', emoji: '😮‍💨' },
  { value: 'exhausted', label: 'Exhausted', emoji: '😴' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'in-love', label: 'In Love', emoji: '🥰' },
  { value: 'amused', label: 'Amused', emoji: '😂' },
  { value: 'worried', label: 'Worried', emoji: '😟' },
  { value: 'peaceful', label: 'Peaceful', emoji: '☺️' },
] as const;

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
