import { useState, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface Props {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 120));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <motion.div
            animate={{ rotate: refreshing ? 360 : pullDistance * 3 }}
            transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
          >
            <RefreshCw
              size={20}
              className={
                pullDistance >= threshold
                  ? 'text-rose-500'
                  : 'text-gray-300'
              }
            />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  );
}
