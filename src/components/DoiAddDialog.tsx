import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import type { NewDoiRecord } from '@/hooks/useDoiRecords';
import PositionMultiSelect, { POSITIONS } from './PositionMultiSelect';
export { POSITIONS };

interface Props {
  onAdd: (r: NewDoiRecord) => Promise<boolean>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const SCENES = ['车内', 'zxx家卧室'];
const EJACULATION_METHODS = [
  '戴套内射',
  '不带套内射',
  '女生用手帮忙',
  '其他'
];

const DoiAddDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [duration, setDuration] = useState(30);
  const [positions, setPositions] = useState<string[]>(['传教士']);
  const [passion, setPassion] = useState(8);
  const [notes, setNotes] = useState('');
  const [scene, setScene] = useState<string>('');
  const [femaleOrgasm, setFemaleOrgasm] = useState(false);
  const [oralSex, setOralSex] = useState(false);
  const [oralExplosion, setOralExplosion] = useState(false);
  const [ejaculationMethod, setEjaculationMethod] = useState<string>('');

  const reset = () => {
    setDate(todayStr());
    setTime(nowTime());
    setDuration(30);
    setPositions(['传教士']);
    setPassion(8);
    setNotes('');
    setScene('');
    setFemaleOrgasm(false);
    setOralSex(false);
    setOralExplosion(false);
    setEjaculationMethod('');
  };

  const submit = async () => {
    const ok = await onAdd({
      date,
      time,
      durationMinutes: duration,
      position: positions.join('、') || undefined,
      passionScore: passion,
      notes: notes.trim() || undefined,
      scene: scene || undefined,
      femaleOrgasm,
      oralSex,
      oralExplosion,
      ejaculationMethod: ejaculationMethod || undefined,
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
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
            <Label>场景</Label>
            <Select value={scene} onValueChange={setScene}>
              <SelectTrigger>
                <SelectValue placeholder="请选择场景" />
              </SelectTrigger>
              <SelectContent>
                {SCENES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>体位（可多选组合）</Label>
            <PositionMultiSelect values={positions} onChange={setPositions} />
          </div>
          <div>
            <Label>激情评分：{passion} / 10 {'❤️'.repeat(Math.min(passion, 10))}</Label>
            <Slider value={[passion]} min={1} max={10} step={1} onValueChange={(v) => setPassion(v[0])} className="mt-2" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={femaleOrgasm} onCheckedChange={(checked) => setFemaleOrgasm(!!checked)} id="female-orgasm" />
            <Label htmlFor="female-orgasm">女生达到高潮</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox checked={oralSex} onCheckedChange={(checked) => setOralSex(!!checked)} id="oral-sex" />
            <Label htmlFor="oral-sex">存在口交</Label>
          </div>
          {oralSex && (
            <div className="flex items-center space-x-2 pl-6">
              <Checkbox checked={oralExplosion} onCheckedChange={(checked) => setOralExplosion(!!checked)} id="oral-explosion" />
              <Label htmlFor="oral-explosion">口爆（射到嘴里）</Label>
            </div>
          )}
          <div>
            <Label>射精方式</Label>
            <Select value={ejaculationMethod} onValueChange={setEjaculationMethod}>
              <SelectTrigger>
                <SelectValue placeholder="请选择射精方式" />
              </SelectTrigger>
              <SelectContent>
                {EJACULATION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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