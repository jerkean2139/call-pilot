import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Copy,
  Check,
  Share2,
  Link2,
  Crown,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { FamilyMember, FamilyInvite } from '../types';

export default function FamilyPortal() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invite, setInvite] = useState<FamilyInvite | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (token) fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/family/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      // Offline - that's ok
    }
  };

  const createInvite = async (role: 'family' | 'friend' = 'family') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setInvite(data.invite);
      } else {
        setError(data.error || 'Failed to create invite');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!invite) return;
    const url = `${window.location.origin}/join/${invite.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!invite || !navigator.share) return;
    const url = `${window.location.origin}/join/${invite.code}`;
    try {
      await navigator.share({
        title: 'Join our Living Legacy family!',
        text: `${user?.name} invited you to view their baby journal on Living Legacy. Use invite code: ${invite.code}`,
        url,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleJoin = async () => {
    if (!joinCode) return;
    setJoinLoading(true);
    setJoinError('');
    setJoinSuccess('');
    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setJoinSuccess(data.message || 'Joined successfully!');
        setJoinCode('');
        fetchMembers();
      } else {
        setJoinError(data.error || 'Failed to join');
      }
    } catch {
      setJoinError('Network error. Please try again.');
    }
    setJoinLoading(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent': return <Crown size={14} className="text-amber-500" />;
      case 'family': return <Heart size={14} className="text-rose-500" />;
      default: return <Users size={14} className="text-violet-500" />;
    }
  };

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
        <h1 className="font-heading text-xl font-bold text-gray-800 dark:text-white">
          Family Portal
        </h1>
      </div>

      {/* Invite Section */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus size={18} className="text-rose-500" />
          <h2 className="font-heading font-semibold text-gray-800 dark:text-white">
            Invite Family & Friends
          </h2>
        </div>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Create an invite link to share your baby's public journal entries and photos with loved ones.
        </p>

        {!invite ? (
          <div className="flex gap-2">
            <button
              onClick={() => createInvite('family')}
              disabled={loading}
              className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-[0.98]"
            >
              {loading ? 'Creating...' : 'Invite Family'}
            </button>
            <button
              onClick={() => createInvite('friend')}
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-600 disabled:opacity-40 active:scale-[0.98]"
            >
              {loading ? 'Creating...' : 'Invite Friend'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700">
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Invite Code</p>
              <p className="font-mono text-lg font-bold tracking-wider text-gray-800 dark:text-white">
                {invite.code}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Expires in 7 days
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white transition-all hover:bg-rose-600"
                >
                  <Share2 size={14} />
                  Share
                </button>
              )}
            </div>
            <button
              onClick={() => setInvite(null)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              Create new invite
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
      </div>

      {/* Join a Family */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <button
          onClick={() => setShowJoin(!showJoin)}
          className="flex w-full items-center gap-2"
        >
          <Link2 size={18} className="text-violet-500" />
          <h2 className="flex-1 text-left font-heading font-semibold text-gray-800 dark:text-white">
            Join a Family
          </h2>
          <span className="text-xs text-gray-400">{showJoin ? 'Hide' : 'Show'}</span>
        </button>

        <AnimatePresence>
          {showJoin && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-3 mb-3 text-xs text-gray-500 dark:text-gray-400">
                Enter an invite code to join a family and view their shared journal entries.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  maxLength={8}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-center font-mono text-sm tracking-wider outline-none transition-all focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleJoin}
                  disabled={!joinCode || joinLoading}
                  className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-600 disabled:opacity-40"
                >
                  {joinLoading ? '...' : 'Join'}
                </button>
              </div>
              {joinError && <p className="mt-2 text-center text-sm text-red-500">{joinError}</p>}
              {joinSuccess && <p className="mt-2 text-center text-sm text-green-500">{joinSuccess}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Members List */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Users size={18} className="text-amber-500" />
          <h2 className="font-heading font-semibold text-gray-800 dark:text-white">
            Family Members
          </h2>
        </div>

        {members.length > 0 ? (
          <div className="space-y-2">
            {/* Current user */}
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3 dark:bg-rose-900/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-800">
                <Crown size={16} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user?.name} (You)
                </p>
                <p className="text-xs text-gray-500">Parent</p>
              </div>
            </div>

            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600">
                  {getRoleIcon(member.role)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-xs capitalize text-gray-500">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Users size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">
              No family members yet. Share an invite to get started!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
