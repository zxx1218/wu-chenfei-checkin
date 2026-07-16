import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DoiRatingSelectorProps {
  value?: '超赞' | '还行' | '一般' | '不太行';
  onChange: (rating: '超赞' | '还行' | '一般' | '不太行') => void;
  className?: string;
}

const DoiRatingSelector = ({ value, onChange, className }: DoiRatingSelectorProps) => {
  const ratings = [
    { value: '超赞', label: '蜜桃臀', emoji: '🍑', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
    { value: '还行', label: '小鹿乱撞', emoji: '🦌', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    { value: '一般', label: '心如止水', emoji: '💧', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    { value: '不太行', label: '小熊难过', emoji: '🐻', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ratings.map((ratingOption) => (
        <Button
          key={ratingOption.value}
          variant="outline"
          className={cn(
            "flex-1 min-w-[70px] max-w-[100px] rounded-2xl border-2 py-3 transition-all",
            value === ratingOption.value
              ? `${ratingOption.color} border-2 ring-2 ring-offset-2 ${ratingOption.color.replace('bg-', 'ring-').replace('/10', '/30')}`
              : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50",
            "flex flex-col items-center justify-center gap-1",
            "h-auto", // 允许按钮高度自适应内容
            "overflow-hidden" // 防止内容溢出
          )}
          onClick={() => onChange(ratingOption.value as '超赞' | '还行' | '一般' | '不太行')}
        >
          <span className="text-lg leading-none">{ratingOption.emoji}</span>
          <span className="text-xs font-bold leading-tight text-center break-words">{ratingOption.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default DoiRatingSelector;