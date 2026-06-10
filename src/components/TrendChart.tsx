import { useMemo } from 'react';
import { BumpRecord } from '@/types/record';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TrendChartProps {
  records: BumpRecord[];
}

export function TrendChart({ records }: TrendChartProps) {
  const chartData = useMemo(() => {
    // Get the last 14 days
    const today = new Date();
    const startDate = subDays(today, 13);
    
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    // Count bumps per day
    const bumpsByDate: Record<string, number> = {};
    const safeByDate: Record<string, number> = {};
    
    records.forEach(record => {
      if (record.createdAt) {
        const dateKey = format(new Date(record.createdAt), 'yyyy-MM-dd');
        if (record.type === 'bump') {
          bumpsByDate[dateKey] = (bumpsByDate[dateKey] || 0) + 1;
        } else {
          safeByDate[dateKey] = (safeByDate[dateKey] || 0) + 1;
        }
      }
    });

    return days.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        date: dateKey,
        displayDate: format(day, 'MM/dd', { locale: zhCN }),
        shortDate: format(day, 'd日', { locale: zhCN }),
        bumps: bumpsByDate[dateKey] || 0,
        safe: safeByDate[dateKey] || 0,
      };
    });
  }, [records]);

  const totalBumps = chartData.reduce((sum, day) => sum + day.bumps, 0);

  if (totalBumps === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无趋势数据</p>
        <p className="text-xs mt-1">记录碰撞后将显示趋势图</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bumpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="safeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-foreground mb-2">{data.displayDate}</p>
                      <div className="space-y-1">
                        <p className="text-xs flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-muted-foreground">碰撞：</span>
                          <span className="font-medium text-foreground">{data.bumps} 次</span>
                        </p>
                        <p className="text-xs flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary" />
                          <span className="text-muted-foreground">平安：</span>
                          <span className="font-medium text-foreground">{data.safe} 次</span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="bumps"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#bumpGradient)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="safe"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              fill="url(#safeGradient)"
              dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--secondary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">碰撞次数</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-muted-foreground">平安打卡</span>
        </div>
      </div>
    </div>
  );
}