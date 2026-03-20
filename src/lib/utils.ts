import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function calculateAge(dateOfBirth: string): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  display: string;
} {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const totalDays = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)
  );

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  let display: string;
  if (years > 0) {
    display = `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} mo` : ''}`;
  } else if (months > 0) {
    display = `${months} month${months > 1 ? 's' : ''}${days > 0 ? `, ${days} day${days > 1 ? 's' : ''}` : ''}`;
  } else {
    display = `${days} day${days !== 1 ? 's' : ''} old`;
  }

  return { years, months, days, totalDays, display };
}

export function getAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  return (
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth())
  );
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    motor: 'bg-blue-100 text-blue-700',
    cognitive: 'bg-purple-100 text-purple-700',
    social: 'bg-pink-100 text-pink-700',
    language: 'bg-amber-100 text-amber-700',
    feeding: 'bg-green-100 text-green-700',
    sleep: 'bg-indigo-100 text-indigo-700',
    play: 'bg-orange-100 text-orange-700',
    milestone: 'bg-yellow-100 text-yellow-700',
    daily: 'bg-slate-100 text-slate-700',
    health: 'bg-red-100 text-red-700',
    first: 'bg-rose-100 text-rose-700',
    outing: 'bg-teal-100 text-teal-700',
    funny: 'bg-amber-100 text-amber-700',
    memory: 'bg-violet-100 text-violet-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    motor: '🏃',
    cognitive: '🧠',
    social: '👋',
    language: '💬',
    feeding: '🍼',
    sleep: '😴',
    play: '🎮',
    milestone: '⭐',
    daily: '📝',
    health: '❤️',
    first: '🎉',
    outing: '🌳',
    funny: '😂',
    memory: '💭',
  };
  return emojis[category] || '📌';
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getMoodEmoji(mood?: string): string {
  const moods: Record<string, string> = {
    happy: '😊',
    sleepy: '😴',
    fussy: '😤',
    calm: '😌',
    playful: '🤗',
  };
  return mood ? moods[mood] || '' : '';
}
