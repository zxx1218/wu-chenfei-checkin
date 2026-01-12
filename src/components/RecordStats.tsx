import { useMemo, useState } from 'react';
import { BumpRecord, SeverityLevel } from '@/types/record';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, AlertTriangle, Smile, Activity } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

interface RecordStatsProps {
  records: BumpRecord[];
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

const severityWeights: Record<SeverityLevel, number> = {
  '超痛': 4,
  '很痛': 3,
  '一般痛': 2,
  '不怎么痛': 1,
};

export function RecordStats({ records, onDateRangeChange }: RecordStatsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange({ from: range?.from, to: range?.to });
  };

  const handleQuickSelect = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    const newRange = { from, to };
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleSelectAll = () => {
    setDateRange(undefined);
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const stats = useMemo(() => {
    const bumpRecords = records.filter(r => r.type === 'bump');
    const safeRecords = records.filter(r => r.type === 'safe');
    
    const severityCounts: Record<SeverityLevel, number> = {
      '超痛': 0,
      '很痛': 0,
      '一般痛': 0,
      '不怎么痛': 0,
    };
    
    let totalSeverityScore = 0;
    
    bumpRecords.forEach(record => {
      if (record.severity) {
        severityCounts[record.severity]++;
        totalSeverityScore += severityWeights[record.severity];
      }
    });

    const avgSeverity = bumpRecords.length > 0 
      ? (totalSeverityScore / bumpRecords.length).toFixed(1)
      : '0';

    // Get unique dates for bump records
    const uniqueBumpDates = new Set(bumpRecords.map(r => r.date));
    const uniqueSafeDates = new Set(safeRecords.map(r => r.date));

    return {
      totalBumps: bumpRecords.length,
      totalSafe: safeRecords.length,
      severityCounts,
      avgSeverity,
      bumpDays: uniqueBumpDates.size,
      safeDays: uniqueSafeDates.size,
    };
  }, [records]);

  return (
    <div className="space-y-4">
      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MM/dd', { locale: zhCN })} - {format(dateRange.to, 'MM/dd', { locale: zhCN })}
                  </>
                ) : (
                  format(dateRange.from, 'PPP', { locale: zhCN })
                )
              ) : (
                <span>全部时间</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateChange}
              numberOfMonths={1}
              locale={zhCN}
            />
          </PopoverContent>
        </Popover>
        
        <div className="flex gap-1.5">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleQuickSelect(7)}
            className="text-xs"
          >
            近7天
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleQuickSelect(14)}
            className="text-xs"
          >
            近14天
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleQuickSelect(30)}
            className="text-xs"
          >
            近30天
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSelectAll}
            className="text-xs"
          >
            全部
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stats-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[hsl(var(--bump-red))]" />
            <span className="text-sm text-muted-foreground">碰撞次数</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--bump-red))]">
            {stats.totalBumps}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            共 {stats.bumpDays} 天有碰撞
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-4 h-4 text-[hsl(var(--safe-green))]" />
            <span className="text-sm text-muted-foreground">平安打卡</span>
          </div>
          <div className="text-2xl font-bold text-[hsl(var(--safe-green))]">
            {stats.totalSafe}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            共 {stats.safeDays} 天平安
          </div>
        </div>

        <div className="stats-card col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">疼痛程度分布</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(stats.severityCounts).map(([severity, count]) => (
              <div key={severity} className="text-center">
                <div className={`severity-badge ${getSeverityClass(severity as SeverityLevel)} mb-1`}>
                  {count}
                </div>
                <div className="text-xs text-muted-foreground">{severity}</div>
              </div>
            ))}
          </div>
          {stats.totalBumps > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 text-center">
              <span className="text-sm text-muted-foreground">平均疼痛指数：</span>
              <span className="font-semibold text-primary ml-1">{stats.avgSeverity}</span>
              <span className="text-xs text-muted-foreground ml-1">/ 4</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSeverityClass(severity: SeverityLevel): string {
  const classMap: Record<SeverityLevel, string> = {
    '超痛': 'severity-super',
    '很痛': 'severity-very',
    '一般痛': 'severity-normal',
    '不怎么痛': 'severity-mild',
  };
  return classMap[severity];
}