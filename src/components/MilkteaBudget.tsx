import { useMemo, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface Props {
  records: MilkteaRecord[];
}

const STORAGE_KEY = 'milktea_weekly_budget';

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

export const MilkteaBudget = ({ records }: Props) => {
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 5;
  });
  const [editing, setEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  const weekCups = useMemo(() => {
    const { monday, sunday } = getWeekRange();
    return records.filter(r => {
      if (r.type !== 'milktea' || !r.createdAt) return false;
      const d = new Date(r.createdAt);
      return d >= monday && d <= sunday;
    }).length;
  }, [records]);

  const ratio = budget > 0 ? Math.min(weekCups / budget, 1) * 100 : 0;
  const remaining = Math.max(budget - weekCups, 0);
  const over = weekCups > budget;

  const saveBudget = () => {
    setBudget(tempBudget);
    localStorage.setItem(STORAGE_KEY, String(tempBudget));
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Budget display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">本周预算</p>
          <p className="text-2xl font-bold text-foreground">{weekCups} <span className="text-base font-normal text-muted-foreground">/ {budget} 杯</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { setTempBudget(budget); setEditing(!editing); }}>
          <Settings2 className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{over ? '⚠️ 已超额！' : `还剩 ${remaining} 杯`}</span>
          <span>{Math.round(ratio)}%</span>
        </div>
        <Progress value={ratio} className={`h-3 ${over ? '[&>div]:bg-destructive' : ''}`} />
      </div>

      {/* Status message */}
      <div className={`text-center py-2 rounded-xl text-sm font-medium ${
        over
          ? 'bg-destructive/10 text-destructive'
          : ratio >= 80
            ? 'bg-yellow-500/10 text-yellow-600'
            : 'bg-green-500/10 text-green-600'
      }`}>
        {over
          ? `🚨 已超出 ${weekCups - budget} 杯，要克制啊！`
          : ratio >= 80
            ? '⚠️ 快到上限了，悠着点~'
            : ratio > 0
              ? '✅ 还在预算内，继续保持！'
              : '🌟 本周还没喝奶茶，太棒了！'}
      </div>

      {/* Edit budget */}
      {editing && (
        <div className="bg-accent/30 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">设置每周上限</p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-8">{tempBudget}</span>
            <Slider
              value={[tempBudget]}
              onValueChange={([v]) => setTempBudget(v)}
              min={1}
              max={14}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">杯</span>
          </div>
          <Button onClick={saveBudget} size="sm" className="w-full rounded-xl">
            保存
          </Button>
        </div>
      )}
    </div>
  );
};
