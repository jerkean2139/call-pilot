import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBabyContext } from '../context/BabyContext';
import MilestoneCard from '../components/MilestoneCard';
import { milestoneTemplates } from '../lib/milestones';
import { generateId, getAgeInMonths } from '../lib/utils';
import type { MilestoneCategory, MilestoneTemplate } from '../types';

const categoryTabs: { value: MilestoneCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌟' },
  { value: 'motor', label: 'Motor', emoji: '🏃' },
  { value: 'cognitive', label: 'Cognitive', emoji: '🧠' },
  { value: 'social', label: 'Social', emoji: '👋' },
  { value: 'language', label: 'Language', emoji: '💬' },
  { value: 'feeding', label: 'Feeding', emoji: '🍼' },
  { value: 'sleep', label: 'Sleep', emoji: '😴' },
];

export default function Milestones() {
  const { baby, milestones, saveMilestone, deleteMilestone } = useBabyContext();
  const [tab, setTab] = useState<MilestoneCategory | 'all'>('all');

  if (!baby) return null;

  const ageMonths = getAgeInMonths(baby.dateOfBirth);
  const achievedIds = new Set(milestones.map((m) => m.templateId));

  const filtered = milestoneTemplates.filter(
    (t) => tab === 'all' || t.category === tab
  );

  const achievedCount = milestones.filter((m) => m.achievedDate).length;
  const total = milestoneTemplates.length;
  const progress = Math.round((achievedCount / total) * 100);

  const handleToggle = async (template: MilestoneTemplate) => {
    const existing = milestones.find((m) => m.templateId === template.id);
    if (existing) {
      await deleteMilestone(existing.id);
    } else {
      await saveMilestone({
        id: generateId(),
        babyId: baby.id,
        templateId: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        achievedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="pt-2">
        <h1 className="font-heading text-2xl font-bold text-gray-800">Milestones</h1>
        <p className="text-sm text-gray-400">{baby.name} at {ageMonths} months</p>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600">
            {achievedCount} of {total} milestones
          </span>
          <span className="font-heading font-bold text-amber-500">{progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categoryTabs.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setTab(cat.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              tab === cat.value
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Milestones list */}
      <div className="space-y-2">
        {filtered.map((template, i) => (
          <MilestoneCard
            key={template.id}
            template={template}
            achieved={milestones.find((m) => m.templateId === template.id)}
            onToggle={handleToggle}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
