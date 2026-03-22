import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Baby, JournalEntry, Milestone, GrowthRecord } from '../types';
import { babyDB, journalDB, milestoneDB, growthDB } from '../lib/db';

interface BabyContextValue {
  baby: Baby | null;
  babies: Baby[];
  setBaby: (baby: Baby | null) => void;
  saveBaby: (baby: Baby) => Promise<void>;
  switchBaby: (babyId: string) => Promise<void>;
  deleteBabyProfile: (babyId: string) => Promise<void>;
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
  const [babies, setBabies] = useState<Baby[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBabyData = useCallback(async (currentBaby: Baby) => {
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
  }, []);

  const loadData = useCallback(async () => {
    try {
      const allBabies = await babyDB.getAll();
      setBabies(allBabies);
      if (allBabies.length > 0) {
        // Check for stored active baby
        const storedId = localStorage.getItem('living-legacy-active-baby');
        const activeBaby = allBabies.find((b) => b.id === storedId) || allBabies[0];
        setBaby(activeBaby);
        await loadBabyData(activeBaby);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadBabyData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveBaby = async (b: Baby) => {
    await babyDB.save(b);
    setBaby(b);
    setBabies((prev) => {
      const idx = prev.findIndex((p) => p.id === b.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = b;
        return next;
      }
      return [...prev, b];
    });
    localStorage.setItem('living-legacy-active-baby', b.id);
  };

  const switchBaby = async (babyId: string) => {
    const target = babies.find((b) => b.id === babyId);
    if (target) {
      setBaby(target);
      localStorage.setItem('living-legacy-active-baby', babyId);
      await loadBabyData(target);
    }
  };

  const deleteBabyProfile = async (babyId: string) => {
    await babyDB.delete(babyId);
    setBabies((prev) => prev.filter((b) => b.id !== babyId));
    if (baby?.id === babyId) {
      const remaining = babies.filter((b) => b.id !== babyId);
      if (remaining.length > 0) {
        await switchBaby(remaining[0].id);
      } else {
        setBaby(null);
        setEntries([]);
        setMilestones([]);
        setGrowthRecords([]);
      }
    }
  };

  const saveEntry = async (entry: JournalEntry) => {
    await journalDB.save(entry);
    if (baby) await loadBabyData(baby);
  };

  const deleteEntry = async (id: string) => {
    await journalDB.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const saveMilestone = async (milestone: Milestone) => {
    await milestoneDB.save(milestone);
    if (baby) await loadBabyData(baby);
  };

  const deleteMilestone = async (id: string) => {
    await milestoneDB.delete(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const saveGrowthRecord = async (record: GrowthRecord) => {
    await growthDB.save(record);
    if (baby) await loadBabyData(baby);
  };

  const deleteGrowthRecord = async (id: string) => {
    await growthDB.delete(id);
    setGrowthRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <BabyContext.Provider
      value={{
        baby,
        babies,
        setBaby,
        saveBaby,
        switchBaby,
        deleteBabyProfile,
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
