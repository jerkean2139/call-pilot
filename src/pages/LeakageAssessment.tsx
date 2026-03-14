import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Monitor,
  GitBranch,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  Mail,
  Lock,
  Star,
  Shield,
} from 'lucide-react';
import { leakageQuestions, leakageCategories, type CategoryKey } from '../lib/leakageQuestions';
import {
  gainsQuestions,
  gainsCategories,
  calculateGains,
  type GainsCategoryKey,
  type GainsInputs,
} from '../lib/gainsQuestions';
import { LeakageCalculator } from '../components/assessment/LeakageCalculator';
import { GainsCalculator } from '../components/assessment/GainsCalculator';

const leakageCategoryIcons: Record<CategoryKey, React.ReactNode> = {
  systems: <Monitor className="w-4 h-4" />,
  processes: <GitBranch className="w-4 h-4" />,
  people: <Users className="w-4 h-4" />,
  strategy: <TrendingUp className="w-4 h-4" />,
};

const gainsCategoryIcons: Record<GainsCategoryKey, React.ReactNode> = {
  revenue: <DollarSign className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  automation: <Zap className="w-4 h-4" />,
  opportunity: <Target className="w-4 h-4" />,
};

// ── Interstitial screens ──
type Screen = 'intro' | 'leakage' | 'milestone' | 'transition' | 'gains' | 'email-gate';

// Confetti burst component
function ConfettiBurst() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 100),
    rotate: Math.random() * 720 - 360,
    color: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#FF0000'][Math.floor(Math.random() * 5)],
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

