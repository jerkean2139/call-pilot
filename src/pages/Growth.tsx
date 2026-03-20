import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Scale, Ruler, CircleDot, Trash2 } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import GrowthChart from '../components/GrowthChart';
import { generateId, formatDate } from '../lib/utils';

type MetricTab = 'weight' | 'height' | 'head';

export default function Growth() {
  const { baby, growthRecords, saveGrowthRecord, deleteGrowthRecord } = useBabyContext();
  const [activeTab, setActiveTab] = useState<MetricTab>('weight');
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightLbs, setWeightLbs] = useState('');
  const [weightOz, setWeightOz] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!baby) return null;

  const tabs = [
    { value: 'weight' as const, label: 'Weight', icon: Scale, color: 'rose' },
    { value: 'height' as const, label: 'Height', icon: Ruler, color: 'violet' },
    { value: 'head' as const, label: 'Head', icon: CircleDot, color: 'amber' },
  ];

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeightLbs('');
    setWeightOz('');
    setHeightInches('');
    setHeadCirc('');
    setNotes('');
    setShowForm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveGrowthRecord({
      id: generateId(),
      babyId: baby.id,
      date,
      weightLbs: weightLbs ? parseFloat(weightLbs) : undefined,
      weightOz: weightOz ? parseFloat(weightOz) : undefined,
      heightInches: heightInches ? parseFloat(heightInches) : undefined,
      headCircumferenceInches: headCirc ? parseFloat(headCirc) : undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this growth record?')) {
      await deleteGrowthRecord(id);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-800">Growth</h1>
          <p className="text-sm text-gray-400">{baby.name}'s growth tracker</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-white shadow-md shadow-violet-200 transition-all hover:bg-violet-600 active:scale-90"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <h3 className="mb-3 font-heading text-sm font-semibold text-gray-700">
                Record Measurements
              </h3>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
              />
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    placeholder="0"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Weight (oz)</label>
                  <input
                    type="number"
                    value={weightOz}
                    onChange={(e) => setWeightOz(e.target.value)}
                    placeholder="0"
                    step="0.5"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
                  />
                </div>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Height (inches)</label>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="0"
                    step="0.25"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-400">Head circ. (in)</label>
                  <input
                    type="number"
                    value={headCirc}
                    onChange={(e) => setHeadCirc(e.target.value)}
                    placeholder="0"
                    step="0.25"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
                  />
                </div>
              </div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
              />
              <button
                onClick={handleSave}
                disabled={saving || (!weightLbs && !heightInches && !headCirc)}
                className="w-full rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-600 disabled:opacity-40 active:scale-[0.98]"
              >
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Tabs */}
      <div className="flex gap-2">
        {tabs.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
              activeTab === value
                ? 'bg-violet-500 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <GrowthChart records={growthRecords} metric={activeTab} />
      </div>

      {/* Records list */}
      <div className="space-y-2">
        {growthRecords.map((record) => (
          <div
            key={record.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{formatDate(record.date)}</p>
              <div className="mt-0.5 flex flex-wrap gap-3 text-sm">
                {record.weightLbs !== undefined && (
                  <span className="font-medium text-rose-600">
                    {record.weightLbs}lb {record.weightOz ? `${record.weightOz}oz` : ''}
                  </span>
                )}
                {record.heightInches !== undefined && (
                  <span className="font-medium text-violet-600">
                    {record.heightInches}in
                  </span>
                )}
                {record.headCircumferenceInches !== undefined && (
                  <span className="font-medium text-amber-600">
                    {record.headCircumferenceInches}in head
                  </span>
                )}
              </div>
              {record.notes && (
                <p className="mt-0.5 text-xs text-gray-400">{record.notes}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(record.id)}
              className="shrink-0 rounded-full p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
