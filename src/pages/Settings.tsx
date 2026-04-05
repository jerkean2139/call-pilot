import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Save, Download, Upload, Monitor, Moon, Sun, Bell, Users, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBabyContext } from '../context/BabyContext';
import { useAuth } from '../context/AuthContext';
import BabyAvatar from '../components/BabyAvatar';
import { fileToBase64 } from '../lib/utils';
import type { FrameType } from '../types';
import { getFrameSettings, saveFrameSettings, getFrameEmailDomain, getFrameTypeName } from '../lib/frameSettings';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isSuperAdmin } = useAuth();
  const { baby, babies, saveBaby, switchBaby, entries, milestones, growthRecords } = useBabyContext();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Frame settings
  const [frameEnabled, setFrameEnabled] = useState(false);
  const [frameType, setFrameType] = useState<FrameType>('aura');
  const [frameEmail, setFrameEmail] = useState('');
  const [frameName, setFrameName] = useState('');
  const [frameSaved, setFrameSaved] = useState(false);

  useEffect(() => {
    const fs = getFrameSettings();
    setFrameEnabled(fs.enabled);
    setFrameType(fs.frameType);
    setFrameEmail(fs.frameEmail);
    setFrameName(fs.frameName);
  }, []);

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

      {/* Baby Switcher */}
      {babies.length > 1 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
          <h2 className="mb-3 font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
            Switch Baby
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {babies.map((b) => (
              <button
                key={b.id}
                onClick={() => switchBaby(b.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  baby?.id === b.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {b.photoUrl ? (
                  <img src={b.photoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-500">
                    {b.name[0]}
                  </div>
                )}
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Another Baby */}
      <button
        onClick={async () => {
          const name = prompt('Baby\'s name:');
          if (!name) return;
          const dob = prompt('Date of birth (YYYY-MM-DD):');
          if (!dob) return;
          const { generateId } = await import('../lib/utils');
          await saveBaby({
            id: generateId(),
            name,
            dateOfBirth: dob,
            createdAt: new Date().toISOString(),
          });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200 py-3 text-sm font-medium text-rose-400 transition-all hover:border-rose-300 hover:text-rose-500 dark:border-rose-800 dark:text-rose-500"
      >
        + Add Another Baby
      </button>

      {/* Baby Profile */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
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

      {/* Digital Frame */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-violet-500" />
            <h2 className="font-heading text-sm font-semibold text-gray-700">
              Digital Photo Frame
            </h2>
          </div>
          <button
            onClick={() => {
              const next = !frameEnabled;
              setFrameEnabled(next);
              saveFrameSettings({
                enabled: next,
                frameType,
                frameEmail,
                frameName,
              });
            }}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              frameEnabled ? 'bg-violet-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                frameEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {frameEnabled && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Frame Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['aura', 'skylight', 'nixplay', 'custom'] as const).map(
                  (ft) => (
                    <button
                      key={ft}
                      onClick={() => {
                        setFrameType(ft);
                        if (ft !== 'custom') {
                          setFrameEmail('');
                        }
                      }}
                      className={`rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                        frameType === ft
                          ? 'bg-violet-500 text-white'
                          : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                      }`}
                    >
                      {getFrameTypeName(ft)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Frame Email Address
              </label>
              <input
                type="email"
                value={frameEmail}
                onChange={(e) => setFrameEmail(e.target.value)}
                placeholder={
                  frameType !== 'custom'
                    ? `your-code${getFrameEmailDomain(frameType)}`
                    : 'frame@example.com'
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
              />
              {frameType !== 'custom' && (
                <p className="mt-1 text-[10px] text-gray-400">
                  Find this in your {getFrameTypeName(frameType)} app under
                  frame settings
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-400">
                Frame Name (optional)
              </label>
              <input
                type="text"
                value={frameName}
                onChange={(e) => setFrameName(e.target.value)}
                placeholder="e.g. Living Room Frame"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
              />
            </div>

            <button
              onClick={() => {
                saveFrameSettings({
                  enabled: frameEnabled,
                  frameType,
                  frameEmail,
                  frameName,
                });
                setFrameSaved(true);
                setTimeout(() => setFrameSaved(false), 2000);
              }}
              disabled={!frameEmail}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-600 disabled:opacity-40"
            >
              <Save size={14} />
              {frameSaved ? 'Saved!' : 'Save Frame Settings'}
            </button>
          </div>
        )}
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

      {/* Appearance */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon size={16} className="text-violet-500" />
            ) : (
              <Sun size={16} className="text-amber-500" />
            )}
            <h2 className="font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
              Dark Mode
            </h2>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-violet-500' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-rose-500" />
            <div>
              <h2 className="font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
                Journal Reminders
              </h2>
              <p className="text-[10px] text-gray-400">Get reminded to journal</p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (!('Notification' in window)) {
                alert('Notifications are not supported in your browser');
                return;
              }
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                // Schedule a daily reminder
                if ('serviceWorker' in navigator) {
                  const reg = await navigator.serviceWorker.ready;
                  // Show a test notification
                  reg.showNotification('Living Legacy', {
                    body: `Don't forget to capture ${baby.name}'s special moments today!`,
                    icon: '/icons/icon.svg',
                    tag: 'reminder',
                  });
                }
                alert('Reminders enabled! You\'ll get daily reminders to journal.');
              }
            }}
            className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-100 dark:bg-rose-900/20"
          >
            Enable
          </button>
        </div>
      </div>

      {/* Admin Dashboard (super admin only) */}
      {isSuperAdmin && (
        <button
          onClick={() => navigate('/admin')}
          className="flex w-full items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-amber-100 transition-all hover:bg-amber-50 dark:bg-gray-800 dark:ring-amber-900/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Shield size={18} className="text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
              Admin Dashboard
            </h2>
            <p className="text-[10px] text-gray-400">Manage Memory Keepers</p>
          </div>
          <ArrowLeft size={16} className="rotate-180 text-gray-300" />
        </button>
      )}

      {/* Family Portal */}
      <button
        onClick={() => navigate('/family')}
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-gray-50 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <Users size={18} className="text-violet-500" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
            Family Portal
          </h2>
          <p className="text-[10px] text-gray-400">Invite family & friends to view entries</p>
        </div>
        <ArrowLeft size={16} className="rotate-180 text-gray-300" />
      </button>

      {/* Account */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <h2 className="mb-3 font-heading text-sm font-semibold text-gray-700 dark:text-gray-200">
          Account
        </h2>
        {user && (
          <div className="mb-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              logout();
              navigate('/login');
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-100 dark:bg-red-900/20"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="rounded-2xl bg-gray-50 p-4 text-center text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <p>
          {entries.length} journal entries &middot; {milestones.filter((m) => m.achievedDate).length} milestones &middot; {growthRecords.length} growth records
        </p>
        <p className="mt-1">All data stored locally on your device</p>
      </div>
    </motion.div>
  );
}
