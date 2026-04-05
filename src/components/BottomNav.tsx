import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Star, Image, Clock, Shield, Users, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useBabyContext } from '../context/BabyContext';

const keeperNavItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/milestones', icon: Star, label: 'Milestones' },
  { to: '/gallery', icon: Image, label: 'Gallery' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
];

const adminNavItems = [
  { to: '/admin', icon: Shield, label: 'Dashboard' },
  { to: '/family', icon: Users, label: 'Family' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const { isSuperAdmin } = useAuth();
  const { baby } = useBabyContext();

  const navItems = (isSuperAdmin && !baby) ? adminNavItems : keeperNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-rose-100 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-rose-600'
                  : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'transition-transform',
                    isActive && 'scale-110'
                  )}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
