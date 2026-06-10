import { useMemo } from 'react';
import { BumpRecord } from '@/types/record';
import { MapPin } from 'lucide-react';

interface LocationHeatmapProps {
  records: BumpRecord[];
}

export function LocationHeatmap({ records }: LocationHeatmapProps) {
  const locationStats = useMemo(() => {
    const bumpRecords = records.filter(r => r.type === 'bump' && r.location);
    const locationCounts: Record<string, number> = {};
    
    bumpRecords.forEach(record => {
      if (record.location) {
        locationCounts[record.location] = (locationCounts[record.location] || 0) + 1;
      }
    });

    const sorted = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const maxCount = sorted.length > 0 ? sorted[0][1] : 0;
    
    return sorted.map(([location, count]) => ({
      location,
      count,
      percentage: maxCount > 0 ? (count / maxCount) * 100 : 0,
    }));
  }, [records]);

  if (locationStats.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暂无碰撞位置数据</p>
      </div>
    );
  }

  const getHeatColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--severity-super))';
    if (percentage >= 60) return 'hsl(var(--severity-very))';
    if (percentage >= 40) return 'hsl(var(--severity-normal))';
    return 'hsl(var(--severity-mild))';
  };

  const getHeatBgColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--severity-super) / 0.15)';
    if (percentage >= 60) return 'hsl(var(--severity-very) / 0.15)';
    if (percentage >= 40) return 'hsl(var(--severity-normal) / 0.15)';
    return 'hsl(var(--severity-mild) / 0.15)';
  };

  return (
    <div className="space-y-3">
      {locationStats.map(({ location, count, percentage }, index) => (
        <div key={location} className="relative">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ 
                  backgroundColor: getHeatBgColor(percentage),
                  color: getHeatColor(percentage)
                }}
              >
                {index + 1}
              </span>
              <span className="font-medium text-foreground">{location}</span>
            </div>
            <span 
              className="text-sm font-semibold px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: getHeatBgColor(percentage),
                color: getHeatColor(percentage)
              }}
            >
              {count} 次
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: getHeatColor(percentage)
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--severity-super))' }} />
          <span className="text-muted-foreground">高危</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--severity-very))' }} />
          <span className="text-muted-foreground">较高</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--severity-normal))' }} />
          <span className="text-muted-foreground">中等</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--severity-mild))' }} />
          <span className="text-muted-foreground">较低</span>
        </div>
      </div>
    </div>
  );
}