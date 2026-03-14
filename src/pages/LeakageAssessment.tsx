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
} from 'lucide-react';
import { leakageQuestions, leakageCategories, type CategoryKey } from '../lib/leakageQuestions';
import { LeakageCalculator } from '../components/assessment/LeakageCalculator';

const categoryIcons: Record<CategoryKey, React.ReactNode> = {
  systems: <Monitor className="w-4 h-4" />,
  processes: <GitBranch className="w-4 h-4" />,
  people: <Users className="w-4 h-4" />,
  strategy: <TrendingUp className="w-4 h-4" />,
};

export function LeakageAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = parseInt(searchParams.get('step') || '0', 10);

  const [currentIndex, setCurrentIndex] = useState(
    initialStep >= 0 && initialStep < leakageQuestions.length ? initialStep : 0
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = leakageQuestions[currentIndex];
  const category = leakageCategories[question.category];
  const totalQuestions = leakageQuestions.length;
  const progress = (Object.keys(answers).length / totalQuestions) * 100;

  // Real-time leakage calculation
  const currentLeakage = useMemo(() => {
    let total = 0;
    for (const q of leakageQuestions) {
      const val = answers[q.id];
      if (val) {
        const opt = q.options.find(o => o.value === val);
        if (opt) total += opt.leakageMultiplier;
      }
    }
    return total;
  }, [answers]);

  function handleSelect(value: string) {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Completed — navigate to results
        const encoded = encodeURIComponent(JSON.stringify(newAnswers));
        navigate(`/leakage/results?a=${encoded}`);
      }
    }, 400);
  }

  function handlePrevious() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
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
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <motion.div
          className="bg-[#FF0000] h-1.5"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question card — takes 2/3 on desktop */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                  {/* Category + question counter */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${category.color}15`,
                        color: category.color,
                      }}
                    >
                      {categoryIcons[question.category]}
                      {category.label}
                    </div>
                    <span className="text-sm text-gray-400">
                      {currentIndex + 1} of {totalQuestions}
                    </span>
                  </div>

                  {/* Question text */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h2 className="text-xl md:text-2xl font-montserrat font-bold mb-2">
                        {question.text}
                      </h2>
                      <p className="text-sm text-gray-500 mb-6">{question.subtext}</p>

                      {/* Options */}
                      <div className="space-y-3">
                        {question.options.map((option, idx) => {
                          const isSelected = answers[question.id] === option.value;
                          return (
                            <motion.button
                              key={option.value}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => handleSelect(option.value)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#FF0000] bg-[#FF0000]/5'
                                  : 'border-gray-200 hover:border-[#FF0000]/40 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected
                                      ? 'border-[#FF0000] bg-[#FF0000]'
                                      : 'border-gray-300'
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

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentIndex === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {answers[question.id] && currentIndex < totalQuestions - 1 && (
                      <button
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-black/90 transition-colors"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky calculator sidebar — 1/3 on desktop, stacked on mobile */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-4">
                <LeakageCalculator
                  monthlyLeakage={currentLeakage}
                  isVisible={Object.keys(answers).length > 0}
                />

                {/* Category progress pills */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Progress by Area
                  </p>
                  <div className="space-y-2">
                    {(Object.keys(leakageCategories) as CategoryKey[]).map((cat) => {
                      const catQuestions = leakageQuestions.filter(q => q.category === cat);
                      const answered = catQuestions.filter(q => answers[q.id]).length;
                      const pct = (answered / catQuestions.length) * 100;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">
                              {leakageCategories[cat].label}
                            </span>
                            <span className="text-gray-400">
                              {answered}/{catQuestions.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: leakageCategories[cat].color,
                              }}
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
