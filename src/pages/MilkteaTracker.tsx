import { useState } from 'react';
import { useMilkteaRecords } from '@/hooks/useMilkteaRecords';
import { CalendarDays, Coffee, SmilePlus, Trash2, ArrowLeft, Camera, Image as ImageIcon, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Confetti } from '@/components/Confetti';
import { NavLink } from '@/components/NavLink';
import { MilkteaBrandSelect } from '@/components/MilkteaBrandSelect';
import { MilkteaBrandChart } from '@/components/MilkteaBrandChart';
import { MilkteaHealthChart } from '@/components/MilkteaHealthChart';
import { MilkteaBudget } from '@/components/MilkteaBudget';
import { MilkteaComparison } from '@/components/MilkteaComparison';
import { ImageDialog } from '@/components/ImageDialog';
import { Link } from 'react-router-dom';

const MilkteaTracker = () => {
  const { records, loading, addMilkteaRecord, addNoMilkteaRecord, deleteRecord, hasNoMilkteaToday, todayMilkteaCount, hasPersonNoMilkteaToday, getPersonMilkteaCountToday } = useMilkteaRecords();
  const { toast } = useToast();
  const [brand, setBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinker, setDrinker] = useState<'小菲' | 'zxx' | ''>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overall');

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleAddMilktea = async () => {
    // 如果选择了drinker，只检查该人是否已打卡"今日很乖"
    if (drinker && hasPersonNoMilkteaToday(drinker)) {
      toast({ 
        title: `${drinker}今天已经打卡"今日很乖"啦！`, 
        description: '不能再记录喝奶茶了哦~', 
        variant: 'destructive' 
      });
      return;
    }
    // 如果没有选择drinker，检查整体是否有"今日很乖"记录
    if (!drinker && hasNoMilkteaToday) {
      toast({ 
        title: '今天已经有人打卡"今日很乖"啦！', 
        description: '请先选择"谁喝的"，或确认今天没人打卡"今日很乖"', 
        variant: 'destructive' 
      });
      return;
    }
    const success = await addMilkteaRecord(brand, drinkName, selectedImage || undefined, drinker || undefined);
    if (success) {
      toast({ title: '🧋 奶茶记录成功！', description: `${drinker ? drinker + ' - ' : ''}${brand ? brand + ' - ' : ''}${drinkName || '一杯奶茶'}${selectedImage ? ' 📷' : ''}` });
      setBrand('');
      setDrinkName('');
      setDrinker('');
      setSelectedImage(null);
      setPreviewImage(null);
    }
  };

  const handleNoMilktea = async () => {
    // 如果选择了drinker，检查该人今天是否已喝奶茶
    if (drinker) {
      const personCount = getPersonMilkteaCountToday(drinker);
      if (personCount > 0) {
        toast({ 
          title: `${drinker}今天已经喝过奶茶了`, 
          description: '不能再打卡"今日很乖"啦~', 
          variant: 'destructive' 
        });
        return;
      }
    } else {
      // 如果没有选择drinker，检查整体是否有喝奶茶记录
      if (todayMilkteaCount > 0) {
        toast({ 
          title: '今天已经有人喝过奶茶了', 
          description: '请先选择"谁喝的"，或确认今天没人喝奶茶', 
          variant: 'destructive' 
        });
        return;
      }
    }

    const result = await addNoMilkteaRecord(drinker || undefined);
    if (result.alreadyCheckedIn) {
      toast({ 
        title: '已经打过卡啦', 
        description: drinker ? `${drinker}今天已经记录"今日很乖"了~` : '今天已经有人记录"今日很乖"了~' 
      });
      return;
    }
    if (result.success) {
      setShowConfetti(true);
      toast({ 
        title: '🌟 今日很乖！', 
        description: drinker ? `${drinker}今天没有喝奶茶，真棒！` : '今天没有喝奶茶，真棒！' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRecord(id);
    if (success) {
      toast({ title: '记录已删除' });
    }
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

  const handleViewImage = (imageUrl: string) => {
    setViewingImage(imageUrl);
    setImageDialogOpen(true);
  };

  // Stats
  const totalMilktea = records.filter(r => r.type === 'milktea').length;
  const totalNoDrink = records.filter(r => r.type === 'no_milktea').length;
  
  // Per person stats
  const xiaofeiRecords = records.filter(r => r.drinker === '小菲');
  const zxxRecords = records.filter(r => r.drinker === 'zxx');
  const xiaofeiMilktea = xiaofeiRecords.filter(r => r.type === 'milktea').length;
  const zxxMilktea = zxxRecords.filter(r => r.type === 'milktea').length;

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti active={showConfetti} type="safe" />}
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold gradient-text mb-4">
            🧋 小梨和zxx的奶茶记录
          </h1>
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border/50">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{today}</span>
          </div>
        </header>

        {/* Check-in Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>今日打卡</span>
          </h2>

          {hasNoMilkteaToday ? (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🌟</p>
              <p className="text-lg font-medium text-primary">今天很乖，没喝奶茶！</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">谁喝的</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={drinker === '小菲' ? 'default' : 'outline'}
                    onClick={() => setDrinker('小菲')}
                    className="flex-1 rounded-xl"
                  >
                    小菲
                  </Button>
                  <Button
                    type="button"
                    variant={drinker === 'zxx' ? 'default' : 'outline'}
                    onClick={() => setDrinker('zxx')}
                    className="flex-1 rounded-xl"
                  >
                    zxx
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">奶茶品牌</label>
                <MilkteaBrandSelect value={brand} onChange={setBrand} />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">奶茶名字</label>
                <Input
                  placeholder="例如：珍珠奶茶、杨枝甘露..."
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">奶茶照片（可选）</label>
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      支持拍照或从相册选择，图片大小不超过 5MB
                    </p>
                  </div>
                  {previewImage && (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="预览"
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={clearImage}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddMilktea}
                  className="flex-1 rounded-2xl h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  <Coffee className="w-5 h-5 mr-2" />
                  记录喝奶茶
                </Button>
                <Button
                  onClick={handleNoMilktea}
                  variant="outline"
                  className="flex-1 rounded-2xl h-12 text-base font-semibold border-primary/30 text-primary hover:bg-primary/10"
                  disabled={drinker ? getPersonMilkteaCountToday(drinker) > 0 : todayMilkteaCount > 0}
                >
                  <SmilePlus className="w-5 h-5 mr-2" />
                  今日很乖
                </Button>
              </div>
              {drinker ? (
                <p className="text-xs text-muted-foreground text-center">
                  {drinker}今天已记录 {getPersonMilkteaCountToday(drinker)} 杯奶茶 🧋
                </p>
              ) : todayMilkteaCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  今天已记录 {todayMilkteaCount} 杯奶茶 🧋
                </p>
              )}

            </div>
          )}
        </section>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="overall" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              整体统计
            </TabsTrigger>
            <TabsTrigger value="xiaofei" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              小菲
            </TabsTrigger>
            <TabsTrigger value="zxx" className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              zxx
            </TabsTrigger>
          </TabsList>

          {/* Overall Stats Tab */}
          <TabsContent value="overall" className="space-y-6 mt-6">
            {/* Weekly Budget */}
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span>
                <span>本周预算</span>
              </h2>
              <MilkteaBudget records={records} />
            </section>

            {/* Overall Stats */}
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📊</span>
                <span>整体统计</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-accent/50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{totalMilktea}</p>
                  <p className="text-sm text-muted-foreground mt-1">总共喝了</p>
                </div>
                <div className="bg-accent/50 rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{totalNoDrink}</p>
                  <p className="text-sm text-muted-foreground mt-1">乖乖天数</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pink-500/10 rounded-2xl p-4 text-center border border-pink-500/20">
                  <p className="text-2xl font-bold text-pink-600">{xiaofeiMilktea}</p>
                  <p className="text-xs text-muted-foreground mt-1">小菲喝的</p>
                </div>
                <div className="bg-blue-500/10 rounded-2xl p-4 text-center border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-600">{zxxMilktea}</p>
                  <p className="text-xs text-muted-foreground mt-1">zxx喝的</p>
                </div>
              </div>
            </section>

            {/* Brand Bar Chart */}
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📈</span>
                <span>品牌趋势</span>
              </h2>
              <MilkteaBrandChart records={records} />
            </section>

            {/* Health Analysis */}
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>💚</span>
                <span>健康分析</span>
              </h2>
              <MilkteaHealthChart records={records} />
            </section>

            {/* Comparison */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>⚔️</span>
                <span>两人PK</span>
              </h2>
              <MilkteaComparison records={records} />
            </section>
          </TabsContent>

          {/* Xiaofei Tab */}
          <TabsContent value="xiaofei" className="space-y-6 mt-6">
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-pink-500/30">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-600">
                <span>👤</span>
                <span>小菲的统计</span>
              </h2>
              <div className="bg-pink-500/10 rounded-2xl p-4 text-center mb-4 border border-pink-500/20">
                <p className="text-3xl font-bold text-pink-600">{xiaofeiMilktea}</p>
                <p className="text-sm text-muted-foreground mt-1">总杯数</p>
              </div>
              <MilkteaBrandChart records={xiaofeiRecords} />
            </section>

            <section className="bg-card rounded-3xl p-6 shadow-sm border border-pink-500/30">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-600">
                <span>💚</span>
                <span>健康分析</span>
              </h2>
              <MilkteaHealthChart records={records} drinker="小菲" />
            </section>
          </TabsContent>

          {/* ZXX Tab */}
          <TabsContent value="zxx" className="space-y-6 mt-6">
            <section className="bg-card rounded-3xl p-6 shadow-sm border border-blue-500/30">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                <span>👤</span>
                <span>zxx的统计</span>
              </h2>
              <div className="bg-blue-500/10 rounded-2xl p-4 text-center mb-4 border border-blue-500/20">
                <p className="text-3xl font-bold text-blue-600">{zxxMilktea}</p>
                <p className="text-sm text-muted-foreground mt-1">总杯数</p>
              </div>
              <MilkteaBrandChart records={zxxRecords} />
            </section>

            <section className="bg-card rounded-3xl p-6 shadow-sm border border-blue-500/30">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                <span>💚</span>
                <span>健康分析</span>
              </h2>
              <MilkteaHealthChart records={records} drinker="zxx" />
            </section>
          </TabsContent>
        </Tabs>

        {/* History */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>历史记录</span>
          </h2>
          {loading ? (
            <p className="text-center text-muted-foreground py-4">加载中...</p>
          ) : records.filter(r => r.type === 'milktea').length === 0 ? (
            <p className="text-center text-muted-foreground py-4">还没有奶茶记录哦~</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {records.filter(r => r.type === 'milktea').map(record => (
                <div key={record.id} className="flex items-center justify-between bg-accent/30 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">🧋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {`${record.drinker ? record.drinker + ' - ' : ''}${record.brand ? record.brand + ' - ' : ''}${record.drinkName || '奶茶'}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{record.date} {record.time}</p>
                      {record.image && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 mt-1 text-xs"
                          onClick={() => handleViewImage(record.image!)}
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1" />
                          查看奶茶照片
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Image Dialog */}
      <ImageDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        imageUrl={viewingImage}
        title="奶茶照片"
      />
    </div>
  );
};

export default MilkteaTracker;
