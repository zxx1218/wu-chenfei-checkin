import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  emoji: string;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  active: boolean;
  type: 'safe' | 'bump';
}

const safeEmojis = ['🌸', '💖', '✨', '🌟', '💕', '🎀', '🦋', '🌷'];
const bumpEmojis = ['🩹', '💪', '⭐', '🌈', '❤️‍🩹', '🧸'];

export function Confetti({ active, type }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const emojis = type === 'safe' ? safeEmojis : bumpEmojis;
      const newPieces: ConfettiPiece[] = [];
      
      for (let i = 0; i < 20; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          delay: Math.random() * 0.5,
          duration: 1.5 + Math.random() * 1,
        });
      }
      
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [active, type]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall text-2xl"
          style={{
            left: `${piece.x}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          {piece.emoji}
        </div>
      ))}
    </div>
  );
}
