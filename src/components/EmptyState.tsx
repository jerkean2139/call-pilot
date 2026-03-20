import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center py-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-rose-50 p-4">
        <Icon size={32} className="text-rose-300" />
      </div>
      <h3 className="mb-1 font-heading text-lg font-semibold text-gray-700">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-gray-400">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 hover:shadow-lg active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
