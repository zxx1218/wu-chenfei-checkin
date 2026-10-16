import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Sparkles, Send, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { NewDoiRecord } from '@/hooks/useDoiRecords';
import PositionMultiSelect from './PositionMultiSelect';
import VideoUpload from './VideoUpload';
import StickerToggle from './StickerToggle';
import { EJACULATION_METHODS, SCENES } from '@/lib/utils';
import { barkApi } from '@/lib/barkApi';

const PUSH_TARGETS: Record<string, string> = {
  'zxx': 'XpwbpgBSezBmKajzcGaDG6',
  '小菲': '7eBD3zF6E66Wqq7cCEjTBA'
};

interface Props {
  onAdd: (r: NewDoiRecord, onProgress?: (progress: number) => void) => Promise<boolean>;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const DoiAddDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nowTime());
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState('30');
  const [positions, setPositions] = useState<string[]>(['传教士']);
  const [passion, setPassion] = useState(8);
  const [notes, setNotes] = useState('');
  const [scene, setScene] = useState('');
  const [femaleOrgasm, setFemaleOrgasm] = useState(false);
  const [oralSex, setOralSex] = useState(false);
  const [oralExplosion, setOralExplosion] = useState(false);
  const [ejaculationMethod, setEjaculationMethod] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pushTargets, setPushTargets] = useState<string[]>([]);

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
    setCustomDuration(value[0].toString());
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 180) {
      setDuration(num);
    }
  };

  const reset = () => {
    setDate(todayStr());
    setTime(nowTime());
    setDuration(30);
    setCustomDuration('30');
    setPositions(['传教士']);
    setPassion(8);
    setNotes('');
    setScene('');
    setFemaleOrgasm(false);
    setOralSex(false);
    setOralExplosion(false);
    setEjaculationMethod('');
    setVideoFile(null);
    setUploading(false);
    setUploadProgress(0);
    setPushTargets([]);
  };

  const sendPush = async (targets: string[]) => {
    if (targets.length === 0) return;
    const deviceKeys = targets.map(t => PUSH_TARGETS[t]).filter(Boolean);
    try {
      const result = await barkApi.push({
        title: '💕 甜蜜小通知来啦 ~',
        body: '主人刚刚偷偷记录了一个甜蜜时刻，快去看看并留下你的小爪印吧！😘',
        level: 'active',
        sound: 'multiwayinvitation',
        icon: 'https://picsum.photos/id/237/400/300',
        group: 'doi记录',
        url: import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://cheerout.cn:40001',
        device_keys: deviceKeys,
      });
      if (result) {
        toast.success(`已向 ${targets.join(', ')} 发送提醒 💕`);
      } else {
        toast.error('推送请求未能成功发送');
      }
    } catch (err) {
      console.error('Bark推送网络错误:', err);
      toast.error('网络问题导致推送无法发送');
    }
  };

  const submit = async () => {
    const recordData: NewDoiRecord = {
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
      videoFile: videoFile || undefined,
    };

    setUploading(true);
    setUploadProgress(0);

    try {
      const ok = await onAdd(recordData, (progress) => {
        setUploadProgress(progress);
      });

      if (ok) {
        toast.success('你的美好时刻已被记录下来 💕');
        await sendPush(pushTargets);
        reset();
        setOpen(false);
      } else {
        toast.error('请稍后再试');
      }
    } catch {
      toast.error('上传过程中出现错误');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-md bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
          ➕ 新增打卡
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-[2.5rem] border-4 border-primary/25 bg-card overflow-hidden shadow-[0_24px_70px_-15px_hsl(var(--primary)/0.35)]">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-secondary/40 rotate-1 border-x-2 border-dashed border-secondary/70 z-10 pointer-events-none" />
        <DialogTitle className="sr-only">新增 doi 记录</DialogTitle>

        <div className="pt-10 pb-4 px-8 text-center">
          <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-primary animate-heartbeat" />
            新增 doi 记录
            <Heart className="w-5 h-5 fill-primary animate-heartbeat" />
          </h2>
          <p className="text-xs text-muted-foreground mt-1">今天也想记录甜甜的一刻 🍓</p>
        </div>

        <div className="px-7 pb-6 max-h-[68vh] overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-2">📅 日期</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground ml-2">⏰ 时间</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 h-11"
              />
            </div>
          </div>

          <div className="p-4 rounded-3xl border-2 border-secondary/40 bg-secondary/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-secondary">🌿 时长</span>
              <span className="text-base font-extrabold text-secondary">
                {duration} <span className="text-xs font-normal">分钟</span>
              </span>
            </div>
            <Slider value={[duration]} min={1} max={180} step={1} onValueChange={handleDurationChange} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">自定义:</span>
              <Input
                type="number"
                min={1}
                max={180}
                value={customDuration}
                onChange={handleCustomDurationChange}
                className="w-20 h-8 rounded-lg border-2 border-secondary/40 bg-secondary/10 text-center"
              />
              <span className="text-xs text-muted-foreground">分钟</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">📍 doi场景</label>
            <Select value={scene} onValueChange={setScene}>
              <SelectTrigger className="rounded-2xl border-2 border-primary/30 bg-primary/5 h-11 focus:ring-0 focus:border-primary">
                <SelectValue placeholder="请选择场景" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {SCENES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🎀 体位（可多选组合）</label>
            <PositionMultiSelect values={positions} onChange={setPositions} />
          </div>

          <div className="p-4 rounded-3xl border-2 border-primary/30 bg-primary/10 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">🔥 激情评分</span>
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold text-primary">{passion}/10</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(passion, 10) }).map((_, i) => (
                    <Heart key={i} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
              </div>
            </div>
            <Slider value={[passion]} min={1} max={10} step={1} onValueChange={(v) => setPassion(v[0])} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StickerToggle
              active={femaleOrgasm}
              onClick={() => setFemaleOrgasm((v) => !v)}
              emoji="🌸"
              label="小菲Climax"
              tone="primary"
            />
            <StickerToggle
              active={oralSex}
              onClick={() => setOralSex((v) => !v)}
              emoji="💋"
              label="Blowjob"
              tone="secondary"
            />
          </div>

          {oralSex && (
            <button
              type="button"
              onClick={() => setOralExplosion((v) => !v)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed transition-all animate-fade-in ${
                oralExplosion
                  ? 'border-solid bg-primary text-primary-foreground border-primary shadow-md'
                  : 'border-primary/40 bg-card text-muted-foreground hover:bg-primary/5'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${oralExplosion ? 'bg-primary-foreground/25' : 'bg-primary/10'}`}>
                {oralExplosion ? <Check className="w-4 h-4" /> : <span className="text-base">💦</span>}
              </div>
              <span className="text-sm font-bold">口爆</span>
            </button>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🎥 视频记录</label>
            <VideoUpload
              onVideoSelect={setVideoFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🎯 结束方式</label>
            <Select value={ejaculationMethod} onValueChange={setEjaculationMethod}>
              <SelectTrigger className="rounded-2xl border-2 border-secondary/40 bg-secondary/10 h-11 focus:ring-0 focus:border-secondary">
                <SelectValue placeholder="请选择结束方式" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {EJACULATION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">📝 备注</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="今晚的小心情~ 🍰"
              maxLength={500}
              className="rounded-3xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 resize-none min-h-[88px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🔔 要推送给谁？</label>
            <div className="flex gap-2">
              {Object.keys(PUSH_TARGETS).map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setPushTargets((prev) =>
                    prev.includes(target)
                      ? prev.filter(t => t !== target)
                      : [...prev, target]
                  )}
                  className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all ${
                    pushTargets.includes(target)
                      ? 'bg-primary text-primary-foreground border-primary shadow-[0_6px_16px_hsl(var(--primary)/0.35)]'
                      : 'border-primary/40 bg-card text-muted-foreground hover:bg-primary/5'
                  }`}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-3 bg-card border-t-2 border-dashed border-primary/15">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 h-12 rounded-2xl border-2 border-muted bg-muted/40 text-muted-foreground font-bold hover:bg-muted active:scale-95 transition"
            disabled={uploading}
          >
            取消
          </Button>
          <Button
            onClick={submit}
            disabled={uploading}
            className="flex-[2] h-12 rounded-2xl bg-primary text-primary-foreground font-extrabold shadow-[0_8px_20px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5 hover:bg-primary/90 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                上传中 {uploadProgress}%
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                保存这一刻
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoiAddDialog;
