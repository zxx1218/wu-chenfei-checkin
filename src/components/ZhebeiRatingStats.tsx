import { useMemo } from 'react';
import { MilkteaRecord } from '@/hooks/useMilkteaRecords';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ZhebeiRatingStatsProps {
  records: MilkteaRecord[];
  drinker?: '小菲' | 'zxx';
}

export const ZhebeiRatingStats = ({ records, drinker }: ZhebeiRatingStatsProps) => {
  // 过滤出有评价的奶茶记录
  const ratedRecords = useMemo(() => {
    return records.filter(r => 
      r.type === 'milktea' && 
      r.zhebeiRating && 
      (!drinker || r.drinker === drinker)
    );
  }, [records, drinker]);

  // 统计各评价数量
  const stats = useMemo(() => {
    const excellent = ratedRecords.filter(r => r.zhebeiRating === '夯爆了').length;
    const average = ratedRecords.filter(r => r.zhebeiRating === '中不溜').length;
    const poor = ratedRecords.filter(r => r.zhebeiRating === '拉完了').length;
    const total = ratedRecords.length;

    return {
      excellent,
      average,
      poor,
      total,
      excellentPercent: total > 0 ? Math.round((excellent / total) * 100) : 0,
      averagePercent: total > 0 ? Math.round((average / total) * 100) : 0,
      poorPercent: total > 0 ? Math.round((poor / total) * 100) : 0,
    };
  }, [ratedRecords]);

  if (stats.total === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">还没有这杯奶茶评价记录哦~</p>
        <p className="text-xs mt-1">喝奶茶时可以选择评价</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 总体统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl p-4 text-center border border-green-500/20">
          <div className="text-3xl mb-1">🔥</div>
          <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
          <p className="text-xs text-muted-foreground mt-1">夯爆了</p>
          <p className="text-xs text-green-600/70">{stats.excellentPercent}%</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-2xl p-4 text-center border border-yellow-500/20">
          <div className="text-3xl mb-1">😐</div>
          <p className="text-2xl font-bold text-yellow-600">{stats.average}</p>
          <p className="text-xs text-muted-foreground mt-1">中不溜</p>
          <p className="text-xs text-yellow-600/70">{stats.averagePercent}%</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl p-4 text-center border border-red-500/20">
          <div className="text-3xl mb-1">💩</div>
          <p className="text-2xl font-bold text-red-600">{stats.poor}</p>
          <p className="text-xs text-muted-foreground mt-1">拉完了</p>
          <p className="text-xs text-red-600/70">{stats.poorPercent}%</p>
        </div>
      </div>

      {/* 评价分布进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>评价分布</span>
          <span>共 {stats.total} 条评价</span>
        </div>
        <div className="h-3 bg-accent/50 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${stats.excellentPercent}%` }}
          />
          <div 
            className="bg-yellow-500 transition-all duration-500"
            style={{ width: `${stats.averagePercent}%` }}
          />
          <div 
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${stats.poorPercent}%` }}
          />
        </div>
      </div>

      {/* 评价趋势分析 */}
      {stats.total >= 3 && (
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>评价分析</span>
          </h4>
          <div className="space-y-2 text-sm">
            {stats.excellentPercent >= 50 && (
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>好评率超过50%，浙北奶茶整体不错！</span>
              </div>
            )}
            {stats.poorPercent >= 50 && (
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span>差评较多，建议谨慎选择~</span>
              </div>
            )}
            {stats.averagePercent >= 50 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Minus className="w-4 h-4" />
                <span>评价中规中矩，还有提升空间</span>
              </div>
            )}
            {stats.excellentPercent > stats.poorPercent && stats.excellentPercent < 50 && (
              <div className="flex items-center gap-2 text-green-600/70">
                <TrendingUp className="w-4 h-4" />
                <span>好评多于差评，继续保持！</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
