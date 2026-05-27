import { useMemo } from 'react';
import type { DoiRecord } from '@/hooks/useDoiRecords';

interface Props { records: DoiRecord[]; }

const calcStreak = (records: DoiRecord[]): number => {
  if (!records.length) return 0;
  const dateSet = new Set(records.map((r) => r.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (dateSet.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
};

const DoiStats = ({ records }: Props) => {
  const stats = useMemo(() => {
    const total = records.length;
    const totalMin = records.reduce((s, r) => s + (r.durationMinutes || 0), 0);
    const avgPassion = total ? (records.reduce((s, r) => s + (r.passionScore || 0), 0) / total).toFixed(1) : '0';
    const posCount: Record<string, number> = {};
    records.forEach((r) => {
      if (!r.position) return;
      r.position.split(/[、,，]/).map((s) => s.trim()).filter(Boolean).forEach((p) => {
        posCount[p] = (posCount[p] || 0) + 1;
      });
    });
    const favPosition = Object.entries(posCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const streak = calcStreak(records);
    return { total, totalMin, avgPassion, favPosition, streak };
  }, [records]);

  const cards = [
    { label: '总次数', value: stats.total, emoji: '💖', bg: 'from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40' },
    { label: '总时长', value: `${stats.totalMin} 分`, emoji: '⏱️', bg: 'from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40' },
    { label: '连续天数', value: `${stats.streak} 天`, emoji: '🔥', bg: 'from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40' },
    { label: '平均激情', value: stats.avgPassion, emoji: '❤️‍🔥', bg: 'from-red-100 to-pink-100 dark:from-red-950/40 dark:to-pink-950/40' },
    { label: '最爱体位', value: stats.favPosition, emoji: '👑', bg: 'from-yellow-100 to-amber-100 dark:from-yellow-950/40 dark:to-amber-950/40' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-2xl p-4 shadow-sm hover:scale-105 transition-transform`}>
          <div className="text-2xl mb-1">{c.emoji}</div>
          <div className="text-xs text-muted-foreground">{c.label}</div>
          <div className="text-lg font-bold text-foreground truncate">{c.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DoiStats;