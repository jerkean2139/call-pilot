import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import type { Milestone, MilestoneTemplate } from '../types';
import { formatShortDate, getCategoryColor } from '../lib/utils';
import { cn } from '../lib/utils';

interface Props {
  template: MilestoneTemplate;
  achieved?: Milestone;
  onToggle: (template: MilestoneTemplate) => void;
  index?: number;
}

export default function MilestoneCard({ template, achieved, onToggle, index = 0 }: Props) {
  const isAchieved = !!achieved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => onToggle(template)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.98]',
        isAchieved
          ? 'bg-green-50 ring-1 ring-green-200'
          : 'bg-white ring-1 ring-gray-100 hover:ring-rose-200'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg',
          isAchieved ? 'bg-green-100' : 'bg-gray-50'
        )}
      >
        {template.icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className={cn(
          'text-sm font-semibold',
          isAchieved ? 'text-green-700' : 'text-gray-700'
        )}>
          {template.title}
        </h4>
        <p className="text-xs text-gray-400">
          {isAchieved && achieved.achievedDate
            ? formatShortDate(achieved.achievedDate)
            : `Typical: ${template.typicalAgeMonths} months`}
        </p>
      </div>
      <div className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full',
        isAchieved ? 'bg-green-500' : 'border-2 border-gray-200'
      )}>
        {isAchieved ? (
          <Check size={14} className="text-white" />
        ) : (
          <Circle size={14} className="text-gray-200" />
        )}
      </div>
    </motion.div>
  );
}
