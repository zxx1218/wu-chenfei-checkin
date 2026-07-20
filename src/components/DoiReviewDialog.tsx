import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import type { DoiRecord, PartnerReview } from '@/hooks/useDoiRecords';
import DoiRatingSelector from './DoiRatingSelector'; // 导入评价选择器

const DURATION_OPTIONS = ['太短了 😢', '刚刚好 😍', '稍长 😅', '太久啦 🥵'];
const POSITION_OPTIONS = ['不太喜欢 🙈', '还可以 🙂', '挺喜欢 😘', '超爱！💗'];

interface Props {
  record: DoiRecord | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, review: PartnerReview) => Promise<boolean>;
}

const Chips = ({ value, onChange, options }: { value?: string; onChange: (v: string) => void; options: string[] }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
          value === o
            ? 'bg-primary text-primary-foreground border-primary scale-105'
            : 'bg-muted/40 border-border hover:bg-muted'
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

const DoiReviewDialog = ({ record, open, onOpenChange, onSave }: Props) => {
  const [overall, setOverall] = useState(8);
  const [passion, setPassion] = useState(8);
  const [durationFb, setDurationFb] = useState<string>('');
  const [positionFb, setPositionFb] = useState<string>('');
  const [comment, setComment] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [doiRating, setDoiRating] = useState<'超赞' | '还行' | '一般' | '不太行' | undefined>(undefined); // 添加本次体验评价状态

  useEffect(() => {
    if (record) {
      setOverall(record.partnerOverallScore ?? 8);
      setPassion(record.partnerPassionScore ?? 8);
      setDurationFb(record.partnerDurationFeedback ?? '');
      setPositionFb(record.partnerPositionFeedback ?? '');
      setComment(record.partnerComment ?? '');
      setReviewer(record.partnerReviewer ?? '');
      setDoiRating(record.doiRating); // 设置本次体验评价
    }
  }, [record]);

  const submit = async () => {
    if (!record) return;
    const ok = await onSave(record.id, {
      partnerOverallScore: overall,
      partnerPassionScore: passion,
      partnerDurationFeedback: durationFb || undefined,
      partnerPositionFeedback: positionFb || undefined,
      partnerComment: comment.trim() || undefined,
      partnerReviewer: reviewer.trim() || undefined,
      doiRating: doiRating || undefined, // 添加本次体验评价
    });
    if (ok) {
      toast({ title: '评价已提交 💌', description: '甜蜜反馈已记录~' });
      onOpenChange(false);
    } else {
      toast({ title: '保存失败', variant: 'destructive' });
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>对方评价 💌</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {record.date} · {record.time} · {record.position || '—'} · {record.durationMinutes} 分钟
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>评价人</Label>
            <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="比如：宝宝 / TA" maxLength={20} />
          </div>
          <div>
            <Label>本次总评分：{overall} / 10 {'⭐'.repeat(Math.min(overall, 10))}</Label>
            <Slider value={[overall]} min={1} max={10} step={1} onValueChange={(v) => setOverall(v[0])} className="mt-2" />
          </div>
          <div>
            <Label>对方激情评分：{passion} / 10 {'❤️‍🔥'.repeat(Math.min(Math.ceil(passion / 2), 5))}</Label>
            <Slider value={[passion]} min={1} max={10} step={1} onValueChange={(v) => setPassion(v[0])} className="mt-2" />
          </div>
          <div>
            <Label>时长感受</Label>
            <Chips value={durationFb} onChange={setDurationFb} options={DURATION_OPTIONS} />
          </div>
          <div>
            <Label>体位感受（{record.position || '—'}）</Label>
            <Chips value={positionFb} onChange={setPositionFb} options={POSITION_OPTIONS} />
          </div>
          <div>
            <Label>悄悄话</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="想对TA说的小情话或建议~"
              maxLength={500}
            />
          </div>
          {/* 本次体验评价 - 移至此处作为对方评价的一部分 */}
          <div className="p-4 rounded-3xl border-2 border-pink-300/40 bg-pink-100/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-pink-600">💖 本次体验</span>
            </div>
            <DoiRatingSelector 
              value={doiRating} 
              onChange={setDoiRating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit} className="bg-gradient-to-r from-primary to-accent">提交评价 💕</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoiReviewDialog;