import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(340, 75%, 55%)',
  'hsl(280, 65%, 55%)',
  'hsl(200, 70%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(50, 75%, 50%)',
  'hsl(10, 70%, 55%)',
];

const DRINKER_COLORS = {
  '小菲': 'hsl(340, 75%, 55%)',
  'zxx': 'hsl(200, 70%, 50%)',
};

interface Props {
  records: MilkteaRecord[];
  drinker?: string; // 可选，指定查看某个人的数据
}

export const MilkteaBrandChart = ({ records, drinker }: Props) => {
  const data = useMemo(() => {
    // 如果指定了drinker，只统计该人的数据
    let filteredRecords = records;
    if (drinker) {
      filteredRecords = records.filter(r => r.drinker === drinker);
    }

    const brandMap: Record<string, number> = {};
    filteredRecords
      .filter(r => r.type === 'milktea')
      .forEach(r => {
        const brand = r.brand || '未标注';
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      });
    return Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records, drinker]);

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-4">还没有奶茶记录~</p>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: '杯数', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: 13,
            }}
            formatter={(value: number) => [`${value} 杯`, '数量']}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
