import { MilkteaBrandChart } from './MilkteaBrandChart';
import { MilkteaHealthChart } from './MilkteaHealthChart';
import { ZhebeiRatingStats } from './ZhebeiRatingStats';
import type { MilkteaRecord } from '@/hooks/useMilkteaRecords';

interface PersonTabProps {
  drinker: '小菲' | 'zxx';
  records: MilkteaRecord[];
  personRecords: MilkteaRecord[];
  milkteaCount: number;
}

export function PersonTab({ drinker, records, personRecords, milkteaCount }: PersonTabProps) {
  const isXiaofei = drinker === '小菲';

  return (
    <>
      <section className={`bg-card rounded-3xl p-6 shadow-sm border ${isXiaofei ? 'border-pink-500/30' : 'border-blue-500/30'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isXiaofei ? 'text-pink-600' : 'text-blue-600'}`}>
          <span>👤</span>
          <span>{drinker}的统计</span>
        </h2>
        <div className={`${isXiaofei ? 'bg-pink-500/10 border-pink-500/20' : 'bg-blue-500/10 border-blue-500/20'} rounded-2xl p-4 text-center mb-4 border`}>
          <p className={`text-3xl font-bold ${isXiaofei ? 'text-pink-600' : 'text-blue-600'}`}>{milkteaCount}</p>
          <p className="text-sm text-muted-foreground mt-1">总杯数</p>
        </div>
        <MilkteaBrandChart records={personRecords} />
      </section>

      <section className={`bg-card rounded-3xl p-6 shadow-sm border ${isXiaofei ? 'border-pink-500/30' : 'border-blue-500/30'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isXiaofei ? 'text-pink-600' : 'text-blue-600'}`}>
          <span>💚</span>
          <span>健康分析</span>
        </h2>
        <MilkteaHealthChart records={records} drinker={drinker} />
      </section>

      <section className={`bg-card rounded-3xl p-6 shadow-sm border ${isXiaofei ? 'border-pink-500/30' : 'border-blue-500/30'}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isXiaofei ? 'text-pink-600' : 'text-blue-600'}`}>
          <span>⭐</span>
          <span>这杯奶茶评价</span>
        </h2>
        <ZhebeiRatingStats records={records} drinker={drinker} />
      </section>
    </>
  );
}
