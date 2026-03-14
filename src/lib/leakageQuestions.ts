export interface LeakageOption {
  label: string;
  value: string;
  leakageMultiplier: number; // monthly $ leakage this answer contributes
}

export interface LeakageQuestion {
  id: number;
  category: 'systems' | 'processes' | 'people' | 'strategy';
  text: string;
  subtext: string;
  options: LeakageOption[];
}

export const leakageCategories = {
  systems: {
    label: 'Systems & Tools',
    color: '#3B82F6',
    icon: 'Monitor',
  },
  processes: {
    label: 'Processes & Workflows',
    color: '#10B981',
    icon: 'GitBranch',
  },
  people: {
    label: 'People & Delegation',
    color: '#F59E0B',
    icon: 'Users',
  },
  strategy: {
    label: 'Strategy & Growth',
    color: '#8B5CF6',
    icon: 'TrendingUp',
  },
} as const;

export const leakageQuestions: LeakageQuestion[] = [
  // ── Systems & Tools (Q1–Q4) ──
  {
    id: 1,
    category: 'systems',
    text: 'How many software tools does your team use that don\'t talk to each other?',
    subtext: 'Think CRM, project management, invoicing, email, spreadsheets...',
    options: [
      { label: 'Everything is integrated', value: 'integrated', leakageMultiplier: 0 },
      { label: '2-3 disconnected tools', value: 'some', leakageMultiplier: 100 },
      { label: '4-6 disconnected tools', value: 'many', leakageMultiplier: 275 },
      { label: 'I\'ve lost count', value: 'chaos', leakageMultiplier: 550 },
    ],
  },
  {
    id: 2,
    category: 'systems',
    text: 'How much time does your team spend on manual data entry each week?',
    subtext: 'Copy-pasting between tools, updating spreadsheets, re-entering info...',
    options: [
      { label: 'Almost none — it\'s automated', value: 'automated', leakageMultiplier: 0 },
      { label: '2-5 hours/week', value: 'some', leakageMultiplier: 135 },
      { label: '5-15 hours/week', value: 'significant', leakageMultiplier: 400 },
      { label: '15+ hours/week', value: 'extreme', leakageMultiplier: 800 },
    ],
  },
  {
    id: 3,
    category: 'systems',
    text: 'When a lead comes in, how quickly does your team respond?',
    subtext: 'Speed-to-lead is the #1 predictor of conversion.',
    options: [
      { label: 'Within minutes (automated)', value: 'instant', leakageMultiplier: 0 },
      { label: 'Within a few hours', value: 'hours', leakageMultiplier: 225 },
      { label: 'Next business day', value: 'nextday', leakageMultiplier: 525 },
      { label: 'It depends on who sees it first', value: 'random', leakageMultiplier: 875 },
    ],
  },
  {
    id: 4,
    category: 'systems',
    text: 'Do you have a single dashboard showing your business health?',
    subtext: 'Revenue, pipeline, team capacity, project status — all in one place.',
    options: [
      { label: 'Yes — real-time and automated', value: 'realtime', leakageMultiplier: 0 },
      { label: 'Partially — I check a few places', value: 'partial', leakageMultiplier: 110 },
      { label: 'I rely on gut feel and spreadsheets', value: 'gut', leakageMultiplier: 350 },
      { label: 'I don\'t know my numbers until month-end', value: 'blind', leakageMultiplier: 685 },
    ],
  },

  // ── Processes & Workflows (Q5–Q7) ──
  {
    id: 5,
    category: 'processes',
    text: 'If you disappeared for 2 weeks, would your business run without you?',
    subtext: 'This reveals how dependent your operations are on you personally.',
    options: [
      { label: 'Yes — systems and team handle it', value: 'independent', leakageMultiplier: 0 },
      { label: 'Mostly — a few things would stall', value: 'mostly', leakageMultiplier: 185 },
      { label: 'It would slow down significantly', value: 'slow', leakageMultiplier: 475 },
      { label: 'It would basically stop', value: 'stop', leakageMultiplier: 1000 },
    ],
  },
  {
    id: 6,
    category: 'processes',
    text: 'How often do tasks fall through the cracks?',
    subtext: 'Missed follow-ups, forgotten deliverables, duplicate work...',
    options: [
      { label: 'Rarely — we have checklists and automations', value: 'rare', leakageMultiplier: 0 },
      { label: 'Occasionally — maybe once a month', value: 'occasional', leakageMultiplier: 150 },
      { label: 'Frequently — weekly at least', value: 'frequent', leakageMultiplier: 435 },
      { label: 'Constantly — it\'s our biggest problem', value: 'constant', leakageMultiplier: 850 },
    ],
  },
  {
    id: 7,
    category: 'processes',
    text: 'How do you onboard a new client or team member?',
    subtext: 'Standardized processes vs. figuring it out each time.',
    options: [
      { label: 'Documented SOPs and automated sequences', value: 'documented', leakageMultiplier: 0 },
      { label: 'We have templates but it\'s mostly manual', value: 'templates', leakageMultiplier: 125 },
      { label: 'Someone walks them through it each time', value: 'manual', leakageMultiplier: 350 },
      { label: 'It\'s different every time', value: 'adhoc', leakageMultiplier: 650 },
    ],
  },

  // ── People & Delegation (Q8–Q11) ──
  {
    id: 8,
    category: 'people',
    text: 'How many hours per week do YOU spend on tasks that someone else could do?',
    subtext: 'Admin, scheduling, inbox, formatting, basic customer questions...',
    options: [
      { label: 'Less than 2 hours', value: 'minimal', leakageMultiplier: 0 },
      { label: '2-8 hours', value: 'some', leakageMultiplier: 250 },
      { label: '8-20 hours', value: 'significant', leakageMultiplier: 685 },
      { label: '20+ hours — I\'m the bottleneck', value: 'bottleneck', leakageMultiplier: 1250 },
    ],
  },
  {
    id: 9,
    category: 'people',
    text: 'Does your team know exactly what to do each day without asking you?',
    subtext: 'Clear roles, KPIs, and decision-making authority.',
    options: [
      { label: 'Yes — they\'re self-directed', value: 'selfdirected', leakageMultiplier: 0 },
      { label: 'Mostly — occasional questions', value: 'mostly', leakageMultiplier: 150 },
      { label: 'They need daily direction', value: 'daily', leakageMultiplier: 435 },
      { label: 'I\'m a one-person show', value: 'solo', leakageMultiplier: 750 },
    ],
  },
  {
    id: 10,
    category: 'people',
    text: 'How often do you redo or fix work your team has completed?',
    subtext: 'Rework is one of the most expensive hidden costs.',
    options: [
      { label: 'Almost never — quality is consistent', value: 'never', leakageMultiplier: 0 },
      { label: 'Sometimes — minor corrections', value: 'sometimes', leakageMultiplier: 185 },
      { label: 'Often — it\'s faster to do it myself', value: 'often', leakageMultiplier: 525 },
      { label: 'Constantly — I can\'t trust the output', value: 'constantly', leakageMultiplier: 935 },
    ],
  },
  {
    id: 11,
    category: 'people',
    text: 'Are you using AI tools in your daily operations?',
    subtext: 'ChatGPT, automations, AI-powered workflows, etc.',
    options: [
      { label: 'Yes — integrated into our core workflows', value: 'integrated', leakageMultiplier: 0 },
      { label: 'Experimenting — using it for some tasks', value: 'experimenting', leakageMultiplier: 225 },
      { label: 'Aware of it but haven\'t started', value: 'aware', leakageMultiplier: 500 },
      { label: 'Not at all — I don\'t know where to start', value: 'none', leakageMultiplier: 935 },
    ],
  },

  // ── Strategy & Growth (Q12–Q14) ──
  {
    id: 12,
    category: 'strategy',
    text: 'How confident are you in your revenue forecast for the next 90 days?',
    subtext: 'Predictability is the foundation of growth.',
    options: [
      { label: 'Very confident — data-driven forecast', value: 'confident', leakageMultiplier: 0 },
      { label: 'Somewhat — I have a rough idea', value: 'rough', leakageMultiplier: 185 },
      { label: 'Not very — it fluctuates unpredictably', value: 'unpredictable', leakageMultiplier: 500 },
      { label: 'I have no idea what next month looks like', value: 'blind', leakageMultiplier: 1000 },
    ],
  },
  {
    id: 13,
    category: 'strategy',
    text: 'How much revenue are you leaving on the table from existing clients?',
    subtext: 'Upsells, cross-sells, renewals, referrals you\'re not capturing.',
    options: [
      { label: 'We have systems to capture expansion revenue', value: 'capturing', leakageMultiplier: 0 },
      { label: 'We do some follow-up but it\'s inconsistent', value: 'inconsistent', leakageMultiplier: 310 },
      { label: 'We rarely follow up after the initial sale', value: 'rarely', leakageMultiplier: 685 },
      { label: 'We don\'t have any post-sale process', value: 'none', leakageMultiplier: 1125 },
    ],
  },
  {
    id: 14,
    category: 'strategy',
    text: 'What\'s stopping you from growing 2x in the next 12 months?',
    subtext: 'Be honest — this shapes your recommendation.',
    options: [
      { label: 'Nothing — I have a clear roadmap', value: 'clear', leakageMultiplier: 0 },
      { label: 'I need better systems to handle scale', value: 'systems', leakageMultiplier: 250 },
      { label: 'I\'m too busy working IN the business', value: 'busy', leakageMultiplier: 625 },
      { label: 'I don\'t know what I don\'t know', value: 'unknown', leakageMultiplier: 1060 },
    ],
  },
];