export function LeakageAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0', 10);

  const [screen, setScreen] = useState<Screen>('intro');
  const [leakageIndex, setLeakageIndex] = useState(
    initialStep >= 0 && initialStep < leakageQuestions.length ? initialStep : 0
  );
  const [leakageAnswers, setLeakageAnswers] = useState<Record<number, string>>({});
  const [gainsIndex, setGainsIndex] = useState(0);
  const [gainsInputs, setGainsInputs] = useState<GainsInputs>({});
  const [email, setEmail] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestoneShown, setMilestoneShown] = useState(false);

  // ── Calculations ──
  const currentLeakage = useMemo(() => {
    let total = 0;
    for (const q of leakageQuestions) {
      const val = leakageAnswers[q.id];
      if (val) {
        const opt = q.options.find(o => o.value === val);
        if (opt) total += opt.leakageMultiplier;
      }
    }
    return total;
  }, [leakageAnswers]);

  const gainsCalc = useMemo(() => calculateGains(gainsInputs), [gainsInputs]);

  const totalAllQuestions = leakageQuestions.length + gainsQuestions.length;
  const answeredLeakage = Object.keys(leakageAnswers).length;
  const answeredGains = Object.keys(gainsInputs).length;

  // ── Smart progress label ──
  const getProgressLabel = () => {
    const total = answeredLeakage + answeredGains;
    if (total === 0) return '';
    if (total === totalAllQuestions - 1) return 'Last question!';
    if (total >= totalAllQuestions * 0.85) return 'Almost there...';
    if (total >= totalAllQuestions * 0.5) return 'Over halfway!';
    return `${total} of ${totalAllQuestions}`;
  };

  // ── Leakage handlers ──
  const leakageQ = leakageQuestions[leakageIndex];
  const leakageCat = leakageQ ? leakageCategories[leakageQ.category] : null;

  function handleLeakageSelect(value: string) {
    const newAnswers = { ...leakageAnswers, [leakageQ.id]: value };
    setLeakageAnswers(newAnswers);

    setTimeout(() => {
      const nextIdx = leakageIndex + 1;
      // Milestone check: after question 7 (halfway through leakage), if not yet shown
      if (nextIdx === 7 && !milestoneShown) {
        setMilestoneShown(true);
        setScreen('milestone');
        return;
      }
      if (nextIdx < leakageQuestions.length) {
        setLeakageIndex(nextIdx);
      } else {
        setScreen('transition');
      }
    }, 400);
  }

  function handleLeakagePrevious() {
    if (leakageIndex > 0) setLeakageIndex(leakageIndex - 1);
  }

  // ── Gains handlers ──
  const gainsQ = gainsQuestions[gainsIndex];
  const gainsCat = gainsQ ? gainsCategories[gainsQ.category] : null;

  function handleGainsInput(questionId: string, value: string) {
    setGainsInputs(prev => ({ ...prev, [questionId]: value }));
  }

  function handleGainsNext() {
    if (gainsIndex < gainsQuestions.length - 1) {
      setGainsIndex(gainsIndex + 1);
    } else {
      // Show confetti then go to email gate
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setScreen('email-gate');
      }, 1500);
    }
  }

  function handleGainsPrevious() {
    if (gainsIndex > 0) {
      setGainsIndex(gainsIndex - 1);
    } else {
      setScreen('leakage');
      setLeakageIndex(leakageQuestions.length - 1);
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { leakage: leakageAnswers, gains: gainsInputs, email };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    navigate(`/leakage/results?d=${encoded}`);
  }

  function handleSkipEmail() {
    const payload = { leakage: leakageAnswers, gains: gainsInputs };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    navigate(`/leakage/results?d=${encoded}`);
  }

  // ══════════════════════════════════════
  // ── INTRO SCREEN (Gut Punch) ──
  // ══════════════════════════════════════
  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm uppercase tracking-widest text-red-400 font-semibold mb-4"
          >
            Stop being the bottleneck. Start being the CEO.
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl md:text-5xl font-montserrat font-bold text-white mb-6 leading-tight"
          >
            You're not running your business.{' '}
            <span className="text-red-500">It's running you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-gray-400 mb-4"
          >
            Every founder hits a ceiling — drowning in ops, fighting fires, losing{' '}
            <span className="text-red-400 font-semibold">$12,000–$47,000/month</span>{' '}
            to operational chaos they can't even see.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-lg text-gray-500 mb-10"
          >
            This 3-minute assessment reveals exactly where your business is bleeding cash —
            and whether you need a <span className="text-white font-semibold">business coach</span> or
            a <span className="text-white font-semibold">fractional Chief AI Officer</span> to
            turn you from operator into CEO.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={() => setScreen('leakage')}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors group inline-flex items-center gap-2"
          >
            Find Out What You're Losing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-8 flex items-center justify-center gap-4 text-gray-500 text-sm"
          >
            <div className="flex -space-x-2">
              {['S', 'M', 'J', 'A'].map((initial, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-xs font-bold text-gray-400"
                >
                  {initial}
                </div>
              ))}
            </div>
            <span>327 entrepreneurs have made the shift from operator to CEO</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // ── MILESTONE CARD (halfway through leakage) ──
  // ══════════════════════════════════════
  if (screen === 'milestone') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg text-center bg-white rounded-2xl shadow-lg p-10"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-montserrat font-bold mb-3">You're halfway there.</h2>

          <p className="text-4xl font-montserrat font-bold text-red-600 mb-2">
            ${currentLeakage.toLocaleString()}/mo
          </p>
          <p className="text-gray-500 mb-6">
            Based on your answers so far, you're in the{' '}
            <span className="font-bold text-gray-900">top 15% of leakage</span> we've seen.
          </p>

          <p className="text-sm text-gray-400 mb-8">
            Finish the assessment to unlock your personalized recovery plan.
          </p>

          <button
            onClick={() => {
              setScreen('leakage');
              setLeakageIndex(7);
            }}
            className="bg-black hover:bg-black/90 text-white px-8 py-3 rounded-lg font-bold transition-colors inline-flex items-center gap-2"
          >
            Keep Going
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // ── TRANSITION CARD (leakage → gains) ──
  // ══════════════════════════════════════
  if (screen === 'transition') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg text-center"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-montserrat font-bold text-red-500 mb-4"
          >
            ${currentLeakage.toLocaleString()}<span className="text-2xl text-gray-500">/mo</span>
          </motion.p>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-montserrat font-bold text-white mb-3"
          >
            That's what's keeping you stuck as the operator — not the CEO.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-gray-400 mb-4"
          >
            Now let's see what your business looks like when you stop doing everything yourself.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-sm text-gray-500 mb-10"
          >
            The next questions calculate your <span className="text-emerald-400 font-semibold">CEO potential</span> —
            the revenue, time, and freedom you unlock with the right strategy.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            onClick={() => {
              setScreen('gains');
              setGainsIndex(0);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center gap-2 group"
          >
            Show Me My CEO Potential
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // ── EMAIL GATE (before results) ──
  // ══════════════════════════════════════
  if (screen === 'email-gate') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center relative z-10"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>

          <h2 className="text-2xl font-montserrat font-bold mb-2">Your results are ready.</h2>

          <div className="flex items-center justify-center gap-6 my-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">-${currentLeakage.toLocaleString()}</p>
              <p className="text-xs text-gray-400">leaking/mo</p>
            </div>
            <div className="text-gray-300 text-2xl">→</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">+${gainsCalc.totalMonthlyImpact.toLocaleString()}</p>
              <p className="text-xs text-gray-400">potential/mo</p>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Enter your email to see your personalized report. We'll also send you a PDF copy.
          </p>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF0000] hover:bg-red-700 text-white py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              See My Results
            </button>
          </form>

          <button
            onClick={handleSkipEmail}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Skip — show me the summary only
          </button>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>We'll never spam you. Unsubscribe anytime.</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // ── MAIN QUESTION FLOW ──
  // ══════════════════════════════════════
  const isLeakagePhase = screen === 'leakage';
  const isGainsPhase = screen === 'gains';

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Confetti overlay */}
      {showConfetti && <ConfettiBurst />}

      {/* Hero header */}
      <div className="bg-black text-white py-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-xl md:text-2xl font-montserrat font-bold mb-1">
            What's Standing Between You and CEO Mode?
          </h1>
          {/* Phase indicator */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isLeakagePhase ? 'bg-red-600 text-white' : answeredLeakage > 0 ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {answeredLeakage === leakageQuestions.length ? <Check className="w-3 h-3" /> : '1'}
              </span>
              What You're Losing
            </div>
            <div className="w-8 h-px bg-gray-600" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              isGainsPhase ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              What You Could Gain
            </div>
          </div>
        </div>
      </div>

      {/* Dual progress bar */}
      <div className="w-full bg-gray-200 h-1.5 flex">
        <motion.div className="bg-[#FF0000] h-1.5" animate={{ width: `${(answeredLeakage / totalAllQuestions) * 100}%` }} transition={{ duration: 0.3 }} />
        <motion.div className="bg-emerald-500 h-1.5" animate={{ width: `${(answeredGains / totalAllQuestions) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Progress label */}
      <div className="text-center py-2">
        <span className="text-xs font-medium text-gray-400">{getProgressLabel()}</span>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: Leakage calculator ── */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="lg:sticky lg:top-8 space-y-3">
                <LeakageCalculator monthlyLeakage={currentLeakage} isVisible={answeredLeakage > 0} />
              </div>
            </div>

            {/* ── CENTER: Question card ── */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              {isLeakagePhase && leakageQ && leakageCat ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${leakageCat.color}15`, color: leakageCat.color }}
                      >
                        {leakageCategoryIcons[leakageQ.category]}
                        {leakageCat.label}
                      </div>
                      <span className="text-sm text-gray-400">
                        {leakageIndex + 1} of {totalAllQuestions}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`leak-${leakageQ.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h2 className="text-xl md:text-2xl font-montserrat font-bold mb-2">{leakageQ.text}</h2>
                        <p className="text-sm text-gray-500 mb-6">{leakageQ.subtext}</p>
                        <div className="space-y-3">
                          {leakageQ.options.map((option, idx) => {
                            const isSelected = leakageAnswers[leakageQ.id] === option.value;
                            return (
                              <motion.button
                                key={option.value}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleLeakageSelect(option.value)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                  isSelected ? 'border-[#FF0000] bg-[#FF0000]/5' : 'border-gray-200 hover:border-[#FF0000]/40 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected ? 'border-[#FF0000] bg-[#FF0000]' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="font-open-sans">{option.label}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={handleLeakagePrevious}
                        disabled={leakageIndex === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          leakageIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous
                      </button>
                      {leakageAnswers[leakageQ.id] && leakageIndex < leakageQuestions.length - 1 && (
                        <button
                          onClick={() => setLeakageIndex(leakageIndex + 1)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/90 transition-colors"
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : isGainsPhase && gainsQ && gainsCat ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border-t-4 border-emerald-500">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${gainsCat.color}15`, color: gainsCat.color }}
                      >
                        {gainsCategoryIcons[gainsQ.category]}
                        {gainsCat.label}
                      </div>
                      <span className="text-sm text-gray-400">
                        {leakageQuestions.length + gainsIndex + 1} of {totalAllQuestions}
                      </span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`gain-${gainsQ.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h2 className="text-xl md:text-2xl font-montserrat font-bold mb-2">{gainsQ.text}</h2>
                        <p className="text-sm text-gray-500 mb-6">{gainsQ.subtext}</p>

                        {gainsQ.inputType === 'select' && gainsQ.options ? (
                          <div className="space-y-3">
                            {gainsQ.options.map((option, idx) => {
                              const isSelected = gainsInputs[gainsQ.id] === option.value;
                              return (
                                <motion.button
                                  key={option.value}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  onClick={() => handleGainsInput(gainsQ.id, option.value)}
                                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                      isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-open-sans">{option.label}</span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                              {gainsQ.prefix && <span className="pl-4 text-gray-400 font-semibold text-lg">{gainsQ.prefix}</span>}
                              <input
                                type="number"
                                inputMode="numeric"
                                value={gainsInputs[gainsQ.id] || ''}
                                onChange={(e) => handleGainsInput(gainsQ.id, e.target.value)}
                                placeholder={gainsQ.placeholder}
                                className="w-full px-4 py-4 text-2xl font-montserrat font-bold text-gray-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {gainsQ.suffix && <span className="pr-4 text-gray-400 font-medium text-sm whitespace-nowrap">{gainsQ.suffix}</span>}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                      <button
                        onClick={handleGainsPrevious}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" /> Previous
                      </button>
                      <button
                        onClick={handleGainsNext}
                        disabled={!gainsInputs[gainsQ.id]}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          !gainsInputs[gainsQ.id]
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {gainsIndex === gainsQuestions.length - 1 ? 'See Results' : 'Next'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Social proof bar under question card */}
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>100% confidential</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>4.9/5 from 327 assessments</span>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Gains calculator + progress ── */}
            <div className="lg:col-span-4 order-3">
              <div className="lg:sticky lg:top-8 space-y-4">
                <GainsCalculator
                  monthlySaved={gainsCalc.totalMonthlySaved}
                  monthlyGained={gainsCalc.totalMonthlyGained}
                  hoursSavedWeekly={gainsCalc.hoursSavedWeekly}
                  isVisible={answeredGains > 0}
                />

                {answeredLeakage > 0 && answeredGains > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-gradient-to-br from-gray-900 to-black text-white p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Net Monthly Swing</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-red-400">-${currentLeakage.toLocaleString()}</span>
                      <span className="text-gray-500">+</span>
                      <span className="text-xs text-emerald-400">+${gainsCalc.totalMonthlyImpact.toLocaleString()}</span>
                      <span className="text-gray-500">=</span>
                      <span className={`text-sm font-bold ${
                        gainsCalc.totalMonthlyImpact - currentLeakage >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ${(gainsCalc.totalMonthlyImpact - currentLeakage).toLocaleString()}/mo
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Mini testimonial */}
                {answeredLeakage >= 5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-sm p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                        MR
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 italic">
                          "I thought I was running a tight ship. This assessment showed me I was leaking $22K/month in places I never thought to look."
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-semibold">— Marcus R., Agency Owner</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress pills */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Progress</p>
                  <div className="space-y-2">
                    {(Object.keys(leakageCategories) as CategoryKey[]).map((cat) => {
                      const catQs = leakageQuestions.filter(q => q.category === cat);
                      const answered = catQs.filter(q => leakageAnswers[q.id]).length;
                      const pct = (answered / catQs.length) * 100;
                      return (
                        <div key={`l-${cat}`}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">{leakageCategories[cat].label}</span>
                            <span className="text-gray-400">{answered}/{catQs.length}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: leakageCategories[cat].color }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-100 my-2" />
                    {(Object.keys(gainsCategories) as GainsCategoryKey[]).map((cat) => {
                      const catQs = gainsQuestions.filter(q => q.category === cat);
                      const answered = catQs.filter(q => gainsInputs[q.id]).length;
                      const pct = (answered / catQs.length) * 100;
                      return (
                        <div key={`g-${cat}`}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">{gainsCategories[cat].label}</span>
                            <span className="text-gray-400">{answered}/{catQs.length}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: gainsCategories[cat].color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
