import { useMemo, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings2 } from 'lucide-react';
import { userSettingsApi } from '@/lib/api';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface Props {
  records: MilkteaRecord[];
}

const DRINKERS = ['小菲', 'zxx'] as const;
type Drinker = typeof DRINKERS[number];

const getBudgetKey = (drinker: Drinker) => `milktea_weekly_budget_${drinker}`;

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

interface PersonBudget {
  drinker: Drinker;
  budget: number;
  weekCups: number;
  loading: boolean;
}

const PersonBudgetCard = ({ 
  drinker, 
  budget, 
  weekCups, 
  loading,
  onSave 
}: PersonBudget & { onSave: (drinker: Drinker, newBudget: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  useEffect(() => {
    setTempBudget(budget);
  }, [budget]);

  const ratio = budget > 0 ? Math.min(weekCups / budget, 1) * 100 : 0;
  const remaining = Math.max(budget - weekCups, 0);
  const over = weekCups > budget;

  const handleSave = async () => {
    await onSave(drinker, tempBudget);
    setEditing(false);
  };

  const toggleEditing = () => {
    setTempBudget(budget);
    setEditing(!editing);
  };

  if (loading) {
    return (
      <div className="bg-accent/30 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{drinker}的本周预算</p>
            <p className="text-2xl font-bold text-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/30 rounded-2xl p-4 space-y-4">
      {/* Budget display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{drinker}的本周预算</p>
          <p className="text-2xl font-bold text-foreground">{weekCups} <span className="text-base font-normal text-muted-foreground">/ {budget} 杯</span></p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleEditing}>
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
        <div className="bg-background/50 rounded-xl p-3 space-y-3">
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
          <Button onClick={handleSave} size="sm" className="w-full rounded-xl">
            保存
          </Button>
        </div>
      )}
    </div>
  );
};

export const MilkteaBudget = ({ records }: Props) => {
  const [budgets, setBudgets] = useState<Record<Drinker, number>>({
    '小菲': 5,
    'zxx': 5
  });
  const [loadingStates, setLoadingStates] = useState<Record<Drinker, boolean>>({
    '小菲': true,
    'zxx': true
  });

  // 从后端加载每个人的预算设置
  useEffect(() => {
    let mounted = true;

    const loadBudgets = async () => {
      // 并行加载两个人的预算
      const promises = DRINKERS.map(async (drinker) => {
        try {
          const response = await userSettingsApi.getByKey(getBudgetKey(drinker));
          
          if (response?.data?.value) {
            const savedBudget = parseInt(response.data.value, 10);
            return { drinker, budget: isNaN(savedBudget) ? 5 : savedBudget };
          }
          return { drinker, budget: 5 };
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error(`[MilkteaBudget] 加载${drinker}预算失败:`, error);
          }
          return { drinker, budget: 5 };
        }
      });

      const results = await Promise.all(promises);

      if (mounted) {
        const newBudgets: Record<Drinker, number> = { '小菲': 5, 'zxx': 5 };
        results.forEach(({ drinker, budget }) => {
          newBudgets[drinker] = budget;
        });

        setBudgets(newBudgets);

        // 更新加载状态
        const newLoadingStates: Record<Drinker, boolean> = { '小菲': false, 'zxx': false };
        setLoadingStates(newLoadingStates);
      }
    };

    loadBudgets();

    return () => {
      mounted = false;
    };
  }, []);

  // 计算每个人的本周奶茶杯数
  const personWeekCups = useMemo(() => {
    const { monday, sunday } = getWeekRange();
    const result: Record<Drinker, number> = { '小菲': 0, 'zxx': 0 };
    
    records.forEach(r => {
      if (r.type !== 'milktea' || !r.createdAt || !r.drinker) return;
      const d = new Date(r.createdAt);
      if (d >= monday && d <= sunday) {
        result[r.drinker as Drinker] = (result[r.drinker as Drinker] || 0) + 1;
      }
    });
    
    return result;
  }, [records]);

  const handleSaveBudget = async (drinker: Drinker, newBudget: number) => {
    try {
      await userSettingsApi.set(getBudgetKey(drinker), newBudget);
      setBudgets(prev => ({ ...prev, [drinker]: newBudget }));
    } catch (error) {
      console.error(`Failed to save budget for ${drinker}:`, error);
    }
  };

  return (
    <div className="space-y-4">
      {DRINKERS.map(drinker => (
        <PersonBudgetCard
          key={drinker}
          drinker={drinker}
          budget={budgets[drinker]}
          weekCups={personWeekCups[drinker]}
          loading={loadingStates[drinker]}
          onSave={handleSaveBudget}
        />
      ))}
    </div>
  );
};
