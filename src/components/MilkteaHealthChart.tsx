import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface Props {
  records: MilkteaRecord[];
}

const getHealthLevel = (score: number) => {
  if (score >= 90) return { label: '非常健康 🌟', color: 'bg-green-500', emoji: '💪', desc: '你很自律，继续保持！' };
  if (score >= 70) return { label: '比较健康 😊', color: 'bg-emerald-400', emoji: '😊', desc: '整体不错，偶尔放纵也OK~' };
  if (score >= 50) return { label: '一般般 😐', color: 'bg-yellow-400', emoji: '😐', desc: '奶茶有点多了，注意控制哦~' };
  if (score >= 30) return { label: '需要注意 😟', color: 'bg-orange-400', emoji: '😟', desc: '糖分摄入偏高，要少喝一点！' };
  return { label: '危险警告 🚨', color: 'bg-red-500', emoji: '🚨', desc: '奶茶喝太多了！身体会抗议的！' };
};

export const MilkteaHealthChart = ({ records }: Props) => {
  const analysis = useMemo(() => {
    const milkteaRecords = records.filter(r => r.type === 'milktea');
    const noMilkteaRecords = records.filter(r => r.type === 'no_milktea');
    const totalDays = new Set([...milkteaRecords, ...noMilkteaRecords].map(r => r.date)).size;

    if (totalDays === 0) return null;

    const milkteaDays = new Set(milkteaRecords.map(r => r.date)).size;
    const totalCups = milkteaRecords.length;
    const avgCupsPerDay = totalDays > 0 ? totalCups / totalDays : 0;
    const noMilkteaDays = noMilkteaRecords.length;

    // Health score: base 100, deduct for drinking
    // -5 per cup, +3 per no-milktea day, min 0 max 100
    const goodRatio = totalDays > 0 ? noMilkteaDays / totalDays : 0;
    let score = Math.round(goodRatio * 100 - avgCupsPerDay * 10);
    score = Math.max(0, Math.min(100, score));

    // Recent 7 days trend
    const last7 = getLast7DaysData(records);

    return { score, totalDays, milkteaDays, totalCups, avgCupsPerDay, noMilkteaDays, last7 };
  }, [records]);

  if (!analysis) {
    return <p className="text-center text-muted-foreground py-4">还没有足够数据~</p>;
  }

  const health = getHealthLevel(analysis.score);

  return (
    <div className="space-y-5">
      {/* Health Score */}
      <div className="text-center">
        <p className="text-5xl mb-2">{health.emoji}</p>
        <p className="text-2xl font-bold text-foreground">{analysis.score} 分</p>
        <p className="text-sm font-medium text-primary mt-1">{health.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{health.desc}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>健康度</span>
          <span>{analysis.score}/100</span>
        </div>
        <Progress value={analysis.score} className="h-3" />
      </div>

      {/* Detail metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="总天数" value={`${analysis.totalDays} 天`} />
        <MetricCard label="喝奶茶天数" value={`${analysis.milkteaDays} 天`} />
        <MetricCard label="总杯数" value={`${analysis.totalCups} 杯`} />
        <MetricCard label="日均杯数" value={`${analysis.avgCupsPerDay.toFixed(1)} 杯`} />
      </div>

      {/* Last 7 days */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">近7天记录</p>
        <div className="flex justify-between gap-1">
          {analysis.last7.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-lg">{day.cups > 0 ? '🧋' : day.safe ? '🌟' : '·'}</span>
              <span className="text-[10px] text-muted-foreground">{day.label}</span>
              {day.cups > 1 && (
                <span className="text-[10px] font-medium text-foreground">×{day.cups}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-accent/40 rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

function getLast7DaysData(records: MilkteaRecord[]) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    const dayLabel = d.toLocaleDateString('zh-CN', { weekday: 'short' });
    const dayRecords = records.filter(r => r.date === dateStr);
    const cups = dayRecords.filter(r => r.type === 'milktea').length;
    const safe = dayRecords.some(r => r.type === 'no_milktea');
    days.push({ label: dayLabel, cups, safe });
  }
  return days;
}
