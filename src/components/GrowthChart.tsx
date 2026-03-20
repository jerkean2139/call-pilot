import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { GrowthRecord } from '../types';
import { formatShortDate } from '../lib/utils';

interface Props {
  records: GrowthRecord[];
  metric: 'weight' | 'height' | 'head';
}

export default function GrowthChart({ records, metric }: Props) {
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = sorted
    .map((r) => {
      let value: number | undefined;
      if (metric === 'weight' && r.weightLbs !== undefined) {
        value = r.weightLbs + (r.weightOz || 0) / 16;
      } else if (metric === 'height') {
        value = r.heightInches;
      } else if (metric === 'head') {
        value = r.headCircumferenceInches;
      }
      return value !== undefined
        ? { date: formatShortDate(r.date), value, fullDate: r.date }
        : null;
    })
    .filter(Boolean);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No {metric} data yet
      </div>
    );
  }

  const labels = {
    weight: { name: 'Weight', unit: 'lbs' },
    height: { name: 'Height', unit: 'in' },
    head: { name: 'Head', unit: 'in' },
  };

  const colors = {
    weight: '#f43f5e',
    height: '#8b5cf6',
    head: '#f59e0b',
  };

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
            }}
            formatter={(value: number) => [
              `${value.toFixed(1)} ${labels[metric].unit}`,
              labels[metric].name,
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[metric]}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors[metric], strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
