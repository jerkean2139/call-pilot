import { useState } from 'react';
import {
  AlertCircle,
  Target,
  ShieldAlert,
  Wrench,
  Clock,
  DollarSign,
  Users,
  Heart,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Thermometer,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { Insight, InsightCategory } from '@/shared/types';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
}

const CATEGORY_META: Record<
  InsightCategory,
  { icon: typeof AlertCircle; label: string; color: string }
> = {
  'pain-point': { icon: AlertCircle, label: 'Pain Points', color: 'text-red-400' },
  'symptom': { icon: Thermometer, label: 'Symptoms', color: 'text-orange-300' },
  'desired-outcome': { icon: Target, label: 'Desired Outcomes', color: 'text-green-400' },
  'objection': { icon: ShieldAlert, label: 'Objections', color: 'text-orange-400' },
  'current-tools': { icon: Wrench, label: 'Current Tools', color: 'text-blue-400' },
  'urgency': { icon: Clock, label: 'Urgency / Timeline', color: 'text-yellow-400' },
  'budget': { icon: DollarSign, label: 'Budget Clues', color: 'text-emerald-400' },
  'authority': { icon: Users, label: 'Authority / Stakeholders', color: 'text-violet-400' },
  'personal': { icon: Heart, label: 'Personal Details', color: 'text-pink-400' },
  'follow-up': { icon: ArrowRight, label: 'Follow-up Commitments', color: 'text-blue-300' },
  'risk': { icon: AlertTriangle, label: 'Risks to Close', color: 'text-red-300' },
  'buying-signal': { icon: TrendingUp, label: 'Buying Signals', color: 'text-green-300' },
};

const CATEGORY_ORDER: InsightCategory[] = [
  'pain-point',
  'desired-outcome',
  'objection',
  'buying-signal',
  'urgency',
  'budget',
  'authority',
  'current-tools',
  'follow-up',
  'risk',
  'symptom',
  'personal',
];

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER),
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group insights by category
  const grouped = new Map<InsightCategory, Insight[]>();
  for (const insight of insights) {
    const list = grouped.get(insight.category) || [];
    list.push(insight);
    grouped.set(insight.category, list);
  }

  if (insights.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <Target className="w-8 h-8 text-cp-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-cp-text-muted text-sm">
            Insights will appear here as the conversation progresses
          </p>
          <p className="text-cp-text-muted text-xs mt-1 opacity-60">
            Extracted every ~20 seconds during active calls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped.get(cat);
        if (!items || items.length === 0) return null;

        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const isExpanded = expandedCategories.has(cat);

        return (
          <div key={cat} className="cp-card overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cp-surface-hover transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-cp-text-muted shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-cp-text-muted shrink-0" />
              )}
              <Icon className={cn('w-3.5 h-3.5 shrink-0', meta.color)} />
              <span className="text-xs font-medium text-cp-text flex-1 text-left">
                {meta.label}
              </span>
              <span className="cp-badge bg-cp-surface-hover text-cp-text-muted">
                {items.length}
              </span>
            </button>

            {isExpanded && (
              <div className="px-3 pb-2 space-y-1.5">
                {items.map((insight) => (
                  <div
                    key={insight.id}
                    className="pl-7 py-1 border-l-2 border-cp-border ml-1"
                  >
                    <p className="text-xs text-cp-text leading-relaxed">{insight.text}</p>
                    {insight.evidenceQuote && (
                      <p className="text-[10px] text-cp-text-muted mt-0.5 italic">
                        &ldquo;{insight.evidenceQuote}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          'text-[10px]',
                          insight.source === 'direct'
                            ? 'text-cp-success'
                            : 'text-cp-warning',
                        )}
                      >
                        {insight.source === 'direct' ? 'Direct' : 'Inferred'}
                      </span>
                      <span className="text-[10px] text-cp-text-muted">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
