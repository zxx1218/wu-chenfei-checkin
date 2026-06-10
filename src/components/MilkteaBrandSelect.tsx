import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const MILKTEA_BRANDS = [
  '喜茶', '奈雪的茶', '瑞幸咖啡', '蜜雪冰城', '茶百道',
  'CoCo都可', '一点点', '古茗', '书亦烧仙草', '沪上阿姨',
  '茶颜悦色', '霸王茶姬', '益禾堂', '甜啦啦', '7分甜',
  '乐乐茶', '鲜茶亭', '悸动烧仙草', '丘大叔柠檬茶',
  '柠季', '茶话弄', '阿嬷手作', '伏小桃', '放哈',
  '快乐柠檬', 'KOI', '万达茶', '吾饮良品', '大卡司',
  '贡茶', '鹿角巷', '答案茶', '都可', '茶太良品',
  '小满茶田', '果呀呀', '椿风', '他山集', '隔壁工坊',
];

interface MilkteaBrandSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function MilkteaBrandSelect({ value, onChange }: MilkteaBrandSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return MILKTEA_BRANDS;
    return MILKTEA_BRANDS.filter(b => b.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-md font-normal"
        >
          {value || '选择或输入品牌...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="搜索品牌..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(e.target.value);
            }}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-48">
          <div className="p-1">
            {filtered.map(brand => (
              <button
                key={brand}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === brand && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(brand);
                  setSearch('');
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === brand ? "opacity-100" : "opacity-0")} />
                {brand}
              </button>
            ))}
            {filtered.length === 0 && search && (
              <button
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
                onClick={() => {
                  onChange(search);
                  setSearch('');
                  setOpen(false);
                }}
              >
                使用 "{search}"
              </button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
