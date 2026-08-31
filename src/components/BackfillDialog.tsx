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
import { Slider } from '@/components/ui/slider';
import { bumpApi, milkteaApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { SeverityLevel } from '@/types/record';
import { Wrench, User } from 'lucide-react';

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
  const [drinker, setDrinker] = useState<'小菲' | 'zxx' | ''>(''); // 添加饮用者选择
  const [zhebeiRating, setZhebeiRating] = useState<'夯爆了' | '中不溜' | '拉完了' | ''>(''); // 这杯奶茶评价
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false); // 图片上传中状态

  const reset = () => {
    setDate(todayISO());
    setTime(nowTimeHM());
    setBumpType('bump');
    setLocation('');
    setSeverity('一般痛');
    setMtType('milktea');
    setBrand('');
    setDrinkName('');
    setDrinker('');
    setZhebeiRating('');
    setSelectedImage(null);
    setPreviewImage(null);
    setUploadingImage(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: '图片太大', 
        description: '请选择小于 5MB 的图片',
        variant: 'destructive' 
      });
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: '无效的文件类型', 
        description: '请选择图片文件',
        variant: 'destructive' 
      });
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
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
      // 如果有图片，显示上传中状态
      if (selectedImage) {
        setUploadingImage(true);
      }
      
      await milkteaApi.create({
        date: isoToZhDate(date),
        time: hmToZhTime(time),
        type: mtType,
        brand: mtType === 'milktea' ? brand.trim() || null : null,
        drink_name: mtType === 'milktea' ? drinkName.trim() || null : null,
        drinker: drinker || null, // 添加饮用者字段
        zhebei_rating: zhebeiRating || null, // 添加评价字段
        image: selectedImage || null, // 添加图片字段
      });
      
      // 上传完成后隐藏加载状态
      if (selectedImage) {
        setUploadingImage(false);
      }
      
      toast({ title: '补录成功 🧋', description: '已添加到奶茶记录' });
      reset();
      setOpen(false);
    } catch (error: any) {
      // 出错时也要隐藏加载状态
      if (selectedImage) {
        setUploadingImage(false);
      }
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
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="bump">🩹 磕碰</TabsTrigger>
            <TabsTrigger value="milktea">🧋 奶茶</TabsTrigger>
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
            
            {/* 添加饮用者选择 */}
            <div>
              <Label>饮用者</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={drinker === '小菲' ? 'default' : 'outline'}
                  onClick={() => setDrinker('小菲')}
                  className="flex-1 rounded-xl flex items-center justify-center gap-1"
                >
                  <User className="w-3 h-3" />
                  小菲
                </Button>
                <Button
                  type="button"
                  variant={drinker === 'zxx' ? 'default' : 'outline'}
                  onClick={() => setDrinker('zxx')}
                  className="flex-1 rounded-xl flex items-center justify-center gap-1"
                >
                  <User className="w-3 h-3" />
                  zxx
                </Button>
                <Button
                  type="button"
                  variant={!drinker ? 'default' : 'outline'}
                  onClick={() => setDrinker('')}
                  className="flex-1 rounded-xl"
                >
                  不指定
                </Button>
              </div>
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
                <div>
                  <Label>这杯奶茶评价（可选）</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={zhebeiRating === '夯爆了' ? 'default' : 'outline'}
                      onClick={() => setZhebeiRating(zhebeiRating === '夯爆了' ? '' : '夯爆了')}
                      className={`flex-1 rounded-xl transition-all text-sm ${
                        zhebeiRating === '夯爆了' 
                          ? 'bg-green-500 hover:bg-green-600 border-green-500' 
                          : 'border-green-500/30 text-green-600 hover:bg-green-500/10'
                      }`}
                    >
                      🔥 夯爆了
                    </Button>
                    <Button
                      type="button"
                      variant={zhebeiRating === '中不溜' ? 'default' : 'outline'}
                      onClick={() => setZhebeiRating(zhebeiRating === '中不溜' ? '' : '中不溜')}
                      className={`flex-1 rounded-xl transition-all text-sm ${
                        zhebeiRating === '中不溜' 
                          ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-500' 
                          : 'border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10'
                      }`}
                    >
                      😐 中不溜
                    </Button>
                    <Button
                      type="button"
                      variant={zhebeiRating === '拉完了' ? 'default' : 'outline'}
                      onClick={() => setZhebeiRating(zhebeiRating === '拉完了' ? '' : '拉完了')}
                      className={`flex-1 rounded-xl transition-all text-sm ${
                        zhebeiRating === '拉完了' 
                          ? 'bg-red-500 hover:bg-red-600 border-red-500' 
                          : 'border-red-500/30 text-red-600 hover:bg-red-500/10'
                      }`}
                    >
                      💩 拉完了
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>奶茶照片（可选）</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      支持从相册选择或拍照，图片大小不超过 5MB
                    </p>
                    {previewImage && (
                      <div className="relative inline-block">
                        <img
                          src={previewImage}
                          alt="预览"
                          className="w-16 h-16 object-cover rounded-lg border border-border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={clearImage}
                          type="button"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 上传进度提示 */}
            {uploadingImage && mtType === 'milktea' && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-sm font-medium text-primary">正在上传照片，请稍候...</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={uploadingImage}>取消</Button>
              <Button onClick={submitMilktea} disabled={uploadingImage}>
                {uploadingImage ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    正在上传...
                  </>
                ) : (
                  '补录'
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BackfillDialog;