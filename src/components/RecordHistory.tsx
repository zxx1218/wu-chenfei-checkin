import { BumpRecord, SeverityLevel } from '@/types/record';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Clock, Calendar, Sparkles } from 'lucide-react';

interface RecordHistoryProps {
  records: BumpRecord[];
}

const severityClassMap: Record<SeverityLevel, string> = {
  '超痛': 'severity-super',
  '很痛': 'severity-very',
  '一般痛': 'severity-normal',
  '不怎么痛': 'severity-mild',
};

export function RecordHistory({ records }: RecordHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">还没有记录哦</p>
        <p className="text-sm mt-1">点击上方按钮开始记录今天的情况吧！</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="history-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{record.date}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{record.time}</span>
                </div>

                {record.type === 'bump' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{record.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`severity-badge ${severityClassMap[record.severity!]}`}>
                        {record.severity}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-secondary">今日平安无事 ✨</p>
                )}
              </div>

              <div>
                {record.type === 'bump' ? (
                  <span className="bump-badge">碰了</span>
                ) : (
                  <span className="safe-badge">平安</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
