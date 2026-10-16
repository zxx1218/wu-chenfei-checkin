import { Check } from 'lucide-react';

interface Props {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  tone?: 'primary' | 'secondary';
}

const StickerToggle = ({ active, onClick, emoji, label, tone = 'primary' }: Props) => {
  const toneOn = tone === 'primary'
    ? 'bg-primary text-primary-foreground border-primary shadow-[0_6px_16px_hsl(var(--primary)/0.35)]'
    : 'bg-secondary text-secondary-foreground border-secondary shadow-[0_6px_16px_hsl(var(--secondary)/0.35)]';
  const toneOff = tone === 'primary'
    ? 'border-primary/40 bg-card hover:bg-primary/5'
    : 'border-secondary/40 bg-card hover:bg-secondary/5';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center justify-center gap-1.5 p-4 rounded-3xl border-2 border-dashed transition-all active:scale-95 ${
        active ? `border-solid ${toneOn} -rotate-1` : `${toneOff} text-muted-foreground`
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform ${active ? 'bg-white/25 scale-110' : 'bg-muted/40'}`}>
        {active ? <Check className="w-5 h-5" /> : <span>{emoji}</span>}
      </div>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
};

export default StickerToggle;
