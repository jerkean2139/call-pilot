import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Save, Trash2, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBabyContext } from '../context/BabyContext';
import BabyAvatar from '../components/BabyAvatar';
import { fileToBase64 } from '../lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { baby, saveBaby, entries, milestones, growthRecords } = useBabyContext();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (baby) {
      setName(baby.name);
      setDob(baby.dateOfBirth);
      setGender(baby.gender || '');
      setPhotoUrl(baby.photoUrl || '');
    }
  }, [baby]);

  if (!baby) return null;

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    }
  };

  const handleSave = async () => {
    if (!name || !dob) return;
    setSaving(true);
    await saveBaby({
      ...baby,
      name,
      dateOfBirth: dob,
      gender: gender || undefined,
      photoUrl: photoUrl || undefined,
    });
    setSaving(false);
  };

  const handleExport = () => {
    const data = {
      baby,
      entries,
      milestones,
      growthRecords,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `living-legacy-${baby.name.toLowerCase()}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.baby && data.entries && data.milestones && data.growthRecords) {
        // Save baby
        await saveBaby(data.baby);
        // Import entries
        const { journalDB, milestoneDB, growthDB } = await import('../lib/db');
        for (const entry of data.entries) {
          await journalDB.save(entry);
        }
        for (const ms of data.milestones) {
          await milestoneDB.save(ms);
        }
        for (const gr of data.growthRecords) {
          await growthDB.save(gr);
        }
        window.location.reload();
      } else {
        alert('Invalid backup file format');
      }
    } catch {
      alert('Failed to import backup');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-4"
    >
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="font-heading text-xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Baby Profile */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 font-heading text-sm font-semibold text-gray-700">
          Baby Profile
        </h2>

        <div className="mb-4 flex justify-center">
          <label className="group cursor-pointer">
            <div className="relative">
              <BabyAvatar photoUrl={photoUrl} name={name} size="lg" />
              <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm ring-2 ring-white">
                <Camera size={12} />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Gender</label>
            <div className="flex gap-2">
              {(['boy', 'girl', 'other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                    gender === g
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!name || !dob || saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-600 disabled:opacity-40"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 font-heading text-sm font-semibold text-gray-700">
          Data Management
        </h2>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
          >
            <Download size={16} className="text-gray-400" />
            Export Backup
          </button>
          <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100">
            <Upload size={16} className="text-gray-400" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-2xl bg-gray-50 p-4 text-center text-xs text-gray-400">
        <p>
          {entries.length} journal entries &middot; {milestones.filter((m) => m.achievedDate).length} milestones &middot; {growthRecords.length} growth records
        </p>
        <p className="mt-1">All data stored locally on your device</p>
      </div>
    </motion.div>
  );
}
