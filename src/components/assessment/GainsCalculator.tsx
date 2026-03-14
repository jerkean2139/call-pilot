import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';

interface GainsCalculatorProps {
  monthlySaved: number;
  monthlyGained: number;
  hoursSavedWeekly: number;
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

export function GainsCalculator({
  monthlySaved,
  monthlyGained,
  hoursSavedWeekly,
  isVisible,
}: GainsCalculatorProps) {
  const totalMonthly = monthlySaved + monthlyGained;
  const animatedSaved = useAnimatedNumber(monthlySaved);
  const animatedGained = useAnimatedNumber(monthlyGained);
  const animatedTotal = useAnimatedNumber(totalMonthly);
  const animatedAnnual = useAnimatedNumber(totalMonthly * 12);
  const animatedHours = useAnimatedNumber(Math.round(hoursSavedWeekly));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200"
        >
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Potential Impact
              </span>
            </div>

            {/* Total monthly impact */}
            <div className="flex items-baseline gap-1 mb-1">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span className="text-3xl font-montserrat font-bold tabular-nums text-emerald-600">
                {animatedTotal.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">/mo</span>
            </div>

            {/* Annual */}
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-sm text-gray-500 ml-7">
                ${animatedAnnual.toLocaleString()}/year
              </span>
            </div>

            {/* Breakdown: Saved vs Earned */}
            <div className="space-y-2 mb-3">
              {/* Cost saved */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-600">Cost Saved</span>
                </div>
                <span className="text-xs font-bold text-blue-600 tabular-nums">
                  ${animatedSaved.toLocaleString()}/mo
                </span>
              </div>
              {/* Revenue gained */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-600">Revenue Gained</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 tabular-nums">
                  ${animatedGained.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Hours badge */}
            {hoursSavedWeekly > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"
              >
                <Clock className="w-3 h-3" />
                {animatedHours} hrs/week recovered
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
