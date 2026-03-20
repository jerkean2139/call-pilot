import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Heart, Sparkles, ArrowRight, Camera } from 'lucide-react';
import { useBabyContext } from '../context/BabyContext';
import { generateId, fileToBase64 } from '../lib/utils';

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveBaby } = useBabyContext();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | 'other' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    }
  };

  const handleFinish = async () => {
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
    navigate('/');
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
              onClick={handleFinish}
              disabled={saving}
              className="w-full rounded-full bg-rose-500 py-3 font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 disabled:opacity-50 active:scale-95"
            >
              {saving ? 'Setting up...' : `Start ${name}'s Journal`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
