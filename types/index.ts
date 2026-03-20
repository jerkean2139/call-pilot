import { Baby, Entry, Media, Milestone, TimeCapsule, User, Family, Membership, VoiceAnalysis } from '@prisma/client';

export type EntryWithRelations = Entry & {
  media: Media[];
  author: Pick<User, 'id' | 'name' | 'image'>;
  voiceAnalysis?: VoiceAnalysis | null;
};

export type BabyWithFamily = Baby & {
  family: Family & {
    memberships: (Membership & {
      user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
    })[];
  };
};

export type FamilyWithDetails = Family & {
  babies: Baby[];
  memberships: (Membership & {
    user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  })[];
};

export type TimeCapsuleWithAuthor = TimeCapsule & {
  author: Pick<User, 'id' | 'name'>;
};

export interface QuickLogData {
  type: 'diaper' | 'feeding' | 'sleep';
  subType?: string;
  amount?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface BabyThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  gradient: string;
}

export const BABY_THEMES: Record<string, BabyThemeConfig> = {
  STRAWBERRY: {
    name: 'Strawberry',
    primary: 'strawberry-500',
    secondary: 'strawberry-100',
    accent: 'strawberry-300',
    bg: 'bg-strawberry-50',
    gradient: 'from-strawberry-100 to-strawberry-50',
  },
  STORYBOOK: {
    name: 'Storybook',
    primary: 'storybook-500',
    secondary: 'storybook-100',
    accent: 'storybook-300',
    bg: 'bg-storybook-50',
    gradient: 'from-storybook-100 to-storybook-50',
  },
};
