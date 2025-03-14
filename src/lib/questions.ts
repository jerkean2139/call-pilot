export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    value: number;
  }[];
  section?: string;
}

export const questions: Question[] = [
  // Section 1: Professional Connection Codes (PCCs)
  {
    id: 1,
    text: "When you get a compliment at work, do you...",
    section: "Professional Connection Codes",
    options: [
      { text: "Absorb it like a sponge and feel unstoppable", value: 0 },
      { text: "Pretend you didn't hear it but replay it in your head all day", value: 1 }
    ]
  },
  {
    id: 2,
    text: "Your coworker forgot to do their part of the project. Do you...",
    section: "Professional Connection Codes",
    options: [
      { text: "Fix it and take credit", value: 0 },
      { text: "Send a 'gentle reminder'", value: 1 },
      { text: "Check in with them first to see if they need help", value: 2 }
    ]
  },
  {
    id: 3,
    text: "Would you rather get a bonus or an office-wide standing ovation?",
    section: "Professional Connection Codes",
    options: [
      { text: "Show me the money!", value: 0 },
      { text: "Give me the glory!", value: 1 }
    ]
  },
  {
    id: 4,
    text: "You work best when...",
    section: "Professional Connection Codes",
    options: [
      { text: "You have a teammate to brainstorm with", value: 0 },
      { text: "You're left alone to focus", value: 1 }
    ]
  },
  {
    id: 5,
    text: "Do last-minute meetings ruin your day?",
    section: "Professional Connection Codes",
    options: [
      { text: "Nope, I roll with it", value: 0 },
      { text: "Yes, and I hold a grudge", value: 1 }
    ]
  },
  {
    id: 6,
    text: "How do you prefer to receive feedback?",
    section: "Professional Connection Codes",
    options: [
      { text: "Direct and straightforward", value: 0 },
      { text: "Gentle and supportive", value: 1 },
      { text: "Written and detailed", value: 2 }
    ]
  },
  {
    id: 7,
    text: "When facing a challenge at work, you typically...",
    section: "Professional Connection Codes",
    options: [
      { text: "Dive in head-first", value: 0 },
      { text: "Plan meticulously before starting", value: 1 },
      { text: "Seek advice from colleagues", value: 2 }
    ]
  },
  {
    id: 8,
    text: "Your ideal workspace is...",
    section: "Professional Connection Codes",
    options: [
      { text: "Open and collaborative", value: 0 },
      { text: "Private and quiet", value: 1 },
      { text: "Flexible and adaptable", value: 2 }
    ]
  },
  {
    id: 9,
    text: "When deadlines approach, you become...",
    section: "Professional Connection Codes",
    options: [
      { text: "More focused and productive", value: 0 },
      { text: "Stressed but determined", value: 1 },
      { text: "Collaborative and delegating", value: 2 }
    ]
  },
  {
    id: 10,
    text: "Your communication style is best described as...",
    section: "Professional Connection Codes",
    options: [
      { text: "Brief and to-the-point", value: 0 },
      { text: "Detailed and thorough", value: 1 },
      { text: "Friendly and conversational", value: 2 }
    ]
  },
  // Section 2: Core Personality
  {
    id: 11,
    text: "Would you rather spend all day in spreadsheets or brainstorming ideas?",
    section: "Core Personality",
    options: [
      { text: "Spreadsheets = Happiness", value: 0 },
      { text: "Brainstorming all the way!", value: 1 }
    ]
  },
  {
    id: 12,
    text: "After a long meeting, do you...",
    section: "Core Personality",
    options: [
      { text: "Need to hide in a dark room", value: 0 },
      { text: "Feel ready for a second round of coffee & chatting!", value: 1 }
    ]
  },
  {
    id: 13,
    text: "You're leading a project. Are you focused on...",
    section: "Core Personality",
    options: [
      { text: "The step-by-step execution", value: 0 },
      { text: "The big-picture vision", value: 1 }
    ]
  },
  {
    id: 14,
    text: "Change of plans! A last-minute project shift happens. Do you...",
    section: "Core Personality",
    options: [
      { text: "Pivot like a pro", value: 0 },
      { text: "Freak out but recover quickly", value: 1 },
      { text: "Silently question all of your life choices", value: 2 }
    ]
  },
  {
    id: 15,
    text: "What's your role in a group project?",
    section: "Core Personality",
    options: [
      { text: "Leader—calling the shots", value: 0 },
      { text: "Supporter—helping where needed", value: 1 },
      { text: "Wildcard—depends on the group", value: 2 }
    ]
  },
  {
    id: 16,
    text: "In meetings, you typically...",
    section: "Core Personality",
    options: [
      { text: "Lead the discussion", value: 0 },
      { text: "Take detailed notes", value: 1 },
      { text: "Contribute when asked", value: 2 }
    ]
  },
  {
    id: 17,
    text: "Your ideal project timeline is...",
    section: "Core Personality",
    options: [
      { text: "Structured with clear milestones", value: 0 },
      { text: "Flexible with room for creativity", value: 1 },
      { text: "Balanced between structure and flexibility", value: 2 }
    ]
  },
  {
    id: 18,
    text: "When solving problems, you prefer to...",
    section: "Core Personality",
    options: [
      { text: "Follow proven methods", value: 0 },
      { text: "Experiment with new approaches", value: 1 },
      { text: "Combine multiple strategies", value: 2 }
    ]
  },
  {
    id: 19,
    text: "Your energy levels are highest when...",
    section: "Core Personality",
    options: [
      { text: "Working independently", value: 0 },
      { text: "Collaborating with others", value: 1 },
      { text: "Alternating between both", value: 2 }
    ]
  },
  {
    id: 20,
    text: "Your approach to new technology is...",
    section: "Core Personality",
    options: [
      { text: "Early adopter and enthusiastic", value: 0 },
      { text: "Cautious but willing to learn", value: 1 },
      { text: "Resistant until necessary", value: 2 }
    ]
  },
  // Section 3: Motivators & Role Fit
  {
    id: 21,
    text: "What keeps you motivated at work?",
    section: "Motivators & Role Fit",
    options: [
      { text: "Praise from the boss", value: 0 },
      { text: "Cold, hard cash", value: 1 },
      { text: "A strong, supportive team", value: 2 },
      { text: "Quiet time to get stuff done", value: 3 }
    ]
  },
  {
    id: 22,
    text: "How do you handle workplace conflicts?",
    section: "Motivators & Role Fit",
    options: [
      { text: "Address them directly", value: 0 },
      { text: "Try to smooth things over", value: 1 },
      { text: "Ignore them and hope for the best", value: 2 }
    ]
  },
  {
    id: 23,
    text: "You have a big idea for improving a process. Do you...",
    section: "Motivators & Role Fit",
    options: [
      { text: "Pitch it immediately to leadership", value: 0 },
      { text: "Run it by a few teammates first", value: 1 },
      { text: "Keep it to yourself—it's too risky", value: 2 }
    ]
  },
  {
    id: 24,
    text: "Your ideal recognition comes in the form of...",
    section: "Motivators & Role Fit",
    options: [
      { text: "Public acknowledgment", value: 0 },
      { text: "Private appreciation", value: 1 },
      { text: "Tangible rewards", value: 2 }
    ]
  },
  {
    id: 25,
    text: "When it comes to career growth, you prioritize...",
    section: "Motivators & Role Fit",
    options: [
      { text: "Skill development", value: 0 },
      { text: "Leadership opportunities", value: 1 },
      { text: "Work-life balance", value: 2 }
    ]
  },
  {
    id: 26,
    text: "Your preferred learning style is...",
    section: "Motivators & Role Fit",
    options: [
      { text: "Hands-on experience", value: 0 },
      { text: "Structured training", value: 1 },
      { text: "Self-paced learning", value: 2 }
    ]
  },
  // Critical Thinking Questions
  {
    id: 27,
    text: "Describe a time you adjusted your work style for a team goal. What did you do?",
    section: "Critical Thinking",
    options: [
      { text: "Share your experience...", value: 0 }
    ]
  },
  {
    id: 28,
    text: "If you had to train someone to take over your role, how would you approach it?",
    section: "Critical Thinking",
    options: [
      { text: "Describe your approach...", value: 0 }
    ]
  }
];

export const sectionMotivationalCards = {
  "Professional Connection Codes": {
    title: "Understanding Your Professional Connection Style",
    message: "Your responses here will reveal how you naturally connect and communicate in the workplace. There are no wrong answers – just your authentic professional style!"
  },
  "Core Personality": {
    title: "Discovering Your Core Work Personality",
    message: "Let's explore what makes you unique in the workplace. Your natural tendencies and preferences shape how you contribute to your team's success."
  },
  "Motivators & Role Fit": {
    title: "What Drives Your Success",
    message: "Understanding your motivators is key to finding your ideal role and environment. Let's uncover what truly energizes you at work!"
  },
  "Critical Thinking": {
    title: "Showcase Your Strategic Thinking",
    message: "This is your chance to share deeper insights about your approach to workplace challenges and growth. Take your time with these responses!"
  }
};