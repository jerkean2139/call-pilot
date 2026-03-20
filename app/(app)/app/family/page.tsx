'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  Send,
  Loader2,
  UserPlus,
  Baby,
  Crown,
  Shield,
  Eye,
  Palette,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useBaby } from '@/hooks/use-baby-context';
import { cn, timeAgo } from '@/lib/utils';
import type { FamilyWithDetails } from '@/types';
import { BABY_THEMES } from '@/types';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  userName: string;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { icon: typeof Crown; label: string; color: string }> = {
  OWNER: { icon: Crown, label: 'Owner', color: 'text-amber-600 bg-amber-100' },
  ADMIN: { icon: Shield, label: 'Admin', color: 'text-blue-600 bg-blue-100' },
  EDITOR: { icon: UserPlus, label: 'Editor', color: 'text-green-600 bg-green-100' },
  VIEWER: { icon: Eye, label: 'Viewer', color: 'text-gray-600 bg-gray-100' },
};

export default function FamilyPage() {
  const { activeBaby, babies } = useBaby();
  const [family, setFamily] = useState<FamilyWithDetails | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    fetchFamily();
  }, [activeBaby]);

  const fetchFamily = async () => {
    if (!activeBaby) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/family?babyId=${activeBaby.id}`);
      if (!res.ok) throw new Error('Failed to load family');
      const data = await res.json();
      setFamily(data.family || data);
      setActivity(data.activity || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !family) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      const res = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: family.id,
          email: inviteEmail.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  if (!activeBaby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">No Baby Selected</h2>
        <p className="text-muted-foreground">Add a baby in settings first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !family) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-destructive mb-4">{error || 'Family not found'}</p>
        <Button onClick={fetchFamily}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Family Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
        >
          <Users className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold">{family.name || 'Our Family'}</h1>
        <p className="text-muted-foreground text-sm">
          {family.memberships?.length || 0} members
        </p>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Family Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {family.memberships?.map((membership) => {
            const role = ROLE_CONFIG[membership.role as string] || ROLE_CONFIG.VIEWER;
            const RoleIcon = role.icon;
            return (
              <div key={membership.user.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {membership.user.image && (
                    <AvatarImage src={membership.user.image} alt={membership.user.name || ''} />
                  )}
                  <AvatarFallback>
                    {membership.user.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {membership.user.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {membership.user.email}
                  </p>
                </div>
                <Badge variant="secondary" className={cn('gap-1 text-xs', role.color)}>
                  <RoleIcon className="w-3 h-3" />
                  {role.label}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Baby Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Baby className="w-4 h-4" />
            Babies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(family.babies || babies).map((baby) => {
            const theme = baby.theme ? BABY_THEMES[baby.theme] : BABY_THEMES.STRAWBERRY;
            return (
              <div
                key={baby.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  baby.id === activeBaby?.id && 'ring-2 ring-primary ring-offset-1'
                )}
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
                {theme && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Palette className="w-3 h-3" />
                    {theme.name}
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Family Member
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
              >
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {inviteSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-600"
              >
                Invite sent successfully!
              </motion.p>
            )}
            {inviteError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-destructive"
              >
                {inviteError}
              </motion.p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{item.userName}</span>{' '}
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
