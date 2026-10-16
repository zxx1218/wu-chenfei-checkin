import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MilkteaBrandSelect } from './MilkteaBrandSelect';
import { ZhebeiRatingSelector, type ZhebeiRating } from './ZhebeiRatingSelector';
import { milkteaApi } from '@/lib/api';
import { toast } from 'sonner';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface EditMilkteaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MilkteaRecord | null;
  onSuccess: () => void;
}

export const EditMilkteaDialog = ({ open, onOpenChange, record, onSuccess }: EditMilkteaDialogProps) => {
  const [brand, setBrand] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [drinker, setDrinker] = useState<'小菲' | 'zxx' | ''>('');
  const [zhebeiRating, setZhebeiRating] = useState<ZhebeiRating | ''>('');
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
      
      toast.success('奶茶记录已更新', { description: '✅ 更新成功' });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('请稍后重试', { description: '❌ 更新失败' });
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
            <ZhebeiRatingSelector value={zhebeiRating} onChange={setZhebeiRating} />
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
