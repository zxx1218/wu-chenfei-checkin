import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Sparkles, Send, Check, Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { NewDoiRecord } from '@/hooks/useDoiRecords';
import PositionMultiSelect, { POSITIONS } from './PositionMultiSelect';
import VideoUpload from './VideoUpload';
import { EJACULATION_METHODS, SCENES } from '@/lib/utils'; // 导入共享常量
export { POSITIONS };

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
  const [customDuration, setCustomDuration] = useState<string>('30'); // 添加自定义时长状态
  const [positions, setPositions] = useState<string[]>(['传教士']);
  const [passion, setPassion] = useState(8);
  const [notes, setNotes] = useState('');
  const [scene, setScene] = useState<string>('');
  const [femaleOrgasm, setFemaleOrgasm] = useState(false);
  const [oralSex, setOralSex] = useState(false);
  const [oralExplosion, setOralExplosion] = useState(false);
  const [ejaculationMethod, setEjaculationMethod] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false); // 添加上传状态
  const [uploadProgress, setUploadProgress] = useState(0); // 添加上传进度

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setDuration(newDuration);
    setCustomDuration(newDuration.toString());
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 180) {
      setDuration(numValue);
    }
  };

  const handleVideoUpload = (file: File | null) => {
    setVideoFile(file);
    if (file) {
      // 创建视频预览URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    } else {
      setVideoPreview(null);
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
    setVideoPreview(null);
    setUploading(false);
    setUploadProgress(0);
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
      videoUrl: videoFile ? URL.createObjectURL(videoFile) : undefined // 临时URL，实际URL会在后端生成
    };

    // 将视频文件添加到数据中，以便API处理
    const submissionData = {
      ...recordData,
      videoFile: videoFile || undefined
    };

    setUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);

      const ok = await onAdd(submissionData as NewDoiRecord);
      
      clearInterval(interval);
      setUploadProgress(100);

      if (ok) {
        toast({ 
          title: '🎉 记录已成功保存！', 
          description: '你的美好时刻已被记录下来 💕', 
          className: 'bg-green-50 border-green-200 text-green-800'
        });
        reset();
        setOpen(false);
      } else {
        toast({ 
          title: '❌ 添加失败', 
          description: '请稍后再试', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: '❌ 添加失败', 
        description: '上传过程中出现错误', 
        variant: 'destructive' 
      });
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
        {/* 顶部纸胶带装饰 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-secondary/40 rotate-1 border-x-2 border-dashed border-secondary/70 z-10 pointer-events-none" />

        {/* 添加隐藏标题以满足无障碍访问要求 */}
        <DialogTitle className="sr-only">新增 doi 记录</DialogTitle>

        {/* 标题 */}
        <div className="pt-10 pb-4 px-8 text-center">
          <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 fill-primary animate-heartbeat" />
            新增 doi 记录
            <Heart className="w-5 h-5 fill-primary animate-heartbeat" />
          </h2>
          <p className="text-xs text-muted-foreground mt-1">今天也想记录甜甜的一刻 🍓</p>
        </div>

        {/* 可滚动内容 */}
        <div className="px-7 pb-6 max-h-[68vh] overflow-y-auto space-y-5">
          {/* 日期 & 时间 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* 时长卡片（薄荷绿） */}
          <div className="p-4 rounded-3xl border-2 border-secondary/40 bg-secondary/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-secondary">🌿 时长</span>
              <span className="text-base font-extrabold text-secondary">
                {duration} <span className="text-xs font-normal">分钟</span>
              </span>
            </div>
            <div className="space-y-2">
              <Slider 
                value={[duration]} 
                min={1} 
                max={180} 
                step={1} 
                onValueChange={handleDurationChange} 
              />
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
          </div>

          {/* 场景 */}
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

          {/* 体位 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🎀 体位（可多选组合）</label>
            <PositionMultiSelect values={positions} onChange={setPositions} />
          </div>

          {/* 激情评分卡片（珊瑚粉） */}
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

          {/* 贴纸开关：高潮 & 口交 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* 口爆（条件） */}
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

          {/* 视频上传 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground ml-2">🎥 视频记录</label>
            <VideoUpload 
              onVideoSelect={handleVideoUpload}
              currentVideoUrl={videoPreview || undefined}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* 射精方式 - 与编辑页面保持一致 */}
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

          {/* 备注 */}
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
        </div>

        {/* 底部按钮栏 */}
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
                上传中...
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

/* ——— 子组件：贴纸开关 ——— */
function StickerToggle({
  active,
  onClick,
  emoji,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  tone: 'primary' | 'secondary';
}) {
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
}