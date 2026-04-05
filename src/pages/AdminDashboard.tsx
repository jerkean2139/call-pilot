import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Shield,
  UserPlus,
  Phone,
  User,
  Send,
  Check,
  AlertCircle,
  Baby,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Keeper {
  userId: string;
  name: string;
  phone: string;
  joinedAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [keepers, setKeepers] = useState<Keeper[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
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
        body: JSON.stringify({ phone: invitePhone, name: inviteName }),
      });
      const data = await res.json();

      if (res.ok) {
        setSendResult({ type: 'success', message: `Invite sent to ${inviteName}!` });
        setInviteName('');
        setInvitePhone('');
        // Refresh keepers list after a moment (they haven't signed up yet, but just in case)
        setTimeout(fetchKeepers, 1000);
      } else {
        setSendResult({ type: 'error', message: data.error || 'Failed to send invite' });
      }
    } catch {
      setSendResult({ type: 'error', message: 'Network error. Please try again.' });
    }
    setSending(false);
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Shield size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-500">Admin access only</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
        >
          <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-400">Manage Memory Keepers</p>
        </div>
        <div className="flex h-8 items-center gap-1.5 rounded-full bg-amber-50 px-3 dark:bg-amber-900/20">
          <Shield size={12} className="text-amber-500" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Super Admin</span>
        </div>
      </div>

      {/* Invite New Memory Keeper */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex w-full items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
            <UserPlus size={18} className="text-rose-500" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-heading font-semibold text-gray-800 dark:text-white">
              Invite a Memory Keeper
            </h2>
            <p className="text-xs text-gray-400">Send an SMS invite to a new parent</p>
          </div>
          <span className="text-xs text-gray-400">{showInvite ? 'Hide' : 'Show'}</span>
        </button>

        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Parent's Name
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

                <button
                  onClick={handleSendInvite}
                  disabled={!inviteName || invitePhone.length < 10 || sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-[0.98]"
                >
                  <Send size={14} />
                  {sending ? 'Sending Invite...' : 'Send SMS Invite'}
                </button>

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

      {/* Memory Keepers List */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="mb-4 flex items-center gap-2">
          <Baby size={18} className="text-violet-500" />
          <h2 className="font-heading font-semibold text-gray-800 dark:text-white">
            Memory Keepers
          </h2>
          <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            {keepers.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
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
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                  <Baby size={16} className="text-violet-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {keeper.name}
                  </p>
                  <p className="text-xs text-gray-500">{keeper.phone}</p>
                </div>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-500 dark:bg-rose-900/20">
                  Memory Keeper
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Baby size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">
              No Memory Keepers yet. Send an invite to get started!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
