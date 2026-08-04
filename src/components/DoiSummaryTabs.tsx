import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DoiRecord } from '@/types/record';
import { useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface Props {
  records: DoiRecord[];
}

const buildAgg = (
  records: DoiRecord[],
  keyFn: (r: DoiRecord) => string | string[],
) => {
  const map: Record<string, { count: number; totalDuration: number; totalPassion: number }> = {};
  records.forEach((r) => {
    const raw = keyFn(r);
    const keys = Array.isArray(raw) ? raw : [raw];
    keys.filter(Boolean).forEach((k) => {
      if (!map[k]) map[k] = { count: 0, totalDuration: 0, totalPassion: 0 };
      map[k].count += 1;
      map[k].totalDuration += r.durationMinutes || 0;
      map[k].totalPassion += r.passionScore || 0;
    });
  });
  return Object.entries(map)
    .map(([key, v]) => ({
      key,
      count: v.count,
      avgDuration: (v.totalDuration / v.count).toFixed(1),
      avgPassion: (v.totalPassion / v.count).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);
};

const buildDailyAgg = (records: DoiRecord[]) => {
  const dailyMap: Record<string, DoiRecord[]> = {};
  records.forEach((r) => {
    if (!dailyMap[r.date]) dailyMap[r.date] = [];
    dailyMap[r.date].push(r);
  });
  
  return Object.entries(dailyMap)
    .map(([date, dailyRecords]) => {
      const totalDuration = dailyRecords.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
      const avgPassion = dailyRecords.length 
        ? (dailyRecords.reduce((sum, r) => sum + (r.passionScore || 0), 0) / dailyRecords.length).toFixed(1) 
        : '0';
      
      // 统计当日特殊活动
      const femaleOrgasmCount = dailyRecords.filter(r => r.femaleOrgasm).length;
      const oralSexCount = dailyRecords.filter(r => r.oralSex).length;
      const ejaculationMethods = [...new Set(dailyRecords.map(r => r.ejaculationMethod).filter(Boolean))];
      
      return {
        date,
        count: dailyRecords.length,
        totalDuration,
        avgPassion,
        femaleOrgasmCount,
        oralSexCount,
        ejaculationMethods
      };
    })
    .sort((a, b) => b.count - a.count); // 按次数排序，显示哪些天记录最多
};

const ITEMS_PER_PAGE = 5;

const DoiSummaryTabs = ({ records }: Props) => {
  const [activeTab, setActiveTab] = useState<'position' | 'month' | 'day'>('position');
  const [currentPage, setCurrentPage] = useState(0);

  const byPosition = useMemo(
    () =>
      buildAgg(records, (r) =>
        (r.position || '').split(/[、,，]/).map((s) => s.trim()).filter(Boolean),
      ),
    [records],
  );
  const byMonth = useMemo(() => buildAgg(records, (r) => r.date.slice(0, 7)), [records]);
  const byDay = useMemo(() => buildDailyAgg(records), [records]);

  if (!records.length) return null;

  // 根据当前标签和页面计算要显示的数据
  const getCurrentData = () => {
    let data = [];
    switch (activeTab) {
      case 'position':
        data = byPosition;
        break;
      case 'month':
        data = byMonth;
        break;
      case 'day':
        data = byDay;
        break;
      default:
        data = [];
    }
    return data.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  };

  // 获取总页数
  const getTotalPages = () => {
    let totalCount = 0;
    switch (activeTab) {
      case 'position':
        totalCount = byPosition.length;
        break;
      case 'month':
        totalCount = byMonth.length;
        break;
      case 'day':
        totalCount = byDay.length;
        break;
      default:
        totalCount = 0;
    }
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  };

  const totalPages = getTotalPages();
  const currentData = getCurrentData();

  // 重置页面为0，当切换标签时
  const handleTabChange = (value: any) => {
    setActiveTab(value);
    setCurrentPage(0);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>DOI 汇总分析</span>
          </span>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-fit">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="position" className="flex items-center gap-2">
                <span className="text-pink-500">💕</span> 体位
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-2">
                <span className="text-blue-500">📅</span> 月份
              </TabsTrigger>
              <TabsTrigger value="day" className="flex items-center gap-2">
                <span className="text-green-500">📆</span> 日期
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeTab === 'day' ? (
                    <>
                      <TableHead className="w-[200px]">日期</TableHead>
                      <TableHead className="text-right">次数</TableHead>
                      <TableHead className="text-right">总时长</TableHead>
                      <TableHead className="text-right">均评分</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="w-[200px]">
                        {activeTab === 'position' ? '体位' : '月份'}
                      </TableHead>
                      <TableHead className="text-right">次数</TableHead>
                      <TableHead className="text-right">均时长</TableHead>
                      <TableHead className="text-right">均评分</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((row) => {
                  if (activeTab === 'day') {
                    return (
                      <TableRow key={row.date}>
                        <TableCell>
                          <div className="font-medium">{row.date}</div>
                          {row.femaleOrgasmCount > 0 && <div className="text-xs text-green-600">♀️高潮:{row.femaleOrgasmCount}</div>}
                          {row.oralSexCount > 0 && <div className="text-xs text-blue-600">👄口交:{row.oralSexCount}</div>}
                          {row.ejaculationMethods.length > 0 && <div className="text-xs text-orange-600">💧{row.ejaculationMethods.join(',')}</div>}
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{row.totalDuration}分钟</TableCell>
                        <TableCell className="text-right">{row.avgPassion}</TableCell>
                      </TableRow>
                    );
                  } else {
                    return (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.key}</TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">{row.avgDuration}分钟</TableCell>
                        <TableCell className="text-right">{row.avgPassion}</TableCell>
                      </TableRow>
                    );
                  }
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      上一页
                    </Button>
                  </PaginationItem>
                  
                  {/* 显示页码链接 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 2) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      下一页
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoiSummaryTabs;