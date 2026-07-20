import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { DoiRecord } from '@/types/record';
import PositionMultiSelect, { POSITIONS } from './PositionMultiSelect'; // 修正导入方式，与DoiAddDialog.tsx保持一致
import VideoUpload from './VideoUpload'; // 使用默认导入，与DoiAddDialog.tsx保持一致
import { SCENES, EJACULATION_METHODS } from '@/lib/utils'; // 导入常量
import { Check, Heart, Loader2 } from 'lucide-react'; // 移动图标导入到顶部

interface Props {
  record: DoiRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number, data: Partial<DoiRecord>, onProgress?: (progress: number) => void) => Promise<boolean>;
}

export default function EditDoiDialog({ record, open, onOpenChange, onSave }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [position, setPosition] = useState<string[]>([]);
  const [passionScore, setPassionScore] = useState(8);
  const [notes, setNotes] = useState('');
  const [scene, setScene] = useState<string>('');
  const [femaleOrgasm, setFemaleOrgasm] = useState(false);
  const [oralSex, setOralSex] = useState(false);
  const [oralExplosion, setOralExplosion] = useState(false);
  const [ejaculationMethod, setEjaculationMethod] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null); // 视频文件状态
  const [videoUrl, setVideoUrl] = useState<string>(''); // 当前视频URL
  const [uploading, setUploading] = useState(false); // 上传状态
  const [uploadProgress, setUploadProgress] = useState(0); // 上传进度

  useEffect(() => {
    if (record) {
      setDate(record.date || '');
      setTime(record.time || '');
      setDuration(record.durationMinutes || 30);
      setPosition(record.position ? record.position.split('、') : []);
      setPassionScore(record.passionScore || 8);
      setNotes(record.notes || '');
      setScene(record.scene || '');
      setFemaleOrgasm(!!record.femaleOrgasm);
      setOralSex(!!record.oralSex);
      setOralExplosion(!!record.oralExplosion);
      setEjaculationMethod(record.ejaculationMethod || '');
      setVideoUrl(record.videoUrl || ''); // 设置当前视频URL
    }
  }, [record]);

  if (!record) return null;

  const submit = async () => {
    const updatedRecord: Partial<DoiRecord> = {
      date,
      time,
      durationMinutes: duration,
      position: position.join('、'),
      passionScore,
      notes: notes.trim() || null,
      scene: scene || null,
      femaleOrgasm,
      oralSex,
      oralExplosion,
      ejaculationMethod: ejaculationMethod || null,
      videoFile, // 添加视频文件
      videoUrl: videoFile ? undefined : (videoUrl || null), // 如果有新视频则不使用旧URL，否则使用旧URL或null
    };

    setUploading(true);
    setUploadProgress(0);

    try {
      const ok = await onSave(record.id, updatedRecord, (progress) => {
        setUploadProgress(progress);
      });
      if (ok) {
        toast({
          title: '🎉 记录已成功更新！',
          description: '你的美好时刻已被更新 💕',
          className: 'bg-green-50 border-green-200 text-green-800'
        });
        onOpenChange(false);
      } else {
        toast({
          title: '❌ 更新失败',
          description: '请稍后再试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ 更新失败',
        description: '更新过程中出现错误',
        variant: 'destructive'
      });
      console.error('更新记录失败:', error);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-[2rem] border-4 border-primary/25 bg-card overflow-hidden shadow-[0_24px_70px_-15px_hsl(var(--primary)/0.35)]">
        {/* 顶部纸胶带装饰 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-9 bg-secondary/40 rotate-1 border-x-2 border-dashed border-secondary/70 z-10 pointer-events-none" />

        {/* 添加隐藏标题以满足无障碍访问要求 */}
        <DialogTitle className="sr-only">编辑 doi 记录</DialogTitle>

        {/* 标题 */}
        <div className="pt-10 pb-4 px-8 text-center">
          <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            ✏️ 编辑 doi 记录
          </h2>
          <p className="text-xs text-muted-foreground mt-1">修改你的重要时刻 🍓</p>
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
            <Slider value={[duration]} min={1} max={180} step={1} onValueChange={(v) => setDuration(v[0])} />
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
            <PositionMultiSelect values={position} onChange={setPosition} />
          </div>

          {/* 激情评分卡片（珊瑚粉） */}
          <div className="p-4 rounded-3xl border-2 border-primary/30 bg-primary/10 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">🔥 激情评分</span>
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold text-primary">{passionScore}/10</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(passionScore, 10) }).map((_, i) => (
                    <span key={i} className="text-primary">❤️</span>
                  ))}
                </div>
              </div>
            </div>
            <Slider value={[passionScore]} min={1} max={10} step={1} onValueChange={(v) => setPassionScore(v[0])} />
          </div>

          {/* 贴纸开关：高潮 & 口交 */}
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
              onVideoSelect={setVideoFile}
              currentVideoUrl={videoUrl}
              onRemoveCurrentVideo={() => setVideoUrl('')}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* 结束方式 - 与新增页面保持一致 */}
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
            onClick={() => onOpenChange(false)}
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
                保存中 {uploadProgress}%
              </>
            ) : (
              '保存更改'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// StickerToggle组件定义
const StickerToggle = ({
  active,
  onClick,
  emoji,
  label,
  tone = 'primary'
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  tone?: 'primary' | 'secondary';
}) => {
  const baseClasses = "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all animate-fade-in";
  const activeClasses = active 
    ? tone === 'primary' 
      ? 'border-solid bg-primary text-primary-foreground border-primary shadow-md' 
      : 'border-solid bg-secondary text-secondary-foreground border-secondary shadow-md'
    : tone === 'primary'
      ? 'border-dashed border-primary/40 bg-card text-muted-foreground hover:bg-primary/5'
      : 'border-dashed border-secondary/40 bg-card text-muted-foreground hover:bg-secondary/5';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      <span className="text-xl mb-1">{emoji}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
};