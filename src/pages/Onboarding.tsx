import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Heart, Sparkles, ArrowRight, Camera, Users, Plus, X, Check } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { useAuth } from '../context/AuthContext';
import { generateId, fileToBase64 } from '../lib/utils';
import { RELATIONSHIP_LABELS } from '../types';
import type { Relationship } from '../types';

const RELATIONSHIPS: Relationship[] = [
  'grandparent', 'aunt', 'uncle', 'cousin', 'friend',
  'teacher', 'godparent', 'sibling', 'nanny', 'other',
];

interface PendingInvite {
  relationship: Relationship;
  code?: string;
  creating?: boolean;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveBaby } = useBabyContext();
  const { token, isKeeper } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Family invite step
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [selectedRelForAdd, setSelectedRelForAdd] = useState<Relationship>('grandparent');
  const [showRelPicker, setShowRelPicker] = useState(false);
  const [creatingInvites, setCreatingInvites] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    }
  };

  const handleFinishBaby = async () => {
    if (!name || !dob) return;
    setSaving(true);
    await saveBaby({
      id: generateId(),
      name,
      dateOfBirth: dob,
      gender: gender || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);

    // If keeper, show family invite step. Otherwise go to dashboard.
    if (isKeeper) {
      setStep(4);
    } else {
      navigate('/');
    }
  };

  const addInvite = () => {
    setPendingInvites((prev) => [...prev, { relationship: selectedRelForAdd }]);
    setShowRelPicker(false);
  };

  const removeInvite = (index: number) => {
    setPendingInvites((prev) => prev.filter((_, i) => i !== index));
  };

  const createAllInvites = async () => {
    if (pendingInvites.length === 0) {
      navigate('/');
      return;
    }
    setCreatingInvites(true);

    const updated = [...pendingInvites];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].code) continue;
      updated[i].creating = true;
      setPendingInvites([...updated]);

      try {
        const res = await fetch('/api/family/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ relationship: updated[i].relationship }),
        });
        const data = await res.json();
        if (res.ok) {
          updated[i].code = data.invite.code;
        }
      } catch {
        // Skip failed invites
      }
      updated[i].creating = false;
      setPendingInvites([...updated]);
    }
    setCreatingInvites(false);
  };

  const allInvitesCreated = pendingInvites.length > 0 && pendingInvites.every((inv) => inv.code);

  const handleCopyInvite = async (code: string) => {
    const url = `${window.location.origin}/join/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-white to-amber-50 px-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-amber-400 shadow-lg shadow-rose-200">
              <Heart size={36} className="text-white" />
            </div>
            <h1 className="mb-2 font-heading text-3xl font-bold text-gray-800">
              Living Legacy
            </h1>
            <p className="mb-8 text-gray-500">
              Every moment matters. Capture your baby's precious journey.
            </p>
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-8 py-3 font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 active:scale-95"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="mb-6 text-center">
              <Baby size={32} className="mx-auto mb-3 text-rose-400" />
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                What's your baby's name?
              </h2>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Baby's name"
              autoFocus
              className="mb-4 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-center text-lg font-medium text-gray-800 outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              onClick={() => name && setStep(2)}
              disabled={!name}
              className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-95"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="dob"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="mb-6 text-center">
              <Sparkles size={32} className="mx-auto mb-3 text-amber-400" />
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                When was {name} born?
              </h2>
            </div>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="mb-4 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-center text-lg font-medium text-gray-800 outline-none transition-all focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <button
              onClick={() => dob && setStep(3)}
              disabled={!dob}
              className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-40 active:scale-95"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="gender"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="mb-6 text-center">
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                Tell us about {name}
              </h2>
              <p className="mt-1 text-sm text-gray-400">Optional</p>
            </div>
            <div className="mb-4 flex gap-3">
              {(['boy', 'girl', 'other'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold capitalize transition-all ${
                    gender === g
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                      : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-rose-200'
                  }`}
                >
                  {g === 'boy' ? '👦 Boy' : g === 'girl' ? '👧 Girl' : '✨ Other'}
                </button>
              ))}
            </div>
            <div className="mb-6 flex flex-col items-center">
              <label className="group cursor-pointer">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-rose-200"
                  />
                ) : (
                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-rose-50 ring-2 ring-dashed ring-rose-200 transition-all group-hover:ring-rose-400">
                    <Camera size={24} className="text-rose-300" />
                    <span className="mt-1 text-xs text-rose-300">Add photo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={handleFinishBaby}
              disabled={saving}
              className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-50 active:scale-95"
            >
              {saving ? 'Setting up...' : 'Continue'}
            </button>
          </motion.div>
        )}

        {/* Step 4: Family Invites (keepers only) */}
        {step === 4 && (
          <motion.div
            key="family"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm"
          >
            <div className="mb-6 text-center">
              <Users size={32} className="mx-auto mb-3 text-violet-400" />
              <h2 className="font-heading text-2xl font-bold text-gray-800">
                Invite Your Village
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Who should see {name}'s journey? You can always add more later.
              </p>
            </div>

            {/* Added invites */}
            {pendingInvites.length > 0 && (
              <div className="mb-4 space-y-2">
                {pendingInvites.map((inv, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-200"
                  >
                    <Heart size={14} className="text-rose-400" />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {RELATIONSHIP_LABELS[inv.relationship]}
                    </span>
                    {inv.code ? (
                      <button
                        onClick={() => handleCopyInvite(inv.code!)}
                        className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600"
                      >
                        <Check size={10} /> Copy Link
                      </button>
                    ) : inv.creating ? (
                      <span className="text-xs text-gray-400">Creating...</span>
                    ) : (
                      <button
                        onClick={() => removeInvite(i)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-400"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add invite picker */}
            {!showRelPicker ? (
              <button
                onClick={() => setShowRelPicker(true)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 py-3 text-sm font-medium text-violet-400 transition-all hover:border-violet-300 hover:text-violet-500"
              >
                <Plus size={16} />
                Add someone to invite
              </button>
            ) : (
              <div className="mb-4 rounded-xl bg-violet-50 p-3">
                <p className="mb-2 text-xs font-medium text-violet-600">
                  Select their relationship to {name}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {RELATIONSHIPS.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => setSelectedRelForAdd(rel)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedRelForAdd === rel
                          ? 'bg-violet-500 text-white'
                          : 'bg-white text-gray-600 ring-1 ring-gray-200'
                      }`}
                    >
                      {RELATIONSHIP_LABELS[rel]}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={addInvite}
                    className="flex-1 rounded-lg bg-violet-500 py-2 text-xs font-semibold text-white"
                  >
                    Add {RELATIONSHIP_LABELS[selectedRelForAdd]}
                  </button>
                  <button
                    onClick={() => setShowRelPicker(false)}
                    className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {!allInvitesCreated ? (
                <button
                  onClick={pendingInvites.length > 0 ? createAllInvites : () => navigate('/')}
                  disabled={creatingInvites}
                  className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-50 active:scale-95"
                >
                  {creatingInvites
                    ? 'Creating invites...'
                    : pendingInvites.length > 0
                      ? `Create ${pendingInvites.length} Invite${pendingInvites.length > 1 ? 's' : ''}`
                      : `Start ${name}'s Journal`}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 active:scale-95"
                >
                  Done — Go to Dashboard
                </button>
              )}

              {pendingInvites.length === 0 && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 text-center text-sm text-gray-400 hover:text-gray-600"
                >
                  Skip for now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
