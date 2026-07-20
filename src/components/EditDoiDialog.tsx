import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DoiRecord } from '@/hooks/useDoiRecords';
import PositionMultiSelect, { POSITIONS } from './PositionMultiSelect';
import VideoUpload from './VideoUpload'; // 导入视频上传组件
import DoiRatingSelector from './DoiRatingSelector'; // 导入评价选择器

const SCENES = ['车内', 'zxx家卧室', '小菲家']; // 添加"小菲家"场景选项
const EJACULATION_METHODS = [
  '戴套内射',
  '不带套内射',
  '用手帮忙',
  '其他'
];

interface Props {
  record: DoiRecord | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, updatedRecord: Partial<DoiRecord>) => Promise<boolean>;
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
      duration_minutes: duration,
      position: position.join('、'),
      passion_score: passionScore,
      notes: notes.trim() || null,
      scene: scene || null,
      female_orgasm: femaleOrgasm,
      oral_sex: oralSex,
      oral_explosion: oralExplosion,
      ejaculation_method: ejaculationMethod || null,
      videoFile, // 添加视频文件
      video_url: videoFile ? undefined : (videoUrl || null), // 如果有新视频则不使用旧URL，否则使用旧URL或null
    };

    setUploading(true);
    setUploadProgress(0);

    try {
      const ok = await onSave(record.id, updatedRecord, (progress) => {
        setUploadProgress(progress);
      });
      if (ok) {
        toast.success('记录已更新');
        onOpenChange(false);
      } else {
        toast.error('更新失败');
      }
    } catch (error) {
      toast.error('更新失败');
      console.error('更新记录失败:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑记录 ✏️</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* 日期 & 时间 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>📅 日期</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>⏰ 时间</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 h-11"
              />
            </div>
          </div>

          {/* 时长卡片 */}
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
            <Label>📍 场景</Label>
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
            <Label>🎀 体位（可多选组合）</Label>
            <PositionMultiSelect values={position} onChange={setPosition} />
          </div>

          {/* 激情评分卡片 */}
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

          {/* 高潮 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="femaleOrgasm"
              checked={femaleOrgasm}
              onChange={(e) => setFemaleOrgasm(e.target.checked)}
              className="w-4 h-4 rounded border-primary/30 focus:ring-primary"
            />
            <Label htmlFor="femaleOrgasm">🌸 女生达到高潮</Label>
          </div>

          {/* 口交 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="oralSex"
              checked={oralSex}
              onChange={(e) => setOralSex(e.target.checked)}
              className="w-4 h-4 rounded border-primary/30 focus:ring-primary"
            />
            <Label htmlFor="oralSex">💋 存在口交</Label>
          </div>

          {/* 口爆（仅在口交选中时显示） */}
          {oralSex && (
            <div className="flex items-center gap-2 ml-6">
              <input
                type="checkbox"
                id="oralExplosion"
                checked={oralExplosion}
                onChange={(e) => setOralExplosion(e.target.checked)}
                className="w-4 h-4 rounded border-primary/30 focus:ring-primary"
              />
              <Label htmlFor="oralExplosion">💦 口爆（射到嘴里）</Label>
            </div>
          )}

          {/* 射精方式 */}
          <div className="space-y-1.5">
            <Label>🎯 射精方式</Label>
            <Select value={ejaculationMethod} onValueChange={setEjaculationMethod}>
              <SelectTrigger className="rounded-2xl border-2 border-secondary/40 bg-secondary/10 h-11 focus:ring-0 focus:border-secondary">
                <SelectValue placeholder="请选择射精方式" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {EJACULATION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 视频上传 */}
          <div className="space-y-1.5">
            <Label>🎥 视频记录</Label>
            <VideoUpload 
              onVideoSelect={setVideoFile}
              currentVideoUrl={videoUrl}
              onRemoveCurrentVideo={() => setVideoUrl('')}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* 备注 */}
          <div className="space-y-1.5">
            <Label>📝 备注</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="今晚的小心情~ 🍰"
              maxLength={500}
              className="rounded-3xl border-2 border-primary/30 bg-primary/5 focus-visible:border-primary focus-visible:ring-0 resize-none min-h-[88px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            取消
          </Button>
          <Button onClick={submit} disabled={uploading}>
            {uploading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full"></span>
                <span>保存中 {uploadProgress}%</span>
              </div>
            ) : (
              '保存更改'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}