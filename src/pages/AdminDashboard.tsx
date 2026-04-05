import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  UserPlus,
  Phone,
  User,
  Send,
  Check,
  AlertCircle,
  Baby,
  ChevronDown,
  ChevronUp,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Keeper {
  userId: string;
  name: string;
  phone: string;
  role?: string;
  joinedAt: string;
}

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [keepers, setKeepers] = useState<Keeper[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<'keeper' | 'super_admin'>('keeper');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeepers();
  }, []);

  const fetchKeepers = async () => {
    try {
      const res = await fetch('/api/admin/keepers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeepers(data.keepers || []);
      }
    } catch {
      // Offline
    }
    setLoading(false);
  };

  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setInvitePhone(digits);
  };

  const handleSendInvite = async () => {
    if (!inviteName || invitePhone.length < 10) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/admin/invite-keeper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: invitePhone, name: inviteName, role: inviteRole }),
      });
      const data = await res.json();

      if (res.ok) {
        setSendResult({ type: 'success', message: `Invite sent to ${inviteName}!` });
        setInviteName('');
        setInvitePhone('');
        setInviteRole('keeper');
        setTimeout(fetchKeepers, 1000);
      } else {
        setSendResult({ type: 'error', message: data.error || 'Failed to send invite' });
      }
    } catch {
      setSendResult({ type: 'error', message: 'Network error. Please try again.' });
    }
    setSending(false);
  };

  if (user?.role !== 'super_admin') return null;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-800 dark:text-white">
                Living Legacy
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Shield size={12} className="text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {user.name} &middot; Super Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-gray-400" />}
              </button>
              <button
                onClick={() => { if (confirm('Sign out?')) { logout(); } }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
              >
                <LogOut size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
              <Baby size={20} className="mb-1 text-rose-400" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{keepers.length}</p>
              <p className="text-xs text-gray-400">Memory Keepers</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
              <Shield size={20} className="mb-1 text-amber-400" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {keepers.filter(k => k.role === 'super_admin').length + 1}
              </p>
              <p className="text-xs text-gray-400">Admins</p>
            </div>
          </div>

          {/* Invite Button / Form */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <button
              onClick={() => { setShowInvite(!showInvite); setSendResult(null); }}
              className="flex w-full items-center gap-3 p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                <UserPlus size={18} className="text-rose-500" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-heading font-semibold text-gray-800 dark:text-white">
                  Invite Someone
                </h2>
                <p className="text-xs text-gray-400">Send an SMS invite to a parent or admin</p>
              </div>
              {showInvite ? <ChevronUp size={18} className="text-gray-300" /> : <ChevronDown size={18} className="text-gray-300" />}
            </button>

            <AnimatePresence>
              {showInvite && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 border-t border-gray-100 p-5 pt-4 dark:border-gray-700">
                    {/* Role Toggle */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Invite as
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setInviteRole('keeper')}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                            inviteRole === 'keeper'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Baby size={13} />
                          Memory Keeper
                        </button>
                        <button
                          onClick={() => setInviteRole('super_admin')}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                            inviteRole === 'super_admin'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Shield size={13} />
                          Super Admin
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="text"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Karley Kean"
                          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                          type="tel"
                          value={formatPhoneDisplay(invitePhone)}
                          onChange={handlePhoneChange}
                          placeholder="(765) 977-7008"
                          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendInvite}
                      disabled={!inviteName || invitePhone.length < 10 || sending}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-40 active:scale-[0.98] ${
                        inviteRole === 'super_admin'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                    >
                      <Send size={14} />
                      {sending
                        ? 'Sending...'
                        : `Send ${inviteRole === 'super_admin' ? 'Admin' : 'Memory Keeper'} Invite`}
                    </button>

                    {/* Result Toast */}
                    <AnimatePresence>
                      {sendResult && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-center gap-2 rounded-xl p-3 text-sm ${
                            sendResult.type === 'success'
                              ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
                              : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                          }`}
                        >
                          {sendResult.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                          {sendResult.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* People List */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
            <h2 className="mb-4 font-heading font-semibold text-gray-800 dark:text-white">
              People
            </h2>

            {/* You */}
            <div className="mb-2 flex items-center gap-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Shield size={14} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user.name} <span className="text-xs text-gray-400">(You)</span>
                </p>
                <p className="text-xs text-gray-500">{user.phone}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                Admin
              </span>
            </div>

            {/* Keepers & Admins */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : keepers.length > 0 ? (
              <div className="space-y-2">
                {keepers.map((keeper) => (
                  <div
                    key={keeper.userId}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      keeper.role === 'super_admin'
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-rose-100 dark:bg-rose-900/30'
                    }`}>
                      {keeper.role === 'super_admin'
                        ? <Shield size={14} className="text-amber-500" />
                        : <Baby size={14} className="text-rose-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {keeper.name}
                      </p>
                      <p className="text-xs text-gray-500">{keeper.phone}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      keeper.role === 'super_admin'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                    }`}>
                      {keeper.role === 'super_admin' ? 'Admin' : 'Keeper'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Baby size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">
                  No one invited yet. Tap above to get started!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
