import { Achievement } from '@/types/achievement';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const categories = [
    { id: 'streak', name: '连续平安', icon: '🔥' },
    { id: 'milestone', name: '里程碑', icon: '🎯' },
    { id: 'special', name: '特殊成就', icon: '✨' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="font-semibold">成就进度</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{unlockedCount}</span>
          <span className="text-muted-foreground"> / {totalCount}</span>
        </div>
      </div>
      <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />

      {/* Categories */}
      <TooltipProvider>
        {categories.map(category => {
          const categoryAchievements = achievements.filter(a => a.category === category.id);
          
          return (
            <div key={category.id} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {categoryAchievements.map(achievement => (
                  <Tooltip key={achievement.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-pointer",
                          achievement.unlocked
                            ? "bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 shadow-sm hover:shadow-md hover:scale-105"
                            : "bg-muted/50 border-2 border-transparent grayscale opacity-50"
                        )}
                      >
                        <span className={cn(
                          "text-2xl sm:text-3xl transition-transform",
                          achievement.unlocked && "animate-bounce-subtle"
                        )}>
                          {achievement.icon}
                        </span>
                        {achievement.progress !== undefined && !achievement.unlocked && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <Progress 
                              value={(achievement.progress / (achievement.maxProgress || 1)) * 100} 
                              className="h-1"
                            />
                          </div>
                        )}
                        {achievement.unlocked && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-[10px]">✓</span>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <div className="text-center">
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        {achievement.progress !== undefined && (
                          <p className="text-xs mt-1">
                            进度: {achievement.progress} / {achievement.maxProgress}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
