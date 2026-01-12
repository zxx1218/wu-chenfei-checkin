import { useEffect, useRef } from 'react';
import { BumpRecord, SeverityLevel } from '@/types/record';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RecordHistoryProps {
  records: BumpRecord[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<boolean>;
}

const severityClassMap: Record<SeverityLevel, string> = {
  '超痛': 'severity-super',
  '很痛': 'severity-very',
  '一般痛': 'severity-normal',
  '不怎么痛': 'severity-mild',
};

export function RecordHistory({ records, loading, onDelete }: RecordHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const isPaused = useRef(false);

  const handleDelete = async (id: string) => {
    if (onDelete) {
      const success = await onDelete(id);
      if (success) {
        toast.success('记录已删除');
      } else {
        toast.error('删除失败，请重试');
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollContainer || records.length === 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused.current && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset to top when reaching bottom
        if (scrollPosition >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollTop = scrollPosition;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleMouseEnter = () => {
      isPaused.current = true;
    };

    const handleMouseLeave = () => {
      isPaused.current = false;
      scrollPosition = scrollContainer.scrollTop;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('touchstart', handleMouseEnter);
    scrollContainer.addEventListener('touchend', handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('touchstart', handleMouseEnter);
      scrollContainer.removeEventListener('touchend', handleMouseLeave);
    };
  }, [records.length]);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

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
    <div ref={scrollRef}>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="history-card group">
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

                <div className="flex items-center gap-2">
                  {record.type === 'bump' ? (
                    <span className="bump-badge">碰了</span>
                  ) : (
                    <span className="safe-badge">平安</span>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem 
                        onClick={() => handleDelete(record.id)}
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除记录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}