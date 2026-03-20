'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Baby,
  Palette,
  LogOut,
  Info,
  ChevronRight,
  Check,
  Loader2,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useBaby } from '@/hooks/use-baby-context';
import { cn } from '@/lib/utils';
import { BABY_THEMES } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const { activeBaby, babies, setActiveBaby } = useBaby();
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    image?: string;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch user profile
  useState(() => {
    fetch('/api/user/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {})
      .finally(() => setUserLoading(false));
  });

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/');
    } catch {
      setSigningOut(false);
    }
  };

  const handleSelectBaby = (baby: typeof activeBaby) => {
    if (baby) setActiveBaby(baby);
  };

  const currentTheme = activeBaby?.theme
    ? BABY_THEMES[activeBaby.theme]
    : BABY_THEMES.STRAWBERRY;

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {user?.image && (
                  <AvatarImage src={user.image} alt={user?.name || ''} />
                )}
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Baby Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Active Baby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {babies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No babies added yet. Create your first baby profile to get started.
            </p>
          ) : (
            babies.map((baby) => {
              const isActive = activeBaby?.id === baby.id;
              const theme = baby.theme ? BABY_THEMES[baby.theme] : BABY_THEMES.STRAWBERRY;
              return (
                <motion.div key={baby.id} whileTap={{ scale: 0.98 }}>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/30'
                    )}
                    onClick={() => handleSelectBaby(baby)}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Baby className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{baby.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Born {new Date(baby.birthDate).toLocaleDateString()}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Theme Preview */}
      {activeBaby && currentTheme && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br',
                  currentTheme.gradient
                )}
              />
              <div>
                <p className="font-medium text-sm">{currentTheme.name}</p>
                <p className="text-xs text-muted-foreground">
                  Current theme for {activeBaby.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {Object.entries(BABY_THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  className={cn(
                    'w-8 h-8 rounded-full bg-gradient-to-br border-2 transition-all',
                    theme.gradient,
                    activeBaby.theme === key
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-transparent'
                  )}
                  title={theme.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <Separator />
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Sign Out
        </Button>
      </motion.div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Living Legacy</span>
          </div>
          <p>
            A beautiful baby journal to capture and preserve every precious
            moment of your little one&apos;s journey.
          </p>
          <p className="text-xs">Version 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
}
