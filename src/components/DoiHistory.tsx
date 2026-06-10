import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Play } from 'lucide-react';
import { DoiRecord, PartnerReview } from '@/hooks/useDoiRecords';
import DoiReviewDialog from './DoiReviewDialog';
import EditDoiDialog from './EditDoiDialog'; // 默认导入
import { VideoPlayerDialog } from './VideoPlayerDialog'; // 导入视频播放组件
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  records: DoiRecord[];
  onDelete: (id: string) => void;
  onSaveReview: (id: string, review: PartnerReview) => Promise<boolean>;
  onEdit: (id: string, record: Partial<DoiRecord>) => Promise<boolean>; // 添加编辑回调函数
}

const DoiHistory = ({ records, onDelete, onSaveReview, onEdit }: Props) => {
  const [reviewing, setReviewing] = useState<DoiRecord | null>(null);
  const [editing, setEditing] = useState<DoiRecord | null>(null); // 添加编辑状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const wheelPauseRef = useRef<number>(0);

  // 处理视频播放
  const handlePlayVideo = (r: DoiRecord) => {
    if (r.videoUrl) {
      setCurrentVideoUrl(r.videoUrl);
      setCurrentVideoTitle(`记录视频 - ${r.date} ${r.time}`);
      setVideoDialogOpen(true);
    }
  };

  // 修复自动滚动功能
  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    
    let raf = 0;
    const step = () => {
      const now = performance.now();
      const wheelActive = now < wheelPauseRef.current;
      if (!paused && !wheelActive && inner.scrollHeight > el.clientHeight) {
        const half = inner.scrollHeight / 2;
        el.scrollTop += 0.15;
        if (el.scrollTop >= half) el.scrollTop -= half;
      } else if (inner.scrollHeight > el.clientHeight) {
        // keep loop seamless even during manual scroll
        const half = inner.scrollHeight / 2;
        if (el.scrollTop >= half) el.scrollTop -= half;
        else if (el.scrollTop < 0) el.scrollTop += half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, records.length]);

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  if (!records.length) return null;
  const recent = records.slice(0, 10);
  const loop = recent.length > 3 ? [...recent, ...recent] : recent;

  const renderItem = (r: DoiRecord, key: string) => (
    <li key={key} className="bg-muted/30 rounded-xl px-3 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2">
        <div className="text-sm flex-1 min-w-0 w-full">
          <div className="font-medium">{r.date} · {r.time}</div>
          <div className="text-xs text-muted-foreground">
            {r.position || '—'} · {r.durationMinutes}分钟 · {'❤️'.repeat(Math.min(r.passionScore || 0, 10))}
          </div>
          {r.scene && <div className="text-xs text-muted-foreground">场景: {r.scene}</div>}
          <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
            {r.femaleOrgasm && <span className="text-green-600">♀️高潮</span>}
            {r.oralSex && <span className="text-blue-600">👄口交</span>}
            {r.oralExplosion && <span className="text-purple-600">💥口爆</span>}
            {r.ejaculationMethod && <span className="text-orange-600">{r.ejaculationMethod}</span>}
          </div>
          {r.notes && <div className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</div>}
        </div>
        <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
          {/* 如果记录有视频，则显示播放视频按钮 */}
          {r.videoUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={() => handlePlayVideo(r)}
            >
              <Play className="w-3 h-3 mr-1" /> 播放回忆视频
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => setEditing(r)} // 添加编辑按钮点击事件
          >
            <Edit3 className="w-3 h-3 mr-1" /> 编辑
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setReviewing(r)}>
            💌 {r.partnerReviewedAt ? '查看/修改' : '评价'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(r.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      {r.partnerReviewedAt && (
        <div className="mt-2 ml-1 pl-3 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg py-1.5 pr-2">
          <div className="text-xs font-medium text-primary">
            💌 {r.partnerReviewer || 'TA'} 的评价
            {r.partnerOverallScore != null && <span className="ml-1">· {'⭐'.repeat(Math.min(r.partnerOverallScore, 10))} {r.partnerOverallScore}/10</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
            {r.partnerDurationFeedback && <span>时长：{r.partnerDurationFeedback}</span>}
            {r.partnerPositionFeedback && <span>体位：{r.partnerPositionFeedback}</span>}
            {r.partnerPassionScore != null && <span>激情：{r.partnerPassionScore}/10</span>}
          </div>
          {r.partnerComment && <div className="text-xs mt-1 italic text-foreground/80">"{r.partnerComment}"</div>}
        </div>
      )}
    </li>
  );

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        📖 最近记录 <span className="text-xs text-muted-foreground font-normal">（自动滚动，悬停暂停）</span>
      </h3>
      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onWheel={() => { wheelPauseRef.current = performance.now() + 1500; }}
        className="max-h-80 overflow-y-auto relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)' }}
      >
        <div ref={innerRef}>
          <ul className="space-y-2">
            {loop.map((r, i) => renderItem(r, `${r.id}-${i}`))}
          </ul>
        </div>
      </div>
      <DoiReviewDialog
        record={reviewing}
        open={!!reviewing}
        onOpenChange={(v) => !v && setReviewing(null)}
        onSave={onSaveReview}
      />
      {/* 添加编辑对话框 */}
      <EditDoiDialog
        record={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSave={onEdit}
      />
      
      {/* 视频播放对话框 */}
      <VideoPlayerDialog
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        videoUrl={currentVideoUrl || ''}
        title={currentVideoTitle}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-2 border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              确认删除记录？
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除这条记录，且无法恢复。您确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              确定删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoiHistory;