import { cn } from '../lib/utils';

interface Props {
  variant?: 'card' | 'stat' | 'milestone';
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <SkeletonPulse className="mb-2 h-3 w-24" />
      <SkeletonPulse className="mb-1.5 h-5 w-3/4" />
      <SkeletonPulse className="h-3 w-full" />
      <SkeletonPulse className="mt-1 h-3 w-2/3" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-100">
      <SkeletonPulse className="mx-auto mb-1 h-7 w-10" />
      <SkeletonPulse className="mx-auto h-3 w-16" />
    </div>
  );
}

export function SkeletonMilestone() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
      <SkeletonPulse className="h-6 w-6 rounded-full" />
      <div className="flex-1">
        <SkeletonPulse className="mb-1 h-4 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function SkeletonList({ variant = 'card', count = 3 }: Props) {
  const Component = variant === 'stat' ? SkeletonStat : variant === 'milestone' ? SkeletonMilestone : SkeletonCard;
  return (
    <div className={variant === 'stat' ? 'grid grid-cols-3 gap-3' : 'space-y-2'}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
