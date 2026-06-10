import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MilkteaBrandSelect } from '@/components/MilkteaBrandSelect';
import PositionMultiSelect from '@/components/PositionMultiSelect';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox'; // 添加Checkbox导入
import { bumpApi, milkteaApi, doiApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { SeverityLevel } from '@/types/record';
import { Wrench } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTimeHM = () => new Date().toTimeString().slice(0, 5);

/** Convert "YYYY-MM-DD" to "YYYY年M月D日"（与现有 zh-CN 记录保持一致） */
const isoToZhDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/** "HH:MM" -> zh-CN 时间字符串（如 "上午10:30"） */
const hmToZhTime = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

const severityOptions: SeverityLevel[] = ['超痛', '很痛', '一般痛', '不怎么痛'];

const BackfillDialog = () => {
  const [open, setOpen] = useState(false);

  // 通用
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowTimeHM());

  // bump
  const [bumpType, setBumpType] = useState<'bump' | 'safe'>('bump');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('一般痛');

  // milktea
  const [mtType, setMtType] = useState<'milktea' | 'no_milktea'>('milktea');
  const [brand, setBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  // 添加奶茶图片字段
  const [image, setImage] = useState<string | null>(null);

  // doi
  const [duration, setDuration] = useState(30);
  const [positions, setPositions] = useState<string[]>(['传教士']);
  const [passion, setPassion] = useState(8);
  const [notes, setNotes] = useState('');
  // 添加DOI新字段
  const [oralSex, setOralSex] = useState(false);
  const [femaleOrgasm, setFemaleOrgasm] = useState(false);
  const [oralExplosion, setOralExplosion] = useState(false);
  const [ejaculationMethod, setEjaculationMethod] = useState('');
  const [scene, setScene] = useState('');
  const [partnerOverallScore, setPartnerOverallScore] = useState<number | null>(null);
  const [partnerPassionScore, setPartnerPassionScore] = useState<number | null>(null);
  const [partnerDurationFeedback, setPartnerDurationFeedback] = useState('');
  const [partnerPositionFeedback, setPartnerPositionFeedback] = useState('');
  const [partnerComment, setPartnerComment] = useState('');
  const [partnerReviewer, setPartnerReviewer] = useState('');

  const reset = () => {
    setDate(todayISO());
    setTime(nowTimeHM());
    setBumpType('bump');
    setLocation('');
    setSeverity('一般痛');
    setMtType('milktea');
    setBrand('');
    setDrinkName('');
    setImage(null);
    setDuration(30);
    setPositions(['传教士']);
    setPassion(8);
    setNotes('');
    setOralSex(false);
    setFemaleOrgasm(false);
    setOralExplosion(false);
    setEjaculationMethod('');
    setScene('');
    setPartnerOverallScore(null);
    setPartnerPassionScore(null);
    setPartnerDurationFeedback('');
    setPartnerPositionFeedback('');
    setPartnerComment('');
    setPartnerReviewer('');
  };

  const submitBump = async () => {
    if (bumpType === 'bump' && !location.trim()) {
      toast({ title: '请填写碰到的位置', variant: 'destructive' });
      return;
    }
    try {
      await bumpApi.create({
        date: isoToZhDate(date),
        time: hmToZhTime(time),
        type: bumpType,
        location: bumpType === 'bump' ? location.trim() : null,
        severity: bumpType === 'bump' ? severity : null,
      });
      toast({ title: '补录成功 🩹', description: '已添加到磕碰记录' });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast({ title: '补录失败', description: error.message, variant: 'destructive' });
    }
  };

  const submitMilktea = async () => {
    try {
      await milkteaApi.create({
        date: isoToZhDate(date),
        time: hmToZhTime(time),
        type: mtType,
        brand: mtType === 'milktea' ? brand.trim() || null : null,
        drink_name: mtType === 'milktea' ? drinkName.trim() || null : null,
        image: image || null, // 添加图片字段
      });
      toast({ title: '补录成功 🧋', description: '已添加到奶茶记录' });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast({ title: '补录失败', description: error.message, variant: 'destructive' });
    }
  };

  const submitDoi = async () => {
    try {
      await doiApi.create({
        date,
        time,
        duration_minutes: duration,
        position: positions.length ? positions.join('、') : null,
        passion_score: passion,
        notes: notes.trim() || null,
        // 添加新字段
        oral_sex: oralSex,
        female_orgasm: femaleOrgasm,
        oral_explosion: oralExplosion,
        ejaculation_method: ejaculationMethod.trim() || null,
        scene: scene.trim() || null,
        partner_overall_score: partnerOverallScore,
        partner_passion_score: partnerPassionScore,
        partner_duration_feedback: partnerDurationFeedback.trim() || null,
        partner_position_feedback: partnerPositionFeedback.trim() || null,
        partner_comment: partnerComment.trim() || null,
        partner_reviewer: partnerReviewer.trim() || null,
      });
      toast({ title: '补录成功 💖', description: '已添加到 doi 记录' });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast({ title: '补录失败', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-full block bg-card rounded-3xl p-6 shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group text-left animate-fade-in"
          style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:animate-home-wiggle">
              <span className="text-3xl">🛠️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">记录维护</h2>
              <p className="text-sm text-muted-foreground">忘记打卡了？这里可以补录~</p>
            </div>
            <span className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 text-xl">
              →
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" /> 补录记录
          </DialogTitle>
          <DialogDescription>选择记录类型，自由设置日期和时间</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bump" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="bump">🩹 磕碰</TabsTrigger>
            <TabsTrigger value="milktea">🧋 奶茶</TabsTrigger>
            <TabsTrigger value="doi">💖 doi</TabsTrigger>
          </TabsList>

          {/* 共用日期 / 时间 */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <Label>日期</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>时间</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {/* 磕碰 */}
          <TabsContent value="bump" className="space-y-4 mt-4">
            <div>
              <Label>类型</Label>
              <Select value={bumpType} onValueChange={(v) => setBumpType(v as 'bump' | 'safe')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bump">磕碰了 🩹</SelectItem>
                  <SelectItem value="safe">平安无事 ✨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bumpType === 'bump' && (
              <>
                <div>
                  <Label>碰到哪里</Label>
                  <Input
                    placeholder="例如：左手肘"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>严重程度</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as SeverityLevel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {severityOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button onClick={submitBump}>补录</Button>
            </DialogFooter>
          </TabsContent>

          {/* 奶茶 */}
          <TabsContent value="milktea" className="space-y-4 mt-4">
            <div>
              <Label>类型</Label>
              <Select value={mtType} onValueChange={(v) => setMtType(v as 'milktea' | 'no_milktea')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="milktea">喝了奶茶 🧋</SelectItem>
                  <SelectItem value="no_milktea">今天很乖 ✨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mtType === 'milktea' && (
              <>
                <div>
                  <Label>品牌</Label>
                  <MilkteaBrandSelect value={brand} onChange={setBrand} />
                </div>
                <div>
                  <Label>饮品名称</Label>
                  <Input
                    placeholder="例如：满杯红柚"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                {/* 添加图片字段输入框 */}
                <div>
                  <Label>图片链接（可选）</Label>
                  <Input
                    placeholder="请输入图片链接"
                    value={image || ''}
                    onChange={(e) => setImage(e.target.value || null)}
                    maxLength={500}
                  />
                </div>
              </>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button onClick={submitMilktea}>补录</Button>
            </DialogFooter>
          </TabsContent>

          {/* doi */}
          <TabsContent value="doi" className="space-y-4 mt-4">
            <div>
              <Label>时长：{duration} 分钟</Label>
              <Slider
                value={[duration]}
                min={1}
                max={180}
                step={1}
                onValueChange={(v) => setDuration(v[0])}
                className="mt-2"
              />
            </div>
            <div>
              <Label>体位（可多选组合）</Label>
              <PositionMultiSelect values={positions} onChange={setPositions} />
            </div>
            <div>
              <Label>激情评分：{passion} / 10 {'❤️'.repeat(Math.min(passion, 10))}</Label>
              <Slider
                value={[passion]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) => setPassion(v[0])}
                className="mt-2"
              />
            </div>
            <div>
              <Label>备注</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="补一笔小记~"
                maxLength={500}
              />
            </div>
            
            {/* 新增的DOI字段 */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="oral-sex"
                  checked={oralSex}
                  onCheckedChange={setOralSex}
                />
                <Label htmlFor="oral-sex">口交</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="female-orgasm"
                  checked={femaleOrgasm}
                  onCheckedChange={setFemaleOrgasm}
                />
                <Label htmlFor="female-orgasm">女性高潮</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="oral-explosion"
                  checked={oralExplosion}
                  onCheckedChange={setOralExplosion}
                />
                <Label htmlFor="oral-explosion">口爆</Label>
              </div>
            </div>
            
            <div>
              <Label>射精方式</Label>
              <Input
                placeholder="例如：内射、外射、戴套"
                value={ejaculationMethod}
                onChange={(e) => setEjaculationMethod(e.target.value)}
                maxLength={100}
              />
            </div>
            
            <div>
              <Label>场景</Label>
              <Input
                placeholder="例如：家中卧室、酒店、户外"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                maxLength={200}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>伴侣整体评分</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10分"
                  value={partnerOverallScore ?? ''}
                  onChange={(e) => setPartnerOverallScore(e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <Label>伴侣激情评分</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10分"
                  value={partnerPassionScore ?? ''}
                  onChange={(e) => setPartnerPassionScore(e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>
            
            <div>
              <Label>伴侣时长反馈</Label>
              <Input
                placeholder="伴侣对时长的感受"
                value={partnerDurationFeedback}
                onChange={(e) => setPartnerDurationFeedback(e.target.value)}
                maxLength={200}
              />
            </div>
            
            <div>
              <Label>伴侣体位反馈</Label>
              <Input
                placeholder="伴侣对体位的感受"
                value={partnerPositionFeedback}
                onChange={(e) => setPartnerPositionFeedback(e.target.value)}
                maxLength={200}
              />
            </div>
            
            <div>
              <Label>伴侣评论</Label>
              <Textarea
                value={partnerComment}
                onChange={(e) => setPartnerComment(e.target.value)}
                placeholder="伴侣的评价"
                maxLength={500}
              />
            </div>
            
            <div>
              <Label>伴侣评审员</Label>
              <Input
                placeholder="评审员姓名"
                value={partnerReviewer}
                onChange={(e) => setPartnerReviewer(e.target.value)}
                maxLength={100}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button onClick={submitDoi}>补录</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BackfillDialog;