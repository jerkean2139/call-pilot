export interface Baby {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date
  gender?: 'boy' | 'girl' | 'other';
  photoUrl?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  babyId: string;
  title: string;
  content: string;
  category: JournalCategory;
  date: string; // ISO date
  photos: string[]; // base64 data URLs
  mood?: 'happy' | 'sleepy' | 'fussy' | 'calm' | 'playful';
  createdAt: string;
  updatedAt: string;
}

export type JournalCategory =
  | 'milestone'
  | 'daily'
  | 'health'
  | 'feeding'
  | 'sleep'
  | 'play'
  | 'first'
  | 'outing'
  | 'funny'
  | 'memory';

export interface Milestone {
  id: string;
  babyId: string;
  templateId?: string;
  title: string;
  description?: string;
  category: MilestoneCategory;
  achievedDate?: string; // ISO date
  photoUrl?: string;
  createdAt: string;
}

export type MilestoneCategory =
  | 'motor'
  | 'cognitive'
  | 'social'
  | 'language'
  | 'feeding'
  | 'sleep'
  | 'play';

export interface GrowthRecord {
  id: string;
  babyId: string;
  date: string; // ISO date
  weightLbs?: number;
  weightOz?: number;
  heightInches?: number;
  headCircumferenceInches?: number;
  notes?: string;
  createdAt: string;
}

export interface MilestoneTemplate {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  typicalAgeMonths: number;
  icon: string;
}

export interface TimelineEvent {
  id: string;
  type: 'journal' | 'milestone' | 'growth' | 'photo';
  date: string;
  title: string;
  preview?: string;
  photoUrl?: string;
  category?: string;
}
