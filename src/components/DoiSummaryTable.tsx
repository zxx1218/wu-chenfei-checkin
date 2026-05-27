import { useMemo } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import type { DoiRecord } from '@/hooks/useDoiRecords';

interface Props { records: DoiRecord[]; }

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

const DoiSummaryTable = ({ records }: Props) => {
  const byPosition = useMemo(
    () =>
      buildAgg(records, (r) =>
        (r.position || '').split(/[、,，]/).map((s) => s.trim()).filter(Boolean),
      ),
    [records],
  );
  const byMonth = useMemo(() => buildAgg(records, (r) => r.date.slice(0, 7)), [records]);

  if (!records.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">💕 按体位汇总</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>体位</TableHead>
              <TableHead className="text-right">次数</TableHead>
              <TableHead className="text-right">均时长</TableHead>
              <TableHead className="text-right">均评分</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byPosition.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.key}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">{row.avgDuration}</TableCell>
                <TableCell className="text-right">{row.avgPassion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">📅 按月份汇总</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>月份</TableHead>
              <TableHead className="text-right">次数</TableHead>
              <TableHead className="text-right">均时长</TableHead>
              <TableHead className="text-right">均评分</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byMonth.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{row.key}</TableCell>
                <TableCell className="text-right">{row.count}</TableCell>
                <TableCell className="text-right">{row.avgDuration}</TableCell>
                <TableCell className="text-right">{row.avgPassion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DoiSummaryTable;