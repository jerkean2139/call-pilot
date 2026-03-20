'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutList,
  PlusCircle,
  BookOpen,
  Star,
  Menu,
  Lock,
  Users,
  Settings,
  Mic,
  ChevronDown,
  Baby,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBaby } from '@/hooks/use-baby-context';
import { BABY_THEMES } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS: Array<{ label: string; icon: typeof LayoutList; href: string; isCenter?: boolean; isMore?: boolean }> = [
  { label: 'Home', icon: LayoutList, href: '/app' },
  { label: 'Journal', icon: BookOpen, href: '/app/journal' },
  { label: 'Log', icon: PlusCircle, href: '/app/log', isCenter: true },
  { label: 'Milestones', icon: Star, href: '/app/milestones' },
  { label: 'More', icon: Menu, href: '#more', isMore: true },
];

const MORE_ITEMS = [
  { label: 'Vault', icon: Lock, href: '/app/vault' },
  { label: 'Family', icon: Users, href: '/app/family' },
  { label: 'Settings', icon: Settings, href: '/app/settings' },
  { label: 'Voice Memo', icon: Mic, href: '/app/voice' },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeBaby, babies, setActiveBaby } = useBaby();
  const [moreOpen, setMoreOpen] = useState(false);

  const theme = activeBaby?.theme
    ? BABY_THEMES[activeBaby.theme]
    : BABY_THEMES.STRAWBERRY;

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Top Bar - Baby Switcher */}
      <header
        className={cn(
          'sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  {activeBaby?.avatarUrl ? (
                    <AvatarImage src={activeBaby.avatarUrl} alt={activeBaby.name} />
                  ) : null}
                  <AvatarFallback
                    className={cn(
                      'text-xs font-semibold text-white',
                      activeBaby?.theme === 'STORYBOOK'
                        ? 'bg-storybook-500'
                        : 'bg-strawberry-500'
                    )}
                  >
                    {activeBaby?.name?.charAt(0) ?? <Baby className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <span className="font-montserrat text-sm font-semibold">
                  {activeBaby?.name ?? 'Select Baby'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {babies.map((baby) => (
                <DropdownMenuItem
                  key={baby.id}
                  onClick={() => setActiveBaby(baby)}
                  className={cn(
                    'flex items-center gap-2',
                    activeBaby?.id === baby.id && 'bg-muted'
                  )}
                >
                  <Avatar className="h-6 w-6">
                    {baby.avatarUrl ? (
                      <AvatarImage src={baby.avatarUrl} alt={baby.name} />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        'text-[10px] font-semibold text-white',
                        baby.theme === 'STORYBOOK'
                          ? 'bg-storybook-500'
                          : 'bg-strawberry-500'
                      )}
                    >
                      {baby.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{baby.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <h1 className="font-montserrat text-base font-bold tracking-tight text-primary">
            Living Legacy
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-1 pt-2">
          {NAV_ITEMS.map((item) => {
            if (item.isMore) {
              return (
                <Sheet key={item.label} open={moreOpen} onOpenChange={setMoreOpen}>
                  <SheetTrigger asChild>
                    <button
                      className="flex flex-col items-center gap-0.5 px-3 py-1"
                      aria-label="More options"
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {item.label}
                      </span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader className="pb-2">
                      <SheetTitle className="font-montserrat">More</SheetTitle>
                    </SheetHeader>
                    <Separator className="mb-3" />
                    <div className="grid grid-cols-4 gap-4 pb-6">
                      {MORE_ITEMS.map((moreItem) => (
                        <button
                          key={moreItem.label}
                          onClick={() => {
                            setMoreOpen(false);
                            router.push(moreItem.href);
                          }}
                          className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted"
                        >
                          <div
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-full',
                              activeBaby?.theme === 'STORYBOOK'
                                ? 'bg-storybook-100'
                                : 'bg-strawberry-100'
                            )}
                          >
                            <moreItem.icon
                              className={cn(
                                'h-5 w-5',
                                activeBaby?.theme === 'STORYBOOK'
                                  ? 'text-storybook-500'
                                  : 'text-strawberry-500'
                              )}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {moreItem.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              );
            }

            const active = isActive(item.href);

            if (item.isCenter) {
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="relative -mt-3 flex flex-col items-center gap-0.5 px-3"
                  aria-label={item.label}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-full shadow-lg',
                      activeBaby?.theme === 'STORYBOOK'
                        ? 'bg-storybook-500'
                        : 'bg-primary'
                    )}
                  >
                    <PlusCircle className="h-7 w-7 text-white" />
                  </motion.div>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      activeBaby?.theme === 'STORYBOOK'
                        ? 'text-storybook-500'
                        : 'text-primary'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1"
                aria-label={item.label}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active
                      ? activeBaby?.theme === 'STORYBOOK'
                        ? 'text-storybook-500'
                        : 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] transition-colors',
                    active
                      ? activeBaby?.theme === 'STORYBOOK'
                        ? 'font-semibold text-storybook-500'
                        : 'font-semibold text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute -top-1 h-0.5 w-6 rounded-full',
                      activeBaby?.theme === 'STORYBOOK'
                        ? 'bg-storybook-500'
                        : 'bg-primary'
                    )}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