export type CategoryKey = keyof typeof leakageCategories;

export interface LeakageResults {
  totalMonthlyLeakage: number;
  totalAnnualLeakage: number;
  categoryBreakdown: Record<CategoryKey, { score: number; maxScore: number; leakage: number }>;
  recommendation: 'coach' | 'caio' | 'both';
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export function calculateLeakageResults(answers: Record<number, string>): LeakageResults {
  const categoryBreakdown: Record<CategoryKey, { score: number; maxScore: number; leakage: number }> = {
    systems: { score: 0, maxScore: 0, leakage: 0 },
    processes: { score: 0, maxScore: 0, leakage: 0 },
    people: { score: 0, maxScore: 0, leakage: 0 },
    strategy: { score: 0, maxScore: 0, leakage: 0 },
  };

  let totalMonthlyLeakage = 0;

  for (const question of leakageQuestions) {
    const selectedValue = answers[question.id];
    const cat = question.category;
    const maxLeakage = Math.max(...question.options.map(o => o.leakageMultiplier));
    categoryBreakdown[cat].maxScore += maxLeakage;

    if (selectedValue) {
      const selectedOption = question.options.find(o => o.value === selectedValue);
      if (selectedOption) {
        categoryBreakdown[cat].leakage += selectedOption.leakageMultiplier;
        categoryBreakdown[cat].score += selectedOption.leakageMultiplier;
        totalMonthlyLeakage += selectedOption.leakageMultiplier;
      }
    }
  }

  const totalAnnualLeakage = totalMonthlyLeakage * 12;

  // Determine recommendation based on where the leakage is concentrated
  const systemsProcessLeakage = categoryBreakdown.systems.leakage + categoryBreakdown.processes.leakage;
  const peopleStrategyLeakage = categoryBreakdown.people.leakage + categoryBreakdown.strategy.leakage;

  let recommendation: 'coach' | 'caio' | 'both';
  if (systemsProcessLeakage > peopleStrategyLeakage * 1.5) {
    recommendation = 'caio'; // Systems-heavy problems → need a CAIO
  } else if (peopleStrategyLeakage > systemsProcessLeakage * 1.5) {
    recommendation = 'coach'; // People/strategy problems → need a coach
  } else {
    recommendation = 'both'; // Balanced problems → need both
  }

  let severity: 'low' | 'moderate' | 'high' | 'critical';
  if (totalMonthlyLeakage < 1500) severity = 'low';
  else if (totalMonthlyLeakage < 3500) severity = 'moderate';
  else if (totalMonthlyLeakage < 6000) severity = 'high';
  else severity = 'critical';

  return {
    totalMonthlyLeakage,
    totalAnnualLeakage,
    categoryBreakdown,
    recommendation,
    severity,
  };
}
