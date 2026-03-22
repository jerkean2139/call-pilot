import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Star,
  TrendingUp,
  Settings,
  ChevronRight,
  Search,
  Image,
} from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import BabyAvatar from '../components/BabyAvatar';
import JournalCard from '../components/JournalCard';
import PullToRefresh from '../components/PullToRefresh';
import { calculateAge, getAgeInMonths, getCategoryEmoji } from '../lib/utils';
import { getUpcomingMilestones, getMilestonesByAge } from '../lib/milestones';

export default function Dashboard() {
  const navigate = useNavigate();
  const { baby, entries, milestones, growthRecords, refresh } = useBabyContext();

  if (!baby) return null;

  const age = calculateAge(baby.dateOfBirth);
  const ageMonths = getAgeInMonths(baby.dateOfBirth);
  const achievedCount = milestones.filter((m) => m.achievedDate).length;
  const achievedIds = new Set(milestones.filter((m) => m.templateId).map((m) => m.templateId));
  const upcoming = getUpcomingMilestones(ageMonths);

  // Age-appropriate milestones not yet achieved
  const ageAppropriate = getMilestonesByAge(ageMonths).filter(
    (ms) => !achievedIds.has(ms.id)
  );

  const recentEntries = entries.slice(0, 3);
  const latestGrowth = growthRecords[0];
  const totalPhotos = entries.reduce((sum, e) => sum + e.photos.length, 0);

  const quickActions = [
    { icon: BookOpen, label: 'Journal', color: 'bg-rose-500', to: '/journal/new' },
    { icon: Star, label: 'Milestone', color: 'bg-amber-500', to: '/milestones' },
    { icon: TrendingUp, label: 'Growth', color: 'bg-violet-500', to: '/growth' },
    { icon: Image, label: 'Gallery', color: 'bg-blue-500', to: '/gallery' },
  ];

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pt-2"
        >
          <BabyAvatar
            photoUrl={baby.photoUrl}
            name={baby.name}
            size="lg"
          />
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-gray-800">
              {baby.name}
            </h1>
            <p className="text-sm text-gray-400">{age.display}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => navigate('/search')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
            >
              <Search size={16} className="text-gray-400" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
            >
              <Settings size={16} className="text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {quickActions.map(({ icon: Icon, label, color, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md active:scale-95"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shadow-sm`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100">
            <p className="font-heading text-xl font-bold text-rose-500">{entries.length}</p>
            <p className="text-xs text-gray-400">Journal Entries</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100">
            <p className="font-heading text-xl font-bold text-amber-500">{achievedCount}</p>
            <p className="text-xs text-gray-400">Milestones</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100">
            <p className="font-heading text-xl font-bold text-violet-500">
              {latestGrowth
                ? `${latestGrowth.weightLbs || '—'}lb`
                : '—'}
            </p>
            <p className="text-xs text-gray-400">Latest Weight</p>
          </div>
        </motion.div>

        {/* Age-Appropriate Milestones */}
        {ageAppropriate.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold text-gray-700">
                For {baby.name} right now ({ageMonths}mo)
              </h2>
              <button
                onClick={() => navigate('/milestones')}
                className="text-xs text-amber-500"
              >
                Track
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ageAppropriate.slice(0, 6).map((ms) => (
                <div
                  key={ms.id}
                  className="shrink-0 rounded-xl bg-gradient-to-br from-amber-50 to-rose-50 px-3 py-2 ring-1 ring-amber-100"
                >
                  <span className="text-lg">{ms.icon}</span>
                  <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-amber-700">
                    {ms.title}
                  </p>
                  <p className="text-[10px] text-amber-400">
                    {getCategoryEmoji(ms.category)} ~{ms.typicalAgeMonths}mo
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Milestones */}
        {upcoming.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold text-gray-700">
                Coming Up
              </h2>
              <button
                onClick={() => navigate('/milestones')}
                className="text-xs text-rose-500"
              >
                See all
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {upcoming.slice(0, 5).map((ms) => (
                <div
                  key={ms.id}
                  className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100"
                >
                  <span className="text-lg">{ms.icon}</span>
                  <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-amber-700">
                    {ms.title}
                  </p>
                  <p className="text-xs text-amber-400">{ms.typicalAgeMonths}mo</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold text-gray-700">
              Recent Moments
            </h2>
            {entries.length > 0 && (
              <button
                onClick={() => navigate('/journal')}
                className="flex items-center gap-0.5 text-xs text-rose-500"
              >
                View all <ChevronRight size={14} />
              </button>
            )}
          </div>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry, i) => (
                <JournalCard key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          ) : (
            <button
              onClick={() => navigate('/journal/new')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 py-8 text-rose-400 transition-all hover:border-rose-300 hover:text-rose-500"
            >
              <Plus size={20} />
              <span className="font-medium">Capture your first moment</span>
            </button>
          )}
        </motion.div>
      </div>
    </PullToRefresh>
  );
}
