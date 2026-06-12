import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Target } from 'lucide-react';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface Props {
  records: MilkteaRecord[];
}

export const MilkteaComparison = ({ records }: Props) => {
  const comparison = useMemo(() => {
    const xiaofeiRecords = records.filter(r => r.drinker === '小菲');
    const zxxRecords = records.filter(r => r.drinker === 'zxx');

    // 计算统计数据
    const calcStats = (userRecords: MilkteaRecord[]) => {
      const milkteaRecords = userRecords.filter(r => r.type === 'milktea');
      const noMilkteaRecords = userRecords.filter(r => r.type === 'no_milktea');
      const totalDays = new Set([...milkteaRecords, ...noMilkteaRecords].map(r => r.date)).size;
      
      if (totalDays === 0) return null;

      const milkteaDays = new Set(milkteaRecords.map(r => r.date)).size;
      const totalCups = milkteaRecords.length;
      const avgCupsPerDay = totalDays > 0 ? totalCups / totalDays : 0;
      const noMilkteaDays = noMilkteaRecords.length;

      // Health score calculation: 喝的越少分数越高，满分100分
      // 假设每天最多喝3杯为基准，超过则扣分
      const maxExpectedCups = totalDays * 3; // 预期最大杯数（每天3杯）
      let score = Math.round(((maxExpectedCups - totalCups) / maxExpectedCups) * 100);
      score = Math.max(0, Math.min(100, score));

      // Brand preferences
      const brandMap: Record<string, number> = {};
      milkteaRecords.forEach(r => {
        const brand = r.brand || '未标注';
        brandMap[brand] = (brandMap[brand] || 0) + 1;
      });
      const favoriteBrand = Object.entries(brandMap).sort((a, b) => b[1] - a[1])[0];

      return {
        totalDays,
        milkteaDays,
        totalCups,
        avgCupsPerDay,
        noMilkteaDays,
        healthScore: score,
        favoriteBrand: favoriteBrand ? favoriteBrand[0] : '无',
        favoriteBrandCount: favoriteBrand ? favoriteBrand[1] : 0,
      };
    };

    const xiaofeiStats = calcStats(xiaofeiRecords);
    const zxxStats = calcStats(zxxRecords);

    if (!xiaofeiStats && !zxxStats) return null;

    // 确定各项对比的胜者
    const comparisons = {
      totalCups: {
        label: '总杯数',
        xiaofei: xiaofeiStats?.totalCups || 0,
        zxx: zxxStats?.totalCups || 0,
        winner: (xiaofeiStats?.totalCups || 0) > (zxxStats?.totalCups || 0) ? '小菲' : 'zxx',
        icon: '🧋',
      },
      healthScore: {
        label: '健康分数',
        xiaofei: xiaofeiStats?.healthScore || 0,
        zxx: zxxStats?.healthScore || 0,
        winner: (xiaofeiStats?.healthScore || 0) > (zxxStats?.healthScore || 0) ? '小菲' : 'zxx',
        icon: '💪',
      },
      noMilkteaDays: {
        label: '自律天数',
        xiaofei: xiaofeiStats?.noMilkteaDays || 0,
        zxx: zxxStats?.noMilkteaDays || 0,
        winner: (xiaofeiStats?.noMilkteaDays || 0) > (zxxStats?.noMilkteaDays || 0) ? '小菲' : 'zxx',
        icon: '🌟',
      },
      avgCupsPerDay: {
        label: '日均杯数（越少越好）',
        xiaofei: xiaofeiStats?.avgCupsPerDay || 0,
        zxx: zxxStats?.avgCupsPerDay || 0,
        winner: (xiaofeiStats?.avgCupsPerDay || 0) < (zxxStats?.avgCupsPerDay || 0) ? '小菲' : 'zxx',
        icon: '📊',
      },
    };

    // 计算总胜利次数
    const xiaofeiWins = Object.values(comparisons).filter(c => c.winner === '小菲').length;
    const zxxWins = Object.values(comparisons).filter(c => c.winner === 'zxx').length;
    const overallWinner = xiaofeiWins > zxxWins ? '小菲' : zxxWins > xiaofeiWins ? 'zxx' : '平局';

    return {
      xiaofeiStats,
      zxxStats,
      comparisons,
      xiaofeiWins,
      zxxWins,
      overallWinner,
    };
  }, [records]);

  if (!comparison) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-4">还没有足够的数据进行对比~</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Winner */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>奶茶PK排行榜</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-4xl mb-2">
              {comparison.overallWinner === '平局' ? '🤝' : '👑'}
            </p>
            <p className="text-lg font-bold text-foreground">
              {comparison.overallWinner === '平局' 
                ? '势均力敌！' 
                : `${comparison.overallWinner} 获胜！`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              小菲 {comparison.xiaofeiWins} : {comparison.zxxWins} zxx
            </p>
          </div>

          {/* Comparison Items */}
          <div className="space-y-4">
            {Object.entries(comparison.comparisons).map(([key, comp]) => (
              <div key={key} className="bg-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{comp.icon}</span>
                    <span className="font-medium text-foreground">{comp.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-primary">{comp.winner}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">小菲</span>
                      <span className="font-bold text-foreground">
                        {typeof comp.xiaofei === 'number' && comp.xiaofei % 1 !== 0 
                          ? comp.xiaofei.toFixed(1) 
                          : comp.xiaofei}
                      </span>
                    </div>
                    <Progress 
                      value={(comp.xiaofei / Math.max(comp.xiaofei, comp.zxx)) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">zxx</span>
                      <span className="font-bold text-foreground">
                        {typeof comp.zxx === 'number' && comp.zxx % 1 !== 0 
                          ? comp.zxx.toFixed(1) 
                          : comp.zxx}
                      </span>
                    </div>
                    <Progress 
                      value={(comp.zxx / Math.max(comp.xiaofei, comp.zxx)) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        {comparison.xiaofeiStats && (
          <UserStatCard 
            name="小菲" 
            stats={comparison.xiaofeiStats} 
            color="hsl(340, 75%, 55%)"
          />
        )}
        {comparison.zxxStats && (
          <UserStatCard 
            name="zxx" 
            stats={comparison.zxxStats} 
            color="hsl(200, 70%, 50%)"
          />
        )}
      </div>

      {/* Fun Facts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-primary" />
            <span>趣味数据</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {comparison.xiaofeiStats && comparison.zxxStats && (
              <>
                <FunFact
                  icon="🏆"
                  text={`喝奶茶最多的一天，${comparison.xiaofeiStats.totalCups > comparison.zxxStats.totalCups ? '小菲' : 'zxx'}以${Math.max(comparison.xiaofeiStats.totalCups, comparison.zxxStats.totalCups)}杯领先`}
                />
                <FunFact
                  icon="💚"
                  text={`更自律的是${comparison.xiaofeiStats.noMilkteaDays > comparison.zxxStats.noMilkteaDays ? '小菲' : 'zxx'}，有${Math.max(comparison.xiaofeiStats.noMilkteaDays, comparison.zxxStats.noMilkteaDays)}天没喝奶茶`}
                />
                <FunFact
                  icon="🎯"
                  text={`小菲最爱${comparison.xiaofeiStats.favoriteBrand}（${comparison.xiaofeiStats.favoriteBrandCount}杯），zxx最爱${comparison.zxxStats.favoriteBrand}（${comparison.zxxStats.favoriteBrandCount}杯）`}
                />
                <FunFact
                  icon="📈"
                  text={`两人合计喝了${comparison.xiaofeiStats.totalCups + comparison.zxxStats.totalCups}杯奶茶，平均每人${((comparison.xiaofeiStats.totalCups + comparison.zxxStats.totalCups) / 2).toFixed(0)}杯`}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserStatCard = ({ name, stats, color }: { name: string; stats: any; color: string }) => (
  <Card className="border-2" style={{ borderColor: color }}>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
        />
        {name}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <StatItem label="总杯数" value={`${stats.totalCups}杯`} />
        <StatItem label="健康分" value={`${stats.healthScore}分`} />
        <StatItem label="自律天数" value={`${stats.noMilkteaDays}天`} />
        <StatItem label="日均杯数" value={`${stats.avgCupsPerDay.toFixed(1)}杯`} />
      </div>
      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          最爱：{stats.favoriteBrand}（{stats.favoriteBrandCount}杯）
        </p>
      </div>
    </CardContent>
  </Card>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-accent/30 rounded-lg p-2 text-center">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-bold text-foreground text-sm">{value}</p>
  </div>
);

const FunFact = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-start gap-2 bg-accent/20 rounded-lg p-3">
    <span className="text-xl">{icon}</span>
    <p className="text-foreground leading-relaxed">{text}</p>
  </div>
);
