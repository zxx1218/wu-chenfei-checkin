import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface MilkteaCalendarProps {
  records: MilkteaRecord[];
  onDateClick?: (date: string) => void;
}

export const MilkteaCalendar = ({ records, onDateClick }: MilkteaCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 生成日历数据
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取当月第一天是星期几（0-6，0是周日）
    let startDayOfWeek = firstDay.getDay();
    // 转换为周一开始（0-6，0是周一）
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const days: Array<{ date: number; fullDate: string; records: MilkteaRecord[] }> = [];
    
    // 填充上月的日期
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      const fullDate = new Date(year, month - 1, date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      days.push({ date, fullDate, records: [] });
    }
    
    // 填充当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = new Date(year, month, i).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const dayRecords = records.filter(r => r.date === fullDate && r.type === 'milktea');
      days.push({ date: i, fullDate, records: dayRecords });
    }
    
    // 填充下月的日期
    const remainingDays = 42 - days.length; // 6行 x 7天 = 42
    for (let i = 1; i <= remainingDays; i++) {
      const fullDate = new Date(year, month + 1, i).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      days.push({ date: i, fullDate, records: [] });
    }
    
    return days;
  }, [year, month, records]);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const handleDateClick = (fullDate: string) => {
    if (onDateClick) {
      onDateClick(fullDate);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">
            {year}年 {monthNames[month]}
          </h3>
          <Button variant="link" size="sm" onClick={goToToday} className="text-xs">
            回到今天
          </Button>
        </div>
        
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const milkteaCount = day.records.length;
          const hasNoMilktea = records.some(
            r => r.date === day.fullDate && r.type === 'no_milktea'
          );
          const today = isToday(day.date);
          const isCurrentMonth = day.date <= 31 && index >= 7 && index < 35; // 简化判断

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.fullDate)}
              className={`
                relative aspect-square rounded-xl p-2 transition-all
                ${today ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${milkteaCount > 0 ? 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/40' : ''}
                ${hasNoMilktea && milkteaCount === 0 ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40' : ''}
                ${!milkteaCount && !hasNoMilktea && isCurrentMonth ? 'hover:bg-accent' : ''}
              `}
            >
              <span className={`
                text-sm font-medium
                ${today ? 'text-primary' : 'text-foreground'}
              `}>
                {day.date}
              </span>
              
              {/* 奶茶标记 */}
              {milkteaCount > 0 && (
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5">
                  <span className="text-xs">🧋</span>
                  {milkteaCount > 1 && (
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      ×{milkteaCount}
                    </span>
                  )}
                </div>
              )}
              
              {/* 今日很乖标记 */}
              {hasNoMilktea && milkteaCount === 0 && (
                <div className="absolute bottom-1 right-1">
                  <span className="text-xs">🌟</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/30"></div>
          <span>喝奶茶</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30"></div>
          <span>今日很乖</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded ring-2 ring-primary"></div>
          <span>今天</span>
        </div>
      </div>
    </div>
  );
};
