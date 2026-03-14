import { useState, useMemo } from 'react';
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

type Phase = 'leakage' | 'gains';

export function LeakageAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0', 10);

  // Phase tracking
  const [phase, setPhase] = useState<Phase>('leakage');

  // Leakage state
  const [leakageIndex, setLeakageIndex] = useState(
    initialStep >= 0 && initialStep < leakageQuestions.length ? initialStep : 0
  );
  const [leakageAnswers, setLeakageAnswers] = useState<Record<number, string>>({});

  // Gains state
  const [gainsIndex, setGainsIndex] = useState(0);
  const [gainsInputs, setGainsInputs] = useState<GainsInputs>({});

  // ── Leakage calc ──
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

  // ── Gains calc ──
  const gainsCalc = useMemo(() => calculateGains(gainsInputs), [gainsInputs]);

  // ── Progress ──
  const totalAllQuestions = leakageQuestions.length + gainsQuestions.length;
  const answeredLeakage = Object.keys(leakageAnswers).length;
  const answeredGains = Object.keys(gainsInputs).length;
  const totalAnswered = answeredLeakage + answeredGains;
  const overallProgress = (totalAnswered / totalAllQuestions) * 100;

  // ── Phase 1: Leakage handlers ──
  const leakageQ = leakageQuestions[leakageIndex];
  const leakageCat = leakageQ ? leakageCategories[leakageQ.category] : null;

  function handleLeakageSelect(value: string) {
    const newAnswers = { ...leakageAnswers, [leakageQ.id]: value };
    setLeakageAnswers(newAnswers);

    setTimeout(() => {
      if (leakageIndex < leakageQuestions.length - 1) {
        setLeakageIndex(leakageIndex + 1);
      } else {
        // Transition to Phase 2
        setPhase('gains');
      }
    }, 400);
  }

  function handleLeakagePrevious() {
    if (leakageIndex > 0) setLeakageIndex(leakageIndex - 1);
  }

  // ── Phase 2: Gains handlers ──
  const gainsQ = gainsQuestions[gainsIndex];
  const gainsCat = gainsQ ? gainsCategories[gainsQ.category] : null;

  function handleGainsInput(questionId: string, value: string) {
    setGainsInputs(prev => ({ ...prev, [questionId]: value }));
  }

  function handleGainsNext() {
    if (gainsIndex < gainsQuestions.length - 1) {
      setGainsIndex(gainsIndex + 1);
    } else {
      // Navigate to results with both datasets
      const payload = {
        leakage: leakageAnswers,
        gains: gainsInputs,
      };
      const encoded = encodeURIComponent(JSON.stringify(payload));
      navigate(`/leakage/results?d=${encoded}`);
    }
  }

  function handleGainsPrevious() {
    if (gainsIndex > 0) {
      setGainsIndex(gainsIndex - 1);
    } else {
      // Go back to last leakage question
      setPhase('leakage');
      setLeakageIndex(leakageQuestions.length - 1);
    }
  }

  // ── Phase transition card ──
  if (phase === 'gains' && gainsIndex === 0 && answeredGains === 0) {
    // Show transition screen briefly, or just render gains
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-montserrat font-bold mb-2"
          >
            How Much Is Chaos Costing Your Business?
          </motion.h1>
          <p className="text-gray-400 text-sm md:text-base">
            The 3-minute test that shows if you need a Coach or a CAIO
          </p>
          {/* Phase indicator */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              phase === 'leakage' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              What You're Losing
            </div>
            <div className="w-8 h-px bg-gray-600" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              phase === 'gains' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              What You Could Gain
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar — dual color */}
      <div className="w-full bg-gray-200 h-1.5 flex">
        <motion.div
          className="bg-[#FF0000] h-1.5"
          animate={{ width: `${(answeredLeakage / totalAllQuestions) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="bg-emerald-500 h-1.5"
          animate={{ width: `${(answeredGains / totalAllQuestions) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: Leakage calculator (sticky) ── */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="lg:sticky lg:top-8 space-y-3">
                <LeakageCalculator
                  monthlyLeakage={currentLeakage}
                  isVisible={answeredLeakage > 0}
                />
              </div>
            </div>

            {/* ── CENTER: Question card ── */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              {phase === 'leakage' && leakageQ && leakageCat ? (
                /* ── LEAKAGE QUESTION ── */
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${leakageCat.color}15`,
                          color: leakageCat.color,
                        }}
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
                        <h2 className="text-xl md:text-2xl font-montserrat font-bold mb-2">
                          {leakageQ.text}
                        </h2>
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
                                  isSelected
                                    ? 'border-[#FF0000] bg-[#FF0000]/5'
                                    : 'border-gray-200 hover:border-[#FF0000]/40 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                      isSelected ? 'border-[#FF0000] bg-[#FF0000]' : 'border-gray-300'
                                    }`}
                                  >
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
                        <ArrowLeft className="w-4 h-4" />
                        Previous
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
              ) : phase === 'gains' && gainsQ && gainsCat ? (
                /* ── GAINS QUESTION ── */
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border-t-4 border-emerald-500">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${gainsCat.color}15`,
                          color: gainsCat.color,
                        }}
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
                        <h2 className="text-xl md:text-2xl font-montserrat font-bold mb-2">
                          {gainsQ.text}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">{gainsQ.subtext}</p>

                        {/* Input based on type */}
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
                                  onClick={() => {
                                    handleGainsInput(gainsQ.id, option.value);
                                  }}
                                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                      ? 'border-emerald-500 bg-emerald-50'
                                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-open-sans">{option.label}</span>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Numeric / Currency / Percentage input */
                          <div className="relative">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                              {gainsQ.prefix && (
                                <span className="pl-4 text-gray-400 font-semibold text-lg">
                                  {gainsQ.prefix}
                                </span>
                              )}
                              <input
                                type="number"
                                inputMode="numeric"
                                value={gainsInputs[gainsQ.id] || ''}
                                onChange={(e) => handleGainsInput(gainsQ.id, e.target.value)}
                                placeholder={gainsQ.placeholder}
                                className="w-full px-4 py-4 text-2xl font-montserrat font-bold text-gray-900 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              {gainsQ.suffix && (
                                <span className="pr-4 text-gray-400 font-medium text-sm whitespace-nowrap">
                                  {gainsQ.suffix}
                                </span>
                              )}
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
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={handleGainsNext}
                        disabled={!gainsInputs[gainsQ.id] && gainsQ.inputType !== 'select'}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                          !gainsInputs[gainsQ.id] && gainsQ.inputType !== 'select'
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
            </div>

            {/* ── RIGHT: Gains calculator + progress (sticky) ── */}
            <div className="lg:col-span-4 order-3">
              <div className="lg:sticky lg:top-8 space-y-4">
                <GainsCalculator
                  monthlySaved={gainsCalc.totalMonthlySaved}
                  monthlyGained={gainsCalc.totalMonthlyGained}
                  hoursSavedWeekly={gainsCalc.hoursSavedWeekly}
                  isVisible={answeredGains > 0}
                />

                {/* Net impact card — shows when both have data */}
                {answeredLeakage > 0 && answeredGains > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-gradient-to-br from-gray-900 to-black text-white p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Net Monthly Swing
                    </p>
                    <div className="flex items-center gap-2">
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

                {/* Category progress */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Progress
                  </p>
                  <div className="space-y-2">
                    {/* Leakage categories */}
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
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, backgroundColor: leakageCategories[cat].color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2" />
                    {/* Gains categories */}
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
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, backgroundColor: gainsCategories[cat].color }}
                            />
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
