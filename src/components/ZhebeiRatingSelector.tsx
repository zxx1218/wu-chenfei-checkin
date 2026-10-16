import { Button } from '@/components/ui/button';

export type ZhebeiRating = '夯爆了' | '中不溜' | '拉完了';

interface ZhebeiRatingSelectorProps {
  value: ZhebeiRating | '';
  onChange: (rating: ZhebeiRating | '') => void;
  size?: 'sm' | 'default';
}

const RATINGS: { value: ZhebeiRating; emoji: string; color: string }[] = [
  { value: '夯爆了', emoji: '🔥', color: 'green' },
  { value: '中不溜', emoji: '😐', color: 'yellow' },
  { value: '拉完了', emoji: '💩', color: 'red' },
];

const colorMap = {
  green: {
    active: 'bg-green-500 hover:bg-green-600 border-green-500',
    inactive: 'border-green-500/30 text-green-600 hover:bg-green-500/10',
  },
  yellow: {
    active: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500',
    inactive: 'border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10',
  },
  red: {
    active: 'bg-red-500 hover:bg-red-600 border-red-500',
    inactive: 'border-red-500/30 text-red-600 hover:bg-red-500/10',
  },
};

export function ZhebeiRatingSelector({ value, onChange, size = 'default' }: ZhebeiRatingSelectorProps) {
  return (
    <div className="flex gap-2">
      {RATINGS.map(({ value: rating, emoji, color }) => (
        <Button
          key={rating}
          type="button"
          variant={value === rating ? 'default' : 'outline'}
          onClick={() => onChange(value === rating ? '' : rating)}
          className={`flex-1 rounded-xl transition-all ${size === 'sm' ? 'text-sm' : ''} ${
            value === rating ? colorMap[color].active : colorMap[color].inactive
          }`}
        >
          {emoji} {rating}
        </Button>
      ))}
    </div>
  );
}
