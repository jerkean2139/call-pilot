// ── Industry average benchmarks ──
// Used to calculate realistic ROI projections based on user inputs

export const industryAverages = {
  // Average hourly rates by role level
  wages: {
    executive: { label: 'C-Suite / Owner', hourly: 150, annual: 312000 },
    manager: { label: 'Manager / Director', hourly: 75, annual: 156000 },
    floor: { label: 'Staff / Associate', hourly: 35, annual: 72800 },
  },
  // Automation benchmarks
  automation: {
    avgHoursSavedPerTask: 4, // hours/week saved per automated task
    aiToolMonthlyCost: 200, // avg cost of AI/automation tooling per user
    implementationWeeks: 4, // weeks to see ROI from automation
  },
  // Revenue benchmarks
  revenue: {
    avgLeadResponseLift: 0.21, // 21% more conversions with fast response
    avgAutomationProductivityGain: 0.30, // 30% productivity gain from automation
    avgClientRetentionLift: 0.15, // 15% better retention with systemized follow-up
  },
} as const;

// ── Gains question types ──

export interface GainsInputQuestion {
  id: string;
  category: 'revenue' | 'team' | 'automation' | 'opportunity';
  text: string;
  subtext: string;
  inputType: 'currency' | 'number' | 'percentage' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  suffix?: string;
  prefix?: string;
}

export const gainsCategories = {
  revenue: {
    label: 'Revenue Metrics',
    color: '#10B981',
    icon: 'DollarSign',
  },
  team: {
    label: 'Team & Labor',
    color: '#3B82F6',
    icon: 'Users',
  },
  automation: {
    label: 'Automation Potential',
    color: '#8B5CF6',
    icon: 'Zap',
  },
  opportunity: {
    label: 'Opportunity Cost',
    color: '#F59E0B',
    icon: 'Target',
  },
} as const;

export type GainsCategoryKey = keyof typeof gainsCategories;

export const gainsQuestions: GainsInputQuestion[] = [
  // ── Revenue Metrics ──
  {
    id: 'avg_client_value',
    category: 'revenue',
    text: 'What is each new client worth to your business?',
    subtext: 'Average lifetime value or annual contract value.',
    inputType: 'currency',
    placeholder: '5000',
    prefix: '$',
  },
  {
    id: 'avg_gross_sale',
    category: 'revenue',
    text: 'What is your average gross sale?',
    subtext: 'Per transaction or per project.',
    inputType: 'currency',
    placeholder: '2500',
    prefix: '$',
  },
  {
    id: 'lead_to_sale_days',
    category: 'revenue',
    text: 'How long from lead to closed sale?',
    subtext: 'Average days from first contact to signed deal.',
    inputType: 'number',
    placeholder: '30',
    suffix: 'days',
  },
  {
    id: 'lead_conversion_rate',
    category: 'revenue',
    text: 'What percentage of leads convert to paying clients?',
    subtext: 'Your current close rate.',
    inputType: 'percentage',
    placeholder: '15',
    suffix: '%',
  },
  {
    id: 'monthly_leads',
    category: 'revenue',
    text: 'How many leads do you get per month?',
    subtext: 'Inbound + outbound combined.',
    inputType: 'number',
    placeholder: '50',
  },

  // ── Team & Labor ──
  {
    id: 'team_size',
    category: 'team',
    text: 'How many people are on your team?',
    subtext: 'Full-time employees + regular contractors.',
    inputType: 'number',
    placeholder: '8',
  },
  {
    id: 'exec_count',
    category: 'team',
    text: 'How many C-suite / owners?',
    subtext: 'Including yourself.',
    inputType: 'number',
    placeholder: '1',
  },
  {
    id: 'manager_count',
    category: 'team',
    text: 'How many managers / directors?',
    subtext: 'Mid-level leadership.',
    inputType: 'number',
    placeholder: '2',
  },
  {
    id: 'avg_exec_hourly',
    category: 'team',
    text: 'What is the average hourly value of executive time?',
    subtext: 'Think about what your hour is worth in revenue-generating activity.',
    inputType: 'currency',
    placeholder: '150',
    prefix: '$',
    suffix: '/hr',
  },
  {
    id: 'avg_staff_hourly',
    category: 'team',
    text: 'What is your average staff hourly cost?',
    subtext: 'Loaded cost (salary + benefits + overhead).',
    inputType: 'currency',
    placeholder: '35',
    prefix: '$',
    suffix: '/hr',
  },

  // ── Automation Potential ──
  {
    id: 'manual_tasks_count',
    category: 'automation',
    text: 'How many repetitive tasks could be automated or AI-assisted?',
    subtext: 'Data entry, email follow-ups, reporting, scheduling, invoicing, social posts...',
    inputType: 'select',
    options: [
      { label: '1-3 tasks', value: '2' },
      { label: '4-7 tasks', value: '5' },
      { label: '8-12 tasks', value: '10' },
      { label: '13+ tasks', value: '15' },
    ],
  },
  {
    id: 'hours_on_manual_weekly',
    category: 'automation',
    text: 'Total team hours spent on these manual tasks per week?',
    subtext: 'Across your entire team — add it all up.',
    inputType: 'number',
    placeholder: '25',
    suffix: 'hrs/week',
  },
  {
    id: 'current_tool_spend',
    category: 'automation',
    text: 'What do you spend monthly on software tools?',
    subtext: 'CRM, project management, email, invoicing, all subscriptions.',
    inputType: 'currency',
    placeholder: '500',
    prefix: '$',
    suffix: '/mo',
  },

  // ── Opportunity Cost ──
  {
    id: 'owner_hours_on_low_value',
    category: 'opportunity',
    text: 'How many hours/week do YOU spend on $35/hr tasks?',
    subtext: 'Admin, inbox, scheduling, formatting — things you shouldn\'t be doing.',
    inputType: 'number',
    placeholder: '15',
    suffix: 'hrs/week',
  },
  {
    id: 'needle_mover_activity',
    category: 'opportunity',
    text: 'If you got 10 extra hours/week, what would you do with them?',
    subtext: 'This determines how we calculate your revenue upside.',
    inputType: 'select',
    options: [
      { label: 'Close more deals (sales)', value: 'sales' },
      { label: 'Build partnerships & referrals', value: 'partnerships' },
      { label: 'Create content & marketing', value: 'marketing' },
      { label: 'Develop new products/services', value: 'product' },
    ],
  },
];

