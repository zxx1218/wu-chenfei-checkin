import { CheckInButtons } from '@/components/CheckInButtons';
import { RecordHistory } from '@/components/RecordHistory';
import { useRecords } from '@/hooks/useRecords';
import { CalendarDays } from 'lucide-react';

const Index = () => {
  const { records, loading, addBumpRecord, addSafeRecord, deleteRecord } = useRecords();
  
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-4">
            吴晨菲的每一碰
          </h1>
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border/50">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">{today}</span>
          </div>
        </header>

        {/* Check-in Buttons */}
        <section className="mb-12">
          <CheckInButtons onBump={addBumpRecord} onSafe={addSafeRecord} />
        </section>

        {/* History Section */}
        <section className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>📋</span>
            <span>每日记录</span>
          </h2>
          <RecordHistory records={records} loading={loading} onDelete={deleteRecord} />
        </section>
      </div>
    </div>
  );
};

export default Index;
