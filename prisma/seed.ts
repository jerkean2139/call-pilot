import { PrismaClient, Role, BabyTheme, EntryType, MilestoneCategory } from '@prisma/client';
import { encryptContent } from '../lib/encryption/capsule';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const brennen = await prisma.user.upsert({
    where: { email: 'brennen@livinglegacy.app' },
    update: {},
    create: {
      email: 'brennen@livinglegacy.app',
      name: 'Brennen',
      emailVerified: new Date(),
    },
  });

  const halle = await prisma.user.upsert({
    where: { email: 'halle@livinglegacy.app' },
    update: {},
    create: {
      email: 'halle@livinglegacy.app',
      name: 'Halle',
      emailVerified: new Date(),
    },
  });

  const karley = await prisma.user.upsert({
    where: { email: 'karley@livinglegacy.app' },
    update: {},
    create: {
      email: 'karley@livinglegacy.app',
      name: 'Karley',
      emailVerified: new Date(),
    },
  });

  const dillon = await prisma.user.upsert({
    where: { email: 'dillon@livinglegacy.app' },
    update: {},
    create: {
      email: 'dillon@livinglegacy.app',
      name: 'Dillon',
      emailVerified: new Date(),
    },
  });

  const caregiver = await prisma.user.upsert({
    where: { email: 'grandma@livinglegacy.app' },
    update: {},
    create: {
      email: 'grandma@livinglegacy.app',
      name: 'Grandma Sue',
      emailVerified: new Date(),
    },
  });

  // Create Family 1: Brynleigh's family
  const family1 = await prisma.family.create({
    data: {
      name: "Brynleigh's Family",
      memberships: {
        create: [
          { userId: brennen.id, role: Role.PARENT },
          { userId: halle.id, role: Role.PARENT },
          { userId: caregiver.id, role: Role.CAREGIVER },
        ],
      },
    },
  });

  const brynleigh = await prisma.baby.create({
    data: {
      name: 'Brynleigh',
      birthDate: new Date('2024-11-15'),
      theme: BabyTheme.STRAWBERRY,
      familyId: family1.id,
    },
  });

  // Create Family 2: Easton's family
  const family2 = await prisma.family.create({
    data: {
      name: "Easton's Family",
      memberships: {
        create: [
          { userId: karley.id, role: Role.PARENT },
          { userId: dillon.id, role: Role.PARENT },
          { userId: caregiver.id, role: Role.CAREGIVER },
        ],
      },
    },
  });

  const easton = await prisma.baby.create({
    data: {
      name: 'Easton',
      birthDate: new Date('2025-01-20'),
      theme: BabyTheme.STORYBOOK,
      familyId: family2.id,
    },
  });

  // Sample entries for Brynleigh
  const entries = [
    {
      type: EntryType.LOG,
      title: 'Diaper - wet',
      metadata: { logType: 'diaper', subType: 'wet' },
      occurredAt: new Date('2025-03-18T08:30:00'),
      babyId: brynleigh.id,
      authorId: halle.id,
      tags: ['morning'],
      emotions: [],
      aiMarkers: [],
    },
    {
      type: EntryType.LOG,
      title: 'Feeding - bottle',
      metadata: { logType: 'feeding', subType: 'bottle', amount: '4oz' },
      occurredAt: new Date('2025-03-18T09:00:00'),
      babyId: brynleigh.id,
      authorId: halle.id,
      tags: ['morning'],
      emotions: [],
      aiMarkers: [],
    },
    {
      type: EntryType.JOURNAL,
      title: 'First real smile today!',
      content:
        "I was singing her favorite song and she gave me the biggest, most intentional smile. My heart completely melted. Brennen caught it on video and I've already watched it ten times. These are the moments that make the sleepless nights worth every second.",
      occurredAt: new Date('2025-03-15T14:30:00'),
      babyId: brynleigh.id,
      authorId: halle.id,
      tags: ['milestone', 'smile', 'first'],
      emotions: ['in-love', 'proud', 'grateful'],
      aiMarkers: ['first-smile'],
    },
    {
      type: EntryType.JOURNAL,
      title: 'Bath time adventures',
      content:
        'Brynleigh is starting to love bath time! She kicks her little legs and splashes everywhere. The strawberry-scented baby wash is her favorite — she always calms down when she smells it.',
      occurredAt: new Date('2025-03-10T19:00:00'),
      babyId: brynleigh.id,
      authorId: brennen.id,
      tags: ['bath', 'fun'],
      emotions: ['amused', 'in-love'],
      aiMarkers: [],
    },
    {
      type: EntryType.MILESTONE,
      title: 'Rolling over!',
      content: 'During tummy time today, Brynleigh rolled from her tummy to her back for the first time! She looked so surprised and then gave us the biggest grin.',
      occurredAt: new Date('2025-03-12T11:00:00'),
      babyId: brynleigh.id,
      authorId: brennen.id,
      tags: ['milestone', 'tummy-time', 'rolling'],
      emotions: ['proud', 'in-love'],
      aiMarkers: ['first-roll'],
    },
  ];

  for (const entry of entries) {
    await prisma.entry.create({ data: entry });
  }

  // Sample entries for Easton
  const eastonEntries = [
    {
      type: EntryType.JOURNAL,
      title: 'Welcome to the world, little one',
      content:
        "Easton arrived at 7:42am, 8 lbs 3 oz of pure perfection. The moment they placed him on Karley's chest, everything else faded away. Our story begins.",
      occurredAt: new Date('2025-01-20T07:42:00'),
      babyId: easton.id,
      authorId: dillon.id,
      tags: ['birth', 'first-day'],
      emotions: ['in-love', 'grateful', 'overwhelmed'],
      aiMarkers: ['birth-day'],
    },
    {
      type: EntryType.LOG,
      title: 'Feeding - breast',
      metadata: { logType: 'feeding', subType: 'breast', notes: 'Great latch today!' },
      occurredAt: new Date('2025-03-18T06:00:00'),
      babyId: easton.id,
      authorId: karley.id,
      tags: [],
      emotions: [],
      aiMarkers: [],
    },
    {
      type: EntryType.LOG,
      title: 'Sleep - nap',
      metadata: { logType: 'sleep', duration: 90, notes: 'Long morning nap' },
      occurredAt: new Date('2025-03-18T10:00:00'),
      babyId: easton.id,
      authorId: karley.id,
      tags: ['nap'],
      emotions: [],
      aiMarkers: [],
    },
  ];

  for (const entry of eastonEntries) {
    await prisma.entry.create({ data: entry });
  }

  // Milestones for Brynleigh (CDC-inspired)
  const brynleighMilestones = [
    { title: 'Lifts head during tummy time', category: MilestoneCategory.MOTOR, ageBandMonths: 2, completedAt: new Date('2025-01-20') },
    { title: 'Smiles at people', category: MilestoneCategory.SOCIAL, ageBandMonths: 2, completedAt: new Date('2025-03-15') },
    { title: 'Coos and makes gurgling sounds', category: MilestoneCategory.LANGUAGE, ageBandMonths: 2, completedAt: new Date('2025-02-01') },
    { title: 'Follows things with eyes', category: MilestoneCategory.COGNITIVE, ageBandMonths: 2, completedAt: new Date('2025-01-28') },
    { title: 'Rolls over (tummy to back)', category: MilestoneCategory.MOTOR, ageBandMonths: 4, completedAt: new Date('2025-03-12') },
    { title: 'Reaches for toy with one hand', category: MilestoneCategory.MOTOR, ageBandMonths: 4, completedAt: null },
    { title: 'Babbles with expression', category: MilestoneCategory.LANGUAGE, ageBandMonths: 4, completedAt: null },
    { title: 'Responds to affection', category: MilestoneCategory.SOCIAL, ageBandMonths: 4, completedAt: new Date('2025-03-01') },
    { title: 'Brings things to mouth', category: MilestoneCategory.COGNITIVE, ageBandMonths: 4, completedAt: null },
    { title: 'Sits with support', category: MilestoneCategory.MOTOR, ageBandMonths: 6, completedAt: null },
    { title: 'Responds to own name', category: MilestoneCategory.LANGUAGE, ageBandMonths: 6, completedAt: null },
    { title: 'Begins to eat solids', category: MilestoneCategory.FEEDING, ageBandMonths: 6, completedAt: null },
    { title: 'Pulls to stand', category: MilestoneCategory.MOTOR, ageBandMonths: 9, completedAt: null },
    { title: 'Says "mama" or "dada"', category: MilestoneCategory.LANGUAGE, ageBandMonths: 9, completedAt: null },
    { title: 'First steps', category: MilestoneCategory.MOTOR, ageBandMonths: 12, completedAt: null },
    { title: 'First word', category: MilestoneCategory.LANGUAGE, ageBandMonths: 12, completedAt: null },
  ];

  for (const ms of brynleighMilestones) {
    await prisma.milestone.create({
      data: { ...ms, babyId: brynleigh.id },
    });
  }

  // Milestones for Easton
  const eastonMilestones = [
    { title: 'Lifts head during tummy time', category: MilestoneCategory.MOTOR, ageBandMonths: 2, completedAt: new Date('2025-03-10') },
    { title: 'Smiles at people', category: MilestoneCategory.SOCIAL, ageBandMonths: 2, completedAt: new Date('2025-03-05') },
    { title: 'Coos and makes gurgling sounds', category: MilestoneCategory.LANGUAGE, ageBandMonths: 2, completedAt: null },
    { title: 'Follows things with eyes', category: MilestoneCategory.COGNITIVE, ageBandMonths: 2, completedAt: new Date('2025-02-28') },
    { title: 'Rolls over', category: MilestoneCategory.MOTOR, ageBandMonths: 4, completedAt: null },
    { title: 'Babbles', category: MilestoneCategory.LANGUAGE, ageBandMonths: 4, completedAt: null },
    { title: 'Sits with support', category: MilestoneCategory.MOTOR, ageBandMonths: 6, completedAt: null },
  ];

  for (const ms of eastonMilestones) {
    await prisma.milestone.create({
      data: { ...ms, babyId: easton.id },
    });
  }

  // Time Capsule for Brynleigh
  try {
    await prisma.timeCapsule.create({
      data: {
        title: 'To Brynleigh on her 16th birthday',
        encryptedContent: encryptContent(
          `Dear Brynleigh,\n\nAs I write this, you're just 4 months old, sleeping peacefully in your crib after a long day of discovering the world. Your tiny fingers, your strawberry-scented hair, the way you scrunch your nose when you smile — I want to remember every detail.\n\nYou are so deeply loved. Your dad and I dreamed of you before you existed, and the reality of you is more beautiful than anything we imagined.\n\nBy the time you read this, you'll be sixteen. I hope you know that the same love we feel right now, watching you sleep, has only grown with every year.\n\nForever yours,\nMom & Dad`
        ),
        unlockDate: new Date('2040-11-15'),
        isSealed: true,
        babyId: brynleigh.id,
        authorId: halle.id,
      },
    });
  } catch (e) {
    console.log('Skipping time capsule (encryption key may not be set):', e);
  }

  // Create a share token for a video entry stub
  const videoEntry = await prisma.entry.create({
    data: {
      type: EntryType.JOURNAL,
      title: "Brynleigh's first laugh",
      content: 'The most beautiful sound we have ever heard.',
      occurredAt: new Date('2025-03-14T16:00:00'),
      babyId: brynleigh.id,
      authorId: brennen.id,
      tags: ['milestone', 'laugh', 'first'],
      emotions: ['in-love', 'proud'],
      aiMarkers: ['first-laugh'],
      media: {
        create: {
          url: 'https://placehold.co/640x480/f8e8e8/333?text=First+Laugh+Video',
          type: 'video/mp4',
          thumbnailUrl: 'https://placehold.co/200x200/f8e8e8/333?text=Thumb',
        },
      },
    },
  });

  await prisma.shareToken.create({
    data: {
      token: 'demo-share-token-brynleigh-laugh',
      entryId: videoEntry.id,
    },
  });

  console.log('✅ Seed complete!');
  console.log(`   Family 1: ${family1.name} (Brynleigh - Strawberry theme)`);
  console.log(`   Family 2: ${family2.name} (Easton - Storybook theme)`);
  console.log(`   Users: brennen, halle, karley, dillon, grandma`);
  console.log(`   Demo share: /share/video/demo-share-token-brynleigh-laugh`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
