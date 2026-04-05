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
  visibility?: EntryVisibility;
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

export type FrameType = 'aura' | 'skylight' | 'nixplay' | 'custom';

export interface FrameSettings {
  enabled: boolean;
  frameType: FrameType;
  frameEmail: string;
  frameName: string;
}

// --- Roles & Auth ---

export type UserRole = 'super_admin' | 'keeper' | 'viewer';

export type Relationship =
  | 'grandparent'
  | 'aunt'
  | 'uncle'
  | 'cousin'
  | 'friend'
  | 'teacher'
  | 'godparent'
  | 'sibling'
  | 'nanny'
  | 'other';

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  grandparent: 'Grandparent',
  aunt: 'Aunt',
  uncle: 'Uncle',
  cousin: 'Cousin',
  friend: 'Friend',
  teacher: 'Teacher',
  godparent: 'Godparent',
  sibling: 'Sibling',
  nanny: 'Nanny',
  other: 'Other',
};

export interface User {
  id: string;
  phone: string;
  name: string;
  passwordHash: string;
  verified: boolean;
  role: UserRole;
  invitedBy?: string; // userId who invited them
  createdAt: string;
}

export interface FamilyMember {
  userId: string;
  name: string;
  phone: string;
  role: 'keeper' | 'viewer';
  relationship?: Relationship;
  joinedAt: string;
}

export interface FamilyInvite {
  code: string;
  createdBy: string;
  createdByName: string;
  inviteType: 'keeper' | 'viewer';
  relationship?: Relationship;
  targetPhone?: string; // for keeper invites sent via SMS
  targetName?: string;
  expiresAt: string;
  createdAt: string;
}

export type EntryVisibility = 'private' | 'public';

export interface SharedEntry {
  entryId: string;
  userId: string;
  babyName: string;
  title: string;
  content: string;
  category: JournalCategory;
  date: string;
  photos: string[];
  mood?: string;
  sharedAt: string;
}
