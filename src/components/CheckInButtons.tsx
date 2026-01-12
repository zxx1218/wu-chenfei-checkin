import { useState } from 'react';
import { AlertCircle, Heart, Check } from 'lucide-react';
import { BumpDialog } from './BumpDialog';
import { SeverityLevel } from '@/types/record';
import { toast } from 'sonner';

interface CheckInButtonsProps {
  onBump: (location: string, severity: SeverityLevel) => Promise<boolean>;
  onSafe: () => Promise<{ success: boolean; alreadyCheckedIn: boolean }>;
  hasSafeRecordToday: boolean;
}

export function CheckInButtons({ onBump, onSafe, hasSafeRecordToday }: CheckInButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSafe = async () => {
    const result = await onSafe();
    if (result.alreadyCheckedIn) {
      toast.info('今天已经打卡过平安了哦！', {
        icon: '✅',
      });
    } else if (result.success) {
      toast.success('今日平安无事！太棒了！', {
        icon: '🌸',
      });
    } else {
      toast.error('打卡失败，请重试');
    }
  };

  const handleBumpSubmit = async (location: string, severity: SeverityLevel) => {
    const success = await onBump(location, severity);
    setDialogOpen(false);
    if (success) {
      toast('已记录碰撞情况，注意安全哦！', {
        icon: '🩹',
      });
    } else {
      toast.error('记录失败，请重试');
    }
  };

  return (
    <div className="flex gap-8 items-center justify-center">
      <button
        onClick={() => setDialogOpen(true)}
        className="bump-button bump-button-danger group"
      >
        <AlertCircle className="w-10 h-10 mb-2 group-hover:animate-pulse" />
        <span className="text-lg font-semibold">碰了！</span>
      </button>

      <button
        onClick={handleSafe}
        className={`bump-button bump-button-safe group relative ${hasSafeRecordToday ? 'opacity-75' : ''}`}
      >
        {hasSafeRecordToday ? (
          <>
            <Check className="w-10 h-10 mb-2" />
            <span className="text-lg font-semibold">已打卡</span>
          </>
        ) : (
          <>
            <Heart className="w-10 h-10 mb-2 group-hover:animate-pulse" />
            <span className="text-lg font-semibold">平安无事</span>
          </>
        )}
      </button>

      <BumpDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleBumpSubmit}
      />
    </div>
  );
}