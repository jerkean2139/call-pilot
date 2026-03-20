import { Baby as BabyIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  photoUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl',
};

const iconSizes = { sm: 18, md: 28, lg: 40 };

export default function BabyAvatar({ photoUrl, name, size = 'md', className }: Props) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || 'Baby'}
        className={cn(
          'rounded-full object-cover ring-2 ring-rose-200',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100 ring-2 ring-rose-200',
        sizes[size],
        className
      )}
    >
      <BabyIcon size={iconSizes[size]} className="text-rose-400" />
    </div>
  );
}
