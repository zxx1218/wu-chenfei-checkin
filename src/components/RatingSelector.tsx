import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RatingOption {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

interface RatingSelectorProps<T> {
  value?: T;
  onChange: (value: T) => void;
  options: RatingOption[];
  className?: string;
}

const RatingSelector = <T extends string>({ value, onChange, options, className }: RatingSelectorProps<T>) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant="outline"
          className={cn(
            "flex-1 min-w-[80px] rounded-2xl border-2 py-3 transition-all",
            value === option.value
              ? `${option.color} border-2 ring-2 ring-offset-2 ${option.color.replace('bg-', 'ring-').replace('/10', '/30')}`
              : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50",
            "flex flex-col items-center justify-center gap-1"
          )}
          onClick={() => onChange(option.value as T)}
        >
          <span className="text-lg">{option.emoji}</span>
          <span className="text-xs font-bold">{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

export { RatingSelector };