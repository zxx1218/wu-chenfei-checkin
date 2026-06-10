import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

export const POSITIONS = [
  '传教士', '女上位', '后入式', '侧卧式', '坐姿', '69式', '站立',
  '面对面坐', '反向女上', '勺子式', '蝴蝶式', '桥式', '观音坐莲',
  '骑乘位', '俯卧后入', '抬腿式', '剪刀腿', '深蹲位', '镜前',
  '浴室', '沙发', '床边', '其他',
];

interface Props {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

const PositionMultiSelect = ({ values, onChange, placeholder = '选择体位（可多选）' }: Props) => {
  const [open, setOpen] = useState(false);

  const toggle = (p: string) => {
    if (values.includes(p)) onChange(values.filter((x) => x !== p));
    else onChange([...values, p]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal h-auto min-h-10 py-2"
        >
          <span className="text-left flex-1 truncate">
            {values.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              values.join(' + ')
            )}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2 max-h-72 overflow-y-auto" align="start">
        <div className="grid grid-cols-2 gap-1">
          {POSITIONS.map((p) => (
            <label
              key={p}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm"
            >
              <Checkbox checked={values.includes(p)} onCheckedChange={() => toggle(p)} />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PositionMultiSelect;