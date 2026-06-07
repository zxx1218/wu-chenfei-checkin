import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { DoiRecord } from '@/hooks/useDoiRecords';

interface Props { records: DoiRecord[]; }

const COLORS = ['#f472b6', '#a78bfa', '#f59e0b', '#34d399', '#60a5fa', '#fb7185', '#fbbf24', '#c084fc'];
const WEEKS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const Card = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50">
    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
      <span className="text-lg">{emoji}</span>{title}
    </h3>
    <div className="h-56">{children}</div>
  </div>
);

const DoiCharts = ({ records }: Props) => {
  const monthly = useMemo(() => {
    const m: Record<string, number> = {};
    records.forEach((r) => {
      const key = r.date.slice(0, 7);
      m[key] = (m[key] || 0) + 1;
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));
  }, [records]);

  const weekly = useMemo(() => {
    const arr = WEEKS.map((w) => ({ week: w, count: 0 }));
    records.forEach((r) => {
      const d = new Date(r.date);
      const day = d.getDay();
      if (!isNaN(day)) arr[day].count += 1;
    });
    return arr;
  }, [records]);

  const duration = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-20).map((r) => ({ date: r.date.slice(5), duration: r.durationMinutes }));
  }, [records]);

  const positions = useMemo(() => {
    const m: Record<string, number> = {};
    records.forEach((r) => {
      const parts = (r.position || '未填').split(/[、,，]/).map((s) => s.trim()).filter(Boolean);
      (parts.length ? parts : ['未填']).forEach((p) => {
        m[p] = (m[p] || 0) + 1;
      });
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [records]);

  // 新增：场景统计
  const scenes = useMemo(() => {
    const m: Record<string, number> = {};
    records.forEach((r) => {
      const scene = r.scene || '未填';
      m[scene] = (m[scene] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [records]);

  // 新增：高潮统计
  const orgasmStats = useMemo(() => {
    const org = records.filter(r => r.femaleOrgasm).length;
    const noOrg = records.length - org;
    return [
      { name: '达到高潮', value: org },
      { name: '未达高潮', value: noOrg }
    ];
  }, [records]);

  // 新增：口交统计
  const oralStats = useMemo(() => {
    const oral = records.filter(r => r.oralSex).length;
    const noOral = records.length - oral;
    return [
      { name: '有口交', value: oral },
      { name: '无口交', value: noOral }
    ];
  }, [records]);

  // 新增：射精方式统计
  const ejaculationMethods = useMemo(() => {
    const m: Record<string, number> = {};
    records.forEach((r) => {
      const method = r.ejaculationMethod || '未填';
      m[method] = (m[method] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [records]);

  if (!records.length) {
    return <div className="text-center text-muted-foreground py-12">还没有数据呢，先添加一条记录吧~ 💕</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="月度次数趋势" emoji="📅">
        <ResponsiveContainer>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#f472b6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="星期活跃度" emoji="🔥">
        <ResponsiveContainer>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="week" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="时长变化（近 20 次）" emoji="⏱️">
        <ResponsiveContainer>
          <LineChart data={duration}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="duration" stroke="#fb7185" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="体位偏好" emoji="💕">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={positions} dataKey="value" nameKey="name" outerRadius={70} label>
              {positions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="场景分布" emoji="🏠">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={scenes} dataKey="value" nameKey="name" outerRadius={70} label>
              {scenes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="高潮比例" emoji="✨">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={orgasmStats} dataKey="value" nameKey="name" outerRadius={70} label>
              <Cell key={0} fill="#10b981" />
              <Cell key={1} fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="口交分布" emoji="👄">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={oralStats} dataKey="value" nameKey="name" outerRadius={70} label>
              <Cell key={0} fill="#3b82f6" />
              <Cell key={1} fill="#94a3b8" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="射精方式" emoji="💧">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={ejaculationMethods} dataKey="value" nameKey="name" outerRadius={70} label>
              {ejaculationMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default DoiCharts;