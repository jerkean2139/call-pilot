import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Baby, JournalEntry, Milestone, GrowthRecord } from '../types';
import { babyDB, journalDB, milestoneDB, growthDB } from '../lib/db';

interface BabyContextValue {
  baby: Baby | null;
  setBaby: (baby: Baby | null) => void;
  saveBaby: (baby: Baby) => Promise<void>;
  // Journal
  entries: JournalEntry[];
  saveEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  // Milestones
  milestones: Milestone[];
  saveMilestone: (milestone: Milestone) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  // Growth
  growthRecords: GrowthRecord[];
  saveGrowthRecord: (record: GrowthRecord) => Promise<void>;
  deleteGrowthRecord: (id: string) => Promise<void>;
  // State
  loading: boolean;
  refresh: () => Promise<void>;
}

const BabyContext = createContext<BabyContextValue | null>(null);

export function BabyProvider({ children }: { children: ReactNode }) {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const babies = await babyDB.getAll();
      if (babies.length > 0) {
        const currentBaby = babies[0];
        setBaby(currentBaby);
        const [e, m, g] = await Promise.all([
          journalDB.getByBaby(currentBaby.id),
          milestoneDB.getByBaby(currentBaby.id),
          growthDB.getByBaby(currentBaby.id),
        ]);
        setEntries(e.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setMilestones(m.sort((a, b) => {
          if (!a.achievedDate) return 1;
          if (!b.achievedDate) return -1;
          return new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime();
        }));
        setGrowthRecords(g.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveBaby = async (b: Baby) => {
    await babyDB.save(b);
    setBaby(b);
  };

  const saveEntry = async (entry: JournalEntry) => {
    await journalDB.save(entry);
    await loadData();
  };

  const deleteEntry = async (id: string) => {
    await journalDB.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const saveMilestone = async (milestone: Milestone) => {
    await milestoneDB.save(milestone);
    await loadData();
  };

  const deleteMilestone = async (id: string) => {
    await milestoneDB.delete(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const saveGrowthRecord = async (record: GrowthRecord) => {
    await growthDB.save(record);
    await loadData();
  };

  const deleteGrowthRecord = async (id: string) => {
    await growthDB.delete(id);
    setGrowthRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <BabyContext.Provider
      value={{
        baby,
        setBaby,
        saveBaby,
        entries,
        saveEntry,
        deleteEntry,
        milestones,
        saveMilestone,
        deleteMilestone,
        growthRecords,
        saveGrowthRecord,
        deleteGrowthRecord,
        loading,
        refresh: loadData,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBabyContext() {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error('useBabyContext must be used within BabyProvider');
  return ctx;
}
