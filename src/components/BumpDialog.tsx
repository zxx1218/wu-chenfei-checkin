import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SeverityLevel } from '@/types/record';

interface BumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (location: string, severity: SeverityLevel) => void;
  pastLocations?: string[];
}

const severityOptions: { value: SeverityLevel; label: string; emoji: string }[] = [
  { value: '超痛', label: '超痛', emoji: '😭' },
  { value: '很痛', label: '很痛', emoji: '😢' },
  { value: '一般痛', label: '一般痛', emoji: '😐' },
  { value: '不怎么痛', label: '不怎么痛', emoji: '😊' },
];

const COMMON_PARTS = ['头', '额头', '左手肘', '右手肘', '左膝盖', '右膝盖', '左脚趾', '右脚趾', '腰', '后背', '小腿', '肩膀'];

export function BumpDialog({ open, onOpenChange, onSubmit, pastLocations = [] }: BumpDialogProps) {
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel | ''>('');

  // Merge: 历史最常用 top 6 + 常用部位，去重
  const quickChips = (() => {
    const fromHistory = pastLocations.slice(0, 6);
    return Array.from(new Set([...fromHistory, ...COMMON_PARTS])).slice(0, 12);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && severity) {
      onSubmit(location.trim(), severity);
      setLocation('');
      setSeverity('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLocation('');
      setSeverity('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">记录碰撞情况 🩹</DialogTitle>
          <DialogDescription className="text-center">
            告诉我哪里碰到了，疼不疼？
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base">
              碰到哪里了？
            </Label>
            <Input
              id="location"
              placeholder="例如：左手肘、右膝盖..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 text-base"
              maxLength={50}
              list="bump-location-suggestions"
            />
            <datalist id="bump-location-suggestions">
              {pastLocations.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickChips.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setLocation(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    location === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="text-base">
              严重程度
            </Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as SeverityLevel)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="选择疼痛程度..." />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-3">
                    <span className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={!location.trim() || !severity}
          >
            记录一下
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
