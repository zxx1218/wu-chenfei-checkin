import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BumpRecord, SeverityLevel } from '@/types/record';
import { toast } from 'sonner';

interface Props {
  record: BumpRecord | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (id: string, patch: { location?: string | null; severity?: SeverityLevel | null }) => Promise<boolean>;
}

const severityOptions: SeverityLevel[] = ['超痛', '很痛', '一般痛', '不怎么痛'];

export function EditBumpDialog({ record, open, onOpenChange, onSave }: Props) {
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('一般痛');

  useEffect(() => {
    if (record) {
      setLocation(record.location || '');
      setSeverity((record.severity as SeverityLevel) || '一般痛');
    }
  }, [record]);

  if (!record) return null;
  const isBump = record.type === 'bump';

  const submit = async () => {
    const ok = await onSave(record.id, isBump ? { location: location.trim(), severity } : {});
    if (ok) {
      toast.success('已更新');
      onOpenChange(false);
    } else {
      toast.error('更新失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>编辑记录 ✏️</DialogTitle>
        </DialogHeader>
        {isBump ? (
          <div className="space-y-4">
            <div>
              <Label>碰到哪里</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={50} />
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
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">平安记录无可编辑字段，仅保留日期与时间。</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          {isBump && <Button onClick={submit}>保存</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}