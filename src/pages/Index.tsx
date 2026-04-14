import { CheckInButtons } from '@/components/CheckInButtons';
import { RecordHistory } from '@/components/RecordHistory';
import { RecordStats } from '@/components/RecordStats';
import { LocationHeatmap } from '@/components/LocationHeatmap';
import { TrendChart } from '@/components/TrendChart';
import { Link } from 'react-router-dom';
import { AchievementBadges } from '@/components/AchievementBadges';
import { useRecords } from '@/hooks/useRecords';
import { useAchievements } from '@/hooks/useAchievements';
import { CalendarDays } from 'lucide-react';

const Index = () => {
  const { records, allRecords, loading, addBumpRecord, addSafeRecord, deleteRecord, setFilterDateRange, hasSafeRecordToday } = useRecords();
  const achievements = useAchievements(allRecords);
  
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
            小梨的每日一碰
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

        {/* Check-in Buttons */}
        <section className="mb-12">
          <CheckInButtons onBump={addBumpRecord} onSafe={addSafeRecord} hasSafeRecordToday={hasSafeRecordToday} />
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

        {/* History Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>📋</span>
            <span>每日记录</span>
          </h2>
          <RecordHistory records={records} loading={loading} onDelete={deleteRecord} />
        </section>
      </div>
    </div>
  );
};

export default Index;
