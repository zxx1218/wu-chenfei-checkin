import { useMemo } from 'react';
import type { DoiRecord } from '@/hooks/useDoiRecords';

interface Props {
  records: DoiRecord[];
}

const calcStreak = (records: DoiRecord[]) => {
  if (!records.length) return 0;
  
  // 按日期去重，获取所有不同的日期
  const uniqueDates = Array.from(new Set(records.map(r => r.date))).sort().reverse();
  
  // 计算连续天数
  let streak = 1;
  let currentDate = new Date(uniqueDates[0]);
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const nextDate = new Date(uniqueDates[i]);
    const diffTime = currentDate.getTime() - nextDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = nextDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
};

const DoiStats = ({ records }: Props) => {
  const stats = useMemo(() => {
    const total = records.length;
    const totalMin = records.reduce((s, r) => s + (r.durationMinutes || 0), 0);
    const avgPassion = total ? (records.reduce((s, r) => s + (r.passionScore || 0), 0) / total).toFixed(1) : '0';
    
    // 统计同一天多次记录的情况
    const dateCount: Record<string, number> = {};
    records.forEach((r) => {
      dateCount[r.date] = (dateCount[r.date] || 0) + 1;
    });
    
    // DOI天数：所有有DOI记录的不同日期数量
    const doiDays = Object.keys(dateCount).length;
    const maxRecordsInADay = Math.max(...Object.values(dateCount), 0);
    
    const posCount: Record<string, number> = {};
    records.forEach((r) => {
      if (!r.position) return;
      r.position.split(/[、,，]/).map((s) => s.trim()).filter(Boolean).forEach((p) => {
        posCount[p] = (posCount[p] || 0) + 1;
      });
    });
    
    // 统计评价分布
    const ratingCount: Record<string, number> = {
      '超赞': 0,
      '还行': 0,
      '一般': 0,
      '不太行': 0
    };
    
    // 统计新字段
    const sceneCount: Record<string, number> = {};
    let femaleOrgasmCount = 0;
    let oralSexCount = 0;
    let oralExplosionCount = 0;
    const ejaculationMethodCount: Record<string, number> = {};
    
    records.forEach((r) => {
      // 统计评价
      if (r.doiRating) {
        ratingCount[r.doiRating]++;
      }
      
      if (r.scene) {
        sceneCount[r.scene] = (sceneCount[r.scene] || 0) + 1;
      }
      
      if (r.femaleOrgasm) {
        femaleOrgasmCount++;
      }
      
      if (r.oralSex) {
        oralSexCount++;
      }
      
      if (r.oralExplosion) {
        oralExplosionCount++;
      }
      
      if (r.ejaculationMethod) {
        ejaculationMethodCount[r.ejaculationMethod] = (ejaculationMethodCount[r.ejaculationMethod] || 0) + 1;
      }
    });
    
    const favPosition = Object.entries(posCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const favScene = Object.entries(sceneCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const favEjaculationMethod = Object.entries(ejaculationMethodCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const streak = calcStreak(records);
    
    // 找出最受欢迎的评价
    const topRating = Object.entries(ratingCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    
    return { 
      total, 
      totalMin, 
      avgPassion, 
      favPosition, 
      streak,
      doiDays,
      maxRecordsInADay,
      femaleOrgasmCount,
      oralSexCount,
      oralExplosionCount,
      favScene,
      favEjaculationMethod,
      ratingCount, // 评价统计
      topRating, // 最受欢迎的评价
      totalRated: Object.values(ratingCount).reduce((sum, count) => sum + count, 0) // 总评价数
    };
  }, [records]);

  const cards = [
    { label: '总次数', value: stats.total, emoji: '💖', bg: 'from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40' },
    { label: '总时长', value: `${stats.totalMin} 分`, emoji: '⏱️', bg: 'from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40' },
    { label: '连续天数', value: `${stats.streak} 天`, emoji: '🔥', bg: 'from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40' },
    { label: '平均激情', value: stats.avgPassion, emoji: '❤️‍🔥', bg: 'from-red-100 to-pink-100 dark:from-red-950/40 dark:to-pink-950/40' },
    { label: '最爱体位', value: stats.favPosition, emoji: '👑', bg: 'from-yellow-100 to-amber-100 dark:from-yellow-950/40 dark:to-amber-950/40' },
    { label: 'DOI天数', value: `${stats.doiDays} 天`, emoji: '📅', bg: 'from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40' },
    { label: '单日最多', value: `${stats.maxRecordsInADay} 次`, emoji: '🎯', bg: 'from-cyan-100 to-sky-100 dark:from-cyan-950/40 dark:to-sky-950/40' },
    { label: '小菲高潮', value: `${stats.femaleOrgasmCount} 次`, emoji: '♀️', bg: 'from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40' },
    { label: '口交次数', value: `${stats.oralSexCount} 次`, emoji: '👄', bg: 'from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40' },
    { label: '最爱评价', value: stats.topRating, emoji: '✨', bg: 'from-purple-100 to-fuchsia-100 dark:from-purple-950/40 dark:to-fuchsia-950/40' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-2xl p-4 shadow-sm hover:scale-105 transition-transform`}>
          <div className="text-2xl mb-1">{c.emoji}</div>
          <div className="text-xs text-muted-foreground">{c.label}</div>
          <div className="text-lg font-bold text-foreground truncate">{c.value}</div>
        </div>
      ))}
    </div>
  );
};

export default DoiStats;