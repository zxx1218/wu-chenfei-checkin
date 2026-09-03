import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MilkteaBrandSelect } from './MilkteaBrandSelect';
import { milkteaApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface EditMilkteaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MilkteaRecord | null;
  onSuccess: () => void;
}

export const EditMilkteaDialog = ({ open, onOpenChange, record, onSuccess }: EditMilkteaDialogProps) => {
  const { toast } = useToast();
  const [brand, setBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinker, setDrinker] = useState<'小菲' | 'zxx' | ''>('');
  const [zhebeiRating, setZhebeiRating] = useState<'夯爆了' | '中不溜' | '拉完了' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // 当record变化时，初始化表单数据
  useEffect(() => {
    if (record) {
      setBrand(record.brand || '');
      setDrinkName(record.drinkName || '');
      setDrinker(record.drinker || '');
      setZhebeiRating(record.zhebeiRating || '');
    }
  }, [record]);

  const handleSave = async () => {
    if (!record) return;

    setSubmitting(true);
    try {
      await milkteaApi.update(record.id, {
        brand: brand || null,
        drink_name: drinkName || null,
        drinker: drinker || null,
        zhebei_rating: zhebeiRating || null,
      });
      
      toast({ 
        title: '✅ 更新成功', 
        description: '奶茶记录已更新' 
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating record:', error);
      toast({ 
        title: '❌ 更新失败', 
        description: '请稍后重试',
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 重置表单
    setBrand('');
    setDrinkName('');
    setDrinker('');
    setZhebeiRating('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>✏️ 编辑奶茶记录</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">这杯奶茶评价</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={zhebeiRating === '夯爆了' ? 'default' : 'outline'}
                onClick={() => setZhebeiRating(zhebeiRating === '夯爆了' ? '' : '夯爆了')}
                className={`flex-1 rounded-xl transition-all ${
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
                className={`flex-1 rounded-xl transition-all ${
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
                className={`flex-1 rounded-xl transition-all ${
                  zhebeiRating === '拉完了' 
                    ? 'bg-red-500 hover:bg-red-600 border-red-500' 
                    : 'border-red-500/30 text-red-600 hover:bg-red-500/10'
                }`}
              >
                💩 拉完了
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
