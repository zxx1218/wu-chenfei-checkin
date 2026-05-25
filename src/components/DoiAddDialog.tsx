import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import type { NewDoiRecord } from '@/hooks/useDoiRecords';

export const POSITIONS = [
  '传教士', '女上位', '后入式', '侧卧式', '坐姿', '69式', '站立', '其他',
];

interface Props {
  onAdd: (r: NewDoiRecord) => Promise<boolean>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const DoiAddDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [duration, setDuration] = useState(30);
  const [position, setPosition] = useState<string>('传教士');
  const [passion, setPassion] = useState(8);
  const [notes, setNotes] = useState('');

  const reset = () => {
    setDate(todayStr());
    setTime(nowTime());
    setDuration(30);
    setPosition('传教士');
    setPassion(8);
    setNotes('');
  };

  const submit = async () => {
    const ok = await onAdd({
      date,
      time,
      durationMinutes: duration,
      position,
      passionScore: passion,
      notes: notes.trim() || undefined,
    });
    if (ok) {
      toast({ title: '记录已添加 💕', description: '又是甜蜜的一次~' });
      reset();
      setOpen(false);
    } else {
      toast({ title: '添加失败', description: '请稍后再试', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-md bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
          ➕ 新增打卡
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>新增 doi 记录 💖</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>日期</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>时间</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>时长：{duration} 分钟</Label>
            <Slider value={[duration]} min={1} max={180} step={1} onValueChange={(v) => setDuration(v[0])} className="mt-2" />
          </div>
          <div>
            <Label>体位</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>激情评分：{passion} / 10 {'❤️'.repeat(Math.min(passion, 10))}</Label>
            <Slider value={[passion]} min={1} max={10} step={1} onValueChange={(v) => setPassion(v[0])} className="mt-2" />
          </div>
          <div>
            <Label>备注</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="今晚的小心情~" maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button onClick={submit} className="bg-primary">保存 💕</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoiAddDialog;