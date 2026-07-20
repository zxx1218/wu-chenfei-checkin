import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DoiRecord } from '@/hooks/useDoiRecords';

interface DoiRatingStatsProps {
  records: DoiRecord[];
}

const DoiRatingStats = ({ records }: DoiRatingStatsProps) => {
  // 统计评价分布
  const ratingCounts = {
    '超赞': 0,
    '还行': 0,
    '一般': 0,
    '不太行': 0
  };

  records.forEach(record => {
    if (record.doiRating) {
      ratingCounts[record.doiRating]++;
    }
  });

  const totalRated = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);
  
  const ratingData = [
    { value: '超赞', count: ratingCounts['超赞'], emoji: '🍑', color: 'bg-pink-500', label: '蜜桃臀' },
    { value: '还行', count: ratingCounts['还行'], emoji: '🦋', color: 'bg-purple-500', label: '小蝴蝶' },
    { value: '一般', count: ratingCounts['一般'], emoji: '💧', color: 'bg-blue-500', label: '小水滴' },
    { value: '不太行', count: ratingCounts['不太行'], emoji: '🍋', color: 'bg-yellow-500', label: '小柠檬' },
  ];

  return (
    <Card className="rounded-2xl border-2 border-pink-100 bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-pink-600">✨</span>
          <span className="text-pink-800">体验评价统计</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalRated > 0 ? (
          <div className="space-y-4">
            {ratingData.map((item) => {
              const percentage = totalRated > 0 ? (item.count / totalRated) * 100 : 0;
              
              return (
                <div key={item.value} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className={`${item.color.replace('bg-', 'border-')} text-muted-foreground`}>
                      {item.count} 次
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" indicatorClassName={item.color} />
                  <div className="text-right text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
            
            <div className="pt-3 mt-4 border-t border-pink-200/50 text-center">
              <p className="text-sm text-pink-700">
                总共 <span className="font-bold">{totalRated}</span> 次评价
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">暂无评价数据</p>
            <p className="text-xs mt-1">添加新的doi记录即可开始评价</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoiRatingStats;