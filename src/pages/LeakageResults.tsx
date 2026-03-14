import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Monitor,
  GitBranch,
  Users,
  TrendingUp,
  PhoneCall,
  ArrowRight,
  Bot,
  Lightbulb,
  Target,
  CheckCircle,
  RotateCcw,
  DollarSign,
  Zap,
  Clock,
  ArrowDown,
  ArrowUp,
  Lock,
  Mail,
  Shield,
  Star,
} from 'lucide-react';
import {
  leakageQuestions,
  leakageCategories,
  calculateLeakageResults,
  type CategoryKey,
} from '../lib/leakageQuestions';
import {
  gainsQuestions,
  gainsCategories,
  calculateGains,
  type GainsCategoryKey,
  type GainsInputs,
} from '../lib/gainsQuestions';

const leakageCategoryIcons: Record<CategoryKey, React.ReactNode> = {
  systems: <Monitor className="w-5 h-5" />,
  processes: <GitBranch className="w-5 h-5" />,
  people: <Users className="w-5 h-5" />,
  strategy: <TrendingUp className="w-5 h-5" />,
};

const recommendationContent = {
  coach: {
    title: 'You Need a Business Coach',
    icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
    description:
      'Your biggest leakage is in people management, delegation, and strategic clarity. A coach will help you build leadership capacity, create accountability structures, and develop the strategic vision to scale.',
    benefits: [
      'Develop leadership and delegation frameworks',
      'Build accountability systems for your team',
      'Create a clear 90-day strategic roadmap',
      'Break free from working IN the business',
    ],
  },
  caio: {
    title: 'You Need a Fractional CAIO',
    icon: <Bot className="w-8 h-8 text-blue-500" />,
    description:
      'Your biggest leakage is in disconnected systems, manual processes, and missing automations. A fractional Chief AI Officer will streamline your tech stack, automate workflows, and integrate AI into your operations.',
    benefits: [
      'Audit and integrate your disconnected tools',
      'Automate manual data entry and follow-ups',
      'Implement AI-powered workflows across operations',
      'Build real-time dashboards for business visibility',
    ],
  },
  both: {
    title: 'You Need Both: Coach + CAIO',
    icon: <Target className="w-8 h-8 text-purple-500" />,
    description:
      'Your leakage spans both operational systems AND strategic leadership. The most effective path combines a business coach for clarity and accountability with a fractional CAIO to automate and streamline your operations.',
    benefits: [
      'Strategic coaching to prioritize what to fix first',
      'Systems audit and AI-powered automation',
      'Leadership development alongside tech transformation',
      'Comprehensive roadmap addressing all leakage areas',
    ],
  },
};

const testimonials = [
  {
    initials: 'SC',
    name: 'Sarah C.',
    role: 'E-commerce Founder',
    quote: 'This assessment was a wake-up call. I was losing $31K/month and had no idea. Jeremy helped me plug the biggest leaks in 90 days.',
  },
  {
    initials: 'MR',
    name: 'Marcus R.',
    role: 'Agency Owner',
    quote: 'The CAIO recommendation was exactly right. We automated 12 tasks and recovered 25 hours/week. ROI hit in the first month.',
  },
  {
    initials: 'JT',
    name: 'Jessica T.',
    role: 'SaaS Founder',
    quote: 'I thought I needed a coach. The assessment showed I needed systems first. That clarity alone was worth the 3 minutes.',
  },
];

