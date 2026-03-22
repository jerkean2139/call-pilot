import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import type { GrowthRecord } from '../types';
import { formatShortDate } from '../lib/utils';
import { getPercentileData } from '../lib/whoPercentiles';

interface Props {
  records: GrowthRecord[];
  metric: 'weight' | 'height' | 'head';
  gender?: 'boy' | 'girl' | 'other';
  showPercentiles?: boolean;
}

export default function GrowthChart({ records, metric, gender, showPercentiles = true }: Props) {
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

  const percentileData = useMemo(() => {
    if (!showPercentiles) return null;
    const pData = getPercentileData(metric, gender);
    if (!pData) return null;
    return pData.map((p) => ({
      date: `${p.ageMonths}mo`,
      p3: p.p3,
      p15: p.p15,
      p50: p.p50,
      p85: p.p85,
      p97: p.p97,
    }));
  }, [metric, gender, showPercentiles]);

  if (data.length === 0 && !percentileData) {
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

  // If we have percentile data and baby data, merge them for display
  if (percentileData && data.length > 0) {
    return (
      <div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {/* Percentile reference below */}
        <div className="mt-2 rounded-xl bg-gray-50 p-2">
          <p className="mb-1 text-center text-[10px] font-medium text-gray-400">
            WHO Growth Standards ({gender === 'girl' ? 'Girls' : 'Boys'})
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-full bg-green-200" /> 3-97th
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-full bg-green-300" /> 15-85th
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-3 bg-green-500" /> 50th
            </span>
          </div>
          <div className="mt-1 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={percentileData} margin={{ top: 2, right: 10, left: -10, bottom: 2 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Area dataKey="p3" stackId="range" fill="transparent" stroke="transparent" />
                <Area dataKey="p97" stackId="range2" fill="#dcfce7" stroke="#86efac" strokeWidth={0.5} fillOpacity={0.5} />
                <Area dataKey="p15" stackId="range3" fill="transparent" stroke="transparent" />
                <Area dataKey="p85" stackId="range4" fill="#bbf7d0" stroke="#4ade80" strokeWidth={0.5} fillOpacity={0.4} />
                <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

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
