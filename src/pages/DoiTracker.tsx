import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDoiRecords } from '@/hooks/useDoiRecords';
import DoiAddDialog from '@/components/DoiAddDialog';
import DoiStats from '@/components/DoiStats';
import DoiCharts from '@/components/DoiCharts';
import DoiSummaryTable from '@/components/DoiSummaryTable';
import DoiHistory from '@/components/DoiHistory';

const DoiTracker = () => {
  const { records, loading, addRecord, deleteRecord } = useDoiRecords();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          返回首页
        </Link>

        <header className="text-center mb-6 animate-fade-in">
          <div className="text-5xl mb-2 animate-home-bounce inline-block">💖</div>
          <h1 className="text-3xl font-bold gradient-text">doi 记录</h1>
          <p className="text-muted-foreground text-sm mt-1">记录每次甜蜜时刻 ✨</p>
        </header>

        <div className="flex justify-center mb-6">
          <DoiAddDialog onAdd={addRecord} />
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">加载中...</div>
        ) : (
          <div className="space-y-6">
            <DoiStats records={records} />
            <DoiCharts records={records} />
            <DoiSummaryTable records={records} />
            <DoiHistory records={records} onDelete={deleteRecord} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoiTracker;