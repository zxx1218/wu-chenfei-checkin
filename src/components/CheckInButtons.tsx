import { useState } from 'react';
import { AlertCircle, Heart } from 'lucide-react';
import { BumpDialog } from './BumpDialog';
import { SeverityLevel } from '@/types/record';
import { toast } from 'sonner';

interface CheckInButtonsProps {
  onBump: (location: string, severity: SeverityLevel) => void;
  onSafe: () => void;
}

export function CheckInButtons({ onBump, onSafe }: CheckInButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSafe = () => {
    onSafe();
    toast.success('今日平安无事！太棒了！', {
      icon: '🌸',
    });
  };

  const handleBumpSubmit = (location: string, severity: SeverityLevel) => {
    onBump(location, severity);
    setDialogOpen(false);
    toast('已记录碰撞情况，注意安全哦！', {
      icon: '🩹',
    });
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
        className="bump-button bump-button-safe group"
      >
        <Heart className="w-10 h-10 mb-2 group-hover:animate-pulse" />
        <span className="text-lg font-semibold">平安无事</span>
      </button>

      <BumpDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleBumpSubmit}
      />
    </div>
  );
}
