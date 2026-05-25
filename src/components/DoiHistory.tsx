import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DoiRecord } from '@/hooks/useDoiRecords';

interface Props {
  records: DoiRecord[];
  onDelete: (id: string) => void;
}

const DoiHistory = ({ records, onDelete }: Props) => {
  if (!records.length) return null;
  const recent = records.slice(0, 10);
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">📖 最近记录</h3>
      <ul className="space-y-2">
        {recent.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
            <div className="text-sm">
              <div className="font-medium">{r.date} · {r.time}</div>
              <div className="text-xs text-muted-foreground">
                {r.position || '—'} · {r.durationMinutes}分钟 · {'❤️'.repeat(Math.min(r.passionScore || 0, 10))}
              </div>
              {r.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</div>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(r.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoiHistory;