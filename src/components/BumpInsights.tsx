import { useMemo } from 'react';
import { BumpRecord } from '@/types/record';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  records: BumpRecord[];
}

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function BumpInsights({ records }: Props) {
  const { weekData, hourData, riskiest, safestWeekday } = useMemo(() => {
    const bumps = records.filter((r) => r.type === 'bump' && r.createdAt);
    const byWeek = Array(7).fill(0);
    const byHour = Array(24).fill(0);
    bumps.forEach((r) => {
      const d = new Date(r.createdAt!);
      byWeek[d.getDay()]++;
      byHour[d.getHours()]++;
    });
    const weekData = byWeek.map((c, i) => ({ name: WEEK_LABELS[i], count: c }));
    const hourData = byHour.map((c, i) => ({ name: `${i}时`, count: c }));
    const maxHour = byHour.indexOf(Math.max(...byHour));
    const maxWeek = byWeek.indexOf(Math.max(...byWeek));
    const minWeek = byWeek.indexOf(Math.min(...byWeek));
    return {
      weekData,
      hourData,
      riskiest: bumps.length ? `${maxHour}:00 前后 / ${WEEK_LABELS[maxWeek]}` : '—',
      safestWeekday: bumps.length ? WEEK_LABELS[minWeek] : '—',
    };
  }, [records]);

  if (records.filter((r) => r.type === 'bump').length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">还没有碰撞数据可以分析～</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[hsl(var(--bump-red-light))] p-3">
          <p className="text-xs text-muted-foreground mb-1">高发时段</p>
          <p className="text-sm font-semibold text-[hsl(var(--bump-red))]">{riskiest}</p>
        </div>
        <div className="rounded-2xl bg-[hsl(var(--safe-green-light))] p-3">
          <p className="text-xs text-muted-foreground mb-1">最安全的一天</p>
          <p className="text-sm font-semibold text-[hsl(var(--safe-green))]">{safestWeekday}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">星期分布</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">时段分布</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }} />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}