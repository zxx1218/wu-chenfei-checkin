import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, Play, CalendarIcon } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar'; // 导入日历组件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'; // 导入Popover组件
import { format, subDays } from 'date-fns'; // 导入日期格式化函数
import { zhCN } from 'date-fns/locale'; // 导入中文locale
import { DateRange } from 'react-day-picker'; // 导入DateRange类型

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined); // 修改默认值为undefined，表示不过滤

  // 对记录进行排序：先按日期降序，再按时间降序
  const sortedRecords = [...records].sort((a, b) => {
    // 首先比较日期
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime(); // 日期降序
    }
    
    // 如果日期相同，再按时间降序排序
    if (a.time && b.time) {
      return b.time.localeCompare(a.time); // 时间降序
    }
    
    return 0;
  });

  // 根据日期范围过滤记录
  const filteredRecords = sortedRecords.filter(record => {
    if (!dateRange?.from && !dateRange?.to) {
      // 如果没有设置日期范围，则显示所有记录
      return true;
    }
    
    const recordDate = new Date(record.date);
    if (dateRange?.from && dateRange?.to) {
      return recordDate >= dateRange.from && recordDate <= dateRange.to;
    } else if (dateRange?.from) {
      return recordDate >= dateRange.from;
    } else if (dateRange?.to) {
      return recordDate <= dateRange.to;
    }
    return true;
  });

  // 处理视频播放
  const handlePlayVideo = (r: DoiRecord) => {
    if (r.videoUrl) {
      setCurrentVideoUrl(r.videoUrl);
      setCurrentVideoTitle(`记录视频 - ${r.date} ${r.time}`);
      setVideoDialogOpen(true);
    }
  };

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

  const renderItem = (r: DoiRecord, key: string) => (
    <li key={key} className="bg-muted/30 rounded-xl px-3 py-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2">
        <div className="text-sm flex-1 min-w-0 w-full">
          <div className="font-medium">{r.date} · {r.time}</div>
          <div className="text-xs text-muted-foreground">
            {r.position || '—'} · {r.durationMinutes}分钟 · {'❤️'.repeat(Math.min(r.passionScore || 0, 10))}
          </div>
          {r.scene && <div className="text-xs text-muted-foreground">场景: {r.scene}</div>}
          
          {/* 显示DOI评价 */}
          {r.doiRating && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="font-medium">体验:</span>
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${r.doiRating === '超赞' ? 'bg-pink-100 text-pink-800' : 
                  r.doiRating === '还行' ? 'bg-purple-100 text-purple-800' : 
                  r.doiRating === '一般' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'}
              `}>
                {r.doiRating === '超赞' ? '🍑' : 
                 r.doiRating === '还行' ? '🦋' : 
                 r.doiRating === '一般' ? '💧' : '🍋'} {r.doiRating}
              </span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
            {(r.femaleOrgasm === true || r.femaleOrgasm === 1 || r.femaleOrgasm === '1') && <span className="text-green-600">♀️高潮</span>}
            {(r.oralSex === true || r.oralSex === 1 || r.oralSex === '1') && <span className="text-blue-600">👄口交</span>}
            {(r.oralExplosion === true || r.oralExplosion === 1 || r.oralExplosion === '1') && <span className="text-purple-600">💥口爆</span>}
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
      <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          📖 历史记录
        </h3>
        <div className="w-full sm:w-64 mt-2 sm:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'yyyy/MM/dd', { locale: zhCN })} - {format(dateRange.to, 'yyyy/MM/dd', { locale: zhCN })}
                    </>
                  ) : (
                    format(dateRange.from, 'yyyy/MM/dd', { locale: zhCN })
                  )
                ) : (
                  <span>选择日期范围</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1} // 只显示一个月份
                locale={zhCN}
                captionLayout="dropdown" // 使用下拉框显示年份和月份
                fromYear={2020} // 设置年份选择的起始年
                toYear={new Date().getFullYear() + 10} // 设置年份选择的结束年
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {filteredRecords.length > 0 ? (
          <ul className="space-y-2">
            {filteredRecords.map((r) => renderItem(r, r.id))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            没有找到匹配的记录
          </div>
        )}
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