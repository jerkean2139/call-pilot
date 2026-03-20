'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  Baby,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;
type FamilyMode = 'create' | 'join' | null;
type BabyTheme = 'STRAWBERRY' | 'STORYBOOK';

const THEMES: { value: BabyTheme; label: string; color: string; bg: string; description: string }[] = [
  {
    value: 'STRAWBERRY',
    label: 'Strawberry',
    color: 'bg-strawberry-500',
    bg: 'bg-strawberry-50 border-strawberry-200',
    description: 'Warm pinks and reds',
  },
  {
    value: 'STORYBOOK',
    label: 'Storybook',
    color: 'bg-storybook-500',
    bg: 'bg-storybook-50 border-storybook-200',
    description: 'Soft blues and purples',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 state
  const [familyMode, setFamilyMode] = useState<FamilyMode>(null);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Step 2 state
  const [babyName, setBabyName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<BabyTheme>('STRAWBERRY');

  const progress = (step / 3) * 100;

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3) as Step);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1) as Step);
  };

  const handleFamilySubmit = async () => {
    setIsLoading(true);
    try {
      if (familyMode === 'create') {
        const res = await fetch('/api/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: familyName }),
        });
        if (!res.ok) throw new Error('Failed to create family');
        const data = await res.json();
        setFamilyId(data.family.id);
        toast.success('Family created!');
      } else {
        const res = await fetch('/api/family/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode }),
        });
        if (!res.ok) throw new Error('Invalid invite code');
        const data = await res.json();
        setFamilyId(data.family.id);
        toast.success('Joined family!');
      }
      goNext();
    } catch (err) {
      toast.error(
        familyMode === 'create'
          ? 'Could not create family. Please try again.'
          : 'Invalid invite code. Please check and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBabySubmit = async () => {
    if (!familyId) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/baby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          name: babyName,
          birthDate: new Date(birthDate).toISOString(),
          theme: selectedTheme,
        }),
      });
      if (!res.ok) throw new Error('Failed to add baby');
      toast.success(`Welcome, ${babyName}!`);
      goNext();
    } catch {
      toast.error('Could not add baby. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterApp = () => {
    router.push('/app');
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/10" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-montserrat text-2xl font-bold">
                  Your Family
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new family or join an existing one
                </p>
              </div>

              <Card className="border-border/50 shadow-lg">
                <CardContent className="space-y-4 p-5">
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFamilyMode('create')}
                      className={cn(
                        'rounded-xl border-2 p-4 text-center transition-all',
                        familyMode === 'create'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <Sparkles
                        className={cn(
                          'mx-auto mb-1 h-5 w-5',
                          familyMode === 'create'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm font-medium">Create New</span>
                    </button>
                    <button
                      onClick={() => setFamilyMode('join')}
                      className={cn(
                        'rounded-xl border-2 p-4 text-center transition-all',
                        familyMode === 'join'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <Users
                        className={cn(
                          'mx-auto mb-1 h-5 w-5',
                          familyMode === 'join'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm font-medium">Join Family</span>
                    </button>
                  </div>

                  {/* Create Family Form */}
                  {familyMode === 'create' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <Label htmlFor="familyName" className="text-xs">
                        Family Name
                      </Label>
                      <Input
                        id="familyName"
                        placeholder="The Johnsons"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                      />
                    </motion.div>
                  )}

                  {/* Join Family Form */}
                  {familyMode === 'join' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <Label htmlFor="inviteCode" className="text-xs">
                        Invite Code
                      </Label>
                      <Input
                        id="inviteCode"
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                    </motion.div>
                  )}

                  <Button
                    onClick={handleFamilySubmit}
                    disabled={
                      isLoading ||
                      !familyMode ||
                      (familyMode === 'create' && !familyName.trim()) ||
                      (familyMode === 'join' && !inviteCode.trim())
                    }
                    className="w-full gap-2 py-5"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Continue <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Baby className="h-7 w-7 text-primary" />
                </div>
                <h1 className="font-montserrat text-2xl font-bold">
                  Add Your Baby
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us about your little one
                </p>
              </div>

              <Card className="border-border/50 shadow-lg">
                <CardContent className="space-y-4 p-5">
                  {/* Baby Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="babyName" className="text-xs">
                      Baby&apos;s Name
                    </Label>
                    <Input
                      id="babyName"
                      placeholder="Emma"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                    />
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-xs">
                      Birth Date
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>

                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs">Choose a Theme</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setSelectedTheme(theme.value)}
                          className={cn(
                            'rounded-xl border-2 p-4 text-center transition-all',
                            selectedTheme === theme.value
                              ? cn('border-2', theme.bg)
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          <div
                            className={cn(
                              'mx-auto mb-2 h-8 w-8 rounded-full',
                              theme.color
                            )}
                          />
                          <span className="block text-sm font-medium">
                            {theme.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {theme.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={goBack}
                      className="gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={handleBabySubmit}
                      disabled={
                        isLoading || !babyName.trim() || !birthDate
                      }
                      className="flex-1 gap-2 py-5"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Continue <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-montserrat text-2xl font-bold"
                >
                  You&apos;re All Set!
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground"
                >
                  Welcome to Living Legacy. Start capturing {babyName}&apos;s
                  precious moments and build a beautiful story together.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 text-primary" />
                    <span>Log daily moments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Track milestones</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Share with family</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8"
                >
                  <Button
                    onClick={handleEnterApp}
                    size="lg"
                    className="gap-2 px-8 py-6 text-base font-semibold"
                  >
                    Enter Living Legacy
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