// ── Gains calculation engine ──

export interface GainsInputs {
  [key: string]: string;
}

export interface GainsCalculation {
  // Cost savings
  laborSavedMonthly: number;
  toolConsolidationSavings: number;
  reworkReduction: number;
  totalMonthlySaved: number;

  // Revenue gained
  additionalDealsFromTime: number;
  revenueFromRecoveredTime: number;
  conversionLiftRevenue: number;
  retentionLiftRevenue: number;
  totalMonthlyGained: number;

  // Combined
  totalMonthlyImpact: number;
  totalAnnualImpact: number;
  hoursSavedWeekly: number;
  hoursSavedMonthly: number;

  // Breakdown by category
  categoryBreakdown: Record<GainsCategoryKey, number>;
}

export function calculateGains(inputs: GainsInputs): GainsCalculation {
  const num = (key: string, fallback: number = 0) => {
    const val = parseFloat(inputs[key] || '');
    return isNaN(val) ? fallback : val;
  };

  // ── Parse inputs ──
  const avgClientValue = num('avg_client_value', 5000);
  const avgGrossSale = num('avg_gross_sale', 2500);
  const leadToSaleDays = num('lead_to_sale_days', 30);
  const leadConversionRate = num('lead_conversion_rate', 15) / 100;
  const monthlyLeads = num('monthly_leads', 50);
  const teamSize = num('team_size', 8);
  const execCount = num('exec_count', 1);
  const managerCount = num('manager_count', 2);
  const avgExecHourly = num('avg_exec_hourly', 150);
  const avgStaffHourly = num('avg_staff_hourly', 35);
  const manualTasksCount = num('manual_tasks_count', 5);
  const hoursOnManualWeekly = num('hours_on_manual_weekly', 25);
  const currentToolSpend = num('current_tool_spend', 500);
  const ownerHoursOnLowValue = num('owner_hours_on_low_value', 15);
  const needleMover = inputs['needle_mover_activity'] || 'sales';

  // ── Cost Savings ──

  // Hours saved from automating manual tasks (assume 70% automatable)
  const hoursSavedWeekly = hoursOnManualWeekly * 0.7;
  const hoursSavedMonthly = hoursSavedWeekly * 4.33;

  // Blended hourly rate for saved labor
  const floorCount = Math.max(0, teamSize - execCount - managerCount);
  const blendedHourly =
    teamSize > 0
      ? (execCount * avgExecHourly + managerCount * ((avgExecHourly + avgStaffHourly) / 2) + floorCount * avgStaffHourly) / teamSize
      : avgStaffHourly;

  const laborSavedMonthly = hoursSavedMonthly * blendedHourly;

  // Tool consolidation: automating tasks often eliminates 20-30% of tool overlap
  const toolConsolidationSavings = currentToolSpend * 0.25;

  // Rework reduction: automating + AI reduces rework by ~40%
  // Estimate rework at 10% of total labor cost
  const totalMonthlyLabor = teamSize * blendedHourly * 40 * 4.33;
  const reworkReduction = totalMonthlyLabor * 0.10 * 0.40;

  const totalMonthlySaved = laborSavedMonthly + toolConsolidationSavings + reworkReduction;

  // ── Revenue Gained ──

  // Owner hours recovered and redirected to needle-movers
  const ownerHoursRecovered = ownerHoursOnLowValue * 0.7; // 70% automatable
  const ownerHoursRecoveredMonthly = ownerHoursRecovered * 4.33;

  // Revenue multiplier based on what they'd do with recovered time
  const revenuePerHourOfNeedleMover: Record<string, number> = {
    sales: avgGrossSale / (leadToSaleDays / 30 * 20), // ~deals closed per work hour
    partnerships: avgClientValue * 0.1, // partnerships yield referral value
    marketing: avgGrossSale * leadConversionRate * 0.5, // content drives leads
    product: avgClientValue * 0.08, // new offerings create long-term value
  };

  const hourlyRevenueValue = revenuePerHourOfNeedleMover[needleMover] || avgExecHourly;
  const revenueFromRecoveredTime = ownerHoursRecoveredMonthly * hourlyRevenueValue;

  // Additional deals from faster lead response (21% conversion lift)
  const currentMonthlyDeals = monthlyLeads * leadConversionRate;
  const liftedDeals = currentMonthlyDeals * industryAverages.revenue.avgLeadResponseLift;
  const additionalDealsFromTime = liftedDeals;
  const conversionLiftRevenue = liftedDeals * avgGrossSale;

  // Client retention lift from systemized follow-up
  const retentionLiftRevenue = currentMonthlyDeals * avgClientValue * industryAverages.revenue.avgClientRetentionLift / 12;

  const totalMonthlyGained = revenueFromRecoveredTime + conversionLiftRevenue + retentionLiftRevenue;

  // ── Category breakdown ──
  const categoryBreakdown: Record<GainsCategoryKey, number> = {
    revenue: conversionLiftRevenue + retentionLiftRevenue,
    team: laborSavedMonthly + reworkReduction,
    automation: toolConsolidationSavings + (laborSavedMonthly * 0.3), // portion attributable to automation
    opportunity: revenueFromRecoveredTime,
  };

  const totalMonthlyImpact = totalMonthlySaved + totalMonthlyGained;

  return {
    laborSavedMonthly: Math.round(laborSavedMonthly),
    toolConsolidationSavings: Math.round(toolConsolidationSavings),
    reworkReduction: Math.round(reworkReduction),
    totalMonthlySaved: Math.round(totalMonthlySaved),
    additionalDealsFromTime: Math.round(additionalDealsFromTime * 10) / 10,
    revenueFromRecoveredTime: Math.round(revenueFromRecoveredTime),
    conversionLiftRevenue: Math.round(conversionLiftRevenue),
    retentionLiftRevenue: Math.round(retentionLiftRevenue),
    totalMonthlyGained: Math.round(totalMonthlyGained),
    totalMonthlyImpact: Math.round(totalMonthlyImpact),
    totalAnnualImpact: Math.round(totalMonthlyImpact * 12),
    hoursSavedWeekly: Math.round(hoursSavedWeekly * 10) / 10,
    hoursSavedMonthly: Math.round(hoursSavedMonthly),
    categoryBreakdown,
  };
}
