import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DoiRecord, PartnerReview } from '@/hooks/useDoiRecords';
import DoiReviewDialog from './DoiReviewDialog';

interface Props {
  records: DoiRecord[];
  onDelete: (id: string) => void;
  onSaveReview: (id: string, r: PartnerReview) => Promise<boolean>;
}

const DoiHistory = ({ records, onDelete, onSaveReview }: Props) => {
  const [reviewing, setReviewing] = useState<DoiRecord | null>(null);
  if (!records.length) return null;
  const recent = records.slice(0, 10);
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">📖 最近记录</h3>
      <ul className="space-y-2">
        {recent.map((r) => (
          <li key={r.id} className="bg-muted/30 rounded-xl px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm flex-1 min-w-0">
                <div className="font-medium">{r.date} · {r.time}</div>
                <div className="text-xs text-muted-foreground">
                  {r.position || '—'} · {r.durationMinutes}分钟 · {'❤️'.repeat(Math.min(r.passionScore || 0, 10))}
                </div>
                {r.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</div>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setReviewing(r)}
                >
                  💌 {r.partnerReviewedAt ? '查看/修改' : '评价'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(r.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            {r.partnerReviewedAt && (
              <div className="mt-2 ml-1 pl-3 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg py-1.5 pr-2">
                <div className="text-xs font-medium text-primary">
                  💌 {r.partnerReviewer || 'TA'} 的评价
                  {r.partnerOverallScore != null && <span className="ml-1">· {'⭐'.repeat(Math.min(r.partnerOverallScore, 10))} {r.partnerOverallScore}/10</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                  {r.partnerDurationFeedback && <span>时长：{r.partnerDurationFeedback}</span>}
                  {r.partnerPositionFeedback && <span>体位：{r.partnerPositionFeedback}</span>}
                  {r.partnerPassionScore != null && <span>激情：{r.partnerPassionScore}/10</span>}
                </div>
                {r.partnerComment && <div className="text-xs mt-1 italic text-foreground/80">"{r.partnerComment}"</div>}
              </div>
            )}
          </li>
        ))}
      </ul>
      <DoiReviewDialog
        record={reviewing}
        open={!!reviewing}
        onOpenChange={(v) => !v && setReviewing(null)}
        onSave={onSaveReview}
      />
    </div>
  );
};

export default DoiHistory;