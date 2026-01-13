import { useState } from 'react';
import { AlertCircle, Heart, Check, Sparkles } from 'lucide-react';
import { BumpDialog } from './BumpDialog';
import { SeverityLevel } from '@/types/record';
import { toast } from 'sonner';
import { Confetti } from './Confetti';

interface CheckInButtonsProps {
  onBump: (location: string, severity: SeverityLevel) => Promise<boolean>;
  onSafe: () => Promise<{ success: boolean; alreadyCheckedIn: boolean }>;
  hasSafeRecordToday: boolean;
}

export function CheckInButtons({ onBump, onSafe, hasSafeRecordToday }: CheckInButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiType, setConfettiType] = useState<'safe' | 'bump'>('safe');
  const [safeButtonAnimating, setSafeButtonAnimating] = useState(false);
  const [bumpButtonAnimating, setBumpButtonAnimating] = useState(false);

  const handleSafe = async () => {
    const result = await onSafe();
    if (result.alreadyCheckedIn) {
      toast.info('今天已经打卡过平安了哦！', {
        icon: '✅',
      });
    } else if (result.success) {
      setSafeButtonAnimating(true);
      setConfettiType('safe');
      setShowConfetti(true);
      toast.success('今日平安无事！太棒了！', {
        icon: '🌸',
      });
      setTimeout(() => {
        setSafeButtonAnimating(false);
        setShowConfetti(false);
      }, 3000);
    } else {
      toast.error('打卡失败，请重试');
    }
  };

  const handleBumpSubmit = async (location: string, severity: SeverityLevel) => {
    const success = await onBump(location, severity);
    setDialogOpen(false);
    if (success) {
      setBumpButtonAnimating(true);
      setConfettiType('bump');
      setShowConfetti(true);
      toast('已记录碰撞情况，注意安全哦！', {
        icon: '🩹',
      });
      setTimeout(() => {
        setBumpButtonAnimating(false);
        setShowConfetti(false);
      }, 3000);
    } else {
      toast.error('记录失败，请重试');
    }
  };

  return (
    <>
      <Confetti active={showConfetti} type={confettiType} />
      <div className="flex gap-8 items-center justify-center">
        <button
          onClick={() => setDialogOpen(true)}
          className={`bump-button bump-button-danger group ${bumpButtonAnimating ? 'animate-bounce-in' : ''}`}
        >
          <AlertCircle className={`w-10 h-10 mb-2 transition-transform duration-300 ${bumpButtonAnimating ? 'animate-wiggle' : 'group-hover:scale-110'}`} />
          <span className="text-lg font-semibold">碰了！</span>
        </button>

        <button
          onClick={handleSafe}
          className={`bump-button bump-button-safe group relative ${hasSafeRecordToday ? 'opacity-75' : ''} ${safeButtonAnimating ? 'bump-button-checked animate-bounce-in' : ''}`}
        >
          {hasSafeRecordToday ? (
            <>
              <div className="relative">
                <Check className={`w-10 h-10 mb-2 ${safeButtonAnimating ? 'animate-pop' : ''}`} />
                {safeButtonAnimating && (
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 animate-sparkle text-yellow-200" />
                )}
              </div>
              <span className="text-lg font-semibold">已打卡</span>
            </>
          ) : (
            <>
              <Heart className="heart-icon w-10 h-10 mb-2 transition-transform duration-300 group-hover:scale-110" />
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
    </>
  );
}