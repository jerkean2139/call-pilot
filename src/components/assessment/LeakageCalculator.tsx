import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';

interface LeakageCalculatorProps {
  monthlyLeakage: number;
  isVisible: boolean;
}

function useAnimatedNumber(target: number, duration: number = 600) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = current;
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startRef.current + (target - startRef.current) * eased;
      setCurrent(Math.round(value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return current;
}

// Dynamic pain narration based on leakage thresholds
function getLeakageNarration(amount: number): string | null {
  if (amount >= 50000) return "You're funding a competitor's growth with your waste.";
  if (amount >= 35000) return 'Most businesses this leaky don\'t survive 3 years.';
  if (amount >= 20000) return 'That\'s a luxury car payment — every single month.';
  if (amount >= 10000) return 'You\'re burning a full-time salary every month.';
  if (amount >= 5000) return 'That\'s a contractor you could hire instead.';
  if (amount >= 2000) return 'Small leaks add up fast.';
  return null;
}

export function LeakageCalculator({ monthlyLeakage, isVisible }: LeakageCalculatorProps) {
  const animatedMonthly = useAnimatedNumber(monthlyLeakage);
  const animatedAnnual = useAnimatedNumber(monthlyLeakage * 12);
  const [showPulse, setShowPulse] = useState(false);
  const prevLeakageRef = useRef(0);

  // Pulse animation when crossing a threshold
  useEffect(() => {
    const thresholds = [5000, 10000, 20000, 35000, 50000];
    const prev = prevLeakageRef.current;
    const crossed = thresholds.some(t => prev < t && monthlyLeakage >= t);
    if (crossed) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 800);
    }
    prevLeakageRef.current = monthlyLeakage;
  }, [monthlyLeakage]);

  const narration = getLeakageNarration(monthlyLeakage);

  const getSeverityColor = () => {
    if (monthlyLeakage < 5000) return 'text-green-500';
    if (monthlyLeakage < 15000) return 'text-yellow-500';
    if (monthlyLeakage < 30000) return 'text-orange-500';
    return 'text-red-600';
  };

  const getSeverityBg = () => {
    if (monthlyLeakage < 5000) return 'from-green-500/10 to-green-500/5';
    if (monthlyLeakage < 15000) return 'from-yellow-500/10 to-yellow-500/5';
    if (monthlyLeakage < 30000) return 'from-orange-500/10 to-orange-500/5';
    return 'from-red-600/10 to-red-600/5';
  };

  const getSeverityLabel = () => {
    if (monthlyLeakage < 5000) return 'Low Risk';
    if (monthlyLeakage < 15000) return 'Moderate Risk';
    if (monthlyLeakage < 30000) return 'High Risk';
    return 'Critical';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: showPulse ? 1.03 : 1,
            boxShadow: showPulse ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 0 0px rgba(0,0,0,0)',
          }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-xl overflow-hidden bg-gradient-to-br ${getSeverityBg()} border border-gray-200`}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className={`w-4 h-4 ${getSeverityColor()}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Estimated Leakage
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <DollarSign className={`w-6 h-6 ${getSeverityColor()}`} />
              <motion.span
                key={animatedMonthly}
                className={`text-3xl font-montserrat font-bold tabular-nums ${getSeverityColor()}`}
              >
                {animatedMonthly.toLocaleString()}
              </motion.span>
              <span className="text-sm text-gray-500">/mo</span>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-sm text-gray-500 ml-7">
                ${animatedAnnual.toLocaleString()}/year
              </span>
            </div>

            {/* Dynamic narration */}
            <AnimatePresence mode="wait">
              {narration && (
                <motion.p
                  key={narration}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs italic text-gray-600 mb-3 leading-relaxed"
                >
                  "{narration}"
                </motion.p>
              )}
            </AnimatePresence>

            {monthlyLeakage > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  monthlyLeakage >= 30000
                    ? 'bg-red-100 text-red-700'
                    : monthlyLeakage >= 15000
                    ? 'bg-orange-100 text-orange-700'
                    : monthlyLeakage >= 5000
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {monthlyLeakage >= 15000 && <AlertTriangle className="w-3 h-3" />}
                {getSeverityLabel()}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
