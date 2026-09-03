import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface MilkteaFilterProps {
  onFilterChange: (filters: MilkteaFilters) => void;
}

export interface MilkteaFilters {
  search?: string;
  drinker?: '小菲' | 'zxx' | '';
  brand?: string;
  zhebeiRating?: '夯爆了' | '中不溜' | '拉完了' | '';
  dateFrom?: string;
  dateTo?: string;
}

const BRANDS = ['喜茶', '奈雪的茶', '蜜雪冰城', 'CoCo', '一点点', '茶百道', '古茗', '书亦烧仙草', '其他'];
const RATINGS = [
  { value: '夯爆了', label: '🔥 夯爆了' },
  { value: '中不溜', label: '😐 中不溜' },
  { value: '拉完了', label: '💩 拉完了' },
];

export const MilkteaFilter = ({ onFilterChange }: MilkteaFilterProps) => {
  const [filters, setFilters] = useState<MilkteaFilters>({});

  const updateFilter = (key: keyof MilkteaFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          搜索与筛选
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            清除
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* 搜索框 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">关键词搜索</label>
          <Input
            placeholder="搜索品牌、奶茶名称..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="rounded-xl"
          />
        </div>

        {/* 筛选器 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">谁喝的</label>
            <Select 
              value={filters.drinker || 'all'} 
              onValueChange={(v) => updateFilter('drinker', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="小菲">小菲</SelectItem>
                <SelectItem value="zxx">zxx</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">品牌</label>
            <Select 
              value={filters.brand || 'all'} 
              onValueChange={(v) => updateFilter('brand', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {BRANDS.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">评价</label>
            <Select 
              value={filters.zhebeiRating || 'all'} 
              onValueChange={(v) => updateFilter('zhebeiRating', v === 'all' ? '' : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {RATINGS.map(rating => (
                  <SelectItem key={rating.value} value={rating.value}>
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">开始日期</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">结束日期</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            已应用 {Object.values(filters).filter(v => v && v !== '').length} 个筛选条件
          </p>
        </div>
      )}
    </div>
  );
};
