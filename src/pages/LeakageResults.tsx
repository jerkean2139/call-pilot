import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign,
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
} from 'lucide-react';
import {
  leakageQuestions,
  leakageCategories,
  calculateLeakageResults,
  type CategoryKey,
} from '../lib/leakageQuestions';

const categoryIcons: Record<CategoryKey, React.ReactNode> = {
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

export function LeakageResults() {
  const [searchParams] = useSearchParams();

  const { answers, results } = useMemo(() => {
    try {
      const raw = searchParams.get('a');
      if (!raw) return { answers: {} as Record<number, string>, results: null };
      const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, string>;
      // Convert string keys to numbers
      const numbered: Record<number, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        numbered[parseInt(k, 10)] = v;
      }
      return { answers: numbered, results: calculateLeakageResults(numbered) };
    } catch {
      return { answers: {} as Record<number, string>, results: null };
    }
  }, [searchParams]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No results found</h2>
          <Link
            to="/leakage"
            className="text-[#FF0000] font-medium hover:underline"
          >
            Take the assessment
          </Link>
        </div>
      </div>
    );
  }

  const rec = recommendationContent[results.recommendation];

  const severityConfig = {
    low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Low Risk' },
    moderate: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Moderate Risk' },
    high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'High Risk' },
    critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Critical' },
  };
  const sev = severityConfig[results.severity];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${sev.bg} ${sev.color}`}>
              {results.severity !== 'low' && <AlertTriangle className="w-4 h-4" />}
              {sev.label}
            </div>
            <h1 className="text-3xl md:text-5xl font-montserrat font-bold mb-3">
              You're Leaking{' '}
              <span className="text-[#FF0000]">
                ${results.totalMonthlyLeakage.toLocaleString()}
              </span>
              /month
            </h1>
            <p className="text-xl text-gray-400">
              That's{' '}
              <span className="text-white font-bold">
                ${results.totalAnnualLeakage.toLocaleString()}
              </span>{' '}
              per year walking out the door
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 md:p-8"
          >
            <h2 className="text-xl font-montserrat font-bold mb-6">
              Where You're Losing Money
            </h2>
            <div className="space-y-5">
              {(Object.keys(leakageCategories) as CategoryKey[]).map((cat) => {
                const data = results.categoryBreakdown[cat];
                const pct = data.maxScore > 0 ? (data.leakage / data.maxScore) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${leakageCategories[cat].color}15` }}
                        >
                          <span style={{ color: leakageCategories[cat].color }}>
                            {categoryIcons[cat]}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {leakageCategories[cat].label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${data.leakage.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-3 rounded-full"
                        style={{ backgroundColor: leakageCategories[cat].color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recommendation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                  {rec.icon}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-montserrat font-bold text-white">
                    {rec.title}
                  </h2>
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

          {/* What you told us — quick answer summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 md:p-8"
          >
            <h2 className="text-xl font-montserrat font-bold mb-4">Your Answers at a Glance</h2>
            <div className="space-y-3">
              {leakageQuestions.map((q) => {
                const val = answers[q.id];
                const opt = val ? q.options.find(o => o.value === val) : null;
                if (!opt) return null;
                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0"
                  >
                    <p className="text-sm text-gray-600 flex-1">{q.text}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {opt.label}
                      </span>
                      {opt.leakageMultiplier > 0 && (
                        <span className="text-xs text-red-600 font-semibold">
                          -${opt.leakageMultiplier.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA — Book a Call with Jeremy */}
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
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              In a free 30-minute call, Jeremy will walk through your results, identify your
              highest-ROI fix, and map out a 90-day action plan — whether that's coaching, a
              fractional CAIO, or both.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#FF0000] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors group"
              >
                <PhoneCall className="w-5 h-5" />
                Book Your Free Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            <p className="text-white/60 text-sm mt-4">
              No pitch. No pressure. Just a clear next step.
            </p>
          </motion.div>

          {/* Retake */}
          <div className="text-center pb-8">
            <Link
              to="/leakage"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
