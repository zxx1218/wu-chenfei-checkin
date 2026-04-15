import { useState } from 'react';
import { useMilkteaRecords } from '@/hooks/useMilkteaRecords';
import { CalendarDays, Coffee, SmilePlus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Confetti } from '@/components/Confetti';
import { NavLink } from '@/components/NavLink';
import { MilkteaBrandSelect } from '@/components/MilkteaBrandSelect';
import { MilkteaBrandChart } from '@/components/MilkteaBrandChart';
import { MilkteaHealthChart } from '@/components/MilkteaHealthChart';
import { Link } from 'react-router-dom';

const MilkteaTracker = () => {
  const { records, loading, addMilkteaRecord, addNoMilkteaRecord, deleteRecord, hasNoMilkteaToday, todayMilkteaCount } = useMilkteaRecords();
  const { toast } = useToast();
  const [brand, setBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleAddMilktea = async () => {
    if (hasNoMilkteaToday) {
      toast({ title: '今天已经打卡"今日很乖"啦！', description: '不能再记录喝奶茶了哦~', variant: 'destructive' });
      return;
    }
    const success = await addMilkteaRecord(brand, drinkName);
    if (success) {
      toast({ title: '🧋 奶茶记录成功！', description: `${brand ? brand + ' - ' : ''}${drinkName || '一杯奶茶'}` });
      setBrand('');
      setDrinkName('');
    }
  };

  const handleNoMilktea = async () => {
    if (todayMilkteaCount > 0) {
      toast({ title: '今天已经喝过奶茶了', description: '不能再打卡"今日很乖"啦~', variant: 'destructive' });
      return;
    }
    const result = await addNoMilkteaRecord();
    if (result.alreadyCheckedIn) {
      toast({ title: '已经打过卡啦', description: '今天已经记录"今日很乖"了~' });
      return;
    }
    if (result.success) {
      setShowConfetti(true);
      toast({ title: '🌟 今日很乖！', description: '今天没有喝奶茶，真棒！' });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRecord(id);
    if (success) {
      toast({ title: '记录已删除' });
    }
  };

  // Stats
  const totalMilktea = records.filter(r => r.type === 'milktea').length;
  const totalNoDrink = records.filter(r => r.type === 'no_milktea').length;

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti active={showConfetti} type="safe" />}
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold gradient-text mb-4">
            🧋 小梨的奶茶记录
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
                  disabled={todayMilkteaCount > 0}
                >
                  <SmilePlus className="w-5 h-5 mr-2" />
                  今日很乖
                </Button>
              </div>
              {todayMilkteaCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  今天已记录 {todayMilkteaCount} 杯奶茶 🧋
                </p>
              )}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>统计</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent/50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{totalMilktea}</p>
              <p className="text-sm text-muted-foreground mt-1">总共喝了</p>
            </div>
            <div className="bg-accent/50 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{totalNoDrink}</p>
              <p className="text-sm text-muted-foreground mt-1">乖乖天数</p>
            </div>
          </div>
        </section>

        {/* Brand Bar Chart */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>品牌趋势</span>
          </h2>
          <MilkteaBrandChart records={records} />
        </section>

        {/* Health Analysis */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>💚</span>
            <span>健康分析</span>
          </h2>
          <MilkteaHealthChart records={records} />
        </section>

        {/* History */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>历史记录</span>
          </h2>
          {loading ? (
            <p className="text-center text-muted-foreground py-4">加载中...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">还没有记录哦~</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {records.map(record => (
                <div key={record.id} className="flex items-center justify-between bg-accent/30 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{record.type === 'milktea' ? '🧋' : '🌟'}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {record.type === 'milktea'
                          ? `${record.brand ? record.brand + ' - ' : ''}${record.drinkName || '奶茶'}`
                          : '今日很乖'}
                      </p>
                      <p className="text-xs text-muted-foreground">{record.date} {record.time}</p>
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
    </div>
  );
};

export default MilkteaTracker;
