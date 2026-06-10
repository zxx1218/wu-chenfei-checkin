import { useMemo, useState } from 'react';
import { CheckInButtons } from '@/components/CheckInButtons';
import { RecordHistory } from '@/components/RecordHistory';
import { RecordStats } from '@/components/RecordStats';
import { LocationHeatmap } from '@/components/LocationHeatmap';
import { TrendChart } from '@/components/TrendChart';
import { BumpInsights } from '@/components/BumpInsights';
import { EditBumpDialog } from '@/components/EditBumpDialog';
import { Link } from 'react-router-dom';
import { AchievementBadges } from '@/components/AchievementBadges';
import { useRecords } from '@/hooks/useRecords';
import { useAchievements } from '@/hooks/useAchievements';
import { CalendarDays, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BumpRecord } from '@/types/record';
import { toast } from 'sonner';

const Index = () => {
  const {
    records, allRecords, loading,
    addBumpRecord, addSafeRecord, deleteRecord, updateRecord,
    setFilterDateRange, hasSafeRecordToday, safeStreak,
  } = useRecords();
  const achievements = useAchievements(allRecords);
  const [editing, setEditing] = useState<BumpRecord | null>(null);

  // Top body parts from history (for quick chips in dialog)
  const pastLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    allRecords.forEach((r) => {
      if (r.type === 'bump' && r.location) {
        counts[r.location] = (counts[r.location] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [allRecords]);

  const exportCSV = () => {
    if (allRecords.length === 0) {
      toast.info('还没有记录可以导出');
      return;
    }
    const rows = [
      ['日期', '时间', '类型', '部位', '严重程度'],
      ...allRecords.map((r) => [
        r.date, r.time,
        r.type === 'bump' ? '碰撞' : '平安',
        r.location || '', r.severity || '',
      ]),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `磕碰记录_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出 CSV');
  };
  
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-4">
            小梨的日常记录
          </h1>
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border/50">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{today}</span>
          </div>
          <div className="mt-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← 返回首页
            </Link>
          </div>
        </header>

        {/* Safe streak banner */}
        {safeStreak > 0 && (
          <div className="mb-6 rounded-3xl p-4 bg-gradient-to-r from-[hsl(var(--safe-green-light))] to-[hsl(var(--accent)/0.2)] border border-[hsl(var(--safe-green)/0.25)] flex items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--safe-green)/0.15)] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[hsl(var(--safe-green))]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">连续平安打卡</p>
              <p className="text-xl font-bold text-[hsl(var(--safe-green))]">{safeStreak} 天</p>
            </div>
            <span className="text-2xl">🌸</span>
          </div>
        )}

        {/* Check-in Buttons */}
        <section className="mb-12">
          <CheckInButtons
            onBump={addBumpRecord}
            onSafe={addSafeRecord}
            hasSafeRecordToday={hasSafeRecordToday}
            pastLocations={pastLocations}
          />
        </section>

        {/* Stats Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>统计分析</span>
          </h2>
          <RecordStats records={records} onDateRangeChange={setFilterDateRange} />
        </section>

        {/* Achievements Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🏅</span>
            <span>成就徽章</span>
          </h2>
          <AchievementBadges achievements={achievements} />
        </section>

        {/* Trend Chart Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>趋势图表</span>
          </h2>
          <TrendChart records={allRecords} />
        </section>

        {/* Location Heatmap Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🔥</span>
            <span>碰撞热点</span>
          </h2>
          <LocationHeatmap records={records} />
        </section>

        {/* Insights Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🧠</span>
            <span>智能洞察</span>
          </h2>
          <BumpInsights records={allRecords} />
        </section>

        {/* History Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>📋</span>
              <span>每日记录</span>
            </h2>
            <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-full gap-1.5">
              <Download className="w-4 h-4" />
              导出
            </Button>
          </div>
          <RecordHistory
            records={records}
            loading={loading}
            onDelete={deleteRecord}
            onEdit={(r) => setEditing(r)}
          />
        </section>
      </div>

      <EditBumpDialog
        record={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSave={updateRecord}
      />
    </div>
  );
};

export default Index;
