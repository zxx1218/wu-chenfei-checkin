import { useMemo } from 'react';
import { BumpRecord } from '@/types/record';
import { Achievement } from '@/types/achievement';

export function useAchievements(records: BumpRecord[]): Achievement[] {
  return useMemo(() => {
    // Sort records by date
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime()
    );

    // Get unique dates
    const uniqueDates = new Set(records.map(r => r.date));
    const safeRecords = records.filter(r => r.type === 'safe');
    const bumpRecords = records.filter(r => r.type === 'bump');
    
    // Calculate consecutive safe days (current streak)
    const calculateCurrentStreak = () => {
      const safeDates = new Set(safeRecords.map(r => r.date));
      const bumpDates = new Set(bumpRecords.map(r => r.date));
      
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (bumpDates.has(dateStr)) {
          break; // Streak broken by bump
        }
        
        if (safeDates.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          // No record for this day (not today), check if it's in our record range
          const oldestRecord = sortedRecords[0];
          if (oldestRecord) {
            const oldestDate = new Date(oldestRecord.createdAt || oldestRecord.date);
            if (checkDate < oldestDate) {
              break; // Before first record
            }
          }
        }
      }
      
      return streak;
    };

    // Calculate max consecutive safe days (best streak)
    const calculateMaxStreak = () => {
      if (sortedRecords.length === 0) return 0;
      
      const dateMap = new Map<string, 'safe' | 'bump'>();
      sortedRecords.forEach(r => {
        // If there's a bump on a day, mark it as bump
        if (r.type === 'bump') {
          dateMap.set(r.date, 'bump');
        } else if (!dateMap.has(r.date)) {
          dateMap.set(r.date, 'safe');
        }
      });
      
      let maxStreak = 0;
      let currentStreak = 0;
      
      const allDates = Array.from(dateMap.keys()).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      allDates.forEach(date => {
        if (dateMap.get(date) === 'safe') {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      return maxStreak;
    };

    const currentStreak = calculateCurrentStreak();
    const maxStreak = calculateMaxStreak();
    const totalRecords = records.length;
    const totalSafeDays = new Set(safeRecords.map(r => r.date)).size;
    const totalBumps = bumpRecords.length;

    const achievements: Achievement[] = [
      // First time achievements
      {
        id: 'first_checkin',
        name: '初次打卡',
        description: '完成第一次打卡记录',
        icon: '🎉',
        unlocked: totalRecords >= 1,
        category: 'milestone',
      },
      {
        id: 'first_safe',
        name: '平安第一天',
        description: '记录第一个平安无事的日子',
        icon: '🌟',
        unlocked: safeRecords.length >= 1,
        category: 'milestone',
      },
      
      // Streak achievements
      {
        id: 'streak_3',
        name: '三日平安',
        description: '连续3天平安无事',
        icon: '🛡️',
        unlocked: maxStreak >= 3,
        progress: Math.min(currentStreak, 3),
        maxProgress: 3,
        category: 'streak',
      },
      {
        id: 'streak_7',
        name: '一周守护',
        description: '连续7天平安无事',
        icon: '🏅',
        unlocked: maxStreak >= 7,
        progress: Math.min(currentStreak, 7),
        maxProgress: 7,
        category: 'streak',
      },
      {
        id: 'streak_14',
        name: '双周坚持',
        description: '连续14天平安无事',
        icon: '🏆',
        unlocked: maxStreak >= 14,
        progress: Math.min(currentStreak, 14),
        maxProgress: 14,
        category: 'streak',
      },
      {
        id: 'streak_30',
        name: '月度冠军',
        description: '连续30天平安无事',
        icon: '👑',
        unlocked: maxStreak >= 30,
        progress: Math.min(currentStreak, 30),
        maxProgress: 30,
        category: 'streak',
      },
      
      // Milestone achievements
      {
        id: 'checkin_10',
        name: '坚持打卡',
        description: '累计打卡10次',
        icon: '📝',
        unlocked: totalRecords >= 10,
        progress: Math.min(totalRecords, 10),
        maxProgress: 10,
        category: 'milestone',
      },
      {
        id: 'checkin_50',
        name: '打卡达人',
        description: '累计打卡50次',
        icon: '⭐',
        unlocked: totalRecords >= 50,
        progress: Math.min(totalRecords, 50),
        maxProgress: 50,
        category: 'milestone',
      },
      {
        id: 'checkin_100',
        name: '百次记录',
        description: '累计打卡100次',
        icon: '💯',
        unlocked: totalRecords >= 100,
        progress: Math.min(totalRecords, 100),
        maxProgress: 100,
        category: 'milestone',
      },
      {
        id: 'safe_days_10',
        name: '平安十日',
        description: '累计10天平安无事',
        icon: '🌈',
        unlocked: totalSafeDays >= 10,
        progress: Math.min(totalSafeDays, 10),
        maxProgress: 10,
        category: 'milestone',
      },
      {
        id: 'safe_days_30',
        name: '月度平安',
        description: '累计30天平安无事',
        icon: '🌙',
        unlocked: totalSafeDays >= 30,
        progress: Math.min(totalSafeDays, 30),
        maxProgress: 30,
        category: 'milestone',
      },
      
      // Special achievements
      {
        id: 'survivor',
        name: '小心翼翼',
        description: '在碰撞后坚持打卡',
        icon: '💪',
        unlocked: totalBumps > 0 && safeRecords.length > 0,
        category: 'special',
      },
      {
        id: 'careful_walker',
        name: '谨慎行者',
        description: '累计平安天数超过碰撞次数的10倍',
        icon: '🚶',
        unlocked: totalBumps > 0 && totalSafeDays >= totalBumps * 10,
        category: 'special',
      },
    ];

    return achievements;
  }, [records]);
}