export function LeakageResults() {
  const [searchParams] = useSearchParams();
  const [unlocked, setUnlocked] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState('');

  const { leakageAnswers, gainsInputs, leakageResults, gainsCalc, hasEmail } = useMemo(() => {
    try {
      const dualRaw = searchParams.get('d');
      if (dualRaw) {
        const parsed = JSON.parse(decodeURIComponent(dualRaw));
        const la: Record<number, string> = {};
        for (const [k, v] of Object.entries(parsed.leakage || {})) {
          la[parseInt(k, 10)] = v as string;
        }
        const gi = (parsed.gains || {}) as GainsInputs;
        return {
          leakageAnswers: la,
          gainsInputs: gi,
          leakageResults: calculateLeakageResults(la),
          gainsCalc: calculateGains(gi),
          hasEmail: !!parsed.email,
        };
      }
      const raw = searchParams.get('a');
      if (raw) {
        const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, string>;
        const la: Record<number, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          la[parseInt(k, 10)] = v;
        }
        return {
          leakageAnswers: la,
          gainsInputs: {} as GainsInputs,
          leakageResults: calculateLeakageResults(la),
          gainsCalc: calculateGains({}),
          hasEmail: false,
        };
      }
      return { leakageAnswers: {}, gainsInputs: {} as GainsInputs, leakageResults: null, gainsCalc: null, hasEmail: false };
    } catch {
      return { leakageAnswers: {}, gainsInputs: {} as GainsInputs, leakageResults: null, gainsCalc: null, hasEmail: false };
    }
  }, [searchParams]);

  // Content is unlocked if user provided email during assessment OR unlocks here
  const isUnlocked = hasEmail || unlocked;

  if (!leakageResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No results found</h2>
          <Link to="/leakage" className="text-[#FF0000] font-medium hover:underline">Take the assessment</Link>
        </div>
      </div>
    );
  }

  const rec = recommendationContent[leakageResults.recommendation];
  const hasGains = gainsCalc && Object.keys(gainsInputs).length > 0;
  const netSwing = hasGains
    ? gainsCalc.totalMonthlyImpact - leakageResults.totalMonthlyLeakage
    : -leakageResults.totalMonthlyLeakage;

  const severityConfig = {
    low: { color: 'text-green-600', bg: 'bg-green-50', label: 'Low Risk' },
    moderate: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Moderate Risk' },
    high: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'High Risk' },
    critical: { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' },
  };
  const sev = severityConfig[leakageResults.severity];

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setUnlocked(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${sev.bg} ${sev.color}`}>
              {leakageResults.severity !== 'low' && <AlertTriangle className="w-4 h-4" />}
              {sev.label}
            </div>

            <div className={`grid ${hasGains ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-6 text-center`}>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ArrowDown className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400 font-semibold uppercase tracking-wider">Losing</span>
                </div>
                <p className="text-3xl md:text-4xl font-montserrat font-bold text-red-400">
                  ${leakageResults.totalMonthlyLeakage.toLocaleString()}<span className="text-lg text-gray-500">/mo</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">${leakageResults.totalAnnualLeakage.toLocaleString()}/year</p>
              </div>

              {hasGains && gainsCalc && (
                <>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ArrowUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-semibold uppercase tracking-wider">Could Gain</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-montserrat font-bold text-emerald-400">
                      ${gainsCalc.totalMonthlyImpact.toLocaleString()}<span className="text-lg text-gray-500">/mo</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">${gainsCalc.totalAnnualImpact.toLocaleString()}/year</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1">Net Monthly Swing</p>
                    <p className={`text-3xl md:text-4xl font-montserrat font-bold ${netSwing >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {netSwing >= 0 ? '+' : ''}${netSwing.toLocaleString()}<span className="text-lg text-gray-500">/mo</span>
                    </p>
                    {gainsCalc.hoursSavedWeekly > 0 && (
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-900/50 text-emerald-300">
                        <Clock className="w-3 h-3" />
                        {Math.round(gainsCalc.hoursSavedWeekly)} hrs/week recovered
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Loss aversion line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-500 mt-6"
            >
              Every month you wait, another <span className="text-red-400 font-bold">${leakageResults.totalMonthlyLeakage.toLocaleString()}</span> walks out the door.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Side-by-side breakdowns (ALWAYS VISIBLE) ── */}
          <div className={`grid ${hasGains ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-montserrat font-bold mb-5 flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-red-500" /> Where You're Losing Money
              </h2>
              <div className="space-y-4">
                {(Object.keys(leakageCategories) as CategoryKey[]).map((cat) => {
                  const data = leakageResults.categoryBreakdown[cat];
                  const pct = data.maxScore > 0 ? (data.leakage / data.maxScore) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${leakageCategories[cat].color}15` }}>
                            <span style={{ color: leakageCategories[cat].color }}>{leakageCategoryIcons[cat]}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{leakageCategories[cat].label}</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">-${data.leakage.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="h-2.5 rounded-full" style={{ backgroundColor: leakageCategories[cat].color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {hasGains && gainsCalc && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-montserrat font-bold mb-5 flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-emerald-500" /> Where You'd Gain It Back
                </h2>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Cost Savings</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Labor saved (automation)</span><span className="font-semibold text-blue-600">+${gainsCalc.laborSavedMonthly.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Tool consolidation</span><span className="font-semibold text-blue-600">+${gainsCalc.toolConsolidationSavings.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Rework reduction</span><span className="font-semibold text-blue-600">+${gainsCalc.reworkReduction.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2"><span>Total Saved</span><span className="text-blue-600">${gainsCalc.totalMonthlySaved.toLocaleString()}/mo</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Revenue Gained</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Recovered time → revenue</span><span className="font-semibold text-emerald-600">+${gainsCalc.revenueFromRecoveredTime.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Conversion lift</span><span className="font-semibold text-emerald-600">+${gainsCalc.conversionLiftRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Client retention lift</span><span className="font-semibold text-emerald-600">+${gainsCalc.retentionLiftRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2"><span>Total Gained</span><span className="text-emerald-600">${gainsCalc.totalMonthlyGained.toLocaleString()}/mo</span></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Hours recovered ── */}
          {hasGains && gainsCalc && gainsCalc.hoursSavedWeekly > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-2xl font-montserrat font-bold text-emerald-800">{Math.round(gainsCalc.hoursSavedWeekly)} hours/week back</h3>
              <p className="text-emerald-700 mt-1">That's {Math.round(gainsCalc.hoursSavedMonthly)} hours/month redirected from manual tasks into needle-moving, money-making activities.</p>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════ */}
          {/* ── GATED SECTION: Recommendation + Details ── */}
          {/* ══════════════════════════════════════════════ */}
          {!isUnlocked ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative">
              {/* Blurred preview */}
              <div className="filter blur-sm pointer-events-none select-none" aria-hidden="true">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-gray-900 to-black p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">{rec.icon}</div>
                      <div>
                        <h2 className="text-xl font-montserrat font-bold text-white">{rec.title}</h2>
                        <p className="text-gray-400 text-sm">Based on your leakage profile</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3">
                      {rec.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-montserrat font-bold mb-4">Your Answers at a Glance</h2>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Unlock overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-montserrat font-bold mb-2">
                    Unlock Your Full Recovery Plan
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    See your personalized recommendation, detailed action steps, and complete answer breakdown.
                  </p>
                  <form onSubmit={handleUnlock} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={unlockEmail}
                        onChange={(e) => setUnlockEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF0000] focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#FF0000] hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Unlock Full Report
                    </button>
                  </form>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <Shield className="w-3 h-3" />
                    <span>We'll never spam you. Unsubscribe anytime.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Unlocked: Recommendation Card ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">{rec.icon}</div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-montserrat font-bold text-white">{rec.title}</h2>
                      <p className="text-gray-400 text-sm">Based on your leakage profile</p>
                    </div>
                  </div>
                  <p className="text-gray-300">{rec.description}</p>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="font-bold text-gray-800 mb-4">What This Looks Like:</h3>
                  <ul className="space-y-3">
                    {rec.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#FF0000] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* ── Unlocked: Answer summary ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-montserrat font-bold mb-4">Your Answers at a Glance</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">Leakage Assessment</p>
                <div className="space-y-2 mb-6">
                  {leakageQuestions.map((q) => {
                    const val = leakageAnswers[q.id];
                    const opt = val ? q.options.find(o => o.value === val) : null;
                    if (!opt) return null;
                    return (
                      <div key={q.id} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
                        <p className="text-xs text-gray-600 flex-1">{q.text}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{opt.label}</span>
                          {opt.leakageMultiplier > 0 && <span className="text-xs text-red-600 font-semibold">-${opt.leakageMultiplier.toLocaleString()}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasGains && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-2">Growth Assessment</p>
                    <div className="space-y-2">
                      {gainsQuestions.map((q) => {
                        const val = gainsInputs[q.id];
                        if (!val) return null;
                        const displayVal = q.inputType === 'select'
                          ? q.options?.find(o => o.value === val)?.label || val
                          : q.inputType === 'currency' ? `$${parseInt(val).toLocaleString()}`
                          : q.inputType === 'percentage' ? `${val}%`
                          : `${val}${q.suffix ? ` ${q.suffix}` : ''}`;
                        return (
                          <div key={q.id} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
                            <p className="text-xs text-gray-600 flex-1">{q.text}</p>
                            <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">{displayVal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}

          {/* ── Social Proof: Testimonials ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{t.quote}"</p>
                  <div className="flex mt-3 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              327 entrepreneurs assessed this month — average recovery: $18,400/month
            </p>
          </motion.div>

          {/* ── CTA — Book a Call with Jeremy ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-[#FF0000] to-[#CC0000] rounded-xl shadow-lg p-8 md:p-10 text-center text-white"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-3">
              Stop the Leak. Talk to Jeremy.
            </h2>

            {/* Loss aversion line */}
            <p className="text-white/90 font-semibold text-lg mb-2">
              Every month you wait, another ${leakageResults.totalMonthlyLeakage.toLocaleString()} walks out the door.
            </p>

            <p className="text-white/70 max-w-lg mx-auto mb-6">
              In a free 30-minute call, Jeremy will walk through your results, identify your
              highest-ROI fix, and map out a 90-day action plan — whether that's coaching, a
              fractional CAIO, or both.
            </p>

            {hasGains && gainsCalc && (
              <p className="text-white font-bold text-lg mb-4">
                Your potential upside: ${gainsCalc.totalAnnualImpact.toLocaleString()}/year
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#FF0000] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors group"
              >
                <PhoneCall className="w-5 h-5" />
                Book Your Free Strategy Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Risk reversal */}
            <p className="text-white/60 text-sm mt-4">
              No pitch. No contract. Just your personalized recovery roadmap.
            </p>

            {/* Social proof under CTA */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="flex -space-x-2">
                {['S', 'M', 'J'].map((initial, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/20 border-2 border-red-600 flex items-center justify-center text-xs font-bold text-white/80">
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-white/50 text-xs">Avg recovery: $18,400/mo</span>
            </div>
          </motion.div>

          {/* Retake */}
          <div className="text-center pb-8">
            <Link to="/leakage" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
              <RotateCcw className="w-4 h-4" /> Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
